// Mock Service Worker — intercepts /api/* fetch requests
// so they appear in the browser DevTools Network tab.
// The actual response data is computed in the main thread
// and relayed back via MessageChannel.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only intercept our mock API calls (tagged with the custom header)
  if (!url.pathname.startsWith('/api/')) return;

  const mockRequestId = event.request.headers.get('X-Mock-Request-Id');
  if (!mockRequestId) return;

  event.respondWith(handleMockRequest(event, mockRequestId));
});

async function handleMockRequest(event, requestId) {
  try {
    const client = await self.clients.get(event.clientId);
    if (!client) {
      return jsonResponse(502, { success: false, error: 'No client context' });
    }

    // Ask the main thread for the pre-computed response.
    // Use a MessageChannel so the client can reply directly.
    return new Promise((resolve) => {
      const { port1, port2 } = new MessageChannel();

      port1.onmessage = (msg) => {
        const { body, status } = msg.data;
        resolve(jsonResponse(status || 200, body, requestId));
      };

      // Timeout — if the main thread doesn't reply within 30s, return 504
      setTimeout(() => {
        resolve(jsonResponse(504, {
          success: false,
          error: { code: 'GATEWAY_TIMEOUT', message: 'Mock handler did not respond in time' },
        }, requestId));
      }, 30000);

      client.postMessage(
        { type: 'MOCK_RESOLVE', requestId },
        [port2]
      );
    });
  } catch (err) {
    return jsonResponse(500, {
      success: false,
      error: { code: 'SW_ERROR', message: err.message },
    });
  }
}

function jsonResponse(status, body, requestId) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };
  if (requestId) headers['X-Request-Id'] = requestId;

  return new Response(JSON.stringify(body), { status, headers });
}
