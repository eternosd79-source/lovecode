const btnNo = document.getElementById("btnNo");
const btnYes = document.getElementById("btnYes");
const successScreen = document.getElementById("successScreen");
const glassCard = document.getElementById("glassCard");

// ===============================================
// 0. SECUENCIA DE INICIO (NARRATIVA CINEMATOGRÁFICA)
// ===============================================
const introSequence = document.getElementById('introSequence');
const t1 = document.getElementById('introText1');
const t2 = document.getElementById('introText2');
const btnUnlock = document.getElementById('btnUnlock');

// Orquestación de textos: Leen la mente y luego desaparecen
setTimeout(() => {
    t1.classList.add('fade-out'); // Desvanece "He estado pensando..."
    setTimeout(() => {
        t1.style.display = 'none';
        t2.style.display = 'block'; // Muestra "...mi corazón ya no puede callar"
        
        setTimeout(() => {
            t2.classList.add('fade-out');
            setTimeout(() => {
                t2.style.display = 'none';
                btnUnlock.style.display = 'block'; // Aparece el botón de Autorización
            }, 2500); // Tarda extra en difuminarse la niebla del texto 2
        }, 4000); // 4 Segundos leyendo el texto 2
    }, 2500); // Tarda 2.5s en desvanecer el texto 1
}, 4000); // 4 Segundos leyendo el texto 1

// Romper el velo con el botón
btnUnlock.addEventListener('click', () => {
    introSequence.style.opacity = '0';
    setTimeout(() => {
        introSequence.style.display = 'none';
        // Hacemos aparecer la CARTA DE CRISTAL flotando lentamente desde el vacío
        glassCard.classList.remove('hidden');
    }, 2000); // Fade slow y dramático (2 segundos abriendo el telón negro)
});


// ===============================================
// 1. MOTOR DE EVASIÓN "HACKER" MAGNÉTICO
// ===============================================
let mouse = { x: -1000, y: -1000 };
let btnPos = { x: 0, y: 0, vx: 0, vy: 0 };
let isAbsolute = false;

window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('touchmove', e => { 
    mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; 
}, {passive: false});

function evadePhysics() {
    requestAnimationFrame(evadePhysics);
    
    // IMPORTANTE: Evitar evasión si la carta sigue oculta (Durante el intro)
    if(glassCard.classList.contains('hidden')) return;

    if (!isAbsolute) {
        const rect = btnNo.getBoundingClientRect();
        let dx = (rect.left + rect.width/2) - mouse.x;
        let dy = (rect.top + rect.height/2) - mouse.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 100) {
            isAbsolute = true;
            btnPos.x = rect.left;
            btnPos.y = rect.top;
            
            document.body.appendChild(btnNo);
            btnNo.style.position = "absolute";
            btnNo.style.left = btnPos.x + "px";
            btnNo.style.top = btnPos.y + "px";
            btnNo.style.margin = "0";
        } else {
            return;
        }
    }
    
    const rect = btnNo.getBoundingClientRect();
    const cx = btnPos.x + rect.width/2;
    const cy = btnPos.y + rect.height/2;
    
    let dx = cx - mouse.x;
    let dy = cy - mouse.y;
    let dist = Math.sqrt(dx*dx + dy*dy);
    
    if (dist < 200 && dist > 0) {
        const force = Math.pow((200 - dist) / 200, 2); 
        btnPos.vx += (dx / dist) * force * 15;
        btnPos.vy += (dy / dist) * force * 15;
    }
    
    btnPos.x += btnPos.vx;
    btnPos.y += btnPos.vy;
    
    btnPos.vx *= 0.88;
    btnPos.vy *= 0.88;
    
    const padding = 20;
    if (btnPos.x < padding) { btnPos.x = padding; btnPos.vx *= -0.7; }
    if (btnPos.x > window.innerWidth - rect.width - padding) { btnPos.x = window.innerWidth - rect.width - padding; btnPos.vx *= -0.7; }
    if (btnPos.y < padding) { btnPos.y = padding; btnPos.vy *= -0.7; }
    if (btnPos.y > window.innerHeight - rect.height - padding) { btnPos.y = window.innerHeight - rect.height - padding; btnPos.vy *= -0.7; }
    
    const cardRect = glassCard.getBoundingClientRect();
    if (cx > cardRect.left - 30 && cx < cardRect.right + 30 &&
        cy > cardRect.top - 30 && cy < cardRect.bottom + 30) {
        
        let cdx = cx - (cardRect.left + cardRect.width/2);
        let cdy = cy - (cardRect.top + cardRect.height/2);
        let cd = Math.sqrt(cdx*cdx + cdy*cdy);
        btnPos.vx += (cdx/cd) * 5;
        btnPos.vy += (cdy/cd) * 5;
    }

    btnNo.style.transform = `translate(${btnPos.x - rect.left}px, ${btnPos.y - rect.top}px)`;
}
evadePhysics();

