const canvas = document.getElementById('spaceCanvas');
const ctx = canvas.getContext('2d');
const pantallaInicio = document.getElementById('pantalla-inicio');

let width, height, cx, cy;
let camX = 0, camY = 0;
let targetCamX = 0, targetCamY = 0;
const zMax = 2000; // Profundidad máxima del túnel 3D
const speedBase = 25; // Súper Velocidad (Hiperespacio)
let particles = [];

// COLORES PARA LAS ESTRELLAS
const starColors = ["#ffffff", "#ffffff", "#ffffff", "#00d4ff", "#ff0a54", "#b300ff", "#00ffcc"];

// FRASES ROMÁNTICAS
const frases = [
    "Te amo", "Te quiero", "Eres especial", "Eres única", "Eres maravillosa",
    "Eres increíble", "Eres mi todo", "Mi vida", "Mi amor", "Mi cielo",
    "Mi razón", "Mi alegría", "Mi felicidad", "Mi paz", "Mi princesa",
    "Mi reina", "Mi tesoro", "Mi inspiración", "Mi sueño", "Mi luz",
    "Mi corazón", "Eres hermosa", "Eres perfecta", "Me encantas", "Me importas",
    "Me haces feliz", "Me haces mejor", "Me haces sonreír", "Me completas", "Me inspiras",
    "Me enamoras", "Me fascinas", "Me iluminas", "Me motivas", "Me llenas de amor",
    "Me haces volar", "Me das paz", "Eres valiente", "Eres fuerte", "Eres dulce",
    "Eres tierna", "Eres gentil", "Eres amable", "Eres inteligente", "Eres brillante",
    "Eres encantadora", "Eres mágica", "Eres única en el mundo", "Eres lo mejor de mi vida", "Eres mi destino",
    "Eres mi ilusión", "Eres mi todo siempre", "Siempre contigo", "Siempre para ti", "Siempre te elegiría",
    "Siempre te amaré", "Nunca te dejaré", "Siempre estás en mi mente", "Siempre estás en mi corazón", "Contigo todo es mejor",
    "Contigo soy feliz", "Contigo sonrío", "Contigo sueño", "Contigo quiero todo", "Gracias por existir",
    "Gracias por estar", "Gracias por ser tú", "Eres mi regalo", "Eres mi bendición", "Eres mi suerte",
    "Eres mi razón de sonreír", "Eres mi paz favorita", "Eres mi lugar seguro", "Eres mi hogar", "Eres mi universo",
    "Eres mi persona favorita", "Eres mi debilidad", "Eres mi fortaleza", "Eres mi motivo", "Eres mi latido",
    "Eres mi pensamiento diario", "Eres mi alegría constante", "Eres mi sonrisa diaria", "Eres lo más bonito", "Eres lo más valioso",
    "Eres lo mejor que me pasó", "Te adoro", "Te extraño", "Te necesito", "Te pienso",
    "Te valoro", "Te aprecio", "Te cuido", "Te respeto", "Te elijo",
    "Te admiro", "Te llevo en mi corazón", "Te amo con todo mi ser", "Te quiero para siempre", "Eres amor"
];

// STICKERS (Nombres exactos que guardaste en la carpeta img/)
const stickersImg = [];
const imgNames = ['1.png', '2.png', '3.png', '5.png'];

for (let name of imgNames) {
    let img = new Image();
    img.src = `img/${name}`;
    stickersImg.push(img);
}

function initCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    cx = width / 2;
    cy = height / 2;
}
window.addEventListener('resize', initCanvas);
initCanvas();

// ==========================================
// INTERACCIÓN Y CÁMARA ESPACIAL (Nave espacial)
// ==========================================
let isDragging = false;
let startMouseX = 0, startMouseY = 0;

function onPointerDown(e) {
    isDragging = true;
    startMouseX = e.touches ? e.touches[0].clientX : e.clientX;
    startMouseY = e.touches ? e.touches[0].clientY : e.clientY;
}
function onPointerMove(e) {
    if (!isDragging) return;
    let currentX = e.touches ? e.touches[0].clientX : e.clientX;
    let currentY = e.touches ? e.touches[0].clientY : e.clientY;
    let dx = currentX - startMouseX;
    let dy = currentY - startMouseY;
    
    // Desplazar la nave en los ejes X,Y (mundo) en vez del punto de fuga
    targetCamX += dx * 2.5;
    targetCamY += dy * 2.5;
    
    // Limitar el movimiento de la nave para no salir del cúmulo de estrellas
    let limit = 2500;
    targetCamX = Math.max(-limit, Math.min(limit, targetCamX));
    targetCamY = Math.max(-limit, Math.min(limit, targetCamY));

    startMouseX = currentX;
    startMouseY = currentY;
}
function onPointerUp(e) {
    isDragging = false;
}

