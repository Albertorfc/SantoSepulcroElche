// /js/map-utils.js

// 1. Variable global para que base.njk pueda acceder a ella
var map;

// 2. Función para crear el icono único
function getCustomIcon() {
    return L.divIcon({
        html: `<div class="marker-pin"><img src="/img/escudo.webp" alt="Escudo"></div>`,
        className: 'custom-div-icon',
        iconSize: [36, 52],
        iconAnchor: [18, 52],
        popupAnchor: [0, -45]
    });
}

// 3. Función para inicializar el mapa base (sin repetir código)
function initMap(elementId, centerCoords) {
    map = L.map(elementId).setView(centerCoords, 16);
    L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '© Google Maps'
    }).addTo(map);
    return map;
}
