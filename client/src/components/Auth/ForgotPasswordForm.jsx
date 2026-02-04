import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ForgotPasswordForm() {
  const [step, setStep] = useState('email'); // 'email' | 'code' | 'success'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Something went wrong');
        return;
      }

      // Always move to code step — don't reveal whether email exists
      setStep('code');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Reset failed');
        return;
      }

      setStep('success');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage('');
    setError('');

    try {
      const response = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'password_reset' })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to resend');
        return;
      }

      setResendMessage('Code resent! Check your email.');
    } catch (err) {
      setError('Failed to resend code.');
    } finally {
      setResendLoading(false);
    }
  };

  // Step 1: Enter email
  if (step === 'email') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Reset Password</h2>
          <p className="auth-subtitle">Enter your email to receive a reset code</p>

          <form onSubmit={handleEmailSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Sending...' : 'Send Code'}
            </button>
          </form>

          <p className="auth-footer">
            <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
              Back to login
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Enter code + new password
  if (step === 'code') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Enter Reset Code</h2>
          <p className="auth-subtitle">Enter the code sent to <strong>{email}</strong></p>

          <form onSubmit={handleCodeSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            {resendMessage && <div className="success-message">{resendMessage}</div>}

            <div className="form-group">
              <label htmlFor="code">Reset Code</label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                required
                autoFocus
                autoComplete="one-time-code"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <small>At least 6 characters</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <p className="auth-footer">
            Didn't receive the code?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); handleResend(); }}>
              {resendLoading ? 'Sending...' : 'Resend code'}
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Step 3: Success
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Password Reset!</h2>
        <p className="auth-subtitle">Your password has been updated successfully.</p>

        <div className="auth-form">
          <button
            onClick={() => navigate('/login')}
            className="auth-button"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordForm;
