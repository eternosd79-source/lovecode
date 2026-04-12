// ============================================
// REGALOS DEL ALMA — APP.JS
// ============================================

// ============================================
// 1. CANVAS AMBIENTAL: Polvo de Estrellas
// ============================================
const starCanvas = document.getElementById('starCanvas');
const sCtx = starCanvas.getContext('2d');

function resizeStar() {
    starCanvas.width  = window.innerWidth;
    starCanvas.height = window.innerHeight;
}
resizeStar();
window.addEventListener('resize', resizeStar);

const stars = [];
for (let i = 0; i < 90; i++) {
    stars.push({
        x: Math.random() * starCanvas.width,
        y: Math.random() * starCanvas.height,
        r: Math.random() * 1.2 + 0.2,
        alpha: Math.random(),
        twinkle: Math.random() * Math.PI * 2,
        color: Math.random() > 0.6 ? '#ffdcb4' : '#ffe4ec'
    });
}

function animateStars() {
    sCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    stars.forEach(s => {
        s.twinkle += 0.025;
        const a = 0.2 + 0.6 * Math.abs(Math.sin(s.twinkle));
        sCtx.globalAlpha = a;
        sCtx.fillStyle = s.color;
        sCtx.beginPath();
        sCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        sCtx.fill();
    });
    sCtx.globalAlpha = 1;
    requestAnimationFrame(animateStars);
}
animateStars();


// ============================================
// 2. NAVEGACIÓN DE VISTAS
// ============================================
function openView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');

    if (viewId === 'viewOso') startBearAnimation();
    if (viewId === 'viewPromesa') startPetals();
    else stopPetals();
}


// ============================================
// 3. VISTA PROMESA: Canvas de Pétalos
// ============================================
const petalCanvas = document.getElementById('petalCanvas');
const pCtx = petalCanvas.getContext('2d');
let petalAnim = null;
const petals = [];

function resizePetal() {
    petalCanvas.width  = window.innerWidth;
    petalCanvas.height = window.innerHeight;
}
resizePetal();
window.addEventListener('resize', resizePetal);

function startPetals() {
    petalCanvas.style.display = 'block';
    if (petalAnim) return; // ya corriendo

    // Crear pétalos
    petals.length = 0;
    for (let i = 0; i < 35; i++) {
        petals.push({
            x: Math.random() * petalCanvas.width,
            y: Math.random() * petalCanvas.height - petalCanvas.height,
            size: Math.random() * 8 + 4,
            speedY: Math.random() * 1 + 0.5,
            speedX: (Math.random() - 0.5) * 0.6,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.03,
            alpha: Math.random() * 0.4 + 0.2
        });
    }

    function drawPetals() {
        pCtx.clearRect(0, 0, petalCanvas.width, petalCanvas.height);
        petals.forEach(p => {
            p.y     += p.speedY;
            p.x     += p.speedX + Math.sin(p.angle * 0.4) * 0.4;
            p.angle += p.spin;
            if (p.y > petalCanvas.height + 20) {
                p.y = -20; p.x = Math.random() * petalCanvas.width;
            }
            pCtx.save();
            pCtx.globalAlpha = p.alpha;
            pCtx.translate(p.x, p.y);
            pCtx.rotate(p.angle);
            pCtx.beginPath();
            pCtx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
            const g = pCtx.createRadialGradient(0, -p.size * 0.3, 0, 0, 0, p.size);
            g.addColorStop(0, 'rgba(255, 180, 200, 0.9)');
            g.addColorStop(1, 'rgba(200, 60, 100, 0.15)');
            pCtx.fillStyle = g;
            pCtx.fill();
            pCtx.restore();
        });
        petalAnim = requestAnimationFrame(drawPetals);
    }
    drawPetals();
}

function stopPetals() {
    if (petalAnim) { cancelAnimationFrame(petalAnim); petalAnim = null; }
    pCtx.clearRect(0, 0, petalCanvas.width, petalCanvas.height);
}


// ============================================
// 4. BOTÓN ESCURRIDIZO (No) + CELEBRACIÓN (Sí)
// ============================================
const noBtnSan  = document.getElementById('noBtnSan');
const yesBtnSan = document.getElementById('yesBtnSan');

function evadeButton(e) {
    e.preventDefault();
    noBtnSan.style.position = 'fixed';
    const w = noBtnSan.offsetWidth;
    const h = noBtnSan.offsetHeight;
    const tx = Math.max(10, Math.random() * (window.innerWidth  - w - 20));
    const ty = Math.max(10, Math.random() * (window.innerHeight - h - 60));
    noBtnSan.style.transition = 'top 0.25s ease, left 0.25s ease';
    noBtnSan.style.left = tx + 'px';
    noBtnSan.style.top  = ty + 'px';

    // Dejamos un mini rastro de corazón donde estaba
    spawnMiniHeart(e.clientX || tx, e.clientY || ty);
}

function spawnMiniHeart(x, y) {
    const h = document.createElement('span');
    h.textContent = '💕';
    h.style.cssText = `position:fixed; left:${x}px; top:${y}px; font-size:1.2rem;
        pointer-events:none; z-index:9999; animation: miniFloat 1.2s ease forwards;`;
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 1300);
}

// Inyectar keyframe miniFloat dinámicamente
const floatStyle = document.createElement('style');
floatStyle.textContent = `
@keyframes miniFloat {
    0%   { opacity:1; transform: translate(-50%,-50%) scale(0.8); }
    100% { opacity:0; transform: translate(-50%, -80px) scale(1.4); }
}`;
document.head.appendChild(floatStyle);

noBtnSan.addEventListener('mouseover', evadeButton);
noBtnSan.addEventListener('touchstart', evadeButton, { passive: false });

yesBtnSan.addEventListener('click', () => {
    document.getElementById('promesaButtons').style.display = 'none';
    const q = document.getElementById('promesaQuestion');
    q.style.transition = 'all 1s ease';
    q.innerHTML = `<span style="font-family:'Great Vibes',cursive">¡Lo sabía...<br>Eres mi todo 💕</span>`;

    // Lluvia masiva de pétalos y corazones
    for (let i = 0; i < 18; i++) {
        setTimeout(() => spawnMiniHeart(
            Math.random() * window.innerWidth,
            Math.random() * window.innerHeight * 0.5 + 100
        ), i * 100);
    }
});


// ============================================
// 5. ANIMACIÓN DEL OSO (Dibujo + Escritura)
// ============================================
function startBearAnimation() {
    const osoContent = document.getElementById('osoContent');
    const osoLabel   = document.getElementById('osoLabel');
    const osoSub     = document.getElementById('osoSub');

    // Reset
    osoContent.classList.remove('draw-active');
    osoLabel.textContent = '';
    osoSub.classList.remove('show');
    void osoContent.offsetWidth; // reflow

    // Iniciar dibujo SVG
    osoContent.classList.add('draw-active');

    // Escritura tipográfica "TE AMO" letra por letra después del SVG
    const msg = 'Te Amo';
    let idx = 0;
    const typeTimer = setInterval(() => {
        osoLabel.textContent += msg[idx];
        idx++;
        if (idx >= msg.length) {
            clearInterval(typeTimer);
            // Mostrar subtítulo
            setTimeout(() => osoSub.classList.add('show'), 600);
        }
    }, 180);

    osoSub.textContent = '...y siempre será así.';
}
