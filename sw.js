// A simple service worker to satisfy PWA install requirements
self.addEventListener('install', (event) => {
    console.log('PeerDrop Service Worker installed.');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('PeerDrop Service Worker activated.');
});

self.addEventListener('fetch', (event) => {
    // We aren't caching anything yet, so just fetch normally
    return;
});