import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiArrowRight } from 'react-icons/fi';
import { apiLogin } from '../services/authApi';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiLogin(formData.username, formData.password);

      if (response.success) {
        const user = response.data.user;
        window.dispatchEvent(new Event('session-change'));
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(response.error?.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  // Quick login helpers for testing
  const quickLogin = async (username, password) => {
    setFormData({ username, password });
    setLoading(true);
    try {
      const response = await apiLogin(username, password);
      if (response.success) {
        const user = response.data.user;
        window.dispatchEvent(new Event('session-change'));
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div
        className="auth-card glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-icon-large">VB</div>
          <h1 className="auth-title">VB Bank</h1>
          <p className="auth-subtitle">Secure Banking at Your Fingertips</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form" data-testid="form-login">
          {error && (
            <motion.div
              className="error-message"
              data-testid="alert-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <div className="input-group">
            <label className="input-label">
              <FiUser className="input-icon" />
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your username"
              data-testid="input-username"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <FiLock className="input-icon" />
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your password"
              data-testid="input-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            data-testid="btn-login"
          >
            {loading ? (
              <span>Logging in...</span>
            ) : (
              <>
                <span>Login</span>
                <FiArrowRight />
              </>
            )}
          </button>
        </form>

        {/* Quick Login for Testing */}
        <div className="quick-login">
          <p className="quick-login-title">Quick Login (For Testing)</p>
          <div className="quick-login-buttons">
            <button
              onClick={() => quickLogin('john.doe', 'user123')}
              className="btn-quick-login user"
              data-testid="btn-quick-login-user"
            >
              Login as User
            </button>
            <button
              onClick={() => quickLogin('admin', 'admin123')}
              className="btn-quick-login admin"
              data-testid="btn-quick-login-admin"
            >
              Login as Admin
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link" data-testid="link-register">
              Register here
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Background Decoration */}
      <div className="auth-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
    </div>
  );
};

export default Login;
