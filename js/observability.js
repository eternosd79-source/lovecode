// ============================================================
// CORAZONCODIGO — OBSERVABILIDAD CLIENTE
// Captura errores globales y rechazos no manejados.
// ============================================================
(function initObservability() {
    function safeLog(type, message, context) {
        if (typeof window.logFrontendError === 'function') {
            window.logFrontendError(type, message, context);
        }
    }

    window.addEventListener('error', (event) => {
        safeLog('window_error', event.message || 'Unknown window error', {
            file: event.filename || '',
            line: event.lineno || 0,
            column: event.colno || 0
        });
    });

    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        const message = typeof reason === 'string'
            ? reason
            : (reason?.message || 'Unhandled rejection');
        safeLog('unhandled_rejection', message, {
            stack: reason?.stack || ''
        });
    });
})();
