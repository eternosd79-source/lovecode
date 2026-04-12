// ==========================================
// JARDÍN MÁGICO PROCEDURAL (12 Flores + Pantalla de Carga Interactiva)
// OPTIMIZADO PARA CERO LAG A 60 FPS
// ==========================================

const canvas = document.getElementById('gardenCanvas');
const ctx = canvas.getContext('2d');
let w, h;
let fireflies = [];
let grasses = [];
let flowers = [];
let mouse = { x: -1000, y: -1000 };

// ── SISTEMA DE INICIO (ESTADO) ──
let isStarted = false;
let startTimeOffset = 0;

document.getElementById('btnStart').addEventListener('click', () => {
    isStarted = true;
    startTimeOffset = performance.now();
    
    // El velo se desvanece
    const intro = document.getElementById('introOverlay');
    intro.style.opacity = '0';
    setTimeout(() => { intro.style.display = 'none'; }, 1500);
    
    // Aparece el título flotante
    const ui = document.getElementById('uiLayer');
    ui.style.opacity = '1';
    ui.classList.add('revealed');
});

window.addEventListener('resize', resize);
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('touchmove', e => { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; });
window.addEventListener('touchend', () => { mouse.x = -1000; mouse.y = -1000; });

function resize() {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    createFlora(); 
}

class Grass {
    constructor() {
        this.x = Math.random() * w;
        this.y = h;
        this.height = Math.random() * (h * 0.25) + h * 0.05; 
        this.sway = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.001 + 0.0005;
        this.color = `hsla(${120 + Math.random()*30}, 80%, ${15 + Math.random()*20}%, ${Math.random()*0.5 + 0.2})`;
    }
    draw(time) {
        const lean = Math.sin(time * this.speed + this.sway) * (this.height * 0.3);
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.quadraticCurveTo(this.x, this.y - this.height * 0.5, this.x + lean, this.y - this.height);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 0; // Optimizado
        ctx.stroke();
    }
}

class Flower {
    constructor(rx, rh, hue, scale) {
        this.rx = rx;    
        this.rh = rh;    
        this.x = rx * w;
        this.y = h;
        this.targetHeight = rh * h;
        this.hue = hue;
        this.scale = scale;
        this.growProgress = 0;
        this.delay = Math.random() * 300; // Reducido drásticamente (antes 1200) para crecer más rápido
    }

    draw(time) {
        if (isStarted) {
            const activeTime = time - startTimeOffset;
            if (activeTime > this.delay && this.growProgress < 1) {
                this.growProgress += 0.01; // El doble de velocidad (antes 0.0045)
            }
        }
        
        const easeGrow = Math.sin((this.growProgress * Math.PI) / 2); 
        const currentHeight = this.targetHeight * easeGrow;
        const currentY = this.y - currentHeight;
        const sway = Math.sin(time * 0.001 + this.rx * 10) * (currentHeight * 0.1);
        
        // Touch Interaction
        let dx = (this.x + sway) - mouse.x;
        let dy = currentY - mouse.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        let reactSway = 0;
        if (dist < 200) {
            reactSway = (dx / dist) * (200 - dist) * 0.5;
        }
        
        const topX = this.x + sway + reactSway; 

        // TALLO
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.quadraticCurveTo(this.x, this.y - currentHeight*0.5, topX, currentY);
        
        const stemGlow = easeGrow * 0.8;
        ctx.strokeStyle = `hsla(150, 70%, 40%, ${stemGlow})`;
        ctx.lineWidth = 4 * this.scale;
        ctx.shadowBlur = 0; // OPTIMIZACIÓN DE GPU: Removido shadowBlur de tallo
        ctx.stroke();
        
        // PÉTALOS
        if (easeGrow > 0.6) {
            const bloom = Math.min(1, (easeGrow - 0.6) * 2.5); 
            ctx.save();
            ctx.translate(topX, currentY);
            ctx.rotate((sway + reactSway) * 0.002);
            
            // OPTIMIZACIÓN DE GPU: 2 capas en lugar de 3 (Reduce polígonos)
            const layers = 2; 
            for (let l = 0; l < layers; l++) {
                const petalsNum = 6 + l * 2;
                const layerScale = 1 - (l * 0.3);
                
                for(let i = 0; i < petalsNum; i++) {
                    const flowAngle = time * 0.00015 * (l%2==0?1:-1);
                    const angle = (Math.PI*2 / petalsNum) * i + (l * 0.5) + flowAngle;
                    
                    ctx.save();
                    ctx.rotate(angle);
                    
                    const pLen = 65 * this.scale * layerScale * bloom;
                    const pWid = 25 * this.scale * layerScale * bloom;
                    const bend = (1 - bloom) * pLen * 0.7; 
                    
                    ctx.beginPath();
                    ctx.moveTo(0,0);
                    ctx.bezierCurveTo(pWid, -pLen*0.3, pWid*0.5, -pLen + bend, 0, -pLen*1.1);
                    ctx.bezierCurveTo(-pWid*0.5, -pLen + bend, -pWid, -pLen*0.3, 0, 0);
                    
                    const grd = ctx.createLinearGradient(0, 0, 0, -pLen);
                    // Colores más intensos para compensar la falta de shadowBlur
                    grd.addColorStop(0, `hsla(${this.hue}, 100%, 98%, ${0.9 * bloom})`);
                    grd.addColorStop(1, `hsla(${this.hue}, 100%, 65%, ${0.4 * bloom})`);
                    
                    ctx.fillStyle = grd;
                    ctx.globalCompositeOperation = 'source-over';
                    
                    // OPTIMIZACIÓN MASIVA: Eliminar el brutal Shadow Blur por péptalo
                    ctx.shadowBlur = 0; 
                    ctx.fill();
                    ctx.restore();
                }
            }
            
            // NÚCLEO LUMINOSO (El único con glow real pesado)
            ctx.globalCompositeOperation = 'lighter';
            ctx.beginPath();
            ctx.arc(0,0, 10 * this.scale * bloom, 0, Math.PI*2);
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 20; 
            ctx.shadowColor = `hsla(${this.hue}, 100%, 75%, 1)`;
            ctx.fill();
            
            for(let j=0; j<5; j++) {
                const px = Math.cos(time*0.004 + j)*15*this.scale*bloom;
                const py = Math.sin(time*0.004 + j)*15*this.scale*bloom;
                ctx.beginPath();
                ctx.arc(px, py, 2*this.scale, 0, Math.PI*2);
                ctx.fillStyle = '#fff';
                ctx.shadowBlur = 0;
                ctx.fill();
            }

            ctx.globalCompositeOperation = 'source-over';
            ctx.restore();
        }
    }
}

