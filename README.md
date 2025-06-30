# 🏰 Disney App - Aplicación Web Progresiva (PWA)

Una aplicación web completa que permite explorar personajes de Disney, jugar un juego de memoria y funciona offline como una PWA.

## 📁 Estructura del Proyecto

```
disneyapp/
├── assets/img/          # Imágenes de la aplicación
├── css/                 # Estilos CSS
├── js/                  # Archivos JavaScript
│   ├── api.js          # API de personajes de Disney
│   ├── script.js       # Funcionalidades principales y PWA
│   └── memory-game.js  # Juego de memoria
├── icons/              # Iconos para PWA
├── index.html          # Página principal
├── memory-game.html    # Página del juego
├── sw.js              # Service Worker
└── manifest.json      # Configuración PWA
```

## 🚀 Funcionalidades Principales

### 1. **Explorador de Personajes de Disney**
- Búsqueda de personajes por nombre
- Vista detallada de cada personaje
- Sistema de favoritos con localStorage
- Paginación automática
- Caché offline de todos los personajes

### 2. **Juego de Memoria Disney**
- Juego de memoria con princesas de Disney
- Diferentes niveles según el tamaño de pantalla
- Sistema de puntuación y tiempo
- Guardado de mejores puntuaciones
- Responsive design

### 3. **Aplicación Web Progresiva (PWA)**
- Instalable en dispositivos móviles
- Funcionamiento offline
- Notificaciones push
- Service Worker para caché
- Compartir en redes sociales

## 📱 Archivos JavaScript - Explicación Detallada

### `js/api.js` - API de Personajes

#### **Variables Globales**
```javascript
const API = 'https://api.disneyapi.dev/character';
let favorites = [];
let charactersApi;
let currentPage = 1;
let currentSearch = '';
const pageSize = 20;
```

#### **Funciones Principales**

##### `fetchData(url)`
- **Propósito**: Realiza peticiones HTTP a la API de Disney
- **Parámetros**: URL de la API
- **Retorna**: Datos JSON de la respuesta
- **Manejo de errores**: Captura errores de red y los registra

##### `fetchAndStoreAllCharacters()`
- **Propósito**: Obtiene TODOS los personajes de la API y los guarda en localStorage
- **Funcionamiento**:
  1. Obtiene la primera página para saber el total de páginas
  2. Hace peticiones paralelas para todas las páginas restantes
  3. Combina todos los resultados
  4. Guarda en localStorage para uso offline
- **Retorna**: Array con todos los personajes

##### `getAllCharacters(page = 1)`
- **Propósito**: Carga y muestra personajes con paginación local
- **Funcionamiento**:
  1. Intenta cargar desde localStorage
  2. Si no existe, llama a `fetchAndStoreAllCharacters()`
  3. Aplica paginación local (20 por página)
  4. Muestra los personajes en la interfaz
- **Parámetros**: Número de página (opcional)

##### `search(page = 1)`
- **Propósito**: Busca personajes por nombre en la API
- **Funcionamiento**:
  1. Toma el valor del campo de búsqueda
  2. Hace petición a la API con el nombre
  3. Muestra resultados o mensaje "no encontrado"
  4. Aplica paginación de la API
- **Parámetros**: Número de página (opcional)

##### `addPagination(info, isSearch)`
- **Propósito**: Crea controles de paginación
- **Funcionamiento**:
  1. Elimina paginación anterior
  2. Crea botones "Anterior" y "Siguiente"
  3. Muestra página actual y total
  4. Asigna eventos según si es búsqueda o lista completa
- **Parámetros**: 
  - `info`: Información de paginación
  - `isSearch`: Boolean para diferenciar búsqueda vs lista completa

##### `detailCharacter(id)`
- **Propósito**: Muestra modal con detalles completos del personaje
- **Funcionamiento**:
  1. Hace petición a la API para obtener detalles completos
  2. Construye HTML dinámicamente con solo campos que tienen datos
  3. Verifica si el personaje está en favoritos
  4. Muestra modal con Bootstrap
  5. Asigna eventos al botón de favoritos

