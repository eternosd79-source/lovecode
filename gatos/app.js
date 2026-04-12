// ================================================
// GATOS BAJO LA LUNA — Motor Interactivo Completo
// ================================================

// ── ELEMENTOS DOM ──
const introOverlay   = document.getElementById('introOverlay');
const phrase1        = document.getElementById('phrase1');
const phrase2        = document.getElementById('phrase2');
const phrase3        = document.getElementById('phrase3');
const btnEnter       = document.getElementById('btnEnter');
const mainExperience = document.getElementById('mainExperience');
const petalsLayer    = document.getElementById('petalsLayer');
const floatingHearts = document.getElementById('floatingHearts');
const mainArtFrame   = document.getElementById('mainArtFrame');
const glassUI        = document.getElementById('glassUI');
const mainText       = document.getElementById('mainText');
const btnYes         = document.getElementById('btnYes');
const btnNo          = document.getElementById('btnNo');
const noWrapper      = document.getElementById('noWrapper');
const victoryScreen  = document.getElementById('victoryScreen');

// ================================================
// 1. INTRO CINEMATOGRÁFICO
// ================================================

// Crear corazones flotantes de fondo durante el intro
function spawnIntroHearts() {
    const emojis = ['💜', '🌙', '✨', '💫', '🌸', '💕'];
    for (let i = 0; i < 25; i++) {
        const el = document.createElement('div');
        el.classList.add('float-heart');
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.left = Math.random() * 100 + 'vw';
        el.style.fontSize = (Math.random() * 1.5 + 0.6) + 'rem';
        el.style.animationDuration = (Math.random() * 10 + 8) + 's';
        el.style.animationDelay    = (Math.random() * 10) + 's';
        floatingHearts.appendChild(el);
    }
}
spawnIntroHearts();

// Secuencia de frases: 1 → 2 → 3 → Botón
function showPhrase(el, delay, duration, cb) {
    setTimeout(() => {
        el.style.display = 'block';
        el.classList.add('active');
        setTimeout(() => {
            el.classList.replace('active', 'exit');
            setTimeout(() => { el.style.display = 'none'; if (cb) cb(); }, 1500);
        }, duration);
    }, delay);
}

showPhrase(phrase1, 600,  4000, () => {
    showPhrase(phrase2, 200, 4000, () => {
        showPhrase(phrase3, 200, 4000, () => {
            // Aparece el botón de entrada
            setTimeout(() => { btnEnter.style.display = 'block'; }, 400);
        });
    });
});

// Botón "Abrir el mensaje"
btnEnter.addEventListener('click', () => {
    introOverlay.style.opacity = '0';
    introOverlay.style.pointerEvents = 'none';
    setTimeout(() => {
        introOverlay.style.display = 'none';
        // Revelar la experiencia principal
        mainExperience.classList.remove('hidden');
        mainExperience.classList.add('visible');
        spawnPetals(); // Iniciar lluvia de pétalos
    }, 2000);
});

// ================================================
// 2. PÉTALOS ROMÁNTICOS CAYENDO
// ================================================
const petalList = ['🌸', '🌺', '💮', '🌷', '🌹'];

function spawnPetals() {
    setInterval(() => {
        const p = document.createElement('div');
        p.classList.add('petal');
        p.textContent = petalList[Math.floor(Math.random() * petalList.length)];
        p.style.left = Math.random() * 100 + 'vw';
        p.style.fontSize = (Math.random() * 1.2 + 0.7) + 'rem';
        p.style.animationDuration = (Math.random() * 6 + 7) + 's';
        p.style.animationDelay    = '0s';
        petalsLayer.appendChild(p);
        setTimeout(() => p.remove(), 14000);
    }, 1200);
}

// ================================================
// 3. BOTÓN "RECHAZAR" — Disolución Poética
// ================================================
let isWon = false;
let isDissolving = false;

function dissolveEvasion(e) {
    if (isWon || isDissolving) return;
    e.preventDefault();
    isDissolving = true;

    btnNo.classList.add('dissolve-out');
    btnNo.classList.remove('dissolve-in');

    setTimeout(() => {
        noWrapper.style.position = 'absolute';
        const maxX = window.innerWidth  - noWrapper.offsetWidth  - 30;
        const maxY = window.innerHeight - noWrapper.offsetHeight - 80;
        noWrapper.style.left = Math.max(20, Math.random() * maxX) + 'px';
        noWrapper.style.top  = Math.max(20, Math.random() * maxY) + 'px';

        btnNo.classList.replace('dissolve-out', 'dissolve-in');
        setTimeout(() => { btnNo.classList.remove('dissolve-in'); isDissolving = false; }, 400);
    }, 380);
}

