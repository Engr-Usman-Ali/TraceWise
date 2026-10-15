
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import DashboardPage from './pages/DashboardPage';
import DeptPage from './pages/DeptPage';

import ToastContainer from './components/ui/ToastContainer';
import './styles/globals.css';

const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Email verification page */}
        <Route
          path="/verify-email"
          element={<VerifyEmailPage />}
        />

        {/* Owner dashboard — role: owner */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute requiredRole="owner">
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Department portal — role: department_member */}
        <Route
          path="/dept/*"
          element={
            <ProtectedRoute requiredRole="department_member">
              <DeptPage />
            </ProtectedRoute>
          }
        />

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
