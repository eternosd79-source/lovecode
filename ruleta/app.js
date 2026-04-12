// ==========================================
// CARTAS DEL DESTINO - APP.JS
// ==========================================

const cards = [
    { emoji: '💫', text: 'Porque tu sonrisa ilumina cualquier lugar donde estás' },
    { emoji: '🌹', text: 'Porque contigo el tiempo siempre pasa demasiado rápido' },
    { emoji: '✨', text: 'Porque eres increíblemente auténtica y única en el mundo' },
    { emoji: '🦋', text: 'Porque me haces querer ser una mejor persona cada día' },
    { emoji: '🌙', text: 'Porque incluso en los días difíciles tú eres mi calma' },
    { emoji: '💎', text: 'Porque eres el tipo de persona que aparece una vez en la vida' },
];

let flippedCount = 0;

function createParticle() {
    const p = document.createElement('div');
    p.style.cssText = `
        position:absolute; width:4px; height:4px; border-radius:50%;
        background:hsl(${Math.random()*60+280},80%,70%);
        left:${Math.random()*100}%; top:${Math.random()*100}%;
        animation: particleDrift ${5+Math.random()*8}s ease-in-out infinite;
        opacity:${0.2+Math.random()*0.5};
    `;
    return p;
}

function initParticles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes particleDrift {
            0%, 100% { transform: translateY(0) scale(1); opacity:0.3; }
            50% { transform: translateY(-30px) scale(1.5); opacity:0.8; }
        }
    `;
    document.head.appendChild(style);
    const container = document.getElementById('bgParticles');
    for (let i = 0; i < 60; i++) {
        container.appendChild(createParticle());
    }
}

function buildCards() {
    const grid = document.getElementById('cardsGrid');
    cards.forEach((c, i) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'card-wrapper';
        wrapper.innerHTML = `
            <div class="card" id="card-${i}">
                <div class="card-face card-back">
                    <div class="card-back-border"></div>
                    <div class="card-back-pattern">✦</div>
                </div>
                <div class="card-face card-front">
                    <div class="card-emoji">${c.emoji}</div>
                    <p class="card-text">${c.text}</p>
                </div>
            </div>`;
        wrapper.addEventListener('click', () => flipCard(i, wrapper));
        grid.appendChild(wrapper);
    });
}

function flipCard(index, wrapper) {
    const card = document.getElementById(`card-${index}`);
    if (card.classList.contains('flipped')) return;

    card.classList.add('flipped');
    flippedCount++;

    const rem = document.getElementById('remaining');
    rem.textContent = cards.length - flippedCount;

    // Tiny confetti burst on flip
    spawnBurst(wrapper);

    if (flippedCount === cards.length) {
        setTimeout(showFinal, 1000);
    }
}

function spawnBurst(wrapper) {
    const rect = wrapper.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const colors = ['#ff66cc', '#c97fff', '#ff9ee0', '#ffe0f5'];
    for (let i = 0; i < 12; i++) {
        const dot = document.createElement('div');
        const angle = (i / 12) * Math.PI * 2;
        const dist = 40 + Math.random() * 40;
        dot.style.cssText = `
            position:fixed; width:6px; height:6px; border-radius:50%;
            background:${colors[Math.floor(Math.random()*colors.length)]};
            left:${cx}px; top:${cy}px;
            pointer-events:none; z-index:999;
            transition: transform 0.6s ease-out, opacity 0.6s ease-out;
            transform:translate(-50%,-50%);
        `;
        document.body.appendChild(dot);
        requestAnimationFrame(() => {
            dot.style.transform = `translate(${Math.cos(angle)*dist - 3}px, ${Math.sin(angle)*dist - 3}px)`;
            dot.style.opacity = '0';
        });
        setTimeout(() => dot.remove(), 700);
    }
}

function showFinal() {
    switchScreen('finalScreen');
    launchHearts();
}

function launchHearts() {
    const container = document.getElementById('finalHearts');
    const hearts = ['💖', '💗', '💝', '💘', '💕'];
    setInterval(() => {
        const h = document.createElement('div');
        h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        h.style.cssText = `
            position:absolute; font-size:${1+Math.random()*1.5}rem;
            left:${Math.random()*100}%; bottom:-20px;
            animation: floatHeart ${3+Math.random()*3}s ease-in forwards;
            pointer-events:none;
        `;
        container.appendChild(h);
        setTimeout(() => h.remove(), 6000);
    }, 300);
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function celebrate() {
    switchScreen('celebScreen');
    launchFireworks();
}

function launchFireworks() {
    const fw = document.getElementById('fireworks');
    const emojis = ['💖', '✨', '🎉', '💗', '⭐', '💝'];
    setInterval(() => {
        const el = document.createElement('div');
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.cssText = `
            position:absolute; font-size:${1.5+Math.random()*2}rem;
            left:${Math.random()*100}%; top:${Math.random()*100}%;
            animation:fwPop 1.5s ease-out forwards;
            pointer-events:none; z-index:20;
        `;
        fw.appendChild(el);
        setTimeout(() => el.remove(), 1500);
    }, 100);
}

// Estilos extra inyectados
const extraStyle = document.createElement('style');
extraStyle.textContent = `
    @keyframes floatHeart {
        0%   { transform:translateY(0) scale(0.8); opacity:0; }
        10%  { opacity:1; }
        100% { transform:translateY(-100vh) scale(1.3); opacity:0; }
    }
    @keyframes fwPop {
        0%   { transform:scale(0) rotate(0deg); opacity:1; }
        70%  { transform:scale(1.4) rotate(180deg); opacity:1; }
        100% { transform:scale(0.8) rotate(360deg); opacity:0; }
    }
    #finalHearts { position:fixed; inset:0; pointer-events:none; overflow:hidden; }
`;
document.head.appendChild(extraStyle);

// INIT
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    buildCards();

    document.getElementById('startBtn').addEventListener('click', () => {
        switchScreen('gameScreen');
    });

    document.getElementById('yesBtn').addEventListener('click', celebrate);
    document.getElementById('noBtn').addEventListener('click', () => {
        document.getElementById('noBtn').textContent = '¡Exacto, sí! 💖';
        document.getElementById('noBtn').style.background = 'linear-gradient(135deg, #e91e8c, #ff6b6b)';
        document.getElementById('noBtn').style.color = '#fff';
        setTimeout(celebrate, 800);
    });
});
