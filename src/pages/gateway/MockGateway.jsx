import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCreditCard, FiLock, FiAlertCircle } from 'react-icons/fi';
import { processPayment, formatCardNumber } from '../../services/paymentGatewayService';
import './MockGateway.css';

const MockGateway = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sessionId = searchParams.get('sessionId');
  const amount = searchParams.get('amount');
  const returnUrl = searchParams.get('returnUrl');

  useEffect(() => {
    // Validate required parameters
    if (!sessionId || !amount || !returnUrl) {
      setError('Invalid payment session. Missing required parameters.');
    }
  }, []);

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 16) {
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    if (value.length <= 5) {
      setExpiry(value);
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCvv(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await processPayment({
        cardNumber,
        cvv,
        expiry,
        cardholderName,
        amount: parseFloat(amount),
        sessionId
      });

      if (result.success) {
        // Payment successful - redirect back with success status
        const redirectUrl = new URL(returnUrl);
        redirectUrl.searchParams.set('status', 'success');
        redirectUrl.searchParams.set('transactionId', result.transactionId);
        redirectUrl.searchParams.set('amount', amount);
        window.location.href = redirectUrl.toString();
      } else {
        // Payment failed
        setError(result.error || 'Payment processing failed');
        setLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const redirectUrl = new URL(returnUrl);
    redirectUrl.searchParams.set('status', 'cancelled');
    window.location.href = redirectUrl.toString();
  };

  return (
    <div className="mock-gateway">
      <div className="gateway-container">
        <motion.div
          className="gateway-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="gateway-header">
            <div className="gateway-logo">
              <FiLock size={24} />
              <span>SecurePay Gateway</span>
            </div>
            <div className="gateway-badge">
              <FiLock size={12} />
              <span>Secure</span>
            </div>
          </div>

          <div className="payment-summary">
            <div className="summary-label">Amount to Pay</div>
            <div className="summary-amount" data-testid="payment-amount">
              ${parseFloat(amount || 0).toFixed(2)}
            </div>
            <div className="summary-merchant">VB Bank</div>
          </div>

          {error && (
            <motion.div
              className="gateway-alert"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              data-testid="alert-error"
            >
              <FiAlertCircle />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="gateway-form">
            <div className="form-group">
              <label htmlFor="cardNumber">Card Number</label>
              <div className="card-input-wrapper">
                <FiCreditCard className="input-icon" />
                <input
                  type="text"
                  id="cardNumber"
                  value={formatCardNumber(cardNumber)}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  data-testid="input-card-number"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="cardholderName">Cardholder Name</label>
              <input
                type="text"
                id="cardholderName"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="John Doe"
                data-testid="input-cardholder-name"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expiry">Expiry Date</label>
                <input
                  type="text"
                  id="expiry"
                  value={expiry}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  data-testid="input-expiry"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="cvv">CVV</label>
                <input
                  type="text"
                  id="cvv"
                  value={cvv}
                  onChange={handleCvvChange}
                  placeholder="123"
                  data-testid="input-cvv"
                  required
                />
              </div>
            </div>

            <div className="gateway-actions">
              <button
                type="submit"
                className="btn btn-pay"
                disabled={loading}
                data-testid="btn-pay"
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Processing...
                  </>
                ) : (
                  `Pay $${parseFloat(amount || 0).toFixed(2)}`
                )}
              </button>

              <button
                type="button"
                className="btn btn-cancel"
                onClick={handleCancel}
                disabled={loading}
                data-testid="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="gateway-security">
            <FiLock size={16} />
            <span>Your payment information is encrypted and secure</span>
          </div>

          <div className="gateway-test-info">
            <strong>Test Mode</strong>
            <p>Use any valid card number format for testing. 90% success rate simulated.</p>
            <p>Example: 4532 1234 5678 9012</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MockGateway;
