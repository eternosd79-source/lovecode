// ===================================
// CONFIGURACIÓN SUPABASE
// ===================================
const supabaseUrl = 'https://qmnbcmioylgmcbzqrjiv.supabase.co';
const supabaseKey = 'sb_publishable_AZWTMqB-hCTA_Oiiu0juAQ_LRyE9gcc';
let db = null; // Renombramos para evitar conflicto con el objeto global 'supabase'

const CONFIG = {
    whatsappNumber: "593990480389",
    supportMsg: "Hola CorazónCódigo! Tengo una pregunta antes de comprar.",
    paymentMsg: (id, name, plan) => `Hola CorazónCódigo! He realizado el pago de mi pedido: ID: [${id}] Cliente: [${name}] Plan: [${plan}] Adjunto el comprobante de transferencia. 💖`
};

try {
    const lib = (typeof supabase !== 'undefined' && supabase.createClient) ? supabase : (typeof supabasejs !== 'undefined' ? supabasejs : null);
    if (lib) {
        db = lib.createClient(supabaseUrl, supabaseKey);
        console.log("Supabase conectado correctamente.");
    }
} catch (e) {
    console.error("Error inicializando Supabase:", e);
}

// ===================================
// BIBLIOTECA DE MÚSICA CURADA (ARCHIVOS LOCALES EN /)
// ===================================
const musicLibrary = [
    { name: "506", path: "506.mp4" },
    { name: "ADMV", path: "ADMV.mp4" },
    { name: "Acuérdate de mi", path: "Acuerdate de mi.mp4" },
    { name: "Aprender a quererte", path: "Aprender a quererte.mp4" },
    { name: "Así te pedí", path: "Asi te pedi.mp4" },
    { name: "Canción Bonita", path: "Cancion Bonita.mp4" },
    { name: "Casa en el Aire", path: "Casa en el Aire.mp4" },
    { name: "Chica Ideal", path: "Chica Ideal.mp4" },
    { name: "Confieso", path: "Confieso.mp4" },
    { name: "Cuando nadie ve", path: "Cuando nadie ve.mp4" },
    { name: "Destino", path: "Destino.mp4" },
    { name: "Fantasía", path: "Fantasia.mp4" },
    { name: "Hoy es un buen día", path: "Hoy es un buen dia.mp4" },
    { name: "Locuras mías", path: "Locuras mias.mp4" },
    { name: "Mar y Bosque", path: "Mar y Bosque.mp4" },
    { name: "Mon Amour", path: "Mon Amour.mp4" },
    { name: "No se va", path: "No se va.mp4" },
    { name: "No te cambiaría", path: "No te cambiaria.mp4" },
    { name: "Pero te conocí", path: "Pero te conoci.mp4" },
    { name: "Persona Favorita", path: "Persona Favorita.mp4" },
    { name: "Poeta", path: "Poeta.mp4" },
    { name: "Princesa", path: "Princesa.mp4" },
    { name: "Promesa", path: "Promesa.mp4" },
    { name: "Rizos", path: "Rizos.mp4" },
    { name: "Sirena", path: "Sirena.mp4" },
    { name: "Te Amo", path: "Te Amo.mp4" },
    { name: "Te voy amar", path: "Te voy amar.mp4" },
    { name: "The Reason", path: "The Reason.mp4" },
    { name: "The first time", path: "The first time.mp4" },
    { name: "Vine a buscarte", path: "Vine a buscarte.mp4" },
    { name: "Personalizada (Pegar link propio)", path: "custom" }
];

// ===================================
// BASE DE DATOS DE PROYECTOS (CATÁLOGO)
// ===================================
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

