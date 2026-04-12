// ============================================================
// LOVECODE — CATÁLOGO DE 31 EXPERIENCIAS
// ============================================================

const catalogData = [
    {
        id: "arbol",
        name: "Árbol Flores Doradas",
        path: "./arbol/index.html",
        icon: "fa-leaf",
        color: "#1f0814",
        badge: "Premium",
        rating: "5.0",
        votes: "128",
        desc: "Árbol mágico de 35,000 hojas doradas. Usa cronómetro.",
        hasDate: true,
        photosInfo: "Opcional: Si deseas que pongamos una foto escondida.",
        editableTexts: [
            { id: "title",       label: "Título Principal",         default: "Flores Amarillas para mi amor" },
            { id: "message",     label: "Mensaje Dedicatoria",      default: "Si pudiera elegir un lugar seguro, siempre sería a tu lado...", type: "textarea" },
            { id: "timer-intro", label: "Texto sobre Cronómetro",   default: "Nuestro amor florece desde hace..." }
        ]
    },
    {
        id: "perdon_osito",
        name: "Osito Arrepentido",
        path: "./perdon_osito/index.html",
        icon: "fa-heart-crack",
        color: "#1a0505",
        badge: "Reconciliación",
        rating: "5.0",
        votes: "315",
        desc: "Botón evasivo para pedir disculpas de forma imposible de rechazar.",
        hasDate: false,
        photosInfo: "La foto interactiva se revelará si deseas.",
        editableTexts: [
            { id: "msgTitle",  label: "Título de Disculpa",  default: "Sé que me equivoqué..." },
            { id: "msgText",   label: "Razón del Perdón",    default: "Por favor dime que podemos intentarlo una vez más. Prometo hacer las cosas bien.", type: "textarea" },
            { id: "msgTitle2", label: "Título al Perdonarte",default: "¡Gracias mi amor!" },
            { id: "msgText2",  label: "Mensaje Final (SÍ)",  default: "Te juro que no te arrepentirás. Eres lo más importante en mi vida.", type: "textarea" }
        ]
    },
    {
        id: "agencia",
        name: "Agencia de Osos",
        path: "./agencia/index.html",
        icon: "fa-film",
        color: "#0b0006",
        badge: "Suite 3 Actos",
        rating: "4.9",
        votes: "85",
        desc: "Ositos interactivos.",
        hasDate: false,
        photosInfo: "Para esta agencia, si quieres, mándanos 2 fotos tuyas.",
        editableTexts: [
            { id: "menu-title",     label: "Título del Menú",     default: "Regalos del Alma" },
            { id: "menu-subtitle",  label: "Subtítulo del Menú",  default: "Un momento especial, preparado para ti" },
            { id: "promesaQuestion",label: "Pregunta Acto 1",     default: "¿Quieres ser mi amor para siempre?" },
            { id: "yesBtnSan",      label: "Botón Sí",            default: "Sí, para siempre 💕" },
            { id: "noBtnSan",       label: "Botón No",            default: "No..." }
        ]
    },
    {
        id: "burbujas",
        name: "Razones en Burbujas",
        path: "./burbujas/index.html",
        icon: "fa-soap",
        color: "#00131c",
        badge: "Interactivo",
        rating: "4.8",
        votes: "210",
        desc: "Rompe burbujas para leer.",
        hasDate: false,
        photosInfo: "Puedes enviar 1 foto de recompensa final.",
        editableTexts: [
            { id: "intro-title",        label: "Título de Inicio",      default: "Razones para Amarte" },
            { id: "intro-sub",          label: "Subtítulo de Inicio",   default: "Cada burbuja esconde una razón especial... Reviéntalas todas y descúbrelas", type: "textarea" },
            { id: "reveal-title",       label: "Título Final",          default: "Mis Razones para Amarte" },
            { id: "mural-opening",      label: "Apertura del Mural",    default: "Te amo porque..." },
            { id: "mural-closing-text", label: "Cierre del Mural",      default: "Eres absolutamente todo para mí." },
            { id: "mural-signature",    label: "Firma Final",           default: "Con amor eterno" }
        ]
    },
    {
        id: "boulevard",
        name: "Boulevard Pareja",
        path: "./Boulevard_Pareja/index.html",
        icon: "fa-car",
        color: "#080808",
        badge: "Cinemático",
        rating: "5.0",
        votes: "42",
        desc: "Coche hacia el boulevard con tu foto.",
        hasDate: false,
        photosInfo: "OBLIGATORIO: Necesitas enviarnos 1 Foto clara.",
        editableTexts: [
            { id: "frase-inicio",          label: "Frase de Inicio",       default: "Hay recuerdos que conducen a lugares especiales...", type: "textarea" },
            { id: "caja-pregunta-h2",      label: "Pregunta Boulevard",    default: "¿Quieres ir a ver el boulevard conmigo???", selector: "#caja-pregunta h2" },
            { id: "modal-confirmacion-h2", label: "Título Confirmación",   default: "Bienvenida a nuestro boulevard", selector: "#modal-confirmacion h2" },
            { id: "modal-confirmacion-p",  label: "Texto Confirmación",    default: "Donde las personas como yo venimos a sentarnos...", type: "textarea", selector: "#modal-confirmacion p" }
        ]
    },
    {
        id: "matrix",
        name: "Lluvia Matrix",
        path: "./matrix/index.html",
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
            { id: "sub-title",  label: "Subtítulo",        default: "Accediendo a mis sentimientos por ti..." }
        ]
    },
    {
        id: "latido",
        name: "Corazón Latido Ruby",
        path: "./latido/index.html",
        icon: "fa-heart-pulse",
        color: "#1a0505",
        badge: "Gratis (24h)",
        rating: "4.9",
        votes: "45",
        desc: "Corazón de cristal latiendo.",
        hasDate: true,
        textRef: "Cada latido es por ti...",
        editableTexts: [
            { id: "mainTitle",    label: "Título",      default: "Cada latido es por ti..." },
            { id: "date-display", label: "Texto Fecha", default: "Desde que te conocí..." }
        ]
    },
    {
        id: "osos",
        name: "Osito Tirador",
        path: "./osos/index.html",
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
        path: "./unidos/index.html",
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
        path: "./libro/index.html",
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
        path: "./carta/index.html",
        icon: "fa-envelope-open-text",
        color: "#1e1e1e",
        badge: "Tradicional",
        rating: "4.7",
        votes: "112",
        desc: "Un sobre elegante abriéndose.",
        textRef: "Para ti... (Carta completa de contenido)",
        editableTexts: [
            { id: "letter-title",  label: "Título de la Carta",  default: "Para el amor de mi vida" },
            { id: "letter-body",   label: "Cuerpo de la Carta",  default: "Escribe aquí tu carta completa...", type: "textarea" },
            { id: "letter-footer", label: "Firma",               default: "Tu por siempre..." }
        ]
    },
    {
        id: "arcade",
        name: "Corazón Galáctico",
        path: "./arcade/index.html",
        icon: "fa-gamepad",
        color: "#0a0a0a",
        badge: "Interactivo",
        rating: "4.9",
        votes: "67",
        desc: "Universo de partículas con corazón de cristal.",
        editableTexts: [
            { id: "header-eyebrow", label: "Ceja Superior",      default: "— Para ti —" },
            { id: "main-title",     label: "Título Principal",   default: "Con todo mi amor" },
            { id: "footer-hint",    label: "Frase Inferior",     default: "Cada estrella en este cielo eres tú" },
            { id: "btn-text",       label: "Texto del Botón",    default: "Lo sé, te amo" },
            { id: "ded-title",      label: "Título Dedicatoria", default: "Eres mi razón" },
            { id: "ded-body",       label: "Cuerpo Dedicatoria", default: "Eres mi razón favorita de sonreír cada mañana.\nMi lugar favorito en el mundo entero.\nMi hogar, mi calma, mi todo.", type: "textarea" },
            { id: "ded-signature",  label: "Firma Final",        default: "Con amor eterno" }
        ]
    },
    {
        id: "codeheart",
        name: "Código de Amor",
        path: "./codeheart/index.html",
        icon: "fa-code",
        color: "#0d0d0d",
        badge: "Hacker",
        rating: "4.8",
        votes: "34",
        desc: "Terminal de comandos con corazón ASCII.",
        editableTexts: [
            { id: "terminal-user",  label: "Usuario Terminal",      default: "root@love" },
            { id: "command-input",  label: "Comando a Ejecutar",    default: "./run_feelings.sh" },
            { id: "output-text",    label: "Respuesta del Sistema", default: "Acceso concedido... Procesando amor...", type: "textarea" }
        ]
    },
    {
        id: "cometa",
        name: "Estrella Fugaz",
        path: "./cometa/index.html",
        icon: "fa-meteor",
        color: "#030A1A",
        badge: "Gratis (24h)",
        rating: "4.9",
        votes: "76",
        desc: "Pide un deseo a la estrella.",
        editableTexts: [
            { id: "wish-title",  label: "Título del Deseo",     default: "Pedí un deseo..." },
            { id: "wish-result", label: "Resultado del Deseo",  default: "...y apareciste tú." }
        ]
    },
    {
        id: "corazon",
        name: "Corazón Partículas",
        path: "./corazon/index.html",
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
        path: "./corazon3d/index.html",
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
        path: "./cristal/index.html",
        icon: "fa-gem",
        color: "#0a001a",
        badge: "Interactivo",
        rating: "4.9",
        votes: "55",
        desc: "Gema que brilla con tu toque.",
        editableTexts: [
            { id: "gem-title", label: "Título de la Gema", default: "Nuestra gema preciosa" },
            { id: "gem-desc",  label: "Descripción",       default: "Tan brillante y eterna como nuestro amor.", type: "textarea" }
        ]
    },
    {
        id: "cupido",
        name: "Flecha de Cupido",
        path: "./cupido/index.html",
        icon: "fa-arrow-right",
        color: "#1a0000",
        badge: "Divertido",
        rating: "4.8",
        votes: "29",
        desc: "Ayuda a Cupido a dar en el blanco.",
        editableTexts: [
            { id: "game-intro", label: "Intro del Juego", default: "¡Apunta al corazón!" },
            { id: "win-msg",    label: "Mensaje Ganador", default: "¡Me diste justo en el corazón!" }
        ]
    },
    {
        id: "espacio",
        name: "Viaje Espacial",
        path: "./espacio/index.html",
        icon: "fa-rocket",
        color: "#000011",
        badge: "Cinemático",
        rating: "5.0",
        votes: "93",
        desc: "Navegando entre estrellas y fotos.",
        editableTexts: [
            { id: "space-title", label: "Título Espacial", default: "Viajando por el universo" },
            { id: "space-sub",   label: "Subtítulo",       default: "Contigo el infinito es pequeño." }
        ]
    },
    {
        id: "estrellas",
        name: "Cielo Estrellado",
        path: "./estrellas/index.html",
        icon: "fa-star",
        color: "#010114",
        badge: "Interactivo",
        rating: "4.9",
        votes: "110",
        desc: "Conecta las estrellas para ver el mensaje.",
        editableTexts: [
            { id: "star-hint",  label: "Pista de Inicio", default: "Conecta los puntos..." },
            { id: "star-final", label: "Mensaje Final",   default: "Tú eres mi constelación favorita." }
        ]
    },
    {
        id: "flores",
        name: "Ramo de Flores",
        path: "./flores/index.html",
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
        path: "./formando/index.html",
        icon: "fa-puzzle-piece",
        color: "#1a1a1a",
        badge: "Interactivo",
        rating: "4.7",
        votes: "18",
        desc: "Piezas que se unen para formar vuestro amor.",
        editableTexts: [
            { id: "puzzle-title", label: "Título del Puzzle", default: "Pieza por pieza" },
            { id: "puzzle-final", label: "Mensaje Final",     default: "Tú eres la pieza que me faltaba." }
        ]
    },
    {
        id: "galaxia",
        name: "Galaxia Solar",
        path: "./galaxia/index.html",
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
        path: "./gatos/index.html",
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
        path: "./hacker/index.html",
        icon: "fa-user-secret",
        color: "#000",
        badge: "Hacker",
        rating: "4.8",
        votes: "25",
        desc: "Interfaz de hacking romántica.",
        editableTexts: [
            { id: "hack-title",    label: "Título Hack", default: "HACKING HEART..." },
            { id: "hack-progress", label: "Progreso",    default: "Descifrando sentimientos..." }
        ]
    },
    {
        id: "jardin",
        name: "Jardín de Luces",
        path: "./jardin/index.html",
        icon: "fa-tree",
        color: "#001a0a",
        badge: "Cinemático",
        rating: "5.0",
        votes: "49",
        desc: "Luciérnagas en un bosque mágico.",
        editableTexts: [
            { id: "garden-title", label: "Título del Jardín", default: "Nuestro jardín secreto" },
            { id: "garden-msg",   label: "Mensaje",           default: "Donde cada luz es un recuerdo contigo.", type: "textarea" }
        ]
    },
    {
        id: "monitor",
        name: "Monitor Cardíaco",
        path: "./monitor/index.html",
        icon: "fa-heart-pulse",
        color: "#1a0505",
        badge: "Clásico",
        rating: "4.6",
        votes: "33",
        desc: "Tu pulso se acelera por ella.",
        hasDate: true,
        editableTexts: [
            { id: "ekg-title", label: "Título EKG",   default: "Mi corazón late por ti" },
            { id: "bpm-text",  label: "Texto BPM",    default: "Ritmo Cardíaco Acelerado" }
        ]
    },
    {
        id: "neon",
        name: "Letrero Neón",
        path: "./neon/index.html",
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
        path: "./poema/index.html",
        icon: "fa-pen-nib",
        color: "#1a1a1a",
        badge: "Premium",
        rating: "4.9",
        votes: "82",
        desc: "Pluma escribiendo en pergamino.",
        editableTexts: [
            { id: "poem-title", label: "Título del Poema", default: "Versos para ti" },
            { id: "poem-body",  label: "Cuerpo del Poema", default: "Escribe aquí tus versos más románticos...", type: "textarea" }
        ]
    },
    {
        id: "ruleta",
        name: "Ruleta de Citas",
        path: "./ruleta/index.html",
        icon: "fa-compact-disc",
        color: "#220505",
        badge: "Juego",
        rating: "4.5",
        votes: "12",
        desc: "Gira para ver qué haremos hoy.",
        editableTexts: [
            { id: "roulette-title", label: "Título Ruleta", default: "¿Qué haremos hoy?" },
            { id: "option1",        label: "Opción 1",      default: "Cena romántica" },
            { id: "option2",        label: "Opción 2",      default: "Ir al cine" },
            { id: "option3",        label: "Opción 3",      default: "Un beso largo" },
            { id: "option4",        label: "Opción 4",      default: "Viaje sorpresa" }
        ]
    },
    {
        id: "ventana",
        name: "Ventana al Cielo",
        path: "./ventana/index.html",
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
        path: "./vibrante/index.html",
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

// ============================================================
// RENDERIZAR CATÁLOGO
// ============================================================
function renderCatalog(filter = 'all') {
    const catalogGrid = document.getElementById("catalogGrid");
    if (!catalogGrid) return;

    catalogGrid.innerHTML = "";

    const itemsToRender = filter === 'all'
        ? catalogData
        : catalogData.filter(item => item.badge.includes(filter));

    let gridHTML = "";
    itemsToRender.forEach(item => {
        const isPremium = item.badge.includes('Premium') || item.badge.includes('Suite');
        const isGratis  = item.badge.includes('Gratis');

        gridHTML += `
        <div class="product-card">
            <div class="card-image ${isPremium ? 'premium-bg' : ''}" style="background-color: ${item.color};">
                ${isPremium ? '<div class="crown-badge"><i class="fa-solid fa-crown"></i></div>' : ''}
                <i class="fa-solid ${item.icon} screen-icon"></i>
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
                            <a href="${item.path}" class="btn-comprar" style="text-decoration:none; flex:1; display:flex; align-items:center; justify-content:center; background:#10b981; border:none; color:white; border-radius:8px; font-weight:600; font-size:0.85rem;"><i class="fa-solid fa-download" style="margin-right:5px;"></i> Usar Link</a>
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
