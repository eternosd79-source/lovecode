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
        overlay.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,0.8);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;padding:20px;';

        overlay.innerHTML = `
            <div style="
                background:#0f0f0f;
                border:2px solid #10b981;
                border-radius:20px;
                padding:32px 28px 28px;
                width:min(460px,100%);
                box-shadow:0 24px 60px rgba(0,0,0,0.9);
                position:relative;
                text-align:center;
                animation:_su .3s cubic-bezier(.34,1.56,.64,1);
            ">
            <style>@keyframes _su{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}</style>

            <!-- Cerrar -->
            <button id="_mClose" style="position:absolute;top:14px;right:16px;background:none;border:none;color:#666;font-size:1.4rem;cursor:pointer;">✕</button>

            <!-- Ícono -->
            <div style="width:64px;height:64px;background:rgba(16,185,129,0.12);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
                <i class="fa-solid fa-link" style="font-size:1.6rem;color:#10b981;"></i>
            </div>

            <h3 style="margin:0 0 4px;color:#fff;font-size:1.15rem;font-weight:700;">Tu link gratuito está listo 🎁</h3>
            <p style="margin:0 0 22px;color:#666;font-size:0.85rem;">${name}</p>

            <!-- Input + Copiar -->
            <div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;">
                <input id="_mInp" type="text" value="${fullUrl}" readonly
                    style="flex:1;background:#181818;border:1px solid #2e2e2e;border-radius:10px;padding:11px 13px;color:#ccc;font-size:0.78rem;outline:none;cursor:pointer;text-overflow:ellipsis;"
                    onclick="this.select();"
                >
                <button id="_mCopy"
                    style="background:#10b981;border:none;color:#fff;padding:11px 18px;border-radius:10px;font-weight:700;cursor:pointer;font-size:0.85rem;white-space:nowrap;">
                    <i class="fa-solid fa-copy"></i> Copiar
                </button>
            </div>

            <!-- WhatsApp -->
            <a id="_mWA"
                href="https://wa.me/?text=${encodeURIComponent('Mira este regalo digital 💌 ' + fullUrl)}"
                target="_blank" rel="noopener"
                style="display:flex;align-items:center;justify-content:center;gap:10px;background:#25D366;color:#fff;text-decoration:none;padding:13px;border-radius:10px;font-weight:700;font-size:0.9rem;margin-bottom:12px;">
                <i class="fa-brands fa-whatsapp" style="font-size:1.3rem;"></i> Enviar por WhatsApp
            </a>

            <p style="color:#3a3a3a;font-size:0.72rem;margin:0;">Toca el link para seleccionarlo · Cierra al copiar</p>
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

