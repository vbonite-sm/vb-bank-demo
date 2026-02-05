// Data Seeder - Initializes localStorage with dummy data for testing

// Utility Providers
export const UTILITY_PROVIDERS = [
  { id: 'provider_001', name: 'VB Power', icon: '⚡', category: 'electricity' },
  { id: 'provider_002', name: 'VB Water', icon: '💧', category: 'water' },
  { id: 'provider_003', name: 'VB Internet', icon: '🌐', category: 'internet' },
  { id: 'provider_004', name: 'VB Gas', icon: '🔥', category: 'gas' }
];

// Loan Options
export const LOAN_OPTIONS = [
  {
    id: 'loan_personal',
    name: 'Personal Loan',
    interestRate: 12,
    minAmount: 1000,
    maxAmount: 50000,
    minTerm: 12,
    maxTerm: 60,
    description: 'Quick approval for personal expenses'
  },
  {
    id: 'loan_home',
    name: 'Home Loan',
    interestRate: 5,
    minAmount: 50000,
    maxAmount: 1000000,
    minTerm: 60,
    maxTerm: 360,
    description: 'Low interest rates for home purchases'
  }
];

const CURRENT_SCHEMA_VERSION = '1.1';

export const seedData = () => {
  // Check if data exists and is up to date
  const storedVersion = localStorage.getItem('vb_bank_schema_version');
  const isSeeded = localStorage.getItem('vb_bank_seeded');

  if (isSeeded && storedVersion === CURRENT_SCHEMA_VERSION) {
    return;
  }

  // Clear old data if version mismatch
  if (isSeeded && storedVersion !== CURRENT_SCHEMA_VERSION) {
    console.log('Detected old data schema. Purging and re-seeding...');
    localStorage.clear();
  }

  // Seed Users with expanded PII
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
      createdAt: new Date('2024-01-15').toISOString(),
      // Expanded PII
      passportNumber: 'P12345678',
      driversLicense: 'DL-2024-001234',
      phone: '+1-555-0101',
      address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA'
      },
      dateOfBirth: '1985-06-15',
      // Crypto Holdings
      crypto: {
        BTC: 0.05432,
        ETH: 1.234
      }
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
      createdAt: new Date('2024-02-10').toISOString(),
      // Expanded PII
      passportNumber: 'P98765432',
      driversLicense: 'DL-2023-998877',
      phone: '+1-555-0202',
      address: {
        street: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90001',
        country: 'USA'
      },
      dateOfBirth: '1990-03-22',
      // Crypto Holdings
      crypto: {
        BTC: 0.12345,
        ETH: 2.567
      }
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
      createdAt: new Date('2024-03-05').toISOString(),
      // Expanded PII
      passportNumber: 'P55566677',
      driversLicense: 'DL-2024-556677',
      phone: '+1-555-0303',
      address: {
        street: '789 Pine Road',
        city: 'Chicago',
        state: 'IL',
        zip: '60601',
        country: 'USA'
      },
      dateOfBirth: '1988-11-08',
      // Crypto Holdings
      crypto: {
        BTC: 0.03210,
        ETH: 0.891
      }
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
      createdAt: new Date('2024-01-01').toISOString(),
      passportNumber: 'N/A',
      driversLicense: 'N/A',
      phone: '+1-555-9999',
      address: {
        street: 'VB Bank HQ',
        city: 'New York',
        state: 'NY',
        zip: '10000',
        country: 'USA'
      },
      dateOfBirth: '1980-01-01',
      crypto: { BTC: 0, ETH: 0 }
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

  // Seed Virtual Cards (1-2 per user)
  const virtualCards = [
    {
      id: 'card_001',
      userId: 'user_001',
      cardNumber: '4532123456789012',
      cvv: '123',
      expiry: '12/27',
      cardholderName: 'John Doe',
      status: 'active', // active, frozen, blocked
      pin: '1234',
      createdAt: new Date('2024-01-20').toISOString()
    },
    {
      id: 'card_002',
      userId: 'user_001',
      cardNumber: '5412987654321098',
      cvv: '456',
      expiry: '06/26',
      cardholderName: 'John Doe',
      status: 'frozen',
      pin: '5678',
      createdAt: new Date('2024-02-01').toISOString()
    },
    {
      id: 'card_003',
      userId: 'user_002',
      cardNumber: '4916543210987654',
      cvv: '789',
      expiry: '09/28',
      cardholderName: 'Jane Smith',
      status: 'active',
      pin: '9012',
      createdAt: new Date('2024-02-15').toISOString()
    },
    {
      id: 'card_004',
      userId: 'user_003',
      cardNumber: '4024007198765432',
      cvv: '321',
      expiry: '03/27',
      cardholderName: 'Mike Wilson',
      status: 'active',
      pin: '3456',
      createdAt: new Date('2024-03-10').toISOString()
    }
  ];

  // Seed Loan Applications
  const loanApplications = [
    {
      id: 'loan_app_001',
      userId: 'user_002',
      loanType: 'loan_personal',
      loanTypeName: 'Personal Loan',
      amount: 10000,
      term: 24,
      interestRate: 12,
      monthlyPayment: 470.73,
      status: 'approved',
      applicationDate: new Date('2024-02-20').toISOString(),
      approvalDate: new Date('2024-02-22').toISOString()
    },
    {
      id: 'loan_app_002',
      userId: 'user_001',
      loanType: 'loan_home',
      loanTypeName: 'Home Loan',
      amount: 250000,
      term: 360,
      interestRate: 5,
      monthlyPayment: 1342.05,
      status: 'pending',
      applicationDate: new Date('2024-03-15').toISOString()
    }
  ];

  // Seed Bill Payments
  const billPayments = [
    {
      id: 'bill_001',
      userId: 'user_001',
      provider: 'provider_001',
      providerName: 'VB Power',
      amount: 125.50,
      description: 'Monthly electricity bill',
      paymentMethod: 'account',
      status: 'completed',
      timestamp: new Date('2024-01-25').toISOString()
    },
    {
      id: 'bill_002',
      userId: 'user_001',
      provider: 'provider_003',
      providerName: 'VB Internet',
      amount: 79.99,
      description: 'Monthly internet bill',
      paymentMethod: 'card',
      status: 'completed',
      timestamp: new Date('2024-02-01').toISOString()
    },
    {
      id: 'bill_003',
      userId: 'user_002',
      provider: 'provider_002',
      providerName: 'VB Water',
      amount: 45.00,
      description: 'Monthly water bill',
      paymentMethod: 'account',
      status: 'completed',
      timestamp: new Date('2024-02-15').toISOString()
    },
    {
      id: 'bill_004',
      userId: 'user_003',
      provider: 'provider_004',
      providerName: 'VB Gas',
      amount: 95.75,
      description: 'Monthly gas bill',
      paymentMethod: 'account',
      status: 'completed',
      timestamp: new Date('2024-03-01').toISOString()
    }
  ];

  // Store in localStorage
  localStorage.setItem('vb_bank_users', JSON.stringify(users));
  localStorage.setItem('vb_bank_transactions', JSON.stringify(transactions));
  localStorage.setItem('vb_bank_virtual_cards', JSON.stringify(virtualCards));
  localStorage.setItem('vb_bank_loan_applications', JSON.stringify(loanApplications));
  localStorage.setItem('vb_bank_bill_payments', JSON.stringify(billPayments));
  localStorage.setItem('vb_bank_seeded', 'true');
  localStorage.setItem('vb_bank_schema_version', CURRENT_SCHEMA_VERSION);

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

