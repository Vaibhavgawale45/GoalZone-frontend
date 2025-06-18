// public/sw.js (or src/sw.js, adjust build process accordingly)
console.log('Service Worker Loaded');

self.addEventListener('push', e => {
    const data = e.data.json();
    console.log('Push Received...', data);
    self.registration.showNotification(data.title, {
        body: data.body || 'You have a new notification!',
        icon: data.icon || '/logo192.png', // Path to your app's icon
        badge: '/badge72.png', // Path to a smaller badge icon
        vibrate: [200, 100, 200],
        data: {
            url: data.data?.url || '/', // URL to open on click
        },
        // actions: [ // Optional: custom actions on the notification
        //   { action: 'explore', title: 'Explore', icon: '/icons/explore.png' },
        //   { action: 'close', title: 'Close', icon: '/icons/close.png' },
        // ],
    });
});

self.addEventListener('notificationclick', event => {
    event.notification.close(); // Close the notification

    const urlToOpen = event.notification.data?.url || '/'; // Default to home

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            // Check if there's already a tab open with the target URL
            for (const client of clientList) {
                // If the client's URL is the target URL and it's focused, do nothing.
                // Otherwise, focus it.
                // A more robust check might involve parsing the URL path.
                if (client.url === new URL(urlToOpen, self.location.origin).href && 'focus' in client) {
                    return client.focus();
                }
            }
            // If no such tab is found, open a new one.
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Optional: Listen for subscription changes (e.g., if user revokes permission)
self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('Push subscription changed: ', event);
  // Here you might want to re-subscribe or notify your server
  // event.oldSubscription, event.newSubscription
  // For simplicity, we'll let the app handle re-subscription logic on load if needed.
});

// Optional: Cache assets during install
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    // event.waitUntil(
    //   caches.open('my-cache-v1').then(cache => {
    //     return cache.addAll([
    //       '/',
    //       '/index.html',
    //       // Add other critical assets
    //     ]);
    //   })
    // );
    self.skipWaiting(); // Activate worker immediately
});

self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    // event.waitUntil(clients.claim()); // Take control of all open pages
});