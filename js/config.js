
// ============================================================
// BASE URL DYNAMICS (FIXES GITHUB PAGES TRAILING SLASH)
// ============================================================
function getBaseAppUrl() {
    // Intentar obtener la URL base de forma absoluta y limpia
    let url = window.location.href.split('?')[0].split('#')[0];
    
    // Si termina en un archivo (ej: index.html), lo eliminamos para quedarnos con el directorio
    if (url.match(/\/[^\/]+\.[^\/]+$/)) {
        url = url.substring(0, url.lastIndexOf('/'));
    }
    
    // Asegurar que termine en slash
    if (!url.endsWith('/')) {
        url += '/';
    }
    
    console.log("CC_Core: SITE_BASE_URL detectado como:", url);
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
    payphoneLink: "https://ppls.me/OZ55yh1MoKs8Re5Ely0FVw",
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
// BIBLIOTECA DE MÚSICA (Optimizado: mp3 128kbps para carga rápida)
// ============================================================
const S3_MUSIC_URL = 'https://qmnbcmioylgmcbzqrjiv.supabase.co/storage/v1/object/public/music_library/';

const musicLibrary = [
    { name: "506",                          path: S3_MUSIC_URL + "506.mp3" },
    { name: "ADMV",                         path: S3_MUSIC_URL + "ADMV.mp3" },
    { name: "Acuérdate de mi",              path: S3_MUSIC_URL + "Acuerdate de mi.mp3" },
    { name: "Aprender a quererte",          path: S3_MUSIC_URL + "Aprender a quererte.mp3" },
    { name: "Así te pedí",                  path: S3_MUSIC_URL + "Asi te pedi.mp3" },
    { name: "Canción Bonita",               path: S3_MUSIC_URL + "Cancion Bonita.mp3" },
    { name: "Casa en el Aire",              path: S3_MUSIC_URL + "Casa en el Aire.mp3" },
    { name: "Chica Ideal",                  path: S3_MUSIC_URL + "Chica Ideal.mp3" },
    { name: "Confieso",                     path: S3_MUSIC_URL + "Confieso.mp3" },
    { name: "Cuando nadie ve",              path: S3_MUSIC_URL + "Cuando nadie ve.mp3" },
    { name: "Destino",                      path: S3_MUSIC_URL + "Destino.mp3" },
    { name: "Fantasía",                     path: S3_MUSIC_URL + "Fantasia.mp3" },
    { name: "Hoy es un buen día",           path: S3_MUSIC_URL + "Hoy es un buen dia.mp3" },
    { name: "Locuras mías",                 path: S3_MUSIC_URL + "Locuras mias.mp3" },
    { name: "Mar y Bosque",                 path: S3_MUSIC_URL + "Mar y Bosque.mp3" },
    { name: "Mon Amour",                    path: S3_MUSIC_URL + "Mon amour.mp3" },
    { name: "No se va",                     path: S3_MUSIC_URL + "No se va.mp3" },
    { name: "No te cambiaría",              path: S3_MUSIC_URL + "No te cambiaria.mp3" },
    { name: "Pero te conocí",               path: S3_MUSIC_URL + "Pero te conoci.mp3" },
    { name: "Persona Favorita",             path: S3_MUSIC_URL + "Persona Favorita.mp3" },
    { name: "Poeta",                        path: S3_MUSIC_URL + "Poeta.mp3" },
    { name: "Princesa",                     path: S3_MUSIC_URL + "Princesa.mp3" },
    { name: "Promesa",                      path: S3_MUSIC_URL + "Promesa.mp3" },
    { name: "Rizos",                        path: S3_MUSIC_URL + "Rizos.mp3" },
    { name: "Sirena",                       path: S3_MUSIC_URL + "Sirena.mp3" },
    { name: "Te Amo",                       path: S3_MUSIC_URL + "Te Amo.mp3" },
    { name: "Te voy amar",                  path: S3_MUSIC_URL + "Te voy amar.mp3" },
    { name: "The Reason",                   path: S3_MUSIC_URL + "The Reason.mp3" },
    { name: "The first time",               path: S3_MUSIC_URL + "The first time.mp3" },
    { name: "Vine a buscarte",              path: S3_MUSIC_URL + "Vine a buscarte.mp3" },
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