btnNo.addEventListener('mouseover',  dissolveEvasion);
btnNo.addEventListener('touchstart', dissolveEvasion, { passive: false });
btnNo.addEventListener('click',      dissolveEvasion);

// ================================================
// 4. VICTORIA ÉPICA — "SÍ"
// ================================================
btnYes.addEventListener('click', () => {
    if (isWon) return;
    isWon = true;

    glassUI.style.opacity = '0';
    glassUI.style.pointerEvents = 'none';
    if (noWrapper.style.position === 'absolute') {
        btnNo.style.opacity = '0';
    }

    // Pequeña pausa dramática
    setTimeout(() => {
        victoryScreen.classList.remove('hidden');
        victoryScreen.classList.add('visible');
        startVictoryCanvas();
    }, 800);
});

// ================================================
// 5. CANVAS DE VICTORIA (Lluvia Dorada)
// ================================================
const vCanvas = document.getElementById('victoryCanvas');
const vCtx    = vCanvas.getContext('2d');
let vW, vH;
let vParts = [];
let vGoing = false;

function initVCanvas() {
    vW = vCanvas.width  = window.innerWidth;
    vH = vCanvas.height = window.innerHeight;
}
window.addEventListener('resize', initVCanvas);
initVCanvas();

function addVParticle(x, y, burst) {
    const angle  = Math.random() * Math.PI * 2;
    const speed  = burst ? (Math.random() * 25 + 10) : (Math.random() * 4 + 2);
    vParts.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: burst ? Math.sin(angle) * speed : -(Math.random() * 6 + 3),
        life: 1 + Math.random() * 0.5,
        s: Math.random() * 3 + 1,
        color: `hsl(${40 + Math.random() * 30}, 100%, ${60 + Math.random() * 30}%)`
    });
}

function animateVictory() {
    if (!vGoing) return;
    requestAnimationFrame(animateVictory);

    vCtx.globalCompositeOperation = 'source-over';
    vCtx.fillStyle = 'rgba(3, 0, 10, 0.2)';
    vCtx.fillRect(0, 0, vW, vH);

    vCtx.globalCompositeOperation = 'lighter'; // Mezcla aditiva de luz

    // Spawn cíclico desde arriba
    if (Math.random() > 0.4) addVParticle(Math.random() * vW, -10, false);

    for (let i = vParts.length - 1; i >= 0; i--) {
        const p = vParts[i];
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.06; // gravedad suave
        p.life -= 0.007;
        if (p.life <= 0) { vParts.splice(i, 1); continue; }

        vCtx.beginPath();
        vCtx.arc(p.x, p.y, p.s * p.life, 0, Math.PI * 2);
        vCtx.fillStyle = p.color;
        vCtx.fill();
    }
}

function startVictoryCanvas() {
    vGoing = true;
    // Gran explosión inicial desde el centro
    const cx = vW / 2, cy = vH / 2;
    for (let i = 0; i < 200; i++) addVParticle(cx, cy, true);
    animateVictory();
}

// ================================================
// 6. CANVAS ESTELAR DE FONDO
// ================================================
const bgCanvas = document.getElementById('starCanvas');
const bgCtx    = bgCanvas.getContext('2d');
let bW, bH, stars = [];

function initBg() {
    bW = bgCanvas.width  = window.innerWidth;
    bH = bgCanvas.height = window.innerHeight;
    stars = Array.from({ length: 200 }, () => ({
        x: Math.random() * bW, y: Math.random() * bH,
        s: Math.random() * 1.5 + 0.2,
        a: Math.random() * 0.6 + 0.1,
        da: (Math.random() * 0.01 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
        c: Math.random() > 0.5 ? '#fff' : '#cce'
    }));
}

function animateBg() {
    bgCtx.clearRect(0, 0, bW, bH);
    stars.forEach(s => {
        s.a += s.da;
        if (s.a > 0.9 || s.a < 0.05) s.da *= -1;
        bgCtx.beginPath();
        bgCtx.arc(s.x, s.y, s.s, 0, Math.PI * 2);
        bgCtx.fillStyle = s.c;
        bgCtx.globalAlpha = s.a;
        bgCtx.fill();
    });
    bgCtx.globalAlpha = 1;
    requestAnimationFrame(animateBg);
}

window.addEventListener('resize', initBg);
initBg();
animateBg();
