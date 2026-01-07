import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import Header from './components/layout/Header.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CreatePoll from './pages/CreatePoll.jsx';
import PollDetail from './pages/PollDetail.jsx';
import FormDetail from './pages/FormDetail';
import FormResponses from './pages/FormResponses';
import LoadingSpinner from "./components/common/LoadingSpinner.jsx";
import './styles/app.scss';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? (
    <>
      <Header />
      {children}
    </>
  ) : (
    <Navigate to="/login" />
  );
};

// Public Route Component (redirect if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

// Public Form Route (no authentication required)
const PublicFormRoute = ({ children }) => {
  return (
    <>
      <Header />
      {children}
    </>
  );
};

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-soft)' }}>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/polls/create"
            element={
              <ProtectedRoute>
                <CreatePoll />
              </ProtectedRoute>
            }
          />
          <Route
            path="/polls/:pollId"
            element={
              <ProtectedRoute>
                <PollDetail />
              </ProtectedRoute>
            }
          />
          
          {/* Form Routes */}
          <Route
            path="/forms/:id"
            element={
              <PublicFormRoute>
                <FormDetail />
              </PublicFormRoute>
            }
          />
          <Route
            path="/forms/:id/responses"
            element={
              <ProtectedRoute>
                <FormResponses />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--bg-white)',
                color: 'var(--text-primary)',
                border: '1px solid var(--secondary-100)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                padding: 'var(--space-4) var(--space-6)',
                fontSize: 'var(--text-sm)',
              },
              success: {
                iconTheme: {
                  primary: 'var(--success)',
                  secondary: 'white',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--error)',
                  secondary: 'white',
                },
              },
            }}
          />
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;