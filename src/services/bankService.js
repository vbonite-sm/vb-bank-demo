// Banking Service - Handles all banking operations

import { getUsers, updateUsers, getTransactions, updateTransactions, generateId } from '../utils/seeder';

// Get user balance
export const getBalance = (userId) => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  return user ? user.balance : 0;
};

// Get user account details
export const getAccountDetails = (userId) => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);

  if (!user) {
    return null;
  }

  return {
    accountNumber: user.accountNumber,
    fullName: user.fullName,
    balance: user.balance,
    currency: user.currency,
    email: user.email,
    createdAt: user.createdAt
  };
};

// Get user transactions
export const getUserTransactions = (userId, limit = null) => {
  const transactions = getTransactions();
  let userTransactions = transactions.filter(t =>
    t.userId === userId || t.recipient === userId || t.sender === userId
  );

  // Sort by timestamp (newest first)
  userTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (limit) {
    userTransactions = userTransactions.slice(0, limit);
  }

  return userTransactions;
};

// Transfer money
export const transferMoney = (fromUserId, recipientAccount, amount, description = '') => {
  const users = getUsers();
  const transactions = getTransactions();

  // Validate amount
  if (amount <= 0) {
    return {
      success: false,
      error: 'Transfer amount must be greater than zero'
    };
  }

  // Find sender
  const senderIndex = users.findIndex(u => u.id === fromUserId);
  if (senderIndex === -1) {
    return {
      success: false,
      error: 'Sender account not found'
    };
  }

  const sender = users[senderIndex];

  // Check if sender has sufficient balance
  if (sender.balance < amount) {
    return {
      success: false,
      error: 'Insufficient balance'
    };
  }

  // Find recipient by account number
  const recipientIndex = users.findIndex(u => u.accountNumber === recipientAccount);
  if (recipientIndex === -1) {
    return {
      success: false,
      error: 'Recipient account not found'
    };
  }

  const recipient = users[recipientIndex];

  // Can't transfer to yourself
  if (sender.id === recipient.id) {
    return {
      success: false,
      error: 'Cannot transfer to your own account'
    };
  }

  // Perform transfer
  users[senderIndex].balance -= amount;
  users[recipientIndex].balance += amount;

  // Create transaction record for sender
  const senderTransaction = {
    id: generateId('txn'),
    userId: sender.id,
    type: 'transfer_out',
    amount: amount,
    currency: sender.currency,
    description: description || `Transfer to ${recipient.fullName}`,
    recipient: recipient.id,
    recipientName: recipient.fullName,
    recipientAccount: recipient.accountNumber,
    status: 'completed',
    timestamp: new Date().toISOString()
  };

  // Create transaction record for recipient
  const recipientTransaction = {
    id: generateId('txn'),
    userId: recipient.id,
    type: 'transfer_in',
    amount: amount,
    currency: recipient.currency,
    description: description || `Transfer from ${sender.fullName}`,
    sender: sender.id,
    senderName: sender.fullName,
    senderAccount: sender.accountNumber,
    status: 'completed',
    timestamp: new Date().toISOString()
  };

  transactions.push(senderTransaction, recipientTransaction);

  // Update storage
  updateUsers(users);
  updateTransactions(transactions);

  return {
    success: true,
    message: 'Transfer successful',
    transaction: senderTransaction,
    newBalance: users[senderIndex].balance
  };
};

// Deposit money
export const depositMoney = (userId, amount, description = 'Deposit') => {
  const users = getUsers();
  const transactions = getTransactions();

  // Validate amount
  if (amount <= 0) {
    return {
      success: false,
      error: 'Deposit amount must be greater than zero'
    };
  }

  // Find user
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return {
      success: false,
      error: 'User not found'
    };
  }

  // Add to balance
  users[userIndex].balance += amount;

  // Create transaction record
  const transaction = {
    id: generateId('txn'),
    userId: userId,
    type: 'deposit',
    amount: amount,
    currency: users[userIndex].currency,
    description: description,
    recipient: null,
    status: 'completed',
    timestamp: new Date().toISOString()
  };

  transactions.push(transaction);

  // Update storage
  updateUsers(users);
  updateTransactions(transactions);

  return {
    success: true,
    message: 'Deposit successful',
    transaction: transaction,
    newBalance: users[userIndex].balance
  };
};

// Withdraw money
export const withdrawMoney = (userId, amount, description = 'Withdrawal') => {
  const users = getUsers();
  const transactions = getTransactions();

  // Validate amount
  if (amount <= 0) {
    return {
      success: false,
      error: 'Withdrawal amount must be greater than zero'
    };
  }

  // Find user
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return {
      success: false,
      error: 'User not found'
    };
  }

  // Check balance
  if (users[userIndex].balance < amount) {
    return {
      success: false,
      error: 'Insufficient balance'
    };
  }

  // Subtract from balance
  users[userIndex].balance -= amount;

  // Create transaction record
  const transaction = {
    id: generateId('txn'),
    userId: userId,
    type: 'withdrawal',
    amount: amount,
    currency: users[userIndex].currency,
    description: description,
    recipient: null,
    status: 'completed',
    timestamp: new Date().toISOString()
  };

  transactions.push(transaction);

  // Update storage
  updateUsers(users);
  updateTransactions(transactions);

  return {
    success: true,
    message: 'Withdrawal successful',
    transaction: transaction,
    newBalance: users[userIndex].balance
  };
};

// Get transaction statistics
export const getTransactionStats = (userId) => {
  const transactions = getUserTransactions(userId);

  const stats = {
    totalTransactions: transactions.length,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalTransfersOut: 0,
    totalTransfersIn: 0,
    depositCount: 0,
    withdrawalCount: 0,
    transferOutCount: 0,
    transferInCount: 0
  };

  transactions.forEach(txn => {
    switch (txn.type) {
      case 'deposit':
        stats.totalDeposits += txn.amount;
        stats.depositCount++;
        break;
      case 'withdrawal':
        stats.totalWithdrawals += txn.amount;
        stats.withdrawalCount++;
        break;
      case 'transfer_out':
      case 'transfer':
        if (txn.userId === userId) {
          stats.totalTransfersOut += txn.amount;
          stats.transferOutCount++;
        }
        break;
      case 'transfer_in':
        stats.totalTransfersIn += txn.amount;
        stats.transferInCount++;
        break;
    }
  });

  return stats;
};

// Search for user by account number or name
export const searchUsers = (query) => {
  const users = getUsers();
  const searchTerm = query.toLowerCase();

  return users.filter(u =>
    u.role === 'user' && (
      u.accountNumber.includes(searchTerm) ||
      u.fullName.toLowerCase().includes(searchTerm) ||
      u.username.toLowerCase().includes(searchTerm)
    )
  ).map(u => ({
    id: u.id,
    fullName: u.fullName,
    accountNumber: u.accountNumber,
    username: u.username
  }));
};
