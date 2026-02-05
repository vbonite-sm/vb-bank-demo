import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { getCurrentSession } from '../../services/authService';
import { depositMoney, getBalance } from '../../services/bankService';
import { generateSessionId } from '../../services/paymentGatewayService';
import './TopUp.css';

const TopUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const session = getCurrentSession();

  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadBalance();
    checkPaymentStatus();
  }, []);

  const loadBalance = () => {
    const userBalance = getBalance(session.userId);
    setBalance(userBalance);
  };

  const checkPaymentStatus = () => {
    // Check if returning from gateway
    const status = searchParams.get('status');
    const transactionId = searchParams.get('transactionId');
    const paymentAmount = searchParams.get('amount');

    if (status === 'success' && transactionId && paymentAmount) {
      // Guard against duplicate processing (e.g. React StrictMode double-mount)
      const processedKey = `topup_processed_${transactionId}`;
      if (sessionStorage.getItem(processedKey)) {
        // Already processed this transaction — just show success
        setSuccess(`Successfully added $${parseFloat(paymentAmount).toFixed(2)} to your account!`);
        loadBalance();
        window.history.replaceState({}, '', '/top-up');
        return;
      }

      // Mark as processed before depositing
      sessionStorage.setItem(processedKey, 'true');

      // Payment was successful, credit the account
      const result = depositMoney(
        session.userId,
        parseFloat(paymentAmount),
        'Top Up via Payment Gateway'
      );

      if (result.success) {
        setSuccess(`Successfully added $${parseFloat(paymentAmount).toFixed(2)} to your account!`);
        loadBalance();
      } else {
        setError('Failed to credit your account. Please contact support.');
      }

      // Clean up URL
      window.history.replaceState({}, '', '/top-up');
    } else if (status === 'failed') {
      setError('Payment failed. Please try again.');
      window.history.replaceState({}, '', '/top-up');
    }
  };

  const handleTopUp = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const topUpAmount = parseFloat(amount);
    if (isNaN(topUpAmount) || topUpAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (topUpAmount < 10) {
      setError('Minimum top-up amount is $10');
      return;
    }

    if (topUpAmount > 10000) {
      setError('Maximum top-up amount is $10,000');
      return;
    }

    setLoading(true);

    // Redirect to payment gateway
    const sessionId = generateSessionId();
    const returnUrl = `${window.location.origin}/top-up`;

    // Store payment intent
    sessionStorage.setItem('payment_intent', JSON.stringify({
      type: 'top_up',
      amount: topUpAmount,
      userId: session.userId,
      returnUrl
    }));

    navigate(`/gateway?sessionId=${sessionId}&amount=${topUpAmount}&returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  const quickAmounts = [50, 100, 250, 500];

  return (
    <div className="top-up-page">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Top Up Account</h1>
        <p>Add money to your VB Bank account securely</p>
      </motion.div>

      {error && (
        <motion.div
          className="alert alert-error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          data-testid="alert-error"
        >
          <FiAlertCircle />
          <span>{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div
          className="alert alert-success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          data-testid="alert-success"
        >
          <FiCheckCircle />
          <span>{success}</span>
        </motion.div>
      )}

      <div className="top-up-layout">
        <motion.div
          className="top-up-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="balance-display">
            <div className="balance-label">Current Balance</div>
            <div className="balance-amount" data-testid="current-balance">
              ${balance.toFixed(2)}
            </div>
          </div>

          <form onSubmit={handleTopUp} className="top-up-form">
            <div className="form-group">
              <label htmlFor="amount">Enter Amount (USD)</label>
              <div className="amount-input-wrapper">
                <span className="amount-prefix">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  id="amount"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
                      setAmount(val);
                    }
                  }}
                  placeholder="0.00"
                  data-testid="input-amount"
                  required
                />
              </div>
              <span className="form-hint">Min: $10 | Max: $10,000</span>
            </div>

            <div className="quick-amounts">
              <span className="quick-label">Quick Select:</span>
              <div className="quick-buttons">
                {quickAmounts.map(amt => (
                  <button
                    key={amt}
                    type="button"
                    className="quick-btn"
                    onClick={() => setAmount(amt.toString())}
                    data-testid={`btn-quick-${amt}`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              data-testid="btn-proceed"
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </form>

          <div className="security-note">
            <div className="note-icon">🔒</div>
            <div>
              <div className="note-title">Secure Payment</div>
              <div className="note-text">
                You will be redirected to our secure payment gateway to complete the transaction.
                Your payment information is encrypted and never stored on our servers.
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="info-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3>How It Works</h3>
          <div className="info-steps">
            <div className="info-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <div className="step-title">Enter Amount</div>
                <div className="step-text">Choose how much you want to add</div>
              </div>
            </div>
            <div className="info-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <div className="step-title">Secure Payment</div>
                <div className="step-text">Complete payment via our secure gateway</div>
              </div>
            </div>
            <div className="info-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <div className="step-title">Instant Credit</div>
                <div className="step-text">Funds are added to your account immediately</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TopUp;
