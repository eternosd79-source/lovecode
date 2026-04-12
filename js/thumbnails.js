// ============================================================
// CORAZÓNCÓDIGO — GENERADOR DE THUMBNAILS (Canvas API)
// Genera previews visuales únicos para cada experiencia
// No requiere imágenes externas — 100% programático
// ============================================================

const THUMB_STYLES = {
    arbol:       { bg: ['#1f0814','#3d1a00'], accent: '#fbbf24', icon: '🌳', label: 'ÁRBOL FLORES' },
    agencia:     { bg: ['#0b0006','#1a0533'], accent: '#f9a8d4', icon: '🐻', label: 'AGENCIA OSOS' },
    burbujas:    { bg: ['#00131c','#001a2e'], accent: '#67e8f9', icon: '🫧', label: 'BURBUJAS' },
    boulevard:   { bg: ['#080808','#111827'], accent: '#e2e8f0', icon: '🚗', label: 'BOULEVARD' },
    matrix:      { bg: ['#000','#0a0a14'], accent: '#f43f5e', icon: '💻', label: 'MATRIX' },
    latido:      { bg: ['#1a0505','#300a0a'], accent: '#ef4444', icon: '❤️', label: 'LATIDO RUBY' },
    osos:        { bg: ['#050011','#0a0033'], accent: '#a78bfa', icon: '🐻', label: 'OSITO TIRADOR' },
    unidos:      { bg: ['#03001c','#06003b'], accent: '#06b6d4', icon: '🧲', label: 'CORAZONES UNIDOS' },
    libro:       { bg: ['#0a0a0a','#1a1a2e'], accent: '#c026d3', icon: '📖', label: 'LIBRO 3D' },
    carta:       { bg: ['#1e1e1e','#2d2d2d'], accent: '#fcd34d', icon: '✉️', label: 'CARTA DIGITAL' },
    arcade:      { bg: ['#0a0a0a','#000020'], accent: '#818cf8', icon: '💜', label: 'GALÁCTICO' },
    codeheart:   { bg: ['#0d0d0d','#001a00'], accent: '#4ade80', icon: '💚', label: 'CÓDIGO AMOR' },
    cometa:      { bg: ['#030A1A','#050f28'], accent: '#93c5fd', icon: '☄️', label: 'ESTRELLA FUGAZ' },
    corazon:     { bg: ['#000','#1a0000'], accent: '#f43f5e', icon: '❤️', label: 'PARTÍCULAS' },
    corazon3d:   { bg: ['#1c0000','#2d0000'], accent: '#fb7185', icon: '💗', label: 'CORAZÓN 3D' },
    cristal:     { bg: ['#0a001a','#12003a'], accent: '#c4b5fd', icon: '💎', label: 'CRISTAL MÁGICO' },
    cupido:      { bg: ['#1a0000','#2a0a00'], accent: '#fb923c', icon: '🏹', label: 'FLECHA CUPIDO' },
    espacio:     { bg: ['#000011','#00001f'], accent: '#7dd3fc', icon: '🚀', label: 'VIAJE ESPACIAL' },
    estrellas:   { bg: ['#010114','#0a0a2e'], accent: '#fef08a', icon: '⭐', label: 'CIELO ESTRELLADO' },
    flores:      { bg: ['#061A0C','#0a2a12'], accent: '#86efac', icon: '🌸', label: 'RAMO FLORES' },
    formando:    { bg: ['#1a1a1a','#252525'], accent: '#f0abfc', icon: '🧩', label: 'FORMANDO' },
    galaxia:     { bg: ['#001122','#001e38'], accent: '#38bdf8', icon: '🌌', label: 'GALAXIA SOLAR' },
    gatos:       { bg: ['#05001a','#0d0040'], accent: '#c084fc', icon: '🐱', label: 'GATOS ROM.' },
    hacker:      { bg: ['#000','#001a00'], accent: '#22c55e', icon: '🕵️', label: 'HACKER AMOR' },
    jardin:      { bg: ['#001a0a','#002a12'], accent: '#6ee7b7', icon: '🌿', label: 'JARDÍN LUCES' },
    monitor:     { bg: ['#1a0505','#2a0808'], accent: '#f87171', icon: '💓', label: 'MONITOR CARD.' },
    neon:        { bg: ['#110011','#1f0033'], accent: '#e879f9', icon: '✨', label: 'LETRERO NEÓN' },
    poema:       { bg: ['#1a1a1a','#222'],   accent: '#f3e8ff', icon: '✍️', label: 'POEMA ESCRITO' },
    ruleta:      { bg: ['#220505','#380a0a'], accent: '#fca5a5', icon: '🎡', label: 'RULETA CITAS' },
    ventana:     { bg: ['#000a1a','#001030'], accent: '#bae6fd', icon: '🌙', label: 'VENTANA CIELO' },
    vibrante:    { bg: ['#000000','#150000'], accent: '#ff6b35', icon: '🔥', label: 'CORAZÓN FUEGO' }
};

