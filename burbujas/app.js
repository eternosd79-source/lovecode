// ==========================================
// RAZONES PARA AMARTE - APP.JS
// ==========================================

const bubbleMessages = [
    "Porque me haces reír sin esfuerzo",
    "Porque eres mi lugar de calma",
    "Porque tu sonrisa ilumina todo",
    "Porque contigo soy mejor persona",
    "Porque admiro tu corazón",
    "Porque haces magia en lo cotidiano",
    "Porque siento que te conozco de siempre",
    "Porque tu abrazo es mi hogar"
];

let bubblesLeft = bubbleMessages.length;
const poppedMessages = []; // Para guardarlos en orden

// Elementos
const body = document.body;
const bubbleField = document.getElementById('bubbleField');
const bubbleCount = document.getElementById('bubbleCount');
const reasonsList = document.getElementById('reasonsList');
const revealHeader = document.getElementById('revealHeader');
const reasonsMural = document.getElementById('reasonsMural');

// ==========================================
// 1. SISTEMA DE BURBUJAS
// ==========================================
function createBubbles() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    bubbleMessages.forEach((msg, i) => {
        const b = document.createElement('div');
        b.className = 'bubble';
        
        // Mantener dentro del margen seguro
        const x = Math.random() * (vw - 180) + 20;
        const y = Math.random() * (vh - 220) + 80;
        
        b.style.left = x + 'px';
        b.style.top = y + 'px';
        
        // Animación desfasada
        b.style.animationDelay = (Math.random() * 2) + 's';
        b.style.animationDuration = (5 + Math.random() * 3) + 's';

        b.innerHTML = `<span class="bubble-text">${msg}</span>`;
        // Guardamos el mensaje real en data para el final
        b.dataset.message = msg;

        b.addEventListener('click', (e) => popBubble(e, b));
        // Touch para móviles
        b.addEventListener('touchstart', (e) => { e.preventDefault(); popBubble(e.touches[0], b); }, {passive: false});
        bubbleField.appendChild(b);
    });

    bubbleCount.textContent = bubblesLeft;
}

function popBubble(e, bubble) {
    if (bubble.classList.contains('popped')) return;
    bubble.classList.add('popped');
    
    // Guardar razón leída
    poppedMessages.push(bubble.dataset.message);

    bubblesLeft--;
    bubbleCount.textContent = bubblesLeft;

    // Mini explosión en el puntero
    spawnMiniParticles(e.clientX, e.clientY);

    setTimeout(() => bubble.remove(), 300);

    if (bubblesLeft === 0) {
        setTimeout(triggerFinale, 600);
    }
}

function spawnMiniParticles(x, y) {
    for(let i=0; i<12; i++) {
        const p = document.createElement('div');
        const angle = Math.random() * Math.PI * 2;
        const velocity = 20 + Math.random() * 30;
        const size = Math.random() * 4 + 2;
        p.style.cssText = `
            position:fixed; width:${size}px; height:${size}px; border-radius:50%;
            background: #ffe6ba; box-shadow: 0 0 8px rgba(255,200,100,0.8);
            left:${x}px; top:${y}px; pointer-events:none; z-index:999;
            transition: transform 0.4s ease-out, opacity 0.4s ease-out;
            transform:translate(-50%,-50%);
        `;
        document.body.appendChild(p);
        
        requestAnimationFrame(() => {
            p.style.transform = `translate(${Math.cos(angle)*velocity}px, ${Math.sin(angle)*velocity}px) scale(0)`;
            p.style.opacity = '0';
        });
        setTimeout(() => p.remove(), 400);
    }
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ==========================================
// 2. EL GRAN FINAL (MURAL DE CRISTAL)
// ==========================================
function triggerFinale() {
    // 1. Cambiar la atmósfera a lujo/noche
    body.classList.add('finale-bg');
    switchScreen('celebScreen');

    // 2. Construir la lista en el DOM
    poppedMessages.forEach((msg) => {
        const li = document.createElement('li');
        li.className = 'reason-item';
        li.innerHTML = msg;
        reasonsList.appendChild(li);
    });

    // 3. Estallar polvo dorado espectacular
    startGoldShower();

    // 4. Revelar Murales poco a poco
    setTimeout(() => { revealHeader.classList.add('show'); }, 500);
    setTimeout(() => { reasonsMural.classList.add('show'); }, 1500);

    // 5. Mostrar las razones mágicamente una a una
    setTimeout(() => {
        const items = document.querySelectorAll('.reason-item');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('show-item');
            }, index * 800); // 800ms entre cada frase
        });
    }, 4000);
}