const catalogData = [
    { 
        id: "arbol", 
        name: "Árbol Flores Doradas", 
        path: "../arbol/index.html", 
        icon: "fa-leaf", 
        color: "#1f0814", 
        badge: "Premium", 
        rating: "5.0", 
        votes: "128", 
        desc: "Árbol mágico de 35,000 hojas doradas. Usa cronómetro.", 
        hasDate: true, 
        photosInfo: "Opcional: Si deseas que pongamos una foto escondida.",
        editableTexts: [
            { id: "title", label: "Título Principal", default: "Flores Amarillas para mi amor" },
            { id: "message", label: "Mensaje Dedicatoria", default: "Si pudiera elegir un lugar seguro, siempre sería a tu lado...", type: "textarea" },
            { id: "timer-intro", label: "Texto sobre Cronómetro", default: "Nuestro amor florece desde hace..." }
        ]
    },
    { 
        id: "agencia", 
        name: "Agencia de Osos", 
        path: "../agencia/index.html", 
        icon: "fa-film", 
        color: "#0b0006", 
        badge: "Suite 3 Actos", 
        rating: "4.9", 
        votes: "85", 
        desc: "Ositos interactivos.", 
        hasDate: false, 
        photosInfo: "Para esta agencia, si quieres, mándanos 2 fotos tuyas.",
        editableTexts: [
            { id: "menu-title", label: "Título del Menú", default: "Regalos del Alma" },
            { id: "menu-subtitle", label: "Subtítulo del Menú", default: "Un momento especial, preparado para ti" },
            { id: "promesaQuestion", label: "Pregunta Acto 1", default: "¿Quieres ser mi amor para siempre?" },
            { id: "yesBtnSan", label: "Botón Sí", default: "Sí, para siempre 💕" },
            { id: "noBtnSan", label: "Botón No", default: "No..." }
        ]
    },
    { 
        id: "burbujas", 
        name: "Razones en Burbujas", 
        path: "../burbujas/index.html", 
        icon: "fa-soap", 
        color: "#00131c", 
        badge: "Interactivo", 
        rating: "4.8", 
        votes: "210", 
        desc: "Rompe burbujas para leer.", 
        hasDate: false, 
        photosInfo: "Puedes enviar 1 foto de recompensa final.",
        editableTexts: [
            { id: "intro-title", label: "Título de Inicio", default: "Razones para Amarte" },
            { id: "intro-sub", label: "Subtítulo de Inicio", default: "Cada burbuja esconde una razón especial... Reviéntalas todas y descúbrelas", type: "textarea" },
            { id: "reveal-title", label: "Título Final", default: "Mis Razones para Amarte" },
            { id: "mural-opening", label: "Apertura del Mural", default: "Te amo porque..." },
            { id: "mural-closing-text", label: "Cierre del Mural", default: "Eres absolutamente todo para mí." },
            { id: "mural-signature", label: "Firma Final", default: "Con amor eterno" }
        ]
    },
    { 
        id: "boulevard", 
        name: "Boulevard Pareja", 
        path: "../Boulevard_Pareja/index.html", 
        icon: "fa-car", 
        color: "#080808", 
        badge: "Cinemático", 
        rating: "5.0", 
        votes: "42", 
        desc: "Coche hacia el boulevard con tu foto.", 
        hasDate: false, 
        photosInfo: "OBLIGATORIO: Necesitas enviarnos 1 Foto clara.",
        editableTexts: [
            { id: "frase-inicio", label: "Frase de Inicio", default: "Hay recuerdos que conducen a lugares especiales...", type: "textarea" },
            { id: "caja-pregunta-h2", label: "Pregunta Boulevard", default: "¿Quieres ir a ver el boulevard conmigo???", selector: "#caja-pregunta h2" },
            { id: "modal-confirmacion-h2", label: "Título Confirmación", default: "Bienvenida a nuestro boulevard", selector: "#modal-confirmacion h2" },
            { id: "modal-confirmacion-p", label: "Texto Confirmación", default: "Donde las personas como yo venimos a sentarnos...", type: "textarea", selector: "#modal-confirmacion p" }
        ]
    },
    { 
        id: "matrix", 
        name: "Lluvia Matrix", 
        path: "../matrix/index.html", 
        icon: "fa-desktop", 
        color: "#1a0515", 
        badge: "Hacker", 
        rating: "4.7", 
        votes: "56", 
        desc: "Código cayendo.", 
        hasDate: true, 
        photosInfo: "Opcional 1 foto secreta.",
        editableTexts: [
            { id: "main-title", label: "Título Principal", default: "System hackeado... My Love..." },
            { id: "sub-title", label: "Subtítulo", default: "Accediendo a mis sentimientos por ti..." }
        ]
    },
    {
        id: "latido",
        name: "Corazón Latido Ruby",
        path: "../latido/index.html",
        icon: "fa-heart-pulse",
        color: "#1a0505",
        badge: "Gratis (24h)",
        rating: "4.9",
        votes: "45",
        desc: "Corazón de cristal latiendo.",
        hasDate: true,
        textRef: "Cada latido es por ti...",
        editableTexts: [
            { id: "mainTitle", label: "Título", default: "Cada latido es por ti..." },
            { id: "date-display", label: "Texto Fecha", default: "Desde que te conocí..." }
        ]
    },
    {
        id: "osos",
        name: "Osito Tirador",
        path: "../osos/index.html",
        icon: "fa-gun",
        color: "#050011",
        badge: "Divertido",
        rating: "4.9",
        votes: "91",
        desc: "Oso disparando corazones.",
        textRef: "Te apunto y te disparo todo mi amor...",
        editableTexts: [
            { id: "shoot-text", label: "Frase del Oso", default: "Te apunto y te disparo todo mi amor..." }
        ]
    },
    {
        id: "unidos",
        name: "Corazones Unidos",
        path: "../unidos/index.html",
        icon: "fa-magnet",
        color: "#03001c",
        badge: "Físicas",
        rating: "4.8",
        votes: "15",
        desc: "Dos universos se fusionan.",
        textRef: "Tú y yo juntos formamos un universo...",
        editableTexts: [
            { id: "union-text", label: "Frase de Unión", default: "Tú y yo juntos formamos un universo..." }
        ]
    },
    {
        id: "libro",
        name: "Libro 3D",
        path: "../libro/index.html",
        icon: "fa-book-open",
        color: "#0a0a0a",
        badge: "3D CSS",
        rating: "4.9",
        votes: "28",
        desc: "Libro interactivo real.",
        hasDate: true,
        textRef: "Paso a paso, página a página... 5 páginas editables.",
        editableTexts: [
            { id: "page1-txt", label: "Página 1", default: "Todo comenzó un día..." },
            { id: "page2-txt", label: "Página 2", default: "Nuestra primera cita fue mágica." },
            { id: "page3-txt", label: "Página 3", default: "Hemos superado cada reto juntos." },
            { id: "page4-txt", label: "Página 4", default: "Y hoy te amo más que ayer." },
            { id: "page5-txt", label: "Página 5", default: "¿Escribimos el siguiente capítulo?" }
        ]
    },
    {
        id: "carta",
        name: "Carta Digital",
        path: "../carta/index.html",
        icon: "fa-envelope-open-text",
        color: "#1e1e1e",
        badge: "Tradicional",
        rating: "4.7",
        votes: "112",
        desc: "Un sobre elegante abriéndose.",
        textRef: "Para ti... (Carta completa de contenido)",
        editableTexts: [
            { id: "letter-title", label: "Título de la Carta", default: "Para el amor de mi vida" },
            { id: "letter-body", label: "Cuerpo de la Carta", default: "Escribe aquí tu carta completa...", type: "textarea" },
            { id: "letter-footer", label: "Firma", default: "Tu por siempre..." }
        ]
    },
    {
        id: "arcade",
        name: "Corazón Galáctico",
        path: "../arcade/index.html",
        icon: "fa-gamepad",
        color: "#0a0a0a",
        badge: "Interactivo",
        rating: "4.9",
        votes: "67",
        desc: "Universo de partículas con corazón de cristal.",
        editableTexts: [
            { id: "header-eyebrow", label: "Ceja Superior", default: "— Para ti —" },
            { id: "main-title", label: "Título Principal", default: "Con todo mi amor" },
            { id: "footer-hint", label: "Frase Inferior", default: "Cada estrella en este cielo eres tú" },
            { id: "btn-text", label: "Texto del Botón", default: "Lo sé, te amo" },
            { id: "ded-title", label: "Título de Dedicatoria", default: "Eres mi razón" },
            { id: "ded-body", label: "Cuerpo Dedicatoria", default: "Eres mi razón favorita de sonreír cada mañana.\nMi lugar favorito en el mundo entero.\nMi hogar, mi calma, mi todo.", type: "textarea" },
            { id: "ded-signature", label: "Firma Final", default: "Con amor eterno" }
        ]
    },
    {
        id: "codeheart",
        name: "Código de Amor",
        path: "../codeheart/index.html",
        icon: "fa-code",
        color: "#0d0d0d",
        badge: "Hacker",
        rating: "4.8",
        votes: "34",
        desc: "Terminal de comandos con corazón ASCII.",
        editableTexts: [
            { id: "terminal-user", label: "Usuario Terminal", default: "root@love" },
            { id: "command-input", label: "Comando a Ejecutar", default: "./run_feelings.sh" },
            { id: "output-text", label: "Respuesta del Sistema", default: "Acceso concedido... Procesando amor...", type: "textarea" }
        ]
    },
    {
        id: "cometa",
        name: "Estrella Fugaz",
        path: "../cometa/index.html",
        icon: "fa-meteor",
        color: "#030A1A",
        badge: "Gratis (24h)",
        rating: "4.9",
        votes: "76",
        desc: "Pide un deseo a la estrella.",
        editableTexts: [
            { id: "wish-title", label: "Título del Deseo", default: "Pedí un deseo..." },
            { id: "wish-result", label: "Resultado del Deseo", default: "...y apareciste tú." }
        ]
    },
    {
        id: "corazon",
        name: "Corazón Partículas",
        path: "../corazon/index.html",
        icon: "fa-heart",
        color: "#000",
        badge: "Premium",
        rating: "5.0",
        votes: "142",
        desc: "Miles de partículas formando un corazón.",
        editableTexts: [
            { id: "overlay-text", label: "Texto Central", default: "Te amo" }
        ]
    },
    {
        id: "corazon3d",
        name: "Corazón 3D Giratorio",
        path: "../corazon3d/index.html",
        icon: "fa-heart",
        color: "#1c0000",
        badge: "Gratis (24h)",
        rating: "5.0",
        votes: "205",
        desc: "Corazón 3D con mensajes orbitando.",
        editableTexts: [
            { id: "orbit-msg1", label: "Mensaje 1 (Órbita)", default: "Eres mi vida" },
            { id: "orbit-msg2", label: "Mensaje 2 (Órbita)", default: "Te extraño" },
            { id: "orbit-msg3", label: "Mensaje 3 (Órbita)", default: "Siempre juntos" }
        ]
    },
    {
        id: "cristal",
        name: "Cristal Mágico",
        path: "../cristal/index.html",
        icon: "fa-gem",
        color: "#0a001a",
        badge: "Interactivo",
        rating: "4.9",
        votes: "55",
        desc: "Gema que brilla con tu toque.",
        editableTexts: [
            { id: "gem-title", label: "Título de la Gema", default: "Nuestra gema preciosa" },
            { id: "gem-desc", label: "Descripción", default: "Tan brillante y eterna como nuestro amor.", type: "textarea" }
        ]
    },
    {
        id: "cupido",
        name: "Flecha de Cupido",
        path: "../cupido/index.html",
        icon: "fa-arrow-right",
        color: "#1a0000",
        badge: "Divertido",
        rating: "4.8",
        votes: "29",
        desc: "Ayuda a Cupido a dar en el blanco.",
        editableTexts: [
            { id: "game-intro", label: "Intro del Juego", default: "¡Apunta al corazón!" },
            { id: "win-msg", label: "Mensaje Ganador", default: "¡Me diste justo en el corazón!" }
        ]
    },
    {
        id: "espacio",
        name: "Viaje Espacial",
        path: "../espacio/index.html",
        icon: "fa-rocket",
        color: "#000011",
        badge: "Cinemático",
        rating: "5.0",
        votes: "93",
        desc: "Navegando entre estrellas y fotos.",
        editableTexts: [
            { id: "space-title", label: "Título Espacial", default: "Viajando por el universo" },
            { id: "space-sub", label: "Subtítulo", default: "Contigo el infinito es pequeño." }
        ]
    },
    {
        id: "estrellas",
        name: "Cielo Estrellado",
        path: "../estrellas/index.html",
        icon: "fa-star",
        color: "#010114",
        badge: "Interactivo",
        rating: "4.9",
        votes: "110",
        desc: "Conecta las estrellas para ver el mensaje.",
        editableTexts: [
            { id: "star-hint", label: "Pista de Inicio", default: "Conecta los puntos..." },
            { id: "star-final", label: "Mensaje Final", default: "Tú eres mi constelación favorita." }
        ]
    },
    {
        id: "flores",
        name: "Ramo de Flores",
        path: "../flores/index.html",
        icon: "fa-seedling",
        color: "#061A0C",
        badge: "Naturaleza",
        rating: "5.0",
        votes: "89",
        desc: "Flores que crecen al pasar el tiempo.",
        editableTexts: [
            { id: "flower-msg", label: "Mensaje de las Flores", default: "Estas flores nunca se marchitarán." }
        ]
    },
    {
        id: "formando",
        name: "Formando el Corazón",
        path: "../formando/index.html",
        icon: "fa-puzzle-piece",
        color: "#1a1a1a",
        badge: "Interactivo",
        rating: "4.7",
        votes: "18",
        desc: "Piezas que se unen para formar vuestro amor.",
        editableTexts: [
            { id: "puzzle-title", label: "Título del Puzzle", default: "Pieza por pieza" },
            { id: "puzzle-final", label: "Mensaje Final", default: "Tú eres la pieza que me faltaba." }
        ]
    },
    {
        id: "galaxia",
        name: "Galaxia Solar",
        path: "../galaxia/index.html",
        icon: "fa-sun",
        color: "#001122",
        badge: "360°",
        rating: "4.8",
        votes: "44",
        desc: "Sistema solar con tus fotos.",
        editableTexts: [
            { id: "sun-title", label: "Título del Sol", default: "Eres el centro de mi mundo" }
        ]
    },
    {
        id: "gatos",
        name: "Gatos Románticos",
        path: "../gatos/index.html",
        icon: "fa-cat",
        color: "#05001a",
        badge: "Divertido",
        rating: "4.9",
        votes: "77",
        desc: "Gatitos mirando la luna.",
        editableTexts: [
            { id: "cat-phrase", label: "Frase de Gatitos", default: "Miau... te quiero mucho" }
        ]
    },
    {
        id: "hacker",
        name: "Hacker de Amor",
        path: "../hacker/index.html",
        icon: "fa-user-secret",
        color: "#000",
        badge: "Hacker",
        rating: "4.8",
        votes: "25",
        desc: "Interfaz de hacking romántica.",
        editableTexts: [
            { id: "hack-title", label: "Título Hack", default: "HACKING HEART..." },
            { id: "hack-progress", label: "Progreso", default: "Descifrando sentimientos..." }
        ]
    },
    {
        id: "jardin",
        name: "Jardín de Luces",
        path: "../jardin/index.html",
        icon: "fa-tree",
        color: "#001a0a",
        badge: "Cinemático",
        rating: "5.0",
        votes: "49",
        desc: "Luciérnagas en un bosque mágico.",
        editableTexts: [
            { id: "garden-title", label: "Título del Jardín", default: "Nuestro jardín secreto" },
            { id: "garden-msg", label: "Mensaje", default: "Donde cada luz es un recuerdo contigo.", type: "textarea" }
        ]
    },
    {
        id: "monitor",
        name: "Monitor Cardíaco",
        path: "../monitor/index.html",
        icon: "fa-heart-pulse",
        color: "#1a0505",
        badge: "Clásico",
        rating: "4.6",
        votes: "33",
        desc: "Tu pulso se acelera por ella.",
        hasDate: true,
        editableTexts: [
            { id: "ekg-title", label: "Título EKG", default: "Mi corazón late por ti" },
            { id: "bpm-text", label: "Texto BPM", default: "Ritmo Cardíaco Acelerado" }
        ]
    },
    {
        id: "neon",
        name: "Letrero Neón",
        path: "../neon/index.html",
        icon: "fa-bolt",
        color: "#110011",
        badge: "Gratis (24h)",
        rating: "4.6",
        votes: "24",
        desc: "Tu nombre en luces de neón.",
        editableTexts: [
            { id: "neon-text", label: "Texto del Neón", default: "TE AMO DANI" }
        ]
    },
    {
        id: "poema",
        name: "Poema Escrito",
        path: "../poema/index.html",
        icon: "fa-pen-nib",
        color: "#1a1a1a",
        badge: "Premium",
        rating: "4.9",
        votes: "82",
        desc: "Pluma escribiendo en pergamino.",
        editableTexts: [
            { id: "poem-title", label: "Título del Poema", default: "Versos para ti" },
            { id: "poem-body", label: "Cuerpo del Poema", default: "Escribe aquí tus versos más románticos...", type: "textarea" }
        ]
    },
    {
        id: "ruleta",
        name: "Ruleta de Citas",
        path: "../ruleta/index.html",
        icon: "fa-compact-disc",
        color: "#220505",
        badge: "Juego",
        rating: "4.5",
        votes: "12",
        desc: "Gira para ver qué haremos hoy.",
        editableTexts: [
            { id: "roulette-title", label: "Título Ruleta", default: "¿Qué haremos hoy?" },
            { id: "option1", label: "Opción 1", default: "Cena romántica" },
            { id: "option2", label: "Opción 2", default: "Ir al cine" },
            { id: "option3", label: "Opción 3", default: "Un beso largo" },
            { id: "option4", label: "Opción 4", default: "Viaje sorpresa" }
        ]
    },
    {
        id: "ventana",
        name: "Ventana al Cielo",
        path: "../ventana/index.html",
        icon: "fa-window-maximize",
        color: "#000a1a",
        badge: "Cinemático",
        rating: "4.9",
        votes: "37",
        desc: "Mirando las estrellas desde la ventana.",
        editableTexts: [
            { id: "window-msg", label: "Frase de la Ventana", default: "Mirando el mismo cielo, pensando en ti." }
        ]
    },
    {
        id: "vibrante",
        name: "Corazón Fuego",
        path: "../vibrante/index.html",
        icon: "fa-fire-flame-curved",
        color: "#000000",
        badge: "Partículas",
        rating: "5.0",
        votes: "67",
        desc: "Energía pura en forma de corazón.",
        editableTexts: [
            { id: "fire-title", label: "Título de Fuego", default: "Mi amor arde por ti" }
        ]
    }
];

