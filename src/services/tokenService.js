// Token Service - Simulates JWT-based authentication
// Generates, validates, refreshes, and manages Bearer tokens

const TOKEN_KEY = 'vb_bank_token';
const REFRESH_TOKEN_KEY = 'vb_bank_refresh_token';

// Secret keys (would be server-side in real app)
const ACCESS_SECRET = 'vb-bank-access-secret-key-2026';
const REFRESH_SECRET = 'vb-bank-refresh-secret-key-2026';

// Token expiry times
const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000;   // 15 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Simple Base64 encode/decode helpers (browser-safe)
 */
const base64Encode = (str) => btoa(unescape(encodeURIComponent(str)));
const base64Decode = (str) => {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return null;
  }
};

/**
 * Generate a simple HMAC-like signature (simulated — not cryptographically secure)
 */
const sign = (payload, secret) => {
  const input = JSON.stringify(payload) + '.' + secret;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

/**
 * Create a JWT-like token with header.payload.signature structure
 * 
 * @param {Object} claims - Token payload
 * @param {string} secret - Signing secret
 * @param {number} expiryMs - Expiry duration in milliseconds
 * @returns {string} Token string
 */
const createToken = (claims, secret, expiryMs) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Date.now();
  const payload = {
    ...claims,
    iat: now,
    exp: now + expiryMs,
    jti: `${now}_${Math.random().toString(36).slice(2, 10)}`,
  };

  const headerB64 = base64Encode(JSON.stringify(header));
  const payloadB64 = base64Encode(JSON.stringify(payload));
  const signature = sign(payload, secret);

  return `${headerB64}.${payloadB64}.${signature}`;
};

/**
 * Decode and validate a JWT-like token
 * 
 * @param {string} token - Token string
 * @param {string} secret - Signing secret
 * @returns {{ valid: boolean, expired: boolean, payload: Object|null }}
 */
const verifyToken = (token, secret) => {
  if (!token || typeof token !== 'string') {
    return { valid: false, expired: false, payload: null };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, expired: false, payload: null };
  }

  const payloadJson = base64Decode(parts[1]);
  if (!payloadJson) {
    return { valid: false, expired: false, payload: null };
  }

  let payload;
  try {
    payload = JSON.parse(payloadJson);
  } catch {
    return { valid: false, expired: false, payload: null };
  }

  // Verify signature
  const expectedSig = sign(payload, secret);
  if (parts[2] !== expectedSig) {
    return { valid: false, expired: false, payload: null };
  }

  // Check expiry
  if (payload.exp && Date.now() > payload.exp) {
    return { valid: false, expired: true, payload };
  }

  return { valid: true, expired: false, payload };
};

// ==================== PUBLIC API ====================

/**
 * Generate access + refresh tokens for a user session
 * 
 * @param {Object} user - User session data (userId, username, role, etc.)
 * @returns {{ accessToken: string, refreshToken: string, expiresIn: number }}
 */
export const generateTokens = (user) => {
  const claims = {
    sub: user.userId,
    username: user.username,
    role: user.role,
    fullName: user.fullName,
    email: user.email,
    accountNumber: user.accountNumber,
  };

  const accessToken = createToken(claims, ACCESS_SECRET, ACCESS_TOKEN_EXPIRY);
  const refreshToken = createToken(
    { sub: user.userId, type: 'refresh' },
    REFRESH_SECRET,
    REFRESH_TOKEN_EXPIRY
  );

  // Store tokens
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRY / 1000, // in seconds
    tokenType: 'Bearer',
  };
};

/**
 * Validate the current access token
 * 
 * @param {string} [token] - Optional token string; defaults to stored token
 * @returns {{ valid: boolean, expired: boolean, payload: Object|null }}
 */
export const validateAccessToken = (token) => {
  const t = token || localStorage.getItem(TOKEN_KEY);
  return verifyToken(t, ACCESS_SECRET);
};

/**
 * Validate a refresh token
 */
export const validateRefreshToken = (token) => {
  const t = token || localStorage.getItem(REFRESH_TOKEN_KEY);
  return verifyToken(t, REFRESH_SECRET);
};

/**
 * Refresh the access token using the refresh token
 * Returns null if refresh token is also expired/invalid
 * 
 * @returns {{ accessToken: string, expiresIn: number }|null}
 */
export const refreshAccessToken = () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const result = verifyToken(refreshToken, REFRESH_SECRET);

  if (!result.valid) {
    clearTokens();
    return null;
  }

  // Get the current session to rebuild claims
  const session = JSON.parse(localStorage.getItem('vb_bank_session') || 'null');
  if (!session) {
    clearTokens();
    return null;
  }

  const claims = {
    sub: session.userId,
    username: session.username,
    role: session.role,
    fullName: session.fullName,
    email: session.email,
    accountNumber: session.accountNumber,
  };

  const accessToken = createToken(claims, ACCESS_SECRET, ACCESS_TOKEN_EXPIRY);
  localStorage.setItem(TOKEN_KEY, accessToken);

  return {
    accessToken,
    expiresIn: ACCESS_TOKEN_EXPIRY / 1000,
    tokenType: 'Bearer',
  };
};

/**
 * Get the current stored access token
 */
export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);

/**
 * Get the current stored refresh token
 */
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

/**
 * Clear all tokens (used on logout)
 */
export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Decode a token without verifying (useful for reading claims)
 * 
 * @param {string} token
 * @returns {Object|null}
 */
export const decodeToken = (token) => {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const payloadJson = base64Decode(parts[1]);
  if (!payloadJson) return null;

  try {
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
};

/**
 * Check if the access token is close to expiry (within 2 minutes)
 * and auto-refresh if needed
 * 
 * @returns {string|null} Valid access token, or null if both expired
 */
export const getValidToken = () => {
  const token = getAccessToken();
  const result = validateAccessToken(token);

  if (result.valid) {
    // Check if close to expiry (within 2 minutes) — proactively refresh
    if (result.payload && result.payload.exp) {
      const timeLeft = result.payload.exp - Date.now();
      if (timeLeft < 2 * 60 * 1000) {
        const refreshed = refreshAccessToken();
        if (refreshed) return refreshed.accessToken;
      }
    }
    return token;
  }

  // Token expired — try refresh
  if (result.expired) {
    const refreshed = refreshAccessToken();
    if (refreshed) return refreshed.accessToken;
  }

  return null;
};

/**
 * Get the Authorization header value
 * @returns {string|null} "Bearer <token>" or null
 */
export const getAuthHeader = () => {
  const token = getValidToken();
  return token ? `Bearer ${token}` : null;
};

/**
 * Get token info for debugging / display
 */
export const getTokenInfo = () => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const accessResult = validateAccessToken(accessToken);
  const refreshResult = validateRefreshToken(refreshToken);

  return {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    accessValid: accessResult.valid,
    accessExpired: accessResult.expired,
    accessPayload: accessResult.payload,
    refreshValid: refreshResult.valid,
    refreshExpired: refreshResult.expired,
    accessExpiresAt: accessResult.payload?.exp
      ? new Date(accessResult.payload.exp).toISOString()
      : null,
    refreshExpiresAt: refreshResult.payload?.exp
      ? new Date(refreshResult.payload.exp).toISOString()
      : null,
  };
};

// Expose on window for dev/testing convenience
if (typeof window !== 'undefined') {
  window.__tokenService = {
    getTokenInfo,
    validateAccessToken,
    validateRefreshToken,
    refreshAccessToken,
    decodeToken,
    getAccessToken,
    clearTokens,
  };
}
