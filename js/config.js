
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
        console.log("Supabase conectado correctamente.");
    }
} catch (e) {
    console.error("Error inicializando Supabase:", e);
}

// ============================================================
// BIBLIOTECA DE MÚSICA (30 canciones locales + opción custom)
// Las músicas se reproducen en streaming dentro de cada
// experiencia — no se ofrecen para descarga.
// ============================================================
const musicLibrary = [
    { name: "506",                          path: "506.mp4" },
    { name: "ADMV",                         path: "ADMV.mp4" },
    { name: "Acuérdate de mi",              path: "Acuerdate de mi.mp4" },
    { name: "Aprender a quererte",          path: "Aprender a quererte.mp4" },
    { name: "Así te pedí",                  path: "Asi te pedi.mp4" },
    { name: "Canción Bonita",               path: "Cancion Bonita.mp4" },
    { name: "Casa en el Aire",              path: "Casa en el Aire.mp4" },
    { name: "Chica Ideal",                  path: "Chica Ideal.mp4" },
    { name: "Confieso",                     path: "Confieso.mp4" },
    { name: "Cuando nadie ve",              path: "Cuando nadie ve.mp4" },
    { name: "Destino",                      path: "Destino.mp4" },
    { name: "Fantasía",                     path: "Fantasia.mp4" },
    { name: "Hoy es un buen día",           path: "Hoy es un buen dia.mp4" },
    { name: "Locuras mías",                 path: "Locuras mias.mp4" },
    { name: "Mar y Bosque",                 path: "Mar y Bosque.mp4" },
    { name: "Mon Amour",                    path: "Mon Amour.mp4" },
    { name: "No se va",                     path: "No se va.mp4" },
    { name: "No te cambiaría",              path: "No te cambiaria.mp4" },
    { name: "Pero te conocí",               path: "Pero te conoci.mp4" },
    { name: "Persona Favorita",             path: "Persona Favorita.mp4" },
    { name: "Poeta",                        path: "Poeta.mp4" },
    { name: "Princesa",                     path: "Princesa.mp4" },
    { name: "Promesa",                      path: "Promesa.mp4" },
    { name: "Rizos",                        path: "Rizos.mp4" },
    { name: "Sirena",                       path: "Sirena.mp4" },
    { name: "Te Amo",                       path: "Te Amo.mp4" },
    { name: "Te voy amar",                  path: "Te voy amar.mp4" },
    { name: "The Reason",                   path: "The Reason.mp4" },
    { name: "The first time",               path: "The first time.mp4" },
    { name: "Vine a buscarte",              path: "Vine a buscarte.mp4" },
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