// Renderizar tarjetas dinámicamente
function renderCatalog(filter = 'all') {
    const catalogGrid = document.getElementById("catalogGrid");
    if (!catalogGrid) return;
    
    console.log("Renderizando catálogo con filtro:", filter);
    catalogGrid.innerHTML = "";
    
    const itemsToRender = filter === 'all' 
        ? catalogData 
        : catalogData.filter(item => item.badge.includes(filter));

    let gridHTML = "";
    itemsToRender.forEach(item => {
        const isPremium = item.badge.includes('Premium') || item.badge.includes('Suite');
        const isGratis = item.badge.includes('Gratis');

        gridHTML += `
        <div class="product-card">
            <div class="card-image ${isPremium ? 'premium-bg' : ''}" style="background-color: ${item.color};">
                ${isPremium ? '<div class="crown-badge"><i class="fa-solid fa-crown"></i></div>' : ''}
                <i class="fa-solid ${item.icon} screen-icon"></i>
                <img src="../${item.id}/thumb.png" alt="${item.name}" class="card-thumb" onerror="this.style.opacity='0'">
                <span class="preview-badge" style="z-index:2">${item.badge}</span>
            </div>
            <div class="card-body">
                <div class="card-meta">
                    <span class="rating"><i class="fa-solid fa-star"></i> ${item.rating}</span>
                    <span class="votes">(${item.votes} reviews)</span>
                </div>
                <h3>${item.name}</h3>
                <p>${item.desc}</p>
                <div class="card-actions" style="display:flex; flex-direction:column; gap:10px;">
                    <button class="btn-secondary btn-preview" data-id="${item.id}" style="width:100%; border-color: rgba(6,182,212,0.5); color:#06b6d4;"><i class="fa-solid fa-eye"></i> Ver Vista Previa</button>
                    ${isGratis ? `
                        <div style="display:flex; gap:10px;">
                            <button class="btn-copiar-link" data-path="${item.path}" data-name="${item.name}" style="flex:1; display:flex; align-items:center; justify-content:center; background:#10b981; border:none; color:white; border-radius:8px; font-weight:600; font-size:0.85rem; cursor:pointer; padding:10px;"><i class="fa-solid fa-copy" style="margin-right:5px;"></i> Copiar Link</button>
                            <button class="btn-qr-direct" data-id="${item.id}" data-name="${item.name}" style="background:white; color:black; border:none; padding:10px; border-radius:8px; cursor:pointer;"><i class="fa-solid fa-qrcode"></i></button>
                        </div>
                    ` : `
                        <button class="btn-comprar" data-id="${item.id}" data-name="${item.name}"><i class="fa-solid fa-cart-shopping"></i> Comprar / Configurar</button>
                    `}
                </div>
            </div>
        </div>
        `;
    });
    
    catalogGrid.innerHTML = gridHTML;
    attachCatalogListeners();
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("CorazónCódigo: Iniciando App...");
    renderCatalog();
    initProMusicEditor();
    
    // Configurar filtros
    const filters = document.querySelectorAll('.filter-btn');
    filters.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filters.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderCatalog(e.target.getAttribute('data-cat'));
        });
    });
});

