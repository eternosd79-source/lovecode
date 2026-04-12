// ==========================================
// LATIDO: MOTOR FÍSICO DE POLVO ESTELAR
// ==========================================

const canvas = document.getElementById('main');
const ctx = canvas.getContext('2d');
let w, h;
let particles = [];
let mouse = { x: -1000, y: -1000 }; // Fuera de pantalla al inicio

window.addEventListener('resize', resize);
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
// Soporte táctil
window.addEventListener('touchmove', e => { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; });
window.addEventListener('touchend', () => { mouse.x = -1000; mouse.y = -1000; });

function resize() {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
}
resize();

// Ecuación matemática perfecta del corazón
function getH(t, sc) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
    return { x: x * sc, y: y * sc };
}

// ── CREACIÓN DE LA GALAXIA ──
// Paleta romántica: Blanco diamante, oro champaña, rosa amanecer y rubí.
const colors = ['#ffffff', '#ffebba', '#ff7aa2', '#db0945'];

for (let i = 0; i < 2500; i++) {
    const a = Math.random() * Math.PI * 2;
    // El 80% forma el núcleo fuerte del corazón, el 20% es el aura flotante
    const spread = Math.random() > 0.8 ? (Math.random() * Math.random() * 50) : (Math.random() * 3);
    
    particles.push({
        t: Math.random() * Math.PI * 2,    // Su posición en la curva del corazón
        ox: Math.cos(a) * spread,          // Offset visual
        oy: Math.sin(a) * spread,
        x: w/2, y: h/2,                    // Inician en el centro
        vx: 0, vy: 0,                      // Velocidad
        // Tamaños: muchísimas minúsculas (0.2 a 1) y unas pocas grandes destacadas (1 a 3.5)
        s: Math.random() > 0.95 ? Math.random() * 2.5 + 1 : Math.random() * 0.8 + 0.2, 
        c: colors[Math.floor(Math.random() * colors.length)],
        mass: Math.random() * 0.5 + 0.5    // Su peso (cómo reacciona al latido)
    });
}

// ── LOOP PRINCIPAL DE ANIMACIÓN ──
function loop(time) {
    const t = time / 1000;
    
    // Matenáticas del latido (Sístole y diástole a ~60bpm)
    const cycle = (t % 1); 
    const p1 = Math.pow(Math.max(0, 1 - Math.abs(cycle*6 - 0.8)), 2.5);
    const p2 = Math.pow(Math.max(0, 1 - Math.abs(cycle*6 - 2.5)), 2.5);
    const pulse = p1 + p2 * 0.7; // Variable entre 0 y ~1.7
    
    // 1. Efecto Motion Blur (dejamos un rastro fantasmal)
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(5, 0, 2, 0.25)'; // Casi negro con toque carmesí
    ctx.fillRect(0, 0, w, h);
    
    // 2. Mezcla ADITIVA: Cuando las partículas se cruzan, suman su luz (Efecto Plasma/Fuego)
    ctx.globalCompositeOperation = 'lighter';
    
    const sc = Math.min(w, h) / 45 * (1 + pulse * 0.04);
    const cx = w/2, cy = h/2 - sc*1.5;
    
    // Calculamos cada partícula
    particles.forEach((p, i) => {
        const pt = getH(p.t, sc); // Dónde "debería" estar
        
        let targetX = cx + pt.x + p.ox;
        let targetY = cy + pt.y + p.oy;
        
        // Oscilación orgánica (están vivas, vibran)
        targetX += Math.sin(t + i*0.01) * 6;
        targetY += Math.cos(t + i*0.02) * 6;
        
        // Expansión del Latido (Salen disparadas y regresan por gravedad)
        if (pulse > 0.1) {
            const expForce = pulse * 0.12 * p.mass;
            targetX += (targetX - cx) * expForce;
            targetY += (targetY - cy) * expForce;
        }

        // Interacción Magnética con el Mouse/Dedo
        const dxM = p.x - mouse.x;
        const dyM = p.y - mouse.y;
        const distM = Math.sqrt(dxM*dxM + dyM*dyM);
        if (distM < 120) {
            const push = Math.pow((120 - distM)/120, 2); // curva suave de empuje
            targetX += (dxM / distM) * push * 60;
            targetY += (dyM / distM) * push * 60;
        }
        
        // Cinemática elástica hacia el target
        const dx = targetX - p.x;
        const dy = targetY - p.y;
        p.vx += dx * 0.015 * p.mass; 
        p.vy += dy * 0.015 * p.mass;
        p.vx *= 0.89; // Fricción
        p.vy *= 0.89;
        
        p.x += p.vx;
        p.y += p.vy;
        
        // Dibujado de la luz
        // Las estrellas grandes tienen un aura, las pequeñas son puntales agudos
        if (p.s > 1.5) {
            ctx.shadowBlur = 12;
            ctx.shadowColor = p.c;
        } else {
             ctx.shadowBlur = 0;
        }
        
        ctx.fillStyle = p.c;
        ctx.beginPath(); 
        // En el latido, las estrellas también brillan/crecen un poco
        ctx.arc(p.x, p.y, p.s * (1 + pulse*0.25), 0, Math.PI*2); 
        ctx.fill();
    });
    
    // Latido 2D sincronizado al texto central
    document.getElementById('loveText').style.transform = `translate(-50%, -50%) scale(${1 + pulse * 0.09})`;
    
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ── UI: POESÍA SECUENCIAL ──
const pairs = [
    { top: "Un universo entero...",           bot: "...condensado en este latido." },
    { top: "De polvo de estrellas venimos",    bot: "y a ti he vuelto para brillar." },
    { top: "Como constelaciones celestes,",   bot: "nuestras almas se encontraron." },
    { top: "Cada punto de luz",               bot: "es una razón para amarte." }
];
let pi = 0;
const ptEl = document.getElementById('phraseTop');
const pbEl = document.getElementById('phraseBot');

async function rotatePhrases() {
    while(true) {
        ptEl.classList.remove('show'); pbEl.classList.remove('show');
        
        // Esperamos que se apaguen
        await new Promise(r => setTimeout(r, 1500));
        
        ptEl.textContent = pairs[pi % pairs.length].top;
        pbEl.textContent = pairs[pi % pairs.length].bot;
        
        // Encendemos progresivamente
        ptEl.classList.add('show');
        await new Promise(r => setTimeout(r, 500));
        pbEl.classList.add('show');
        
        // Mantenemos visibles
        await new Promise(r => setTimeout(r, 5500));
        pi++;
    }
}
rotatePhrases();