/**
 * Dibuja un thumbnail en canvas para una tarjeta de catálogo.
 * @param {string} id - ID de la experiencia (e.g. 'arbol')
 * @returns {HTMLCanvasElement|null}
 */
function generateThumb(id) {
    const style = THUMB_STYLES[id];
    if (!style) return null;

    const canvas = document.createElement('canvas');
    canvas.width  = 640;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    // --- Fondo degradado ---
    const grad = ctx.createLinearGradient(0, 0, 640, 400);
    grad.addColorStop(0, style.bg[0]);
    grad.addColorStop(1, style.bg[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 400);

    // --- Partículas de fondo ---
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let i = 0; i < 60; i++) {
        const x = Math.random() * 640;
        const y = Math.random() * 400;
        const r = Math.random() * 2 + 0.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    // --- Círculo de resplandor (glow orb) ---
    const glowGrad = ctx.createRadialGradient(320, 200, 0, 320, 200, 220);
    glowGrad.addColorStop(0, hexToRgba(style.accent, 0.12));
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, 640, 400);

    // --- Icono emoji grande centrado ---
    ctx.font = '110px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.18;
    ctx.fillText(style.icon, 320, 190);
    ctx.globalAlpha = 1;

    // --- Icono principal más pequeño con sombra de luz ---
    ctx.font = '70px serif';
    ctx.shadowColor = style.accent;
    ctx.shadowBlur  = 30;
    ctx.fillText(style.icon, 320, 185);
    ctx.shadowBlur = 0;

    // --- Línea divisoria lujosa ---
    const lineGrad = ctx.createLinearGradient(160, 0, 480, 0);
    lineGrad.addColorStop(0, 'transparent');
    lineGrad.addColorStop(0.5, hexToRgba(style.accent, 0.7));
    lineGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(160, 290);
    ctx.lineTo(480, 290);
    ctx.stroke();

    // --- Texto de nombre ---
    ctx.font = 'bold 22px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur  = 10;
    ctx.fillText(style.label, 320, 325);
    ctx.shadowBlur = 0;

    // --- Etiqueta "CORAZÓNCÓDIGO" arriba ---
    ctx.font = '11px Inter, Arial, sans-serif';
    ctx.fillStyle = hexToRgba(style.accent, 0.6);
    ctx.letterSpacing = '3px';
    ctx.fillText('❤ CORAZÓNCÓDIGO.ME', 320, 55);

    // --- Puntos decorativos (dots pattern) ---
    ctx.fillStyle = hexToRgba(style.accent, 0.08);
    for (let y = 340; y < 400; y += 15) {
        for (let x = 20; x < 640; x += 15) {
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    return canvas;
}

/**
 * Inyecta thumbnails canvas en todas las tarjetas del catálogo
 */
function injectThumbnails() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const buyBtn = card.querySelector('.btn-comprar[data-id], .btn-preview[data-id]');
        const previewBtn = card.querySelector('.btn-preview[data-id]');
        const id = (previewBtn || buyBtn)?.getAttribute('data-id');
        if (!id) return;

        const cardImage = card.querySelector('.card-image');
        if (!cardImage) return;

        // Evitar duplicados
        if (cardImage.querySelector('.card-thumb-canvas')) return;

        const canvas = generateThumb(id);
        if (!canvas) return;

        canvas.classList.add('card-thumb-canvas');
        canvas.setAttribute('aria-hidden', 'true');
        cardImage.appendChild(canvas);
    });
}

/**
 * Convierte hex (#rrggbb) a rgba() string
 */
function hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}
