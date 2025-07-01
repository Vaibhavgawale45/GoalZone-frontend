// client/src/Pages/auth/ResetPasswordPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api.js'; // Your API service

const ResetPasswordPage = () => {
  const { resetToken } = useParams(); // Get token from URL
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null); // null: unknown, true: valid, false: invalid

  // Optional: Validate token on page load
  useEffect(() => {
    const verifyToken = async () => {
      if (!resetToken) {
        setError('Invalid or missing reset token.');
        setTokenValid(false);
        return;
      }
      // setLoading(true); // Consider a loading state for token verification
      try {
        // Example: Backend endpoint to verify token validity without resetting password yet
        // For now, we'll assume token is valid until submission.
        // If you have a verify endpoint:
        // await api.get(`/auth/verify-reset-token/${resetToken}`);
        setTokenValid(true);
      } catch (err) {
        setError('This password reset token is invalid or has expired.');
        setTokenValid(false);
      } finally {
        // setLoading(false);
      }
    };
    verifyToken();
  }, [resetToken]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      // API call to backend to reset the password using the token
      await api.patch(`/auth/reset-password/${resetToken}`, { password });
      setMessage('Your password has been reset successfully! You can now log in with your new password.');
      setPassword('');
      setConfirmPassword('');
      // Optionally redirect to login after a delay
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The token might be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === false && error) { // If token known to be invalid from initial check
    return (
        <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center">
                <h2 className="mt-6 text-3xl font-extrabold text-red-600">Invalid Link</h2>
                <p className="mt-2 text-gray-600">{error}</p>
                <Link to="/forgot-password" className="mt-4 inline-block btn-primary">Request a new link</Link>
            </div>
        </div>
    );
  }


  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h2>
        </div>

        {message && <p className="p-3 bg-green-100 text-green-700 rounded-md text-sm text-center">{message}</p>}
        {error && <p className="p-3 bg-red-100 text-red-700 rounded-md text-sm text-center">{error}</p>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password_reset" className="label-style">New Password</label>
            <input
              id="password_reset"
              name="password"
              type="password"
              required
              className="input-style mt-1"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || tokenValid === false}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword_reset" className="label-style">Confirm New Password</label>
            <input
              id="confirmPassword_reset"
              name="confirmPassword"
              type="password"
              required
              className="input-style mt-1"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading || tokenValid === false}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || tokenValid === false}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Back to Login
          </Link>
        </div>
      </div>
      {/* Include styles for btn-primary, input-style, label-style or ensure they are global */}
      <style jsx global>{`
        .input-style { @apply appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm; }
        .label-style { @apply block text-sm font-medium text-gray-700; }
        .btn-primary { @apply group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400; }
      `}</style>
    </div>
  );
};

export default ResetPasswordPage;