##### `addFavorite(id)`
- **Propósito**: Añade/elimina personajes de favoritos
- **Funcionamiento**:
  1. Lee favoritos actuales del localStorage
  2. Verifica si ya está en favoritos
  3. Añade o elimina según corresponda
  4. Actualiza la interfaz
  5. Guarda en localStorage

##### `addCharacters(characters)`
- **Propósito**: Renderiza la lista de personajes en la interfaz
- **Funcionamiento**:
  1. Limpia el contenedor de tarjetas
  2. Para cada personaje:
     - Determina la primera aparición (película/serie/videojuego)
     - Crea tarjeta con imagen, nombre y aparición
     - Añade botón "Ver Detalles"
  3. Asigna eventos a los botones de detalles

##### `renderFavorites()`
- **Propósito**: Muestra la lista de favoritos en un modal
- **Funcionamiento**:
  1. Lee favoritos del localStorage
  2. Aplica paginación manual (1-2 por página según pantalla)
  3. Crea controles de navegación si hay más de una página
  4. Maneja redimensionamiento de ventana
  5. Muestra en modal de Bootstrap

### `js/script.js` - Funcionalidades Principales y PWA

#### **Service Worker**
```javascript
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js')
            .then(function (registration) {
                console.log('Service Worker registrado exitosamente:', registration.scope);
            }).catch(function (error) {
                console.error('Error en el registro del Service Worker:', error);
            });
    });
}
```
- **Propósito**: Registra el Service Worker para funcionalidad offline
- **Funcionamiento**: Se ejecuta al cargar la página

#### **Estado de Conexión**
```javascript
(() => {
    let statusMenu = document.querySelector('#status-app');
    let statusPwa = document.querySelector('meta[name=theme-color]');

    const state = () => {
        if (navigator.onLine) {
            statusMenu.classList.remove('offline');
            statusMenu.classList.add('online');
            statusPwa.setAttribute('content', '#d900ff');
        } else {
            statusMenu.classList.add('offline');
            statusMenu.classList.remove('online');
            statusPwa.setAttribute('content', '#ff0000');
        }
    }
    // ... eventos online/offline
})();
```
- **Propósito**: Monitorea el estado de conexión a internet
- **Funcionamiento**: 
  - Cambia clases CSS para mostrar estado visual
  - Cambia color del tema PWA
  - Se ejecuta automáticamente y en eventos de conexión

#### **Compartir en Redes Sociales**
```javascript
const shareLinks = document.querySelectorAll('#shareModal .modal-body a');
shareLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        // ... lógica para cada red social
    });
});
```
- **Propósito**: Permite compartir la app en redes sociales
- **Funcionamiento**:
  - Copia URL al portapapeles
  - Abre ventanas específicas para cada red social
  - Manejo especial para Instagram

#### **Instalación PWA**
```javascript
let deferredPrompt;
const installBtn = document.getElementById('install-app');
if (installBtn) {
    installBtn.style.display = 'none';
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.style.display = 'flex';
    });
    installBtn.addEventListener('click', () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                // ... manejo de resultado
            });
        }
    });
}
```
- **Propósito**: Maneja la instalación de la PWA
- **Funcionamiento**:
  1. Captura el evento `beforeinstallprompt`
  2. Muestra botón de instalación
  3. Ejecuta prompt de instalación al hacer clic
  4. Maneja aceptación/rechazo

#### **Notificaciones**
```javascript
if ('Notification' in window) {
    if (Notification.permission === 'granted') {
        showCustomNotification();
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showCustomNotification();
            }
        });
    }
}
```
- **Propósito**: Solicita y muestra notificaciones
- **Funcionamiento**:
  1. Verifica soporte de notificaciones
  2. Solicita permisos si no están otorgados
  3. Muestra notificación de bienvenida

