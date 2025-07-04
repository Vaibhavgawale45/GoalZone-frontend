// client/src/App.js

import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { AuthProvider, useAuth } from "./contexts/AuthContext.js";

// Layouts and Common Components
import Navbar from "./components/layouts/Navbar.js";
import Footer from "./components/layouts/Footer.js";
import ClubPageSidebar from "./components/layouts/ClubPageSidebar.js";
import CoachLayout from "./components/layouts/CoachLayout.js";
import AdminLayout from "./components/layouts/AdminLayout.js";
import ProtectedRoute from "./Pages/auth/ProtectedRoute.js";
import InstallPwaToast from "./components/common/InstallPwaToast.js";
import NotificationPermissionToast from "./components/common/NotificationPermissionToast.js";

// Page Components
import ReelsPage from "./Pages/ReelsPage.js";
import AboutPage from "./Pages/AboutPage.js";
import ContactUs from "./Pages/ContactUs.js"
import HomePage from "./Pages/HomePage.js";
import ClubDashboard from "./Pages/dashboards/ClubDashboard.js";
import UserProfilePage from './Pages/UserProfilePage.js';
import NotFoundPage from "./Pages/NotFoundPage.js";
import UnauthorizedPage from "./Pages/UnauthorizedPage.js";
import PlayerDetailPage from "./Pages/PlayerDetailPage.js";
import ClubDetailPage from "./Pages/ClubDetailPage.js";
import ClubListing from "./Pages/ClubListing.js";

// Auth Pages
import CombinedLoginPage from "./Pages/auth/CombinedLoginPage.js";
import AdminLoginPage from "./Pages/auth/AdminLoginPage.js";
import RegisterPage from "./Pages/auth/RegisterPage.js";
import ForgotPasswordPage from './Pages/auth/ForgotPasswordPage.js';
import ResetPasswordPage from './Pages/auth/ResetPasswordPage.js';
import PendingApprovalPage from "./Pages/auth/PendingApprovalPage.js";

// Dashboard Pages
import PlayerDashboardPage from "./Pages/dashboards/PlayerDashboardPage.js";
import AdminDashboardPage from "./Pages/dashboards/AdminDashboardPage.js";
import CoachPaymentsDashboard from "./Pages/dashboards/coach/CoachPaymentsDashboard.js";

// Admin Specific Pages
import AdminManageUsersPage from "./Pages/admin/AdminManageUsersPage.js";
import FeedbackListPage from "./Pages/admin/FeedbackListPage.js";
import AdminManageClubsExtendedPage from "./Pages/admin/AdminManageClubsExtendedPage.js";
import AdminManagePlayersPage from "./Pages/admin/AdminManagePlayersPage.js";
import AdminReelsPage from "./Pages/admin/AdminReelsPage.js";
import AdminTournamentsPage from "./Pages/admin/AdminTournamentsPage.js";
import AdminSendNotificationPage from "./Pages/admin/AdminSendNotificationPage.js";
import PlatformSettings from "./Pages/admin/PlatformSettings.js";

// Coach Specific Pages
import ManagePlayersPage from "./Pages/dashboards/coach/ManagePlayersPage.js";
import CoachSendClubNotificationPage from "./Pages/dashboards/coach/CoachSendClubNotificationPage.js";
import CoachClubSettingsPage from "./Pages/dashboards/coach/CoachClubSettingsPage.js"
import CoachPayoutSettings from "./components/coach/CoachPayoutSettings.js";

const PostLoginRedirect = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

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

