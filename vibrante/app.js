// Implementación Física Compleja basada en los métodos de "Particle Pools"
const canvas = document.getElementById("heartbeatCanvas");
const context = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    render(); // Redibujar rápido para evitar blinks oscuros
});

// Configuración de la "materia"
const settings = {
    particles: {
        length: 2000, 
        duration: 3, // Cuanto dura cada particula (segundos) hasta reiniciarse
        velocity: 40,  // Velocidad angular inicial
        effect: -1.3, // Elasticidad o "Zoom"
        size: 3 // Tamano de la "luz ruidosa"
    }
};

// Polimorfismo Matemático: Ecuación Paramétrica de Corazon
// (16 sin^3 t, 13 cos t - 5 cos 2t - 2 cos 3t - cos 4t)
function pointOnHeart(t) {
    // Calculo del vector (x,y) puro
    return {
        x: 16 * Math.pow(Math.sin(t), 3),
        y: 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)
    };
}

// Estructura de Partícula Individual 
var Particle = (function() {
    function Particle() {
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.age = 0;
    }
    
    // Inicia particula asignando vectores
    Particle.prototype.initialize = function(x, y, dx, dy) {
        this.position.x = x;
        this.position.y = y;
        this.velocity.x = dx;
        this.velocity.y = dy;
        // Fuerzas atractivas (Vuelve al propio centro)
        this.acceleration.x = dx * settings.particles.effect;
        this.acceleration.y = dy * settings.particles.effect;
        this.age = 0;
    };

    // Computar cinemática (DeltaTime for smooth motion across devices)
    Particle.prototype.update = function(deltaTime) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        // Añadir fuerza aceleradora (Retraccíon al core)
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        // Envejecer
        this.age += deltaTime;
    };

    // Pintar (Rojo "Blood/Neon" vibrante)
    Particle.prototype.draw = function(context, image) {
        function ease(t) { return (--t) * t * t + 1; }
        
        let size = image.width * ease(this.age / settings.particles.duration);
        // Alpha disminuye segun pasa el tiempo, borrandolas despacio
        context.globalAlpha = 1 - this.age / settings.particles.duration;

        context.drawImage(
            image,
            this.position.x - size / 2, 
            this.position.y - size / 2,
            size, size
        );
    };

    return Particle;
})();

// Buffer de Objetos para Performance Alta (Particle Pool Pattern)
// Evita el lag brutal de "new Particle()" en 60FPS
var ParticlePool = (function() {
    let particles, firstActive, firstFree, duration;
    
    function ParticlePool(length) {
        particles = new Array(length);
        for (let i = 0; i < particles.length; i++)
            particles[i] = new Particle();
        firstActive = 0;
        firstFree = 0;
        duration = settings.particles.duration;
    }
    
    // Pool Ring Buffer Logic...
    ParticlePool.prototype.add = function(x, y, dx, dy) {
        particles[firstFree].initialize(x, y, dx, dy);
        firstFree++;
        if (firstFree == particles.length) firstFree = 0;
        if (firstActive == firstFree) firstActive++;
        if (firstActive == particles.length) firstActive = 0;
    };
    
    ParticlePool.prototype.update = function(deltaTime) {
        var i;
        if (firstActive < firstFree) {
            for (i = firstActive; i < firstFree; i++) particles[i].update(deltaTime);
        } else if (firstFree < firstActive) {
            for (i = firstActive; i < particles.length; i++) particles[i].update(deltaTime);
            for (i = 0; i < firstFree; i++) particles[i].update(deltaTime);
        }
        
        // Recicla las particulas muertas
        while (particles[firstActive].age >= duration && firstActive != firstFree) {
            firstActive++;
            if (firstActive == particles.length) firstActive = 0;
        }
    };
    
    ParticlePool.prototype.draw = function(context, image) {
        var i;
        if (firstActive < firstFree) {
            for (i = firstActive; i < firstFree; i++) particles[i].draw(context, image);
        } else if (firstFree < firstActive) {
            for (i = firstActive; i < particles.length; i++) particles[i].draw(context, image);
            for (i = 0; i < firstFree; i++) particles[i].draw(context, image);
        }
    };
    return ParticlePool;
})();

