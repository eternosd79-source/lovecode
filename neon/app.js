'use strict';

// ── CONFIG ──────────────────────────────────────────────
const COLORS   = ['#00d4ff','#00aaff','#0055ff','#7722ff','#cc00ff','#ff00bb','#00ffee','#ffffff'];
const N_PART   = 700;
const DURATION = 2.5;
const VELOCITY = 100;
const EFFECT   = -0.75;
const P_SIZE   = 20;
const EMIT     = 7;
const N_STARS  = 220;

// ── FRASES SECUENCIALES ──────────────────────────────────
const phrases = [
    { caption: "Desde que llegaste a mi vida...",         main: "Te Amo" },
    { caption: "Con cada mirada que me das...",           main: "Te Admiro" },
    { caption: "Con cada sonrisa que me regalas...",      main: "Te Adoro" },
    { caption: "Más y más cada día que pasa...",          main: "Eres Todo" },
];

let phraseIndex  = 0;
let isTyping     = false;
let heartVisible = false;

// ── CANVAS ──────────────────────────────────────────────
const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');

function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// ── STARS ───────────────────────────────────────────────
let stars = [];
function initStars() {
    stars = [];
    for (let i = 0; i < N_STARS; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: 0.3 + Math.random() * 1.6,
            phase: Math.random() * Math.PI * 2,
            spd:   0.4 + Math.random() * 1.5
        });
    }
}
initStars();
window.addEventListener('resize', initStars);

function drawStars(t) {
    stars.forEach(s => {
        const a = 0.12 + 0.55 * (0.5 + 0.5 * Math.sin(t * s.spd + s.phase));
        ctx.fillStyle = `rgba(170, 215, 255, ${a})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
    });
}

// ── HEART MATH ──────────────────────────────────────────
function heartPoint(t) {
    // Agrandado: usa 75% del ancho con max 400px
    const w = Math.min(window.innerWidth * 0.75, 400);
    const s = w / 32;
    return {
        x:  16 * Math.pow(Math.sin(t), 3) * s,
        y: (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * s
    };
}

// ── PARTICLE POOL ────────────────────────────────────────
const pool = [];
for (let i = 0; i < N_PART; i++) {
    pool.push({ x:0, y:0, vx:0, vy:0, ax:0, ay:0, age:0, color:'#fff' });
}
let firstActive = 0, firstFree = 0;

function addParticle(x, y, vx, vy, ax, ay, color) {
    const p = pool[firstFree];
    p.x=x; p.y=y; p.vx=vx; p.vy=vy; p.ax=ax; p.ay=ay; p.age=0; p.color=color;
    firstFree = (firstFree + 1) % N_PART;
    if (firstActive === firstFree) firstActive = (firstActive + 1) % N_PART;
}

function spawnParticle() {
    const cx = canvas.width  / 2;
    const cy = canvas.height * 0.48;
    const t   = Math.random() * Math.PI * 2;
    const pos = heartPoint(t);
    const len = Math.sqrt(pos.x*pos.x + pos.y*pos.y) || 1;
    const dx  = (pos.x / len) * VELOCITY;
    const dy  = -(pos.y / len) * VELOCITY;
    addParticle(cx+pos.x, cy-pos.y, dx, dy, dx*EFFECT, dy*EFFECT,
        COLORS[Math.floor(Math.random() * COLORS.length)]);
}

function updateParticles(dt) {
    let i = firstActive;
    while (i !== firstFree) {
        const p = pool[i];
        p.age += dt;
        p.x  += p.vx * dt;  p.y  += p.vy * dt;
        p.vx += p.ax * dt;  p.vy += p.ay * dt;
        i = (i + 1) % N_PART;
    }
    while (pool[firstActive].age >= DURATION && firstActive !== firstFree) {
        firstActive = (firstActive + 1) % N_PART;
    }
}

function drawParticles() {
    ctx.save();
    let i = firstActive;
    while (i !== firstFree) {
        const p    = pool[i];
        const prog = p.age / DURATION;
        const alpha = (1 - prog) * 0.92;
        const size  = Math.max(0.5, (P_SIZE * ((prog < 0.3) ? prog/0.3 : 1 - (prog-0.3)/0.7)) / 2.5);

        ctx.globalAlpha  = alpha;
        ctx.shadowBlur   = 18;
        ctx.shadowColor  = p.color;
        ctx.fillStyle    = p.color;
        ctx.strokeStyle  = p.color;

        // Dibujar estrella/destello en vez de círculo
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.age * 2); // gira con el tiempo
        drawSparkle(ctx, size);
        ctx.restore();

        i = (i + 1) % N_PART;
    }
    ctx.restore();
}

// Dibujo de destello de 4 puntas (sparkle)
function drawSparkle(ctx, size) {
    const s = size;
    const s2 = size * 0.35; // anchura de los brazos cortos
    ctx.beginPath();
    ctx.moveTo(0, -s);      // arriba
    ctx.quadraticCurveTo(s2, -s2, s, 0);  // derecha
    ctx.quadraticCurveTo(s2, s2, 0, s);   // abajo
    ctx.quadraticCurveTo(-s2, s2, -s, 0); // izquierda
    ctx.quadraticCurveTo(-s2, -s2, 0, -s); // de vuelta
    ctx.closePath();
    ctx.fill();
}

// ── MAIN LOOP ────────────────────────────────────────────
let lastTime = 0;
let activeScreen = 'intro'; // 'intro' | 'heart' | 'final'

function loop(ts) {
    const dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars(ts / 1000);
    if (activeScreen === 'heart' || activeScreen === 'final') {
        for (let i = 0; i < EMIT; i++) spawnParticle();
        updateParticles(dt);
        drawParticles();
    }
    requestAnimationFrame(loop);
}

// ── UTILITIES ────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function typewrite(text, el, speed) {
    el.textContent = '';
    isTyping = true;
    for (const ch of text) {
        el.textContent += ch;
        await sleep(speed);
    }
    isTyping = false;
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    activeScreen = id.replace('Screen', '');
}

// ── SHOW PHRASE ───────────────────────────────────────────
async function showPhrase(index) {
    const captionEl = document.getElementById('heartCaption');
    const typedEl   = document.getElementById('typed');
    const btn        = document.getElementById('nextBtn');

    btn.classList.remove('visible');

    // Fade out caption
    captionEl.classList.remove('show');
    typedEl.textContent = '';

    await sleep(600);

    // Update caption
    captionEl.textContent = phrases[index].caption;
    captionEl.classList.add('show');

    await sleep(400);

    // Typewrite "Te Amo"
    const cur = document.querySelector('.cursor');
    if (cur) cur.style.opacity = '1';
    await typewrite(phrases[index].main, typedEl, 220);

    // Hide cursor
    await sleep(500);
    if (cur) cur.style.opacity = '0';

    // Show next button or finish
    btn.textContent = index === phrases.length - 1 ? 'Ver el mensaje final 💙' : 'Siguiente 💙';
    btn.classList.add('visible');
}

// ── INIT ─────────────────────────────────────────────────
requestAnimationFrame(loop);

document.getElementById('startBtn').addEventListener('click', async () => {
    switchScreen('heartScreen');
    await sleep(400);
    showPhrase(0);
});

document.getElementById('nextBtn').addEventListener('click', () => {
    if (phraseIndex < phrases.length - 1) {
        phraseIndex++;
        showPhrase(phraseIndex);
    } else {
        switchScreen('finalScreen');
    }
});