// Helper function to get virtual cards
export const getVirtualCards = () => {
  const cards = localStorage.getItem('vb_bank_virtual_cards');
  return cards ? JSON.parse(cards) : [];
};

// Helper function to update virtual cards
export const updateVirtualCards = (cards) => {
  localStorage.setItem('vb_bank_virtual_cards', JSON.stringify(cards));
};

// Helper function to get loan applications
export const getLoanApplications = () => {
  const loans = localStorage.getItem('vb_bank_loan_applications');
  return loans ? JSON.parse(loans) : [];
};

// Helper function to update loan applications
export const updateLoanApplications = (loans) => {
  localStorage.setItem('vb_bank_loan_applications', JSON.stringify(loans));
};

// Helper function to get bill payments
export const getBillPayments = () => {
  const bills = localStorage.getItem('vb_bank_bill_payments');
  return bills ? JSON.parse(bills) : [];
};

// Helper function to update bill payments
export const updateBillPayments = (bills) => {
  localStorage.setItem('vb_bank_bill_payments', JSON.stringify(bills));
};

// Helper function to generate unique ID
export const generateId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
};

// Reset data (useful for testing)
export const resetData = () => {
  localStorage.removeItem('vb_bank_users');
  localStorage.removeItem('vb_bank_transactions');
  localStorage.removeItem('vb_bank_virtual_cards');
  localStorage.removeItem('vb_bank_loan_applications');
  localStorage.removeItem('vb_bank_bill_payments');
  localStorage.removeItem('vb_bank_seeded');
  localStorage.removeItem('vb_bank_session');
  console.log('🔄 VB Bank data reset complete');
};
