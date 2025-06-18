// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Your global styles
import App from './App.js';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext.js'; // Import AuthProvider
import api from './services/api'; // Your configured Axios instance

const root = ReactDOM.createRoot(document.getElementById('root'));
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;

// Initial checks for essential environment variables
if (!googleClientId) {
    console.error("FATAL ERROR: REACT_APP_GOOGLE_CLIENT_ID is not defined in your .env file. Google Sign-In will not work.");
}

if (!vapidPublicKey) {
    console.warn("WARNING: REACT_APP_VAPID_PUBLIC_KEY is not defined in your .env file. Push notifications will not be set up.");
}

// --- PUSH NOTIFICATION SETUP ---

// Helper function to convert VAPID public key (URL-safe base64 to Uint8Array)
function urlBase64ToUint8Array(base64String) {
    if (!base64String) return null; // Handle case where key might be missing
    try {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    } catch (e) {
        console.error("Error converting VAPID key:", e);
        return null;
    }
}

// Function to send the push subscription to your backend
async function sendSubscriptionToBackend(subscription) {
    if (!subscription) {
        console.warn("[sendSubscriptionToBackend] No subscription object to send.");
        return;
    }
    try {
        const deviceInfo = `${navigator.userAgentData?.platform || navigator.platform}, ${navigator.userAgentData?.brands?.[0]?.brand || navigator.appName}`;
        console.log("[sendSubscriptionToBackend] Sending subscription to backend:", subscription);
        await api.post('/notifications/subscribe-push', { subscription, deviceInfo });
        console.log('[sendSubscriptionToBackend] Push subscription successfully sent to backend.');
    } catch (error) {
        console.error('[sendSubscriptionToBackend] Failed to send push subscription to backend:', error.response?.data?.message || error.message);
        if (error.response?.status === 401) {
            console.warn("[sendSubscriptionToBackend] User not authenticated to send push subscription. Should retry after login.");
        }
    }
}

// Function to subscribe the user to push notifications
async function subscribeUserToPush(swRegistration) {
   const clientVapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
    console.log('[subscribeUserToPush] REACT_APP_VAPID_PUBLIC_KEY from env:', clientVapidPublicKey ? 'Loaded, length: ' + clientVapidPublicKey.length : 'NOT LOADED');
    if (!vapidPublicKey) {
        console.warn("[subscribeUserToPush] VAPID public key not available. Cannot subscribe.");
        return null;
    }
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    if (!applicationServerKey) {
        console.error("[subscribeUserToPush] VAPID public key conversion failed.");
        return null;
    }

    try {
        const existingSubscription = await swRegistration.pushManager.getSubscription();
        if (existingSubscription) {
            console.log('[subscribeUserToPush] User IS already subscribed to push notifications.');
            // Optionally, re-send to backend for good measure, or if it might have changed (rare)
            // await sendSubscriptionToBackend(existingSubscription);
            return existingSubscription;
        }

        console.log('[subscribeUserToPush] User is NOT subscribed. Attempting to subscribe now...');
        const subscription = await swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey,
        });
        console.log('[subscribeUserToPush] User IS subscribed to push notifications:', subscription);
        await sendSubscriptionToBackend(subscription);
        return subscription;

    } catch (err) {
        // This is where "AbortError: Registration failed - push service error" would appear if VAPID key is bad OR
        // if the push service itself has an issue.
        console.error('[subscribeUserToPush] Failed to subscribe the user to push notifications:', err.message || err);
        if (Notification.permission === 'denied') {
            console.warn('[subscribeUserToPush] Subscription failed because permission was denied.');
        }
        return null;
    }
}

// Main function to register service worker and then attempt push subscription
// This function is intended to be called by the application (e.g., from App.js or Navbar.js)
async function registerAndSubscribePush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('[registerAndSubscribePush] Push messaging or Service Workers are not supported by this browser.');
        return null;
    }
    if (!vapidPublicKey) {
        console.warn("[registerAndSubscribePush] VAPID public key missing, push setup cannot proceed.");
        return null;
    }

    console.log('[registerAndSubscribePush] Service Worker and Push API are supported.');
    try {
        const swRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('[registerAndSubscribePush] Service Worker registered:', swRegistration);

        await navigator.serviceWorker.ready;
        console.log('[registerAndSubscribePush] Service Worker is ready.');

        let permission = Notification.permission;
        console.log('[registerAndSubscribePush] Current Notification permission state:', permission);

        if (permission === 'default') {
            console.log('[registerAndSubscribePush] Requesting push notification permission from user...');
            permission = await Notification.requestPermission(); // Shows the browser prompt
            console.log('[registerAndSubscribePush] Permission after prompt:', permission);
        }
        
        if (permission === 'granted') {
            console.log('[registerAndSubscribePush] Push Notification permission is granted.');
            return await subscribeUserToPush(swRegistration);
        } else {
            // This is where "Push Notification permission not granted: denied" log comes from
            console.warn('[registerAndSubscribePush] Push Notification permission was not granted by the user:', permission);
            return null;
        }

    } catch (error) {
        console.error('[registerAndSubscribePush] Service Worker registration or push subscription process failed:', error);
        return null;
    }
}
// --- END PUSH NOTIFICATION SETUP ---

// Render the application
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId || ""}>
      <AuthProvider>
        {/* Pass the main setup function as a prop to App component */}
        <App registerPushNotifications={registerAndSubscribePush} />
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);