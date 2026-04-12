// ============================================================
// CORAZÓNCÓDIGO v3.0 — INICIALIZACIÓN PRINCIPAL
// Punto de entrada: conecta todos los módulos
//
// Orden de carga en index.html:
//   1. config.js     2. catalog.js    3. thumbnails.js
//   4. audio-editor.js 5. preview.js  6. checkout.js
//   7. tracking.js   8. affiliates.js 9. paypal.js
//  10. video-resumen.js 11. ui.js     12. main.js (ÚLTIMO)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('%c❤ CorazónCódigo v3.0', 'color:#f43f5e;font-size:16px;font-weight:bold;');
    console.log('%cInicializando módulos...', 'color:#06b6d4;');

    // ─── 1. Renderizar Catálogo (incluyendo thumbnails) ────
    renderCatalog();

    // ─── 2. Inyectar thumbnails canvas en las tarjetas ────
    if (typeof injectThumbnails === 'function') {
        // Pequeño delay para que el DOM del catálogo esté listo
        requestAnimationFrame(() => injectThumbnails());
    }

    // ─── 3. Inicializar Editor de Música ──────────────────
    if (typeof initProMusicEditor === 'function') {
        initProMusicEditor();
    }

    // ─── 4. Filtros de Categoría ──────────────────────────
    const filters = document.querySelectorAll('.filter-btn');
    filters.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filters.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const cat = e.target.getAttribute('data-cat');
            renderCatalog(cat);
            // Re-inyectar thumbnails tras filtrar
            requestAnimationFrame(() => {
                if (typeof injectThumbnails === 'function') injectThumbnails();
                if (typeof initUI !== 'undefined') initCard3DTilt?.();
            });
        });
    });

    // ─── 5. UI: Splash, Hamburger, Reveal, Scroll, etc. ──
    if (typeof initUI === 'function') {
        initUI();
    }

    // ─── 6. PayPal Tab Listener ───────────────────────────
    if (typeof initPayPalTabListener === 'function') {
        initPayPalTabListener();
    }

    // ─── 7. Video Resumen ─────────────────────────────────
    if (typeof initVideoResumen === 'function') {
        initVideoResumen();
    }

    // ─── 8. Analytics — Eventos Personalizados ───────────
    initAnalyticsEvents();

    // ─── 9. Verificar parámetro ?ref= para afiliados ─────
    // (Ya se captura automáticamente en affiliates.js al cargar)

    // ─── LOG FINAL ────────────────────────────────────────
    console.log(`%c✅ ${catalogData?.length || 31} experiencias | ${musicLibrary?.length - 1 || 30} canciones`, 'color:#10b981;');
});

// ============================================================
// ANALYTICS — Eventos de conversión para Vercel + Meta Pixel
// ============================================================
function initAnalyticsEvents() {
    // Evento: vista de plantilla (cuando abre preview)
    document.addEventListener('corazoncodigo:preview-opened', (e) => {
        trackEvent('view_template', { template: e.detail?.templateId });
    });

    // Evento: inicio de checkout
    document.addEventListener('corazoncodigo:checkout-opened', (e) => {
        trackEvent('begin_checkout', { template: e.detail?.templateId });
    });

    // Evento: pedido completado
    document.addEventListener('corazoncodigo:order-completed', (e) => {
        trackEvent('purchase', {
            value:    e.detail?.price,
            currency: 'USD',
            plan:     e.detail?.plan
        });
    });

    // Evento: scroll hasta catálogo
    const catalogSection = document.getElementById('catalogo');
    if (catalogSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    trackEvent('view_catalog');
                    observer.unobserve(e.target);
                }
            });
        }, { threshold: 0.3 });
        observer.observe(catalogSection);
    }
}

/**
 * Envía evento a Vercel Analytics y/o Meta Pixel si están disponibles
 */
function trackEvent(name, params = {}) {
    // Vercel Analytics
    if (typeof va === 'function') {
        va('event', name, params);
    }
    // Meta Pixel (fbq)
    if (typeof fbq === 'function') {
        const fbEvents = {
            purchase:       () => fbq('track', 'Purchase', { value: params.value, currency: 'USD' }),
            begin_checkout: () => fbq('track', 'InitiateCheckout'),
            view_template:  () => fbq('track', 'ViewContent', { content_name: params.template }),
            view_catalog:   () => fbq('track', 'ViewContent', { content_name: 'catalog' })
        };
        fbEvents[name]?.();
    }
    // TikTok Pixel (ttq)
    if (typeof ttq !== 'undefined') {
        const tiktokEvents = {
            purchase:       () => ttq.track('PlaceAnOrder', { value: params.value, currency: 'USD' }),
            begin_checkout: () => ttq.track('InitiateCheckout'),
            view_catalog:   () => ttq.track('ViewContent')
        };
        tiktokEvents[name]?.();
    }
    console.log(`[Analytics] ${name}`, params);
}
window.trackEvent = trackEvent;

