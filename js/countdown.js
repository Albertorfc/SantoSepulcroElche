function updateCountdown() {
    // Fecha objetivo: Viernes Santo 2026 (3 de Abril)
    const targetDate = new Date('April 3, 2026 00:00:00').getTime();
    const now = new Date().getTime();
    const diff = targetDate - now;

    // Si los elementos no existen en esta página, salimos de la función
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

// Script adicional para el año del footer (siempre presente)
window.addEventListener('load', () => {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
});
