// client/public/service-worker.js

self.addEventListener('push', event => {
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: data.icon || '/vite.svg', // Default icon
        badge: '/vite.svg',
        data: {
            url: data.data.url
        }
    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            // If a window is already open, focus it and navigate.
            if (clientList.length > 0) {
                return clientList[0].navigate(urlToOpen).then(client => client.focus());
            }
            // Otherwise, open a new window.
            return clients.openWindow(urlToOpen);
        })
    );
});
