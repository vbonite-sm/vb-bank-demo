// Bank API Service - Wraps bankService with mock API behavior
// All functions return Promises with REST-like responses

import { mockGet, mockPost, mockPut, mockDelete } from './mockApi';
import * as bank from './bankService';
import { getUsers } from '../utils/seeder';

// ==================== ACCOUNT ====================

/**
 * GET /api/account/balance
 */
export const apiGetBalance = (userId) =>
  mockGet('/api/account/balance', () => {
    const balance = bank.getBalance(userId);
    return { success: true, data: { balance } };
  });

/**
 * GET /api/account/details
 */
export const apiGetAccountDetails = (userId) =>
  mockGet('/api/account/details', () => {
    const details = bank.getAccountDetails(userId);
    if (!details) return { success: false, error: 'Account not found', errorCode: 'NOT_FOUND' };
    return { success: true, data: details };
  });

/**
 * GET /api/account/profile - Returns full user profile including all fields
 */
export const apiGetUserProfile = (userId) =>
  mockGet('/api/account/profile', () => {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found', errorCode: 'NOT_FOUND' };
    const { password, ...profile } = user;
    return { success: true, data: profile };
  });


// ==================== TRANSACTIONS ====================

/**
 * GET /api/transactions?limit=N
 */
export const apiGetTransactions = (userId, limit = null) =>
  mockGet(`/api/transactions${limit ? `?limit=${limit}` : ''}`, () => {
    const transactions = bank.getUserTransactions(userId, limit);
    return { success: true, data: transactions };
  });

/**
 * GET /api/transactions/stats
 */
export const apiGetTransactionStats = (userId) =>
  mockGet('/api/transactions/stats', () => {
    const stats = bank.getTransactionStats(userId);
    return { success: true, data: stats };
  });

// ==================== TRANSFERS ====================

/**
 * POST /api/transfers
 */
export const apiTransferMoney = (fromUserId, recipientAccount, amount, description) =>
  mockPost('/api/transfers', () => {
    const result = bank.transferMoney(fromUserId, recipientAccount, amount, description);
    if (!result.success) return { success: false, error: result.error, errorCode: 'TRANSFER_FAILED' };
    return { success: true, data: { transaction: result.transaction, newBalance: result.newBalance } };
  }, { body: { fromUserId, recipientAccount, amount, description } });

/**
 * POST /api/account/deposit
 */
export const apiDepositMoney = (userId, amount, description) =>
  mockPost('/api/account/deposit', () => {
    const result = bank.depositMoney(userId, amount, description);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: { transaction: result.transaction, newBalance: result.newBalance } };
  }, { body: { userId, amount, description } });

/**
 * POST /api/account/withdraw
 */
export const apiWithdrawMoney = (userId, amount, description) =>
  mockPost('/api/account/withdraw', () => {
    const result = bank.withdrawMoney(userId, amount, description);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: { transaction: result.transaction, newBalance: result.newBalance } };
  }, { body: { userId, amount, description } });

/**
 * GET /api/users/search?q=...
 */
export const apiSearchUsers = (query) =>
  mockGet(`/api/users/search?q=${encodeURIComponent(query)}`, () => {
    const users = bank.searchUsers(query);
    return { success: true, data: users };
  });

// ==================== BILL PAYMENTS ====================

/**
 * POST /api/bills/pay
 */
export const apiPayBill = (userId, provider, amount, description, paymentMethod) =>
  mockPost('/api/bills/pay', () => {
    const result = bank.payBill(userId, provider, amount, description, paymentMethod);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: { billPayment: result.billPayment, newBalance: result.newBalance } };
  }, { body: { userId, provider, amount, description, paymentMethod } });

/**
 * GET /api/bills/history
 */
export const apiGetBillHistory = (userId) =>
  mockGet('/api/bills/history', () => {
    const history = bank.getBillPaymentHistory(userId);
    return { success: true, data: history };
  });

// ==================== VIRTUAL CARDS ====================

/**
 * GET /api/cards
 */
export const apiGetCards = (userId) =>
  mockGet('/api/cards', () => {
    const cards = bank.getVirtualCardsForUser(userId);
    return { success: true, data: cards };
  });

/**
 * PUT /api/cards/:cardId/freeze
 */
export const apiFreezeCard = (userId, cardId) =>
  mockPut(`/api/cards/${cardId}/freeze`, () => {
    const result = bank.freezeCard(userId, cardId);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: result.card };
  }, { body: { userId, cardId } });

/**
 * PUT /api/cards/:cardId/unfreeze
 */
export const apiUnfreezeCard = (userId, cardId) =>
  mockPut(`/api/cards/${cardId}/unfreeze`, () => {
    const result = bank.unfreezeCard(userId, cardId);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: result.card };
  }, { body: { userId, cardId } });

/**
 * DELETE /api/cards/:cardId
 */
export const apiBlockCard = (userId, cardId) =>
  mockDelete(`/api/cards/${cardId}`, () => {
    const result = bank.blockCard(userId, cardId);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: result.card };
  }, { body: { userId, cardId } });

/**
 * GET /api/cards/:cardId/pin
 */
export const apiGetCardPIN = (userId, cardId) =>
  mockGet(`/api/cards/${cardId}/pin`, () => {
    const result = bank.getCardPIN(userId, cardId);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: { pin: result.pin } };
  });

// ==================== LOANS ====================

/**
 * POST /api/loans/apply
 */
export const apiApplyForLoan = (userId, loanType, amount, term) =>
  mockPost('/api/loans/apply', () => {
    const result = bank.applyForLoan(userId, loanType, amount, term);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: result.application };
  }, { body: { userId, loanType, amount, term } });

/**
 * GET /api/loans
 */
export const apiGetLoanApplications = (userId) =>
  mockGet('/api/loans', () => {
    const applications = bank.getLoanApplicationsForUser(userId);
    return { success: true, data: applications };
  });

// ==================== PROFILE ====================

/**
 * PUT /api/profile
 */
export const apiUpdateProfile = (userId, updates) =>
  mockPut('/api/profile', () => {
    const result = bank.updateUserProfile(userId, updates);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: result.user };
  }, { body: { userId, ...updates } });

/**
 * PUT /api/profile/password
 */
export const apiChangePassword = (userId, currentPassword, newPassword) =>
  mockPut('/api/profile/password', () => {
    const result = bank.changePassword(userId, currentPassword, newPassword);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: { message: result.message } };
  }, { body: { userId, currentPassword: '***', newPassword: '***' } });
