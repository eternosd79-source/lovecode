// ============================================================
// CORAZÓNCÓDIGO — ENV-CONFIG.JS
// Gestión centralizada y segura de credenciales
// Lee de variables de entorno (prod) o fallback (dev)
// NUNCA hardcodear credenciales en otro archivo
// ============================================================

(function initEnvConfig() {
    // Prioridad: window.__ENV (inyectado en HTML) → fallback (desarrollo)
    const envConfig = window.__ENV || {
        SUPABASE_URL: 'https://qmnbcmioylgmcbzqrjiv.supabase.co',
        SUPABASE_KEY: 'sb_publishable_AZWTMqB-hCTA_Oiiu0juAQ_LRyE9gcc',
        PAYPHONE_LINK: 'https://ppls.me/OZ55yh1MoKs8Re5Ely0FVw',
        WHATSAPP_NUMBER: '593990480389',
        API_VERSION: 'v3.0'
    };

    // Validar que las credenciales críticas existan
    if (!envConfig.SUPABASE_URL || !envConfig.SUPABASE_KEY) {
        console.warn('⚠️ ENV_CONFIG: Usando credenciales de fallback (desarrollo). En producción, define window.__ENV');
    }

    // Exportar bajo window.CC_ENV (namespace seguro)
    window.CC_ENV = Object.freeze(envConfig);
    
    console.log('%c✓ Configuración de entorno cargada', 'color:#06b6d4;font-weight:bold;');
})();

// ============================================================
// GETTER SEGURO para obtener credenciales
// ============================================================
window.getSupabaseConfig = () => ({
    url: window.CC_ENV.SUPABASE_URL,
    key: window.CC_ENV.SUPABASE_KEY
});

window.getConfig = () => ({
    whatsappNumber: window.CC_ENV.WHATSAPP_NUMBER,
    payphoneLink: window.CC_ENV.PAYPHONE_LINK,
    paymentMsg: (id, name, plan) =>
        `Hola CorazónCódigo! He realizado el pago de mi pedido:\n\nID: [${id}]\nCliente: [${name}]\nPlan: [${plan}]\n\nAdjunto el comprobante de transferencia. 💖`
});
