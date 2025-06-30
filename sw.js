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
//funcion para instalacion del cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache abierto');
                return cache.addAll(urlsToCache);
            })
    );
});
//para obtenerlo
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
//para activarlo
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
//notificaciones
self.addEventListener('push', (event)=>{
    console.log(event);

    let title = "Demo Push";

    let options = {
        body: "Elegir una acción",
        icon: "icons/android-icon-192x192.png",
        vibrate: [200, 100, 200, 200, 300, 400, 100, 400, 300],
        dat: {id: 1},
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

    event.waitUntil(self.registration.showNotification(title, options));
});
//
self.addEventListener('notificationclick', (event) => {
    console.log(event);
    if (event.action === "Ir a Disney Plus") {
        console.log("Le gustó la app");
        clients.openWindow('https://www.disneyplus.com/es-ar');
        console.log(clients);
    } else if (event.action === "No Gracias") {
        console.log("No le gustó la app");
        clients.openWindow('/memory-game.html');
        console.log(clients);
    }
});