import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiSend, FiClock, FiUsers, FiBarChart2, FiLogOut, FiMenu, FiX, FiCreditCard, FiDollarSign, FiFileText, FiSettings, FiPlusCircle } from 'react-icons/fi';
import { getCurrentSession, logout } from '../services/authService';
import BuggyToggle from './BuggyToggle';
import './Layout.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getCurrentSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    // Dispatch a custom event so App picks up the session change immediately
    window.dispatchEvent(new Event('session-change'));
    navigate('/login');
  };

  const isAdmin = session?.role === 'admin';

  const userNavItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/transfer', icon: FiSend, label: 'Transfer' },
    { path: '/history', icon: FiClock, label: 'History' },
    { path: '/bill-pay', icon: FiFileText, label: 'Bills Payment' },
    { path: '/cards', icon: FiCreditCard, label: 'Cards' },
    { path: '/loans', icon: FiDollarSign, label: 'Loans' },
    { path: '/top-up', icon: FiPlusCircle, label: 'Top Up' },
    { path: '/settings', icon: FiSettings, label: 'Settings' }
  ];

  const adminNavItems = [
    { path: '/admin/dashboard', icon: FiBarChart2, label: 'Dashboard' },
    { path: '/admin/users', icon: FiUsers, label: 'User Management' }
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <div className="layout">
      {/* Sidebar */}
      <motion.aside
        className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">VB</div>
            {sidebarOpen && <span className="logo-text">VB Bank</span>}
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="nav-icon" />
                {sidebarOpen && <span className="nav-label">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="nav-item logout-btn"
            data-testid="btn-logout"
          >
            <FiLogOut className="nav-icon" />
            {sidebarOpen && <span className="nav-label">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="topbar">
          <button
            className="sidebar-toggle"
            data-testid="btn-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>

          <div className="topbar-right">
            <div className="user-info">
              <div className="user-avatar">
                {session?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="user-details">
                <div className="user-name">{session?.fullName}</div>
                <div className="user-role">{session?.role === 'admin' ? 'Administrator' : 'User'}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>

        {/* Buggy Toggle (only for users, not admins) */}
        {!isAdmin && <BuggyToggle />}
      </div>
    </div>
  );
};

export default Layout;
