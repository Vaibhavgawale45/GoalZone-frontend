// client/src/components/auth/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js'; // Ensure this path is correct

const ProtectedRoute = ({ children, allowedRoles, requiresApproval = false }) => {
  const { user, loading: authLoading } = useAuth(); // Get user and loading state from AuthContext
  const location = useLocation(); // To preserve the intended destination

  if (authLoading) {
    // Show a loading indicator while authentication status is being determined
    // This prevents a flicker or premature redirect before user state is known
    return (
      <div className="flex justify-center items-center min-h-screen">
        {/* You can use a more sophisticated spinner component here */}
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
        <p className="ml-4 text-lg text-gray-700">Loading authentication...</p>
      </div>
    );
  }

  if (!user) {
    // User is not logged in, redirect them to the login page.
    // Pass the current location in state so they can be redirected back after login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User is logged in, but their role is not in the allowedRoles array for this route.
    // Redirect them to an unauthorized page.
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Specific check for coaches needing approval for certain routes
  if (user.role === 'Coach' && requiresApproval && !user.isApproved) {
    // Coach is trying to access a route that requires approval, but they are not approved yet.
    return <Navigate to="/pending-approval" state={{ from: location }} replace />;
  }

  // If all checks pass, render the children components (the actual protected page content)
  return children;
};

export default ProtectedRoute;