const catalogData = [
    { 
        id: "arbol", 
        name: "Árbol Flores Doradas", 
        path: "arbol/index.html", 
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
        path: "agencia/index.html", 
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
        path: "burbujas/index.html", 
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
        path: "Boulevard_Pareja/index.html", 
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
        path: "matrix/index.html", 
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
        path: "latido/index.html",
        icon: "fa-heart-pulse",
        color: "#1a0505",
        badge: "Gratis (24h)",
        rating: "4.9",
        votes: "45",
        desc: "Corazón de cristal latiendo.",
        hasDate: true,
        textRef: "Cada latido es por ti...",
        editableTexts: [
            { id: "loveText",  label: "Texto central grande", default: "Te Amo" },
            { id: "phraseTop", label: "Frase superior", default: "Cada latido es por ti..." },
            { id: "phraseBot", label: "Frase inferior", default: "Siempre y para siempre." }
        ]
    },
    {
        id: "osos",
        name: "Osito Tirador",
        path: "osos/index.html",
        icon: "fa-gun",
        color: "#050011",
        badge: "Divertido",
        rating: "4.9",
        votes: "91",
        desc: "Oso disparando corazones.",
        textRef: "Te apunto y te disparo todo mi amor...",
        editableTexts: [
            { id: "intro-title", label: "Titulo de inicio", default: "Para ti, mi amor" },
            { id: "intro-sub",   label: "Subtitulo intro", default: "Hay cosas que solo un osito sabe decir con el corazon" },
            { id: "msgText",     label: "Mensaje del osito", default: "Te apunto y te disparo todo mi amor..." },
            { id: "tapHint",     label: "Texto 'Toca para continuar'", default: "Toca para continuar" },
            { id: "final-title", label: "Titulo final", default: "Asi te quiero a ti, siempre y para siempre" },
            { id: "final-sub",   label: "Subtitulo final", default: "Gracias por ser la razon de la sonrisa de este osito enamorado." }
        ]
    },
    {
        id: "unidos",
        name: "Corazones Unidos",
        path: "unidos/index.html",
        icon: "fa-magnet",
        color: "#03001c",
        badge: "Físicas",
        rating: "4.8",
        votes: "15",
        desc: "Dos universos se fusionan.",
        textRef: "Tú y yo juntos formamos un universo...",
        editableTexts: [
            { id: "intro-question",   label: "Pregunta de inicio", default: "\u00bfSabes lo que quiero contigo?" },
            { id: "intro-click-text", label: "Texto de clic", default: "Da clic aqui para descubrirlo" },
            { id: "lblInstruction",   label: "Instruccion al unir", default: "Haz click para unir los corazones" },
            { id: "union-text",       label: "Frase de union (al completar)", default: "Tu y yo juntos formamos un universo..." }
        ]
    },
    {
        id: "libro",
        name: "Libro 3D",
        path: "libro/index.html",
        icon: "fa-book-open",
        color: "#0a0a0a",
        badge: "3D CSS",
        rating: "4.9",
        votes: "28",
        desc: "Libro interactivo real.",
        hasDate: true,
        textRef: "Paso a paso, página a página... 5 páginas editables.",
        editableTexts: [
            { id: "cover-title",  label: "Titulo de Portada", default: "Nuestra Historia" },
            { id: "intro-hint",   label: "Texto invitacion", default: "Hay algo que quiero contarte... Abre el libro y descubrelo" },
            { id: "proposal-q",   label: "Pregunta Principal", default: "\u00bfQuieres ser mi novia?" },
            { id: "proposal-sub", label: "Subtitulo propuesta", default: "Esta es la pregunta mas importante que he querido hacerte..." },
            { id: "celeb-title",  label: "Titulo celebracion", default: "\u00a1Comenzamos un nuevo capitulo!" },
            { id: "celeb-msg",    label: "Mensaje celebracion", default: "Que bueno que dijiste que si...", type: "textarea" }
        ]
    },
    {
        id: "carta",
        name: "Carta Digital",
        path: "carta/index.html",
        icon: "fa-envelope-open-text",
        color: "#1e1e1e",
        badge: "Tradicional",
        rating: "4.7",
        votes: "112",
        desc: "Un sobre elegante abriéndose.",
        textRef: "Para ti... (Carta completa de contenido)",
        editableTexts: [
            { id: "letter-title",  label: "Saludo (Para Ti,)", default: "Para Ti," },
            { id: "letter-body",   label: "Cuerpo de la Carta", default: "Queria detenerte un instante para escribirte y decirte lo profundamente agradecido que estoy de que el universo haya conspirado para que nuestros caminos se cruzaran.\n\nEres la persona mas maravillosa que he conocido. Cada dia a tu lado se siente como un regalo del que jamas quisiera despertar.\n\nTu risa ilumina todo lo que toca.", type: "textarea" },
            { id: "letter-footer", label: "Firma Final", default: "Tu Romantico Eterno" },
            { id: "clickHint",     label: "Texto del sello (intro)", default: "Presiona el sello para abrir" }
        ]
    },
    {
        id: "arcade",
        name: "Corazón Galáctico",
        path: "arcade/index.html",
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
        path: "codeheart/index.html",
        icon: "fa-code",
        color: "#0d0d0d",
        badge: "Hacker",
        rating: "4.8",
        votes: "34",
        desc: "Terminal de comandos con corazón ASCII.",
        editableTexts: [
            { id: "d_t1", label: "Titulo Error Fatal", default: "Fatal Error: Heart Memory Overflow" },
            { id: "d_t2", label: "Subtitulo compilado", default: "Se ha compilado un futuro infinito contigo." },
            { id: "d_t3", label: "Declaracion final", default: "T E  A M O" }
        ]
    },
    {
        id: "cometa",
        name: "Estrella Fugaz",
        path: "cometa/index.html",
        icon: "fa-meteor",
        color: "#030A1A",
        badge: "Gratis (24h)",
        rating: "4.9",
        votes: "76",
        desc: "Pide un deseo a la estrella.",
        editableTexts: [
            { id: "msgLove", label: "Mensaje del cometa", default: "Te Amo" }
        ]
    },
    {
        id: "corazon",
        name: "Corazón Partículas",
        path: "corazon/index.html",
        icon: "fa-heart",
        color: "#000",
        badge: "Premium",
        rating: "5.0",
        votes: "142",
        desc: "Miles de partículas formando un corazón.",
        editableTexts: [
            { id: "texto-clic",   label: "Texto de invitacion inicial", default: "Haz clic aqui" },
            { id: "overlay-text", label: "Texto central del corazon", default: "Mi corazon es tuyo" }
        ]
    },
    {
        id: "corazon3d",
        name: "Corazón 3D Giratorio",
        path: "corazon3d/index.html",
        icon: "fa-heart",
        color: "#1c0000",
        badge: "Gratis (24h)",
        rating: "5.0",
        votes: "205",
        desc: "Corazón 3D con mensajes orbitando.",
        editableTexts: [
            { id: "int1", label: "Intro linea 1", default: "En la inmensidad del universo..." },
            { id: "int2", label: "Intro linea 2", default: "Hay una fuerza capaz de crear luz pura." },
            { id: "cl1",  label: "Mensaje 1 sobre el corazon", default: "Te Amo" },
            { id: "cl2",  label: "Mensaje 2 sobre el corazon", default: "Para Siempre" }
        ]
    },
    {
        id: "cristal",
        name: "Cristal Mágico",
        path: "cristal/index.html",
        icon: "fa-gem",
        color: "#0a001a",
        badge: "Interactivo",
        rating: "4.9",
        votes: "55",
        desc: "Gema que brilla con tu toque.",
        editableTexts: [
            { id: "i_t1",          label: "Intro linea 1", default: "Todo este tiempo..." },
            { id: "i_t2",          label: "Intro linea 2", default: "He querido decirte algo." },
            { id: "main-question", label: "Pregunta principal", default: "\u00bfQuieres ser mi novia?" },
            { id: "subtitle",      label: "Subtitulo propuesta", default: "Eres mi sol, mi luna y todas mis estrellas" },
            { id: "c_t1",          label: "Titulo climax", default: "Era el destino." },
            { id: "c_t2",          label: "Subtitulo climax", default: "Prometo hacerte inmensamente feliz..." },
            { id: "c_t3",          label: "Frase cierre", default: "Para siempre." }
        ]
    },
    {
        id: "cupido",
        name: "Flecha de Cupido",
        path: "cupido/index.html",
        icon: "fa-arrow-right",
        color: "#1a0000",
        badge: "Divertido",
        rating: "4.8",
        votes: "29",
        desc: "Ayuda a Cupido a dar en el blanco.",
        editableTexts: [
            { id: "introTitle", label: "Titulo intro", default: "Un hilo rojo..." },
            { id: "introSub",   label: "Subtitulo intro", default: "...nos conecta sin importar el tiempo y la distancia." },
            { id: "ct1",        label: "Climax frase 1", default: "Me flechaste desde el primer dia que te vi..." },
            { id: "ct2",        label: "Climax frase 2", default: "Y cada latido desde entonces..." },
            { id: "ct3",        label: "Climax frase 3 grande", default: "...ha sido unicamente tuyo." },
            { id: "ct4",        label: "Declaracion final", default: "T E   A M O" }
        ]
    },
    {
        id: "espacio",
        name: "Viaje Espacial",
        path: "espacio/index.html",
        icon: "fa-rocket",
        color: "#000011",
        badge: "Cinemático",
        rating: "5.0",
        votes: "93",
        desc: "Navegando entre estrellas y fotos.",
        editableTexts: [
            { id: "texto-latido", label: "Texto de inicio (invitacion)", default: "Toca para iniciar el viaje" }
        ]
    },
    {
        id: "estrellas",
        name: "Cielo Estrellado",
        path: "estrellas/index.html",
        icon: "fa-star",
        color: "#010114",
        badge: "Interactivo",
        rating: "4.9",
        votes: "110",
        desc: "Conecta las estrellas para ver el mensaje.",
        editableTexts: [
            { id: "intro-title", label: "Titulo de Inicio", default: "Camino de Estrellas" },
            { id: "intro-sub",   label: "Subtitulo Intro", default: "Sigue el camino que te tengo preparado... cada estrella guarda un secreto", type: "textarea" },
            { id: "msgText",     label: "Mensajes de las estrellas (uno por linea)", default: "Porque me haces reir\nPorque eres mi calma\nPorque te pienso siempre\nPorque eres unica\nPorque te amo", type: "textarea" },
            { id: "final-q",     label: "Pregunta Final", default: "\u00bfQuieres ser mi novia?" },
            { id: "final-sub",   label: "Subtitulo pregunta final", default: "Has llegado al final del camino... y hay solo una respuesta correcta" },
            { id: "celeb-title", label: "Titulo Celebracion", default: "Juntos somos imparables!" },
            { id: "celeb-msg",   label: "Mensaje Celebracion", default: "Gracias por seguir mi camino de estrellas y por ser tu mi estrella favorita.", type: "textarea" }
        ]
    },
    {
        id: "flores",
        name: "Ramo de Flores",
        path: "flores/index.html",
        icon: "fa-seedling",
        color: "#061A0C",
        badge: "Naturaleza",
        rating: "5.0",
        votes: "89",
        desc: "Flores que crecen al pasar el tiempo.",
        editableTexts: [
            { id: "main-title", label: "Titulo central de la galaxia floral", default: "Esto es para ti" }
        ]
    },
    {
        id: "formando",
        name: "Formando el Corazón",
        path: "formando/index.html",
        icon: "fa-puzzle-piece",
        color: "#1a1a1a",
        badge: "Interactivo",
        rating: "4.7",
        votes: "18",
        desc: "Piezas que se unen para formar vuestro amor.",
        editableTexts: [
            { id: "iPhrase1", label: "Frase intro 1", default: "Cada latido de mi corazon..." },
            { id: "iPhrase2", label: "Frase intro 2", default: "...tiene tu nombre escrito." },
            { id: "iPhrase3", label: "Frase intro 3", default: "Deja que te lo demuestre." }
        ]
    },
    {
        id: "galaxia",
        name: "Galaxia Solar",
        path: "galaxia/index.html",
        icon: "fa-sun",
        color: "#001122",
        badge: "360°",
        rating: "4.8",
        votes: "44",
        desc: "Sistema solar con tus fotos.",
        editableTexts: [
            { id: "main-title", label: "Titulo de la galaxia", default: "Eres mi galaxia" }
        ]
    },
    {
        id: "gatos",
        name: "Gatos Románticos",
        path: "gatos/index.html",
        icon: "fa-cat",
        color: "#05001a",
        badge: "Divertido",
        rating: "4.9",
        votes: "77",
        desc: "Gatitos mirando la luna.",
        editableTexts: [
            { id: "phrase1",           label: "Intro frase 1", default: "Hay personas que llegan a tu vida..." },
            { id: "phrase2",           label: "Intro frase 2", default: "...y la cambian para siempre." },
            { id: "phrase3",           label: "Intro frase 3", default: "Tu eres esa persona para mi." },
            { id: "sub-romantic-text", label: "Texto romantico central", default: "Podria recorrer mil galaxias buscandote y aun asi elegiria perderme en la misma." },
            { id: "mainText",          label: "Pregunta principal", default: "\u00bfTe gustaria compartir tus siete vidas conmigo?" },
            { id: "victory-title",     label: "Titulo victoria", default: "Seria el mayor honor de todas mis vidas." },
            { id: "victory-sub",       label: "Mensaje victoria", default: "Y en cada una de ellas, te elegiria a ti." }
        ]
    },
    {
        id: "hacker",
        name: "Hacker de Amor",
        path: "hacker/index.html",
        icon: "fa-user-secret",
        color: "#000",
        badge: "Hacker",
        rating: "4.8",
        votes: "25",
        desc: "Interfaz de hacking romántica.",
        editableTexts: [
            { id: "introText1",    label: "Intro linea 1", default: "He estado pensando mucho..." },
            { id: "introText2",    label: "Intro linea 2", default: "y hay algo que mi corazon ya no puede ocultar." },
            { id: "question",      label: "Pregunta principal", default: "\u00bfQuieres ser mi novia?" },
            { id: "success-title", label: "Titulo exito", default: "El universo de la luz acaba de sonreir al escuchar tu respuesta." },
            { id: "success-sub",   label: "Subtitulo exito", default: "El mejor Si de mi vida." }
        ]
    },
    {
        id: "jardin",
        name: "Jardín de Luces",
        path: "jardin/index.html",
        icon: "fa-tree",
        color: "#001a0a",
        badge: "Cinemático",
        rating: "5.0",
        votes: "49",
        desc: "Luciérnagas en un bosque mágico.",
        editableTexts: [
            { id: "pre-title",    label: "Pre-titulo", default: "Tengo algo para ti..." },
            { id: "garden-title", label: "Titulo del jardin", default: "Flores para ti, mi amor" }
        ]
    },
    {
        id: "monitor",
        name: "Monitor Cardíaco",
        path: "monitor/index.html",
        icon: "fa-heart-pulse",
        color: "#1a0505",
        badge: "Clásico",
        rating: "4.6",
        votes: "33",
        desc: "Tu pulso se acelera por ella.",
        hasDate: true,
        editableTexts: [
            { id: "intro-title", label: "Titulo intro", default: "Hay algo que quiero mostrarte" },
            { id: "intro-sub",   label: "Subtitulo intro", default: "Lo que le pasa a este corazon cuando tu estas cerca..." },
            { id: "storyText",   label: "Historia / diagnostico (pasos separados por |)", default: "Ritmo normal...|Espera... algo cambio|Tu nombre aparecio en pantalla|El corazon no puede controlarse|Diagnostico: Amor sin cura", type: "textarea" },
            { id: "final-title", label: "Titulo final", default: "Este corazon late por ti." },
            { id: "final-sub",   label: "Subtitulo final", default: "Sin importar que digan los numeros, el unico resultado que importa eres tu." }
        ]
    },
    {
        id: "neon",
        name: "Letrero Neón",
        path: "neon/index.html",
        icon: "fa-bolt",
        color: "#110011",
        badge: "Gratis (24h)",
        rating: "4.6",
        votes: "24",
        desc: "Tu nombre en luces de neón.",
        editableTexts: [
            { id: "intro-label",  label: "Label superior intro", default: "Para ti" },
            { id: "intro-title",  label: "Titulo intro", default: "Con todo mi corazon" },
            { id: "intro-sub",    label: "Subtitulo intro", default: "Hay tres palabras que resumen todo lo que siento por ti..." },
            { id: "heartCaption", label: "Leyenda del corazon neon", default: "Brillando solo para ti" },
            { id: "neon-text",    label: "Texto del neon (el gran letrero)", default: "TE AMO" },
            { id: "footer-neon",  label: "Pie de pagina neon", default: "Para siempre" },
            { id: "final-verse",  label: "Verso final", default: "Y si algun dia el mundo se apaga, yo seguire brillando para ti." }
        ]
    },
    {
        id: "poema",
        name: "Poema Escrito",
        path: "poema/index.html",
        icon: "fa-pen-nib",
        color: "#1a1a1a",
        badge: "Premium",
        rating: "4.9",
        votes: "82",
        desc: "Pluma escribiendo en pergamino.",
        editableTexts: [
            { id: "title-main", label: "Titulo principal", default: "Un Poema Para Ti" },
            { id: "subtitle",   label: "Subtitulo", default: "Escrito con el corazon, palabra por palabra." },
            { id: "poemText",   label: "Versos del poema (paginas separadas por |)", default: "Eres la luz que busco cada manana...|Tu sonrisa es la razon de mis dias...|No existe universo donde no te elija...|Eres mi hogar, mi calma, mi todo.", type: "textarea" },
            { id: "q-pre",     label: "Pre-pregunta", default: "Y por todo eso..." },
            { id: "q-main",    label: "Pregunta principal", default: "\u00bfQuieres ser mi novia?" },
            { id: "c-title",   label: "Titulo celebracion", default: "El mejor poema es a tu lado!" },
            { id: "c-sub",     label: "Mensaje celebracion", default: "Gracias por convertirte en la musa de mi vida. Te adoro." }
        ]
    },
    {
        id: "ruleta",
        name: "Ruleta de Citas",
        path: "ruleta/index.html",
        icon: "fa-compact-disc",
        color: "#220505",
        badge: "Juego",
        rating: "4.5",
        votes: "12",
        desc: "Gira para ver qué haremos hoy.",
        editableTexts: [
            { id: "intro-title",  label: "Titulo intro", default: "Lo que siento por ti..." },
            { id: "intro-sub",    label: "Subtitulo intro", default: "Llevo tiempo guardando estas palabras. Descubre mi corazon en cada mensaje..." },
            { id: "game-title",   label: "Titulo del juego", default: "Toca cada mensaje" },
            { id: "q-pre",        label: "Pre-pregunta", default: "Y por todo eso..." },
            { id: "q-main",       label: "Pregunta principal", default: "\u00bfQuieres ser mi novia?" },
            { id: "celeb-title",  label: "Titulo celebracion", default: "Lo sabia!" },
            { id: "celeb-msg",    label: "Mensaje celebracion", default: "Eres la persona mas especial de mi vida. Esta es solo el comienzo de nuestra historia.", type: "textarea" }
        ]
    },
    {
        id: "ventana",
        name: "Ventana al Cielo",
        path: "ventana/index.html",
        icon: "fa-window-maximize",
        color: "#000a1a",
        badge: "Cinemático",
        rating: "4.9",
        votes: "37",
        desc: "Mirando las estrellas desde la ventana.",
        editableTexts: [
            { id: "intro-title",    label: "Titulo intro", default: "Prepare algo especial para ti..." },
            { id: "intro-subtitle", label: "Subtitulo intro", default: "Porque cada dia merece recordarse" },
            { id: "btn-text",       label: "Texto del boton abrir", default: "Abrir" },
            { id: "top-title",      label: "Titulo superior ventana", default: "I love you" },
            { id: "card-title",     label: "Dedicatoria de la ventana", default: "Para ti" },
            { id: "bottom-title",   label: "Titulo inferior ventana", default: "I love you" }
        ]
    },
    {
        id: "vibrante",
        name: "Corazón Fuego",
        path: "vibrante/index.html",
        icon: "fa-fire-flame-curved",
        color: "#000000",
        badge: "Partículas",
        rating: "5.0",
        votes: "67",
        desc: "Energía pura en forma de corazón.",
        editableTexts: [
            { id: "intro-question",   label: "Pregunta de inicio", default: "\u00bfQuieres saber lo que siento por ti?" },
            { id: "intro-click-text", label: "Texto de clic", default: "Haz clic aqui para descubrirlo" },
            { id: "center-text",      label: "Texto frente del corazon", default: "Te Amo" },
            { id: "special-msg",      label: "Mensaje reverso del corazon", default: "Eres especial para mi" }
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
                <img src="${item.id}/thumb.png" alt="${item.name}" class="card-thumb" onerror="this.style.opacity='0'">
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
                        <a class="btn-comprar" href="personalizar.html?t=${item.id}" style="display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;"><i class="fa-solid fa-wand-magic-sparkles"></i> Personalizar y Comprar</a>
                    `}
                </div>
            </div>
        </div>
        `;
    });
    
    catalogGrid.innerHTML = gridHTML;
    
    // Attach event listeners after rendering
    if (typeof attachCatalogListeners === 'function') {
        attachCatalogListeners();
    }
}
