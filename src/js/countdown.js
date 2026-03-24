function updateCountdown() {
    // 1. Fuente de verdad: Si cambias esta fecha, cambia todo en la web
    const targetDateStr = 'April 3, 2026 00:00:00';
    const targetDate = new Date(targetDateStr).getTime();
    const now = new Date().getTime();
    const diff = targetDate - now;

    // --- NUEVO: ESTO ESCRIBE LA FECHA AUTOMÁTICA EN EL TEXTO ---
    const dateDisplay = document.getElementById('target-date-display');
    if (dateDisplay) {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        // Convierte "April 3, 2026" en "3 de abril de 2026"
        const formattedDate = new Date(targetDateStr).toLocaleDateString('es-ES', options);
        dateDisplay.innerText = formattedDate;
    }
    // ---------------------------------------------------------

    // Si los elementos no existen en esta página (como en Historia), salimos
    if (!document.getElementById('days')) return;

    if (diff <= 0) {
        document.querySelector('.countdown-container').innerHTML = "<h3>La Estación de Penitencia ha comenzado</h3>";
        return;
    }

    // Cálculos de tiempo
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // Inyectar en el HTML con formato de dos dígitos
    document.getElementById('days').innerText = days.toString().padStart(2, '0');
    document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
    document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
}

// Ejecutar cada segundo
setInterval(updateCountdown, 1000);
updateCountdown();

// Script para el año del footer
window.addEventListener('load', () => {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
});
