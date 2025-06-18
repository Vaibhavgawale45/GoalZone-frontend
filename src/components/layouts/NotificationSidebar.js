// src/components/layouts/NotificationSidebar.js
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

// Placeholder icons (can be replaced with actual SVGs)
const XMarkIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const CheckDoubleIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 5.25l-9 10.5" /></svg>;
const BellAlertIcon = () => <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M12 18.75a.75.75 0 00.75-.75v-1.5a.75.75 0 00-1.5 0v1.5a.75.75 0 00.75.75z" /></svg>;


const NotificationItem = ({ notification, onMarkAsRead }) => {
    const handleItemClick = async () => {
        if (!notification.isRead) {
            try {
                await api.put(`/notifications/${notification._id}/read`);
                onMarkAsRead(notification._id); // Update UI immediately
            } catch (error) {
                console.error("Failed to mark notification as read", error);
                toast.error("Failed to update notification status.");
            }
        }
        // Navigation can happen here if notification.link exists, or let Link component handle it
    };

    const content = (
        <div className={`block p-3 hover:bg-slate-100 transition-colors ${!notification.isRead ? 'bg-sky-50' : 'bg-white'}`}>
            <div className="flex items-start space-x-3">
                {notification.sender?.imageUrl ? (
                    <img src={notification.sender.imageUrl} alt={notification.sender.name || 'Sender'} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 text-sm font-semibold">
                        {notification.sender?.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold text-slate-800 ${!notification.isRead ? 'font-bold' : ''} truncate`}>
                        {notification.title}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notification.message}</p>
                    {notification.imageUrl && (
                        <img src={notification.imageUrl} alt="Notification visual" className="mt-2 rounded-md max-h-32 object-contain" />
                    )}
                </div>
                {!notification.isRead && (
                    <div className="w-2 h-2 bg-sky-500 rounded-full flex-shrink-0 mt-1" title="Unread"></div>
                )}
            </div>
            <p className="text-xxs text-slate-400 mt-1.5 text-right">
                {new Date(notification.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
            </p>
        </div>
    );

    return notification.link ? (
        <Link to={notification.link} onClick={handleItemClick} className="block border-b border-slate-200 last:border-b-0">
            {content}
        </Link>
    ) : (
        <div onClick={handleItemClick} className="block border-b border-slate-200 last:border-b-0 cursor-pointer">
            {content}
        </div>
    );
};


const NotificationSidebar = ({ isOpen, onClose, notifications, loading, onMarkAsRead, onMarkAllAsRead, fetchMore, hasMore, onEnablePush }) => {
    const sidebarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                // Check if the click was on the bell icon itself to prevent immediate re-close
                const bellButton = document.querySelector('button[aria-label="Toggle notifications"]');
                if (bellButton && bellButton.contains(event.target)) {
                    return;
                }
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    const handleMarkAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            onMarkAllAsRead(); // Update UI
            toast.success("All notifications marked as read.");
        } catch (error) {
            console.error("Failed to mark all as read", error);
            toast.error("Failed to mark all notifications as read.");
        }
    };
    
    // Check if push notifications are supported and permission granted
    const [pushSupported, setPushSupported] = useState(false);
    const [pushPermissionGranted, setPushPermissionGranted] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setPushSupported(true);
            navigator.permissions.query({ name: 'push', userVisibleOnly: true }).then(status => {
                setPushPermissionGranted(status.state === 'granted');
            });
        }
    }, []);


    return (
        <div className={`fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* Overlay */}
            <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>

            {/* Sidebar */}
            <div ref={sidebarRef} className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800">Notifications</h2>
                    <button onClick={onClose} className="p-1 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500">
                        <XMarkIcon />
                    </button>
                </div>

                {!pushPermissionGranted && pushSupported && (
                    <div className="p-3 bg-sky-50 border-b border-sky-200 text-center">
                        <p className="text-xs text-sky-700 mb-1">Get instant updates on your device!</p>
                        <button
                            onClick={onEnablePush}
                            className="text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 px-3 py-1 rounded-md"
                        >
                            Enable Push Notifications
                        </button>
                    </div>
                )}


                {notifications.length > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="w-full text-left px-4 py-2 text-xs text-sky-600 hover:bg-sky-50 font-medium border-b border-slate-200 flex items-center gap-1.5"
                    >
                         <CheckDoubleIcon /> Mark all as read
                    </button>
                )}

                <div className="flex-grow overflow-y-auto">
                    {loading && notifications.length === 0 && (
                        <div className="flex items-center justify-center h-full p-4">
                            <div role="status" className="inline-block"><svg aria-hidden="true" className="w-8 h-8 text-slate-200 animate-spin fill-sky-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg></div>
                        </div>
                    )}
                    {!loading && notifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                            <BellAlertIcon />
                            <p className="mt-3 text-sm font-medium text-slate-700">No new notifications</p>
                            <p className="text-xs text-slate-500">You're all caught up!</p>
                        </div>
                    )}
                    {notifications.map(notification => (
                        <NotificationItem key={notification._id} notification={notification} onMarkAsRead={onMarkAsRead} />
                    ))}
                    {hasMore && !loading && notifications.length > 0 && (
                        <div className="p-4 text-center">
                            <button
                                onClick={fetchMore}
                                className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                            >
                                Load More
                            </button>
                        </div>
                    )}
                    {loading && notifications.length > 0 && ( // Spinner at bottom when loading more
                         <div className="flex items-center justify-center p-4">
                            <div role="status" className="inline-block"><svg aria-hidden="true" className="w-6 h-6 text-slate-200 animate-spin fill-sky-600" viewBox="0 0 100 101" /* ... */ ></svg></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationSidebar;