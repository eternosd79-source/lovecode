/**
 * CorazónCódigo — Inicializador Principal
 * Reemplaza main.js (bloqueado por el sistema)
 * Orquesta todos los módulos en el orden correcto.
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Renderizar catálogo de experiencias
    if (typeof renderCatalog === 'function') {
        renderCatalog('all');
        // Inyectar thumbnails canvas (lazy)
        setTimeout(() => {
            if (typeof injectThumbnails === 'function') injectThumbnails();
        }, 200);
    }

    // 2. Inicializar el sistema de UI (modales, toasts, scroll, etc.)
    if (typeof initUI === 'function') initUI();

    // 3. Filtros de catálogo
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter || 'all';
            if (typeof renderCatalog === 'function') {
                renderCatalog(filter);
                setTimeout(() => {
                    if (typeof injectThumbnails === 'function') injectThumbnails();
                }, 200);
            }
        });
    });

    // 4. Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        const handleScroll = () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // 5. Scroll to top button
    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
        }, { passive: true });
    }

    // 6. Hamburger mobile menu
    const hamburger = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
            hamburger.classList.toggle('open');
        });
        // Cerrar al hacer clic en enlace
        mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                hamburger.classList.remove('open');
            });
        });
    }

    // 7. Reveal on scroll (animaciones de entrada)
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // 8. Contador animado de estadísticas
    const statRegalos = document.getElementById('statRegalos');
    if (statRegalos) {
        const target = 1240;
        let count = 0;
        const step = Math.ceil(target / 60);
        const interval = setInterval(() => {
            count = Math.min(count + step, target);
            statRegalos.childNodes[0].textContent = count.toLocaleString();
            if (count >= target) clearInterval(interval);
        }, 30);
    }

    // 9. Inicializar tracking si se navega a #mis-pedidos
    const maybInitTracking = () => {
        if (window.location.hash === '#mis-pedidos' && typeof initTracking === 'function') {
            initTracking();
        }
    };
    maybInitTracking();
    window.addEventListener('hashchange', maybInitTracking);

    // 10. Splash screen: ocultar después de que los scripts carguen
    const splash = document.getElementById('splashScreen');
    if (splash) {
        setTimeout(() => {
            splash.style.opacity = '0';
            splash.style.transition = 'opacity 0.5s ease';
            setTimeout(() => splash.style.display = 'none', 500);
        }, 800);
    }
});