const AppContent = ({ registerPushNotifications }) => {
  const { user } = useAuth();
  const location = useLocation();

  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isNotificationPermissionRequired, setIsNotificationPermissionRequired] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handlePwaInstall = async () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    const choiceResult = await installPromptEvent.userChoice;
    setInstallPromptEvent(null);

    if (choiceResult.outcome === 'accepted') {
      if (Notification.permission === 'default') {
        setTimeout(() => setIsNotificationPermissionRequired(true), 1500);
      }
    }
  };

  const handleRequestNotificationPermission = async () => {
    const permissionResult = await Notification.requestPermission();
    setIsNotificationPermissionRequired(false);
    if (permissionResult === 'granted') {
      if (registerPushNotifications) {
        registerPushNotifications();
      }
    }
  };

  const isCoach = user?.role === 'Coach';
  const onClubPage = location.pathname.startsWith('/club/');

  return (
    <>
      <div className={`flex flex-col min-h-screen bg-slate-100 text-slate-800 ${isNotificationPermissionRequired ? 'blur-sm pointer-events-none' : ''}`}>
        <Navbar registerPushNotifications={registerPushNotifications} />
        <div className="flex flex-1">
          {isCoach && onClubPage && (
            <aside className="hidden md:block w-60 lg:w-64 xl:w-72 bg-white flex-shrink-0">
              <ClubPageSidebar />
            </aside>
          )}
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<MainContentWrapper><HomePage /></MainContentWrapper>} />
              <Route path="/club/:clubId" element={<ClubDetailPage />} />
              <Route path="/login" element={<MainContentWrapper><CombinedLoginPage /></MainContentWrapper>} />
              <Route path="/admin/login" element={<MainContentWrapper><AdminLoginPage /></MainContentWrapper>} />
              <Route path="/register" element={<MainContentWrapper><RegisterPage /></MainContentWrapper>} />
              <Route path="/forgot-password" element={<MainContentWrapper><ForgotPasswordPage /></MainContentWrapper>} />
              <Route path="/reset-password/:resetToken" element={<MainContentWrapper><ResetPasswordPage /></MainContentWrapper>} />
              <Route path="/redirect-dashboard" element={<PostLoginRedirect />} />
              <Route path="/pending-approval" element={<MainContentWrapper><PendingApprovalPage /></MainContentWrapper>} />
              <Route path="/unauthorized" element={<MainContentWrapper><UnauthorizedPage /></MainContentWrapper>} />
              <Route path="/reels" element={<MainContentWrapper><ReelsPage /></MainContentWrapper>} />
              <Route path="/about" element={<MainContentWrapper><AboutPage /></MainContentWrapper>} />
              <Route path="/clubs" element={<MainContentWrapper><ClubListing /></MainContentWrapper>} />
              <Route path="/contact" element={<MainContentWrapper><ContactUs /></MainContentWrapper>} />
              <Route path="/player/:playerId" element={<MainContentWrapper><PlayerDetailPage /></MainContentWrapper>} />
              <Route path="/profile" element={<ProtectedRoute allowedRoles={['Player', 'Coach', 'Admin']}><MainContentWrapper><UserProfilePage /></MainContentWrapper></ProtectedRoute>} />
              <Route path="/player/dashboard" element={<ProtectedRoute allowedRoles={["Player"]}><MainContentWrapper><PlayerDashboardPage /></MainContentWrapper></ProtectedRoute>} />
              <Route path="/club/:clubId/dashboard" element={<ProtectedRoute allowedRoles={["Coach"]}><ClubDashboard /></ProtectedRoute>} />

              <Route element={<ProtectedRoute allowedRoles={["Coach"]}><CoachLayout /></ProtectedRoute>}>
                <Route path="/coach/clubdetail" element={<ClubDashboard />} />
                <Route path="/coach/profile" element={<UserProfilePage />} />
                <Route path="/coach/club/:clubId/manage-players" element={<ManagePlayersPage />} />
                <Route path="/coach/club/:clubId/settings" element={<CoachClubSettingsPage />} />
                <Route path="/coach/club/:clubId/send-notifications" element={<CoachSendClubNotificationPage />} />
                <Route path="/coach/payment-settings" element={<CoachPayoutSettings />} />
                <Route path="/coach/payments" element={<CoachPaymentsDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["Admin"]}><AdminLayout /></ProtectedRoute>}>
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

              <Route path="*" element={<MainContentWrapper><NotFoundPage /></MainContentWrapper>} />
            </Routes>
          </div>
        </div>
        {!isCoach && <Footer />}
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
        {installPromptEvent && (
          <InstallPwaToast onInstall={handlePwaInstall} onDismiss={() => setInstallPromptEvent(null)} />
        )}
      </div>

      {isNotificationPermissionRequired && (
        <NotificationPermissionToast onAllow={handleRequestNotificationPermission} />
      )}
    </>
  );
};

function App({ registerPushNotifications }) {
  return (
    <AuthProvider>
      <Router>
        <AppContent registerPushNotifications={registerPushNotifications} />
      </Router>
    </AuthProvider>
  );
}

export default App;