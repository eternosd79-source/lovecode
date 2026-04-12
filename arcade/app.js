// ============================================
// ARCADE → ROMANTICO PREMIUM — APP.JS
// Motor de partículas: Rosa Champagne + Blanco Perla + Oro
// ============================================

const canvas = document.getElementById('canvas-universe');
const ctx    = canvas.getContext('2d');
let width, height;
let center = { x: 0, y: 0 };
let time = 0;
let exploded = false;

// ============================================
// 1. RESIZE RESPONSIVO
// ============================================
function resize() {
    width  = canvas.width  = window.innerWidth;
    height = canvas.height = window.innerHeight;
    center.x = width  / 2;
    center.y = height / 2;
    initParticles();
}
window.addEventListener('resize', resize);


// ============================================
// 2. PARTÍCULAS
// ============================================
const silhouetteParticles = [];
const driftParticles      = [];
const NUM_SILHOUETTE = 1400;
const NUM_DRIFT      = 120;

// Paleta romántica: rosa suave, blanco perla, durazno, oro tenue
const ROMANTIC_COLORS = [
    '#ffc8d5', '#ffe4ec', '#ffb3c6',  // Rosas
    '#fff0f3', '#ffd6e0',              // Blanco perla / rosa pálido
    '#ffdab9', '#ffe5b4',              // Durazno / melocotón
    '#f8c8c8'                          // Rosa viejo
];

function initParticles() {
    silhouetteParticles.length = 0;
    driftParticles.length      = 0;

    // --- SILUETA DEL GRAN CORAZÓN ---
    const scale = Math.min(width, height) / 50;

    for (let i = 0; i < NUM_SILHOUETTE; i++) {
        const t  = Math.random() * Math.PI * 2;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        const noise = (Math.random() - 0.5) * 1.2;

        const tx = center.x + (hx + noise) * scale;
        const ty = center.y + (hy + noise) * scale;

        silhouetteParticles.push({
            x: tx, y: ty,
            r: Math.random() * 1.6 + 0.4,
            color: ROMANTIC_COLORS[Math.floor(Math.random() * ROMANTIC_COLORS.length)],
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.04 + 0.015,
            // Para la explosión: velocidad pre-calculada
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8 - Math.random() * 4,
            gravity: Math.random() * 0.12 + 0.04,
            life: 1.0,
            decay: Math.random() * 0.008 + 0.003
        });
    }

    // --- PARTÍCULAS FLOTANTES DE FONDO ---
    for (let i = 0; i < NUM_DRIFT; i++) {
        driftParticles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 1.2 + 0.3,
            vy: -(Math.random() * 0.5 + 0.1),
            alpha: Math.random() * 0.4 + 0.1,
            color: ROMANTIC_COLORS[Math.floor(Math.random() * ROMANTIC_COLORS.length)]
        });
    }
}


// ============================================
// 3. EXPLOSIÓN DE POLVO DORADO (al hacer clic)
// ============================================
const goldBurst = [];

function triggerExplosion() {
    exploded = true;

    // Ocultar UI
    document.getElementById('mainUI').style.transition = 'opacity 1.5s ease';
    document.getElementById('mainUI').style.opacity    = '0';
    document.getElementById('mainUI').style.pointerEvents = 'none';

    // Lanzar las partículas de la silueta como explosión
    // (ya tienen vx, vy, gravity, decay asignados)

    // Crear también un burst de oro extra desde el centro
    for (let i = 0; i < 200; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 14 + 2;
        goldBurst.push({
            x: center.x, y: center.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 3,
            r: Math.random() * 2.5 + 0.5,
            hue: 35 + Math.random() * 20, // Dorado 35–55
            life: 1.0,
            decay: Math.random() * 0.012 + 0.005,
            gravity: 0.06
        });
    }

    // Mostrar dedicatoria después del clímax
    setTimeout(showDedicatoria, 2200);
}

function showDedicatoria() {
    const screen = document.getElementById('dedicatoriaScreen');
    screen.classList.remove('hidden');
    void screen.offsetWidth; // reflow
    screen.classList.add('visible');
}


// ============================================
// 4. LOOP DE ANIMACIÓN 60 FPS
// ============================================
function animate() {
    requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(10, 0, 5, 0.22)';
    ctx.fillRect(0, 0, width, height);

    time += 0.016;

    if (!exploded) {
        // --- MODO NORMAL: Silueta + Drift ---

        // A) Silueta titilante
        for (let i = 0; i < silhouetteParticles.length; i++) {
            const p = silhouetteParticles[i];
            const glow = 0.45 + Math.sin(p.phase + time * p.speed * 80) * 0.45;

            ctx.globalAlpha = glow * 0.85;
            ctx.fillStyle   = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * (1 + 0.35 * Math.sin(time * 1.8)), 0, Math.PI * 2);
            ctx.fill();
        }

        // B) Fondo de polvo flotante
        for (let i = 0; i < driftParticles.length; i++) {
            const fp = driftParticles[i];
            fp.y += fp.vy;
            if (fp.y < -10) { fp.y = height + 10; fp.x = Math.random() * width; }

            ctx.globalAlpha = fp.alpha;
            ctx.fillStyle   = fp.color;
            ctx.beginPath();
            ctx.arc(fp.x, fp.y, fp.r, 0, Math.PI * 2);
            ctx.fill();
        }

    } else {
        // --- MODO EXPLOSIÓN ---

        // A) Silueta se dispersa
        for (let i = silhouetteParticles.length - 1; i >= 0; i--) {
            const p = silhouetteParticles[i];
            p.x    += p.vx;
            p.y    += p.vy;
            p.vy   += p.gravity;
            p.life -= p.decay;

            if (p.life <= 0) { silhouetteParticles.splice(i, 1); continue; }

            ctx.globalAlpha = p.life * 0.85;
            ctx.fillStyle   = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }

        // B) Burst dorado extra
        for (let i = goldBurst.length - 1; i >= 0; i--) {
            const g = goldBurst[i];
            g.x    += g.vx;
            g.y    += g.vy;
            g.vy   += g.gravity;
            g.life -= g.decay;

            if (g.life <= 0) { goldBurst.splice(i, 1); continue; }

            ctx.globalAlpha = g.life;
            ctx.fillStyle   = `hsl(${g.hue}, 90%, 65%)`;
            ctx.shadowBlur  = 8;
            ctx.shadowColor = `hsl(${g.hue}, 100%, 70%)`;
            ctx.beginPath();
            ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur  = 0;
        }
    }

    ctx.globalAlpha = 1.0;
}


// ============================================
// 5. EVENTO DEL BOTÓN
// ============================================
document.getElementById('loveBtn').addEventListener('click', () => {
    if (!exploded) triggerExplosion();
});


// ============================================
// INICIO
// ============================================
resize();
animate();