btnNo.addEventListener("touchstart", (e) => {
    e.preventDefault(); 
    btnPos.vx += (Math.random() - 0.5) * 80;
    btnPos.vy -= 50;
}, {passive:false});

btnNo.addEventListener("click", (e) => { e.preventDefault(); });

// ===============================================
// 2. FONDO DE POLVO MÁGICO (ATMÓSFERA)
// ===============================================
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
let w1, h1;
let dustParams = [];

function initBg() {
    w1 = bgCanvas.width = window.innerWidth;
    h1 = bgCanvas.height = window.innerHeight;
    dustParams = Array.from({length: 120}, () => ({
        x: Math.random() * w1, y: Math.random() * h1,
        r: Math.random() * 2 + 0.3,
        vx: (Math.random()-0.5) * 0.3, vy: -Math.random() * 0.8,
        alpha: Math.random() * 0.4 + 0.1
    }));
}
function drawBg() {
    bgCtx.clearRect(0,0,w1,h1);
    dustParams.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if(d.y < -10) { d.y = h1 + 10; d.x = Math.random() * w1; }
        if(d.x < -10) d.x = w1 + 10;
        if(d.x > w1 + 10) d.x = -10;
        
        bgCtx.beginPath(); bgCtx.arc(d.x, d.y, d.r, 0, Math.PI*2);
        bgCtx.fillStyle = `rgba(255, 120, 160, ${d.alpha})`;
        bgCtx.fill();
    });
    requestAnimationFrame(drawBg);
}
window.addEventListener('resize', initBg);
initBg();
drawBg();


// ===============================================
// 3. VICTORIA ÉPICA (EXPLOSIÓN DE LUZ Y ORO)
// ===============================================
const vCanvas = document.getElementById('victoryCanvas');
const vCtx = vCanvas.getContext('2d');
let w2, h2;
let vParticles = [];
let vActive = false;

function initV() {
    w2 = vCanvas.width = window.innerWidth;
    h2 = vCanvas.height = window.innerHeight;
}
window.addEventListener('resize', initV);
initV();

function drawV() {
    if(!vActive) return;
    
    vCtx.globalCompositeOperation = 'source-over';
    vCtx.fillStyle = 'rgba(2, 0, 5, 0.15)';
    vCtx.fillRect(0,0,w2,h2);
    
    vCtx.globalCompositeOperation = 'lighter';
    
    if(Math.random() > 0.6) {
        vParticles.push({
            x: Math.random() * w2, y: h2 + 20,
            vx: (Math.random()-0.5)*5, vy: -(Math.random()*8 + 5),
            life: 1, s: Math.random()*3 + 1, c: `hsl(45, 100%, ${60+Math.random()*40}%)`
        });
    }

    for (let i = vParticles.length-1; i >= 0; i--) {
        let p = vParticles[i];
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.1;
        p.life -= 0.008;
        
        if(p.life <= 0) { vParticles.splice(i, 1); continue; }
        
        vCtx.beginPath();
        vCtx.arc(p.x, p.y, p.s * p.life * 2, 0, Math.PI*2);
        vCtx.fillStyle = p.c;
        vCtx.fill();
    }
    requestAnimationFrame(drawV);
}

btnYes.addEventListener('click', () => {
    glassCard.style.transform = 'translate(-50%, -50%) scale(0.6) translateY(50px)';
    glassCard.style.opacity = '0';
    if(isAbsolute) {
        btnNo.style.opacity = '0';
        btnNo.style.pointerEvents = 'none';
    }
    
    vActive = true;
    drawV();
    successScreen.classList.add('visible');
    
    const cx = window.innerWidth/2;
    const cy = window.innerHeight/2;
    for(let i=0; i<150; i++) {
        vParticles.push({
            x: cx, y: cy,
            vx: (Math.random()-0.5)*35, vy: (Math.random()-0.5)*35,
            life: 1 + Math.random(), s: Math.random()*5, c: `hsl(45, 100%, ${60+Math.random()*40}%)`
        });
    }
});
