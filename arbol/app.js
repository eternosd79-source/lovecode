const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let treeX, treeY, heartCenterY;
let chronoTargetX, chronoTargetY;

/* ================================
   PATH MAESTRO DEL CORAZÓN (Se define arriba para Prerender)
=================================== */
const heartPath = new Path2D();
heartPath.moveTo(0, 0.3);
heartPath.bezierCurveTo(-0.1, 0.1, -0.6, -0.1, -0.5, -0.4);
heartPath.bezierCurveTo(-0.4, -0.7, -0.1, -0.7, 0, -0.4);
heartPath.bezierCurveTo(0.1, -0.7, 0.4, -0.7, 0.5, -0.4);
heartPath.bezierCurveTo(0.6, -0.1, 0.1, 0.1, 0, 0.3);
heartPath.closePath();

/* ================================
   PRERENDERIZACIÓN MASIVA DE CORAZONES (Elimina Lag)
=================================== */
var heartColors = ['#FFE484', '#FFD700', '#FFCC4D', '#FFB347', '#E5A93D', '#FFD56B', '#F9E596', '#FFF0B3', '#DDB870', '#FFFFFF'];
var preRenderedHearts = {};
var petalosActivos = 0; // Para no buscar .length a cada rato

function initPrerender() {
    heartColors.forEach(function(color) {
        var c = document.createElement('canvas');
        c.width = 40; 
        c.height = 40;
        var cctx = c.getContext('2d');
        cctx.translate(20, 20);
        cctx.scale(10, 10);
        cctx.fillStyle = color;
        cctx.fill(heartPath);
        preRenderedHearts[color] = c;
    });
}
initPrerender();

let animState = 0;
let trunkProgress = 0;
var flowers = [];
var fallingPetals = [];
let treeCanvasCached = null; // Caché del árbol completo congelado
var startTime = performance.now();

function resize() {
    let rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    width = canvas.width;
    height = canvas.height;
    
    treeX = width * 0.70;
    if (width < 350) treeX = width * 0.65;
    heartCenterY = height * 0.42;

    chronoTargetX = width * 0.15;
    chronoTargetY = height - 30;

    // Reset de la animación al redimensionar la pantalla
    trunkProgress = 0;
    animState = 0;
    treeCanvasCached = null;
    fallingPetals = [];
    generateBranches();
    initFlowers();
    startTime = performance.now();
}

window.addEventListener('resize', resize);

/* ================================
   CRONÓMETRO DE AMOR
=================================== */
let fechaInicio = new Date(2023, 2, 23, 14, 30, 0);

