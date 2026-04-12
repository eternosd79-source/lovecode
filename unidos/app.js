const canvas = document.getElementById("soulsCanvas");
const ctx = canvas.getContext("2d");

// Interfaz DOM
const lblInstruction = document.getElementById("lblInstruction");
const lblSouls = document.getElementById("lblSouls");
const msgRomantic = document.getElementById("msgRomantic");

let width, height;
let particles = [];
let isJoined = false;

// Ajustar resolución del canvas
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', () => {
    resize();
    initParticles(); // Si giramos el celu, recalculamos todo
});
resize();

// =================================
// ESTRUCTURA DE LAS PARTÍCULAS
// =================================
class SoulParticle {
    constructor(xParam, yParam, isLeftTarget) {
        // La Posición Final Verdadera (cuando el corazon esta unido en el centro)
        // El xParam y yParam que entran asumen Centro en (0,0). Sumamos el offset del centro real.
        this.targetX = (width / 2) + xParam;
        this.targetY = (height * 0.4) + yParam; // Corazon un poco arriba del medio
        
        // Identificador de Grupo
        this.isLeft = isLeftTarget;
        
        // Distancia inicial de separación para crear las dos mitades alejadas (+-120px es el maximo seguro en movil)
        let separationOffset = Math.min(width * 0.2, 120); 
        this.originX = this.targetX + (this.isLeft ? -separationOffset : separationOffset);
        this.originY = this.targetY;
        
        // Posición actual
        this.x = this.originX;
        this.y = this.originY;
        
        // Tamaños aleatorios para simular volumen
        this.size = Math.random() * 2 + 1;
        
        // Velocidad errática/temblor
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        
        // Los colores iniciales (Rosa para TÚ, Cian para YO)
        // Parseados como HSL para que al chocar formen magenta/purpura si se funden.
        // HSL(330, 100%, 60%) = Rosa Neón  || HSL(180, 100%, 60%) = Cian
        this.baseHue = this.isLeft ? 330 : 180;
        
        // Retraso individual (Fricción de movimiento hacia el centro)
        this.friction = Math.random() * 0.02 + 0.01; // Velocidad de interpolacion (entre 0.01 y 0.03 por tick)
    }