// ==========================================
// 3. MOTORES JS DE PARTÍCULAS (CANVAS)
// ==========================================

/* --- A. FONDO AMBIENTE LENTO (dustCanvas) --- */
const dustCanvas = document.getElementById('dustCanvas');
const dCtx = dustCanvas.getContext('2d');
let dustArray = [];

function resizeCanvas(c) { c.width = window.innerWidth; c.height = window.innerHeight; }
window.addEventListener('resize', () => { resizeCanvas(dustCanvas); resizeCanvas(document.getElementById('goldCanvas')); });
resizeCanvas(dustCanvas);

class DustParticle {
    constructor() {
        this.x = Math.random() * dustCanvas.width;
        this.y = Math.random() * dustCanvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.baseAlpha = Math.random() * 0.4 + 0.1;
    }
    update() {
        this.x += this.speedX; this.y += this.speedY;
        if(this.x > dustCanvas.width) this.x = 0; if(this.x < 0) this.x = dustCanvas.width;
        if(this.y > dustCanvas.height) this.y = 0; if(this.y < 0) this.y = dustCanvas.height;
    }
    draw() {
        dCtx.fillStyle = `rgba(255, 230, 200, ${this.baseAlpha})`;
        dCtx.beginPath(); dCtx.arc(this.x, this.y, this.size, 0, Math.PI*2); dCtx.fill();
    }
}
for(let i=0; i<80; i++) dustArray.push(new DustParticle());
function animateDust() {
    dCtx.clearRect(0,0,dustCanvas.width,dustCanvas.height);
    dustArray.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateDust);
}
animateDust();


/* --- B. ESTALLIDO DE POLVO DORADO FINAL (goldCanvas) --- */
function startGoldShower() {
    const goldCanvas = document.getElementById('goldCanvas');
    const gCtx = goldCanvas.getContext('2d');
    resizeCanvas(goldCanvas);
    let goldParticles = [];

    // Estallar desde el centro
    const cx = goldCanvas.width / 2;
    const cy = goldCanvas.height / 2;

    for(let i=0; i<150; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 12 + 2;
        goldParticles.push({
            x: cx, y: cy,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            size: Math.random() * 3 + 1,
            life: 1,
            decay: Math.random() * 0.01 + 0.005,
            hue: 40 + Math.random() * 15 // Tonos dorados (40-55)
        });
    }

    // Efecto cascada (agregado continuo)
    const showerInterval = setInterval(() => {
        goldParticles.push({
            x: Math.random() * goldCanvas.width,
            y: -10,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 4 + 2,
            size: Math.random() * 2.5 + 0.5,
            life: 1, decay: 0.005, hue: 40 + Math.random() * 10
        });
    }, 50);

    function animateGold() {
        if(!document.getElementById('celebScreen').classList.contains('active')) return;
        requestAnimationFrame(animateGold);
        
        gCtx.clearRect(0,0,goldCanvas.width,goldCanvas.height);

        for(let i = goldParticles.length-1; i>=0; i--) {
            let p = goldParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.02; // gravedad suave
            p.life -= p.decay;
            
            gCtx.beginPath();
            gCtx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            gCtx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${p.life})`;
            gCtx.shadowBlur = 10;
            gCtx.shadowColor = `hsla(${p.hue}, 100%, 70%, ${p.life})`;
            gCtx.fill();

            if(p.life <= 0) goldParticles.splice(i, 1);
        }
    }
    animateGold();
    
    // Parar la lluvia extra después de 10 seg
    setTimeout(() => clearInterval(showerInterval), 10000);
}


// Evento inicial
document.getElementById('startBtn').addEventListener('click', () => {
    switchScreen('gameScreen');
    createBubbles();
});
