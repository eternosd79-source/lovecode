// ==========================================
// LIBRO DE NUESTRA HISTORIA — APP.JS
// ==========================================

// Páginas con contenido único, ícono temático y floritura
const storyPages = [
    {
        icon: '🌟',
        text: 'Desde el primer instante en que te vi, algo dentro de mí supo que eras especial.',
        flourish: '— Capítulo I —'
    },
    {
        icon: '🌙',
        text: 'Tu risa es la mejor melodía que mis oídos han tenido el privilegio de escuchar.',
        flourish: '— Capítulo II —'
    },
    {
        icon: '🌹',
        text: 'Contigo, incluso los momentos más simples se convierten en recuerdos que atesoro para siempre.',
        flourish: '— Capítulo III —'
    },
    {
        icon: '✨',
        text: 'Eres la razón por la que cada mañana tiene sentido y cada noche vale la pena.',
        flourish: '— Capítulo IV —'
    },
    {
        icon: '🕊️',
        text: 'En un mundo lleno de ruido, tú eres la calma que siempre busqué sin saberlo.',
        flourish: '— Capítulo V —'
    },
    {
        icon: '💫',
        text: 'Por todo esto... hay una pregunta que lleva tiempo esperando ser hecha.',
        flourish: '— Capítulo VI —'
    }
];

let currentPage = 0;
const totalPages = storyPages.length + 1; // +1 portada

// ── LUCIÉRNAGAS (Canvas de fondo) ────────────────────────
const bgCanvas = document.getElementById('bgCanvas');
const ctx      = bgCanvas.getContext('2d');
let fireflies  = [];

function resizeBg() {
    bgCanvas.width  = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    createFireflies();
}

function createFireflies() {
    fireflies = [];
    const count = Math.min(90, Math.floor(bgCanvas.width * bgCanvas.height / 12000));
    for (let i = 0; i < count; i++) {
        fireflies.push({
            x:     Math.random() * bgCanvas.width,
            y:     Math.random() * bgCanvas.height,
            r:     0.5 + Math.random() * 1.8,
            alpha: Math.random(),
            aDir:  Math.random() > 0.5 ? 1 : -1,
            aSpd:  0.003 + Math.random() * 0.008,
            vx:    (Math.random() - 0.5) * 0.3,
            vy:    (Math.random() - 0.5) * 0.3,
            hue:   30 + Math.random() * 25 // dorado a ámbar
        });
    }
}

