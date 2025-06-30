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

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache abierto');
                return cache.addAll(urlsToCache);
            })
    );
});

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

self.addEventListener('push', (event)=>{
    console.log(event);

    let title = "Demo Push";

    let options = {
        body: "Click para regresar a la aplicación",
        icon: "icons/android-icon-192x192.png",
        vibrate: [200, 100, 200, 200, 300, 400, 100, 400, 300],
        dat: {id: 1},
        actions:[
            {
                'action': 'SI',
                'title': 'Sexo la app',
                'icon': 'icons/android-icon-192x192.png'
            },
            {
                'action': 'NO',
                'title': 'Sexo la app',
                'icon': 'icons/android-icon-192x192.png'
            }
        ] 

    }

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    console.log(event);
    if (event.action === "SI") {
        console.log("Le gustó la app");
        clients.openWindow('https://github.com/houruck/mikrotik-imperial-march/blob/master/starwars.txt');
        console.log(clients);
    } else if (event.action === "NO") {
        console.log("Chau");
        clients.openWindow('https://script.google.com/u/0/home/projects/1tf-EbQhVlITCUbjlteldkA2jvKzvgkdcdsGrIiGlfm29TGS07LYUMtjg/edit');
        console.log(clients);
    }
});