// ============================================================
// CORAZÓNCÓDIGO — UI.JS
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
                const { data: count, error } = await window.db
                    .rpc('get_total_paid_orders');
                
                if (count !== null && !error) {
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
// -------------------------------------------------------
// CATEGORY FILTER — TOUCH SWIPE HORIZONTAL (Móvil)
// El body tiene overflow-x:hidden que bloquea el scroll nativo,
// así que manejamos el arrastre manualmente con touch events.
// -------------------------------------------------------
function initCategorySwipe() {
    const el = document.getElementById('catFilters');
    if (!el) return;

    let startX = 0;
    let scrollStart = 0;
    let isDragging = false;

    el.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        scrollStart = el.scrollLeft;
        isDragging = true;
    }, { passive: true });

    el.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const dx = startX - e.touches[0].clientX;
        el.scrollLeft = scrollStart + dx;
    }, { passive: true });

    el.addEventListener('touchend', () => { isDragging = false; }, { passive: true });
}

// -------------------------------------------------------
// ADMIN — ACCESO SECRETO (5 toques en el logo corazón)
// Toca el ❤️ del logo en el navbar 5 veces rápido para abrir admin
// -------------------------------------------------------
function initAdminSecretTap() {
    // El ícono fa-heart dentro del .logo del navbar
    const logoIcon = document.querySelector('.navbar .logo i.fa-heart');
    if (!logoIcon) return;

    let tapCount = 0;
    let tapTimer = null;

    const handler = () => {
        tapCount++;
        clearTimeout(tapTimer);

        if (tapCount >= 5) {
            tapCount = 0;
            window.location.href = 'admin.html';
            return;
        }

        // Resetear si pasan más de 2 segundos sin otro toque
        tapTimer = setTimeout(() => { tapCount = 0; }, 2000);
    };

    // Escuchar tanto click (escritorio) como touchend (móvil)
    logoIcon.addEventListener('click', handler);
    logoIcon.addEventListener('touchend', (e) => {
        e.preventDefault(); // Evita el doble-disparo click+touch
        handler();
    });

    // Hacer el área tocable más grande en móvil
    logoIcon.style.padding = '10px';
    logoIcon.style.cursor = 'pointer';
}

function initUI() {
    initSplash();
    initHamburger();
    initScrollReveal();
    initScrollTop();
    initStatsCounter();
    initCard3DTilt();
    initCategorySwipe();
    initAdminSecretTap();

    // Fallback de seguridad: si algún .reveal no se activa en 2.5s, forzar visible
    setTimeout(() => {
        document.querySelectorAll('.reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible)').forEach(el => {
            el.classList.add('visible');
        });
    }, 2500);
}

// -------------------------------------------------------
// GENERACIÓN DE QR CON DISEÑO COMPLETO (Póster/Tarjeta)
// -------------------------------------------------------
function generateAndDownloadBeautifulQR(rawCanvas, templateName, targetName, isPremium = false) {
    if (!rawCanvas) return;

    // Crear canvas HD
    const width = 1080;
    const height = 1500;
    const poster = document.createElement('canvas');
    poster.width = width;
    poster.height = height;
    const ctx = poster.getContext('2d');

    // 1. Fondo (Gradiente oscuro romántico y tecnológico)
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    if (isPremium) {
        bgGradient.addColorStop(0, '#0f172a'); // slate-900
        bgGradient.addColorStop(1, '#06b6d4'); // cyber-cyan
    } else {
        bgGradient.addColorStop(0, '#1e1b4b'); // indigo-950
        bgGradient.addColorStop(1, '#be185d'); // pink romantic
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Patrón sutil (puntos o rejilla cibernética simple de fondo)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for(let i = 0; i < width; i += 40) {
        for(let j = 0; j < height; j += 40) {
            ctx.beginPath();
            ctx.arc(i, j, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 3. Título Superior (Logo Simulado)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px "Rajdhani", sans-serif';
    ctx.fillText('CorazónCódigo', width / 2, 180);
    ctx.shadowBlur = 0;

    // 4. Subtítulo (Nombre Platilla y Para)
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '50px "Outfit", sans-serif';
    ctx.fillText('🎁 ' + (templateName || 'Un Regalo Especial Digital'), width / 2, 300);

    if (targetName) {
        ctx.fillStyle = isPremium ? '#67e8f9' : '#f9a8d4'; // Cyan o Rosado
        ctx.font = 'italic bold 60px "Outfit", sans-serif';
        ctx.fillText('Para: ' + targetName, width / 2, 380);
    }

    // 5. Contenedor Blanco del QR (Tarjeta de cristal/plástico)
    const boxSize = 650;
    const boxX = (width - boxSize) / 2;
    const boxY = 480;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxSize, boxSize, 40); // Bordes redondeados
    ctx.fill();
    ctx.shadowBlur = 0; // Reset sombra

    // 6. Dibujar el QR source
    ctx.drawImage(rawCanvas, boxX + 40, boxY + 40, boxSize - 80, boxSize - 80);

    // 7. Instrucciones inferiores
    const instrY = boxY + boxSize + 120;
    
    // Paso 1
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 45px "Outfit", sans-serif';
    ctx.fillText('1️⃣ Abre la cámara de tu celular', width / 2, instrY);
    
    // Paso 2
    ctx.fillText('2️⃣ Escanea este código', width / 2, instrY + 80);
    
    // Paso 3
    ctx.fillText('3️⃣ Descubre tu sorpresa animada', width / 2, instrY + 160);

    // 8. Footer (URL)
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '35px "Outfit", sans-serif';
    ctx.fillText('www.lovecode.me', width / 2, height - 80);

    // Generar archivo
    const link = document.createElement("a");
    link.href = poster.toDataURL("image/png");
    link.download = `LoveCode-QR-${templateName || 'Regalo'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
window.generateAndDownloadBeautifulQR = generateAndDownloadBeautifulQR;

