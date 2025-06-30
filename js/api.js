const API = 'https://api.disneyapi.dev/character';
const errorApi = document.querySelector('#errorApi');
const loader = document.querySelector('#loader');
let favorites = [];
let charactersApi;
let currentPage = 1;
let currentSearch = '';
const pageSize = 20;

const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error){
        console.error(error)
    }
}

// Nueva función para obtener todos los personajes de la API y guardarlos en localStorage
async function fetchAndStoreAllCharacters() {
    let allCharacters = [];
    let page = 1;
    let totalPages = 1;
    try {
        // Obtener la primera página para saber cuántas páginas hay
        const firstPage = await fetchData(`${API}?page=1&pageSize=${pageSize}`);
        if (!firstPage || !firstPage.data) return [];
        allCharacters = firstPage.data;
        totalPages = firstPage.info.totalPages;
        // Obtener el resto de las páginas
        const fetches = [];
        for (let p = 2; p <= totalPages; p++) {
            fetches.push(fetchData(`${API}?page=${p}&pageSize=${pageSize}`));
        }
        const results = await Promise.all(fetches);
        results.forEach(res => {
            if (res && res.data) allCharacters = allCharacters.concat(res.data);
        });
        // Guardar en localStorage
        localStorage.setItem('allCharacters', JSON.stringify(allCharacters));
        return allCharacters;
    } catch (error) {
        console.error('Error al obtener todos los personajes:', error);
        return [];
    }
}

// Modificar getAllCharacters para usar localStorage
const getAllCharacters = async (page = 1) => {
    currentPage = page;
    currentSearch = '';
    errorApi.classList.add('d-none');
    loader.classList.remove('d-none');
    let allCharacters = [];
    try {
        const stored = localStorage.getItem('allCharacters');
        if (stored) {
            allCharacters = JSON.parse(stored);
        } else {
            allCharacters = await fetchAndStoreAllCharacters();
        }
    } catch (e) {
        allCharacters = [];
    }
    loader.classList.add('d-none');
    if (!allCharacters || allCharacters.length === 0) {
        errorApi.classList.remove('d-none');
        return;
    }
    // Paginar localmente
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageCharacters = allCharacters.slice(start, end);
    addCharacters(pageCharacters);
    // Info de paginación local
    const info = {
        totalPages: Math.ceil(allCharacters.length / pageSize),
        count: allCharacters.length
    };
    addPagination(info, false);
}

const search = (page = 1) =>{
    const name = document.querySelector('#search').value;
    currentPage = page;
    currentSearch = name;
    fetchData(`${API}?name=${encodeURIComponent(name)}&page=${page}&pageSize=${pageSize}`)
    .then( data => {
        const characters = data.data;
        if(characters.length === 0){
            document.querySelector('#nothing-found').classList.remove('d-none')
            document.querySelector('.cards').innerHTML = '';
            addPagination({totalPages:1, count:0}, true);
            return
        } else {
            document.querySelector('#nothing-found').classList.add('d-none')
            addCharacters(characters)
            addPagination(data.info, true);
        }
    })
    .catch( error =>{
        console.error(error)
    })
}

function addPagination(info, isSearch) {
    // Eliminar paginaciones previas
    const oldPag = document.getElementById('pagination-container');
    if (oldPag) oldPag.remove();
    if (!info || info.totalPages <= 1) return;
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-container d-flex justify-content-center mt-4';
    paginationContainer.id = 'pagination-container';
    paginationContainer.innerHTML = `
        <nav aria-label="Navegación de personajes">
            <ul class="pagination">
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <button class="page-link" id="prev-page">Anterior</button>
                </li>
                <li class="page-item disabled">
                    <span class="page-link">Página ${currentPage} de ${info.totalPages}</span>
                </li>
                <li class="page-item ${currentPage === info.totalPages ? 'disabled' : ''}">
                    <button class="page-link" id="next-page">Siguiente</button>
                </li>
            </ul>
        </nav>
    `;
    document.querySelector('.cards').after(paginationContainer);
    // Eventos
    document.getElementById('prev-page').onclick = () => {
        if (currentPage > 1) {
            if (isSearch) search(currentPage - 1);
            else getAllCharacters(currentPage - 1);
        }
    };
    document.getElementById('next-page').onclick = () => {
        if (currentPage < info.totalPages) {
            if (isSearch) search(currentPage + 1);
            else getAllCharacters(currentPage + 1);
        }
    };
}