// Pre-crear la Imagen (Una pequeña luz roja/rosa 0_0 hecha offscreen). Esto es MASSIVEMENTE rápido vs ctx.arc() a 60 fps
const particleImage = (function() {
    let _canvas = document.createElement('canvas'); // Offscreen pseudo
    let _context = _canvas.getContext('2d');
    _canvas.width = settings.particles.size;
    _canvas.height = settings.particles.size;

    // Centro exacto
    function toCenter(x, y) { return { x: x, y: y }; }
    _context.beginPath();
    let point = toCenter(settings.particles.size / 2, settings.particles.size / 2);
    _context.arc(point.x, point.y, settings.particles.size / 2, 0, Math.PI * 2, false);
    _context.fillStyle = '#ff1a1a'; // Rojo Neon
    _context.fill();

    return _canvas;
})();


// INSTANCIA MASTER
const pool = new ParticlePool(settings.particles.length);
let time;

// Generar una tanda nueva por frame
function spawnPerFrame() {
    let particleRate = settings.particles.length / settings.particles.duration;
    // Emite ~11 particulas por tick
    let dx, dy, t, p, dir;
    let particlesToSpawnNum = particleRate / 60; // suponiendo 60fps

    for (let i = 0; i < particlesToSpawnNum; i++) {
        // Obtenemos un punto matematico a lo largo de Todo el perimetro del corazon paramétrico
        t = Math.PI - 2 * Math.PI * Math.random();
        p = pointOnHeart(t);
        
        dir = { x: p.x, y: p.y }; // Vector Direccional puro
        // Normalización básica
        let len = Math.sqrt(dir.x*dir.x + dir.y*dir.y);
        dir.x /= len;  dir.y /= len;
        
        // Anclamos su posición en el centro (O multiplicada por la escala) de la pantalla.
        // Y añadimos velocidad inicial que la expulsa OUTWARD, antes de que su `acceleration` (-1.3 elasticity) la succione de regreso (efecto Latido Constante)
        
        let cx = width / 2;
        let cy = height / 2.5; // Arriba
        let scaleFixed = Math.min(width, height) / 45; // Relativo tamanio movil (Original usa 160 pero para 2k pixeles, bajamos a ~9 a 15)
        
        pool.add(
            cx + p.x * scaleFixed, 
            cy - p.y * scaleFixed, 
            dir.x * settings.particles.velocity, 
            -dir.y * settings.particles.velocity
        );
    }
}

// BUCLE FÍSICO (Render)
function render() {
    requestAnimationFrame(render);
    
    // DeltaTime Logic para no laguear si fps caen
    let newTime = new Date().getTime() / 1000;
    let deltaTime = newTime - (time || newTime);
    time = newTime;
    
    // Clear super translucido (MÁS ROJO) "Glow trailing effect"
    context.globalCompositeOperation = "source-over";
    context.fillStyle = 'rgba(0, 0, 0, 0.2)'; 
    context.fillRect(0, 0, width, height);

    // Sumar Glow Magia (Rojo Intenso que satura los bits del monitor simulado)
    context.globalCompositeOperation = "lighter"; // FUSION ADITIVA
    
    // Fisica
    spawnPerFrame();
    pool.update(deltaTime);
    pool.draw(context, particleImage);
    
    // Reseteo limpio de context global composite para que no cause glitcches si recarga live server
    context.globalCompositeOperation = "source-over";
}

// ARRANQUE
setTimeout(() => {
    time = new Date().getTime() / 1000;
    render();
}, 10);

// LOGICA INTERACTIVA - DAR LA VUELTA A LA CARTA
document.getElementById('heartContainer').addEventListener('click', function() {
    document.getElementById('flipper').classList.toggle('flipped');
});

// LOGICA INTERACTIVA - PANTALLA INTRO
const introScreen = document.getElementById('introScreen');
if(introScreen) {
    introScreen.addEventListener('click', function(e) {
        e.stopPropagation(); // Evita que se gire la carta al hacer el primer clic
        introScreen.style.opacity = '0';
        setTimeout(() => {
            introScreen.style.display = 'none';
        }, 1500);
    });
}
