// Obtenemos los elementos HTML para manipularlos en el DOM
const listaPokemon = document.getElementById('lista_pokemon');
const modalPokemon = document.getElementById('modal_pokemon');
const detallesPokemon = document.getElementById('detalles_pokemon');
const cerrarModal = document.querySelector('.cerrar');

// Recupera la lista de Pokemones favoritos desde el almacenamiento local o crea una lista vacía
let pokemonesFavoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

// Espera a que el DOM esté completamente cargado y luego ejecuta el código
document.addEventListener('DOMContentLoaded', () => {
  obtenerPokemones();

  // Agrega un evento para cerrar el modal cuando se hace clic en el botón de cerrar
  cerrarModal.addEventListener('click', () => {
    modalPokemon.style.display = 'none';
  });

  // Cierra el modal si el usuario hace clic fuera de él
  window.addEventListener('click', (event) => {
    if (event.target === modalPokemon) {
      modalPokemon.style.display = 'none';
    }
  });
});

// Función para obtener la lista de Pokemones desde la API
function obtenerPokemones() {
  fetch('https://pokeapi.co/api/v2/pokemon?limit=10')
    .then(response => response.json())
    .then(data => {
      const pokemones = data.results;
      // Promise.all para obtener todos los datos antes de continuar
      const promesasPokemones = pokemones.map(pokemon => fetch(pokemon.url).then(res => res.json()));
      
      // Se obtienen todos los Pokémon
      Promise.all(promesasPokemones).then(pokemonesDetalles => {
        // Ordenamos los Pokémon por su ID
        pokemonesDetalles.sort((a, b) => a.id - b.id);
        pokemonesDetalles.forEach(pokemon => mostrarPokemon(pokemon));
      });
    });
}


// Función para obtener los datos detallados de cada Pokémon
function obtenerDatosPokemon(pokemon) {
  fetch(pokemon.url)
    .then(response => response.json())
    .then(data => {
      mostrarPokemon(data);
    });
}

// Función para mostrar la tarjeta de un Pokémon en la lista
function mostrarPokemon(pokemon) {
  const esFavorito = pokemonesFavoritos.includes(pokemon.id);
  const tarjetaPokemon = document.createElement('div');
  tarjetaPokemon.classList.add('pokemon-card');

  // Añade el contenido HTML de la tarjeta del Pokémon
  tarjetaPokemon.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <h3>${pokemon.name}</h3>
    <button class="favorite ${esFavorito ? 'active' : ''}" data-id="${pokemon.id}">
      ${esFavorito ? 'Favorito' : 'Marcar como Favorito'}
    </button>
  `;

  // Cuando se hace clic en la tarjeta, muestra los detalles del Pokémon en un modal
  tarjetaPokemon.addEventListener('click', () => mostrarDetallesPokemon(pokemon));

  // Añade la funcionalidad para marcar o desmarcar un Pokémon como favorito
  const botonFavorito = tarjetaPokemon.querySelector('.favorite');
  botonFavorito.addEventListener('click', (event) => {
    event.stopPropagation();
    alternarFavorito(pokemon.id, botonFavorito);
  });

  // Añade la tarjeta del Pokémon a la lista en el DOM
  listaPokemon.appendChild(tarjetaPokemon);
}

// Función para mostrar los detalles del Pokémon en un modal
function mostrarDetallesPokemon(pokemon) {
  detallesPokemon.innerHTML = `
    <h2>${pokemon.name}</h2>
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <p><strong>Altura:</strong> ${pokemon.height}</p>
    <p><strong>Peso:</strong> ${pokemon.weight}</p>
    <p><strong>Habilidades:</strong> ${pokemon.abilities.map(ability => ability.ability.name).join(', ')}</p>
  `;
  modalPokemon.style.display = 'block';
}

// Función para alternar el estado de favorito de un Pokémon
function alternarFavorito(pokemonId, boton) {
  const index = pokemonesFavoritos.indexOf(pokemonId);
  if (index > -1) {
    pokemonesFavoritos.splice(index, 1);
    boton.classList.remove('active');
    boton.textContent = 'Marcar como Favorito';
  } else {
    pokemonesFavoritos.push(pokemonId);
    boton.classList.add('active');
    boton.textContent = 'Favorito';
  }

  // Guarda la lista de favoritos actualizada en el almacenamiento local
  localStorage.setItem('favoritos', JSON.stringify(pokemonesFavoritos));
}

// Búsqueda de Pokemones por nombre
document.getElementById('buscar').addEventListener('input', function () {
  const valorBusqueda = this.value.toLowerCase();
  const tarjetasPokemon = document.querySelectorAll('.pokemon-card');

  // Filtra las tarjetas mostrando solo aquellas que coincidan con el nombre buscado
  tarjetasPokemon.forEach(tarjeta => {
    const nombrePokemon = tarjeta.querySelector('h3').textContent.toLowerCase();
    tarjeta.style.display = nombrePokemon.includes(valorBusqueda) ? '' : 'none';
  });
});