class Firefly {
    constructor() { this.reset(true); }
    reset(randomY = false) {
        this.x = Math.random() * w;
        this.y = randomY ? Math.random() * h : h + 20;
        this.s = Math.random() * 2 + 0.5;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = -(Math.random() * 1.5 + 0.5);
        this.hue = Math.random() > 0.5 ? 60 : 180;
        this.angle = Math.random() * Math.PI * 2;
    }
    
    draw(time) {
        this.x += this.vx + Math.sin(this.angle + time*0.002) * 1.5;
        this.y += this.vy;
        
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 150) {
            this.x += (dx/dist) * 4;
            this.y += (dy/dist) * 4;
        }

        if (this.y < -50 || this.x < -50 || this.x > w + 50) this.reset();
        
        const opacity = (Math.sin(time*0.004 + this.angle) + 1) * 0.5;
        
        // OPTIMIZACIÓN MASIVA: Degradado Radial es 10x más rápido que shadowBlur
        const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.s * 4);
        grd.addColorStop(0, `hsla(${this.hue}, 100%, 80%, ${opacity})`);
        grd.addColorStop(1, `hsla(${this.hue}, 100%, 50%, 0)`);
        
        ctx.fillStyle = grd;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.s * 4, 0, Math.PI*2);
        ctx.fill();
    }
}

function createFlora() {
    // 25 FLORES (Un prado bioluminiscente majestuoso y espeso)
    flowers = [
        // PRIMER PLANO (Las reinas gigantes - Escala > 1.2)
        new Flower(0.50, 0.45, 340, 1.5), // Reina central
        new Flower(0.35, 0.40, 190, 1.3), 
        new Flower(0.65, 0.40,  45, 1.3), 
        new Flower(0.20, 0.38, 300, 1.2), 
        new Flower(0.80, 0.38,  10, 1.2), 

        // SEGUNDO PLANO (Medianas rellenando huecos - Escala ~ 0.9 a 1.1)
        new Flower(0.42, 0.35, 150, 1.1),
        new Flower(0.58, 0.35, 320, 1.1),
        new Flower(0.28, 0.34, 200, 1.0),
        new Flower(0.72, 0.34, 280, 1.0),
        new Flower(0.12, 0.32,  60, 0.9),
        new Flower(0.88, 0.32, 180, 0.9),
        new Flower(0.48, 0.30,  30, 0.9),
        
        // TERCER PLANO (Fondo base - Escala ~ 0.7 a 0.8)
        new Flower(0.38, 0.28, 340, 0.8),
        new Flower(0.62, 0.28, 190, 0.8),
        new Flower(0.18, 0.27, 260, 0.75),
        new Flower(0.82, 0.27,  15, 0.75),
        new Flower(0.05, 0.25, 300, 0.7),
        new Flower(0.95, 0.25, 170, 0.7),
        new Flower(0.53, 0.26,  45, 0.8),

        // CUARTO PLANO (El horizonte infinito - Escala ~ 0.4 a 0.6)
        new Flower(0.45, 0.22, 150, 0.65),
        new Flower(0.55, 0.22, 320, 0.65),
        new Flower(0.32, 0.20, 200, 0.55),
        new Flower(0.68, 0.20, 280, 0.55),
        new Flower(0.25, 0.18,  60, 0.5),
        new Flower(0.75, 0.18, 180, 0.5)
    ];
    
    grasses = [];
    for(let i=0; i<180; i++){ grasses.push(new Grass()); }
    
    fireflies = [];
    for(let i=0; i<120; i++){ fireflies.push(new Firefly()); }
}

function animate(time) {
    requestAnimationFrame(animate);
    
    ctx.globalCompositeOperation = 'source-over';
    const bgGrd = ctx.createRadialGradient(w/2, h, 0, w/2, h, h);
    bgGrd.addColorStop(0, '#0a162b'); 
    bgGrd.addColorStop(1, '#020408');
    ctx.fillStyle = bgGrd;
    ctx.fillRect(0, 0, w, h);
    
    grasses.forEach(g => g.draw(time));
    fireflies.forEach(f => f.draw(time));
    
    const sortedFlowers = [...flowers].sort((a,b) => a.scale - b.scale);
    sortedFlowers.forEach(f => f.draw(time));
}

resize();
requestAnimationFrame(animate);
