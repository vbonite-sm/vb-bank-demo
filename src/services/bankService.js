// Banking Service - Handles all banking operations

import {
  getUsers,
  updateUsers,
  getTransactions,
  updateTransactions,
  getVirtualCards,
  updateVirtualCards,
  getLoanApplications,
  updateLoanApplications,
  getBillPayments,
  updateBillPayments,
  generateId,
  LOAN_OPTIONS,
  UTILITY_PROVIDERS
} from '../utils/seeder';

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

// ==================== BILL PAYMENT ====================

/**
 * Pay a utility bill
 * @param {string} userId - User ID
 * @param {string} provider - Provider ID
 * @param {number} amount - Bill amount
 * @param {string} description - Payment description
 * @param {string} paymentMethod - 'account' or 'card'
 */
export const payBill = (userId, provider, amount, description, paymentMethod = 'account') => {
  const users = getUsers();
  const transactions = getTransactions();
  const billPayments = getBillPayments();

  // Validate amount
  if (amount <= 0) {
    return {
      success: false,
      error: 'Bill amount must be greater than zero'
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

  // If payment method is 'account', check balance and deduct
  if (paymentMethod === 'account') {
    if (users[userIndex].balance < amount) {
      return {
        success: false,
        error: 'Insufficient balance'
      };
    }

    users[userIndex].balance -= amount;
    updateUsers(users);
  }

  // Get provider details
  const providerDetails = UTILITY_PROVIDERS.find(p => p.id === provider);
  const providerName = providerDetails ? providerDetails.name : 'Unknown Provider';

  // Create bill payment record
  const billPayment = {
    id: generateId('bill'),
    userId: userId,
    provider: provider,
    providerName: providerName,
    amount: amount,
    description: description,
    paymentMethod: paymentMethod,
    status: 'completed',
    timestamp: new Date().toISOString()
  };

  billPayments.push(billPayment);
  updateBillPayments(billPayments);

  // Create transaction record
  const transaction = {
    id: generateId('txn'),
    userId: userId,
    type: 'bill_payment',
    amount: amount,
    currency: users[userIndex].currency,
    description: description,
    status: 'completed',
    timestamp: new Date().toISOString()
  };

  transactions.push(transaction);
  updateTransactions(transactions);

  return {
    success: true,
    message: 'Bill payment successful',
    billPayment: billPayment,
    transaction: transaction,
    newBalance: users[userIndex].balance
  };
};

/**
 * Get user's bill payment history
 */
export const getBillPaymentHistory = (userId) => {
  const billPayments = getBillPayments();
  return billPayments
    .filter(b => b.userId === userId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

// ==================== VIRTUAL CARDS ====================

/**
 * Get user's virtual cards
 */
export const getVirtualCardsForUser = (userId) => {
  const cards = getVirtualCards();
  return cards
    .filter(c => c.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Freeze a virtual card
 */
export const freezeCard = (userId, cardId) => {
  const cards = getVirtualCards();
  const cardIndex = cards.findIndex(c => c.id === cardId && c.userId === userId);

  if (cardIndex === -1) {
    return { success: false, error: 'Card not found' };
  }

  if (cards[cardIndex].status === 'blocked') {
    return { success: false, error: 'Cannot freeze a blocked card' };
  }

  cards[cardIndex].status = 'frozen';
  updateVirtualCards(cards);

  return {
    success: true,
    message: 'Card frozen successfully',
    card: cards[cardIndex]
  };
};

/**
 * Unfreeze a virtual card
 */
export const unfreezeCard = (userId, cardId) => {
  const cards = getVirtualCards();
  const cardIndex = cards.findIndex(c => c.id === cardId && c.userId === userId);

  if (cardIndex === -1) {
    return { success: false, error: 'Card not found' };
  }

  if (cards[cardIndex].status !== 'frozen') {
    return { success: false, error: 'Card is not frozen' };
  }

  cards[cardIndex].status = 'active';
  updateVirtualCards(cards);

  return {
    success: true,
    message: 'Card unfrozen successfully',
    card: cards[cardIndex]
  };
};

/**
 * Block a virtual card (permanent)
 */
export const blockCard = (userId, cardId) => {
  const cards = getVirtualCards();
  const cardIndex = cards.findIndex(c => c.id === cardId && c.userId === userId);

  if (cardIndex === -1) {
    return { success: false, error: 'Card not found' };
  }

  if (cards[cardIndex].status === 'blocked') {
    return { success: false, error: 'Card is already blocked' };
  }

  cards[cardIndex].status = 'blocked';
  updateVirtualCards(cards);

  return {
    success: true,
    message: 'Card blocked successfully',
    card: cards[cardIndex]
  };
};

/**
 * Get card PIN (requires confirmation in UI)
 */
export const getCardPIN = (userId, cardId) => {
  const cards = getVirtualCards();
  const card = cards.find(c => c.id === cardId && c.userId === userId);

  if (!card) {
    return { success: false, error: 'Card not found' };
  }

  return {
    success: true,
    pin: card.pin
  };
};

// ==================== LOAN MANAGEMENT ====================

/**
 * Apply for a loan
 */
export const applyForLoan = (userId, loanType, amount, term) => {
  const users = getUsers();
  const loanApplications = getLoanApplications();

  const user = users.find(u => u.id === userId);
  if (!user) {
    return { success: false, error: 'User not found' };
  }

  const loanOption = LOAN_OPTIONS.find(l => l.id === loanType);
  if (!loanOption) {
    return { success: false, error: 'Invalid loan type' };
  }

  // Validate amount
  if (amount < loanOption.minAmount || amount > loanOption.maxAmount) {
    return {
      success: false,
      error: `Loan amount must be between $${loanOption.minAmount.toLocaleString()} and $${loanOption.maxAmount.toLocaleString()}`
    };
  }

  // Validate term
  if (term < loanOption.minTerm || term > loanOption.maxTerm) {
    return {
      success: false,
      error: `Loan term must be between ${loanOption.minTerm} and ${loanOption.maxTerm} months`
    };
  }

  // Calculate monthly payment
  const monthlyRate = loanOption.interestRate / 100 / 12;
  const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) /
    (Math.pow(1 + monthlyRate, term) - 1);

  // Create loan application
  const application = {
    id: generateId('loan_app'),
    userId: userId,
    loanType: loanType,
    loanTypeName: loanOption.name,
    amount: amount,
    term: term,
    interestRate: loanOption.interestRate,
    monthlyPayment: monthlyPayment,
    status: 'pending',
    applicationDate: new Date().toISOString()
  };

  loanApplications.push(application);
  updateLoanApplications(loanApplications);

  return {
    success: true,
    message: 'Loan application submitted successfully',
    application: application
  };
};

/**
 * Get user's loan applications
 */
export const getLoanApplicationsForUser = (userId) => {
  const loanApplications = getLoanApplications();
  return loanApplications
    .filter(l => l.userId === userId)
    .sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate));
};

// ==================== USER PROFILE ====================

/**
 * Update user profile information
 */
export const updateUserProfile = (userId, updates) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { success: false, error: 'User not found' };
  }

  // Allowed fields to update
  const allowedFields = [
    'fullName', 'email', 'phone',
    'passportNumber', 'driversLicense',
    'address', 'dateOfBirth'
  ];

  // Update only allowed fields
  Object.keys(updates).forEach(key => {
    if (allowedFields.includes(key)) {
      users[userIndex][key] = updates[key];
    }
  });

  updateUsers(users);

  return {
    success: true,
    message: 'Profile updated successfully',
    user: users[userIndex]
  };
};

/**
 * Change user password
 */
export const changePassword = (userId, currentPassword, newPassword) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { success: false, error: 'User not found' };
  }

  if (users[userIndex].password !== currentPassword) {
    return { success: false, error: 'Current password is incorrect' };
  }

  if (newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters' };
  }

  users[userIndex].password = newPassword;
  updateUsers(users);

  return {
    success: true,
    message: 'Password changed successfully'
  };
};
