// client/src/components/layout/Navbar.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.js";
import api from "../../services/api.js";
import { toast } from "react-toastify";
import logo from "../../assets/Logo.png";
import NotificationSidebar from "./NotificationSidebar.js";

// --- ICONS (from react-icons library for consistency) ---
import { FiLogOut, FiMenu, FiX, FiChevronDown, FiBell, FiAlertTriangle } from 'react-icons/fi';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100]" onClick={onClose}>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <FiAlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">{title}</h3>
              <div className="mt-2"> <p className="text-sm text-gray-500">{children}</p> </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 rounded-b-lg">
          <button type="button" className="inline-flex w-full justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 sm:ml-3 sm:w-auto" onClick={onConfirm}>Confirm</button>
          <button type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// --- Helper function for cleaner dashboard path logic ---
const getDashboardPath = (user) => {
    if (!user) return "/redirect-dashboard";
    switch (user.role) {
        case "Coach":
            if (user.isApproved && user.managedClub?._id) return `/club/${user.managedClub._id}/dashboard`;
            if (user.isApproved) return "/coach/dashboard";
            return "/pending-approval";
        case "Player":
            return "/player/dashboard";
        case "Admin":
            return "/admin/dashboard";
        default:
            return "/redirect-dashboard";
    }
};

const Navbar = ({ registerPushNotifications }) => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // --- UI State ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isNotificationSidebarOpen, setIsNotificationSidebarOpen] = useState(false);

  // --- Notification State ---
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationPage, setNotificationPage] = useState(1);
  const [hasMoreNotifications, setHasMoreNotifications] = useState(true);
  const [pushSubscribed, setPushSubscribed] = useState(false);

  // --- Event Handlers (memoized with useCallback) ---
  const handleLogout = useCallback(async () => {
    if (pushSubscribed && "serviceWorker" in navigator && "PushManager" in window) {
      try {
        const swReg = await navigator.serviceWorker.ready;
        const subscription = await swReg.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          setPushSubscribed(false);
        }
      } catch (error) { console.error("Error unsubscribing from push on logout:", error); }
    }
    logout();
    setIsLogoutModalOpen(false); // Close modal on confirm
    setIsUserDropdownOpen(false);
    navigate("/login");
    toast.info("Logged out successfully.");
  }, [logout, navigate, pushSubscribed]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('button[aria-label*="main menu"]')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- OPTIMIZED NOTIFICATION LOGIC ---

  // 1. Fetches *only* the unread count. Lightweight and suitable for polling.
  const fetchUnreadCount = useCallback(async () => {
    if (!user || authLoading) return;
    try {
        const res = await api.get(`/notifications?page=1&limit=1`);
        setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
        console.error("Notification count poll error:", err);
    }
  }, [user, authLoading]);

  // 2. Fetches the full list of notifications. Called on-demand when sidebar opens.
  const fetchNotificationsData = useCallback(async (page = 1, append = false) => {
    if (!user || authLoading || loadingNotifications) return;
    setLoadingNotifications(true);
    try {
      const response = await api.get(`/notifications?page=${page}&limit=10`);
      if (response.data) {
        setUnreadCount(response.data.unreadCount || 0);
        setNotifications((prev) => append ? [...prev, ...response.data.notifications] : response.data.notifications);
        setHasMoreNotifications(response.data.currentPage < response.data.totalPages);
        setNotificationPage(response.data.currentPage);
      }
    } catch (error) { 
      console.error("Failed to fetch notifications data:", error);
      setNotifications([]);
      setHasMoreNotifications(false);
    } finally {
      setLoadingNotifications(false);
    }
  }, [user, authLoading, loadingNotifications]);

  // 3. Effect to poll for the unread count to keep the badge fresh.
  useEffect(() => {
    if (user && !authLoading) {
        fetchUnreadCount(); // Fetch once on load
        const intervalId = setInterval(() => {
            if (document.visibilityState === "visible") {
                fetchUnreadCount();
            }
        }, 60 * 1000); // Poll every 60 seconds
        return () => clearInterval(intervalId);
    } else {
        // Cleanup on logout
        setUnreadCount(0);
        setNotifications([]);
        setIsNotificationSidebarOpen(false);
    }
  }, [user, authLoading, fetchUnreadCount]);
  
  // 4. Opens the sidebar and triggers the full data fetch.
  const toggleNotificationSidebar = useCallback(() => {
    const isOpening = !isNotificationSidebarOpen;
    setIsNotificationSidebarOpen(isOpening);

    if (isOpening) {
        setNotifications([]);
        setNotificationPage(1);
        setHasMoreNotifications(true);
        fetchNotificationsData(1, false);
    }
  }, [isNotificationSidebarOpen, fetchNotificationsData]);

  useEffect(() => {
    const checkPushSubscriptionStatus = async () => {
      if (user && !authLoading && "serviceWorker" in navigator && "PushManager" in window) {
        try {
          const swReg = await navigator.serviceWorker.ready;
          const subscription = await swReg.pushManager.getSubscription();
          setPushSubscribed(!!subscription);
        } catch (error) { console.error("Error checking push subscription status:", error); }
      } else { setPushSubscribed(false); }
    };
    checkPushSubscriptionStatus();
  }, [user, authLoading]);
  
  // Memoized handlers to pass to children
  const handleEnablePushNotifications = useCallback(async () => {}, []);
  const onNotificationRead = useCallback((notificationId) => {
    setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);
  const onAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  const isCoachOnDashboardPage = user?.role === 'Coach' && location.pathname.includes('/dashboard');

  const handleLogoClick = (event) => {
    if (isCoachOnDashboardPage) {
      event.preventDefault();
    }
  };

  const isCoach = user && user.role === 'Coach';
  const shouldShowMainLinks = !user || user.role === "Player";
  const dashboardPath = getDashboardPath(user);

  // --- Reusable Tailwind classes for consistency ---
  const navLinkBaseClass = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2";
  const getNavLinkClass = ({ isActive }) => `${navLinkBaseClass} ${isActive ? "bg-sky-100 text-sky-700 font-semibold" : "text-slate-700 hover:bg-slate-100 hover:text-sky-600"}`;
  const mobileNavLinkBaseClass = "block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-sky-500";
  const getMobileNavLinkClass = ({ isActive }) => `${mobileNavLinkBaseClass} ${isActive ? "bg-sky-100 text-sky-700" : "text-slate-700 hover:bg-slate-100 hover:text-sky-600"}`;
  const primaryButtonClasses = "block w-full text-center py-2 px-4 rounded-lg font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-800";
  const secondaryButtonClasses = "block w-full text-center py-2 px-4 rounded-lg font-bold text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-200";
  
  // --- JSX for navigation links ---
  const mainNavLinks = (
    <>
      <NavLink to="/clubs" className={getNavLinkClass}>Clubs</NavLink>
      <NavLink to="/reels" className={getNavLinkClass}>Reels</NavLink>
      <NavLink to="/contact" className={getNavLinkClass}>Contact Us</NavLink>
      <NavLink to="/about" className={getNavLinkClass}>About</NavLink>
    </>
  );
  
  const mainNavLinksMobile = (
    <>
      <NavLink to="/clubs" className={getMobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Clubs</NavLink>
      <NavLink to="/reels" className={getMobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Reels</NavLink>
      <NavLink to="/contact" className={getMobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Contact Us</NavLink>
      <NavLink to="/about" className={getMobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>About</NavLink>
    </>
  );

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-[60] print:hidden border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className={`flex items-center ${isCoach ? 'ml-16' : 'ml-0'} md:ml-0 transition-all duration-300`}>
              <Link 
                to='/' 
                className="text-2xl font-extrabold text-sky-600 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 rounded-sm transition-colors" 
                aria-label="Footballkhelo.in Home"
              >
                <img src={logo} alt="logo" className="h-7 w-46" />
              </Link>
            </div>

            {shouldShowMainLinks && (
              <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
                {mainNavLinks}
              </div>
            )}

            <div className="flex items-center">
              <div className="hidden md:flex items-center space-x-3">
                {!authLoading && user && (
                  <button onClick={toggleNotificationSidebar} type="button" className="relative p-1.5 bg-white rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500" aria-label="View notifications">
                    <FiBell className="h-6 w-6" />
                    {unreadCount > 0 && ( <span className="absolute top-0 right-0 block h-4 w-4 transform -translate-y-0.5 translate-x-0.5 rounded-full ring-1 ring-white bg-red-500 text-white text-xs flex items-center justify-center"> {unreadCount > 9 ? "9+" : unreadCount} </span> )}
                  </button>
                )}
                {!authLoading && (user ? (
                  <div className="relative" ref={userDropdownRef}>
                    <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1" aria-expanded={isUserDropdownOpen} aria-haspopup="true" aria-label="User menu">
                      <img className="h-9 w-9 rounded-full object-cover border-2 border-slate-300 group-hover:border-sky-500 transition-colors" src={user.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=random&color=fff&size=128`} alt="User avatar" />
                      <span className="hidden lg:inline text-slate-700 text-sm font-medium select-none hover:text-sky-600">{user.name}</span>
                      <FiChevronDown className="hidden lg:inline text-slate-500 hover:text-sky-600 w-4 h-4" />
                    </button>
                    {isUserDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl py-1 z-[70] border border-slate-200 origin-top-right">
                        <div className="px-4 py-3 border-b border-slate-200">
                          <p className="text-xs text-slate-700">Signed in as</p>
                          <p className="text-sm font-medium text-slate-900 truncate">{user.email}</p>
                        </div>
                        <div className="flex flex-col py-1">
                          <Link to={dashboardPath} onClick={() => setIsUserDropdownOpen(false)} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-sky-600">My Dashboard</Link>
                        </div>
                        <div className="border-t border-slate-200 py-1">
                          <button onClick={() => setIsLogoutModalOpen(true)} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:font-semibold"> Logout </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-x-2">
                    <Link to="/login" className={`${navLinkBaseClass} text-slate-700 hover:bg-slate-100 hover:text-sky-600`}>Login</Link>
                    <Link to="/admin/login" className={`${navLinkBaseClass} text-slate-700 hover:bg-slate-100 hover:text-sky-600`}>Admin</Link>
                    <Link to="/register" className="ml-2 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors">Register</Link>
                  </div>
                ))}
              </div>

              <div className="md:hidden flex items-center ml-2">
                {!authLoading && user && (
                  <>
                    <button onClick={toggleNotificationSidebar} type="button" className="relative p-1.5 mr-2 bg-white rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500" aria-label="View notifications">
                      <FiBell className="h-6 w-6" />
                      {unreadCount > 0 && ( <span className="absolute top-0 right-0 block h-4 w-4 transform -translate-y-0.5 translate-x-0.5 rounded-full ring-1 ring-white bg-red-500 text-white text-xs flex items-center justify-center"> {unreadCount > 9 ? "9+" : unreadCount} </span> )}
                    </button>
                    <button onClick={() => setIsLogoutModalOpen(true)} type="button" className="p-1.5 bg-white rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500" aria-label="Logout">
                      <FiLogOut className="h-6 w-6" />
                    </button>
                  </>
                )}
                {!isCoach && (
                  <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} type="button" className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-sky-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500" aria-controls="mobile-menu" aria-expanded={isMobileMenuOpen} aria-label={isMobileMenuOpen ? "Close main menu" : "Open main menu"}>
                    <span className="sr-only">Open main menu</span>
                    {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && !isCoach && (
          <div className="md:hidden border-t border-slate-200" id="mobile-menu" ref={mobileMenuRef}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {shouldShowMainLinks && mainNavLinksMobile}

              {user && user.role === 'Player' && (
                <>
                    <hr className="my-2 border-slate-200" />
                    <Link
                        to={dashboardPath}
                        className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-sky-600"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        My Dashboard
                    </Link>
                </>
              )}

              {!user && (
                <>
                  <hr className="my-2 border-slate-200" />
                  <Link to="/login" className={secondaryButtonClasses} onClick={() => setIsMobileMenuOpen(false)}> Login </Link>
                  <Link to="/register" className={primaryButtonClasses} onClick={() => setIsMobileMenuOpen(false)}> Register </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <ConfirmationModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={handleLogout} title="Confirm Logout">
        Are you sure you want to logout?
      </ConfirmationModal>

      {user && !authLoading && (
        <NotificationSidebar
          isOpen={isNotificationSidebarOpen}
          onClose={toggleNotificationSidebar}
          notifications={notifications}
          loading={loadingNotifications}
          onMarkAsRead={onNotificationRead}
          onMarkAllAsRead={onAllNotificationsRead}
          fetchMore={() => fetchNotificationsData(notificationPage + 1, true)}
          hasMore={hasMoreNotifications}
          onEnablePush={handleEnablePushNotifications}
          pushSubscribed={pushSubscribed}
        />
      )}
    </>
  );
};

export default Navbar;