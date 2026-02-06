// Mock API Layer - Simulates realistic REST API behavior
// Fires real fetch() calls intercepted by a Service Worker so requests
// appear in DevTools Network tab with proper methods, URLs, headers, and bodies.

import { validateAccessToken, refreshAccessToken, getAccessToken, getAuthHeader } from './tokenService';

const CONFIG = {
  minDelay: 200,
  maxDelay: 800,
  errorRate: 0,
  logging: false,
};

// Endpoints that do NOT require authentication
const PUBLIC_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/session',
];

// ==================== SENSITIVE DATA MASKING ====================

/**
 * Fields whose values should be masked before reaching the Network tab.
 * Keys are case-insensitive field names; values are the masking strategy.
 */
const SENSITIVE_FIELDS = new Set([
  'password', 'currentpassword', 'newpassword',
  'accesstoken', 'refreshtoken', 'token',
  'pin',
  'ssn', 'socialsecuritynumber',
  'passportnumber', 'driverslicense',
  'accountnumber', 'recipientaccount', 'cardnumber',
]);

/** Fields that should be partially masked (show first/last few chars). */
const PARTIAL_MASK_FIELDS = new Set([
  'accesstoken', 'refreshtoken', 'token',
  'accountnumber', 'recipientaccount', 'cardnumber',
]);

/** Fields with short values that get fully redacted. */
const FULL_REDACT_FIELDS = new Set([
  'password', 'currentpassword', 'newpassword',
  'pin', 'ssn', 'socialsecuritynumber',
  'passportnumber', 'driverslicense',
]);

/**
 * Mask a single value based on field name.
 */
const maskValue = (key, value) => {
  if (typeof value !== 'string' && typeof value !== 'number') return value;

  const lower = key.toLowerCase();
  const str = String(value);

  if (FULL_REDACT_FIELDS.has(lower)) {
    return '********';
  }
  if (PARTIAL_MASK_FIELDS.has(lower)) {
    if (str.length <= 4) return '****';
    return '*'.repeat(str.length - 4) + str.slice(-4);
  }
  return value;
};

/**
 * Deep-clone a response object and mask all sensitive fields.
 * The original object is NOT mutated — the app receives full data.
 */
const sanitizeForNetwork = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map((item) => sanitizeForNetwork(item));
  if (typeof obj !== 'object') return obj;

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const lower = key.toLowerCase();
    if (SENSITIVE_FIELDS.has(lower)) {
      sanitized[key] = maskValue(key, value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeForNetwork(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Mask a Bearer token for the Authorization header shown in Network tab.
 * e.g.  "Bearer eyJhb...xyz"  →  "Bearer eyJhb...xyz" (first 10 + last 4)
 */
const maskAuthHeader = (header) => {
  if (!header || typeof header !== 'string') return header;
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return header;
  const token = parts[1];
  if (token.length <= 16) return `Bearer ${'*'.repeat(token.length)}`;
  return `Bearer ${token.slice(0, 10)}...${'*'.repeat(4)}`;
};

// ==================== SERVICE WORKER BRIDGE ====================

let swReady = false;

// Pending responses waiting for the SW to ask for them
const pendingResponses = new Map();
// Resolvers for when the SW asks before the response is ready
const responseResolvers = new Map();

/**
 * Called when the SW asks for a response via MessageChannel.
 * If the response is already computed, send it immediately.
 * Otherwise, store a resolver that fires when ready.
 */
const handleSwMessage = (event) => {
  if (event.data?.type !== 'MOCK_RESOLVE') return;

  const { requestId } = event.data;
  const port = event.ports[0];
  if (!port) return;

  const stored = pendingResponses.get(requestId);
  if (stored) {
    pendingResponses.delete(requestId);
    port.postMessage({ body: stored, status: stored.status || 200 });
  } else {
    responseResolvers.set(requestId, (response) => {
      port.postMessage({ body: response, status: response.status || 200 });
    });
  }
};

/**
 * Deliver a computed response to the Service Worker.
 * The response is sanitized so sensitive data does NOT appear in the Network tab.
 */
const deliverToSw = (requestId, response) => {
  const sanitized = sanitizeForNetwork(response);
  const resolver = responseResolvers.get(requestId);
  if (resolver) {
    responseResolvers.delete(requestId);
    resolver(sanitized);
  } else {
    pendingResponses.set(requestId, sanitized);
  }
};

/**
 * Fire a real fetch() so the request appears in DevTools Network tab.
 * The Service Worker intercepts it and returns our pre-computed response.
 */
const networkFetch = (method, endpoint, requestId, body) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-Mock-Request-Id': requestId,
  };

  const authHeader = getAuthHeader();
  if (authHeader) {
    headers['Authorization'] = maskAuthHeader(authHeader);
  }

  const init = { method, headers };
  if (method !== 'GET' && method !== 'HEAD' && body !== undefined) {
    init.body = JSON.stringify(sanitizeForNetwork(body));
  }

  return fetch(endpoint, init).catch(() => {});
};

/**
 * Register the Service Worker and wire up the message listener.
 * Called once from main.jsx on app boot.
 */
export const initMockServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('[MockAPI] Service Workers not supported — Network tab unavailable.');
    return;
  }

  try {
    const reg = await navigator.serviceWorker.register('/mockServiceWorker.js');

    // Wait for the SW to activate
    const sw = reg.active || reg.installing || reg.waiting;
    if (sw && sw.state !== 'activated') {
      await new Promise((resolve) => {
        sw.addEventListener('statechange', function onChange() {
          if (sw.state === 'activated') {
            sw.removeEventListener('statechange', onChange);
            resolve();
          }
        });
      });
    }

    // If no controller yet, wait for it (first install)
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true });
        setTimeout(resolve, 3000);
      });
    }

    // Listen for response requests from the SW
    navigator.serviceWorker.addEventListener('message', handleSwMessage);

    swReady = true;
    console.log('[MockAPI] Service Worker active — API calls now visible in Network tab');
  } catch (err) {
    console.warn('[MockAPI] SW registration failed:', err.message);
  }
};

