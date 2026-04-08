import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DonorDashboard from './pages/DonorDashboard'
import ReceiverDashboard from './pages/ReceiverDashboard'
import AdminDashboard from './pages/AdminDashboard'
import './App.css'
import './pages.css'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'donor') return <Navigate to="/donor" />;
    if (user.role === 'receiver') return <Navigate to="/receiver" />;
    if (user.role === 'admin') return <Navigate to="/admin" />;
  }
  return children;
};

const App = () => {
  const { user } = useAuth();

  const getDefaultRoute = () => {
    if (!user) return '/login';
    if (user.role === 'donor') return '/donor';
    if (user.role === 'receiver') return '/receiver';
    if (user.role === 'admin') return '/admin';
    return '/login';
  };

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={user ? <Navigate to={getDefaultRoute()} /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to={getDefaultRoute()} /> : <RegisterPage />} />
        <Route path="/donor" element={
          <ProtectedRoute allowedRoles={['donor']}>
            <DonorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/receiver" element={
          <ProtectedRoute allowedRoles={['receiver']}>
            <ReceiverDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to={getDefaultRoute()} />} />
      </Routes>
    </>
  );
};

export default App
