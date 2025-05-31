// client/src/components/layout/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  let dashboardPath = "/redirect-dashboard"; 
  if (user) {
    if (user.role === 'Coach') {
      if (user.isApproved && user.managedClub && user.managedClub._id) {
        dashboardPath = `/club/${user.managedClub._id}`;
      } else if (user.isApproved && (!user.managedClub || !user.managedClub._id)) {
        dashboardPath = "/coach/dashboard"; 
      } else if (!user.isApproved) {
        dashboardPath = "/pending-approval";
      }
    } else if (user.role === 'Player') {
      dashboardPath = "/player/dashboard";
    } else if (user.role === 'Admin') {
      dashboardPath = "/admin/dashboard";
    }
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 print:hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            to="/" 
            className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-sm transition-colors"
            aria-label="ClubFinder Home"
          >
            ClubFinder
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {user ? (
              <>
                <span className="hidden sm:inline text-gray-700 text-sm font-medium mr-1 sm:mr-2 select-none">
                  Welcome, {user.name}!
                </span>
                <Link to={dashboardPath} className="nav-link">
                  My Dashboard
                </Link>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                {/* <Link to="/admin/login" className="nav-link-secondary"> Admin Login </Link> */}
                <Link to="/register" className="btn-primary-nav">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Styles for Navbar elements - For better organization, move to a global CSS file */}
      <style jsx global>{`
        .nav-link {
          @apply text-gray-600 hover:text-indigo-600 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1;
        }
        /* Example for a secondary link if needed, like Admin Login if kept separate */
        .nav-link-secondary {
          @apply text-gray-500 hover:text-indigo-500 px-2 sm:px-3 py-2 rounded-md text-xs font-medium sm:text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1;
        }
        
        /* Primary action button style (e.g., Register) */
        .btn-primary-nav {
          @apply ml-1 sm:ml-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150;
        }
        .btn-primary-nav:active {
            @apply bg-indigo-800;
        }

        /* Logout button style */
        .btn-logout {
          @apply ml-1 sm:ml-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150;
        }
        .btn-logout:active {
            @apply bg-red-700;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;