// ===================================
// LÓGICA DEL PRO MUSIC EDITOR (NUEVO)
// ===================================
function initProMusicEditor() {
    const selMusic = document.getElementById('selMusic');
    const proEditor = document.getElementById('proMusicEditor');
    const audio = document.getElementById('audioPreviewElement');
    const inpMusic = document.getElementById('inpMusic');

    // Elementos del Editor
    const editorSongName = document.getElementById('editorSongName');
    const editorTimer = document.getElementById('editorTimer');
    const btnPlay = document.getElementById('btnPlayEditor');
    const btnPreviewTrim = document.getElementById('btnPreviewTrimPro');
    
    const waveformBars = document.getElementById('waveformBars');
    const selectionRange = document.getElementById('selectionRange');
    const handleLeft = document.getElementById('handleLeft');
    const handleRight = document.getElementById('handleRight');
    const editorPlayhead = document.getElementById('editorPlayhead');
    const editorProgress = document.getElementById('editorProgress');
    
    const displayStart = document.getElementById('displayStart');
    const displayDuration = document.getElementById('displayDuration');
    const displayEnd = document.getElementById('displayEnd');
    
    const musicStartInp = document.getElementById('musicStart');
    const musicDurationInp = document.getElementById('musicDuration');

    if (!selMusic || !proEditor || !audio) return;

    // 1. Llenar Selector
    selMusic.innerHTML = '<option value="" disabled selected>-- SELECCIONA UNA CANCIÓN --</option>';
    musicLibrary.forEach(song => {
        selMusic.innerHTML += `<option value="${song.path}">${song.name}</option>`;
    });

    let isDragging = null;
    let isTrimTesting = false;
    let dragStartXPercent = 0;

    // Asegurar valores iniciales visuales para evitar NaN
    if (!selectionRange.style.left) selectionRange.style.left = "0%";
    if (!selectionRange.style.width) selectionRange.style.width = "30%";

    // Generar "Waveform" visual aleatoria
    function generateWaveform() {
        waveformBars.innerHTML = '';
        for (let i = 0; i < 70; i++) {
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.height = (Math.random() * 60 + 20) + '%';
            waveformBars.appendChild(bar);
        }
    }

    // Actualizar labels y inputs basándose en la posición visual
    function updateEditorUI() {
        if (!audio.duration || isNaN(audio.duration)) return;

        const leftPos = parseFloat(selectionRange.style.left) || 0;
        const widthPos = parseFloat(selectionRange.style.width) || 30;

        const startSec = (leftPos / 100) * audio.duration;
        const durSec = (widthPos / 100) * audio.duration;
        const endSec = startSec + durSec;

        musicStartInp.value = Math.floor(startSec);
        musicDurationInp.value = Math.floor(durSec);

        displayStart.innerText = formatTime(startSec);
        displayDuration.innerText = Math.floor(durSec) + "s";
        displayEnd.innerText = formatTime(endSec);
        
        handleLeft.querySelector('.handle-tag').innerText = formatTime(startSec);
        handleRight.querySelector('.handle-tag').innerText = formatTime(endSec);
        
        dataForm.musicStart = Math.floor(startSec);
        dataForm.musicDuration = Math.floor(durSec);
    }

    // Función para mover el audio al inicio del recorte
    function syncAudioToRange() {
        if (!audio.duration || isNaN(audio.duration)) return;
        const startSec = (parseFloat(selectionRange.style.left) || 0) / 100 * audio.duration;
        audio.currentTime = startSec;
        updateEditorUI();
    }

    selMusic.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'custom') {
            inpMusic.style.display = 'block';
            proEditor.style.display = 'none';
            audio.pause();
        } else if (val) {
            inpMusic.style.display = 'none';
            proEditor.style.display = 'block';
            editorSongName.innerText = selMusic.options[selMusic.selectedIndex].text;
            
            const lastLeft = selectionRange.style.left || "0%";
            const lastWidth = selectionRange.style.width || "30%";

            audio.src = val;
            audio.load();
            generateWaveform();
            
            audio.onloadedmetadata = () => {
                selectionRange.style.left = lastLeft;
                selectionRange.style.width = lastWidth;
                syncAudioToRange();
            };
        }
    });

    // Drag and Drop
    function handleDrag(e) {
        if (!isDragging) return;
        
        const container = document.getElementById('waveformContainer');
        const rect = container.getBoundingClientRect();
        let x = (e.type.includes('touch') ? e.touches[0].clientX : e.clientX) - rect.left;
        let percent = (x / rect.width) * 100;
        percent = Math.max(0, Math.min(100, percent));

        let currentLeft = parseFloat(selectionRange.style.left) || 0;
        let currentWidth = parseFloat(selectionRange.style.width) || 30;

        if (isDragging === 'left') {
            const rightEdge = currentLeft + currentWidth;
            const newLeft = Math.min(percent, rightEdge - 2);
            selectionRange.style.left = newLeft + "%";
            selectionRange.style.width = (rightEdge - newLeft) + "%";
        } else if (isDragging === 'right') {
            const newWidth = Math.max(2, percent - currentLeft);
            selectionRange.style.width = newWidth + "%";
        } else if (isDragging === 'all') {
            let newLeft = percent - dragStartXPercent;
            newLeft = Math.max(0, Math.min(100 - currentWidth, newLeft));
            selectionRange.style.left = newLeft + "%";
        }

        updateEditorUI();
        if (audio.duration) {
            audio.currentTime = (parseFloat(selectionRange.style.left) / 100) * audio.duration;
        }
    }

    [handleLeft, handleRight].forEach(h => {
        const type = h === handleLeft ? 'left' : 'right';
        h.addEventListener('mousedown', (e) => { e.stopPropagation(); isDragging = type; });
        h.addEventListener('touchstart', (e) => { e.stopPropagation(); isDragging = type; });
    });

    selectionRange.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('handle')) return;
        isDragging = 'all';
        const rect = document.getElementById('waveformContainer').getBoundingClientRect();
        const x = e.clientX - rect.left;
        dragStartXPercent = ((x / rect.width) * 100) - (parseFloat(selectionRange.style.left) || 0);
    });

    // Click en waveform para mover playhead (solo fuera de la selección)
    document.getElementById('waveformContainer').addEventListener('click', (e) => {
        if (isDragging || e.target.closest('#selectionRange')) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (audio.duration) audio.currentTime = (x / rect.width) * audio.duration;
        isTrimTesting = false;
    });

    // REPRODUCCIÓN (PLAY / PAUSE)
    btnPlay.addEventListener('click', (e) => {
        e.preventDefault();
        if (!audio.src || audio.src === "") return;

        if (audio.paused) {
            const leftPercent = parseFloat(selectionRange.style.left) || 0;
            const startSec = (leftPercent / 100) * audio.duration;
            const widthPercent = parseFloat(selectionRange.style.width) || 30;
            const endSec = startSec + ((widthPercent / 100) * audio.duration);

            // SIEMPRE forzar el inicio al punto de recorte al dar Play si estamos fuera de rango
            if (audio.currentTime < startSec - 0.5 || audio.currentTime > endSec + 0.5) {
                audio.currentTime = startSec;
            }

            isTrimTesting = false;
            audio.play().then(() => {
                btnPlay.innerHTML = '<i class="fa-solid fa-pause"></i>';
            }).catch(err => {
                console.warn("Play blocked, retrying...", err);
                audio.load();
                setTimeout(() => {
                    audio.currentTime = startSec;
                    audio.play();
                }, 150);
            });
        } else {
            audio.pause();
            btnPlay.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    });

    // PROBAR RECORTE
    btnPreviewTrim.addEventListener('click', () => {
        if (!audio.duration) return;
        const startSec = (parseFloat(selectionRange.style.left) / 100) * audio.duration;
        audio.currentTime = startSec;
        isTrimTesting = true;
        audio.play().then(() => {
            btnPlay.innerHTML = '<i class="fa-solid fa-pause"></i>';
        });
    });

    // LOOP Y VISUALES
    audio.addEventListener('timeupdate', () => {
        if (!audio.duration || isNaN(audio.duration)) return;

        const progress = (audio.currentTime / audio.duration) * 100;
        editorPlayhead.style.left = progress + "%";
        editorProgress.style.width = progress + "%";
        editorTimer.innerText = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;

        const startSec = (parseFloat(selectionRange.style.left) / 100) * audio.duration;
        const endSec = startSec + ((parseFloat(selectionRange.style.width) / 100) * audio.duration);

        if (isTrimTesting) {
            if (audio.currentTime >= endSec) {
                audio.pause();
                isTrimTesting = false;
                btnPlay.innerHTML = '<i class="fa-solid fa-play"></i>';
                audio.currentTime = startSec;
            }
        } else if (!audio.paused) {
            // LOOP constante dentro de la selección
            // Solo si el audio se sale por MUCHO (más de 1 segundo) del rango, lo regresamos.
            // Esto permite que el usuario escuche lo que eligió sin saltos bruscos inmediatos.
            if (audio.currentTime < startSec - 1.0 || audio.currentTime > endSec + 0.5) {
                audio.currentTime = startSec;
            }
        }
    });

    // Modal de edición de tiempo
    const timeEditModal = document.getElementById('timeEditModal');
    const inpTimeEdit = document.getElementById('inpTimeEdit');
    const btnTimeSave = document.getElementById('btnTimeSave');
    const btnTimeCancel = document.getElementById('btnTimeCancel');
    let activeDisplay = null;

    [displayStart, displayEnd, displayDuration].forEach(display => {
        display.addEventListener('click', () => {
            activeDisplay = display;
            inpTimeEdit.value = display.innerText.replace('s', '');
            timeEditModal.classList.add('active');
            inpTimeEdit.focus();
        });
    });

    btnTimeSave.addEventListener('click', () => {
        let val = inpTimeEdit.value;
        let sec = val.includes(':') ? (parseInt(val.split(':')[0])*60 + (parseInt(val.split(':')[1])||0)) : parseInt(val);
        if (isNaN(sec)) return;

        const total = audio.duration;
        let left = parseFloat(selectionRange.style.left) || 0;
        let width = parseFloat(selectionRange.style.width) || 30;

        if (activeDisplay === displayStart) {
            let newLeft = (sec / total) * 100;
            let currentRight = left + width;
            selectionRange.style.left = newLeft + "%";
            selectionRange.style.width = Math.max(2, currentRight - newLeft) + "%";
        } else if (activeDisplay === displayEnd) {
            selectionRange.style.width = Math.max(2, (sec / total) * 100 - left) + "%";
        } else {
            selectionRange.style.width = Math.max(2, (sec / total) * 100) + "%";
        }
        updateEditorUI();
        syncAudioToRange();
        timeEditModal.classList.remove('active');
    });

    btnTimeCancel.addEventListener('click', () => timeEditModal.classList.remove('active'));
    
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('touchmove', handleDrag);
    window.addEventListener('mouseup', () => isDragging = null);
    window.addEventListener('touchend', () => isDragging = null);
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ===================================
// LÓGICA DE LIVE PREVIEW (IFRAME)
// ===================================
const previewModal = document.getElementById('previewModal');
const btnClosePreview = document.getElementById('btnClosePreview');
const previewIframe = document.getElementById('previewIframe');
const prevTitle = document.getElementById('prevTitle');
const prevOriginalText = document.getElementById('prevOriginalText');
const btnPreviewToBuy = document.getElementById('btnPreviewToBuy');

function attachCatalogListeners() {
    document.querySelectorAll('.btn-preview').forEach(btn => {
        btn.addEventListener('click', (e) => {
            let sid = e.target.closest('button').getAttribute('data-id');
            let data = catalogData.find(x => x.id === sid);
            activePreviewModel = data;
            
            if (prevTitle) prevTitle.innerText = "Vista Previa: " + data.name;
            if (prevOriginalText) prevOriginalText.innerText = data.textRef;
            if (previewIframe) previewIframe.src = data.path;

            // Personalizar botón "Lo Quiero" según categoría
            if (btnPreviewToBuy) {
                if (data.badge.includes('Gratis')) {
                    btnPreviewToBuy.innerHTML = `<i class="fa-solid fa-link"></i> ¡Usar Link Gratis Ahora! 💖`;
                    btnPreviewToBuy.style.background = "#10b981"; // Verde para gratis
                } else {
                    btnPreviewToBuy.innerHTML = `¡Me Encanta, Lo Quiero! ❤`;
                    btnPreviewToBuy.style.background = ""; // Reset a original
                }
            }

            if (previewModal) previewModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Listeners de Comprar
    document.querySelectorAll('.btn-comprar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Solo abrir wizard si no es un link directo (a)
            if (e.target.tagName === 'A') return;
            
            let sName = e.target.closest('button').getAttribute('data-name');
            let sId = e.target.closest('button').getAttribute('data-id');
            activeTemplateInfo = catalogData.find(x => x.id === sId);
            if (typeof openCheckoutWizard === 'function') openCheckoutWizard(sName);
        });
    });

    // ── Listener: Copiar Link Gratis ──────────────────────────
    document.querySelectorAll('.btn-copiar-link').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const rawPath = this.getAttribute('data-path') || '';
            const name    = this.getAttribute('data-name') || '';
            const cleanPath = rawPath.replace(/^\.\.\//, '').replace(/^\.\//, '');
            const fullUrl   = window.location.origin + '/' + cleanPath;

            // Eliminar popup anterior si existe
            const oldPop = document.getElementById('_linkSharePop');
            if (oldPop) { oldPop.remove(); return; }

            // Crear popup con el link
            const pop = document.createElement('div');
            pop.id = '_linkSharePop';
            pop.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#111;border:2px solid #10b981;border-radius:16px;padding:20px 22px;z-index:99999;width:min(380px,90vw);box-shadow:0 12px 40px rgba(0,0,0,0.7);animation:slideUp .3s ease;';
            pop.innerHTML = `
                <style>@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}</style>
                <p style="margin:0 0 10px;color:#10b981;font-weight:700;font-size:0.9rem;">
                    <i class="fa-solid fa-link"></i> Link de ${name}
                </p>
                <div style="display:flex;gap:8px;align-items:center;">
                    <input id="_linkShareInput" type="text" value="${fullUrl}" readonly
                        style="flex:1;background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:9px 12px;color:#fff;font-size:0.8rem;outline:none;cursor:pointer;"
                        onclick="this.select();"
                    >
                    <button id="_btnCopyNow"
                        style="background:#10b981;border:none;color:#fff;padding:9px 16px;border-radius:8px;font-weight:700;cursor:pointer;white-space:nowrap;font-size:0.85rem;">
                        <i class="fa-solid fa-copy"></i> Copiar
                    </button>
                </div>
                <p style="margin:10px 0 0;color:#777;font-size:0.75rem;text-align:center;">
                    📋 Copia y pega directo en WhatsApp
                </p>
                <button onclick="document.getElementById('_linkSharePop').remove()"
                    style="position:absolute;top:10px;right:12px;background:none;border:none;color:#555;cursor:pointer;font-size:1rem;">✕</button>
            `;
            document.body.appendChild(pop);

            // Auto-seleccionar el input
            const inp = document.getElementById('_linkShareInput');
            setTimeout(() => { inp.focus(); inp.select(); }, 50);

            // Botón Copiar dentro del popup
            document.getElementById('_btnCopyNow').addEventListener('click', function() {
                inp.select();
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(fullUrl).then(() => {
                        this.innerHTML = '<i class="fa-solid fa-check"></i> ¡Copiado!';
                        this.style.background = '#059669';
                        setTimeout(() => pop.remove(), 1500);
                    }).catch(() => {
                        document.execCommand('copy');
                        this.innerHTML = '<i class="fa-solid fa-check"></i> ¡Copiado!';
                        setTimeout(() => pop.remove(), 1500);
                    });
                } else {
                    document.execCommand('copy');
                    this.innerHTML = '<i class="fa-solid fa-check"></i> ¡Copiado!';
                    setTimeout(() => pop.remove(), 1500);
                }
            });

            // Cerrar al click fuera
            setTimeout(() => {
                document.addEventListener('click', function closePop(ev) {
                    if (!pop.contains(ev.target)) {
                        pop.remove();
                        document.removeEventListener('click', closePop);
                    }
                });
            }, 200);
        });
    });

    // Listeners de QR Directo para Gratis
    document.querySelectorAll('.btn-qr-direct').forEach(btn => {
        btn.addEventListener('click', (e) => {
            let sId = e.currentTarget.getAttribute('data-id');
            let sName = e.currentTarget.getAttribute('data-name');
            if (typeof showFreeQR === 'function') showFreeQR(sId, sName);
        });
    });
}

