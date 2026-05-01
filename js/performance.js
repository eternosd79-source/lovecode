// ============================================================
// CORAZÓNCÓDIGO — PERFORMANCE OPTIMIZATION
// Mejora de Web Vitals: LCP, CLS, FID
// ============================================================

(function initPerformanceOptimizations() {
    'use strict';

    const APP = window.APP;

    // ─────────────────────────────────────────────────────
    // 1. LAZY LOADING DE IMÁGENES
    // ─────────────────────────────────────────────────────
    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const images = document.querySelectorAll('img[data-lazy]');
            
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.dataset.lazy;
                        
                        if (src) {
                            img.src = src;
                            img.removeAttribute('data-lazy');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px'
            });
            
            images.forEach(img => imageObserver.observe(img));
            APP?.Logger?.debug('Lazy loading initialized for ' + images.length + ' images');
        }
    }

    // ─────────────────────────────────────────────────────
    // 2. OPTIMIZACIONES DE SPLASH SCREEN (reducir de 1600ms a 300ms)
    // ─────────────────────────────────────────────────────
    function optimizeSplash() {
        const splash = document.getElementById('splashScreen');
        if (!splash) return;

        // Remover splash mucho más rápido
        function hideSplash() {
            splash.style.opacity = '0';
            splash.style.pointerEvents = 'none';
            setTimeout(() => {
                splash.style.display = 'none';
            }, 300);
        }

        // Mostrar splash solo 300ms (antes 1600ms)
        const splashTimer = setTimeout(hideSplash, 300);

        // O remover cuando el DOM está listo
        if (document.readyState === 'complete') {
            hideSplash();
            clearTimeout(splashTimer);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                // Esperar un poco para que los módulos carguen
                setTimeout(() => {
                    hideSplash();
                    clearTimeout(splashTimer);
                }, 200);
            });
        }
    }

    // ─────────────────────────────────────────────────────
    // 3. SERVICE WORKER PARA CACHING
    // ─────────────────────────────────────────────────────
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(reg => {
                    APP?.Logger?.info('Service Worker registered', { scope: reg.scope });
                })
                .catch(err => {
                    APP?.Logger?.warn('Service Worker registration failed', err);
                });
        }
    }

    // ─────────────────────────────────────────────────────
    // 4. PRELOAD RECURSOS CRÍTICOS
    // ─────────────────────────────────────────────────────
    function addResourceHints() {
        const head = document.head;
        
        // Preload de font crítica
        const fontPreload = document.createElement('link');
        fontPreload.rel = 'preload';
        fontPreload.as = 'font';
        fontPreload.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap';
        fontPreload.type = 'font/woff2';
        fontPreload.crossOrigin = '';
        head.appendChild(fontPreload);

        // DNS Prefetch para CDNs
        const dnsPrefetch = [
            'https://cdnjs.cloudflare.com',
            'https://cdn.jsdelivr.net',
            'https://qmnbcmioylgmcbzqrjiv.supabase.co'
        ];

        dnsPrefetch.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = url;
            head.appendChild(link);
        });

        APP?.Logger?.debug('Resource hints added');
    }

    // ─────────────────────────────────────────────────────
    // 5. MONITOREO DE WEB VITALS (Google Analytics)
    // ─────────────────────────────────────────────────────
    function trackWebVitals() {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            APP?.Logger?.debug('LCP', { value: lastEntry.renderTime || lastEntry.loadTime });
        });

        try {
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            // LCP no soportado
        }

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                    APP?.Logger?.debug('CLS', { accumulated: clsValue });
                }
            }
        });

        try {
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
            // CLS no soportado
        }

        // First Input Delay (FID) / Interaction to Next Paint (INP)
        const fidObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                APP?.Logger?.debug('FID/INP', { processingTime: entry.processingTime });
            }
        });

        try {
            fidObserver.observe({ entryTypes: ['first-input', 'interaction'] });
        } catch (e) {
            // FID/INP no soportado
        }
    }

    // ─────────────────────────────────────────────────────
    // 6. DEFER LOADING DE SCRIPTS NO CRÍTICOS
    // ─────────────────────────────────────────────────────
    function deferNonCriticalScripts() {
        const nonCritical = [
            'js/three-preview.js',
            'js/video-resumen.js'
        ];

        nonCritical.forEach(src => {
            const script = document.createElement('script');
            script.src = src + '?v=1';
            script.defer = true;
            document.body.appendChild(script);
        });

        APP?.Logger?.debug('Non-critical scripts deferred');
    }

    // ─────────────────────────────────────────────────────
    // 7. INICIALIZACIÓN
    // ─────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        optimizeSplash();
        initLazyLoading();
        addResourceHints();
        registerServiceWorker();
        trackWebVitals();

        APP?.Logger?.info('✓ Performance optimizations loaded');
    });
})();
