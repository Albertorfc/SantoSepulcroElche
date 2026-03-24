document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const header = document.getElementById('siteHeader');

    // Abrir/Cerrar menú móvil
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            // Bloquear scroll del body al abrir menú
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
    }

    // Efecto de transparencia en el header al hacer scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '10px 0';
            header.style.background = document.body.classList.contains('page-light') 
                ? 'rgba(255, 255, 255, 0.98)' 
                : 'rgba(0, 0, 0, 0.95)';
        } else {
            header.style.padding = '20px 0';
        }
    });
});