// Función para parsear fechas en español (Ej: "14 de Febrero 2021" o "3 de diciembre del 2019")
function parseSpanishDate(dateStr) {
    if (!dateStr) return null;
    
    // Si ya es un formato ISO o similar que Date entiende
    let d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;

    const months = {
        'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
        'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
    };

    // Limpieza agresiva: quitar "del", "de", comas, y espacios extra
    let s = dateStr.toLowerCase()
        .replace(/ del /g, ' ')
        .replace(/ de /g, ' ')
        .replace(/,/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    
    let parts = s.split(' ');
    
    // Caso 1: "14 enero 2025"
    if (parts.length >= 3) {
        let day = parseInt(parts[0]);
        let monthName = parts[1];
        let year = parseInt(parts[parts.length - 1]);
        
        // Si el mes no está en la posición 1, buscarlo
        let month = months[monthName];
        if (month === undefined) {
            for(let m in months) {
                if (s.includes(m)) {
                    month = months[m];
                    break;
                }
            }
        }

        if (!isNaN(day) && month !== undefined && !isNaN(year)) {
            // Asegurar año de 4 dígitos
            if (year < 100) year += 2000;
            return new Date(year, month, day);
        }
    }
    return null;
}

// Función global para que personalizar.js pueda actualizar la fecha
window.updateChronometerDate = function(newDateStr) {
    console.log("Intentando actualizar fecha con:", newDateStr);
    let parsed = parseSpanishDate(newDateStr);
    if (parsed) {
        console.log("Fecha parseada con éxito:", parsed);
        fechaInicio = parsed;
        // Forzar actualización inmediata de la UI
        if (typeof actualizarCronometro === 'function') {
            actualizarCronometro();
        }
    } else {
        console.error("No se pudo parsear la fecha:", newDateStr);
    }
};

// Revisar si ya existe una fecha en window.loveCodeData (inyectada por personalizar.js)
if (window.loveCodeData && window.loveCodeData.fecha) {
    window.updateChronometerDate(window.loveCodeData.fecha);
}

// --- Integración con CC_Core ---
document.addEventListener('cc:started', (e) => {
    console.log("Experiencia iniciada con datos:", e.detail);
    // Podríamos disparar alguna animación extra aquí
});

function actualizarCronometro() {
    const ahora = new Date();
    let diferencia = ahora - fechaInicio;
    if (diferencia < 0) diferencia = 0;

    const segundosTotales = Math.floor(diferencia / 1000);
    const dias = Math.floor(segundosTotales / (3600 * 24));
    const restoHoras = segundosTotales % (3600 * 24);
    const horas = Math.floor(restoHoras / 3600);
    const restoMinutos = restoHoras % 3600;
    const minutos = Math.floor(restoMinutos / 60);
    const segundos = restoMinutos % 60;

    document.getElementById('days').innerText = dias;
    document.getElementById('hours').innerText = horas.toString().padStart(2, '0');
    document.getElementById('minutes').innerText = minutos.toString().padStart(2, '0');
    document.getElementById('seconds').innerText = segundos.toString().padStart(2, '0');
}
setInterval(actualizarCronometro, 1000);
actualizarCronometro();


/* ==========================================
   UTILIDAD DE SILUETA DE CORAZÓN
========================================== */
function isInsideHeart(px, py, cx, cy, scale, margin) {
    var nx = (px - cx) / scale;
    var ny = (py - cy) / scale;
    var angle = Math.atan2(-ny, nx); 
    var t = angle;
    var hx = 16 * Math.pow(Math.sin(t), 3);
    var hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
    var heartR = Math.sqrt(hx*hx + hy*hy);
    var pointR = Math.sqrt(nx*nx + ny*ny);
    return pointR <= heartR * margin;
}

function initFlowers() {
    flowers = [];
    // Optimización móvil: Reducir cantidad de flores en pantallas pequeñas
    var isMobile = window.innerWidth < 768;
    var bigHeartCount = isMobile ? 15000 : 35000;
    var scale = Math.min(width, height) / 36;
    
    for (var i = 0; i < bigHeartCount; i++) {
        var t = Math.random() * Math.PI * 2;
        var r_factor = Math.sqrt(Math.random());

        var hx = 16 * Math.pow(Math.sin(t), 3);
        var hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));

        var finalX = treeX + (hx * scale * r_factor) + (Math.random() - 0.5) * 1.5;
        var finalY = heartCenterY + (hy * scale * r_factor) + (Math.random() - 0.5) * 1.5;

        flowers.push({
            x: finalX,
            y: finalY,
            maxSize: Math.random() * 4 + 2.5,
            size: 0,
            delay: Math.random() * 2200,
            blooming: false,
            color: heartColors[Math.floor(Math.random() * heartColors.length)],
            rotation: Math.random() * 0.5 - 0.25
        });
    }
}

