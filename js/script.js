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

/* Función anónima auto-ejecutable. Todo lo que hay dentro está aislado del resto del código de la página */

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

    if (!navigator.onLine) {
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
                alert('No se pudo abrir el modal de compartir.');
                console.error(err);
            }
        });
    } else {
        console.warn('No se encontró el botón #share o el modal #shareModal, o falta Bootstrap JS');
    }

    // --- COMPARTIR EN REDES SOCIALES ---
    const shareLinks = document.querySelectorAll('#shareModal .modal-body a');
    shareLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const url = window.location.href;
            navigator.clipboard.writeText(url);
            let shareUrl = '';
            if (this.title === 'Facebook') {
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            } else if (this.title === 'Twitter') {
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=¡Mirá esta app de Disney!`;
            } else if (this.title === 'WhatsApp') {
                shareUrl = `https://wa.me/?text=${encodeURIComponent('¡Mirá esta app de Disney! ' + url)}`;
            } else if (this.title === 'Instagram') {
                alert('Enlace copiado. Pega el link en tu historia o mensaje de Instagram.');
                return;
            }
            window.open(shareUrl, '_blank');
        });
    });

    // Botón copiar enlace
    const copyLinkBtn = document.getElementById('copy-link-btn');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', function() {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                copyLinkBtn.textContent = '¡Enlace copiado!';
                setTimeout(() => {
                    copyLinkBtn.textContent = 'Copiar enlace';
                }, 1500);
            });
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
        e.preventDefault();
        deferredPrompt = e;
        installBtn.style.display = 'flex';
    });
    installBtn.addEventListener('click', () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('PWA instalada exitosamente');
                } else {
                    console.log('Instalación de PWA cancelada');
                }
                deferredPrompt = null;
                installBtn.style.display = 'none';
            });
        }
    });
}
