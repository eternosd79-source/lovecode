// ==========================================
// MONITOR CARDÍACO — Narrativa Romántica
// ==========================================

const story = [
    {
        text: "Estando solo, el corazón late a 72 BPM. Tranquilo. Estable. Como cualquier día normal.",
        bpm: 72, state: "calm"
    },
    {
        text: "Ninguna alteración. Ninguna emoción fuerte. Un ritmo pausado... como quien espera sin saberlo.",
        bpm: 68, state: "calm"
    },
    {
        text: "Entonces... ella apareció.",
        bpm: 89, state: "calm", pause: true
    },
    {
        text: "98 BPM. El corazón detectó su presencia antes que la mente pudiera procesar que era ella.",
        bpm: 98, state: "excited"
    },
    {
        text: "118 BPM. Sus ojos. Su voz. Su sonrisa. Cada detalle suma otro latido sin permiso.",
        bpm: 118, state: "excited"
    },
    {
        text: "142 BPM. Ya no hay forma de controlarlo. No se trata de una falla. Es exactamente lo que pasa cuando alguien te roba el aliento.",
        bpm: 142, state: "excited"
    },
    {
        text: "Este corazón no se acelera por miedo, ni por correr. Se acelera por ella. Solo por ella. Siempre.",
        bpm: 156, state: "excited"
    }
];

let idx = 0;
let isExcited = false;

// ---- BACKGROUND PARTICLES ----
const bgCanvas = document.getElementById('bgCanvas');
const ctx = bgCanvas.getContext('2d');
function resizeBg() { bgCanvas.width = innerWidth; bgCanvas.height = innerHeight; }
resizeBg(); window.addEventListener('resize', resizeBg);

const particles = [];
for (let i = 0; i < 80; i++) {
    particles.push({
        x: Math.random() * innerWidth, y: Math.random() * innerHeight,
        r: Math.random() * 1.2 + 0.3,
        alpha: Math.random() * 0.4 + 0.05,
        vy: -(Math.random() * 0.2 + 0.05),
        vx: (Math.random() - 0.5) * 0.1,
        aDir: Math.random() > 0.5 ? 1 : -1,
        aSpd: Math.random() * 0.004 + 0.001,
        hue: 350 + Math.random() * 20
    });
}
function drawBg() {
    requestAnimationFrame(drawBg);
    ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    particles.forEach(p => {
        p.y += p.vy; p.x += p.vx;
        p.alpha += p.aSpd * p.aDir;
        if (p.alpha > 0.5) p.aDir = -1;
        if (p.alpha < 0.02) p.aDir = 1;
        if (p.y < -5) p.y = bgCanvas.height + 5;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = `hsl(${p.hue},70%,70%)`;
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}
drawBg();

// ---- FLOATING HEARTS ----
const hbg = document.getElementById('heartsBg');
for (let i = 0; i < 16; i++) spawnHeart(Math.random() * 5000);
function spawnHeart(delay = 0) {
    setTimeout(() => {
        const h = document.createElement('div');
        h.className = 'fheart'; h.textContent = '❤';
        const dur = 8 + Math.random() * 6;
        h.style.setProperty('--d', dur + 's');
        h.style.setProperty('--r', (Math.random()*120-60)+'deg');
        h.style.left = Math.random()*100 + 'vw';
        h.style.fontSize = (1 + Math.random()) * 2 + 'rem';
        hbg.appendChild(h);
        setTimeout(() => { h.remove(); spawnHeart(0); }, dur * 1000);
    }, delay);
}

// ---- SWITCH EKG ----
function switchEkg(excited) {
    if (excited === isExcited) return;
    isExcited = excited;
    document.getElementById('ekgNormal').classList.toggle('hidden', excited);
    document.getElementById('ekgExcited').classList.toggle('hidden', !excited);
    document.querySelector('.ekg-stage').classList.toggle('excited', excited);
    document.getElementById('bpmVal').classList.toggle('excited-num', excited);
}

// ---- BPM ----
let bpmTarget = 72;
let bpmCurrent = 72;
function animateBpm() {
    setInterval(() => {
        const jitter = Math.floor(Math.random() * 5 - 2);
        const displayed = Math.round(bpmTarget + jitter);
        document.getElementById('bpmVal').textContent = displayed;
    }, 600);
}

// ---- STEP INDICATOR ----
function updateDots(i, total) {
    const el = document.getElementById('stepIndicator');
    el.textContent = Array.from({length: total}, (_, k) => k === i ? '●' : '·').join(' ');
}

// ---- TYPEWRITER ----
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
async function typewrite(text, el) {
    el.classList.remove('visible');
    el.textContent = '';
    await sleep(400);
    el.classList.add('visible');
    for (const ch of text) {
        el.textContent += ch;
        await sleep(35);
    }
}

async function showStory(i) {
    const step = story[i];
    const btn = document.getElementById('nextBtn');
    btn.classList.remove('visible');

    // EKG state
    if (step.state === 'excited') switchEkg(true);
    else switchEkg(false);

    // BPM
    bpmTarget = step.bpm;

    // Dots
    updateDots(i, story.length);

    // Text
    const el = document.getElementById('storyText');
    await typewrite(step.text, el);

    await sleep(step.pause ? 800 : 300);

    btn.textContent = i === story.length - 1
        ? 'Ver conclusión ❤️'
        : (i < 2 ? 'Continuar ↓' : 'Y luego... ↓');
    btn.classList.add('visible');
}

// ---- SCREENS ----
function goTo(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    animateBpm();

    document.getElementById('startBtn').addEventListener('click', () => {
        goTo('monitorScreen');
        setTimeout(() => showStory(0), 400);
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        if (idx < story.length - 1) {
            idx++;
            showStory(idx);
        } else {
            goTo('finalScreen');
        }
    });
});