const detailCharacter = (id) => {
    errorApi.classList.add('d-none');
    loader.classList.remove('d-none');
    fetchData(`${API}/${id}`)
    .then(data =>{
        loader.classList.add('d-none');
        const modal = document.getElementById('detailModal');
        const character = data.data;
        // Verificar si ya es favorito
        let currentFavorites;
        try {
            currentFavorites = JSON.parse(localStorage.getItem('favorites'));
            if (!Array.isArray(currentFavorites)) currentFavorites = [];
        } catch {
            currentFavorites = [];
        }
        let isAlreadyFavorite = currentFavorites.some(fav => fav._id == character._id);
        // Construir solo los campos con información real
        let detalles = '';
        if (character.films && character.films.length > 0) {
            detalles += `<p><strong>Películas:</strong><br>${character.films.join(', ')}</p>`;
        }
        if (character.tvShows && character.tvShows.length > 0) {
            detalles += `<p><strong>Series:</strong><br>${character.tvShows.join(', ')}</p>`;
        }
        if (character.videoGames && character.videoGames.length > 0) {
            detalles += `<p><strong>Videojuegos:</strong><br>${character.videoGames.join(', ')}</p>`;
        }
        if (character.allies && character.allies.length > 0) {
            detalles += `<p><strong>Aliados:</strong><br>${character.allies.join(', ')}</p>`;
        }
        if (character.enemies && character.enemies.length > 0) {
            detalles += `<p><strong>Enemigos:</strong><br>${character.enemies.join(', ')}</p>`;
        }
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${character.name}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-4">
                                <img src="${character.imageUrl || 'assets/img/notFound.png'}" class="img-fluid rounded" alt="${character.name}">
                            </div>
                            <div class="col-md-8 detalles-modal">
                                ${detalles}
                                <button class="btn btn-secondary mt-3" id="fav-detail-btn" data-id="${character._id}">
                                    ${isAlreadyFavorite ? 'Eliminar de Favoritos' : 'Añadir a Favoritos'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        // Evento para el botón de favoritos en el modal
        setTimeout(() => {
            const favBtn = document.getElementById('fav-detail-btn');
            if (favBtn) {
                favBtn.addEventListener('click', () => {
                    let favorites;
                    try {
                        favorites = JSON.parse(localStorage.getItem('favorites'));
                        if (!Array.isArray(favorites)) favorites = [];
                    } catch {
                        favorites = [];
                    }
                    let isFav = favorites.some(fav => fav._id == character._id);
                    if (!isFav) {
                        favorites.push(character);
                        localStorage.setItem('favorites', JSON.stringify(favorites));
                        favBtn.textContent = 'Eliminar de Favoritos';
                    } else {
                        favorites = favorites.filter(fav => fav._id != character._id);
                        localStorage.setItem('favorites', JSON.stringify(favorites));
                        favBtn.textContent = 'Añadir a Favoritos';
                    }
                    renderFavorites();
                });
            }
        }, 200);
    }).catch(error => {
        loader.classList.add('d-none');
        errorApi.classList.remove('d-none')
    });
}

const addFavorite = (id) => {
    let currentFavorites;
    try {
        currentFavorites = JSON.parse(localStorage.getItem('favorites'));
        if (!Array.isArray(currentFavorites)) currentFavorites = [];
    } catch {
        currentFavorites = [];
    }

    const isAlreadyFavorite = currentFavorites.some(fav => fav._id == id);

    if (!isAlreadyFavorite) {
        const characterToAdd = charactersApi.find(char => char._id == id);
        if (characterToAdd) {
            currentFavorites.push(characterToAdd);
            localStorage.setItem('favorites', JSON.stringify(currentFavorites));
            alert('Personaje añadido a favoritos');
            renderFavorites();
            const btn = document.querySelector(`.favorite-btn[data-id="${id}"]`);
            if (btn) {
                btn.textContent = 'En Favoritos';
                btn.disabled = true;
            } else {
                console.warn('No se encontró el botón de favoritos para id:', id);
            }
        }
    } else {
        alert('Este personaje ya está en favoritos');
    }
}

const addCharacters = (characters) => {
    // Asegurar que el contenedor tenga la clase 'row cards'
    let cardsContainer = document.querySelector('.cards');
    if (!cardsContainer.classList.contains('row')) {
        cardsContainer.classList.add('row');
    }
    cardsContainer.innerHTML = '';
    charactersApi = characters
    characters.forEach(character => {
        // Buscar la primera aparición relevante
        let aparicion = '';
        if (character.films && character.films.length > 0) {
            aparicion = `Película: ${character.films[0]}`;
        } else if (character.tvShows && character.tvShows.length > 0) {
            aparicion = `Serie: ${character.tvShows[0]}`;
        } else if (character.videoGames && character.videoGames.length > 0) {
            aparicion = `Videojuego: ${character.videoGames[0]}`;
        } else {
            aparicion = '';
        }
        // Estructura correcta: columna -> card -> contenido
        const col = document.createElement('div');
        col.className = 'col-12 col-md-4 p-2';
        col.innerHTML = `
            <div class="card h-100">
                <img class="card-img-top" src="${character.imageUrl || 'assets/img/notFound.png'}" alt="${character.name}">
                <div class="card-body">
                    <h5 class="card-title">${character.name}</h5>
                    ${aparicion ? `<p class='card-text'>${aparicion}</p>` : ''}
                    <button class="btn btn-primary detail-btn" data-id="${character._id}">Ver Detalles</button>
                </div>
            </div>
        `;
        cardsContainer.appendChild(col);
    });

    // Agregar event listeners a los botones
    document.querySelectorAll('.detail-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            detailCharacter(id);
        });
    });
}

