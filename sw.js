self.addEventListener('install', event => {
    self.skipWaiting();
});
self.addEventListener('activate', event => {
    event.waitUntil(
        clients.claim()
    );
});
self.addEventListener('fetch',() =>{
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
