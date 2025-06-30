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
});

/* status de lines */

(() => {

    let aviso;
    let showAlert = document.querySelector('#install-app')

    window.addEventListener('beforeinstallprompt', (e) => {
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

// Instalación PWA robusta
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

document.addEventListener('DOMContentLoaded', () => {
    // Crear botón de prueba de notificación si no existe
    if (!document.getElementById('test-notification-btn')) {
        const btn = document.createElement('button');
        btn.id = 'test-notification-btn';
        btn.className = 'btn btn-warning';
        btn.textContent = 'Probar notificación';
        btn.style.position = 'fixed';
        btn.style.bottom = '30px';
        btn.style.right = '30px';
        btn.style.zIndex = '2000';
        document.body.appendChild(btn);
        btn.addEventListener('click', () => {
            if ('Notification' in window) {
                if (Notification.permission === 'granted') {
                    showCustomNotification();
                } else if (Notification.permission !== 'denied') {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            showCustomNotification();
                        } else {
                            alert('Debes permitir las notificaciones para probar.');
                        }
                    });
                } else {
                    alert('Debes permitir las notificaciones para probar.');
                }
            } else {
                alert('Las notificaciones no son compatibles con este navegador.');
            }
        });
    }
});
