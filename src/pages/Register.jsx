import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiMail, FiUserPlus } from 'react-icons/fi';
import { apiRegister } from '../services/authApi';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiRegister({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      if (response.success) {
        // Auto-login and navigate to dashboard
        window.dispatchEvent(new Event('session-change'));
        navigate('/dashboard');
      } else {
        setError(response.error?.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration');
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
          <h1 className="auth-title">Join VB Bank</h1>
          <p className="auth-subtitle">Create your account and start banking</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="auth-form">
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
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your full name"
              data-testid="input-fullname"
              required
            />
          </div>

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
              placeholder="Choose a username"
              data-testid="input-username"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <FiMail className="input-icon" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your email"
              data-testid="input-email"
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
              placeholder="Create a password"
              data-testid="input-password"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <FiLock className="input-icon" />
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input-field"
              placeholder="Confirm your password"
              data-testid="input-confirm-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            data-testid="btn-register"
            disabled={loading}
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Create Account</span>
                <FiUserPlus />
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link" data-testid="link-login">
              Login here
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

export default Register;
