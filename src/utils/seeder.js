// Data Seeder - Initializes localStorage with dummy data for testing

export const seedData = () => {
  // Check if data already exists
  if (localStorage.getItem('vb_bank_seeded')) {
    return;
  }

  // Seed Users
  const users = [
    {
      id: 'user_001',
      username: 'john.doe',
      password: 'user123', // In real app, this would be hashed
      email: 'john.doe@example.com',
      fullName: 'John Doe',
      role: 'user',
      accountNumber: '1234567890',
      balance: 15000.00,
      currency: 'USD',
      createdAt: new Date('2024-01-15').toISOString()
    },
    {
      id: 'user_002',
      username: 'jane.smith',
      password: 'user123',
      email: 'jane.smith@example.com',
      fullName: 'Jane Smith',
      role: 'user',
      accountNumber: '2345678901',
      balance: 25000.50,
      currency: 'USD',
      createdAt: new Date('2024-02-10').toISOString()
    },
    {
      id: 'user_003',
      username: 'mike.wilson',
      password: 'user123',
      email: 'mike.wilson@example.com',
      fullName: 'Mike Wilson',
      role: 'user',
      accountNumber: '3456789012',
      balance: 8500.75,
      currency: 'USD',
      createdAt: new Date('2024-03-05').toISOString()
    },
    {
      id: 'admin_001',
      username: 'admin',
      password: 'admin123',
      email: 'admin@vbbank.com',
      fullName: 'Admin User',
      role: 'admin',
      accountNumber: 'ADMIN_ACC',
      balance: 0,
      currency: 'USD',
      createdAt: new Date('2024-01-01').toISOString()
    }
  ];

  // Seed Transactions
  const transactions = [
    {
      id: 'txn_001',
      userId: 'user_001',
      type: 'deposit',
      amount: 5000.00,
      currency: 'USD',
      description: 'Initial Deposit',
      recipient: null,
      status: 'completed',
      timestamp: new Date('2024-01-15T10:30:00').toISOString()
    },
    {
      id: 'txn_002',
      userId: 'user_001',
      type: 'transfer',
      amount: 500.00,
      currency: 'USD',
      description: 'Transfer to Jane Smith',
      recipient: 'user_002',
      recipientName: 'Jane Smith',
      recipientAccount: '2345678901',
      status: 'completed',
      timestamp: new Date('2024-01-20T14:15:00').toISOString()
    },
    {
      id: 'txn_003',
      userId: 'user_002',
      type: 'deposit',
      amount: 10000.00,
      currency: 'USD',
      description: 'Salary Deposit',
      recipient: null,
      status: 'completed',
      timestamp: new Date('2024-02-10T09:00:00').toISOString()
    },
    {
      id: 'txn_004',
      userId: 'user_002',
      type: 'transfer',
      amount: 500.00,
      currency: 'USD',
      description: 'Transfer from John Doe',
      recipient: 'user_002',
      sender: 'user_001',
      senderName: 'John Doe',
      status: 'completed',
      timestamp: new Date('2024-01-20T14:15:00').toISOString()
    },
    {
      id: 'txn_005',
      userId: 'user_001',
      type: 'withdrawal',
      amount: 200.00,
      currency: 'USD',
      description: 'ATM Withdrawal',
      recipient: null,
      status: 'completed',
      timestamp: new Date('2024-02-05T16:45:00').toISOString()
    },
    {
      id: 'txn_006',
      userId: 'user_003',
      type: 'deposit',
      amount: 8500.75,
      currency: 'USD',
      description: 'Initial Deposit',
      recipient: null,
      status: 'completed',
      timestamp: new Date('2024-03-05T11:20:00').toISOString()
    },
    {
      id: 'txn_007',
      userId: 'user_002',
      type: 'transfer',
      amount: 1200.00,
      currency: 'USD',
      description: 'Transfer to Mike Wilson',
      recipient: 'user_003',
      recipientName: 'Mike Wilson',
      recipientAccount: '3456789012',
      status: 'completed',
      timestamp: new Date('2024-03-10T13:30:00').toISOString()
    },
    {
      id: 'txn_008',
      userId: 'user_001',
      type: 'deposit',
      amount: 10700.00,
      currency: 'USD',
      description: 'Business Income',
      recipient: null,
      status: 'completed',
      timestamp: new Date('2024-03-15T10:00:00').toISOString()
    }
  ];

  // Store in localStorage
  localStorage.setItem('vb_bank_users', JSON.stringify(users));
  localStorage.setItem('vb_bank_transactions', JSON.stringify(transactions));
  localStorage.setItem('vb_bank_seeded', 'true');

  console.log('✅ VB Bank data seeded successfully');
  console.log('👤 Test Users:');
  console.log('   - Username: john.doe | Password: user123 (User)');
  console.log('   - Username: jane.smith | Password: user123 (User)');
  console.log('   - Username: mike.wilson | Password: user123 (User)');
  console.log('   - Username: admin | Password: admin123 (Admin)');
};

// Helper function to get all users
export const getUsers = () => {
  const users = localStorage.getItem('vb_bank_users');
  return users ? JSON.parse(users) : [];
};

// Helper function to get all transactions
export const getTransactions = () => {
  const transactions = localStorage.getItem('vb_bank_transactions');
  return transactions ? JSON.parse(transactions) : [];
};

// Helper function to update users
export const updateUsers = (users) => {
  localStorage.setItem('vb_bank_users', JSON.stringify(users));
};

// Helper function to update transactions
export const updateTransactions = (transactions) => {
  localStorage.setItem('vb_bank_transactions', JSON.stringify(transactions));
};

// Helper function to generate unique ID
export const generateId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Reset data (useful for testing)
export const resetData = () => {
  localStorage.removeItem('vb_bank_users');
  localStorage.removeItem('vb_bank_transactions');
  localStorage.removeItem('vb_bank_seeded');
  localStorage.removeItem('vb_bank_session');
  console.log('🔄 VB Bank data reset complete');
};
