import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/Auth/AuthContext';
import { ToastProvider, useToast } from './components/Toast/ToastContext';
import LoginForm from './components/Auth/LoginForm';
import SignupForm from './components/Auth/SignupForm';
import ForgotPasswordForm from './components/Auth/ForgotPasswordForm';
import BreadForm from './components/BreadForm';
import BreadGallery from './components/BreadGallery';
import Navbar from './components/Navbar';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import MessagesPage from './pages/MessagesPage';
import BreadDetailPage from './pages/BreadDetailPage';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Add Bread page
function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Add new bread
  const handleAddBread = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/breads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to add bread');

      await response.json();
      toast.success('Bread added successfully! 🍞');
      // Redirect to user's profile to see the new bread
      navigate(`/profile/${user.id}`);
    } catch (error) {
      console.error('Error adding bread:', error);
      toast.error('Failed to add bread');
      throw error;
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="form-section">
          <BreadForm
            onSubmit={handleAddBread}
            onCancel={null}
            initialData={null}
          />
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/forgot-password" element={<ForgotPasswordForm />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <FeedPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-breads"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:id"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <SearchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bread/:id"
              element={
                <ProtectedRoute>
                  <BreadDetailPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
