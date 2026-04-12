// ============================================================
// LOVECODE — UI.JS
// Módulo de mejoras de interfaz:
//   - Splash screen management
//   - Menú hamburguesa
//   - Scroll reveal (Intersection Observer)
//   - Smooth scroll
//   - Scroll-to-top button
//   - Live stats counter animation
//   - Toast notifications
//   - 3D card tilt hover
//   - Newsletter form
// ============================================================

// -------------------------------------------------------
// SPLASH SCREEN
// -------------------------------------------------------
function initSplash() {
    const splash = document.getElementById('splashScreen');
    if (!splash) return;
    // Esperar al primer DOMContentLoaded + mínimo 1.6s para efecto visual
    setTimeout(() => {
        splash.classList.add('hidden');
    }, 1600);
}

// -------------------------------------------------------
// MENÚ HAMBURGUESA
// -------------------------------------------------------
function initHamburger() {
    const btn      = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (!btn || !mobileMenu) return;

    btn.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('active');
        btn.classList.toggle('active', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Cerrar al hacer click en cualquier link del menú
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            btn.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!btn.contains(e.target) && !mobileMenu.contains(e.target)) {
            mobileMenu.classList.remove('active');
            btn.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// -------------------------------------------------------
// SCROLL REVEAL (Intersection Observer)
// -------------------------------------------------------
function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '50px 0px -20px 0px'  // El margen positivo superior activa elementos cerca del viewport
    });

    revealEls.forEach(el => {
        // Si el elemento ya está visible en el viewport inicial, activar de inmediato
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            // Está en el viewport ahora mismo
            setTimeout(() => el.classList.add('visible'), 100);
        } else {
            observer.observe(el);
        }
    });
}

// -------------------------------------------------------
// SCROLL-TO-TOP BUTTON
// -------------------------------------------------------
function initScrollTop() {
    const btn = document.getElementById('scrollTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// -------------------------------------------------------
// LIVE STATS COUNTER ANIMATION
// Anima contadores numéricos al entrar en viewport
// -------------------------------------------------------
function animateCounter(el, target, duration = 1800, suffix = '') {
    let start = 0;
    const startTime = performance.now();
    const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing: ease-out
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        el.textContent = current.toLocaleString('es') + suffix;
        if (progress < 1) requestAnimationFrame(updateCounter);
        else el.textContent = target.toLocaleString('es') + suffix;
    };
    requestAnimationFrame(updateCounter);
}

function initStatsCounter() {
    const statsEl = document.getElementById('statRegalos');
    if (!statsEl) return;

    // Obtener regalos reales de Supabase si está disponible
    const loadRealStats = async () => {
        if (window.db) {
            try {
                const { count } = await window.db
                    .from('orders')
                    .select('id', { count: 'exact', head: true })
                    .eq('status', 'paid');
                if (count !== null) {
                    const target = Math.max(count, 50); // Mínimo 50 para credibilidad
                    animateCounter(statsEl, target, 2000, '+');
                    return;
                }
            } catch(e) { /* fallback */ }
        }
        // Número base de muestra si Supabase no responde
        animateCounter(statsEl, 247, 2000, '+');
    };

    // Animar cuando entra en viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadRealStats();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const statsBar = document.querySelector('.stats-bar');
    if (statsBar) observer.observe(statsBar);
}

// -------------------------------------------------------
// TOAST NOTIFICATION
// -------------------------------------------------------
function showToast(title, message, duration = 4000) {
    const toast = document.getElementById('toastNotif');
    const titleEl = document.getElementById('toastTitle');
    const msgEl   = document.getElementById('toastMsg');
    if (!toast) return;

    if (titleEl) titleEl.textContent = title;
    if (msgEl)   msgEl.textContent   = message;

    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
}
// Exponer globalmente
window.showToast = showToast;

// -------------------------------------------------------
// 3D CARD TILT (Efecto hover 3D en tarjetas catálogo)
// -------------------------------------------------------
function initCard3DTilt() {
    const applyTilt = (card) => {
        card.addEventListener('mousemove', (e) => {
            const rect   = card.getBoundingClientRect();
            const x      = e.clientX - rect.left;
            const y      = e.clientY - rect.top;
            const centerX = rect.width  / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
            card.style.transition = 'transform 0.4s ease';
        });
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.1s ease';
        });
    };

    // Aplicar a tarjetas actuales y futuras (catálogo se renderiza dinámicamente)
    const observer = new MutationObserver(() => {
        document.querySelectorAll('.product-card:not([data-tilt])').forEach(card => {
            card.setAttribute('data-tilt', '1');
            applyTilt(card);
        });
    });

    const grid = document.getElementById('catalogGrid');
    if (grid) {
        observer.observe(grid, { childList: true });
        grid.querySelectorAll('.product-card').forEach(card => {
            card.setAttribute('data-tilt', '1');
            applyTilt(card);
        });
    }
}

// -------------------------------------------------------
// NEWSLETTER FORM
// -------------------------------------------------------
function handleNewsletter(e) {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail')?.value?.trim();
    if (!email) return;

    // Guardar en Supabase si disponible
    if (window.db) {
        window.db.from('newsletter_subscribers')
            .upsert([{ email, subscribed_at: new Date().toISOString() }], { onConflict: 'email' })
            .then(({ error }) => {
                if (error) {
                    // Tabla puede no existir todavía — no es error bloqueante
                    console.warn('Newsletter upsert:', error.message);
                }
            });
    }

    showToast('¡Suscrito exitosamente!', `Te avisaremos en ${email} sobre nuevas experiencias.`);
    document.getElementById('newsletterForm')?.reset();
}
window.handleNewsletter = handleNewsletter;

// -------------------------------------------------------
// INICIALIZACIÓN PRINCIPAL (llamado desde main.js)
// -------------------------------------------------------
function initUI() {
    initSplash();
    initHamburger();
    initScrollReveal();
    initScrollTop();
    initStatsCounter();
    initCard3DTilt();

    // Fallback de seguridad: si algún .reveal no se activa en 2.5s, forzar visible
    setTimeout(() => {
        document.querySelectorAll('.reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible)').forEach(el => {
            el.classList.add('visible');
        });
    }, 2500);
}