function drawFireflies() {
    requestAnimationFrame(drawFireflies);
    ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    fireflies.forEach(f => {
        f.x += f.vx; f.y += f.vy;
        f.alpha += f.aSpd * f.aDir;
        if (f.alpha > 0.9) f.aDir = -1;
        if (f.alpha < 0.05) f.aDir = 1;
        if (f.x < 0) f.x = bgCanvas.width;
        if (f.x > bgCanvas.width) f.x = 0;
        if (f.y < 0) f.y = bgCanvas.height;
        if (f.y > bgCanvas.height) f.y = 0;

        ctx.globalAlpha = f.alpha * 0.65;
        ctx.shadowBlur  = 10;
        ctx.shadowColor = `hsl(${f.hue}, 85%, 70%)`;
        ctx.fillStyle   = `hsl(${f.hue}, 85%, 75%)`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur  = 0;
}

resizeBg();
window.addEventListener('resize', resizeBg);
drawFireflies();

// ── CONSTRUCCIÓN DEL LIBRO ────────────────────────────────
function buildBook() {
    const book = document.getElementById('book');
    book.innerHTML = '';

    // Portada (página 0)
    const cover = document.createElement('div');
    cover.className = 'page cover';
    cover.style.zIndex = totalPages;
    cover.innerHTML = `
        <div class="page-front">
            <div style="position:absolute;inset:10px;border:1.5px solid rgba(212,175,55,0.4);border-radius:2px 10px 10px 2px;pointer-events:none;"></div>
            <div style="position:absolute;top:10px;left:12px;font-size:0.9rem;color:rgba(212,175,55,0.5);">❧</div>
            <div style="position:absolute;top:10px;right:12px;font-size:0.9rem;color:rgba(212,175,55,0.5);transform:scaleX(-1);">❧</div>
            <div style="font-size:0.6rem;letter-spacing:3px;color:rgba(212,175,55,0.5);margin-bottom:8px;">✦ ✦ ✦</div>
            <h2 style="font-family:'Playfair Display',serif;font-style:italic;font-size:2rem;color:#f5d98a;line-height:1.25;text-shadow:0 0 12px rgba(212,175,55,0.4);">Nuestra<br>Historia</h2>
            <div style="font-size:0.6rem;letter-spacing:3px;color:rgba(212,175,55,0.5);margin-top:8px;">✦ ✦ ✦</div>
            <div style="font-size:0.6rem;letter-spacing:3px;color:rgba(245,217,138,0.4);margin-top:10px;">— Vol. I —</div>
            <div style="position:absolute;bottom:10px;left:12px;font-size:0.9rem;color:rgba(212,175,55,0.4);transform:scaleY(-1);">❦</div>
            <div style="position:absolute;bottom:10px;right:12px;font-size:0.9rem;color:rgba(212,175,55,0.4);transform:scale(-1);">❦</div>
        </div>
        <div class="page-back"></div>
    `;
    book.appendChild(cover);

    // Páginas de historia
    storyPages.forEach((pg, i) => {
        const p = document.createElement('div');
        p.className = 'page';
        p.style.zIndex = totalPages - (i + 1);
        p.innerHTML = `
            <div class="page-front">
                <div class="page-icon">${pg.icon}</div>
                <p class="page-text">${pg.text}</p>
                <div class="page-flourish">${pg.flourish}</div>
                <div class="page-num-inner">${i + 1}</div>
            </div>
            <div class="page-back photo-page">
                <div class="photo-frame">
                    <img src="foto.jpg" alt="Nuestra foto" class="couple-photo"
                         onerror="this.parentElement.classList.add('no-photo')"/>
                    <div class="photo-placeholder-text">📷<br><span>Coloca aquí<br>vuestra foto</span></div>
                </div>
            </div>
        `;
        book.appendChild(p);
    });
}

// ── CONTROLES ────────────────────────────────────────────
function updateControls() {
    document.getElementById('prevBtn').disabled = (currentPage === 0);
    const nextBtn = document.getElementById('nextBtn');
    nextBtn.textContent = currentPage === totalPages - 1 ? 'Descubrir 💖' : 'Siguiente →';
    const dNum = currentPage === 0
        ? 'Portada'
        : `${currentPage} / ${totalPages - 1}`;
    document.getElementById('pageNum').textContent = dNum;
}

function turnNext() {
    if (currentPage === totalPages - 1) {
        switchScreen('finalScreen');
        createFallingPetals('petalsFinal');
        return;
    }
    const pages = document.querySelectorAll('.page');
    pages[currentPage].classList.add('turned');
    const pIdx = currentPage;
    setTimeout(() => { pages[pIdx].style.zIndex = pIdx; }, 350);
    currentPage++;
    updateControls();
}

function turnPrev() {
    if (currentPage === 0) return;
    currentPage--;
    const pages = document.querySelectorAll('.page');
    pages[currentPage].classList.remove('turned');
    pages[currentPage].style.zIndex = totalPages - currentPage;
    updateControls();
}

// ── PÉTALOS CAYENDO ───────────────────────────────────────
function createFallingPetals(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const emojis = ['🌸','🌺','🌷','🌹','✿','❀'];
    for (let i = 0; i < 35; i++) {
        const p = document.createElement('div');
        p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        p.style.cssText = `
            position:absolute; top:-60px;
            left:${Math.random() * 100}%;
            font-size:${0.9 + Math.random() * 1.1}rem;
            opacity:${0.5 + Math.random() * 0.5};
            animation: petalFall ${4 + Math.random() * 6}s linear infinite;
            animation-delay: ${Math.random() * 6}s;
        `;
        container.appendChild(p);
    }
}

// ── SCREENS ───────────────────────────────────────────────
function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    buildBook();

    document.getElementById('openBtn').addEventListener('click', () => {
        switchScreen('bookScreen');
        document.getElementById('book').classList.add('opened');
        setTimeout(turnNext, 900);
    });

    document.getElementById('nextBtn').addEventListener('click', turnNext);
    document.getElementById('prevBtn').addEventListener('click', turnPrev);

    document.getElementById('yesBtn').addEventListener('click', () => {
        switchScreen('celebScreen');
        createFallingPetals('celebScreen');
    });
    document.getElementById('noBtn').addEventListener('click', () => {
        document.getElementById('noBtn').textContent = '¡Exacto! 💍';
        setTimeout(() => { switchScreen('celebScreen'); createFallingPetals('celebScreen'); }, 700);
    });
});
