// Authentication Service - Handles login, logout, and session management

import { getUsers, updateUsers, generateId } from '../utils/seeder';

// Get current session
export const getCurrentSession = () => {
  const session = localStorage.getItem('vb_bank_session');
  return session ? JSON.parse(session) : null;
};

// Set session
const setSession = (user) => {
  const session = {
    userId: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    accountNumber: user.accountNumber,
    loginTime: new Date().toISOString()
  };
  localStorage.setItem('vb_bank_session', JSON.stringify(session));
  return session;
};

// Login
export const login = (username, password) => {
  const users = getUsers();
  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return {
      success: false,
      error: 'Invalid username or password'
    };
  }

  const session = setSession(user);
  return {
    success: true,
    user: session
  };
};

// Register new user
export const register = (userData) => {
  const users = getUsers();

  // Check if username already exists
  const existingUser = users.find(u => u.username === userData.username);
  if (existingUser) {
    return {
      success: false,
      error: 'Username already exists'
    };
  }

  // Check if email already exists
  const existingEmail = users.find(u => u.email === userData.email);
  if (existingEmail) {
    return {
      success: false,
      error: 'Email already registered'
    };
  }

  // Generate account number (10 digits)
  const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

  // Create new user
  const newUser = {
    id: generateId('user'),
    username: userData.username,
    password: userData.password, // In real app, this would be hashed
    email: userData.email,
    fullName: userData.fullName,
    role: 'user', // New registrations are always users
    accountNumber: accountNumber,
    balance: 0, // Start with zero balance
    currency: 'USD',
    crypto: { BTC: 0, ETH: 0 },
    createdAt: new Date().toISOString()
  };

  // Add to users list
  users.push(newUser);
  updateUsers(users);

  // Auto-login after registration
  const session = setSession(newUser);

  return {
    success: true,
    user: session
  };
};

// Logout
export const logout = () => {
  localStorage.removeItem('vb_bank_session');
  return {
    success: true,
    message: 'Logged out successfully'
  };
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return getCurrentSession() !== null;
};

// Check if user is admin
export const isAdmin = () => {
  const session = getCurrentSession();
  return session && session.role === 'admin';
};

// Check if user is regular user
export const isUser = () => {
  const session = getCurrentSession();
  return session && session.role === 'user';
};

// Get user by ID
export const getUserById = (userId) => {
  const users = getUsers();
  return users.find(u => u.id === userId);
};

// Get user by username
export const getUserByUsername = (username) => {
  const users = getUsers();
  return users.find(u => u.username === username);
};

// Update user profile
export const updateUserProfile = (userId, updates) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return {
      success: false,
      error: 'User not found'
    };
  }

  // Update user data
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    id: users[userIndex].id, // Prevent ID change
    role: users[userIndex].role, // Prevent role change
    accountNumber: users[userIndex].accountNumber, // Prevent account number change
  };

  updateUsers(users);

  // Update session if it's the current user
  const session = getCurrentSession();
  if (session && session.userId === userId) {
    setSession(users[userIndex]);
  }

  return {
    success: true,
    user: users[userIndex]
  };
};
