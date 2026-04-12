// ==========================================
// POEMA - APP.JS
// ==========================================

const stanzas = [
    "Eres la luz en mi silencio,<br>el color de mis días grises,<br>y la sonrisa que no sabía que necesitaba.",
    "Cada momento a tu lado<br>se siente como haber encontrado<br>la página más hermosa de mi libro favorito.",
    "No imagino un mañana<br>sin tu risa, sin tu abrazo,<br>sin la magia que me haces sentir.",
    "Así que te escribo esta promesa<br>con la esperanza de que nuestros destinos...<br>se unan para siempre."
];

let currentStanza = 0;

// ---- FIREFLIES BACKGROUND ----
function initFireflies() {
    const canvas = document.getElementById('firefliesCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];

    function createFirefly() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2,
            alpha: Math.random(),
            pulseSpeed: Math.random() * 0.05 + 0.01,
            pulseDir: Math.random() > 0.5 ? 1 : -1
        };
    }

    for(let i=0; i<80; i++) particles.push(createFirefly());

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0,0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            
            // Boundary check
            if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if(p.y < 0 || p.y > canvas.height) p.vy *= -1;

            // Pulse
            p.alpha += p.pulseSpeed * p.pulseDir;
            if(p.alpha >= 1) { p.alpha = 1; p.pulseDir = -1; }
            if(p.alpha <= 0.1) { p.alpha = 0.1; p.pulseDir = 1; }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            ctx.fillStyle = `rgba(235, 190, 140, ${p.alpha})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = "rgba(235, 190, 140, 0.8)";
            ctx.fill();
        });
    }
    animate();
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function loadStanza() {
    const pText = document.getElementById('poemText');
    const progressText = document.getElementById('progressText');
    const btn = document.getElementById('nextVerseBtn');

    // Fade out
    pText.classList.add('fade');
    pText.classList.remove('show');

    setTimeout(() => {
        pText.innerHTML = stanzas[currentStanza];
        progressText.textContent = `${currentStanza + 1} / ${stanzas.length}`;
        
        if (currentStanza === stanzas.length - 1) {
            btn.innerHTML = 'Descubrir la pregunta 💌';
        } else {
            btn.innerHTML = 'Siguiente verso 🕊️';
        }

        // Fade in
        pText.classList.remove('fade');
        pText.classList.add('show');
    }, 600);
}

function fallingRoses() {
    const container = document.getElementById('rosesContainer');
    const roses = ['🌹', '🥀', '💖', '✨'];
    
    setInterval(() => {
        const el = document.createElement('div');
        el.textContent = roses[Math.floor(Math.random() * roses.length)];
        const size = Math.random() * 1.5 + 1;
        el.style.cssText = `
            position: absolute; left: ${Math.random()*100}%; top: -50px;
            font-size: ${size}rem; opacity: ${0.7 + Math.random()*0.3};
            pointer-events: none;
            animation: fallRose ${4 + Math.random()*4}s linear forwards;
        `;
        container.appendChild(el);
        setTimeout(() => el.remove(), 8000);
    }, 400);

    const style = document.createElement('style');
    style.textContent = `
        @keyframes fallRose {
            0% { transform: translateY(0) rotate(0deg) translateX(0); }
            100% { transform: translateY(110vh) rotate(360deg) translateX(50px); }
        }
    `;
    document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', () => {
    initFireflies();

    document.getElementById('startBtn').addEventListener('click', () => {
        switchScreen('poemScreen');
        loadStanza();
    });

    document.getElementById('nextVerseBtn').addEventListener('click', () => {
        if (currentStanza < stanzas.length - 1) {
            currentStanza++;
            loadStanza();
        } else {
            switchScreen('questionScreen');
        }
    });

    document.getElementById('yesBtn').addEventListener('click', () => {
        switchScreen('celebScreen');
        fallingRoses();
    });

    document.getElementById('noBtn').addEventListener('click', () => {
        document.getElementById('noBtn').textContent = '¡Quiero decir que SÍ! 💓';
        document.getElementById('noBtn').style.background = 'linear-gradient(135deg, #e91e63, #ad0838)';
        document.getElementById('noBtn').style.color = '#fff';
        document.getElementById('noBtn').style.border = 'none';
        
        setTimeout(() => {
            switchScreen('celebScreen');
            fallingRoses();
        }, 800);
    });
});
