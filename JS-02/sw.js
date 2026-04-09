const CACHE_NAME = "v1_escola_cache"; 
const FILES_TO_CACHE = [ 
    "./",
    "./index.html",
    "./script.js",
    "./offline.html"
];

// Instalar e guardar ficheiros na cache
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE); 
        })
    );
});

// Responder com cache quando estiver offline
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).catch(() => caches.match("./offline.html")); 
        })
    );
});