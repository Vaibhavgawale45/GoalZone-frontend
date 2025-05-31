// client/src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import AdminManageUsersPage from "./Pages/admin/AdminManageUsersPage.js";
import AdminManageClubsPage from "./Pages/admin/AdminManageClubsPage.js";
import UserProfilePage from './Pages/UserProfilePage.js';
import ForgotPasswordPage from './Pages/auth/ForgotPasswordPage.js'; // Create this page
import ResetPasswordPage from './Pages/auth/ResetPasswordPage.js';
import { ToastContainer, toast } from 'react-toastify'; // Import toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css';

// Layout Components
import Navbar from "./components/layouts/Navbar.js";
// import Footer from './components/layout/Footer.js'; // Optional

// Page Components (using capital 'P' for the Pages folder)
import HomePage from "./Pages/HomePage.js";
import ClubDetailPage from "./Pages/ClubDetailPage.js";

// Auth Page Components
import CombinedLoginPage from "./Pages/auth/CombinedLoginPage.js";
import AdminLoginPage from "./Pages/auth/AdminLoginPage.js";
import RegisterPage from "./Pages/auth/RegisterPage.js";
import PendingApprovalPage from "./Pages/auth/PendingApprovalPage.js";
// import ForgotPasswordPage from './Pages/auth/ForgotPasswordPage.js'; // Example for future
// import ResetPasswordPage from './Pages/auth/ResetPasswordPage.js';   // Example for future

// Dashboard Page Components
import PlayerDashboardPage from "./Pages/dashboards/PlayerDashboardPage.js";
import CoachDashboardPage from "./Pages/dashboards/CoachDashboardPage.js";
import AdminDashboardPage from "./Pages/dashboards/AdminDashboardPage.js";

// Utility & Other Pages
import NotFoundPage from "./Pages/NotFoundPage.js";
import UnauthorizedPage from "./Pages/UnauthorizedPage.js";

// Auth Context & Protected Route
import { AuthProvider, useAuth } from "./contexts/AuthContext.js";
import ProtectedRoute from "./Pages/auth/ProtectedRoute.js";

// Component to handle redirection after login based on role
const PostLoginRedirect = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex-center-screen"><div className="spinner"></div><p className="loading-text">Authenticating...</p></div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.state?.from }} replace />;
  }

  const intendedDestination = location.state?.from?.pathname;

  if (user.role === 'Admin') {
    return <Navigate to={intendedDestination && intendedDestination.startsWith('/admin') ? intendedDestination : "/admin/dashboard"} replace />;
  }
  if (user.role === 'Coach') {
    if (user.isApproved) {
      if (user.managedClub && user.managedClub._id) {
        // --- MODIFICATION FOR COACH ---
        // Redirect to their managed club's detail page
        const coachClubPath = `/club/${user.managedClub._id}`;
        return <Navigate to={intendedDestination && intendedDestination.startsWith('/club/') ? intendedDestination : coachClubPath} replace />;
      } else {
        // Coach is approved but has no managed club (e.g., admin needs to assign one after approval of user, but not club)
        // Send them to their generic coach dashboard or a page indicating no club is assigned.
        console.warn("Coach is approved but has no managedClub ID. Redirecting to /coach/dashboard for now.");
        return <Navigate to={intendedDestination && intendedDestination.startsWith('/coach') ? intendedDestination : "/coach/dashboard"} replace />;
      }
    } else {
      return <Navigate to="/pending-approval" replace />;
    }
  }
  if (user.role === 'Player') {
    return <Navigate to={intendedDestination && intendedDestination.startsWith('/player') ? intendedDestination : "/player/dashboard"} replace />;
  }

  return <Navigate to="/" replace />; // Fallback
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/club/:clubId" element={<ClubDetailPage />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<CombinedLoginPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* New */}
              <Route path="/reset-password/:resetToken" element={<ResetPasswordPage />} /> {/* New */}

              <Route
                path="/redirect-dashboard"
                element={<PostLoginRedirect />}
              />
              <Route
                path="/pending-approval"
                element={<PendingApprovalPage />}
              />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["Admin"]}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route // This route was a placeholder, now covered by the dashboard or specific pages
                path="/admin/coaches/approval" // You might remove this if dashboard is sufficient
                element={
                  <ProtectedRoute allowedRoles={["Admin"]}>
                    {/* Redirect to dashboard or remove if dashboard section is used */}
                    <Navigate to="/admin/dashboard" replace />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/manage-users" // New route
                element={
                  <ProtectedRoute allowedRoles={["Admin"]}>
                    <AdminManageUsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/manage-clubs" // New route
                element={
                  <ProtectedRoute allowedRoles={["Admin"]}>
                    <AdminManageClubsPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Player Routes */}
              <Route
                path="/player/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["Player"]}>
                    <PlayerDashboardPage />
                  </ProtectedRoute>
                }
              />
              {/* Add more player-specific protected routes here */}

              {/* Protected Coach Routes */}
              <Route
                path="/coach/dashboard"
                element={
                  /* CoachDashboardPage route */
                  <ProtectedRoute
                    allowedRoles={["Coach"]}
                    requiresApproval={true}
                  >
                    <CoachDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/coach/profile"
                element={
                  <ProtectedRoute allowedRoles={["Coach"]}>
                    <div>Coach Profile Page (Placeholder)</div>
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["Admin"]}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/coaches/approval"
                element={
                  <ProtectedRoute allowedRoles={["Admin"]}>
                    <div>
                      Admin Coach Approval Page (Placeholder from previous plan)
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['Player', 'Coach', 'Admin']}> {/* All logged-in roles can see their profile */}
                    <UserProfilePage />
                  </ProtectedRoute>
                }
              />
              {/* Add other admin routes */}

              {/* Catch-all Not Found Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <ToastContainer
            position="top-right" // Or "bottom-right", "top-center", etc.
            autoClose={5000}     // Auto close toasts after 5 seconds
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light" // Or "dark", "colored"
            // transition: Bounce, // Optional: specify transition
          />
          {/* <Footer /> Optional */}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
