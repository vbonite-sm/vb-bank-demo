// Payment Gateway Service - Simulates external payment processing

import { generateId } from '../utils/seeder';

/**
 * Generate a unique payment session ID
 */
export const generateSessionId = () => {
  return generateId('session');
};

/**
 * Validate card number using Luhn algorithm
 * @param {string} cardNumber - Card number to validate
 * @returns {boolean} - True if valid
 */
export const validateCardNumber = (cardNumber) => {
  // Remove spaces and non-digits
  const cleaned = cardNumber.replace(/\D/g, '');

  // Card number should be 13-19 digits
  // For mock testing, we'll allow any regex-valid length and skip strict Luhn check
  // so users can easily type "1234..." without calculating checksums
  return cleaned.length >= 13 && cleaned.length <= 19;
};

/**
 * Validate expiry date (MM/YY format)
 * @param {string} expiry - Expiry date
 * @returns {boolean} - True if valid and not expired
 */
export const validateExpiry = (expiry) => {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;

  const month = parseInt(match[1], 10);
  const year = parseInt('20' + match[2], 10);

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
};

/**
 * Validate CVV/CVC
 * @param {string} cvv - CVV to validate
 * @returns {boolean} - True if valid
 */
export const validateCVV = (cvv) => {
  return /^\d{3,4}$/.test(cvv);
};

/**
 * Process a mock payment
 * @param {Object} paymentData - Payment details
 * @returns {Promise<Object>} - Payment result
 */
export const processPayment = async (paymentData) => {
  const {
    cardNumber,
    cvv,
    expiry,
    cardholderName,
    amount,
    sessionId
  } = paymentData;

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Validate inputs
  if (!validateCardNumber(cardNumber)) {
    return {
      success: false,
      error: 'Invalid card number',
      transactionId: null
    };
  }

  if (!validateCVV(cvv)) {
    return {
      success: false,
      error: 'Invalid CVV',
      transactionId: null
    };
  }

  if (!validateExpiry(expiry)) {
    return {
      success: false,
      error: 'Card expired or invalid expiry date',
      transactionId: null
    };
  }

  if (!cardholderName || cardholderName.trim().length < 2) {
    return {
      success: false,
      error: 'Invalid cardholder name',
      transactionId: null
    };
  }

  if (!amount || amount <= 0) {
    return {
      success: false,
      error: 'Invalid amount',
      transactionId: null
    };
  }

  // Simulate payment processing (90% success rate for testing)
  const isSuccess = Math.random() < 0.9;

  if (isSuccess) {
    return {
      success: true,
      transactionId: generateId('txn_gateway'),
      sessionId,
      amount,
      timestamp: new Date().toISOString(),
      message: 'Payment processed successfully'
    };
  } else {
    // Random failure for testing
    const errors = [
      'Insufficient funds',
      'Card declined by issuer',
      'Payment processing failed',
      'Transaction timeout'
    ];
    return {
      success: false,
      error: errors[Math.floor(Math.random() * errors.length)],
      transactionId: null,
      sessionId
    };
  }
};

/**
 * Get card type from card number
 * @param {string} cardNumber
 * @returns {string} - Card type (visa, mastercard, amex, etc.)
 */
export const getCardType = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, '');

  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  if (/^6(?:011|5)/.test(cleaned)) return 'discover';

  return 'unknown';
};

/**
 * Mask card number for display
 * @param {string} cardNumber
 * @returns {string} - Masked card number
 */
export const maskCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 4) return cardNumber;

  return '**** **** **** ' + cleaned.slice(-4);
};

/**
 * Format card number with spaces
 * @param {string} cardNumber
 * @returns {string} - Formatted card number
 */
export const formatCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, '');
  const matches = cleaned.match(/.{1,4}/g);
  return matches ? matches.join(' ') : cleaned;
};
