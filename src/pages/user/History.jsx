import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiFilter, FiDownload, FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';
import { getCurrentSession } from '../../services/authService';
import { getUserTransactions } from '../../services/bankService';
import './History.css';

const History = () => {
  const session = getCurrentSession();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, searchTerm, startDate, endDate, minAmount, maxAmount, transactions]);

  const loadTransactions = () => {
    if (session) {
      const txns = getUserTransactions(session.userId);
      setTransactions(txns);
      setFilteredTransactions(txns);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(txn => {
        if (filter === 'income') {
          return txn.type === 'deposit' || txn.type === 'transfer_in';
        } else if (filter === 'expense') {
          return txn.type === 'withdrawal' || txn.type === 'transfer_out' || txn.type === 'transfer' || txn.type === 'bill_payment';
        }
        return true;
      });
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(txn =>
        txn.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date range filter
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(txn => new Date(txn.timestamp) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(txn => new Date(txn.timestamp) <= end);
    }

    // Apply amount range filter
    if (minAmount) {
      const min = parseFloat(minAmount);
      if (!isNaN(min)) {
        filtered = filtered.filter(txn => txn.amount >= min);
      }
    }

    if (maxAmount) {
      const max = parseFloat(maxAmount);
      if (!isNaN(max)) {
        filtered = filtered.filter(txn => txn.amount <= max);
      }
    }

    setFilteredTransactions(filtered);
  };

  const clearFilters = () => {
    setFilter('all');
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
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
      case 'bill_payment':
        return <FiTrendingDown className="transaction-icon negative" />;
      default:
        return <FiDollarSign className="transaction-icon" />;
    }
  };

  const getTransactionType = (type) => {
    const typeMap = {
      'deposit': 'Deposit',
      'withdrawal': 'Withdrawal',
      'transfer': 'Transfer Out',
      'transfer_out': 'Transfer Out',
      'transfer_in': 'Transfer In',
      'bill_payment': 'Bill Payment'
    };
    return typeMap[type] || type;
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit':
      case 'transfer_in':
        return 'positive';
      case 'withdrawal':
      case 'transfer_out':
      case 'transfer':
      case 'bill_payment':
        return 'negative';
      default:
        return '';
    }
  };

  const exportTransactions = () => {
    // Create CSV content
    const headers = ['Date', 'Type', 'Description', 'Amount', 'Status'];
    const rows = filteredTransactions.map(txn => [
      formatDate(txn.timestamp),
      getTransactionType(txn.type),
      txn.description,
      formatCurrency(txn.amount),
      txn.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vb-bank-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="history-page">
      <div className="page-header">
        <div>
          <h1>Transaction History</h1>
          <p className="text-muted">View all your transactions</p>
        </div>
        <button onClick={exportTransactions} className="btn btn-secondary" data-testid="btn-export-csv">
          <FiDownload />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <motion.div
        className="filters-card glass-card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="filters-header">
          <FiFilter />
          <span>Filters</span>
        </div>

        <div className="filters-content">
          <div className="filter-group">
            <label className="filter-label">Type:</label>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                data-testid="filter-btn-all"
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-btn ${filter === 'income' ? 'active' : ''}`}
                data-testid="filter-btn-income"
                onClick={() => setFilter('income')}
              >
                Income
              </button>
              <button
                className={`filter-btn ${filter === 'expense' ? 'active' : ''}`}
                data-testid="filter-btn-expense"
                onClick={() => setFilter('expense')}
              >
                Expense
              </button>
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Search:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              placeholder="Search by description..."
              data-testid="input-search"
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Date Range:</label>
            <div className="date-range-inputs">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
                data-testid="input-start-date"
              />
              <span className="date-separator">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
                data-testid="input-end-date"
              />
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Amount Range:</label>
            <div className="amount-range-inputs">
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="input-field"
                placeholder="Min"
                step="0.01"
                data-testid="input-min-amount"
              />
              <span className="amount-separator">to</span>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="input-field"
                placeholder="Max"
                step="0.01"
                data-testid="input-max-amount"
              />
            </div>
          </div>

          <button
            onClick={clearFilters}
            className="btn btn-clear"
            data-testid="btn-clear-filters"
          >
            Clear Filters
          </button>
        </div>
      </motion.div>

      {/* Transactions List */}
      <motion.div
        className="transactions-card glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="transactions-header">
          <h3>All Transactions ({filteredTransactions.length})</h3>
        </div>

        {filteredTransactions.length > 0 ? (
          <div className="transactions-table">
            <div className="table-header">
              <div className="table-col col-icon"></div>
              <div className="table-col col-date">Date & Time</div>
              <div className="table-col col-type">Type</div>
              <div className="table-col col-description">Description</div>
              <div className="table-col col-amount">Amount</div>
              <div className="table-col col-status">Status</div>
            </div>

            <div className="table-body">
              {filteredTransactions.map((txn, index) => (
                <motion.div
                  key={txn.id}
                  className="table-row"
                  data-testid={`transaction-row-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="table-col col-icon">
                    {getTransactionIcon(txn.type)}
                  </div>
                  <div className="table-col col-date">
                    {formatDate(txn.timestamp)}
                  </div>
                  <div className="table-col col-type">
                    <span className={`type-badge ${getTransactionColor(txn.type)}`}>
                      {getTransactionType(txn.type)}
                    </span>
                  </div>
                  <div className="table-col col-description">
                    <p className="description-text">{txn.description}</p>
                    {txn.recipientName && (
                      <p className="description-sub text-muted">To: {txn.recipientName}</p>
                    )}
                    {txn.senderName && (
                      <p className="description-sub text-muted">From: {txn.senderName}</p>
                    )}
                  </div>
                  <div className={`table-col col-amount ${getTransactionColor(txn.type)}`}>
                    {(txn.type === 'deposit' || txn.type === 'transfer_in') ? '+' : '-'}
                    {formatCurrency(txn.amount)}
                  </div>
                  <div className="table-col col-status">
                    <span className="status-badge completed">
                      {txn.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <FiDollarSign className="empty-icon" />
            <p className="empty-text">No transactions found</p>
            <p className="text-muted">Try adjusting your filters</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default History;
