// Juego de Memoria Disney
class MemoryGame {
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
        // Princesas y sus imágenes (ordenadas para que las primeras sean las más importantes)
        this.allPrincesses = [
            { name: 'Ariel', imageUrl: 'https://static.wikia.nocookie.net/disney/images/8/8a/Profile_-_Ariel.jpg' },
            { name: 'Rapunzel', imageUrl: 'https://static.wikia.nocookie.net/disney/images/a/ae/Profile_-_Rapunzel.jpeg' },
            { name: 'Aurora', imageUrl: 'https://static.wikia.nocookie.net/disney/images/2/2a/Profile_-_Aurora.jpeg' },
            { name: 'Cinderella', imageUrl: 'https://static.wikia.nocookie.net/disney/images/e/e5/Profile_-_Cinderella.jpeg' },
            { name: 'Snow White', imageUrl: 'https://static.wikia.nocookie.net/disney/images/3/33/Profile_-_Snow_White.jpeg' },
            { name: 'Tiana', imageUrl: 'https://static.wikia.nocookie.net/disney/images/f/fa/Profile_-_Tiana.jpeg' },
            { name: 'Jasmine', imageUrl: 'https://static.wikia.nocookie.net/disney/images/c/cd/Profile_-_Jasmine.jpeg' },
            { name: 'Moana', imageUrl: 'https://static.wikia.nocookie.net/disney/images/7/7d/Profile_-_Moana.png' },
            { name: 'Elsa', imageUrl: 'https://static.wikia.nocookie.net/disney/images/9/95/Profile_-_Elsa.jpeg' },
            { name: 'Belle', imageUrl: 'https://static.wikia.nocookie.net/disney/images/1/1b/Profile_-_Belle.jpeg' }
        ];
        this.disneyPrincesses = [];
        this.init();
        window.addEventListener('resize', () => this.handleResize());
    }

    handleResize() {
        // Cambia la cantidad de princesas según el ancho
        const princesses = this.getPrincessesForScreen();
        if (princesses.length !== this.disneyPrincesses.length) {
            this.resetGame(true); // true = forzar cantidad
        }
    }

    getPrincessesForScreen() {
        const width = window.innerWidth;
        if (width <= 600) {
            return this.allPrincesses.slice(0, 6); // mobile
        } else if (width <= 900) {
            return this.allPrincesses.slice(0, 8); // tablet
        } else {
            return this.allPrincesses.slice(0, 9); // desktop (6 columnas)
        }
    }

    async init() {
        this.disneyPrincesses = this.getPrincessesForScreen();
        this.setupEventListeners();
        this.createGameBoard();
        this.updateStats();
    }

    setupEventListeners() {
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        document.getElementById('reset-game').addEventListener('click', () => this.resetGame());
        document.getElementById('share').addEventListener('click', () => this.shareGame());
    }

    createGameBoard() {
        this.disneyPrincesses = this.getPrincessesForScreen();
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        this.cards = [];
        // Crear pares de tarjetas
        const cardPairs = [...this.disneyPrincesses, ...this.disneyPrincesses];
        this.shuffleArray(cardPairs);
        cardPairs.forEach((character, index) => {
            const card = this.createCard(character, index);
            gameBoard.appendChild(card);
            this.cards.push(card);
        });
    }

    createCard(character, index) {
        const card = document.createElement('div');
        card.className = 'memory-card loading';
        card.dataset.character = character.name;
        card.dataset.index = index;
        card.innerHTML = `
            <div class="memory-card-inner">
                <div class="memory-card-front">
                    <div class="card-question">❓</div>
                </div>
                <div class="memory-card-back">
                    <img src="${character.imageUrl}" alt="${character.name}" class="character-image" onerror="this.onerror=null;this.src='assets/img/notFound.png'">
                    <div class="character-name">${character.name}</div>
                </div>
            </div>
        `;
        card.addEventListener('click', () => this.flipCard(card));
        setTimeout(() => {
            card.classList.remove('loading');
        }, index * 100);
        return card;
    }

    flipCard(card) {
        if (!this.gameStarted || !this.canFlip || card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }
        card.classList.add('flipped');
        this.flippedCards.push(card);
        if (this.flippedCards.length === 2) {
            this.canFlip = false;
            this.moves++;
            this.updateStats();
            setTimeout(() => {
                this.checkMatch();
            }, 500);
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const match = card1.dataset.character === card2.dataset.character;
        if (match) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.matchedPairs++;
            this.score += 100;
            if (this.matchedPairs === this.disneyPrincesses.length) {
                this.gameWon();
            }
        } else {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            this.score = Math.max(0, this.score - 10);
        }
        this.flippedCards = [];
        this.canFlip = true;
        this.updateStats();
    }

    startGame() {
        if (this.gameStarted) return;
        this.gameStarted = true;
        this.startTimer();
        document.getElementById('start-game').textContent = 'Juego en curso...';
        document.getElementById('start-game').disabled = true;
        this.cards.forEach(card => {
            card.classList.remove('flipped', 'matched');
        });
    }

    resetGame(forcePrincessCount = false) {
        this.gameStarted = false;
        this.matchedPairs = 0;
        this.moves = 0;
        this.score = 0;
        this.seconds = 0;
        this.flippedCards = [];
        this.canFlip = true;
        this.stopTimer();
        this.updateStats();
        document.getElementById('start-game').textContent = 'Iniciar Juego';
        document.getElementById('start-game').disabled = false;
        if (forcePrincessCount) {
            this.disneyPrincesses = this.getPrincessesForScreen();
        }
        this.createGameBoard();
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.seconds++;
            this.updateStats();
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateStats() {
        document.getElementById('moves').textContent = this.moves;
        document.getElementById('timer').textContent = this.formatTime(this.seconds);
        document.getElementById('score').textContent = this.score;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    gameWon() {
        this.stopTimer();
        
        // Calcular puntuación final
        const timeBonus = Math.max(0, 300 - this.seconds) * 2;
        const moveBonus = Math.max(0, 50 - this.moves) * 5;
        const finalScore = this.score + timeBonus + moveBonus;
        
        // Actualizar modal de victoria
        document.getElementById('final-moves').textContent = this.moves;
        document.getElementById('final-time').textContent = this.formatTime(this.seconds);
        document.getElementById('final-score').textContent = finalScore;
        
        // Mostrar modal
        const victoryModal = new bootstrap.Modal(document.getElementById('victoryModal'));
        victoryModal.show();
        
        // Guardar mejor puntuación
        this.saveBestScore(finalScore);
    }

    saveBestScore(score) {
        const bestScore = localStorage.getItem('disneyMemoryBestScore') || 0;
        if (score > bestScore) {
            localStorage.setItem('disneyMemoryBestScore', score);
            localStorage.setItem('disneyMemoryBestTime', this.formatTime(this.seconds));
            localStorage.setItem('disneyMemoryBestMoves', this.moves);
        }
    }

    shareGame() {
        // Solo abrir el modal de compartir, sin Web Share API ni clipboard
        const shareModal = document.getElementById('shareModal');
        if (shareModal && typeof bootstrap !== 'undefined') {
            try {
                const modal = new bootstrap.Modal(shareModal);
                modal.show();
            } catch (err) {
                alert('No se pudo abrir el modal de compartir. ¿Está cargado Bootstrap JS?');
                console.error(err);
            }
        } else {
            alert('No se encontró el modal de compartir o falta Bootstrap JS');
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

// Función global para resetear el juego desde el modal
function resetGame() {
    if (window.memoryGame) {
        window.memoryGame.resetGame();
        const victoryModal = bootstrap.Modal.getInstance(document.getElementById('victoryModal'));
        if (victoryModal) {
            victoryModal.hide();
        }
    }
}

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.memoryGame = new MemoryGame();
    const shareBtn = document.querySelector('#share');
    const shareModal = document.getElementById('shareModal');
    const victoryModal = document.getElementById('victoryModal');
    
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
        
        // Limpiar backdrop cuando se cierre el modal de compartir
        shareModal.addEventListener('hidden.bs.modal', () => {
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        });
    } else {
        console.warn('No se encontró el botón #share o el modal #shareModal, o falta Bootstrap JS');
    }
    
    // Limpiar backdrop cuando se cierre el modal de victoria
    if (victoryModal && typeof bootstrap !== 'undefined') {
        victoryModal.addEventListener('hidden.bs.modal', () => {
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        });
    }
}); 