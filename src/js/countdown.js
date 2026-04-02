/**
 * Algoritmo de Butcher-Gauss para calcular el Viernes Santo
 */
function getViernesSanto(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    // Domingo de Resurrección
    const domingoResurreccion = new Date(year, month - 1, day);
    
    // Restamos 2 días para obtener el Viernes Santo
    const viernesSanto = new Date(domingoResurreccion);
    viernesSanto.setDate(domingoResurreccion.getDate() - 2);
    viernesSanto.setHours(21, 0, 0, 0); // Objetivo: 21:00h
    
    return viernesSanto;
}

function updateCountdown() {
    const now = new Date();
    let year = now.getFullYear();
    let targetDate = getViernesSanto(year);

    // Si ya han pasado más de 3 horas desde el inicio de la procesión actual, 
    // saltamos al año siguiente.
    if (now.getTime() > (targetDate.getTime() + 10800000)) {
        year++;
        targetDate = getViernesSanto(year);
    }

    const diff = targetDate.getTime() - now.getTime();

    // Actualizar texto de la fecha en el HTML
    const dateDisplay = document.getElementById('target-date-display');
    if (dateDisplay) {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        dateDisplay.innerText = targetDate.toLocaleDateString('es-ES', options);
    }

    // Si no estamos en la Home (donde están los IDs del contador), salimos
    if (!document.getElementById('days')) return;

    // Si estamos en plena Estación de Penitencia
    if (diff <= 0 && diff > -10800000) {
        const container = document.querySelector('.countdown-container');
        if (container) {
            container.innerHTML = "<h3 style='color:var(--gold); font-family:\"Playfair Display\", serif; font-size: 24px; width: 100%; text-align: center;'>La Estación de Penitencia ha comenzado</h3>";
        }
        return;
    }

    // CÁLCULOS TEMPORALES
    const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(totalDays / 30.44);
    const days = Math.floor(totalDays % 30.44);
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // INYECTAR EN LOS CÍRCULOS
    if(document.getElementById('months')) document.getElementById('months').innerText = months.toString().padStart(2, '0');
    if(document.getElementById('days')) document.getElementById('days').innerText = days.toString().padStart(2, '0');
    if(document.getElementById('hours')) document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
    if(document.getElementById('minutes')) document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
    if(document.getElementById('seconds')) document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
}

// Iniciar ciclo
setInterval(updateCountdown, 1000);
updateCountdown();

/**
 * Script para el año del footer
 */
window.addEventListener('load', () => {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
});
