// ==========================================
// OSOS - APP.JS (Escenas CSS, sin imágenes)
// ==========================================

const slides = [
    {
        text: "Cada momento a tu lado es un regalo...",
        scene: `<div class="s-hug">
                    <span class="bear bear-a">🐻</span>
                    <span class="bear bear-b">🐻</span>
                    <span class="hearts">💕</span>
                </div>`,
        bg: "radial-gradient(ellipse at 50% 60%, #3d0c22 0%, #0d0208 70%)"
    },
    {
        text: "Eres mi primer pensamiento al despertar 🌅",
        scene: `<div class="s-kiss">
                    <span class="bear bear-a">🐻</span>
                    <span class="bear bear-b">🐻</span>
                    <span class="star">✨</span>
                </div>`,
        bg: "radial-gradient(ellipse at 40% 50%, #2a0b2e 0%, #08020a 70%)"
    },
    {
        text: "Siempre logras sacarme la más grande sonrisa 🌸",
        scene: `<div class="s-happy">
                    <span class="bear bear-a">🐻</span>
                    <span class="bear bear-b">🐻</span>
                    <span class="confetti">🌸</span>
                </div>`,
        bg: "radial-gradient(ellipse at 60% 40%, #3b0919 0%, #0c0206 70%)"
    },
    {
        text: "Sin importar el tiempo ni la distancia 🕊️",
        scene: `<div class="s-rest">
                    <span class="moon">🌙</span>
                    <span class="zzz">z z z</span>
                    <span class="bear bear-a">🐻</span>
                    <span class="bear bear-b">🐻</span>
                </div>`,
        bg: "radial-gradient(ellipse at 50% 70%, #1a0630 0%, #060109 70%)"
    },
    {
        text: "Quiero quedarme a tu lado para siempre ✨",
        scene: `<div class="s-walk">
                    <span class="bear bear-a">🐻</span>
                    <span class="bear bear-b">🐻</span>
                    <span class="path">· · · · · · ·</span>
                </div>`,
        bg: "radial-gradient(ellipse at 30% 50%, #38081a 0%, #0b0206 70%)"
    },
    {
        text: "Porque tú eres quien ilumina mi mundo 🌟",
        scene: `<div class="s-love">
                    <span class="bear bear-a">🐻</span>
                    <span class="bear bear-b">🐻</span>
                    <div class="hearts-ring">
                        <span class="h1">💗</span>
                        <span class="h2">💖</span>
                        <span class="h3">💕</span>
                        <span class="h4">💓</span>
                    </div>
                </div>`,
        bg: "radial-gradient(ellipse at 70% 40%, #2e0b28 0%, #090108 70%)"
    },
    {
        text: "Te quiero muchísimo, mi amor ❤️",
        scene: `<div class="s-final-love">
                    <span class="big-heart">💖</span>
                    <div class="bears-row">
                        <span>🐻</span>
                        <span>🐻</span>
                    </div>
                </div>`,
        bg: "radial-gradient(ellipse at 50% 50%, #3d0818 0%, #100105 70%)"
    }
];

let current = 0;
let isAnimating = false;

// ----- FLOATING PARTICLES BACKGROUND -----
function initBg() {
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    for (let i = 0; i < 70; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vy: -(0.1 + Math.random() * 0.3),
            vx: (Math.random() - 0.5) * 0.2,
            size: Math.random() * 1.5 + 0.5,
            alpha: Math.random() * 0.5 + 0.1,
            alphaDir: Math.random() > 0.5 ? 1 : -1,
            alphaSpeed: Math.random() * 0.005 + 0.002,
        });
    }

    function draw() {
        requestAnimationFrame(draw);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.y += p.vy; p.x += p.vx;
            p.alpha += p.alphaSpeed * p.alphaDir;
            if (p.alpha >= 0.7) p.alphaDir = -1;
            if (p.alpha <= 0.05) p.alphaDir = 1;
            if (p.y < -10) p.y = canvas.height + 10;
            if (p.x < -10) p.x = canvas.width + 10;
            if (p.x > canvas.width + 10) p.x = -10;

            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${330 + Math.random() * 30}, 80%, 80%)`;
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }
    draw();
}

// ----- PAGINATION -----
function buildDots() {
    const row = document.getElementById('dotsRow');
    row.innerHTML = '';
    slides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        row.appendChild(dot);
    });
}

function updateDots(i) {
    document.querySelectorAll('.dot').forEach((d, idx) => {
        d.classList.toggle('active', idx === i);
    });
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ----- SHOW SLIDE -----
function showSlide(index) {
    if (isAnimating) return;
    isAnimating = true;

    const scene = document.getElementById('bearScene');
    const txt   = document.getElementById('msgText');
    const bg    = document.getElementById('slideBg');

    // Fade out current
    scene.classList.remove('show');
    txt.classList.remove('show');

    setTimeout(() => {
        // Inject new scene HTML
        scene.innerHTML = slides[index].scene;
        txt.textContent = slides[index].text;
        bg.style.background = slides[index].bg;
        updateDots(index);

        const hint = document.getElementById('tapHint');
        hint.textContent = index === slides.length - 1
            ? 'Toca para ver el final 💌'
            : 'Toca para continuar ✨';

        // Force reflow then show
        void scene.offsetWidth;
        scene.classList.add('show');
        txt.classList.add('show');

        setTimeout(() => { isAnimating = false; }, 600);
    }, 500);
}

// ----- FALLING PETALS (FINAL) -----
function startPetals() {
    const container = document.getElementById('petalFall');
    const items = ['🌸', '🌺', '💕', '🌹', '✨', '🧸', '💖'];
    const style = document.createElement('style');
    style.textContent = `
        @keyframes petalDrop {
            0%   { transform: translateY(-20px) rotate(0deg); opacity:1; }
            100% { transform: translateY(110vh) rotate(360deg); opacity:0.3; }
        }
    `;
    document.head.appendChild(style);

    setInterval(() => {
        const p = document.createElement('div');
        p.textContent = items[Math.floor(Math.random() * items.length)];
        p.style.cssText = `
            position:absolute; top:0;
            left: ${Math.random() * 100}%;
            font-size: ${0.9 + Math.random() * 1.4}rem;
            animation: petalDrop ${4 + Math.random() * 5}s linear forwards;
            pointer-events:none;
        `;
        container.appendChild(p);
        setTimeout(() => p.remove(), 9000);
    }, 300);
}

// ----- INIT -----
document.addEventListener('DOMContentLoaded', () => {
    initBg();

    document.getElementById('startBtn').addEventListener('click', () => {
        switchScreen('slideScreen');
        buildDots();
        setTimeout(() => showSlide(0), 200);
    });

    document.getElementById('slideScreen').addEventListener('click', () => {
        if (isAnimating) return;
        if (current < slides.length - 1) {
            current++;
            showSlide(current);
        } else {
            switchScreen('finalScreen');
            startPetals();
        }
    });
});
