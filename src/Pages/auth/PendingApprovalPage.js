// client/src/Pages/auth/PendingApprovalPage.js
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js'; // Ensure this path is correct

const PendingApprovalPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is not a coach or is already approved
  useEffect(() => {
    if (user) {
      if (user.role !== 'Coach' || (user.role === 'Coach' && user.isApproved)) {
        // If somehow a non-coach or an approved coach lands here, redirect them
        navigate('/redirect-dashboard', { replace: true });
      }
    } else {
      // If no user, redirect to login (shouldn't happen if routed correctly)
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login page after logout
  };

  if (!user || user.role !== 'Coach' || user.isApproved) {
    // This check is mainly for the initial render before useEffect kicks in,
    // or if the user state changes rapidly.
    // Could show a loading spinner or null.
    return <div className="flex justify-center items-center min-h-screen"><div>Loading status...</div></div>;
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-center p-6 bg-gray-100">
      <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl max-w-lg w-full">
        <svg className="mx-auto h-16 w-16 sm:h-20 sm:w-20 text-yellow-500 mb-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0zM12 9v3.75m0-10.036A11.959 11.959 0 013.598 6H2.75a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h18.5a.75.75 0 00.75-.75V6.75a.75.75 0 00-.75-.75h-.848A11.959 11.959 0 0112 2.964z" />
        </svg>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-4 mb-3">
          Account Pending Approval
        </h1>
        <p className="text-gray-600 mb-2 text-sm sm:text-base">
          Thank you for registering as a Coach, <span className="font-semibold">{user.name}</span>!
        </p>
        <p className="text-gray-600 mb-2 text-sm sm:text-base">
          Your account for <span className="font-semibold">{user.clubNameRegistered || "your club"}</span> is currently awaiting approval from an administrator.
        </p>
        <p className="text-gray-600 mb-8 text-sm sm:text-base">
          You will be notified (or you can check back later) once your account is approved. You can then log in to access your coach dashboard.
        </p>
        <div className="space-y-3 sm:space-y-0 sm:flex sm:space-x-4 justify-center">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
          >
            Go to Homepage
          </Link>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
          >
            Logout & Sign In Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;