var branchSegments = [];
function generateBranches() {
    branchSegments = [];
    var trunkTop = heartCenterY;
    var heartScale = Math.min(width, height) / 36;
    
    function branch(x1, y1, angle, length, thickness, depth) {
        if (depth <= 0 || thickness < 0.3) return;
        
        var effectiveLength = length;
        if (depth <= 1) effectiveLength = length * 0.6;
        else if (depth <= 2) effectiveLength = length * 0.75;
        
        var x2 = x1 + Math.cos(angle) * effectiveLength;
        var y2 = y1 + Math.sin(angle) * effectiveLength;
        
        if (!isInsideHeart(x2, y2, treeX, heartCenterY, heartScale, 0.92)) {
            var bestT = 0;
            for (var step = 0.1; step <= 1.0; step += 0.1) {
                var testX = x1 + Math.cos(angle) * effectiveLength * step;
                var testY = y1 + Math.sin(angle) * effectiveLength * step;
                if (isInsideHeart(testX, testY, treeX, heartCenterY, heartScale, 0.88)) {
                    bestT = step;
                }
            }
            if (bestT < 0.15) return;
            x2 = x1 + Math.cos(angle) * effectiveLength * bestT;
            y2 = y1 + Math.sin(angle) * effectiveLength * bestT;
        }
        
        branchSegments.push({ x1: x1, y1: y1, x2: x2, y2: y2, thickness: thickness });
        
        var numChildren = (depth > 5) ? 2 : (Math.random() > 0.3 ? 3 : 2);
        
        for (var i = 0; i < numChildren; i++) {
            var spread = (Math.PI / 4) * (0.5 + Math.random() * 0.5);
            var childAngle = (numChildren === 2) 
                             ? angle + (i === 0 ? -spread * 0.6 : spread * 0.6)
                             : angle + (i - 1) * spread * 0.5;
            childAngle += (Math.random() - 0.5) * 0.3;
            var childLength = effectiveLength * (0.6 + Math.random() * 0.15);
            var childThickness = thickness * (0.55 + Math.random() * 0.1);
            branch(x2, y2, childAngle, childLength, childThickness, depth - 1);
        }
    }
    
    branch(treeX, trunkTop, -Math.PI/2 - 0.4, height * 0.10, 4.5, 7);
    branch(treeX, trunkTop, -Math.PI/2 + 0.4, height * 0.10, 4.5, 7);
    branch(treeX, trunkTop, -Math.PI/2 - 0.05, height * 0.08, 3.5, 6);
    branch(treeX - 2, trunkTop + 40, -Math.PI/2 - 0.7, height * 0.09, 4, 6);
    branch(treeX + 2, trunkTop + 40, -Math.PI/2 + 0.7, height * 0.09, 4, 6);
    branch(treeX - 3, trunkTop + 80, -Math.PI/2 - 0.9, height * 0.08, 3.5, 5);
    branch(treeX + 3, trunkTop + 80, -Math.PI/2 + 0.9, height * 0.08, 3.5, 5);
    branch(treeX - 2, trunkTop + 110, -Math.PI/2 - 1.1, height * 0.06, 3, 4);
    branch(treeX + 2, trunkTop + 110, -Math.PI/2 + 1.1, height * 0.06, 3, 4);
}