### `js/memory-game.js` - Juego de Memoria

#### **Clase MemoryGame**

##### **Constructor**
```javascript
constructor() {
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.score = 0;
    this.gameStarted = false;
    this.timer = null;
    this.seconds = 0;
    this.canFlip = true;
    this.allPrincesses = [/* array de princesas */];
    this.disneyPrincesses = [];
    this.init();
    window.addEventListener('resize', () => this.handleResize());
}
```
- **Propósito**: Inicializa todas las variables del juego
- **Variables importantes**:
  - `cards`: Array de elementos DOM de las tarjetas
  - `flippedCards`: Tarjetas volteadas actualmente
  - `matchedPairs`: Pares encontrados
  - `moves`: Movimientos realizados
  - `score`: Puntuación actual

##### `getPrincessesForScreen()`
- **Propósito**: Determina cuántas princesas mostrar según el tamaño de pantalla
- **Retorna**: 
  - 6 princesas en móvil (≤600px)
  - 8 princesas en tablet (≤900px)
  - 9 princesas en desktop (>900px)

##### `createGameBoard()`
- **Propósito**: Crea el tablero de juego
- **Funcionamiento**:
  1. Limpia el tablero anterior
  2. Crea pares de tarjetas (2 de cada princesa)
  3. Mezcla las tarjetas aleatoriamente
  4. Crea elementos DOM para cada tarjeta
  5. Añade animación de carga escalonada

##### `createCard(character, index)`
- **Propósito**: Crea una tarjeta individual del juego
- **Funcionamiento**:
  1. Crea estructura HTML con frente y reverso
  2. Frente: Signo de interrogación
  3. Reverso: Imagen y nombre de la princesa
  4. Asigna evento de clic
  5. Añade animación de carga

##### `flipCard(card)`
- **Propósito**: Maneja el volteo de una tarjeta
- **Funcionamiento**:
  1. Verifica que el juego esté iniciado y se pueda voltear
  2. Añade clase `flipped` a la tarjeta
  3. Añade a array de tarjetas volteadas
  4. Si hay 2 tarjetas volteadas, inicia verificación de coincidencia

##### `checkMatch()`
- **Propósito**: Verifica si las tarjetas volteadas coinciden
- **Funcionamiento**:
  1. Compara los personajes de las dos tarjetas
  2. Si coinciden:
     - Añade clase `matched`
     - Incrementa pares encontrados
     - Suma 100 puntos
     - Verifica si el juego terminó
  3. Si no coinciden:
     - Quita clase `flipped`
     - Resta 10 puntos
  4. Limpia array de tarjetas volteadas
  5. Permite voltear nuevas tarjetas

##### `startGame()`
- **Propósito**: Inicia el juego
- **Funcionamiento**:
  1. Verifica que no esté ya iniciado
  2. Inicia el temporizador
  3. Cambia texto del botón
  4. Limpia estado de tarjetas

##### `resetGame(forcePrincessCount = false)`
- **Propósito**: Reinicia el juego
- **Funcionamiento**:
  1. Resetea todas las variables del juego
  2. Detiene el temporizador
  3. Actualiza estadísticas
  4. Recrea el tablero
  5. Si `forcePrincessCount = true`, recalcula cantidad de princesas

##### `gameWon()`
- **Propósito**: Maneja la victoria del juego
- **Funcionamiento**:
  1. Detiene el temporizador
  2. Calcula puntuación final con bonificaciones:
     - Bonificación por tiempo: (300 - segundos) × 2
     - Bonificación por movimientos: (50 - movimientos) × 5
  3. Muestra modal de victoria
  4. Guarda mejor puntuación

##### `saveBestScore(score)`
- **Propósito**: Guarda la mejor puntuación en localStorage
- **Funcionamiento**:
  1. Lee mejor puntuación actual
  2. Si la nueva es mayor, la guarda
  3. Guarda también tiempo y movimientos

