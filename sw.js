// Neutral Service Worker
// This file exists to overwrite any previous "ghost" service workers 
// from other projects on this port that are interfering with API requests.

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    self.clients.claim();
});

// Do not intercept any fetch requests
// This ensures that all traffic, including AI API calls, goes through naturally.
