const CACHE_NAME = 'disney-app-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/memory-game.html',
    '/css/main.css',
    '/js/api.js',
    '/js/script.js',
    '/js/memory-game.js',
    '/assets/img/titulo.png',
    '/manifest.json'
];

// Instalación del cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Interceptar peticiones fetch
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

// Activación y limpieza de cache antiguo
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
    let title = "Selecciona una acción";
    let options = {
        body: "Elegir una acción",
        icon: "icons/android-icon-192x192.png",
        vibrate: [200, 100, 200, 200, 300, 400, 100, 400, 300],
        data: {id: 1},
        actions:[
            {
                'action': 'SI',
                'title': 'Ir a disney Plus',
                'icon': 'icons/android-icon-192x192.png'
            },
            {
                'action': 'NO',
                'title': 'Ver memory game',
                'icon': 'icons/android-icon-192x192.png'
            }
        ] 
    }

    event.waitUntil(
        self.registration.showNotification(title, options)
            .catch(err => {
                console.error('Error mostrando la notificación:', err);
            })
    );
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
    if (event.action === "SI") {
        event.waitUntil(
            clients.openWindow('https://www.disneyplus.com/es-ar')
        );
    } else if (event.action === "NO") {
        event.waitUntil(
            clients.openWindow('/memory-game.html')
        );
    }
});

// Manejo de mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data === 'test-notification') {
    self.registration.showNotification('Test', {
      body: 'Esto es una prueba directa desde el SW',
      icon: 'icons/android-icon-192x192.png'
    });
  }
});