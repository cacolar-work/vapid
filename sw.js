self.addEventListener('install', event => {
	event.waitUntil(
        caches.open('my-pwa-cache').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/icon.png',
                '/script.min.js'
            ]);
        })
    );
    self.skipWaiting();
});
self.addEventListener('activate', event => {
    event.waitUntil(
        clients.claim()
    );
});
self.addEventListener('fetch',(event) =>{
	if (event.request.url.match(/\.(jpg|png|gif|svg)$/)) {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    }
	return
})
self.addEventListener('push', function (event) {
	let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            console.error('Failed to parse push data:', e, event.data.text());
            data = { title: 'Notify', body: event.data.text() };
        }
    }
    event.waitUntil(
        self.registration.showNotification(data.title || 'Notify', {
            body: data.body || 'New notification has arrived',
            icon: 'icon.png'
        })
    );
});