if (btnClosePreview) {
    btnClosePreview.addEventListener('click', () => {
        if (previewModal) previewModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        if (previewIframe) previewIframe.src = ""; 
    });
}

// Botón "Me Encanta, Lo quiero" desde el Modal Preview
if (btnPreviewToBuy) {
    btnPreviewToBuy.addEventListener('click', () => {
        const isFree = activePreviewModel && activePreviewModel.badge.includes('Gratis');
        
        if (isFree) {
            // SI ES GRATIS: Abrir directamente el regalo sin pasar por checkout
            if (previewModal) previewModal.classList.remove('active');
            
            // Preguntar por el nombre y mensaje para personalizar el link gratis
            const targetName = prompt("¿Para quién es este regalo? (Ej: Dani)\nDeja vacío para usar el link estándar.");
            const customMsg = prompt("¿Quieres añadir un mensaje o inspiración personalizada?\n(Aparecerá en la animación)");
            
            let finalPath = activePreviewModel.path;
            let params = new URLSearchParams();
            if (targetName) params.append('para', targetName);
            if (customMsg) {
                // Para links gratis, pasamos el mensaje directo por URL (codificado)
                // ya que no hay una orden en la DB todavía.
                params.append('msg', customMsg);
            }
            
            const queryString = params.toString();
            if (queryString) {
                finalPath += (finalPath.includes('?') ? '&' : '?') + queryString;
            }
            
            window.open(finalPath, '_blank');
            document.body.style.overflow = 'auto';
        } else {
            // SI ES DE PAGO: Abrir el wizard de checkout normal
            if (previewModal) previewModal.classList.remove('active');
            if (previewIframe) previewIframe.src = "";
            document.body.style.overflow = 'auto';
            if (activePreviewModel && typeof openCheckoutWizard === 'function') {
                activeTemplateInfo = activePreviewModel; // Sincronizar info de plantilla
                openCheckoutWizard(activePreviewModel.name);
            }
        }
    });
}

