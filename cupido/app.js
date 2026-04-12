// ================================================
// EL FLECHAZO CELESTIAL — Motor Completo
// ================================================

const canvas    = document.getElementById('cupidCanvas');
const ctx       = canvas.getContext('2d');
const introScreen  = document.getElementById('introScreen');
const introTitle   = document.getElementById('introTitle');
const introSub     = document.getElementById('introSub');
const btnReveal    = document.getElementById('btnReveal');
const climaxScreen = document.getElementById('climaxScreen');

let W, H, CX, CY;

function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    CX = W / 2;
    CY = H / 2;
}
window.addEventListener('resize', resize);
resize();

// ================================================
// 1. INTRO CINEMATOGRÁFICO
// ================================================
function showEl(el, delay, cb) {
    setTimeout(() => {
        el.style.display = 'block';
        void el.offsetWidth; // force reflow
        el.classList.add('fade-in');
        if (cb) setTimeout(cb, 2600);
    }, delay);
}

introTitle.style.opacity = '0';
setTimeout(() => {
    introTitle.style.opacity = '0';
    introTitle.classList.add('fade-in');
}, 600);

setTimeout(() => {
    showEl(introSub, 0, () => {
        showEl(btnReveal, 300, null);
    });
}, 4200);

btnReveal.addEventListener('click', () => {
    // Desvanecer intro
    introScreen.style.opacity = '0';
    introScreen.style.pointerEvents = 'none';
    setTimeout(() => { introScreen.style.display = 'none'; }, 2000);

    // Arrancar la magia del canvas
    setTimeout(() => startCupidAnimation(), 500);
});

// ================================================
// 2. PRECALCULAR PUNTOS DEL CORAZÓN
// ================================================
function getHeartPoint(t, scale, ox, oy) {
    // Ecuación paramétrica clásica del corazón
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
    return { x: ox + x * scale, y: oy + y * scale };
}

// ================================================
// 3. SISTEMA DE PARTÍCULAS TRAIL (ESTELA COMETA)
// ================================================
const trailParticles = [];