##### `shareGame()`
- **Propósito**: Abre modal para compartir el juego
- **Funcionamiento**: Usa Bootstrap para mostrar modal de compartir

##### `shuffleArray(array)`
- **Propósito**: Mezcla aleatoriamente un array
- **Algoritmo**: Fisher-Yates shuffle

#### **Funciones Globales**

##### `resetGame()`
- **Propósito**: Función global para resetear desde el modal
- **Funcionamiento**: Llama al método de la instancia del juego

##### **Inicialización**
```javascript
document.addEventListener('DOMContentLoaded', () => {
    window.memoryGame = new MemoryGame();
    // ... configuración de modales
});
```
- **Propósito**: Inicializa el juego cuando se carga la página
- **Funcionamiento**: Crea instancia global y configura eventos

### `sw.js` - Service Worker

#### **Variables**
```javascript
const CACHE_NAME = 'disney-app-v1';
const urlsToCache = [/* lista de archivos a cachear */];
```

#### **Eventos del Service Worker**

##### **Install**
```javascript
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});
```
- **Propósito**: Instala el cache cuando se registra el SW
- **Funcionamiento**: Abre cache y añade todos los archivos listados

##### **Fetch**
```javascript
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
```
- **Propósito**: Intercepta todas las peticiones HTTP
- **Funcionamiento**: 
  1. Busca en cache primero
  2. Si encuentra, devuelve desde cache
  3. Si no, hace petición a internet

##### **Activate**
```javascript
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
```
- **Propósito**: Limpia caches antiguos
- **Funcionamiento**: Elimina todos los caches excepto el actual

##### **Push**
```javascript
self.addEventListener('push', (event) => {
    // ... configuración de notificación
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});
```
- **Propósito**: Maneja notificaciones push
- **Funcionamiento**: Muestra notificación con acciones personalizadas

##### **Notification Click**
```javascript
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
```
- **Propósito**: Maneja clics en notificaciones
- **Funcionamiento**: Abre diferentes URLs según la acción seleccionada

## 🔧 Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos y animaciones
- **JavaScript ES6+**: Lógica de la aplicación
- **Bootstrap 5**: Framework CSS para responsive design
- **Service Worker API**: Funcionalidad offline
- **Web App Manifest**: Configuración PWA
- **localStorage API**: Almacenamiento local
- **Fetch API**: Peticiones HTTP
- **Notification API**: Notificaciones push

## 📱 Características PWA

- ✅ **Instalable**: Se puede instalar en dispositivos móviles
- ✅ **Offline**: Funciona sin conexión a internet
- ✅ **Responsive**: Se adapta a diferentes tamaños de pantalla
- ✅ **Notificaciones**: Soporte para notificaciones push
- ✅ **Caché inteligente**: Almacena recursos para uso offline
- ✅ **Compartir**: Integración con redes sociales

## 🎮 Cómo Jugar

1. **Explorar Personajes**:
   - Navega por la lista de personajes
   - Usa el buscador para encontrar personajes específicos
   - Haz clic en "Ver Detalles" para más información
   - Añade personajes a favoritos

2. **Juego de Memoria**:
   - Haz clic en "Iniciar Juego"
   - Encuentra pares de princesas iguales
   - Completa el juego en el menor tiempo posible
   - Intenta hacer la menor cantidad de movimientos

3. **Instalar PWA**:
   - En móvil: Aparecerá un banner de instalación
   - En desktop: Busca el botón de instalación en la barra de direcciones

## 🚀 Instalación y Uso

1. Clona o descarga el proyecto
2. Abre `index.html` en un servidor web (necesario para PWA)
3. La aplicación se cargará automáticamente
4. Para desarrollo local, usa un servidor como Live Server de VS Code

## 📄 Licencia

Este proyecto es de uso educativo y demostrativo. Los personajes de Disney son propiedad de The Walt Disney Company. 