// Lógica de Modal QR
const qrModal = document.getElementById('qrModal');
const btnCloseQR = document.getElementById('btnCloseQR');
const qrContainer = document.getElementById('qrContainer');
const qrModalTitle = document.getElementById('qrModalTitle');
const qrDirectLink = document.getElementById('qrDirectLink');

function showFreeQR(id, name) {
    const item = catalogData.find(x => x.id === id);
    const targetName = prompt("¿Para quién es este QR? (Opcional)");
    let fullLink = window.location.origin + "/" + id + "/index.html";
    
    if (targetName) {
        fullLink += "?para=" + encodeURIComponent(targetName);
    }

    qrModalTitle.innerText = "QR: " + name + (targetName ? " para " + targetName : "");
    qrDirectLink.value = fullLink;
    
    qrContainer.innerHTML = "";
    new QRCode(qrContainer, {
        text: fullLink,
        width: 200,
        height: 200,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });

    qrModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

btnCloseQR.addEventListener('click', () => {
    qrModal.classList.remove('active');
    document.body.style.overflow = 'auto';
});

function copyQRLink() {
    const text = qrDirectLink.value;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Link copiado!');
        }).catch(() => {
            qrDirectLink.select();
            document.execCommand('copy');
            alert('Link copiado!');
        });
    } else {
        qrDirectLink.select();
        document.execCommand('copy');
        alert('Link copiado!');
    }
}

// ===================================
// LÓGICA DEL WIZARD (CHECKOUT MODAL)
// ===================================
const modal = document.getElementById('checkoutModal');
const btnCloseWizard = document.getElementById('btnCloseWizard');
const lblSelectedTemplate = document.getElementById('lblSelectedTemplate');
const btnNext = document.getElementById('btnNext');
const btnPrev = document.getElementById('btnPrev');
const btnPreviewCustom = document.getElementById('btnPreviewCustom');
const steps = document.querySelectorAll('.wizard-step');
const dots = document.querySelectorAll('.step-dot');
const progressBar = document.getElementById('progressBar');

// Opciones condicionales plan
const grpPhotos = document.getElementById('grpPhotos');
const grpMusic = document.getElementById('grpMusic');
const multimediaDesc = document.getElementById('multimediaDesc');

let currentStep = 1;
const totalSteps = 4;

function resetWizard() {
    currentStep = 1;
    updateWizardUI();
}

// Listener para Previa Personalizada
if (btnPreviewCustom) {
    btnPreviewCustom.addEventListener('click', () => {
        if (!activeTemplateInfo) return;

        const dateVal = document.getElementById('inpDate') ? document.getElementById('inpDate').value : "";
        
        let finalPath = activeTemplateInfo.path;
        let params = new URLSearchParams();
        
        // Recolectar todos los textos dinámicos
        if (activeTemplateInfo.editableTexts) {
            activeTemplateInfo.editableTexts.forEach(field => {
                const el = document.getElementById(`dyn_${field.id}`);
                if (el) {
                    const val = el.value.trim();
                    if (val) {
                        // Enviar como txt_ID para que personalizar.js lo reconozca
                        params.append(`txt_${field.id}`, val);
                    }
                }
            });
        }

        if (dateVal) params.append('fecha', dateVal);

        // Recolectar fotos del textarea para la previa
        const photosInput = document.getElementById('inpPhotos') ? document.getElementById('inpPhotos').value : "";
        if (photosInput.trim()) {
            // Dividir por comas, espacios o saltos de línea y limpiar links
            const photos = photosInput.split(/[\n, ]+/).filter(link => link.trim().startsWith('http'));
            photos.forEach((url, idx) => {
                if (idx < 10) params.append(`foto${idx + 1}`, url.trim());
            });
        }

        if (dataForm.musicUrl) {
            // Si la música es local (ej: "ADMV.mp4"), anteponer "../"
            let mFinal = dataForm.musicUrl;
            if (!mFinal.startsWith('http')) {
                // Asegurarse de que el path sea relativo a la plantilla
                // Si la música está en d:\PLANTILLA\ventas\ADMV.mp4
                // Y la plantilla en d:\PLANTILLA\arbol\index.html
                // El path relativo correcto es ../ADMV.mp4
                mFinal = "../" + mFinal;
            }
            params.append('musica', mFinal);
            if (dataForm.musicStart) params.append('mStart', dataForm.musicStart);
            if (dataForm.musicDuration) params.append('mDur', dataForm.musicDuration);
        }
        
        const queryString = params.toString();
        if (queryString) {
            finalPath += (finalPath.includes('?') ? '&' : '?') + queryString;
        }

        // Abrir en el modal de preview existente
        if (prevTitle) prevTitle.innerText = "Vista Previa Personalizada: " + activeTemplateInfo.name;
        if (prevOriginalText) prevOriginalText.innerText = "Mostrando tus cambios aplicados...";
        if (previewIframe) previewIframe.src = finalPath;
        
        if (btnPreviewToBuy) btnPreviewToBuy.style.display = "none"; // Ocultar botón comprar en esta vista

        if (previewModal) previewModal.classList.add('active');
    });
}

// Resetear botón comprar al cerrar el modal de previa
if (btnClosePreview) {
    btnClosePreview.addEventListener('click', () => {
        if (previewModal) previewModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        if (previewIframe) previewIframe.src = ""; 
        if (btnPreviewToBuy) btnPreviewToBuy.style.display = "block"; // Volver a mostrar
    });
}

