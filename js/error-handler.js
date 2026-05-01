// ============================================================
// CORAZÓNCÓDIGO — ERROR HANDLER & OBSERVABILITY
// Captura errores globales y los registra de forma centralizada
// ============================================================

(function initErrorHandler() {
    'use strict';

    // Esperar a que APP esté disponible
    const checkApp = setInterval(() => {
        if (!window.APP?.Logger) return;
        clearInterval(checkApp);
        setupErrorHandling();
    }, 100);

    function setupErrorHandling() {
        const APP = window.APP;

        // ─────────────────────────────────────────────────────
        // 1. PERSISTENCIA EN BD DE ERRORES CRÍTICOS
        // ─────────────────────────────────────────────────────
        async function persistErrorToDb(errorType, message, context = {}) {
            try {
                if (window.db) {
                    const pageUrl = window.location.href;
                    if (message && String(message).includes('frontend_errors')) return; // Prevenir loops
                    await window.db.from('frontend_errors').insert([{
                        error_type: errorType,
                        message: String(message).substring(0, 500),
                        context: context,
                        page_url: pageUrl
                    }]);
                }
            } catch (e) {
                console.error("Failed to persist error:", e);
            }
        }

        // ─────────────────────────────────────────────────────
        // 2. ERRORES GLOBALES NO MANEJADOS
        // ─────────────────────────────────────────────────────
        window.addEventListener('error', (event) => {
            const ctx = {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            };
            APP.Logger.error('Uncaught Error', { message: event.message, ...ctx });
            persistErrorToDb('uncaught_error', event.message, ctx);
        });

        // ─────────────────────────────────────────────────────
        // 3. PROMESAS RECHAZADAS SIN MANEJAR
        // ─────────────────────────────────────────────────────
        window.addEventListener('unhandledrejection', (event) => {
            const reason = event.reason;
            const message = typeof reason === 'string' ? reason : reason?.message || 'Unknown rejection';
            const ctx = { reason: String(reason), stack: reason?.stack };
            
            APP.Logger.error('Unhandled Promise Rejection', { message, ...ctx });
            persistErrorToDb('unhandled_rejection', message, ctx);
        });

        // ─────────────────────────────────────────────────────
        // 3. NETWORK ERRORS (fetch/XHR)
        // ─────────────────────────────────────────────────────
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            return originalFetch.apply(this, args)
                .catch(error => {
                    APP.Logger.error('Fetch Error', {
                        url: args[0],
                        method: args[1]?.method || 'GET',
                        error: error.message
                    });
                    throw error;
                });
        };

        // ─────────────────────────────────────────────────────
        // 4. SUPABASE ERRORS
        // ─────────────────────────────────────────────────────
        // Wrapper para detectar errores de Supabase
        window.trackSupabaseError = function(operation, error) {
            if (error) {
                APP.Logger.error(`Supabase ${operation} Error`, {
                    code: error.code,
                    message: error.message,
                    details: error.details
                });
            }
        };

        // ─────────────────────────────────────────────────────
        // 5. PERFORMANCE MONITORING
        // ─────────────────────────────────────────────────────
        if (window.PerformanceObserver) {
            try {
                const perfObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 3000) { // Si > 3s, es lento
                            APP.Logger.warn('Slow resource', {
                                name: entry.name,
                                duration: entry.duration.toFixed(2) + 'ms',
                                type: entry.initiatorType
                            });
                        }
                    }
                });
                
                perfObserver.observe({ entryTypes: ['resource', 'navigation'] });
            } catch (e) {
                // PerformanceObserver no soportado
            }
        }

        // ─────────────────────────────────────────────────────
        // 6. STORAGE ERRORS
        // ─────────────────────────────────────────────────────
        const originalSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function(key, value) {
            try {
                return originalSetItem.call(this, key, value);
            } catch (e) {
                APP.Logger.error('Storage Error (quota exceeded?)', {
                    key,
                    valueLength: String(value).length,
                    error: e.message
                });
                throw e;
            }
        };

        // ─────────────────────────────────────────────────────
        // 7. FUNCIÓN PARA REPORTAR ERRORES MANUALMENTE
        // ─────────────────────────────────────────────────────
        window.reportError = function(title, details, severity = 'error') {
            APP.Logger[severity](title, details);
        };

        APP.Logger.info('✓ Error handler initialized');
    }
})();