function drawTrunk() {
    var trunkBaseY = height;
    var currentTopY = trunkBaseY - ((trunkBaseY - heartCenterY) * trunkProgress);

    ctx.fillStyle = "#3b1e15";
    ctx.beginPath();
    ctx.moveTo(treeX - 18, trunkBaseY); 
    ctx.quadraticCurveTo(treeX - 10, height * 0.6, treeX - 5, currentTopY);
    ctx.lineTo(treeX + 5, currentTopY);
    ctx.quadraticCurveTo(treeX + 10, height * 0.6, treeX + 18, trunkBaseY);
    ctx.closePath();
    ctx.fill();

    if (trunkProgress > 0.6) {
        ctx.globalAlpha = Math.min(1, (trunkProgress - 0.6) * 3);
        ctx.strokeStyle = "#3b1e15";
        ctx.lineCap = "round";
        for (var s = 0; s < branchSegments.length; s++) {
            var seg = branchSegments[s];
            ctx.beginPath();
            ctx.lineWidth = seg.thickness;
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
    }
}

// Dibujar con Prerender (Optimización masiva - evita save/restore pesados y reconstrucción vectorial)
function drawHeart(f) {
    if (f.size <= 0) return;
    var img = preRenderedHearts[f.color];
    var s = f.size / 10;
    ctx.setTransform(
        s * Math.cos(f.rotation), s * Math.sin(f.rotation),
        -s * Math.sin(f.rotation), s * Math.cos(f.rotation),
        f.x, f.y
    );
    ctx.drawImage(img, -20, -20);
}

function drawFallingHeart(p) {
    var img = preRenderedHearts[p.color];
    var s = (p.size * 2) / 10;
    ctx.setTransform(
        s * Math.cos(p.rot), s * Math.sin(p.rot),
        -s * Math.sin(p.rot), s * Math.cos(p.rot),
        p.x, p.y
    );
    ctx.drawImage(img, -20, -20);
}

var PETAL_POOL_MAX = 200; // Total en pantalla al mismo tiempo
function spawnPetal(sourceX, sourceY, sourceColor, sourceSize) {
    var dx = chronoTargetX - sourceX, dy = chronoTargetY - sourceY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var dX = dx / dist, dY = dy / dist;
    var speed = Math.random() * 2.5 + 3.0;
    
    fallingPetals.push({
        x: sourceX, y: sourceY,
        size: sourceSize * 0.45,
        speedX: dX * speed + (Math.random() - 0.5) * 0.8,
        speedY: dY * speed + (Math.random() - 0.3) * 0.6,
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.1,
        phase: Math.random() * Math.PI * 2,
        color: sourceColor,
        life: 0
    });
}

function animate(time) {
    // Restaurar transform por defecto al inicio
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);

    if (treeCanvasCached) {
        // === MODO ULTRA OPTIMIZADO (60 FPS FIJOS) ===
        // 1 solá imagen para los 35000 corazones y el tronco
        ctx.drawImage(treeCanvasCached, 0, 0);
        
        // Spawnear aleatoriamente algunos pétalos desde flores aleatorias
        if (fallingPetals.length < PETAL_POOL_MAX) {
            for(let k = 0; k < 4; k++) { // Max 4 spawn checks por frame
                var randomIdx = Math.floor(Math.random() * flowers.length);
                var f = flowers[randomIdx];
                if (Math.random() < 0.2) {
                    spawnPetal(f.x, f.y, f.color, f.maxSize);
                }
            }
        }
    } else {
        // === MODO CRECIMIENTO ===
        var dt = time - startTime;
        if (animState === 0) {
            trunkProgress += 0.012;
            if (trunkProgress >= 1) {
                trunkProgress = 1; animState = 1; startTime = time;
            }
        }
        
        drawTrunk();
        
        if (animState >= 1) {
            var allBloomed = true;
            for (var i = 0; i < flowers.length; i++) {
                var f = flowers[i];
                if (!f.blooming && dt > f.delay) f.blooming = true;
                if (f.blooming) {
                    f.size += (f.maxSize - f.size) * 0.08;
                    // Auto-completar cuando falta poco para ahorrar cálculos
                    if (Math.abs(f.maxSize - f.size) < 0.05) f.size = f.maxSize;
                }
                if (f.size < f.maxSize) allBloomed = false;
                
                drawHeart(f);
                
                // Spawnear petalos sueltos durante el crecimiento
                if (f.size > f.maxSize * 0.9 && Math.random() < 0.003 && fallingPetals.length < PETAL_POOL_MAX) {
                    spawnPetal(f.x, f.y, f.color, f.size);
                }
            }
            // Restaurar transform para la captura del frame!
            ctx.setTransform(1, 0, 0, 1, 0, 0);

            // Congelar el árbol cuando termine
            if (allBloomed && animState === 1) {
                animState = 2; // Bloqueado
                treeCanvasCached = document.createElement('canvas');
                treeCanvasCached.width = width;
                treeCanvasCached.height = height;
                treeCanvasCached.getContext('2d').drawImage(canvas, 0, 0);
            }
        }
    }

    // Dibujar caida del viento (siempre dinámico)
    for (var j = fallingPetals.length - 1; j >= 0; j--) {
        var p = fallingPetals[j];
        p.life++;
        p.x += p.speedX + Math.sin(p.phase + p.life * 0.05) * 0.5;
        p.y += p.speedY;
        p.rot += p.rotSpeed;
        p.speedY += 0.015; // gravedad mínima para curva parabólica
        
        drawFallingHeart(p);
        
        if (p.y > height + 30 || p.x < -40 || p.x > width + 40 || p.life > 400) {
            fallingPetals.splice(j, 1);
        }
    }

    requestAnimationFrame(animate);
}

// Empezar inicialización!
resize();
requestAnimationFrame(animate);
