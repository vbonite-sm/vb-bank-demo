import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiCreditCard, FiRefreshCw } from 'react-icons/fi';
import { getCurrentSession } from '../../services/authService';
import { getAccountDetails, getUserTransactions, getTransactionStats } from '../../services/bankService';
import { getPopularCurrencies, getCurrencySymbol } from '../../services/apiService';
import CryptoWidget from '../../components/CryptoWidget';
import './Dashboard.css';

const Dashboard = () => {
  const session = getCurrentSession();
  const [accountDetails, setAccountDetails] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [currencyRates, setCurrencyRates] = useState([]);
  const [loadingRates, setLoadingRates] = useState(false);

  useEffect(() => {
    loadDashboardData();
    loadCurrencyRates();
  }, []);

  const loadDashboardData = () => {
    if (session) {
      const details = getAccountDetails(session.userId);
      const transactions = getUserTransactions(session.userId, 5);
      const transactionStats = getTransactionStats(session.userId);

      setAccountDetails(details);
      setRecentTransactions(transactions);
      setStats(transactionStats);
    }
  };

  const loadCurrencyRates = async () => {
    setLoadingRates(true);
    try {
      const result = await getPopularCurrencies();
      if (result.success) {
        setCurrencyRates(result.rates);
      }
    } catch (error) {
      console.error('Error loading currency rates:', error);
    } finally {
      setLoadingRates(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
      case 'transfer_in':
        return <FiTrendingUp className="transaction-icon positive" />;
      case 'withdrawal':
      case 'transfer_out':
      case 'transfer':
        return <FiTrendingDown className="transaction-icon negative" />;
      default:
        return <FiDollarSign className="transaction-icon" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit':
      case 'transfer_in':
        return 'positive';
      case 'withdrawal':
      case 'transfer_out':
      case 'transfer':
        return 'negative';
      default:
        return '';
    }
  };

  if (!accountDetails) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {session?.fullName}</h1>
        <p className="text-muted">Here's your financial overview</p>
      </div>

      {/* Account Balance Card */}
      <motion.div
        className="balance-card glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="balance-header">
          <div>
            <p className="balance-label">Total Balance</p>
            <h2 className="balance-amount" data-testid="balance-amount">{formatCurrency(accountDetails.balance)}</h2>
          </div>
          <div className="balance-icon">
            <FiCreditCard />
          </div>
        </div>
        <div className="balance-footer">
          <div className="account-info">
            <span className="account-label">Account Number:</span>
            <span className="account-number" data-testid="account-number">{accountDetails.accountNumber}</span>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="stats-grid grid-3">
        <motion.div
          className="stat-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          data-testid="stat-total-deposits"
        >
          <div className="stat-header">
            <FiTrendingUp className="stat-icon positive" />
            <span className="stat-label">Total Deposits</span>
          </div>
          <p className="stat-value">{formatCurrency(stats?.totalDeposits || 0)}</p>
          <p className="stat-count text-muted">{stats?.depositCount || 0} transactions</p>
        </motion.div>

        <motion.div
          className="stat-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          data-testid="stat-total-transfers-out"
        >
          <div className="stat-header">
            <FiTrendingDown className="stat-icon negative" />
            <span className="stat-label">Total Transfers Out</span>
          </div>
          <p className="stat-value">{formatCurrency(stats?.totalTransfersOut || 0)}</p>
          <p className="stat-count text-muted">{stats?.transferOutCount || 0} transactions</p>
        </motion.div>

        <motion.div
          className="stat-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          data-testid="stat-total-transactions"
        >
          <div className="stat-header">
            <FiDollarSign className="stat-icon" />
            <span className="stat-label">Total Transactions</span>
          </div>
          <p className="stat-value">{stats?.totalTransactions || 0}</p>
          <p className="stat-count text-muted">All time</p>
        </motion.div>
      </div>

      <div className="dashboard-grid">
        {/* Crypto Portfolio Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <CryptoWidget />
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          className="transactions-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="card-header">
            <h3>Recent Transactions</h3>
            <a href="/history" className="view-all-link">View All</a>
          </div>

          <div className="transactions-list">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction, index) => (
                <div key={transaction.id} className="transaction-item" data-testid={`transaction-item-${index}`}>
                  {getTransactionIcon(transaction.type)}
                  <div className="transaction-details">
                    <p className="transaction-description">{transaction.description}</p>
                    <p className="transaction-date text-muted">{formatDate(transaction.timestamp)}</p>
                  </div>
                  <div className={`transaction-amount ${getTransactionColor(transaction.type)}`}>
                    {(transaction.type === 'deposit' || transaction.type === 'transfer_in') ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p className="text-muted">No transactions yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Live Currency Rates */}
        <motion.div
          className="currency-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="card-header">
            <h3>Live Currency Rates</h3>
            <button
              onClick={loadCurrencyRates}
              className="refresh-btn"
              data-testid="btn-refresh-rates"
              disabled={loadingRates}
            >
              <FiRefreshCw className={loadingRates ? 'spinning' : ''} />
            </button>
          </div>

          <div className="currency-list">
            {loadingRates ? (
              <div className="loading-state">
                <div className="spinner"></div>
              </div>
            ) : currencyRates.length > 0 ? (
              currencyRates.map((currency, index) => (
                <div key={currency.code} className="currency-item" data-testid={`currency-item-${index}`}>
                  <div className="currency-info">
                    <span className="currency-code">{currency.code}</span>
                    <span className="currency-name text-muted">{currency.name}</span>
                  </div>
                  <div className="currency-rate">
                    {getCurrencySymbol(currency.code)}{currency.rate.toFixed(4)}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p className="text-muted">Failed to load currency rates</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
