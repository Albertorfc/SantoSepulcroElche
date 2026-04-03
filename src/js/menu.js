document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const header = document.getElementById('siteHeader');

    // 1. Abrir/Cerrar menú móvil
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            // Bloquear scroll del body al abrir menú
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
    }

    // 2. Efecto de transparencia en el header al hacer scroll
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

    // 3. EXPERIENCIA DE USUARIO: Cambiar texto si está logueado
    // Lo ponemos al final para que se ejecute una vez cargado todo lo anterior
    if (window.netlifyIdentity) {
        // Comprobamos si hay un usuario activo en Netlify
        const user = netlifyIdentity.currentUser();
        if (user) {
            // Buscamos todos los enlaces que apunten a /miembros/ (tanto desktop como móvil)
            const membersLinks = document.querySelectorAll('a[href="/miembros/"]');
            membersLinks.forEach(link => {
                link.innerHTML = "Área Privada"; // Texto más corto y elegante para el botón
                link.classList.add('is-logged-in'); // Por si quieres darle un color distinto en CSS
            });
        }
    }
});