class TrailParticle {
    constructor(x, y) {
        this.x  = x + (Math.random() - 0.5) * 8;
        this.y  = y + (Math.random() - 0.5) * 8;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5 - 0.5;
        this.life    = 1 + Math.random() * 0.5;
        this.maxLife = this.life;
        this.size    = Math.random() * 3 + 1;
        // Mezcla de tonos rosas, rojos y dorados
        const palette = [
            `hsl(${340 + Math.random()*20}, 100%, 65%)`,  // Rosa
            `hsl(${50  + Math.random()*20}, 100%, 65%)`,  // Dorado
            `hsl(0, 100%, 70%)`,                           // Rojo
            '#ffffff'
        ];
        this.color = palette[Math.floor(Math.random() * palette.length)];
    }
    update() {
        this.x    += this.vx;
        this.y    += this.vy;
        this.vy   += 0.04; // gravedad suave
        this.life -= 0.018;
    }
    draw(ctx) {
        const a = Math.max(0, this.life / this.maxLife);
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * a, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// ================================================
// 4. PUNTOS DEL CORAZÓN — ESCALA RESPONSIVA
// ================================================
function buildHeartPath(totalPoints) {
    const scale = Math.min(W, H) * 0.026; // ~26% del menor lado
    const pts   = [];
    for (let i = 0; i < totalPoints; i++) {
        const t = (i / totalPoints) * Math.PI * 2;
        pts.push(getHeartPoint(t, scale, CX, CY - H * 0.04));
    }
    return pts;
}

// ================================================
// 5. PARTÍCULAS DE EXPLOSIÓN FINAL
// ================================================
const burstParticles = [];

class BurstParticle {
    constructor(x, y, angle) {
        const spd  = Math.random() * 12 + 4;
        this.x     = x;
        this.y     = y;
        this.vx    = Math.cos(angle) * spd;
        this.vy    = Math.sin(angle) * spd;
        this.life  = 1;
        this.size  = Math.random() * 4 + 1.5;
        const hue  = Math.random() > 0.5 ? 340 + Math.random()*30 : 45 + Math.random()*25;
        this.color = `hsl(${hue}, 100%, 65%)`;
    }
    update() {
        this.x    += this.vx;
        this.y    += this.vy;
        this.vy   += 0.15;
        this.vx   *= 0.97;
        this.life -= 0.012;
    }
    draw(ctx) {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// ================================================
// 6. MOTOR DE ANIMACIÓN PRINCIPAL
// ================================================
let heartPath    = [];
let drawIndex    = 0;
let drawSpeed    = 5; // Puntos nuevos por frame que dibuja la flecha
let isDrawing    = false;
let isExploding  = false;
let explodeDone  = false;
let beatTime     = 0;

// Posición de la "punta" del rayo que guía el dibujo
let arrowX = 0, arrowY = 0;

function spawnBurst(fromPath) {
    // Explosión distribuida por todos los puntos del corazón
    fromPath.forEach(pt => {
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            burstParticles.push(new BurstParticle(pt.x, pt.y, angle));
        }
    });
}

function startCupidAnimation() {
    heartPath = buildHeartPath(600);
    arrowX    = heartPath[0].x;
    arrowY    = heartPath[0].y;
    isDrawing = true;
    loop();
}

// Dibuja el contorno ya trazado usando un camino luminoso
function drawHeartTrace() {
    if (drawIndex < 2) return;

    let scaleBeat = 1;
    if (isExploding) {
        scaleBeat = 1 + Math.sin(beatTime * 2.5) * 0.05; // Fuerte latido
    }

    ctx.save();
    // Escalar desde el centro para el latido
    ctx.translate(CX, CY);
    ctx.scale(scaleBeat, scaleBeat);
    ctx.translate(-CX, -CY);

    ctx.beginPath();
    ctx.moveTo(heartPath[0].x, heartPath[0].y);
    for (let i = 1; i < heartPath.length; i++) {
        if (!isExploding && i > drawIndex) break; 
        ctx.lineTo(heartPath[i].x, heartPath[i].y);
    }
    
    ctx.strokeStyle = 'rgba(255, 80, 130, 0.9)';
    ctx.lineWidth   = 3.5;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.shadowColor = '#ff3080';
    ctx.shadowBlur  = isExploding ? 35 + Math.sin(beatTime * 4) * 15 : 20;
    ctx.globalAlpha = 1;
    ctx.stroke();

    if (isExploding) {
        // En lugar de estar vacío, el corazón gotea luz y se rellena de fucsia
        ctx.fillStyle = `rgba(255, 50, 100, ${0.15 + Math.sin(beatTime * 2.5) * 0.05})`;
        ctx.fill();
    }
    ctx.restore();
}

// Dibuja el "cometa / flecha" — la cabeza luminosa que traza el camino
function drawArrow(x, y) {
    // Halo exterior
    const grd = ctx.createRadialGradient(x, y, 0, x, y, 18);
    grd.addColorStop(0,   '#ffffff');
    grd.addColorStop(0.2, '#ff80a0');
    grd.addColorStop(1,   'rgba(255,0,80,0)');
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
}

function loop() {
    requestAnimationFrame(loop);

    // Limpiar con trail semitransparente para efecto estela oscura
    ctx.globalAlpha = 0.18;
    ctx.fillStyle   = '#05020a';
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    if (isDrawing) {
        // Avanzar el índice de dibujo
        drawIndex = Math.min(drawIndex + drawSpeed, heartPath.length - 1);

        // Generar partículas de estela en la punta del trazo
        const pt = heartPath[drawIndex];
        arrowX = pt.x; arrowY = pt.y;
        for (let i = 0; i < 4; i++) {
            trailParticles.push(new TrailParticle(arrowX, arrowY));
        }

        // Comprobar si terminó el corazón completo
        if (drawIndex >= heartPath.length - 1 && !isExploding) {
            isDrawing   = false;
            isExploding = true;
            spawnBurst(heartPath);

            // Mostrar los mensajes clímax en secuencia mágica
            setTimeout(() => {
                climaxScreen.classList.remove('hidden');
                climaxScreen.style.display       = 'flex';
                climaxScreen.style.opacity       = '1';
                climaxScreen.style.pointerEvents = 'auto';
                void climaxScreen.offsetWidth;

                // Secuencia de delay para construir la tensión emocional
                setTimeout(() => document.getElementById('ct1').classList.add('active'), 200);
                setTimeout(() => document.getElementById('ct2').classList.add('active'), 2400);
                setTimeout(() => document.getElementById('ct3').classList.add('active'), 5000);
                setTimeout(() => document.getElementById('ct4').classList.add('active'), 7500);

            }, 1200);
        }
    }

    if (isExploding) {
        beatTime += 0.02;
    }

    // Dibujar el trazo del corazón (ya rellenado y latiendo si explotó)
    drawHeartTrace();

    // Dibujar el cometa/punta si aún trazando
    if (isDrawing) {
        drawArrow(arrowX, arrowY);
    }

    // Actualizar y pintar partículas de estela
    for (let i = trailParticles.length - 1; i >= 0; i--) {
        trailParticles[i].update();
        trailParticles[i].draw(ctx);
        if (trailParticles[i].life <= 0) trailParticles.splice(i, 1);
    }

    // Actualizar y pintar partículas de explosión final
    for (let i = burstParticles.length - 1; i >= 0; i--) {
        burstParticles[i].update();
        burstParticles[i].draw(ctx);
        if (burstParticles[i].life <= 0) burstParticles.splice(i, 1);
    }

    ctx.globalAlpha = 1;
}
