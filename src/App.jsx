import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
import BillPay from './pages/user/BillPay';
import Cards from './pages/user/Cards';
import Loan from './pages/user/Loan';
import Settings from './pages/user/Settings';
import TopUp from './pages/user/TopUp';

// Gateway Pages
import MockGateway from './pages/gateway/MockGateway';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';

function App() {
  const [session, setSession] = useState(() => getCurrentSession());

  useEffect(() => {
    // Seed data on first load
    seedData();
  }, []);

  // Listen for session changes so logout propagates instantly
  useEffect(() => {
    const handleSessionChange = () => {
      setSession(getCurrentSession());
    };

    window.addEventListener('storage', handleSessionChange);
    window.addEventListener('session-change', handleSessionChange);

    return () => {
      window.removeEventListener('storage', handleSessionChange);
      window.removeEventListener('session-change', handleSessionChange);
    };
  }, []);

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
        <Route
          path="/bill-pay"
          element={
            <ProtectedRoute>
              <Layout>
                <BillPay />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cards"
          element={
            <ProtectedRoute>
              <Layout>
                <Cards />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/loans"
          element={
            <ProtectedRoute>
              <Layout>
                <Loan />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/top-up"
          element={
            <ProtectedRoute>
              <Layout>
                <TopUp />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Gateway Routes (No Layout) */}
        <Route path="/gateway" element={<MockGateway />} />

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