    update() {
        if (!isJoined) {
            // FASE 1: Separados. Solo Vibran erraticamente en su "originX/Y"
            
            // Gravedad ligera hacia su centro "origin" respectivo
            let dx = this.originX - this.x;
            let dy = this.originY - this.y;
            this.vx += dx * 0.05;
            this.vy += dy * 0.05;
            
        } else {
            // FASE 2: Se unen. Se atraen hacia el "targetX/Y" verdadero de corazon unico
            
            let dx = this.targetX - this.x;
            let dy = this.targetY - this.y;
            
            // Interpolación Suave ("Lerp") en vez de fuerzas ruidosas
            this.x += dx * this.friction;
            this.y += dy * this.friction;
            
            // Añadir un diminuto temblor sobre la posicion target para mantener la "vida"
            this.x += (Math.random() - 0.5) * 0.5;
            this.y += (Math.random() - 0.5) * 0.5;
            
            // Fundir lentamente los colores hacia Purpura Oscuro Magenta (Hue ~300)
            if (this.baseHue < 300) this.baseHue += 1;
            if (this.baseHue > 300) this.baseHue -= 1;
        }
        
        // Actualizar posicion fase 1 (fase 2 usó Lerp agresivo, la fase 1 usa friccion simple)
        if (!isJoined) {
            this.x += this.vx;
            this.y += this.vy;
            // Amortiguación
            this.vx *= 0.8;
            this.vy *= 0.8;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // Brillo neón aditivo
        ctx.fillStyle = `hsl(${this.baseHue}, 100%, 60%)`;
        ctx.fill();
    }
}

// =================================
// FUNCIÓN MATEMÁTICA DEL CORAZÓN (Generador Puntos)
// =================================
function initParticles() {
    particles = [];
    
    // Total de partículas a probar (ej: 2000). Algunas caen fuera si filtramos para hacerlo solido o vacio, aquí lo haremos como el video (relleno y borde vibrante)
    const density = 600; 
    let scale = Math.min(width, height) / 35; // Escala adaptativa para que entre bien en movil
    
    // Llenaremos el corazón creando iteraciones en X, Y (Grilla), pero aceptando solo si caen dentro de la inecuación del corazón.
    // Inecuación del corazón: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
    // Adaptado al Canvas, el corazón rinde de x=[-1.5, 1.5] y y=[-1.5, 1.5] aprox
    
    let step = 0.08; // Resolución
    for (let x = -1.5; x <= 1.5; x += step) {
        for (let y = -1.2; y <= 1.5; y += step) {
            
            // Invertir Y matematico (HTML Canvas crece la Y hacia abajo, Matematicas hacia arriba)
            let mathY = -y;
            // Ecuacion simplificada del test de adentro_de_corazon
            let inside = Math.pow(x*x + mathY*mathY - 1, 3) - (x*x * Math.pow(mathY, 3));
            
            if (inside <= 0) {
                // Punto aceptado.
                // Expandir a las coordenadas de pantalla sumandole algo de aleatoriedad para hacerlo denso e imperfecto
                let screenX = x * scale * 10 
                            + (Math.random() - 0.5) * scale;
                let screenY = y * scale * 10
                            + (Math.random() - 0.5) * scale;
                            
                let isLeftHalf = x < 0; 
                
                particles.push(new SoulParticle(screenX, screenY, isLeftHalf));
            }
        }
    }

    // POSICIONAR LOS TEXTOS EN EL CENTRO EXACTO DE CADA MITAD
    let separationOffset = Math.min(width * 0.2, 120); 
    let lobeOffset = 7.5 * scale; // Ajuste matemático al vientre de la curva del corazón
    
    const domTu = document.querySelector('.lbl-tu');
    const domYo = document.querySelector('.lbl-yo');
    const domILoveYou = document.querySelector('.lbl-iloveyou');
    
    let baseTop = height * 0.4;

    if (!isJoined) {
        domTu.style.left = `${(width / 2) - separationOffset - lobeOffset}px`;
        domTu.style.top = `${baseTop}px`;

        domYo.style.left = `${(width / 2) + separationOffset + lobeOffset}px`;
        domYo.style.top = `${baseTop}px`;
        
        domILoveYou.style.top = `${baseTop - 20}px`; // Un poco más arriba por el tamaño del pergamino
    }
}


// =================================
// RENDER LOOP
// =================================
function animate() {
    requestAnimationFrame(animate);
    
    // Clear the canvas completly without trails to keep it clean and performant. (Use additive blending for particles)
    ctx.clearRect(0, 0, width, height);

    ctx.globalCompositeOperation = "lighter"; // Fusión matemática de colores (Luz dura)

    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    // Reset para evitar bugs visuales
    ctx.globalCompositeOperation = "source-over";
}

// Iniciar Motor
initParticles();
animate();


// =================================
// INTERACCIÓN
// =================================
canvas.addEventListener('click', () => {
    if (isJoined) return; // Evita multiples ejecuciones
    
    isJoined = true;
    
    // Ocultar la instrucción superior
    lblInstruction.classList.add("hidden");
    
    // Animar las palabras TU y YO para que se unan en el centro
    const domTu = document.querySelector('.lbl-tu');
    const domYo = document.querySelector('.lbl-yo');
    const domILoveYou = document.querySelector('.lbl-iloveyou');
    
    // 1. Unirse formando "Tú Yo" a corta distancia
    domTu.style.left = `${(width / 2) - 40}px`; 
    domYo.style.left = `${(width / 2) + 40}px`;
    
    // 2. Desvanecer las palabras sutilmente tras chocar y revelar I LOVE YOU
    setTimeout(() => {
        domTu.style.opacity = '0';
        domYo.style.opacity = '0';
        
        // Mostrar I LOVE YOU resplandeciente
        setTimeout(() => {
            domILoveYou.classList.add('show');
        }, 800);
    }, 2800); // Darles tiempo de leer tras el choque
    
    // 3. Retrasar la aparición del pergamino
    setTimeout(() => {
        msgRomantic.classList.add("show");
    }, 4500); // Despues de I love You
});

// =================================
// PANTALLA DE INTRODUCCIÓN
// =================================
const introScreen = document.getElementById('introScreen');
if(introScreen) {
    introScreen.addEventListener('click', function(e) {
        e.stopPropagation(); // Evitar que el clic active la unión de las almas inmediatamente
        introScreen.style.opacity = '0';
        setTimeout(() => {
            introScreen.style.display = 'none';
        }, 1500);
    });
}
