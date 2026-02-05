import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiUser, FiDollarSign, FiFileText, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { getCurrentSession } from '../../services/authService';
import { transferMoney, searchUsers, getAccountDetails } from '../../services/bankService';
import './Transfer.css';

const Transfer = () => {
  const session = getCurrentSession();
  const [formData, setFormData] = useState({
    recipientAccount: '',
    amount: '',
    description: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [accountDetails, setAccountDetails] = useState(null);

  useState(() => {
    if (session) {
      const details = getAccountDetails(session.userId);
      setAccountDetails(details);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
    setSuccess(null);

    // Search for users when typing in recipient account
    if (name === 'recipientAccount' && value.length >= 3) {
      const results = searchUsers(value);
      setSearchResults(results);
    } else if (name === 'recipientAccount') {
      setSearchResults([]);
    }
  };

  const selectRecipient = (account) => {
    setFormData({
      ...formData,
      recipientAccount: account.accountNumber
    });
    setSearchResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    setLoading(true);

    try {
      // Validate amount
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount');
        setLoading(false);
        return;
      }

      // Perform transfer
      const result = transferMoney(
        session.userId,
        formData.recipientAccount,
        amount,
        formData.description
      );

      if (result.success) {
        setSuccess({
          message: result.message,
          newBalance: result.newBalance,
          transaction: result.transaction
        });

        // Update account details
        const updatedDetails = getAccountDetails(session.userId);
        setAccountDetails(updatedDetails);

        // Reset form
        setFormData({
          recipientAccount: '',
          amount: '',
          description: ''
        });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred during the transfer');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="transfer-page">
      <div className="page-header">
        <h1>Transfer Money</h1>
        <p className="text-muted">Send money to another VB Bank account</p>
      </div>

      {accountDetails && (
        <motion.div
          className="balance-info glass-card"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="balance-label">Available Balance:</span>
          <span className="balance-value" data-testid="available-balance">{formatCurrency(accountDetails.balance)}</span>
        </motion.div>
      )}

      <div className="transfer-grid">
        {/* Transfer Form */}
        <motion.div
          className="transfer-form-card glass-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3>Transfer Details</h3>

          {error && (
            <motion.div
              className="alert alert-error"
              data-testid="alert-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FiAlertCircle />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              className="alert alert-success"
              data-testid="alert-success"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FiCheckCircle />
              <div>
                <p className="success-message">{success.message}</p>
                <p className="success-balance">New balance: {formatCurrency(success.newBalance)}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="transfer-form">
            <div className="input-group">
              <label className="input-label">
                <FiUser className="input-icon" />
                Recipient Account Number
              </label>
              <input
                type="text"
                name="recipientAccount"
                value={formData.recipientAccount}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter account number or search by name"
                data-testid="input-recipient-account"
                required
              />

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="search-results" data-testid="search-results">
                  {searchResults.map((result, index) => (
                    <div
                      key={result.id}
                      className="search-result-item"
                      data-testid={`search-result-${index}`}
                      onClick={() => selectRecipient(result)}
                    >
                      <div className="result-info">
                        <p className="result-name">{result.fullName}</p>
                        <p className="result-username text-muted">@{result.username}</p>
                      </div>
                      <span className="result-account">{result.accountNumber}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">
                <FiDollarSign className="input-icon" />
                Amount (USD)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="input-field"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                data-testid="input-amount"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                <FiFileText className="input-icon" />
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field textarea"
                placeholder="Enter a description for this transfer"
                data-testid="input-description"
                rows="3"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              data-testid="btn-submit-transfer"
              disabled={loading}
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <FiSend />
                  <span>Transfer Money</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Transfer Info */}
        <motion.div
          className="transfer-info-card glass-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3>Transfer Information</h3>

          <div className="info-list">
            <div className="info-item">
              <div className="info-icon">
                <FiCheckCircle />
              </div>
              <div className="info-content">
                <h4>Instant Transfers</h4>
                <p className="text-muted">
                  Transfers are processed instantly within VB Bank
                </p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <FiDollarSign />
              </div>
              <div className="info-content">
                <h4>No Transfer Fees</h4>
                <p className="text-muted">
                  All transfers within VB Bank are completely free
                </p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <FiUser />
              </div>
              <div className="info-content">
                <h4>Easy Recipient Search</h4>
                <p className="text-muted">
                  Search recipients by name, username, or account number
                </p>
              </div>
            </div>
          </div>

          <div className="important-note">
            <p><strong>Important:</strong></p>
            <ul>
              <li>Verify the recipient account number before transferring</li>
              <li>Transfers cannot be reversed once completed</li>
              <li>Keep your transaction receipts for your records</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Transfer;
