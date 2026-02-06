import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiZap, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { getCurrentSession } from '../../services/authService';
import { apiPayBill, apiGetBillHistory, apiGetBalance } from '../../services/bankApi';
import { UTILITY_PROVIDERS } from '../../utils/seeder';
import { generateSessionId } from '../../services/paymentGatewayService';
import { useBuggy } from '../../context/BuggyContext';
import './BillPay.css';

const BillPay = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const session = getCurrentSession();
  const { buggyOperation } = useBuggy();

  const [provider, setProvider] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('account');
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    const status = searchParams.get('status');
    const transactionId = searchParams.get('transactionId');

    if (status === 'success' && transactionId) {
      const intentData = sessionStorage.getItem('payment_intent');
      if (intentData) {
        const intent = JSON.parse(intentData);

        // Verify it matches current user
        if (intent.userId === session.userId) {
          try {
            // Record the payment
            const response = await apiPayBill(
              intent.userId,
              intent.provider,
              intent.amount,
              intent.description,
              'card'
            );

            if (response.success) {
              setSuccess('Card payment successful! Bill has been paid.');
              sessionStorage.removeItem('payment_intent');
              // Clear URL params
              setSearchParams({});
              loadData(); // Refresh history
            }
          } catch (err) {
            console.error('Error recording payment:', err);
            setError('Payment successful but failed to record. Please contact support.');
          }
        }
      }
    } else if (status === 'cancelled') {
      setError('Payment was cancelled.');
      setSearchParams({});
    }
  };

  const loadData = async () => {
    try {
      const [balanceRes, historyRes] = await Promise.all([
        apiGetBalance(session.userId),
        apiGetBillHistory(session.userId)
      ]);
      if (balanceRes.success) setBalance(balanceRes.data.balance);
      if (historyRes.success) setHistory(historyRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!provider) {
      setError('Please select a utility provider');
      return;
    }

    const billAmount = parseFloat(amount);
    if (isNaN(billAmount) || billAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      await buggyOperation(async () => {
        if (paymentMethod === 'account') {
          // Pay from account balance
          const response = await apiPayBill(
            session.userId,
            provider,
            billAmount,
            description || 'Bill Payment',
            'account'
          );

          if (response.success) {
            setSuccess('Bill paid successfully from your account!');
            setProvider('');
            setAmount('');
            setDescription('');
            loadData();
          } else {
            setError(response.error?.message || 'Payment failed');
          }
        } else {
          // Pay with card - redirect to gateway
          const sessionId = generateSessionId();
          const returnUrl = `${window.location.origin}/bill-pay`;

          // Store payment intent in sessionStorage
          sessionStorage.setItem('payment_intent', JSON.stringify({
            type: 'bill_payment',
            provider,
            amount: billAmount,
            description: description || 'Bill Payment',
            userId: session.userId,
            returnUrl
          }));

          window.location.href = `/gateway?sessionId=${sessionId}&amount=${billAmount}&returnUrl=${encodeURIComponent(returnUrl)}`;
        }
      });
    } catch (err) {
      setError(err.message || 'An error occurred while processing the payment');
    } finally {
      setLoading(false);
    }
  };

  const selectedProvider = UTILITY_PROVIDERS.find(p => p.id === provider);

  return (
    <div className="bill-pay-page">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Pay Bills</h1>
        <p>Pay your utility bills quickly and securely</p>
      </motion.div>

      <div className="bill-pay-layout">
        <motion.div
          className="bill-pay-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="card-header">
            <FiZap className="header-icon" />
            <h2>New Payment</h2>
          </div>

          <form onSubmit={handleSubmit} className="bill-pay-form">
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

            <div className="form-group">
              <label htmlFor="provider">Utility Provider *</label>
              <select
                id="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                data-testid="select-provider"
                required
              >
                <option value="">Select a provider</option>
                {UTILITY_PROVIDERS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.icon} {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount (USD) *</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                data-testid="input-amount"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description (Optional)</label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Monthly electricity bill"
                data-testid="input-description"
              />
            </div>

            <div className="form-group">
              <label>Payment Method *</label>
              <div className="payment-methods">
                <label className="payment-method-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="account"
                    checked={paymentMethod === 'account'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    data-testid="radio-payment-account"
                  />
                  <div className="option-content">
                    <span className="option-title">Pay from Account</span>
                    <span className="option-subtitle">
                      Available Balance: ${balance.toFixed(2)}
                    </span>
                  </div>
                </label>

                <label className="payment-method-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    data-testid="radio-payment-card"
                  />
                  <div className="option-content">
                    <span className="option-title">Pay with Card</span>
                    <span className="option-subtitle">
                      Debit/Credit Card via secure gateway
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              data-testid="btn-submit-payment"
            >
              {loading ? 'Processing...' : (paymentMethod === 'card' ? 'Continue to Payment' : 'Pay Bill')}
            </button>
          </form>
        </motion.div>

        <motion.div
          className="bill-history-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2>Recent Payments</h2>

          {history.length === 0 ? (
            <div className="empty-state">
              <p>No bill payments yet</p>
            </div>
          ) : (
            <div className="history-list">
              {history.slice(0, 5).map(bill => {
                const billProvider = UTILITY_PROVIDERS.find(p => p.id === bill.provider);
                return (
                  <div key={bill.id} className="history-item" data-testid="bill-history-item">
                    <div className="history-icon">
                      {billProvider?.icon || '💰'}
                    </div>
                    <div className="history-details">
                      <div className="history-provider">{bill.providerName || 'Unknown Provider'}</div>
                      <div className="history-description">{bill.description}</div>
                      <div className="history-date">
                        {new Date(bill.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="history-amount">
                      ${bill.amount.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BillPay;
