import { Navigate } from 'react-router-dom';
import { getCurrentSession, isAdmin } from '../services/authService';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const session = getCurrentSession();

  // Not logged in
  if (!session) {
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
