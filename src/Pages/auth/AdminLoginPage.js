// client/src/pages/auth/AdminLoginPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js'; // Adjust path as needed

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, logout } = useAuth(); // Added logout for safety
  const navigate = useNavigate();
  const location = useLocation();

  // Determine where to redirect after login
  const from = location.state?.from?.pathname || '/admin/dashboard';

  // Redirect if admin is already logged in, or if a non-admin user stumbles here
  useEffect(() => {
    if (user) {
      if (user.role === 'Admin') {
        navigate(from, { replace: true });
      } else {
        // If a non-admin user is logged in and lands on admin login, redirect them away
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(email, password); // login now returns user data
      if (loggedInUser.role === 'Admin') {
        navigate(from, { replace: true }); // Redirect to admin dashboard or intended admin page
      } else {
        // This case should ideally not happen if backend only issues tokens to valid users,
        // but as a safeguard: if a non-admin token somehow gets through.
        setError('Access Denied. This portal is for Administrators only.');
        // Log out the non-admin user who tried to use the admin portal
        logout();
      }
    } catch (err) {
      setError(err.message || 'Admin login failed. Please check credentials and ensure you are an Administrator.');
      console.error("Admin login page error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center bg-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Administrator Login
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
              <p className="text-sm text-center">{error}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="admin-email-address" className="sr-only">Email address</label>
              <input
                id="admin-email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Admin Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="sr-only">Password</label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    {/* SVG spinner (same as above) */}
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in as Admin...
                </>
              ) : (
                'Sign in as Admin'
              )}
            </button>
          </div>
        </form>
        <div className="text-sm text-center mt-4">
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Are you a Player or Coach?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;