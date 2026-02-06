import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiDollarSign, FiTrendingUp, FiActivity } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { apiGetSystemStats, apiGetAllTransactions, apiGetTransactionTrends } from '../../services/adminApi';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const [statsRes, transactionsRes, trendsRes] = await Promise.all([
      apiGetSystemStats(),
      apiGetAllTransactions(10),
      apiGetTransactionTrends(30)
    ]);

    if (statsRes.success) setStats(statsRes.data);
    if (transactionsRes.success) setRecentTransactions(transactionsRes.data);
    if (trendsRes.success) setTrends(trendsRes.data);
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
      day: 'numeric'
    });
  };

  const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const chartData = trends.map(trend => ({
    date: formatDate(trend.date),
    deposits: trend.deposits,
    withdrawals: trend.withdrawals,
    transfers: trend.transfers
  }));

  if (!stats) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p className="text-muted">System Overview and Analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid grid-4">
        <motion.div
          className="stat-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          data-testid="stat-total-users"
        >
          <div className="stat-header">
            <FiUsers className="stat-icon primary" />
            <span className="stat-label">Total Users</span>
          </div>
          <p className="stat-value">{stats.totalUsers}</p>
          <p className="stat-sub text-muted">{stats.activeUsers} active</p>
        </motion.div>

        <motion.div
          className="stat-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          data-testid="stat-total-balance"
        >
          <div className="stat-header">
            <FiDollarSign className="stat-icon success" />
            <span className="stat-label">Total Balance</span>
          </div>
          <p className="stat-value">{formatCurrency(stats.totalBalance)}</p>
          <p className="stat-sub text-muted">Avg: {formatCurrency(stats.averageBalance)}</p>
        </motion.div>

        <motion.div
          className="stat-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          data-testid="stat-total-transactions"
        >
          <div className="stat-header">
            <FiActivity className="stat-icon info" />
            <span className="stat-label">Total Transactions</span>
          </div>
          <p className="stat-value">{stats.totalTransactions}</p>
          <p className="stat-sub text-muted">{stats.recentTransactions} this week</p>
        </motion.div>

        <motion.div
          className="stat-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          data-testid="stat-total-deposits"
        >
          <div className="stat-header">
            <FiTrendingUp className="stat-icon warning" />
            <span className="stat-label">Total Deposits</span>
          </div>
          <p className="stat-value">{formatCurrency(stats.totalDeposits)}</p>
          <p className="stat-sub text-muted">{stats.depositCount} transactions</p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Transaction Trends Chart */}
        <motion.div
          className="chart-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3>Transaction Trends (Last 30 Days)</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="deposits" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="withdrawals" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="transfers" stroke="#4f46e5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Transaction Type Distribution */}
        <motion.div
          className="chart-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3>Transaction Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: 'Deposits', count: stats.depositCount, amount: stats.totalDeposits },
                  { name: 'Withdrawals', count: stats.withdrawalCount, amount: stats.totalWithdrawals },
                  { name: 'Transfers', count: stats.transferCount, amount: stats.totalTransfers }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="#4f46e5" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions & Top User */}
      <div className="bottom-grid">
        {/* Recent Transactions */}
        <motion.div
          className="transactions-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3>Recent Transactions</h3>
          <div className="transactions-list">
            {recentTransactions.map((txn, index) => (
              <div key={txn.id} className="transaction-item" data-testid={`admin-transaction-item-${index}`}>
                <div className="transaction-info">
                  <p className="transaction-desc">{txn.description}</p>
                  <p className="transaction-date text-muted">{formatFullDate(txn.timestamp)}</p>
                </div>
                <div className={`transaction-amount ${txn.type === 'deposit' ? 'positive' : 'negative'}`}>
                  {formatCurrency(txn.amount)}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top User */}
        {stats.richestUser && (
          <motion.div
            className="top-user-card glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            data-testid="top-user-card"
          >
            <h3>Highest Balance Account</h3>
            <div className="top-user-content">
              <div className="user-avatar-large">
                {stats.richestUser.fullName.charAt(0)}
              </div>
              <div className="user-info-large">
                <h4>{stats.richestUser.fullName}</h4>
                <p className="user-account text-muted">{stats.richestUser.accountNumber}</p>
                <p className="user-balance">{formatCurrency(stats.richestUser.balance)}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