function renderFavorites() {
    const favoritesList = document.getElementById('favorites-list');
    let favorites;
    try {
        favorites = JSON.parse(localStorage.getItem('favorites'));
        if (!Array.isArray(favorites)) favorites = [];
    } catch {
        favorites = [];
    }

    if (!favorites || favorites.length === 0) {
        favoritesList.innerHTML = '<p class="text-center">No tienes personajes favoritos aún.</p>';
        return;
    }

    // Carrusel manual: 2 por vez, 1 por vez si pantalla <= 500px o height < 800px
    let favPage = 1;
    let favsPerPage = (window.innerWidth <= 500 || window.innerHeight < 800) ? 1 : 2;
    let totalPages = Math.ceil(favorites.length / favsPerPage);

    function showFavPage(page) {
        favsPerPage = (window.innerWidth <= 500 || window.innerHeight < 800) ? 1 : 2;
        totalPages = Math.ceil(favorites.length / favsPerPage);
        favoritesList.innerHTML = '<div class="row justify-content-center" id="fav-cards-row"></div>';
        const row = favoritesList.querySelector('#fav-cards-row');
        const start = (page - 1) * favsPerPage;
        const end = start + favsPerPage;
        const favsToShow = favorites.slice(start, end);
        favsToShow.forEach(character => {
            const col = document.createElement('div');
            col.className = 'col-12 col-md-6 mb-3';
            col.innerHTML = `
                <div class="card h-100 text-center">
                    <div class="fav-img-container">
                        <img src="${character.imageUrl || 'assets/img/notFound.png'}" class="card-img-top fav-img" alt="${character.name}">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${character.name}</h5>
                    </div>
                </div>
            `;
            row.appendChild(col);
        });
        // Controles de paginado/carrusel
        let controls = '';
        if (totalPages > 1) {
            controls = `
                <div class="d-flex justify-content-center align-items-center mt-2 gap-2">
                    <button class="btn btn-outline-primary btn-sm" id="fav-prev" ${page === 1 ? 'disabled' : ''}>&lt;</button>
                    <span class="mx-2">${page} / ${totalPages}</span>
                    <button class="btn btn-outline-primary btn-sm" id="fav-next" ${page === totalPages ? 'disabled' : ''}>&gt;</button>
                </div>
            `;
        }
        favoritesList.innerHTML += controls;
        if (totalPages > 1) {
            document.getElementById('fav-prev').onclick = () => {
                if (favPage > 1) {
                    favPage--;
                    showFavPage(favPage);
                }
            };
            document.getElementById('fav-next').onclick = () => {
                if (favPage < totalPages) {
                    favPage++;
                    showFavPage(favPage);
                }
            };
        }
    }
    showFavPage(favPage);
    // Redibujar al cambiar tamaño de pantalla
    window.addEventListener('resize', () => {
        const newFavsPerPage = (window.innerWidth <= 500 || window.innerHeight < 800) ? 1 : 2;
        if (newFavsPerPage !== favsPerPage) {
            favsPerPage = newFavsPerPage;
            favPage = 1;
            showFavPage(favPage);
        }
    });
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    getAllCharacters();
    
    // Agregar event listener para el buscador
    const searchInput = document.querySelector('#search');
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            search();
        }
    });

    // Evento para abrir el modal de favoritos
    const openFavoritesBtn = document.getElementById('open-favorites');
    if (openFavoritesBtn) {
        openFavoritesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            renderFavorites();
            const modal = new bootstrap.Modal(document.getElementById('favoritesModal'));
            modal.show();
        });
    }
});