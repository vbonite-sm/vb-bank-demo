import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiMail, FiCalendar, FiDollarSign, FiUser, FiX } from 'react-icons/fi';
import { getAllUsers, getUserDetails, searchUsersAdmin } from '../../services/adminService';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applySearch();
  }, [searchTerm, users]);

  const loadUsers = () => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
    setFilteredUsers(allUsers);
  };

  const applySearch = () => {
    if (searchTerm) {
      const results = searchUsersAdmin(searchTerm);
      setFilteredUsers(results);
    } else {
      setFilteredUsers(users);
    }
  };

  const viewUserDetails = (userId) => {
    const details = getUserDetails(userId);
    setUserDetails(details);
    setSelectedUser(userId);
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
    setUserDetails(null);
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
      year: 'numeric'
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

  const getTransactionType = (type) => {
    const typeMap = {
      'deposit': 'Deposit',
      'withdrawal': 'Withdrawal',
      'transfer': 'Transfer Out',
      'transfer_out': 'Transfer Out',
      'transfer_in': 'Transfer In'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="user-management">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p className="text-muted">View and manage all user accounts</p>
        </div>
      </div>

      {/* Search Bar */}
      <motion.div
        className="search-card glass-card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            placeholder="Search by name, username, email, or account number..."
            data-testid="input-search-users"
          />
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        className="users-card glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="users-header">
          <h3>All Users ({filteredUsers.length})</h3>
        </div>

        {filteredUsers.length > 0 ? (
          <div className="users-table">
            <div className="table-header">
              <div className="table-col col-user">User</div>
              <div className="table-col col-email">Email</div>
              <div className="table-col col-account">Account Number</div>
              <div className="table-col col-balance">Balance</div>
              <div className="table-col col-created">Created</div>
              <div className="table-col col-actions">Actions</div>
            </div>

            <div className="table-body">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  className="table-row"
                  data-testid={`user-row-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="table-col col-user">
                    <div className="user-cell">
                      <div className="user-avatar-small">
                        {user.fullName.charAt(0)}
                      </div>
                      <div className="user-info">
                        <p className="user-name">{user.fullName}</p>
                        <p className="user-username text-muted">@{user.username}</p>
                      </div>
                    </div>
                  </div>
                  <div className="table-col col-email">
                    <FiMail className="col-icon" />
                    {user.email}
                  </div>
                  <div className="table-col col-account">
                    {user.accountNumber}
                  </div>
                  <div className="table-col col-balance">
                    <span className={user.balance > 0 ? 'balance-positive' : ''}>
                      {formatCurrency(user.balance)}
                    </span>
                  </div>
                  <div className="table-col col-created text-muted">
                    <FiCalendar className="col-icon" />
                    {formatDate(user.createdAt)}
                  </div>
                  <div className="table-col col-actions">
                    <button
                      onClick={() => viewUserDetails(user.id)}
                      className="btn-view"
                      data-testid={`btn-view-user-${index}`}
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <FiUser className="empty-icon" />
            <p className="empty-text">No users found</p>
            <p className="text-muted">Try adjusting your search</p>
          </div>
        )}
      </motion.div>

      {/* User Details Modal */}
      {userDetails && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={closeUserDetails}
          data-testid="user-details-modal"
        >
          <motion.div
            className="modal-content glass-card"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>User Details</h2>
              <button onClick={closeUserDetails} className="close-btn" data-testid="btn-close-modal">
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              {/* User Info Section */}
              <div className="detail-section">
                <div className="user-header-info">
                  <div className="user-avatar-large">
                    {userDetails.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3>{userDetails.fullName}</h3>
                    <p className="text-muted">@{userDetails.username}</p>
                  </div>
                </div>

                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{userDetails.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Account Number:</span>
                    <span className="detail-value">{userDetails.accountNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Balance:</span>
                    <span className="detail-value balance-large">
                      {formatCurrency(userDetails.balance)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">{formatDate(userDetails.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Transactions:</span>
                    <span className="detail-value">{userDetails.transactionCount}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Currency:</span>
                    <span className="detail-value">{userDetails.currency}</span>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="detail-section">
                <h4>Recent Transactions</h4>
                {userDetails.transactions && userDetails.transactions.length > 0 ? (
                  <div className="transactions-list-modal">
                    {userDetails.transactions.map((txn, index) => (
                      <div key={txn.id} className="transaction-item-modal" data-testid={`modal-transaction-${index}`}>
                        <div className="transaction-info-modal">
                          <p className="transaction-type">
                            {getTransactionType(txn.type)}
                          </p>
                          <p className="transaction-desc">{txn.description}</p>
                          <p className="transaction-date text-muted">
                            {formatFullDate(txn.timestamp)}
                          </p>
                        </div>
                        <div className={`transaction-amount ${txn.type === 'deposit' || txn.type === 'transfer_in' ? 'positive' : 'negative'}`}>
                          {(txn.type === 'deposit' || txn.type === 'transfer_in') ? '+' : '-'}
                          {formatCurrency(txn.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No transactions yet</p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default UserManagement;