canvas.addEventListener('mousedown', onPointerDown);
window.addEventListener('mousemove', onPointerMove);
window.addEventListener('mouseup', onPointerUp);

canvas.addEventListener('touchstart', onPointerDown, {passive: true});
window.addEventListener('touchmove', onPointerMove, {passive: true});
window.addEventListener('touchend', onPointerUp);

// ==========================================
// CLASES DEL ENTORNO 3D
// ==========================================

// 1. ESTRELLAS DEL FONDO
class Star {
    constructor() {
        this.reset();
    }
    reset() {
        // Distribuir estrellas en un espacio 3D hiper-ancho (+/- ancho)
        this.x = (Math.random() - 0.5) * width * 3;
        this.y = (Math.random() - 0.5) * height * 3;
        this.z = Math.random() * zMax;
        this.pz = this.z; // Tracking de Z previo para dibujar el "Trail"
        // Estrellas más pequeñas
        this.size = Math.random() * 1.5 + 0.5;
        // Algunas estrellas dejan estela (trail) si están lejos del centro en X/Y
        let distCenter = Math.sqrt(this.x * this.x + this.y * this.y);
        this.isTrail = (Math.random() > 0.5 && distCenter > 200);
        // Color aleatorio
        this.colorStr = starColors[Math.floor(Math.random() * starColors.length)];
    }
    update() {
        this.pz = this.z;
        this.z -= speedBase;
        if (this.z <= 0) this.reset();
    }
    draw(ctx) {
        // Proyección de perspectiva frontal con desplazamiento global (Nave espacial)
        let x = ((this.x + camX) / this.z) * 500 + cx;
        let y = ((this.y + camY) / this.z) * 500 + cy;
        
        let px = ((this.x + camX) / this.pz) * 500 + cx;
        let py = ((this.y + camY) / this.pz) * 500 + cy;

        // Escala basada en la distancia Z
        let s = (1 - this.z / zMax) * this.size;
        
        // No dibujar centro muerto donde causaría fallo por división
        if (x < 0 || x > width || y < 0 || y > height) return;

        let curAlpha = Math.max(0, 1 - (this.z / zMax)); // desvanece al nacer en el horizonte remoto

        // Transformamos el string hexadecimal a rgba para manejar el canal Alpha visualmente
        ctx.fillStyle = this.colorStr; // Para arc fill si cambiamos a hex+alpha
        ctx.globalAlpha = curAlpha;
        
        ctx.strokeStyle = this.colorStr;
        ctx.lineWidth = s;

        if (this.isTrail) {
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(x, y);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(x, y, s, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0; // reset
    }
}

// 2. TEXTOS FLOTANTES
class FloatingText {
    constructor() {
        this.reset(true); // Spawn initial scattered
    }
    reset(initScattered = false) {
        this.x = (Math.random() - 0.5) * width * 1.2;
        this.y = (Math.random() - 0.5) * height * 1.2;
        this.z = initScattered ? Math.random() * zMax : zMax + Math.random() * 1000;
        let baseText = frases[Math.floor(Math.random() * frases.length)];
        let estrella = ['✨', '⭐', '🌟'][Math.floor(Math.random() * 3)];
        this.text = baseText + " " + estrella;
        this.rot = (Math.random() - 0.5) * 0.4; // Ligero cabeceo
    }
    update() {
        this.z -= speedBase * 0.7; // Un poco más lentos que las estrellas
        if (this.z <= 0) this.reset();
    }
    draw(ctx) {
        if (this.z > zMax) return; // Nace más lejos, esperar a que entre al túnel visible
        
        let x = ((this.x + camX) / this.z) * 500 + cx;
        let y = ((this.y + camY) / this.z) * 500 + cy;
        // Escalado REDUCIDO para que las palabras no ocupen pantalla completa
        // Antes era * 4, ahora limitamos a * 2.2 máximo
        let scale = Math.max(0.1, (zMax - this.z) / zMax) * 2.2;

        if (x < -300 || x > width + 300 || y < -300 || y > height + 300) return;

        // Lógica de desvanecimiento (aparece leios, se funde cuando atraviesa la pantalla frente)
        let alpha = 1;
        if (this.z > zMax - 300) alpha = (zMax - this.z) / 300; // fade in en el fondo
        else if (this.z < 150) alpha = this.z / 150; // fade out al atravesarnos

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.rot);
        ctx.scale(scale, scale);
        
        ctx.font = "bold 22px 'Montserrat'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Rendimiento: Desactivar sombra para evitar LAG brutal en móviles
        ctx.shadowBlur = 0; 
        ctx.fillStyle = `rgba(255, 150, 200, ${alpha})`;
        ctx.fillText(this.text, 0, 0);
        ctx.restore();
    }
}

// 3. STICKERS FLOTANTES
class FloatingSticker {
    constructor() {
        this.reset(true);
    }
    reset(initScattered = false) {
        this.x = (Math.random() - 0.5) * width * 1.5;
        this.y = (Math.random() - 0.5) * height * 1.5;
        this.z = initScattered ? Math.random() * zMax : zMax + Math.random() * 1500;
        this.imgIndex = Math.floor(Math.random() * stickersImg.length);
        this.rot = (Math.random() - 0.5) * 0.6; // Ligera rotación flotante
    }
    update() {
        this.z -= speedBase * 0.55; // Ligeramente más lento
        if (this.z <= 0) this.reset();
    }
    draw(ctx) {
        if (this.z > zMax) return;
        let img = stickersImg[this.imgIndex];
        
        // Verificar que la imagen exista y se haya cargado (evitar quiebres si falta alguna foto)
        if (!img.complete || img.naturalWidth === 0) return;
        
        let x = ((this.x + camX) / this.z) * 500 + cx;
        let y = ((this.y + camY) / this.z) * 500 + cy;
        // Limitar tamaño máximo estricto para que nunca se vean grotescamente gigantes
        // S_factor de 0 a 1 dependiendo de qué tan cerca esté
        let s_factor = (1 - this.z / zMax);
        let maxDisplayWidth = 230; // Tamaño fijo en el momento de estrellarse (muy cerca)
        
        let dWidth = maxDisplayWidth * s_factor;
        let dHeight = (img.naturalHeight / img.naturalWidth) * dWidth;

        // Culling temprano más ajustado al tamaño dinámico
        if (x < -dWidth || x > width + dWidth || y < -dHeight || y > height + dHeight) return;

        let alpha = 1;
        if (this.z > zMax - 400) alpha = (zMax - this.z) / 400; 
        else if (this.z < 250) alpha = this.z / 250;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.rot);
        
