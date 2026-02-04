import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

function VerifyEmailForm({ email }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const { setAuthData } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Verification failed');
        return;
      }

      const data = await response.json();
      setAuthData(data.token, data.user);
      navigate('/');
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
        body: JSON.stringify({ email, type: 'email_verification' })
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

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify Your Email</h2>
        <p className="auth-subtitle">We sent a code to <strong>{email}</strong></p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          {resendMessage && <div className="success-message">{resendMessage}</div>}

          <div className="form-group">
            <label htmlFor="code">Verification Code</label>
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

          <button type="submit" disabled={loading || code.length < 6} className="auth-button">
            {loading ? 'Verifying...' : 'Verify'}
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

export default VerifyEmailForm;