// ==================== CORE HELPERS ====================

const simulateDelay = () => {
  const ms = Math.floor(Math.random() * (CONFIG.maxDelay - CONFIG.minDelay) + CONFIG.minDelay);
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const generateRequestId = () =>
  `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const shouldSimulateError = () => Math.random() < CONFIG.errorRate;

const authenticateRequest = (endpoint, requestId) => {
  if (PUBLIC_ENDPOINTS.some((p) => endpoint.startsWith(p))) return null;

  const token = getAccessToken();
  if (!token) {
    return {
      success: false,
      status: 401,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required. Please log in.' },
      meta: { requestId, timestamp: new Date().toISOString() },
    };
  }

  const result = validateAccessToken(token);
  if (result.valid) return null;

  if (result.expired) {
    const refreshed = refreshAccessToken();
    if (refreshed) {
      if (CONFIG.logging) console.log(`[API] Token auto-refreshed for ${endpoint}`);
      return null;
    }
  }

  return {
    success: false,
    status: 401,
    error: { code: 'TOKEN_EXPIRED', message: 'Session expired. Please log in again.' },
    meta: { requestId, timestamp: new Date().toISOString() },
  };
};

// ==================== MAIN REQUEST HANDLER ====================

/**
 * @param {string} method   HTTP method
 * @param {string} endpoint Mock endpoint path
 * @param {Function} handler Synchronous handler returning result
 * @param {Object} [options]
 * @param {boolean} [options.skipDelay] Skip simulated latency
 * @param {Object}  [options.body] Request body (shown in Network tab)
 */
export const mockRequest = async (method, endpoint, handler, options = {}) => {
  const requestId = generateRequestId();
  const startTime = performance.now();

  if (CONFIG.logging) {
    console.log(`[API] ${method} ${endpoint}`, { requestId });
  }

  // 1. Fire the real fetch FIRST so the Network tab starts timing now.
  //    The SW will block until we deliver a response via deliverToSw().
  let fetchPromise = null;
  if (swReady) {
    fetchPromise = networkFetch(method, endpoint, requestId, options.body);
  }

  // 2. Simulate network latency
  if (!options.skipDelay) {
    await simulateDelay();
  }

  // 3. Authenticate
  const authError = authenticateRequest(endpoint, requestId);
  if (authError) {
    if (CONFIG.logging) console.warn(`[API] ${method} ${endpoint} → 401`, authError);
    if (swReady) deliverToSw(requestId, authError);
    if (fetchPromise) await fetchPromise;
    return authError;
  }

  // 4. Simulated server error
  if (shouldSimulateError()) {
    const errRes = {
      success: false,
      status: 500,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred. Please try again.' },
      meta: { requestId, timestamp: new Date().toISOString(), duration: Math.round(performance.now() - startTime) },
    };
    if (CONFIG.logging) console.error(`[API] ${method} ${endpoint} → 500`, errRes);
    if (swReady) deliverToSw(requestId, errRes);
    if (fetchPromise) await fetchPromise;
    return errRes;
  }

  // 5. Execute the handler
  try {
    const result = handler();
    const duration = Math.round(performance.now() - startTime);
    const isSuccess = result?.success !== false;
    const status = isSuccess ? (method === 'POST' ? 201 : 200) : 400;

    const response = {
      success: isSuccess,
      status,
      data: isSuccess ? (result?.data ?? result) : undefined,
      error: !isSuccess
        ? { code: result?.errorCode || 'BAD_REQUEST', message: result?.error || 'Request failed' }
        : undefined,
      meta: { requestId, timestamp: new Date().toISOString(), duration, endpoint, method },
    };

    if (CONFIG.logging) {
      console.log(`[API] ${method} ${endpoint} → ${status} (${duration}ms)`, response);
    }

    if (swReady) deliverToSw(requestId, response);
    if (fetchPromise) await fetchPromise;
    return response;
  } catch (err) {
    const duration = Math.round(performance.now() - startTime);
    const errRes = {
      success: false,
      status: 500,
      error: { code: 'SERVER_ERROR', message: err.message || 'Internal server error' },
      meta: { requestId, timestamp: new Date().toISOString(), duration },
    };
    if (CONFIG.logging) console.error(`[API] ${method} ${endpoint} → 500 (${duration}ms)`, errRes);
    if (swReady) deliverToSw(requestId, errRes);
    if (fetchPromise) await fetchPromise;
    return errRes;
  }
};

// ==================== CONVENIENCE METHODS ====================

export const mockGet = (endpoint, handler, options) =>
  mockRequest('GET', endpoint, handler, options);

export const mockPost = (endpoint, handler, options) =>
  mockRequest('POST', endpoint, handler, options);

export const mockPut = (endpoint, handler, options) =>
  mockRequest('PUT', endpoint, handler, options);

export const mockDelete = (endpoint, handler, options) =>
  mockRequest('DELETE', endpoint, handler, options);

// ==================== RUNTIME CONFIG ====================

export const configureMockApi = (overrides) => {
  Object.assign(CONFIG, overrides);
};

if (typeof window !== 'undefined') {
  window.__mockApi = {
    configure: configureMockApi,
    getConfig: () => ({ ...CONFIG }),
  };
}
