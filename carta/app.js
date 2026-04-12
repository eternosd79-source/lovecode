// =============================================
// 1. CANVAS AMBIENTAL (Pétalos + Estrellas)
// =============================================
const canvas = document.getElementById('ambientCanvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Clase de partícula (Pétalo o estrella)
class Particle {
    constructor(type) {
        this.type  = type; // 'petal' | 'star'
        this.reset();
    }
    reset() {
        this.x     = Math.random() * canvas.width;
        this.y     = (this.type === 'petal') ? -20 : Math.random() * canvas.height;
        this.size  = (this.type === 'petal') ? Math.random() * 7 + 4 : Math.random() * 1.5 + 0.3;
        this.speedY = (this.type === 'petal') ? Math.random() * 1 + 0.4 : 0;
        this.speedX = (this.type === 'petal') ? (Math.random() - 0.5) * 0.6 : 0;
        this.angle  = Math.random() * Math.PI * 2;
        this.spin   = (Math.random() - 0.5) * 0.03;
        this.alpha  = (this.type === 'petal') ? Math.random() * 0.5 + 0.2 : Math.random() * 0.6 + 0.1;
        this.twinkle = Math.random() * Math.PI * 2;
    }
    update() {
        if (this.type === 'petal') {
            this.y     += this.speedY;
            this.x     += this.speedX + Math.sin(this.angle * 0.5) * 0.4;
            this.angle += this.spin;
            if (this.y > canvas.height + 30) this.reset();
        } else {
            this.twinkle += 0.03;
        }
    }
    draw() {
        ctx.save();
        if (this.type === 'petal') {
            ctx.globalAlpha = this.alpha;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            // Dibujar pétalo oval
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size * 0.55, this.size, 0, 0, Math.PI * 2);
            const g = ctx.createRadialGradient(0, -this.size * 0.3, 0, 0, 0, this.size);
            g.addColorStop(0, 'rgba(255, 160, 190, 0.9)');
            g.addColorStop(1, 'rgba(180, 60, 100, 0.2)');
            ctx.fillStyle = g;
            ctx.fill();
        } else {
            const twinkleAlpha = this.alpha * (0.5 + 0.5 * Math.sin(this.twinkle));
            ctx.globalAlpha = twinkleAlpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = '#ffe8c0';
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#ffd090';
            ctx.fill();
        }
        ctx.restore();
    }
}

// Crear partículas
const particles = [];
for (let i = 0; i < 22; i++) particles.push(new Particle('petal'));
for (let i = 0; i < 60; i++) particles.push(new Particle('star'));

function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateCanvas);
}
animateCanvas();


// =============================================
// 2. LÓGICA DEL SOBRE Y APERTURA
// =============================================
const waxSeal         = document.getElementById('waxSeal');
const envelopeWrapper = document.getElementById('envelopeWrapper');
const clickHint       = document.getElementById('clickHint');
const poeticHeader    = document.getElementById('poeticHeader');
const letterFullscreen = document.getElementById('letterFullscreen');
const envelopeStage   = document.getElementById('envelopeStage');

let opened = false;

waxSeal.addEventListener('click', openLetter);
waxSeal.addEventListener('touchend', (e) => { e.preventDefault(); openLetter(); }, {passive: false});

function openLetter() {
    if (opened) return;
    opened = true;

    // 1. Ocultar hint
    clickHint.classList.add('hide');

    // 2. Parar flotación + abrir sobre
    envelopeWrapper.classList.add('is-opening');
    setTimeout(() => envelopeWrapper.classList.add('open'), 200);

    // 3. Hacer llover corazones
    setTimeout(rainHearts, 600);

    // 4. Alejar sobre y mostrar carta pantalla completa
    setTimeout(() => {
        envelopeWrapper.classList.add('zoom-back');
        poeticHeader.style.opacity = '0';
        poeticHeader.style.transition = 'opacity 0.8s ease';

        setTimeout(() => {
            letterFullscreen.classList.remove('hidden');
            void letterFullscreen.offsetWidth; // reflow
            letterFullscreen.classList.add('visible');
        }, 600);

    }, 1800);
}

// =============================================
// 3. LLUVIA DE CORAZONES FLOTANTES
// =============================================
const HEARTS = ['❤', '🌹', '💕', '❤', '💖', '✨', '💗'];

function spawnHeart() {
    const el = document.createElement('div');
    el.className = 'floating-heart';
    el.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
    el.style.left  = (Math.random() * 90 + 5) + 'vw';
    el.style.bottom = (Math.random() * 40 + 5) + 'vh';
    el.style.fontSize = (Math.random() * 1.5 + 0.8) + 'rem';
    el.style.animationDuration = (Math.random() * 2 + 2) + 's';
    el.style.animationDelay    = (Math.random() * 0.8) + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
}

function rainHearts() {
    for (let i = 0; i < 18; i++) {
        setTimeout(spawnHeart, i * 150);
    }
}
