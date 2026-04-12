// ==========================================
// CAMINO DE ESTRELLAS - APP.JS
// ==========================================

const starMessages = [
    { msg: 'Desde el primer momento en que te vi, supe que eras especial... ⭐', emoji: '⭐' },
    { msg: 'Me encanta cómo te ríes de las cosas más simples y las haces mágicas 🌟', emoji: '🌟' },
    { msg: 'Eres la persona con quien el tiempo siempre pasa demasiado rápido 💫', emoji: '💫' },
    { msg: 'Tu forma de ser tiene una luz que pocas personas en el mundo tienen ✨', emoji: '✨' },
    { msg: 'Pienso en ti aunque no deba... y eso me dice todo lo que necesito saber 🌠', emoji: '🌠' },
    { msg: 'Hay algo que quiero preguntarte... y es lo más importante para mí 💛', emoji: '⭐' },
];

// Posiciones en % del viewport
const starPositions = [
    { x: 50, y: 75 }, { x: 30, y: 60 }, { x: 65, y: 45 },
    { x: 25, y: 30 }, { x: 55, y: 18 }, { x: 75, y: 32 },
];

let currentStar = 0;
let starsUnlocked = 0;

function initStarField(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    for (let i = 0; i < 250; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.1 + Math.random() * 0.6})`;
        ctx.fill();
    }
}

function buildStarMap() {
    const map = document.getElementById('starMap');
    map.innerHTML = '';

    // Draw SVG path connecting stars
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('star-path');
    svg.setAttribute('viewBox', `0 0 100 100`);
    svg.setAttribute('preserveAspectRatio', 'none');

    for (let i = 0; i < starPositions.length - 1; i++) {
        const a = starPositions[i], b = starPositions[i+1];
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
        line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
        line.setAttribute('stroke', 'rgba(255,220,100,0.15)');
        line.setAttribute('stroke-width', '0.3');
        line.setAttribute('stroke-dasharray', '1,1');
        line.id = `path-${i}`;
        svg.appendChild(line);
    }
    map.appendChild(svg);

    // Create star nodes
    starPositions.forEach((pos, i) => {
        const node = document.createElement('div');
        node.className = 'star-node' + (i === 0 ? ' unlocked' : '');
        node.id = `star-${i}`;
        node.style.left = pos.x + '%';
        node.style.top  = pos.y + '%';
        node.innerHTML = `
            <div class="star-inner">⭐</div>
            <span class="star-num">${i+1}</span>
        `;
        node.addEventListener('click', () => clickStar(i));
        map.appendChild(node);
    });
}

function clickStar(index) {
    if (index !== currentStar) return; // must go in order

    const node = document.getElementById(`star-${index}`);
    node.classList.add('active-pick');

    // Show message popup
    const popup = document.getElementById('msgPopup');
    document.getElementById('msgText').textContent = starMessages[index].msg;
    popup.classList.add('visible');

    // Light up path
    const pathEl = document.getElementById(`path-${index}`);
    if (pathEl) {
        pathEl.setAttribute('stroke', 'rgba(255,220,100,0.7)');
        pathEl.setAttribute('stroke-width', '0.5');
    }
}

function advanceStar() {
    const popup = document.getElementById('msgPopup');
    popup.classList.remove('visible');

    starsUnlocked++;
    currentStar++;

    // Update progress
    const pct = (starsUnlocked / starPositions.length) * 100;
    document.getElementById('progressBar').style.width = pct + '%';

    if (currentStar < starPositions.length) {
        document.getElementById(`star-${currentStar}`).classList.add('unlocked');
    } else {
        // All done!
        setTimeout(() => switchScreen('finalScreen'), 600);
    }
}

function spawnShootingStar() {
    const container = document.getElementById('shootingStars');
    const el = document.createElement('div');
    el.style.cssText = `
        position:absolute; width:${80+Math.random()*120}px; height:2px;
        background:linear-gradient(90deg, rgba(255,220,100,0.9), transparent);
        top:${Math.random()*100}%; left:${-20}%;
        border-radius:2px; pointer-events:none;
        animation: shootAcross ${1+Math.random()*1.5}s ease-out forwards;
        transform: rotate(${-10+Math.random()*20}deg);
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), 2000);
}

function celebrate() {
    switchScreen('celebScreen');
    initStarField('bgCanvas4');
    setInterval(spawnShootingStar, 400);
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

const styleExtra = document.createElement('style');
styleExtra.textContent = `
    @keyframes shootAcross {
        0%   { left:-20%; opacity:1; }
        100% { left:120%; opacity:0; }
    }
`;
document.head.appendChild(styleExtra);

document.addEventListener('DOMContentLoaded', () => {
    initStarField('bgCanvas');
    initStarField('bgCanvas2');
    initStarField('bgCanvas3');

    document.getElementById('startBtn').addEventListener('click', () => {
        switchScreen('starScreen');
        buildStarMap();
        setInterval(spawnShootingStar, 3000);
    });

    document.getElementById('msgClose').addEventListener('click', advanceStar);

    document.getElementById('yesBtn').addEventListener('click', celebrate);
    document.getElementById('maybeBtn').addEventListener('click', () => {
        document.getElementById('maybeBtn').textContent = '¡Bien, SÍ! ⭐';
        setTimeout(celebrate, 700);
    });
});
