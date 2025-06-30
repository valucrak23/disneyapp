if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js')
            .then(function (registration) {
                console.log('El registro fué exitoso, y tiene el alcance;', registration.scope);
            }).catch(function (error) {
                console.log('El registro ha fallado: ', error);
            });
    });
}

/* Función anónima auto-ejecutable. Todo lo que hay dentro está aislado del resto del código de la página */

(() => {
    let statusMenu = document.querySelector('#status-app');
    let statusPwa = document.querySelector('meta[name=theme-color]');

    const state = () => {
        if (navigator.onLine) {
            statusMenu.classList.remove('offline');
            statusMenu.classList.add('online');
            statusPwa.setAttribute('content', '#d900ff');
            console.log('Ta conectao');
        }else{
            statusMenu.classList.add('offline');
            statusMenu.classList.remove('online');
            statusPwa.setAttribute('content', '#ff0000');
            console.log('Oh no! te haz desconectao');
        }
    }

    if(!navigator.onLine){
        state()
    }
    window.addEventListener("online", state);
    window.addEventListener("offline", state);
})();

document.addEventListener('DOMContentLoaded', () => {
    const shareBtn = document.querySelector('#share');
    const shareModal = document.getElementById('shareModal');
    if (shareBtn && shareModal && typeof bootstrap !== 'undefined') {
        shareBtn.addEventListener('click', (e) => {
            e.preventDefault();
            try {
                const modal = new bootstrap.Modal(shareModal);
                modal.show();
            } catch (err) {
                alert('No se pudo abrir el modal de compartir. ¿Está cargado Bootstrap JS?');
                console.error(err);
            }
        });
    } else {
        console.warn('No se encontró el botón #share o el modal #shareModal, o falta Bootstrap JS');
    }

    // Manejo del botón de prueba de notificaciones
    const testNotificationBtn = document.querySelector('#test-notification');
    if (testNotificationBtn) {
        testNotificationBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            alert('Botón de notificación clickeado');
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                try {
                    const registration = await navigator.serviceWorker.ready;
                    alert('Service Worker listo');
                    // Solicitar permisos de notificación
                    const permission = await Notification.requestPermission();
                    alert('Permiso de notificación: ' + permission);
                    if (permission === 'granted') {
                        // Simular un evento push para mostrar la notificación
                        registration.showNotification('Demo Push', {
                            body: 'Click para regresar a la aplicación',
                            icon: 'icons/android-icon-192x192.png',
                            vibrate: [200, 100, 200, 200, 300, 400, 100, 400, 300],
                            data: {id: 1},
                            actions: [
                                {
                                    'action': 'SI',
                                    'title': '¿Te gusta la app?',
                                    'icon': 'icons/android-icon-192x192.png'
                                },
                                {
                                    'action': 'NO',
                                    'title': '¿Te gusta la app?',
                                    'icon': 'icons/android-icon-192x192.png'
                                }
                            ]
                        });
                        alert('Notificación enviada correctamente');
                        console.log('Notificación enviada correctamente');
                    } else {
                        alert('Debes permitir las notificaciones para probar esta función.');
                    }
                } catch (error) {
                    console.error('Error al mostrar la notificación:', error);
                    alert('Error al mostrar la notificación. Verifica la consola para más detalles.');
                }
            } else {
                alert('Las notificaciones push no son compatibles con este navegador.');
            }
        });
    }
});

/* status de lines */

(() => {

    let aviso;
    let showAlert = document.querySelector('#install-app')

    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('Evento beforeinstallprompt disparado');
        e.preventDefault();
        aviso = e;
        console.log(aviso);
        ShowAddToHomeScreen();
    })


    const ShowAddToHomeScreen = () => {

        showAlert.style.display = 'flex';
        showAlert.addEventListener('click', AddToHomeScreen)
    }

    const AddToHomeScreen = () => {
        console.log('haciendo click')
        showAlert.style.display = 'none';

        if (aviso) {
            aviso.prompt();
            aviso.userChoice
                .then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('El usuario aceptó la instalación');
                    } else {
                        console.log('El usuario rechazó la instalación');
                    }

                    aviso = null;
                });
        }
    }

})();

// Notificaciones modernas y seguras
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

function showCustomNotification() {
    new Notification("¡Bienvenido a Disney!", {
        body: "Explora y juega con los personajes de Disney.",
        icon: "icons/android-icon-192x192.png",
        image: "assets/img/favico.ico",
        badge: "assets/img/notFound.png"
    });
}

// Restaurar el botón de instalar PWA para que funcione correctamente
let deferredPrompt;
const installBtn = document.getElementById('install-app');
if (installBtn) {
    installBtn.style.display = 'none';
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('Evento beforeinstallprompt disparado');
        e.preventDefault();
        deferredPrompt = e;
        installBtn.style.display = 'flex';
    });
    installBtn.addEventListener('click', () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('El usuario aceptó la instalación');
                } else {
                    console.log('El usuario rechazó la instalación');
                }
                deferredPrompt = null;
                installBtn.style.display = 'none';
            });
        }
    });
}
