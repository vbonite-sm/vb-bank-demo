import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiCheckCircle, FiAlertCircle, FiSave } from 'react-icons/fi';
import { getCurrentSession } from '../../services/authService';
import { apiUpdateProfile, apiChangePassword, apiGetUserProfile } from '../../services/bankApi';
import { useBuggy } from '../../context/BuggyContext';
import './Settings.css';

const Settings = () => {
  const session = getCurrentSession();
  const { buggyOperation } = useBuggy();

  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);

  // Profile form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [driversLicense, setDriversLicense] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const response = await apiGetUserProfile(session.userId);
    if (response.success) {
      const currentUser = response.data;
      setUser(currentUser);
      setFullName(currentUser.fullName || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setPassportNumber(currentUser.passportNumber || '');
      setDriversLicense(currentUser.driversLicense || '');
      setDateOfBirth(currentUser.dateOfBirth || '');
      setStreet(currentUser.address?.street || '');
      setCity(currentUser.address?.city || '');
      setState(currentUser.address?.state || '');
      setZip(currentUser.address?.zip || '');
      setCountry(currentUser.address?.country || '');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await buggyOperation(async () => {
        const response = await apiUpdateProfile(session.userId, {
          fullName,
          email,
          phone,
          passportNumber,
          driversLicense,
          dateOfBirth,
          address: {
            street,
            city,
            state,
            zip,
            country
          }
        });

        if (response.success) {
          setSuccess('Profile updated successfully!');
          loadUserData();
        } else {
          setError(response.error?.message || 'Update failed');
        }
      });
    } catch (err) {
      setError(err.message || 'An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await buggyOperation(async () => {
        const response = await apiChangePassword(session.userId, currentPassword, newPassword);

        if (response.success) {
          setSuccess('Password changed successfully!');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          setError(response.error?.message || 'Password change failed');
        }
      });
    } catch (err) {
      setError(err.message || 'An error occurred while changing password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Settings</h1>
        <p>Manage your account settings and personal information</p>
      </motion.div>

      {(error || success) && (
        <motion.div
          className={`alert ${error ? 'alert-error' : 'alert-success'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          data-testid={error ? 'alert-error' : 'alert-success'}
        >
          {error ? <FiAlertCircle /> : <FiCheckCircle />}
          <span>{error || success}</span>
        </motion.div>
      )}

      <div className="settings-layout">
        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
            data-testid="tab-profile"
          >
            <FiUser />
            Profile & PII
          </button>
          <button
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
            data-testid="tab-password"
          >
            <FiLock />
            Change Password
          </button>
        </div>

        <motion.div
          className="settings-content"
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="settings-form">
              <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name *</label>
                    <input
                      type="text"
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      data-testid="input-fullname"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dateOfBirth">Date of Birth</label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      data-testid="input-dob"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      data-testid="input-email"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      data-testid="input-phone"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Identity Documents</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="passport">Passport Number</label>
                    <input
                      type="text"
                      id="passport"
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                      data-testid="input-passport"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="license">Driver's License</label>
                    <input
                      type="text"
                      id="license"
                      value={driversLicense}
                      onChange={(e) => setDriversLicense(e.target.value)}
                      data-testid="input-license"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Address</h3>
                <div className="form-group">
                  <label htmlFor="street">Street Address</label>
                  <input
                    type="text"
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    data-testid="input-street"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      data-testid="input-city"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <input
                      type="text"
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      data-testid="input-state"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="zip">ZIP Code</label>
                    <input
                      type="text"
                      id="zip"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      data-testid="input-zip"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <input
                      type="text"
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      data-testid="input-country"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                data-testid="btn-save-profile"
              >
                <FiSave />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} className="settings-form">
              <div className="form-section">
                <h3>Change Password</h3>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password *</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    data-testid="input-current-password"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="newPassword">New Password *</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    data-testid="input-new-password"
                    required
                  />
                  <span className="form-hint">Minimum 6 characters</span>
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    data-testid="input-confirm-password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                data-testid="btn-change-password"
              >
                <FiLock />
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
