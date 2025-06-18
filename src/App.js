// client/src/App.js
import {useEffect} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Navbar from "./components/layouts/Navbar.js";
import ClubPageSidebar from "./components/layouts/ClubPageSidebar.js";
import ReelsPage from "./Pages/ReelsPage.js";
import AboutPage from "./Pages/AboutPage.js";
import ContactUs from "./Pages/ContactUs.js"
import HomePage from "./Pages/HomePage.js";
import ClubDashboard from "./Pages/dashboards/ClubDashboard.js";
import CoachLayout from "./components/layouts/CoachLayout.js";
import UserProfilePage from './Pages/UserProfilePage.js';
import NotFoundPage from "./Pages/NotFoundPage.js";
import UnauthorizedPage from "./Pages/UnauthorizedPage.js";
import PlayerDetailPage from "./Pages/PlayerDetailPage.js";
import ClubDetailPage from "./Pages/ClubDetailPage.js";

// Auth Pages
import CombinedLoginPage from "./Pages/auth/CombinedLoginPage.js";
import AdminLoginPage from "./Pages/auth/AdminLoginPage.js";
import RegisterPage from "./Pages/auth/RegisterPage.js";
import ForgotPasswordPage from './Pages/auth/ForgotPasswordPage.js';
import ResetPasswordPage from './Pages/auth/ResetPasswordPage.js';
import PendingApprovalPage from "./Pages/auth/PendingApprovalPage.js";
import CoachSendClubNotificationPage from "./Pages/dashboards/coach/CoachSendClubNotificationPage.js";
import CoachClubSettingsPage from "./Pages/dashboards/coach/CoachClubSettingsPage.js"

// Dashboard Pages
import PlayerDashboardPage from "./Pages/dashboards/PlayerDashboardPage.js";

// Admin Specific Pages
import AdminDashboardPage from "./Pages/dashboards/AdminDashboardPage.js"; 
import AdminManageUsersPage from "./Pages/admin/AdminManageUsersPage.js";
import FeedbackListPage from "./Pages/admin/FeedbackListPage.js";
import AdminLayout from "./components/layouts/AdminLayout.js"; 
import AdminManageClubsExtendedPage from "./Pages/admin/AdminManageClubsExtendedPage.js";
import AdminManagePlayersPage from "./Pages/admin/AdminManagePlayersPage.js";
import AdminReelsPage from "./Pages/admin/AdminReelsPage.js";
import AdminTournamentsPage from "./Pages/admin/AdminTournamentsPage.js";

// Coach Specific Pages
import ManagePlayersPage from "./Pages/dashboards/coach/ManagePlayersPage.js";

// Contexts and Protected Routes
import { AuthProvider, useAuth } from "./contexts/AuthContext.js";
import ProtectedRoute from "./Pages/auth/ProtectedRoute.js";
import ClubListing from "./Pages/ClubListing.js";
import Footer from "./components/layouts/Footer.js";
import AdminSendNotificationPage from "./Pages/admin/AdminSendNotificationPage.js";
import PlatformSettings from "./Pages/admin/PlatformSettings.js";
import CoachPayoutSettings from "./components/coach/CoachPayoutSettings.js";
import CoachPaymentsDashboard from "./Pages/dashboards/coach/CoachPaymentsDashboard.js";


const PostLoginRedirect = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // ... (loading and !user checks remain the same) ...
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-600"></div><p className="ml-3 text-slate-700">Authenticating...</p></div>;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location.state?.from }} replace />;
  }

  const intendedPath = location.state?.from?.pathname;
  const intendedSearch = location.state?.from?.search;
  const intendedDestination = intendedPath ? `${intendedPath}${intendedSearch || ''}` : null;

  if (user.role === 'Admin') {
    return <Navigate to={intendedDestination && intendedDestination.startsWith('/admin') ? intendedDestination : "/admin/dashboard"} replace />;
  }
  if (user.role === 'Coach') {
    if (user.isApproved) {
      if (user.managedClub && user.managedClub._id) {
        // --- CHANGED LINE ---
        // Ensure redirect points to the route that renders ClubDetailPage for the coach's dashboard view
        const coachClubDashboardPath = `/club/${user.managedClub._id}/dashboard`; 
        
        const canGoToIntended = intendedDestination && 
                                (intendedDestination.startsWith(`/club/${user.managedClub._id}`) || 
                                 intendedDestination.startsWith(`/coach/club/${user.managedClub._id}`));
        return <Navigate to={canGoToIntended ? intendedDestination : coachClubDashboardPath} replace />;
      } else {
        return <Navigate to={intendedDestination && intendedDestination.startsWith('/coach') ? intendedDestination : "/coach/dashboard"} replace />;
      }
    } else {
      return <Navigate to="/pending-approval" replace />;
    }
  }
  if (user.role === 'Player') {
    return <Navigate to={intendedDestination && (intendedDestination.startsWith('/player') || intendedDestination.startsWith('/club/') || intendedDestination.startsWith('/clubs')) ? intendedDestination : "/player/dashboard"} replace />;
  }
  return <Navigate to="/" replace />;
};

