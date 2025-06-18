// src/components/layouts/Header.js (or wherever your login button is)
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import NotificationSidebar from './NotificationSidebar'; // Create this component

// Bell Icon
const BellIcon = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
);


const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isNotificationSidebarOpen, setIsNotificationSidebarOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]); // For the sidebar
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [notificationPage, setNotificationPage] = useState(1);
    const [hasMoreNotifications, setHasMoreNotifications] = useState(true);

    const fetchNotificationsData = useCallback(async (page = 1, append = false) => {
        if (!user) return;
        setLoadingNotifications(true);
        try {
            const response = await api.get(`/notifications?page=${page}&limit=10`);
            if (response.data) {
                setUnreadCount(response.data.unreadCount || 0);
                setNotifications(prev => append ? [...prev, ...response.data.notifications] : response.data.notifications);
                setHasMoreNotifications(response.data.currentPage < response.data.totalPages);
                setNotificationPage(response.data.currentPage);
            }
        } catch (error) {
            console.error("Failed to fetch notifications data", error);
            // Optionally show toast error
        } finally {
            setLoadingNotifications(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchNotificationsData(1); // Fetch initial notifications
            // Optional: Set up an interval or WebSocket for real-time unread count updates
            const intervalId = setInterval(() => fetchNotificationsData(1, false), 60000); // Poll every minute
            return () => clearInterval(intervalId);
        } else {
            setUnreadCount(0);
            setNotifications([]);
        }
    }, [user, fetchNotificationsData]);
    
    // Function to be called when service worker needs to register push
    const handleEnablePushNotifications = async () => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                const swReg = await navigator.serviceWorker.ready; // Get existing registration
                 const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    console.log('Notification permission granted.');
                    // Re-use your subscribeUserToPush function (might need to export it or redefine here)
                    // For simplicity, directly call the relevant part:
                    const applicationServerKey = urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY);
                    const subscription = await swReg.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: applicationServerKey,
                    });
                    // Re-use sendSubscriptionToBackend
                    // await sendSubscriptionToBackend(subscription); // Make sure this func is accessible
                    // For now, directly:
                    const deviceInfo = `${navigator.userAgentData?.platform || navigator.platform}, ${navigator.userAgentData?.brands?.[0]?.brand || navigator.appName}`;
                    await api.post('/notifications/subscribe-push', { subscription, deviceInfo });
                    toast.success("Push notifications enabled!");
                } else {
                    toast.warn("Push notification permission denied.");
                }
            } catch (error) {
                console.error('Error enabling push notifications:', error);
                toast.error("Failed to enable push notifications.");
            }
        } else {
            toast.warn("Push notifications not supported on this browser.");
        }
    };
    // Helper function (duplicate from index.js, consider moving to a util file)
    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
        return outputArray;
    }


    const handleLogout = () => { /* ... your logout logic ... */ };

    const toggleNotificationSidebar = () => {
        setIsNotificationSidebarOpen(!isNotificationSidebarOpen);
        if (!isNotificationSidebarOpen) { // If opening, refresh
            fetchNotificationsData(1);
        }
    };
    
    const onNotificationRead = (notificationId) => {
        setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev -1)); // Decrement, ensure not negative
    };

    const onAllNotificationsRead = () => {
        setNotifications(prev => prev.map(n => ({...n, isRead: true})));
        setUnreadCount(0);
    };


    return (
        <header> {/* ... Your existing header structure ... */}
            <nav> {/* ... Your nav links ... */} </nav>
            <div className="flex items-center space-x-3">
                {user && (
                    <button
                        onClick={toggleNotificationSidebar}
                        className="relative p-2 rounded-full hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1"
                        aria-label="Toggle notifications"
                    >
                        <BellIcon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 block h-4 w-4 sm:h-5 sm:w-5 transform -translate-y-1/3 translate-x-1/3 rounded-full ring-2 ring-white bg-red-500 text-white text-xs flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                )}
                {/* ... Login/User Profile/Logout Button ... */}
            </div>
            {user && (
              <NotificationSidebar
                isOpen={isNotificationSidebarOpen}
                onClose={toggleNotificationSidebar}
                notifications={notifications}
                loading={loadingNotifications}
                onMarkAsRead={onNotificationRead}
                onMarkAllAsRead={onAllNotificationsRead}
                fetchMore={() => fetchNotificationsData(notificationPage + 1, true)}
                hasMore={hasMoreNotifications}
                onEnablePush={handleEnablePushNotifications} // Pass handler to sidebar
              />
            )}
        </header>
    );
};
export default Header;