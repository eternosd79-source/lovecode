
// ============================================================
// BASE URL DYNAMICS (FIXES GITHUB PAGES TRAILING SLASH)
// ============================================================
function getBaseAppUrl() {
    let url = window.location.href.split('?')[0].split('#')[0];
    if (url.endsWith('.html')) {
        url = url.substring(0, url.lastIndexOf('/'));
    }
    if (!url.endsWith('/')) {
        url += '/';
    }
    return url;
}
window.SITE_BASE_URL = getBaseAppUrl();

// ============================================================
// CORAZÓNCÓDIGO — CONFIG GLOBAL, SUPABASE & BIBLIOTECA DE MÚSICA
// ============================================================

const supabaseUrl = 'https://qmnbcmioylgmcbzqrjiv.supabase.co';
const supabaseKey = 'sb_publishable_AZWTMqB-hCTA_Oiiu0juAQ_LRyE9gcc';
let db = null;

const CONFIG = {
    whatsappNumber: "593990480389",
    supportMsg: "Hola CorazónCódigo! Tengo una pregunta antes de comprar.",
    paymentMsg: (id, name, plan) =>
        `Hola CorazónCódigo! He realizado el pago de mi pedido:\n\nID: [${id}]\nCliente: [${name}]\nPlan: [${plan}]\n\nAdjunto el comprobante de transferencia. 💖`
};

try {
    const lib = (typeof supabase !== 'undefined' && supabase.createClient)
        ? supabase
        : (typeof supabasejs !== 'undefined' ? supabasejs : null);
    if (lib) {
        db = lib.createClient(supabaseUrl, supabaseKey);
        window.db = db; // Exportar explícitamente a window
        console.log("Supabase conectado correctamente.");
    }
} catch (e) {
    console.error("Error inicializando Supabase:", e);
}

// ============================================================
// BIBLIOTECA DE MÚSICA (30 canciones migradas a Supabase Storage)
// ============================================================
const S3_MUSIC_URL = 'https://qmnbcmioylgmcbzqrjiv.supabase.co/storage/v1/object/public/music_library/';

const musicLibrary = [
    { name: "506",                          path: S3_MUSIC_URL + "506.mp4" },
    { name: "ADMV",                         path: S3_MUSIC_URL + "ADMV.mp4" },
    { name: "Acuérdate de mi",              path: S3_MUSIC_URL + "Acuerdate de mi.mp4" },
    { name: "Aprender a quererte",          path: S3_MUSIC_URL + "Aprender a quererte.mp4" },
    { name: "Así te pedí",                  path: S3_MUSIC_URL + "Asi te pedi.mp4" },
    { name: "Canción Bonita",               path: S3_MUSIC_URL + "Cancion Bonita.mp4" },
    { name: "Casa en el Aire",              path: S3_MUSIC_URL + "Casa en el Aire.mp4" },
    { name: "Chica Ideal",                  path: S3_MUSIC_URL + "Chica Ideal.mp4" },
    { name: "Confieso",                     path: S3_MUSIC_URL + "Confieso.mp4" },
    { name: "Cuando nadie ve",              path: S3_MUSIC_URL + "Cuando nadie ve.mp4" },
    { name: "Destino",                      path: S3_MUSIC_URL + "Destino.mp4" },
    { name: "Fantasía",                     path: S3_MUSIC_URL + "Fantasia.mp4" },
    { name: "Hoy es un buen día",           path: S3_MUSIC_URL + "Hoy es un buen dia.mp4" },
    { name: "Locuras mías",                 path: S3_MUSIC_URL + "Locuras mias.mp4" },
    { name: "Mar y Bosque",                 path: S3_MUSIC_URL + "Mar y Bosque.mp4" },
    { name: "Mon Amour",                    path: S3_MUSIC_URL + "Mon amour.mp4" },
    { name: "No se va",                     path: S3_MUSIC_URL + "No se va.mp4" },
    { name: "No te cambiaría",              path: S3_MUSIC_URL + "No te cambiaria.mp4" },
    { name: "Pero te conocí",               path: S3_MUSIC_URL + "Pero te conoci.mp4" },
    { name: "Persona Favorita",             path: S3_MUSIC_URL + "Persona Favorita.mp4" },
    { name: "Poeta",                        path: S3_MUSIC_URL + "Poeta.mp4" },
    { name: "Princesa",                     path: S3_MUSIC_URL + "Princesa.mp4" },
    { name: "Promesa",                      path: S3_MUSIC_URL + "Promesa.mp4" },
    { name: "Rizos",                        path: S3_MUSIC_URL + "Rizos.mp4" },
    { name: "Sirena",                       path: S3_MUSIC_URL + "Sirena.mp4" },
    { name: "Te Amo",                       path: S3_MUSIC_URL + "Te Amo.mp4" },
    { name: "Te voy amar",                  path: S3_MUSIC_URL + "Te voy amar.mp4" },
    { name: "The Reason",                   path: S3_MUSIC_URL + "The Reason.mp4" },
    { name: "The first time",               path: S3_MUSIC_URL + "The first time.mp4" },
    { name: "Vine a buscarte",              path: S3_MUSIC_URL + "Vine a buscarte.mp4" },
    { name: "Personalizada (Pegar link propio)", path: "custom" }
];

// ============================================================
// ESTADO GLOBAL DEL FORMULARIO
// ============================================================
let activePreviewModel = null;
let activeTemplateInfo = null;
let dataForm = {
    template: "",
    plan: "",
    destino: "",
    date: "",
    message: "",
    photosUrl: "",
    musicUrl: "",
    musicStart: 0,
    musicDuration: 30
};

// ============================================================
// OBSERVABILIDAD BÁSICA (cliente)
// ============================================================
function throttleByKey(key, minMs) {
    const now = Date.now();
    const storageKey = `lc_throttle_${key}`;
    const last = Number.parseInt(sessionStorage.getItem(storageKey) || '0', 10);
    if (Number.isFinite(last) && now - last < minMs) return true;
    sessionStorage.setItem(storageKey, String(now));
    return false;
}

async function logOrderEvent(orderId, eventType, payload = {}) {
    if (!db || !orderId || !eventType) return;
    try {
        await db.from('order_events').insert([{
            order_id: orderId,
            event_type: eventType,
            event_payload: payload
        }]);
    } catch (err) {
        console.warn('[Obs] No se pudo registrar order_event:', err?.message || err);
    }
}

async function logFrontendError(errorType, message, context = {}) {
    if (!db || !errorType || !message) return;
    const limiterKey = `${errorType}_${String(message).slice(0, 24)}`;
    if (throttleByKey(limiterKey, 5000)) return;
    try {
        await db.from('frontend_errors').insert([{
            error_type: errorType,
            message: String(message).slice(0, 500),
            context,
            page_url: window.location.href
        }]);
    } catch (err) {
        console.warn('[Obs] No se pudo registrar frontend_error:', err?.message || err);
    }
}

window.logOrderEvent = logOrderEvent;
window.logFrontendError = logFrontendError;