const MainContentWrapper = ({ children }) => {
  return (
    <main className="flex-grow container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {children}
    </main>
  );
};

// --- App Component ---
function App({registerPushNotifications}) {
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user && registerPushNotifications) {
      if (Notification.permission !== 'denied') {
         console.log("[App.js] User authenticated, calling registerPushNotifications from App.");
         registerPushNotifications();
      } else {
        console.log("[App.js] Push notification permission was previously denied.");
      }
    }
  }, [user, authLoading, registerPushNotifications]);
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-100 text-slate-800">
          <Navbar registerPushNotifications={registerPushNotifications} /> 
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MainContentWrapper><HomePage /></MainContentWrapper>} />
            <Route path="/club/:clubId" element={<ClubDetailPage />} /> 

            {/* Authentication Routes */}
            <Route path="/login" element={<MainContentWrapper><CombinedLoginPage /></MainContentWrapper>} />
            <Route path="/admin/login" element={<MainContentWrapper><AdminLoginPage /></MainContentWrapper>} />
            <Route path="/register" element={<MainContentWrapper><RegisterPage /></MainContentWrapper>} />
            <Route path="/forgot-password" element={<MainContentWrapper><ForgotPasswordPage /></MainContentWrapper>} />
            <Route path="/reset-password/:resetToken" element={<MainContentWrapper><ResetPasswordPage /></MainContentWrapper>} />
            <Route path="/redirect-dashboard" element={<MainContentWrapper><PostLoginRedirect /></MainContentWrapper>} />
            <Route path="/pending-approval" element={<MainContentWrapper><PendingApprovalPage /></MainContentWrapper>} />
            <Route path="/unauthorized" element={<MainContentWrapper><UnauthorizedPage /></MainContentWrapper>} />
            <Route path="*" element={<MainContentWrapper><NotFoundPage /></MainContentWrapper>} />


            {/* --- Protected Player Routes --- */}
            <Route path="/reels" element={<MainContentWrapper><ReelsPage /></MainContentWrapper>} /> {/* <<<< NEW ROUTE */}
            <Route path="/about" element={<MainContentWrapper><AboutPage /></MainContentWrapper>} /> {/* <<<< NEW ROUTE */}
            <Route path="/clubs" element={<MainContentWrapper><ClubListing /></MainContentWrapper>} /> {/* <<<< NEW ROUTE */}
            <Route path="/contact" element={<MainContentWrapper><ContactUs /></MainContentWrapper>} /> {/* <<<< NEW ROUTE */}

            <Route
              path="/player/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Player"]}>
                  <MainContentWrapper><PlayerDashboardPage /></MainContentWrapper>
                </ProtectedRoute>
              }
            />
            {/* ***** NEW ROUTE FOR VIEWING A SPECIFIC PLAYER'S PROFILE/DETAILS ***** */}
            <Route 
              path="/player/:playerId/details" 
              element={
                  <MainContentWrapper><PlayerDetailPage /></MainContentWrapper>
              }
            />

            <Route 
                path="/club/:clubId/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={["Coach"]}>
                    <ClubDashboard /> 
                  </ProtectedRoute>
                } 
              />
            
            <Route element={<ProtectedRoute allowedRoles={["Coach"]}><CoachLayout /></ProtectedRoute>}>
              <Route path="/coach/clubdetail" element={<ClubDashboard />} />
              <Route path="/coach/profile" element={<UserProfilePage />} /> 
              <Route path="/coach/club/:clubId/manage-players" element={<ManagePlayersPage />} />
              <Route path="/coach/club/:clubId/settings" element={<CoachClubSettingsPage />} />
              <Route path="/coach/club/:clubId/send-notifications" element={<CoachSendClubNotificationPage />} />
              <Route path="/coach/payment-settings" element={<CoachPayoutSettings />} />
              <Route path="/coach/payments" element={<CoachPaymentsDashboard />} />


            </Route>
            
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['Player', 'Coach', 'Admin']}>
                  <MainContentWrapper><UserProfilePage /></MainContentWrapper>
                </ProtectedRoute>
              }
            />

            <Route 
                element={
                  <ProtectedRoute allowedRoles={["Admin"]}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/profile" element={<UserProfilePage />} /> 
                <Route path="/admin/manage-users" element={<AdminManageUsersPage />} />
                <Route path="/admin/manage-clubs" element={<AdminManageClubsExtendedPage />} /> 
                <Route path="/admin/manage-players" element={<AdminManagePlayersPage />} /> 
                <Route path="/admin/manage-reels" element={<AdminReelsPage />} />       
                <Route path="/admin/send-notifications" element={<AdminSendNotificationPage />} /> 
                <Route path="/admin/manage-tournaments" element={<AdminTournamentsPage />} /> 
                <Route path="/admin/settings" element={<PlatformSettings />} />
                <Route path="/admin/feedbacks" element={<FeedbackListPage />} />
              </Route>
          </Routes>
          <Footer />
          
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;