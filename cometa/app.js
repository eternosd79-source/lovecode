const canvas = document.getElementById("cometCanvas");
const ctx = canvas.getContext("2d");
const msgLove = document.getElementById("msgLove");

let width, height;
let particles = [];
// Variable temporal del trazo: t (avanza en radianes)
let t = 0; 
let isComplete = false; 

// Ejes del corazon (Centro Optico compensado superiormente)
let cx, cy; 
// Escala dinamica del tamaño del corazón segun la pantalla
let scaleBase = 15; 

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    
    cx = width / 2;
    cy = height * 0.4; // Ajuste para que quede centrado con la ventana de código abajo
    
    // Si la pantalla es ancha, podemos hacerlo un poco mas gordo. En móvil achicamos.
    scaleBase = Math.min(width, height) / 30; // Formula aproximada
}

window.addEventListener("resize", resize);
resize();


// ===============================
// SISTEMA DE PARTÍCULAS
// ===============================
class Particle {
    constructor(x, y, dx, dy, color, size, lifeDecay) {
        this.x = x;
        this.y = y;
        // Velocidad inicial residual para que la "cola" expulse energia a los costados
        this.dx = dx;
        this.dy = dy;
        this.color = color; // Color base
        this.size = size;
        this.life = 1.0;     // Vida útil 1 a 0
        this.decay = lifeDecay; // Que tan rapido muere (0.01 a 0.05)
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
        
        // Agregar "Drag" / Fricción espacial
        this.dx *= 0.95;
        this.dy *= 0.95;
        
        this.life -= this.decay;
        this.size = Math.max(0, this.size - 0.05); // Se encoge de a poquito
    }

    draw() {
        if (this.life <= 0 || this.size <= 0) return;
        
        // HSL o RGB con alpha según la vida
        ctx.save();
        ctx.globalAlpha = this.life;
        // Brillante puro
        ctx.fillStyle = this.color;
        // Aplicamos el famoso "Additive Blending"
        ctx.globalCompositeOperation = "lighter";
        
        ctx.beginPath();
        // Círculo
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}


// ===============================
// TRAZADO MATEMÁTICO (Ecuación Paramétrica del Corazón)
// ===============================
// X = 16 * sin^3(t)
// Y = 13*cos(t) - 5*cos(2t) - 2*cos(3t) - cos(4t)
function getHeartPosition(tValue) {
    let x = 16 * Math.pow(Math.sin(tValue), 3);
    let y = -(13 * Math.cos(tValue) - 5 * Math.cos(2 * tValue) - 2 * Math.cos(3 * tValue) - Math.cos(4 * tValue));
    
    return {
        x: cx + x * scaleBase,
        y: cy + y * scaleBase
    };
}


// BUCLE PRINCIPAL (RENDER TICK)
function loop() {
    requestAnimationFrame(loop);
    
    // Fading super suave del Canvas (Genera estelas naturales de fondo)
    // El "trailing effect". Mientras más grande opacidad, mas rápido borra.
    ctx.globalCompositeOperation = "source-over"; // Fundamental no usar "lighter" para borrar
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; // Alpha 0.1 borra gradualmente lo anterior
    ctx.fillRect(0, 0, width, height);

    // ==================
    // 1. GENERAR EL PUNTO GUÍA (Cometa Head)
    // ==================
    // Un ciclo entero es 2*PI (aprox 6.28)
    if (t < Math.PI * 2) {
        
        const pos = getHeartPosition(t);
        
        // Avanzamos el trazo
        t += 0.03; 

        // Generar partículas emitidas desde la Posición Actual
        // Multiplicador alto (15-20) para crear la bola densa de luz
        for(let i=0; i<15; i++) {
            // Dispersión minúscula para que nazcan juntas
            let randomX = pos.x + (Math.random() - 0.5) * 6;
            let randomY = pos.y + (Math.random() - 0.5) * 6;
            
            // Fuerza de expulsión residual atrás
            let pushX = (Math.random() - 0.5) * 3;
            let pushY = (Math.random() - 0.5) * 3;
            
            // Color de la cola: Mezcla vibrante entre Cyan oscuro, Violeta, Magenta y Rosa Neón. 
            // Esto replica el gradiente visto en Tiktok.
            // Utilizaremos sintaxis HSL para transicionar del tono 280(Violeta) al 330(Rosa/Rojo)
            let hue = 320 + Math.random() * 40 - 20; 
            if(Math.random() > 0.8) hue = 180 + Math.random() * 20; // A veces lanza Cyan
            
            let hslColor = `hsl(${hue}, 100%, 65%)`;
            
            // Tamaño inicial
            let s = Math.random() * 3 + 1.5;
            
            // Cuanto duran vivas y brillando en la historia (0.015 es lento, 0.04 es rapido)
            let decay = Math.random() * 0.02 + 0.01;

            particles.push(new Particle(randomX, randomY, pushX, pushY, hslColor, s, decay));
        }

        // Pintar "Cabeza del Cometa" Blanca y brillante para que guie
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#ff2b4f"; 
        ctx.fill();
        ctx.shadowBlur = 0; // reset
        
    } else {
        // Trazado Completado!
        if (!isComplete) {
            isComplete = true;
            msgLove.classList.add("visible");
            
            // Continúa re-emitiendo sobre todo el trazo para mantener el corazón vivo vibrando
            setInterval(() => {
                for(let k=0; k<60; k++) { // Pocas sobre todo el perímetro
                    let randomT = Math.random() * Math.PI * 2;
                    let p = getHeartPosition(randomT);
                    let h = 330 + Math.random() * 20;
                    particles.push(new Particle(
                        p.x + (Math.random()-0.5)*10, 
                        p.y + (Math.random()-0.5)*10, 
                        (Math.random()-0.5), (Math.random()-0.5), 
                        `hsl(${h}, 100%, 50%)`, Math.random()*2+1, 0.05
                    ));
                }
            }, 100);
        }
    }

    // ==================
    // 2. ACTUALIZAR Y DIBUJAR UNIVERSO DE PARTÍCULAS
    // ==================
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.update();
        p.draw();
        
        // Destruir muertas
        if (p.life <= 0 || p.size <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Iniciar Motor
loop();