function openCheckoutWizard(templateName) {
    if (lblSelectedTemplate) lblSelectedTemplate.innerText = templateName;
    dataForm.template = templateName;
    
    const container = document.getElementById('dynamicTextContainer');
    if (container && activeTemplateInfo) {
        container.innerHTML = ""; // Limpiar
        
        if (activeTemplateInfo.editableTexts) {
            activeTemplateInfo.editableTexts.forEach(field => {
                const group = document.createElement('div');
                group.className = 'form-group';
                group.style.marginBottom = "15px";
                
                const label = document.createElement('label');
                label.innerText = field.label + ":";
                group.appendChild(label);
                
                if (field.type === "textarea") {
                    const textarea = document.createElement('textarea');
                    textarea.id = `dyn_${field.id}`;
                    textarea.className = 'form-input';
                    textarea.rows = 3;
                    textarea.value = field.default;
                    group.appendChild(textarea);
                } else {
                    const input = document.createElement('input');
                    input.id = `dyn_${field.id}`;
                    input.type = 'text';
                    input.className = 'form-input';
                    input.value = field.default;
                    group.appendChild(input);
                }
                
                container.appendChild(group);
            });
        } else {
            // Fallback Genérico para las plantillas que no tienen mapeo detallado aún
            const fields = [
                { id: "title", label: "Título Principal", default: activeTemplateInfo.name },
                { id: "message", label: "Mensaje / Dedicatoria", default: activeTemplateInfo.textRef, type: "textarea" }
            ];
            fields.forEach(field => {
                const group = document.createElement('div');
                group.className = 'form-group';
                group.style.marginBottom = "15px";
                const label = document.createElement('label');
                label.innerText = field.label + ":";
                group.appendChild(label);
                if (field.type === "textarea") {
                    const textarea = document.createElement('textarea');
                    textarea.id = `dyn_${field.id}`;
                    textarea.className = 'form-input';
                    textarea.rows = 3;
                    textarea.value = field.default;
                    group.appendChild(textarea);
                } else {
                    const input = document.createElement('input');
                    input.id = `dyn_${field.id}`;
                    input.type = 'text';
                    input.className = 'form-input';
                    input.value = field.default;
                    group.appendChild(input);
                }
                container.appendChild(group);
            });
        }
    }

    const optGratis = document.getElementById('optGratis');
    if (activeTemplateInfo && (activeTemplateInfo.badge.includes('Gratis'))) {
        if(optGratis) optGratis.style.display = 'block';
    } else {
        if(optGratis) optGratis.style.display = 'none';
        const basicRadio = document.querySelector('input[name="planType"][value*="Básico"]');
        if(basicRadio) basicRadio.checked = true;
    }

    resetWizard();
    if (modal) modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// --- SISTEMA DE MODAL DE CONFIRMACIÓN PERSONALIZADO ---
const confirmModal = document.getElementById('confirmModal');
const confirmTitle = document.getElementById('confirmTitle');
const confirmMessage = document.getElementById('confirmMessage');
const btnConfirmOk = document.getElementById('btnConfirmOk');
const btnConfirmCancel = document.getElementById('btnConfirmCancel');

let confirmCallback = null;

function showConfirm(title, message, callback) {
    if (!confirmModal) {
        // Fallback si el modal no existe por alguna razón
        if (confirm(message)) callback();
        return;
    }
    confirmTitle.innerText = title;
    confirmMessage.innerText = message;
    confirmCallback = callback;
    confirmModal.classList.add('active');
}

if (btnConfirmOk) {
    btnConfirmOk.addEventListener('click', () => {
        confirmModal.classList.remove('active');
        if (confirmCallback) confirmCallback();
    });
}

if (btnConfirmCancel) {
    btnConfirmCancel.addEventListener('click', () => {
        confirmModal.classList.remove('active');
        confirmCallback = null;
    });
}

if (btnNext) {
    btnNext.addEventListener('click', () => {
        if(currentStep === 1) {
            let selectedRadio = document.querySelector('input[name="planType"]:checked');
            if(!selectedRadio) {
                alert("Por favor selecciona un plan para continuar.");
                return;
            }
            dataForm.plan = selectedRadio.value;
            
            const grpDate = document.getElementById('grpDate');
            if(activeTemplateInfo && activeTemplateInfo.hasDate) {
                if (grpDate) grpDate.style.display = "block";
            } else {
                if (grpDate) grpDate.style.display = "none";
            }

            const grpTextosBase = document.getElementById('grpTextosBase');
            const msgGratis = document.getElementById('msgGratisRestriccion');
            if (dataForm.plan.includes("$0")) {
                if(grpTextosBase) grpTextosBase.style.display = 'none';
                if(msgGratis) msgGratis.style.display = 'block';
            } else {
                if(grpTextosBase) grpTextosBase.style.display = 'block';
                if(msgGratis) msgGratis.style.display = 'none';
            }

            if(dataForm.plan.includes("$3") || dataForm.plan.includes("$0")) {
                if (grpPhotos) grpPhotos.style.display = "none";
                if (grpMusic) grpMusic.style.display = "none";
                if (multimediaDesc) multimediaDesc.innerText = "Este plan no incluye modificaciones de multimedia.";
            } else if (dataForm.plan.includes("$4.50") || dataForm.plan.includes("$5")) {
                if (grpPhotos) grpPhotos.style.display = "block";
                if (grpMusic) grpMusic.style.display = "none";
                if (multimediaDesc) multimediaDesc.innerText = activeTemplateInfo ? activeTemplateInfo.photosInfo : "Ingresa los links de fotos.";
            } else {
                if (grpPhotos) grpPhotos.style.display = "block";
                if (grpMusic) grpMusic.style.display = "block";
                if (multimediaDesc) multimediaDesc.innerText = (activeTemplateInfo ? activeTemplateInfo.photosInfo : "Ingresa fotos") + " + Elige una canción de nuestra lista";
            }

            // Avanzar al siguiente paso
            goToNextStep();

        } else if (currentStep === 2) {
            const target = document.getElementById('inpNombre') ? document.getElementById('inpNombre').value : "";
            const finalTarget = target || (document.getElementById('inpDestino') ? document.getElementById('inpDestino').value : "");
            const msg = document.getElementById('inpMessage') ? document.getElementById('inpMessage').value : "";
            const dateVal = document.getElementById('inpDate') ? document.getElementById('inpDate').value : "";

            // Validación con modal personalizado
            if (!dataForm.plan.includes("$0") && !msg.trim()) {
                showConfirm("Textos Vacíos", "No has escrito ningún mensaje personalizado. ¿Deseas usar los textos por defecto de la plantilla?", () => {
                    dataForm.destino = finalTarget;
                    dataForm.date = dateVal;
                    dataForm.message = msg;
                    goToNextStep();
                });
                return; // Detener flujo hasta que el modal responda
            }

            dataForm.destino = finalTarget;
            dataForm.date = dateVal;
            dataForm.message = msg;
            goToNextStep();

        } else if (currentStep === 3) {
            dataForm.photosUrl = document.getElementById('inpPhotos') ? document.getElementById('inpPhotos').value : "";
            
            const selMusic = document.getElementById('selMusic');
            let mUrl = "";
            if (selMusic && selMusic.value === 'custom') {
                mUrl = document.getElementById('inpMusic') ? document.getElementById('inpMusic').value : "";
            } else if (selMusic && selMusic.value !== "") {
                mUrl = selMusic.value;
            }
            
            const mStart = document.getElementById('musicStart') ? document.getElementById('musicStart').value : 0;
            const mDuration = document.getElementById('musicDuration') ? document.getElementById('musicDuration').value : 30;

            dataForm.musicUrl = mUrl;
            dataForm.musicStart = mStart;
            dataForm.musicDuration = mDuration;

            // Validación de multimedia con modal personalizado
            if ((dataForm.plan.includes("$4.50") || dataForm.plan.includes("$5") || dataForm.plan.includes("$7")) && !dataForm.photosUrl.trim()) {
                showConfirm("Sin Fotos", "Tu plan permite fotos pero no has pegado ningún link. ¿Deseas continuar sin fotos?", () => {
                    if (document.getElementById('sumTemplate')) document.getElementById('sumTemplate').innerText = dataForm.template;
                    if (document.getElementById('sumPlan')) document.getElementById('sumPlan').innerText = dataForm.plan;
                    goToNextStep();
                });
                return;
            }
            
            if (document.getElementById('sumTemplate')) document.getElementById('sumTemplate').innerText = dataForm.template;
            if (document.getElementById('sumPlan')) document.getElementById('sumPlan').innerText = dataForm.plan;
            goToNextStep();
        }
    });
}

function goToNextStep() {
    if(currentStep < totalSteps) {
        currentStep++;
        updateWizardUI();
    }
}

if (btnPrev) {
    btnPrev.addEventListener('click', () => {
        if(currentStep > 1) {
            currentStep--;
            updateWizardUI();
        }
    });
}

function updateWizardUI() {
    steps.forEach((step, idx) => {
        if(idx === currentStep - 1) step.classList.add('active');
        else step.classList.remove('active');
    });
    dots.forEach((dot, idx) => {
        if(idx <= currentStep - 1) dot.classList.add('active');
        else dot.classList.remove('active');
    });
    if (progressBar) progressBar.style.width = (currentStep * 25) + "%";
    
    if (btnPrev && btnNext) {
        if(currentStep === 1) {
            btnPrev.style.visibility = "hidden";
            btnNext.style.display = "block";
        } else if (currentStep === totalSteps) {
            btnPrev.style.visibility = "visible";
            btnNext.style.display = "none";
        } else {
            btnPrev.style.visibility = "visible";
            btnNext.style.display = "block";
        }
    }
}

// Layout Ecuador vs Mundo
const btnTabEcuador = document.getElementById('btnTabEcuador');
const btnTabMundo = document.getElementById('btnTabMundo');
const payEcuador = document.getElementById('payEcuador');
const payMundo = document.getElementById('payMundo');

let isEcuador = true;
if (btnTabEcuador) {
    btnTabEcuador.addEventListener('click', () => {
        isEcuador = true; btnTabEcuador.classList.add('active'); if(btnTabMundo) btnTabMundo.classList.remove('active');
        if(payEcuador) payEcuador.style.display = 'block'; if(payMundo) payMundo.style.display = 'none';
    });
}
if (btnTabMundo) {
    btnTabMundo.addEventListener('click', () => {
        isEcuador = false; btnTabMundo.classList.add('active'); if(btnTabEcuador) btnTabEcuador.classList.remove('active');
        if(payMundo) payMundo.style.display = 'block'; if(payEcuador) payEcuador.style.display = 'none';
    });
}

// Pedido WhatsApp
const btnFinishOrder = document.getElementById('btnFinishOrder');
if (btnFinishOrder) {
    btnFinishOrder.addEventListener('click', async () => {
        if (!activeTemplateInfo) {
            alert("Error: No se detectó la plantilla seleccionada. Por favor cierra y vuelve a intentar.");
            return;
        }

        // Generar un ID temporal por si falla la base de datos
        const tempId = "LC-" + Math.random().toString(36).substr(2, 6).toUpperCase();

        // Extraer el precio numérico del plan
        let price = 0;
        try {
            const priceMatch = dataForm.plan.match(/\$(\d+(\.\d+)?)/);
            if (priceMatch) price = parseFloat(priceMatch[1]);
        } catch (e) {}

        // 1. Intentar guardar en Supabase (Modo Online)
        if (db) {
            try {
                // Intentar obtener UUID de plantilla
                let templateUUID = null;
                const { data: tData } = await db.from('templates').select('id').eq('slug', activeTemplateInfo.id).single();
                if (tData) templateUUID = tData.id;

                // Recolectar textos dinámicos para guardar en la base de datos
                const dynamicTexts = {};
                if (activeTemplateInfo.editableTexts) {
                    activeTemplateInfo.editableTexts.forEach(field => {
                        const el = document.getElementById(`dyn_${field.id}`);
                        if (el) dynamicTexts[field.id] = el.value.trim();
                    });
                } else {
                    // Fallback estándar
                    dynamicTexts['title'] = document.getElementById('dyn_title') ? document.getElementById('dyn_title').value : "";
                    dynamicTexts['message'] = document.getElementById('dyn_message') ? document.getElementById('dyn_message').value : dataForm.message;
                }

                // Recolectar múltiples fotos si el usuario pegó varios links
                const photosInput = document.getElementById('inpPhotos') ? document.getElementById('inpPhotos').value : "";
                const photoArray = photosInput.split(/[\n, ]+/).filter(link => link.trim().startsWith('http'));

                const orderData = {
                    customer_name: dataForm.destino || "Cliente Web",
                    target_name: dataForm.destino || "N/A",
                    plan_name: dataForm.plan,
                    price: price,
                    template_id: templateUUID,
                    template_name: activeTemplateInfo.name,
                    custom_date: dataForm.date || "",
                    custom_message: dataForm.message || "",
                    photo_urls: photoArray.length > 0 ? photoArray : (dataForm.photosUrl ? [dataForm.photosUrl] : []),
                    music_url: dataForm.musicUrl || "",
                    dynamic_texts: dynamicTexts, 
                    status: 'pending'
                };
                
                console.log("Intentando insertar en Supabase:", orderData);

                // Insertar y obtener el resultado
                const { data: insertData, error: insertError } = await db.from('orders').insert([orderData]).select();

                if (insertError) {
                    console.error("Error detallado de Supabase al insertar:", insertError);
                    throw insertError;
                }

                if (insertData && insertData.length > 0) {
                    const newOrder = insertData[0];
                    console.log("Orden guardada con éxito:", newOrder);
                    processFinalOrder(newOrder);
                    return;
                }
            } catch (e) {
                console.warn("Error crítico Supabase, pasando a modo contingencia.");
            }
        }

        // 2. MODO CONTINGENCIA (Si Supabase falla, generamos el pedido igual para no perder la venta)
        console.log("Generando pedido en modo contingencia...");
        const offlineOrder = {
            id: tempId,
            customer_name: dataForm.destino || "Cliente",
            plan_name: dataForm.plan
        };
        
        processFinalOrder(offlineOrder, true);
    });
}

function processFinalOrder(order, isOffline = false) {
    const displayId = isOffline ? order.id : order.id.substring(0, 8).toUpperCase();
    
    // 1. Mostrar el ID en el nuevo modal de éxito
    const successModal = document.getElementById('successModal');
    const displayOrderId = document.getElementById('displayOrderId');
    const btnGoToWA = document.getElementById('btnGoToWA');
    
    if (displayOrderId) displayOrderId.innerText = displayId;
    
    // 2. Preparar el link de WhatsApp
    const waMsg = CONFIG.paymentMsg(displayId, order.customer_name || "Cliente", dataForm.plan);
    const waLink = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(waMsg)}`;
    
    if (btnGoToWA) {
        btnGoToWA.onclick = () => {
            window.open(waLink, '_blank');
            if (successModal) successModal.classList.remove('active');
        };
    }

    // 3. Guardar localmente y mostrar el modal
    localStorage.setItem('lastOrderId', order.id);
    if (successModal) successModal.classList.add('active');

    // 4. Cerrar el modal de checkout original
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) checkoutModal.classList.remove('active');
    document.body.style.overflow = 'hidden'; // Mantener scroll bloqueado para el nuevo modal
}

// ===================================
// LÓGICA DE RASTREO (MIS PEDIDOS)
// ===================================
const btnTrackOrder = document.getElementById('btnTrackOrder');
const inpOrderId = document.getElementById('inpOrderId');
const orderStatusResult = document.getElementById('orderStatusResult');

if (btnTrackOrder) {
    btnTrackOrder.addEventListener('click', async () => {
        const id = inpOrderId.value.trim();
        if(!id) return alert("Por favor ingresa un ID válido.");

        if (!db) return alert("Error de conexión con la base de datos.");

        const { data: order, error } = await db
            .from('orders')
            .or(`id.eq.${id},id.ilike.${id}%`)
            .single();
        
        if (orderStatusResult) {
            orderStatusResult.style.display = 'block';
            orderStatusResult.scrollIntoView({ behavior: 'smooth' });

            if(order) {
                renderOrderStatus(order);
            } else {
                console.error("Error o no encontrado:", error);
                orderStatusResult.innerHTML = `
                    <div class="status-card error">
                        <i class="fa-solid fa-circle-exclamation"></i>
                        <h4>Orden no encontrada</h4>
                        <p>Verifica que el ID sea correcto o contacta a soporte por WhatsApp.</p>
                    </div>
                `;
            }
        }
    });
}

function renderOrderStatus(order) {
    const displayId = order.id.substring(0, 8).toUpperCase();
    
    // Generar el link con el orderId para que la animación cargue todo
    let fullLink = order.final_link || "";
    if (fullLink) {
        // Aseguramos que el link tenga el parámetro orderId
        const separator = fullLink.includes('?') ? '&' : '?';
        fullLink += `${separator}orderId=${order.id}`;
    }

    let statusHTML = `
        <div class="status-card ${order.status}">
            <div class="status-header">
                <span>Orden: <strong>#${displayId}</strong></span>
                <span class="badge-status">${order.status === 'pending' ? '⏳ Pendiente de Pago' : '✅ Pagado'}</span>
            </div>
            <div class="status-body">
                <p><strong>Plantilla:</strong> ${order.template_name}</p>
                <p><strong>Plan:</strong> ${order.plan_name}</p>
                <p><strong>Para:</strong> ${order.target_name || 'N/A'}</p>
                <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:15px 0;">
                
                ${order.status === 'pending' ? `
                    <p class="status-msg">Estamos esperando la validación de tu transferencia. Una vez aprobada, aparecerá aquí tu link o botón de descarga.</p>
                    <button class="btn-whatsapp-sm" onclick="window.open('https://wa.me/00000000000')"><i class="fa-brands fa-whatsapp"></i> Enviar Comprobante</button>
                ` : `
                    <p class="status-msg">¡Tu pago ha sido confirmado! Aquí tienes tu regalo:</p>
                    ${order.plan_name.includes('$7') ? `
                        <button class="btn-primary" onclick="window.open('${order.zip_url || '#'}')"><i class="fa-solid fa-file-zipper"></i> Descargar Código Fuente (.zip)</button>
                    ` : `
                        <div class="final-link-box">
                            <input type="text" readonly value="${fullLink || 'Generando link...'}" id="finalLink">
                            <button onclick="copyLink()"><i class="fa-solid fa-copy"></i> Copiar</button>
                        </div>
                    `}
                `}
            </div>
        </div>
    `;
    orderStatusResult.innerHTML = statusHTML;
}

function copyLink() {
    const copyText = document.getElementById("finalLink");
    const text = copyText ? copyText.value : '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Link copiado al portapapeles');
        }).catch(() => {
            copyText.select();
            document.execCommand('copy');
            alert('Link copiado al portapapeles');
        });
    } else {
        copyText.select();
        document.execCommand('copy');
        alert('Link copiado al portapapeles');
    }
}
