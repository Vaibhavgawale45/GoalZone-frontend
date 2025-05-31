// client/src/Pages/auth/ForgotPasswordPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js'; // Your API service

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(''); // For success/error messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      // API call to backend to request password reset link
      await api.post('/auth/forgot-password', { email }); // Endpoint to be created on backend
      setMessage('If an account with that email exists, a password reset link has been sent.');
      setEmail(''); // Clear email field on success
    } catch (err) {
      // Don't reveal if email exists or not usually, but for dev can target specific error
      const errMsg = err.response?.data?.message || 'An error occurred. Please try again.';
      if (errMsg.toLowerCase().includes("user not found")) {
          setMessage('If an account with that email exists, a password reset link has been sent.'); // Generic message
      } else {
           setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot Your Password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            No problem! Enter your email address below and we'll send you a link to reset it.
          </p>
        </div>

        {message && <p className="p-3 bg-green-100 text-green-700 rounded-md text-sm text-center">{message}</p>}
        {error && <p className="p-3 bg-red-100 text-red-700 rounded-md text-sm text-center">{error}</p>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email-address" className="sr-only">Email address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;