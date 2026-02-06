import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentSession, isAdmin } from '../services/authService';
import { validateAccessToken, getAccessToken, refreshAccessToken } from '../services/tokenService';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const location = useLocation();
  const [authState, setAuthState] = useState('checking'); // 'checking' | 'authenticated' | 'unauthenticated'

  useEffect(() => {
    const checkAuth = () => {
      const session = getCurrentSession();

      // Not logged in at all
      if (!session) {
        setAuthState('unauthenticated');
        return;
      }

      // Validate the access token
      const token = getAccessToken();
      const tokenResult = validateAccessToken(token);

      if (!tokenResult.valid) {
        if (tokenResult.expired) {
          // Attempt silent refresh
          const refreshed = refreshAccessToken();
          if (!refreshed) {
            setAuthState('unauthenticated');
            return;
          }
        } else {
          setAuthState('unauthenticated');
          return;
        }
      }

      setAuthState('authenticated');
    };

    checkAuth();
  }, [location.pathname]);

  // Still checking — render nothing briefly
  if (authState === 'checking') {
    return null;
  }

  // Not authenticated — redirect to login
  if (authState === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin (when admin is required)
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  // Logged in as admin but trying to access user routes
  if (!requireAdmin && isAdmin()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
