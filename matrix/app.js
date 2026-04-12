// ==========================================
// MATRIX ROMÁNTICA — Frases por columna
// ==========================================

const canvas = document.getElementById('matrixCanvas');
const ctx    = canvas.getContext('2d');

let W, H, columns, drops, colPhrase, colIdx;

// Frases románticas — cada columna recorre sus letras secuencialmente
const phrases = [
    'te amo ',
    'mi amor ',
    'mi vida ',
    'eres mi todo ',
    'te quiero ',
    'para siempre ',
    'solo tu ',
    'mi cielo ',
    'te adoro ',
    'amor mio ',
];

const fontSize = 16;

function init() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    columns = Math.floor(W / fontSize);

    drops    = [];
    colPhrase = [];
    colIdx    = [];

    for (let i = 0; i < columns; i++) {
        drops[i]     = Math.random() * -(H / fontSize); // escalonado para no empezar todo junto
        colPhrase[i] = phrases[Math.floor(Math.random() * phrases.length)]; // frase asignada a la columna
        colIdx[i]    = Math.floor(Math.random() * colPhrase[i].length);     // posición inicial en la frase
    }
}
init();
window.addEventListener('resize', init);

// Colores del trail: blanco en la punta, rosa → magenta → desaparece
function trailColor(relY) {
    // relY: posición relativa en pantalla (0=arriba punta, 1=abajo viejo)
    const p = relY;
    if (p > 0.97) return 'rgba(255,255,255,1)';         // punta = blanco puro
    if (p > 0.88) return 'rgba(255,220,235,0.95)';      // rosa pálido
    if (p > 0.72) return 'rgba(255,140,190,0.80)';      // rosa
    if (p > 0.50) return 'rgba(220,70,150,0.55)';       // rosa intenso
    if (p > 0.30) return 'rgba(170,40,110,0.30)';       // magenta oscuro
    return                'rgba(110, 10, 70, 0.12)';    // casi invisible
}

function drawMatrix() {
    // Fondo vino muy oscuro semitransparente → efecto de cola
    ctx.fillStyle = 'rgba(6, 0, 10, 0.10)';
    ctx.fillRect(0, 0, W, H);

    ctx.font      = `bold ${fontSize}px 'Courier New', monospace`;
    ctx.textAlign = 'center';

    for (let i = 0; i < columns; i++) {
        const x = i * fontSize + fontSize / 2;
        const y = drops[i] * fontSize;

        // Elegir la siguiente letra de la frase asignada a esta columna
        const phrase = colPhrase[i];
        const ch     = phrase[colIdx[i] % phrase.length];

        // Color basado en posición Y relativa
        const relY  = y / H;
        const color = trailColor(Math.max(0, Math.min(1, relY)));
        const isHead = relY > 0.94; // punta activa

        ctx.save();
        ctx.fillStyle  = color;
        ctx.shadowBlur  = isHead ? 20 : 3;
        ctx.shadowColor = 'rgba(255, 70, 150, 0.9)';
        ctx.fillText(ch, x, y);
        ctx.restore();

        // Avanzar en la frase de esta columna
        colIdx[i]++;

        // Reset cuando llega al fondo
        if (y > H && Math.random() > 0.975) {
            drops[i] = 0;
        } else {
            drops[i] += 0.55;
        }
    }
}

setInterval(drawMatrix, 42);

// ---- VIGNETTE ----
function addVignette() {
    const vCanvas = document.getElementById('vigCanvas');
    if (!vCanvas) return;
    const vCtx = vCanvas.getContext('2d');
    vCanvas.width  = window.innerWidth;
    vCanvas.height = window.innerHeight;

    const grad = vCtx.createRadialGradient(
        vCanvas.width/2, vCanvas.height/2, vCanvas.height * 0.15,
        vCanvas.width/2, vCanvas.height/2, vCanvas.height * 0.80
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(4,0,8,0.78)');
    vCtx.fillStyle = grad;
    vCtx.fillRect(0, 0, vCanvas.width, vCanvas.height);
}
window.addEventListener('resize', addVignette);
setTimeout(addVignette, 100);

// ---- SCREENS ----
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function revealMessage() {
    document.getElementById('introScreen').classList.remove('active');
    document.getElementById('introScreen').classList.add('hidden');

    const overlay = document.getElementById('messageOverlay');
    overlay.classList.remove('hidden');
    overlay.classList.add('active');

    await sleep(700);

    const lines = [
        { id: 'msgLine1', text: 'En cada letra que cae...' },
        { id: 'msgLine2', text: '❤️ Te Amo ❤️' },
        { id: 'msgLine3', text: '...y siempre lo haré.' },
    ];

    for (const line of lines) {
        const el     = document.getElementById(line.id);
        el.textContent = line.text;
        el.classList.add('show');
        await sleep(1600);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('startBtn').addEventListener('click', revealMessage);
});
