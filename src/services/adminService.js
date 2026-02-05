// Admin Service - Handles admin-specific operations

import { getUsers, getTransactions } from '../utils/seeder';

// Get all users (excluding admins)
export const getAllUsers = () => {
  const users = getUsers();
  return users
    .filter(u => u.role === 'user')
    .map(u => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      email: u.email,
      accountNumber: u.accountNumber,
      balance: u.balance,
      currency: u.currency,
      createdAt: u.createdAt
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Get user details by ID
export const getUserDetails = (userId) => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);

  if (!user) {
    return null;
  }

  // Get user's transactions
  const transactions = getTransactions();
  const userTransactions = transactions.filter(t =>
    t.userId === userId || t.recipient === userId || t.sender === userId
  );

  return {
    ...user,
    password: undefined, // Don't expose password
    transactionCount: userTransactions.length,
    transactions: userTransactions.sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    ).slice(0, 10) // Last 10 transactions
  };
};

// Get all transactions
export const getAllTransactions = (limit = null) => {
  const transactions = getTransactions();
  let allTransactions = [...transactions];

  // Sort by timestamp (newest first)
  allTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (limit) {
    allTransactions = allTransactions.slice(0, limit);
  }

  return allTransactions;
};

// Get system statistics
export const getSystemStats = () => {
  const users = getUsers();
  const transactions = getTransactions();

  // Filter only regular users (not admins)
  const regularUsers = users.filter(u => u.role === 'user');

  // Calculate total balance across all users
  const totalBalance = regularUsers.reduce((sum, user) => sum + user.balance, 0);

  // Count active users (users with balance > 0)
  const activeUsers = regularUsers.filter(u => u.balance > 0).length;

  // Get transaction statistics
  const totalDeposits = transactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalTransfers = transactions
    .filter(t => t.type === 'transfer' || t.type === 'transfer_out')
    .reduce((sum, t) => sum + t.amount, 0);

  // Get transaction count by type
  const depositCount = transactions.filter(t => t.type === 'deposit').length;
  const withdrawalCount = transactions.filter(t => t.type === 'withdrawal').length;
  const transferCount = transactions.filter(t => t.type === 'transfer' || t.type === 'transfer_out').length;

  // Get recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentTransactions = transactions.filter(t =>
    new Date(t.timestamp) >= sevenDaysAgo
  );

  // Calculate average balance
  const averageBalance = regularUsers.length > 0
    ? totalBalance / regularUsers.length
    : 0;

  // Find user with highest balance
  const richestUser = regularUsers.reduce((max, user) =>
    user.balance > (max?.balance || 0) ? user : max,
    null
  );

  return {
    totalUsers: regularUsers.length,
    activeUsers: activeUsers,
    totalBalance: totalBalance,
    averageBalance: averageBalance,
    totalTransactions: transactions.length,
    recentTransactions: recentTransactions.length,
    totalDeposits: totalDeposits,
    totalWithdrawals: totalWithdrawals,
    totalTransfers: totalTransfers,
    depositCount: depositCount,
    withdrawalCount: withdrawalCount,
    transferCount: transferCount,
    richestUser: richestUser ? {
      fullName: richestUser.fullName,
      accountNumber: richestUser.accountNumber,
      balance: richestUser.balance
    } : null
  };
};

// Get transaction trends (for charts)
export const getTransactionTrends = (days = 30) => {
  const transactions = getTransactions();
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Group transactions by date
  const trends = {};

  transactions.forEach(txn => {
    const txnDate = new Date(txn.timestamp);
    if (txnDate >= startDate && txnDate <= now) {
      const dateKey = txnDate.toISOString().split('T')[0];

      if (!trends[dateKey]) {
        trends[dateKey] = {
          date: dateKey,
          deposits: 0,
          withdrawals: 0,
          transfers: 0,
          count: 0
        };
      }

      trends[dateKey].count++;

      switch (txn.type) {
        case 'deposit':
          trends[dateKey].deposits += txn.amount;
          break;
        case 'withdrawal':
          trends[dateKey].withdrawals += txn.amount;
          break;
        case 'transfer':
        case 'transfer_out':
          trends[dateKey].transfers += txn.amount;
          break;
      }
    }
  });

  // Convert to array and sort by date
  return Object.values(trends).sort((a, b) =>
    new Date(a.date) - new Date(b.date)
  );
};

// Search users (admin view)
export const searchUsersAdmin = (query) => {
  const users = getUsers();
  const searchTerm = query.toLowerCase();

  return users.filter(u =>
    u.role === 'user' && (
      u.accountNumber.includes(searchTerm) ||
      u.fullName.toLowerCase().includes(searchTerm) ||
      u.username.toLowerCase().includes(searchTerm) ||
      u.email.toLowerCase().includes(searchTerm)
    )
  );
};

// Get user activity summary
export const getUserActivitySummary = (userId) => {
  const transactions = getTransactions();
  const userTransactions = transactions.filter(t =>
    t.userId === userId || t.recipient === userId || t.sender === userId
  );

  // Get last transaction
  const lastTransaction = userTransactions.length > 0
    ? userTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
    : null;

  // Count transactions by type
  const activityByType = {
    deposits: userTransactions.filter(t => t.type === 'deposit').length,
    withdrawals: userTransactions.filter(t => t.type === 'withdrawal').length,
    transfers: userTransactions.filter(t =>
      t.type === 'transfer' || t.type === 'transfer_out' || t.type === 'transfer_in'
    ).length
  };

  return {
    totalTransactions: userTransactions.length,
    lastActivity: lastTransaction ? lastTransaction.timestamp : null,
    activityByType: activityByType
  };
};
