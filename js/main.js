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

    // ─── 9. Verificar cupones de regalo (?coupon=) ────────
    const params = new URLSearchParams(window.location.search);
    const coupon = params.get('coupon');
    const tplId  = params.get('tpl');
    if (coupon) {
        // Guardar el cupón para usarlo en el checkout
        localStorage.setItem('cc_pending_coupon', coupon);
        // Si hay una plantilla específica, scrollear a ella o abrirla
        if (tplId) {
            const card = document.querySelector(`.product-card [data-id="${tplId}"]`)?.closest('.product-card');
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                card.style.boxShadow = '0 0 30px var(--accent-purple)';
                setTimeout(() => {
                    const buyBtn = card.querySelector('.btn-comprar');
                    if (buyBtn) buyBtn.click();
                }, 1000);
            }
        }
    }

    // ─── 10. DELEGACIÓN GLOBAL — Botón "Copiar Link" (Gratis) ──
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-copiar-link');
        if (!btn) return;

        e.preventDefault();
        e.stopImmediatePropagation();

        const rawPath   = btn.getAttribute('data-path') || '';
        const name      = btn.getAttribute('data-name') || '';
        const cleanPath = rawPath.replace(/^\.\.\//, '').replace(/^\.\//, '');
        const fullUrl   = window.location.origin + '/' + cleanPath;

        // Cerrar modal previo
        const prev = document.getElementById('_modalLinkShare');
        if (prev) prev.remove();

        // Crear overlay
        const overlay = document.createElement('div');
        overlay.id = '_modalLinkShare';
        overlay.className = 'share-modal-overlay';

        overlay.innerHTML = `
            <div class="share-modal-box">
                <!-- Cerrar -->
                <button id="_mClose" class="share-modal-close">✕</button>

                <!-- Ícono -->
                <div class="share-modal-icon-wrapper">
                    <i class="fa-solid fa-link"></i>
                </div>

                <h3 class="share-modal-title">Tu link gratuito está listo 🎁</h3>
                <p class="share-modal-subtitle">${name}</p>

                <!-- Input + Copiar -->
                <div class="share-modal-input-group">
                    <input id="_mInp" type="text" value="${fullUrl}" readonly class="share-modal-input" onclick="this.select();">
                    <button id="_mCopy" class="share-modal-copy-btn">
                        <i class="fa-solid fa-copy"></i> Copiar
                    </button>
                </div>

                <!-- WhatsApp -->
                <a id="_mWA"
                    href="https://wa.me/?text=${encodeURIComponent('Mira este regalo digital 💌 ' + fullUrl)}"
                    target="_blank" rel="noopener"
                    class="share-modal-wa-btn">
                    <i class="fa-brands fa-whatsapp" style="font-size:1.3rem;"></i> Enviar por WhatsApp
                </a>

                <p class="share-modal-footer-text">Toca el link para seleccionarlo · Cierra al copiar</p>
            </div>
        `;

        document.body.appendChild(overlay);

        // Auto-seleccionar
        const inp = document.getElementById('_mInp');
        setTimeout(() => { inp.focus(); inp.select(); }, 60);

        // Botón Copiar
        document.getElementById('_mCopy').addEventListener('click', function() {
            inp.select();
            const b = this;
            const done = () => {
                b.innerHTML = '<i class="fa-solid fa-check"></i> ¡Copiado!';
                b.style.background = '#059669';
                setTimeout(() => overlay.remove(), 1800);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(fullUrl).then(done).catch(() => { try { document.execCommand('copy'); } catch(ex){} done(); });
            } else {
                try { document.execCommand('copy'); } catch(ex) {}
                done();
            }
        });

        // Cerrar
        document.getElementById('_mClose').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', ev => { if (ev.target === overlay) overlay.remove(); });
    });

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
        if (typeof window.logOrderEvent === 'function' && e.detail?.orderId) {
            window.logOrderEvent(e.detail.orderId, 'purchase_completed', {
                price: e.detail?.price || 0,
                plan: e.detail?.plan || ''
            });
        }
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
    try {
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
    } catch (err) {
        if (typeof window.logFrontendError === 'function') {
            window.logFrontendError('analytics_error', err?.message || 'trackEvent failed', { name, params });
        }
    }
    console.log(`[Analytics] ${name}`, params);
}
window.trackEvent = trackEvent;

