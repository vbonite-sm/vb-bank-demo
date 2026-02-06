// Admin API Service - Wraps adminService with mock API behavior
// All functions return Promises with REST-like responses

import { mockGet } from './mockApi';
import * as admin from './adminService';

/**
 * GET /api/admin/users
 */
export const apiGetAllUsers = () =>
  mockGet('/api/admin/users', () => {
    const users = admin.getAllUsers();
    return { success: true, data: users };
  });

/**
 * GET /api/admin/users/:userId
 */
export const apiGetUserDetails = (userId) =>
  mockGet(`/api/admin/users/${userId}`, () => {
    const details = admin.getUserDetails(userId);
    if (!details) return { success: false, error: 'User not found', errorCode: 'NOT_FOUND' };
    return { success: true, data: details };
  });

/**
 * GET /api/admin/transactions
 */
export const apiGetAllTransactions = (limit = null) =>
  mockGet(`/api/admin/transactions${limit ? `?limit=${limit}` : ''}`, () => {
    const transactions = admin.getAllTransactions(limit);
    return { success: true, data: transactions };
  });

/**
 * GET /api/admin/stats
 */
export const apiGetSystemStats = () =>
  mockGet('/api/admin/stats', () => {
    const stats = admin.getSystemStats();
    return { success: true, data: stats };
  });

/**
 * GET /api/admin/trends
 */
export const apiGetTransactionTrends = (days = 30) =>
  mockGet(`/api/admin/trends?days=${days}`, () => {
    const trends = admin.getTransactionTrends(days);
    return { success: true, data: trends };
  });

/**
 * GET /api/admin/users/search?q=...
 */
export const apiSearchUsers = (query) =>
  mockGet(`/api/admin/users/search?q=${encodeURIComponent(query)}`, () => {
    const users = admin.searchUsersAdmin(query);
    return { success: true, data: users };
  });

/**
 * GET /api/admin/users/:userId/activity
 */
export const apiGetUserActivity = (userId) =>
  mockGet(`/api/admin/users/${userId}/activity`, () => {
    const activity = admin.getUserActivitySummary(userId);
    return { success: true, data: activity };
  });