        ctx.globalAlpha = alpha;
        // Dibujamos especificando estrictamente su tamaño dinámico
        ctx.drawImage(img, -dWidth / 2, -dHeight / 2, dWidth, dHeight);
        
        ctx.restore();
    }
}

// POBLANDO EL UNIVERSO (Reducido para máximo rendimiento)
for (let i = 0; i < 350; i++) particles.push(new Star());
for (let i = 0; i < 15; i++)  particles.push(new FloatingText());
for (let i = 0; i < 6; i++)  particles.push(new FloatingSticker()); 

// MOTOR PRINCIPAL
function animate() {
    // Lerp Nave Espacial (suavizar la navegación del mundo X/Y)
    camX += (targetCamX - camX) * 0.1;
    camY += (targetCamY - camY) * 0.1;

    // Dibujar fondo dejando un ligero rastro para suavizar movimiento (motion blur)
    // Para hipertúnel, el motion blur debe ser más marcado, dejaremos 0.35 para estelas largas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; 
    ctx.fillRect(0, 0, width, height);

    // Ordenar elementos para que los de Z más lejana (mayor Z) se dibujen PRIMERO y queden detrás
    particles.sort((a, b) => b.z - a.z);

    for (let p of particles) {
        p.update();
        p.draw(ctx);
    }
    
    requestAnimationFrame(animate);
}

// Interacción inicial
pantallaInicio.addEventListener('click', () => {
    pantallaInicio.classList.add('oculta');
    canvas.classList.add('visible');
    animate();
});
