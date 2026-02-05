import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getCurrentSession } from './services/authService';
import { seedData } from './utils/seeder';

// Layout
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// User Pages
import Dashboard from './pages/user/Dashboard';
import Transfer from './pages/user/Transfer';
import History from './pages/user/History';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';

function App() {
  useEffect(() => {
    // Seed data on first load
    seedData();
  }, []);

  const session = getCurrentSession();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            session ? (
              <Navigate to={session.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/register"
          element={
            session ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register />
            )
          }
        />

        {/* User Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfer"
          element={
            <ProtectedRoute>
              <Layout>
                <Transfer />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <Layout>
                <History />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Layout>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route
          path="/"
          element={
            session ? (
              <Navigate
                to={session.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
