// Auth API Service - Wraps authService with mock API behavior
// All functions return Promises with REST-like responses

import { mockGet, mockPost, mockPut } from './mockApi';
import * as auth from './authService';
import { getAuthHeader, getTokenInfo, getValidToken, clearTokens } from './tokenService';

/**
 * POST /api/auth/login
 */
export const apiLogin = (username, password) =>
  mockPost('/api/auth/login', () => {
    const result = auth.login(username, password);
    if (!result.success) return { success: false, error: result.error, errorCode: 'INVALID_CREDENTIALS' };
    return {
      success: true,
      data: {
        user: result.user,
        ...result.tokens,
      },
    };
  }, { body: { username, password: '********' } });

/**
 * POST /api/auth/register
 */
export const apiRegister = (userData) =>
  mockPost('/api/auth/register', () => {
    const result = auth.register(userData);
    if (!result.success) return { success: false, error: result.error, errorCode: 'REGISTRATION_FAILED' };
    return {
      success: true,
      data: {
        user: result.user,
        ...result.tokens,
      },
    };
  }, { body: { fullName: userData.fullName, username: userData.username, email: userData.email } });

/**
 * POST /api/auth/logout
 */
export const apiLogout = () =>
  mockPost('/api/auth/logout', () => {
    auth.logout();
    return { success: true, data: { message: 'Logged out successfully' } };
  });

/**
 * GET /api/auth/session
 */
export const apiGetSession = () =>
  mockGet('/api/auth/session', () => {
    const session = auth.getCurrentSession();
    if (!session) return { success: false, error: 'No active session', errorCode: 'UNAUTHORIZED' };
    return { success: true, data: session };
  }, { skipDelay: true }); // Session check should be instant

/**
 * POST /api/auth/refresh
 */
export const apiRefreshToken = () =>
  mockPost('/api/auth/refresh', () => {
    const token = getValidToken();
    if (!token) return { success: false, error: 'Refresh token expired', errorCode: 'REFRESH_EXPIRED' };
    return {
      success: true,
      data: {
        accessToken: token,
        tokenType: 'Bearer',
      },
    };
  });

/**
 * PUT /api/auth/profile
 */
export const apiUpdateProfile = (userId, updates) =>
  mockPut('/api/auth/profile', () => {
    const result = auth.updateUserProfile(userId, updates);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: result.user };
  }, { body: { userId, ...updates } });

// Re-export synchronous helpers that don't need API wrapping
export {
  getCurrentSession,
  isAuthenticated,
  isAdmin,
  isUser,
  getUserById,
  getUserByUsername
} from './authService';

// Re-export token utilities
export { getAuthHeader, getTokenInfo, getValidToken, clearTokens };

