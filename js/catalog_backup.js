const catalogData = [
    { 
        id: "arbol", 
        name: "Ãrbol Flores Doradas", 
        path: "arbol/index.html", 
        icon: "fa-leaf", 
        color: "#1f0814", 
        badge: "Premium", 
        rating: "5.0", 
        votes: "128", 
        desc: "Ãrbol mÃ¡gico de 35,000 hojas doradas. Usa cronÃ³metro.", 
        hasDate: true, 
        photosInfo: "Opcional: Si deseas que pongamos una foto escondida.",
        editableTexts: [
            { id: "title", label: "TÃ­tulo Principal", default: "Flores Amarillas para mi amor" },
            { id: "message", label: "Mensaje Dedicatoria", default: "Si pudiera elegir un lugar seguro, siempre serÃ­a a tu lado...", type: "textarea" },
            { id: "timer-intro", label: "Texto sobre CronÃ³metro", default: "Nuestro amor florece desde hace..." }
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
        photosInfo: "Para esta agencia, si quieres, mÃ¡ndanos 2 fotos tuyas.",
        editableTexts: [
            { id: "menu-title", label: "TÃ­tulo del MenÃº", default: "Regalos del Alma" },
            { id: "menu-subtitle", label: "SubtÃ­tulo del MenÃº", default: "Un momento especial, preparado para ti" },
            { id: "promesaQuestion", label: "Pregunta Acto 1", default: "Â¿Quieres ser mi amor para siempre?" },
            { id: "yesBtnSan", label: "BotÃ³n SÃ­", default: "SÃ­, para siempre ðŸ’•" },
            { id: "noBtnSan", label: "BotÃ³n No", default: "No..." }
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
            { id: "intro-title", label: "TÃ­tulo de Inicio", default: "Razones para Amarte" },
            { id: "intro-sub", label: "SubtÃ­tulo de Inicio", default: "Cada burbuja esconde una razÃ³n especial... ReviÃ©ntalas todas y descÃºbrelas", type: "textarea" },
            { id: "reveal-title", label: "TÃ­tulo Final", default: "Mis Razones para Amarte" },
            { id: "mural-opening", label: "Apertura del Mural", default: "Te amo porque..." },
            { id: "mural-closing-text", label: "Cierre del Mural", default: "Eres absolutamente todo para mÃ­." },
            { id: "mural-signature", label: "Firma Final", default: "Con amor eterno" }
        ]
    },
    { 
        id: "boulevard", 
        name: "Boulevard Pareja", 
        path: "Boulevard_Pareja/index.html", 
        icon: "fa-car", 
        color: "#080808", 
        badge: "CinemÃ¡tico", 
        rating: "5.0", 
        votes: "42", 
        desc: "Coche hacia el boulevard con tu foto.", 
        hasDate: false, 
        photosInfo: "OBLIGATORIO: Necesitas enviarnos 1 Foto clara.",
        editableTexts: [
            { id: "frase-inicio", label: "Frase de Inicio", default: "Hay recuerdos que conducen a lugares especiales...", type: "textarea" },
            { id: "caja-pregunta-h2", label: "Pregunta Boulevard", default: "Â¿Quieres ir a ver el boulevard conmigo???", selector: "#caja-pregunta h2" },
            { id: "modal-confirmacion-h2", label: "TÃ­tulo ConfirmaciÃ³n", default: "Bienvenida a nuestro boulevard", selector: "#modal-confirmacion h2" },
            { id: "modal-confirmacion-p", label: "Texto ConfirmaciÃ³n", default: "Donde las personas como yo venimos a sentarnos...", type: "textarea", selector: "#modal-confirmacion p" }
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
        desc: "CÃ³digo cayendo.", 
        hasDate: true, 
        photosInfo: "Opcional 1 foto secreta.",
        editableTexts: [
            { id: "main-title", label: "TÃ­tulo Principal", default: "System hackeado... My Love..." },
            { id: "sub-title", label: "SubtÃ­tulo", default: "Accediendo a mis sentimientos por ti..." }
        ]
    },
    {
        id: "latido",
        name: "CorazÃ³n Latido Ruby",
        path: "latido/index.html",
        icon: "fa-heart-pulse",
        color: "#1a0505",
        badge: "Gratis (24h)",
        rating: "4.9",
        votes: "45",
        desc: "CorazÃ³n de cristal latiendo.",
        hasDate: true,
        editableTexts: [
            { id: "loveText",   label: "TÃ­tulo central (Te Amo)", default: "Te Amo" },
            { id: "phraseTop",  label: "Frase superior", default: "Cada latido es por ti..." },
            { id: "phraseBot",  label: "Frase inferior", default: "Siempre y para siempre. ðŸ’•" }
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
        editableTexts: [
            { id: "intro-title", label: "TÃ­tulo de Inicio", default: "Para ti,\nmi amor" },
            { id: "intro-sub",   label: "SubtÃ­tulo Intro", default: "Hay cosas que solo un osito sabe decir con el corazÃ³n ðŸ§¸" },
            { id: "msgText",     label: "Mensaje principal (el osito lo dice)", default: "Te apunto y te disparo todo mi amor..." },
            { id: "tapHint",     label: "Texto Â«Toca para continuarÂ»", default: "Toca para continuar ðŸ’•" },
            { id: "final-title", label: "TÃ­tulo Final", default: "AsÃ­ te quiero a ti,\nsiempre y para siempre ðŸ§¸" },
            { id: "final-sub",   label: "SubtÃ­tulo Final", default: "Gracias por ser la razÃ³n de la sonrisa de este osito enamorado. ðŸ§¡ðŸ»ðŸ’•" }
        ]
    },
    {
        id: "unidos",
        name: "Corazones Unidos",
        path: "unidos/index.html",
        icon: "fa-magnet",
        color: "#03001c",
        badge: "FÃ­sicas",
        rating: "4.8",
        votes: "15",
        desc: "Dos universos se fusionan.",
        editableTexts: [
            { id: "intro-question",  label: "Pregunta de Inicio", default: "Â¿Sabes lo que quiero contigo?" },
            { id: "intro-click-text",label: "Texto de clic intro", default: "Da clic aquÃ­ para descubrirlo" },
            { id: "lblInstruction",  label: "InstrucciÃ³n al unir", default: "Haz click para unir los corazones" },
            { id: "union-text",      label: "Frase de UniÃ³n (al completar)", default: "TÃº y yo juntos formamos un universo..." }
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
        editableTexts: [
            { id: "cover-title",   label: "TÃ­tulo de Portada", default: "Nuestra Historia" },
            { id: "intro-hint",    label: "Texto invitaciÃ³n intro", default: "Hay algo que quiero contarte... Abre el libro y descÃºbrelo ðŸ’•" },
            { id: "proposal-q",    label: "Pregunta Principal", default: "Â¿Quieres ser mi novia?" },
            { id: "proposal-sub",  label: "SubtÃ­tulo Propuesta", default: "Esta es la pregunta mÃ¡s importante que he querido hacerte..." },
            { id: "celeb-title",   label: "TÃ­tulo CelebraciÃ³n", default: "Â¡Comenzamos un nuevo capÃ­tulo! ðŸ’ž" },
            { id: "celeb-msg",     label: "Mensaje CelebraciÃ³n", default: "QuÃ© bueno que dijiste que sÃ­... aunque tampoco te iba a dar otra opciÃ³n ðŸ˜‚ðŸ’•", type: "textarea" }
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
        desc: "Un sobre elegante abriÃ©ndose.",
        editableTexts: [
            { id: "letter-title",  label: "Saludo (Ej: Para Ti,)", default: "Para Ti," },
            { id: "letter-body",   label: "Cuerpo de la Carta", default: "QuerÃ­a detenerte un instante para escribirte y decirte lo profundamente agradecido que estoy de que el universo haya conspirado para que nuestros caminos se cruzaran.\n\nEres la persona mÃ¡s maravillosa que he conocido. Cada dÃ­a a tu lado se siente como un regalo del que jamÃ¡s quisiera despertar.\n\nTu risa ilumina todo lo que toca. Tu presencia convierte los momentos ordinarios en memorias eternas.", type: "textarea" },
            { id: "letter-footer", label: "Firma Final", default: "Tu RomÃ¡ntico Eterno" },
            { id: "clickHint",     label: "Texto del sello (intro)", default: "Presiona el sello para abrir" }
        ]
    },
    {
        id: "arcade",
        name: "CorazÃ³n GalÃ¡ctico",
        path: "arcade/index.html",
        icon: "fa-gamepad",
        color: "#0a0a0a",
        badge: "Interactivo",
        rating: "4.9",
        votes: "67",
        desc: "Universo de partÃ­culas con corazÃ³n de cristal.",
        editableTexts: [
            { id: "header-eyebrow", label: "Texto superior (ceja)", default: "â€” Para ti â€”" },
            { id: "main-title",     label: "TÃ­tulo Principal", default: "Con todo mi amor" },
            { id: "footer-hint",    label: "Frase inferior de pantalla", default: "Cada estrella en este cielo eres tÃº" },
            { id: "btn-text",       label: "Texto del BotÃ³n", default: "Lo sÃ©, te amo" },
            { id: "ded-title",      label: "TÃ­tulo Dedicatoria", default: "Eres mi razÃ³n" },
            { id: "ded-body",       label: "Cuerpo Dedicatoria", default: "Eres mi razÃ³n favorita de sonreÃ­r cada maÃ±ana.\nMi lugar favorito en el mundo entero.\nMi hogar, mi calma, mi todo.", type: "textarea" },
            { id: "ded-signature",  label: "Firma Final", default: "Con amor eterno ðŸ’•" }
        ]
    },
    {
        id: "codeheart",
        name: "CÃ³digo de Amor",
        path: "codeheart/index.html",
        icon: "fa-code",
        color: "#0d0d0d",
        badge: "Hacker",
        rating: "4.8",
        votes: "34",
        desc: "Terminal de comandos con corazÃ³n ASCII.",
        editableTexts: [
            { id: "d_t1", label: "TÃ­tulo Error Fatal", default: "Fatal Error: Heart Memory Overflow" },
            { id: "d_t2", label: "SubtÃ­tulo compilado", default: "Se ha compilado un futuro infinito contigo." },
            { id: "d_t3", label: "DeclaraciÃ³n final (T E  A M O)", default: "T E  A M O" }
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
            { id: "msgLove", label: "Mensaje del cometa (Ej: Te Amo)", default: "Te Amo ðŸ’•" }
        ]
    },
    {
        id: "corazon",
        name: "CorazÃ³n PartÃ­culas",
        path: "corazon/index.html",
        icon: "fa-heart",
        color: "#000",
        badge: "Premium",
        rating: "5.0",
        votes: "142",
        desc: "Miles de partÃ­culas formando un corazÃ³n.",
        editableTexts: [
            { id: "texto-clic",    label: "Texto de invitaciÃ³n inicial", default: "Haz clic aquÃ­ ðŸ’•" },
            { id: "overlay-text",  label: "Texto central del corazÃ³n", default: "Mi corazÃ³n es tuyo" }
        ]
    },
    {
        id: "corazon3d",
        name: "CorazÃ³n 3D Giratorio",
        path: "corazon3d/index.html",
        icon: "fa-heart",
        color: "#1c0000",
        badge: "Gratis (24h)",
        rating: "5.0",
        votes: "205",
        desc: "CorazÃ³n 3D con mensajes orbitando.",
        editableTexts: [
            { id: "int1", label: "Intro lÃ­nea 1", default: "En la inmensidad del universo..." },
            { id: "int2", label: "Intro lÃ­nea 2", default: "Hay una fuerza capaz de crear luz pura." },
            { id: "cl1",  label: "Mensaje 1 sobre el corazÃ³n", default: "Te Amo" },
            { id: "cl2",  label: "Mensaje 2 sobre el corazÃ³n", default: "Para Siempre" }
        ]
    },
    {
        id: "cristal",
        name: "Cristal MÃ¡gico",
        path: "cristal/index.html",
        icon: "fa-gem",
        color: "#0a001a",
        badge: "Interactivo",
        rating: "4.9",
        votes: "55",
        desc: "Gema que brilla con tu toque.",
        editableTexts: [
            { id: "i_t1",        label: "Intro lÃ­nea 1", default: "Todo este tiempo..." },
            { id: "i_t2",        label: "Intro lÃ­nea 2", default: "He querido decirte algo." },
            { id: "main-question", label: "Pregunta principal", default: "Â¿Quieres ser mi novia?" },
            { id: "subtitle",    label: "SubtÃ­tulo propuesta", default: "Eres mi sol, mi luna y todas mis estrellas" },
            { id: "c_t1",        label: "TÃ­tulo clÃ­max", default: "Era el destino." },
            { id: "c_t2",        label: "SubtÃ­tulo clÃ­max", default: "Prometo hacerte inmensamente feliz..." },
            { id: "c_t3",        label: "Frase cierre", default: "Para siempre. ðŸ’•" }
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
        desc: "Hilo rojo que te conecta para siempre.",
        editableTexts: [
            { id: "introTitle", label: "TÃ­tulo intro", default: "Un hilo rojo..." },
            { id: "introSub",   label: "SubtÃ­tulo intro", default: "...nos conecta sin importar el tiempo y la distancia." },
            { id: "ct1",        label: "ClÃ­max frase 1", default: "Me flechaste desde el primer dÃ­a que te vi..." },
            { id: "ct2",        label: "ClÃ­max frase 2", default: "Y cada latido desde entonces..." },
            { id: "ct3",        label: "ClÃ­max frase 3 (grande)", default: "...ha sido Ãºnicamente tuyo. ðŸ’•" },
            { id: "ct4",        label: "DeclaraciÃ³n final", default: "â™¥ T E   A M O â™¥" }
        ]
    },
    {
        id: "espacio",
        name: "Viaje Espacial",
        path: "espacio/index.html",
        icon: "fa-rocket",
        color: "#000011",
        badge: "CinemÃ¡tico",
        rating: "5.0",
        votes: "93",
        desc: "Navegando entre estrellas y fotos.",
        editableTexts: [
            { id: "texto-latido", label: "Texto de inicio (invitaciÃ³n)", default: "Toca para iniciar el viaje" }
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
            { id: "intro-title", label: "TÃ­tulo de Inicio", default: "Camino de\nEstrellas" },
            { id: "intro-sub",   label: "SubtÃ­tulo Intro", default: "Sigue el camino que te tengo preparado... cada estrella guarda un secreto ðŸ’•", type: "textarea" },
            { id: "msgText",     label: "Mensajes de las estrellas (uno por lÃ­nea)", default: "Porque me haces reÃ­r\nPorque eres mi calma\nPorque te pienso siempre\nPorque eres Ãºnica\nPorque te amo", type: "textarea" },
            { id: "final-q",     label: "Pregunta Final", default: "Â¿Quieres ser\nmi novia? ðŸ’•" },
            { id: "final-sub",   label: "SubtÃ­tulo pregunta final", default: "Has llegado al final del camino... y hay solo una respuesta correcta ðŸ’•" },
            { id: "celeb-title", label: "TÃ­tulo CelebraciÃ³n", default: "ðŸ’ž Â¡Juntos somos\nimparables! ðŸ’ž" },
            { id: "celeb-msg",   label: "Mensaje CelebraciÃ³n", default: "Gracias por seguir mi camino de estrellas... y por ser tÃº mi estrella favorita. ðŸ’•", type: "textarea" }
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
            { id: "main-title", label: "TÃ­tulo central de la galaxia floral", default: "Esto es para ti ðŸ’•" }
        ]
    },
    {
        id: "formando",
        name: "Formando el CorazÃ³n",
        path: "formando/index.html",
        icon: "fa-puzzle-piece",
        color: "#1a1a1a",
        badge: "Interactivo",
        rating: "4.7",
        votes: "18",
        desc: "Piezas que se unen para formar vuestro amor.",
        editableTexts: [
            { id: "iPhrase1", label: "Frase intro 1", default: "Cada latido de mi corazÃ³n..." },
            { id: "iPhrase2", label: "Frase intro 2", default: "...tiene tu nombre escrito. ðŸ’•" },
            { id: "iPhrase3", label: "Frase intro 3", default: "Deja que te lo demuestre." }
        ]
    },
    {
        id: "galaxia",
        name: "Galaxia Solar",
        path: "galaxia/index.html",
        icon: "fa-sun",
        color: "#001122",
        badge: "360Â°",
        rating: "4.8",
        votes: "44",
        desc: "Sistema solar con tus fotos.",
        editableTexts: [
            { id: "main-title", label: "TÃ­tulo de la galaxia", default: "Eres mi galaxia" }
        ]
    },
    {
        id: "gatos",
        name: "Gatos RomÃ¡nticos",
        path: "gatos/index.html",
        icon: "fa-cat",
        color: "#05001a",
        badge: "Divertido",
        rating: "4.9",
        votes: "77",
        desc: "Gatitos mirando la luna.",
        editableTexts: [
            { id: "phrase1",           label: "Intro frase 1", default: "Hay personas que llegan a tu vida..." },
            { id: "phrase2",           label: "Intro frase 2", default: "...y la cambian para siempre. ðŸ’•" },
            { id: "phrase3",           label: "Intro frase 3", default: "TÃº eres esa persona para mÃ­." },
            { id: "sub-romantic-text", label: "Texto romÃ¡ntico central", default: "PodrÃ­a recorrer mil galaxias buscÃ¡ndote y aÃºn asÃ­ elegirÃ­a perderme en la misma." },
            { id: "mainText",          label: "Pregunta principal", default: "Â¿Te gustarÃ­a compartir tus siete vidas conmigo?" },
            { id: "victory-title",     label: "TÃ­tulo victoria", default: "SerÃ­a el mayor honor de todas mis vidas. ðŸ˜»ðŸ’•" },
            { id: "victory-sub",       label: "Mensaje victoria", default: "Y en cada una de ellas, te elegirÃ­a a ti." }
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
        desc: "Interfaz de hacking romÃ¡ntica.",
        editableTexts: [
            { id: "introText1",    label: "Intro lÃ­nea 1", default: "He estado pensando mucho..." },
            { id: "introText2",    label: "Intro lÃ­nea 2", default: "y hay algo que mi corazÃ³n ya no puede ocultar." },
            { id: "question",      label: "Pregunta principal", default: "Â¿Quieres ser mi novia?" },
            { id: "success-title", label: "TÃ­tulo Ã©xito", default: "El universo de la luz acaba de sonreÃ­r al escuchar tu respuesta. ðŸ’•" },
            { id: "success-sub",   label: "SubtÃ­tulo Ã©xito", default: "El mejor 'SÃ­' de mi vida." }
        ]
    },
    {
        id: "jardin",
        name: "JardÃ­n de Luces",
        path: "jardin/index.html",
        icon: "fa-tree",
        color: "#001a0a",
        badge: "CinemÃ¡tico",
        rating: "5.0",
        votes: "49",
        desc: "LuciÃ©rnagas en un bosque mÃ¡gico.",
        editableTexts: [
            { id: "pre-title",    label: "Pre-tÃ­tulo", default: "Tengo algo para ti..." },
            { id: "garden-title", label: "TÃ­tulo del jardÃ­n", default: "Flores para ti, mi amor" }
        ]
    },
    {
        id: "monitor",
        name: "Monitor CardÃ­aco",
        path: "monitor/index.html",
        icon: "fa-heart-pulse",
        color: "#1a0505",
        badge: "ClÃ¡sico",
        rating: "4.6",
        votes: "33",
        desc: "Tu pulso se acelera por ella.",
        hasDate: true,
        editableTexts: [
            { id: "intro-title", label: "TÃ­tulo intro", default: "Hay algo que\nquiero mostrarte" },
            { id: "intro-sub",   label: "SubtÃ­tulo intro", default: "Lo que le pasa a este corazÃ³n\ncuando tÃº estÃ¡s cerca..." },
            { id: "storyText",   label: "Historia / diagnÃ³stico (separar con | para mÃºltiples pasos)", default: "Ritmo normal...|Espera... algo cambiÃ³|Tu nombre apareciÃ³ en pantalla|El corazÃ³n no puede controlarse|DiagnÃ³stico: Amor sin cura ðŸ’•", type: "textarea" },
            { id: "final-title", label: "TÃ­tulo final", default: "Este corazÃ³n\nlate por ti." },
            { id: "final-sub",   label: "SubtÃ­tulo final", default: "Sin importar quÃ© digan los nÃºmeros, el Ãºnico resultado que importa eres tÃº. ðŸ’•" }
        ]
    },
    {
        id: "neon",
        name: "Letrero NeÃ³n",
        path: "neon/index.html",
        icon: "fa-bolt",
        color: "#110011",
        badge: "Gratis (24h)",
        rating: "4.6",
        votes: "24",
        desc: "Tu nombre en luces de neÃ³n.",
        editableTexts: [
            { id: "intro-label",  label: "Label superior intro", default: "â™¥ Para ti â™¥" },
            { id: "intro-title",  label: "TÃ­tulo intro", default: "Con todo\nmi corazÃ³n" },
            { id: "intro-sub",    label: "SubtÃ­tulo intro", default: "Hay tres palabras que resumen todo lo que siento por ti..." },
            { id: "heartCaption", label: "Leyenda del corazÃ³n neÃ³n", default: "Brillando solo para ti ðŸ’•" },
            { id: "neon-text",    label: "Texto del neÃ³n (el gran letrero)", default: "TE AMO" },
            { id: "footer-neon",  label: "Pie de pÃ¡gina neÃ³n", default: "â™¥ Para siempre â™¥" },
            { id: "final-verse",  label: "Verso final", default: "Y si algÃºn dÃ­a el mundo se apaga, yo seguirÃ© brillando para ti." }
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
            { id: "title-main",  label: "TÃ­tulo principal", default: "Un Poema\nPara Ti" },
            { id: "subtitle",    label: "SubtÃ­tulo", default: "Escrito con el corazÃ³n, palabra por palabra." },
            { id: "poemText",    label: "Versos del poema (separa con | para distintas pÃ¡ginas)", default: "Eres la luz que busco cada maÃ±ana...|Tu sonrisa es la razÃ³n de mis dÃ­as...|No existe universo donde no te elija...|Eres mi hogar, mi calma, mi todo.", type: "textarea" },
            { id: "q-pre",       label: "Pre-pregunta", default: "Y por todo eso..." },
            { id: "q-main",      label: "Pregunta principal", default: "Â¿Quieres ser\nmi novia? ðŸ’•" },
            { id: "c-title",     label: "TÃ­tulo celebraciÃ³n", default: "Â¡El mejor poema\nes a tu lado! ðŸ’ž" },
            { id: "c-sub",       label: "Mensaje celebraciÃ³n", default: "Gracias por convertirte en la musa de mi vida. Te adoro. ðŸ’•" }
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
        desc: "Descubre mensajes girando la ruleta.",
        editableTexts: [
            { id: "intro-title",  label: "TÃ­tulo intro", default: "Lo que siento\npor ti..." },
            { id: "intro-sub",    label: "SubtÃ­tulo intro", default: "Llevo tiempo guardando estas palabras. Descubre mi corazÃ³n en cada mensaje... ðŸ’•" },
            { id: "game-title",   label: "TÃ­tulo del juego", default: "Toca cada mensaje ðŸ’•" },
            { id: "q-pre",        label: "Pre-pregunta", default: "Y por todo eso..." },
            { id: "q-main",       label: "Pregunta principal", default: "Â¿Quieres ser\nmi novia? ðŸ’•" },
            { id: "celeb-title",  label: "TÃ­tulo celebraciÃ³n", default: "Â¡Lo sabÃ­a!" },
            { id: "celeb-msg",    label: "Mensaje celebraciÃ³n", default: "Eres la persona mÃ¡s especial de mi vida. Esta es solo el comienzo de nuestra historia. ðŸ’•", type: "textarea" }
        ]
    },
    {
        id: "ventana",
        name: "Ventana al Cielo",
        path: "ventana/index.html",
        icon: "fa-window-maximize",
        color: "#000a1a",
        badge: "CinemÃ¡tico",
        rating: "4.9",
        votes: "37",
        desc: "Mirando las estrellas desde la ventana.",
        editableTexts: [
            { id: "intro-title",    label: "TÃ­tulo intro", default: "PreparÃ© algo\nespecial para ti..." },
            { id: "intro-subtitle", label: "SubtÃ­tulo intro", default: "Porque cada dÃ­a merece recordarse" },
            { id: "btn-text",       label: "Texto del botÃ³n abrir", default: "Abrir ðŸ’•" },
            { id: "top-title",      label: "TÃ­tulo superior ventana", default: "I love you â™¥" },
            { id: "card-title",     label: "Dedicatoria de la ventana", default: "Para ti â™¥" },
            { id: "bottom-title",   label: "TÃ­tulo inferior ventana", default: "I love you â™¥" }
        ]
    },
    {
        id: "vibrante",
        name: "CorazÃ³n Fuego",
        path: "vibrante/index.html",
        icon: "fa-fire-flame-curved",
        color: "#000000",
        badge: "PartÃ­culas",
        rating: "5.0",
        votes: "67",
        desc: "EnergÃ­a pura en forma de corazÃ³n.",
        editableTexts: [
            { id: "intro-question",   label: "Pregunta de inicio", default: "Â¿Quieres saber lo que siento por ti?" },
            { id: "intro-click-text", label: "Texto de clic", default: "Haz clic aquÃ­ para descubrirlo" },
            { id: "center-text",      label: "Texto frente del corazÃ³n", default: "Te Amo" },
            { id: "special-msg",      label: "Mensaje reverso del corazÃ³n", default: "Eres especial\npara mÃ­" }
        ]
    }
];
// Renderizar tarjetas dinÃ¡micamente
function renderCatalog(filter = 'all') {
    const catalogGrid = document.getElementById("catalogGrid");
    if (!catalogGrid) return;
    
    console.log("Renderizando catÃ¡logo con filtro:", filter);
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
