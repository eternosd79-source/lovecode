const container = document.getElementById("canvas-container");
const labelsContainer = document.getElementById("labels-container");

// ==========================
// CONFIGURACIÓN BÁSICA THREE.JS
// ==========================
const scene = new THREE.Scene();

// Añadir niebla oscura para acentuar profundidad
scene.fog = new THREE.FogExp2(0x040814, 0.04);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
// Vista más frontal y cerramos el alejamiento excesivo.
camera.position.set(0, 4, 18); 

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Controles Interactivos (OrbitControls)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 28;  // Limite ajustado para que no se vea tan lejos y vacía
controls.minDistance = 1;   // Hasta donde acercarse (muy cerca!)
controls.enablePan = false; // Solo orbitar y zoom

// ==========================
// 1. GENERACIÓN DE PARTÍCULAS DE LA GALAXIA ESPIRAL
// ==========================
const particleCount = 45000;
const branches = 4;  // 4 brazos galácticos para mayor densidad
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

// Paleta de colores volumétrica tipo nebulosa real
const colorPalette = [
    new THREE.Color(0x7209b7), // Deep purple
    new THREE.Color(0xf72585), // Vivid Pink
    new THREE.Color(0x4cc9f0), // Cyan/Blue
    new THREE.Color(0xffffff)  // Star white core
];

for(let i=0; i<particleCount; i++) {
    const idx = i * 3;
    
    // Distribución exponencial: muchas partículas en el centro, menos en los bordes
    const radius = Math.pow(Math.random(), 1.5) * 16; 
    const spinAngle = radius * 0.4; // Curvatura
    const branchAngle = ((i % branches) / branches) * Math.PI * 2;
    
    // Dispersión ("scatter"): partículas que no siguen la línea exacta del brazo
    const scatter = Math.pow(Math.random(), 2) * (18 - radius) * 0.15; 
    const randomAngle = Math.random() * Math.PI * 2;
    
    const randomX = Math.cos(randomAngle) * scatter;
    const randomZ = Math.sin(randomAngle) * scatter;
    
    // Altura (Y): el centro es inflado, los bordes son planos
    const randomY = (Math.random() - 0.5) * (16 - radius) * 0.25 * Math.pow(Math.random(), 2);

    positions[idx]   = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[idx+1] = randomY; 
    positions[idx+2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    // Color volumétrico y radial
    let mixedColor = new THREE.Color();
    if(radius < 2) {
        mixedColor.copy(colorPalette[3]).lerp(colorPalette[1], Math.random() * 0.5); // Centro blanco/rosa
    } else if (radius < 7) {
        mixedColor.copy(colorPalette[1]).lerp(colorPalette[0], Math.random()); // Medio rosa/purpura
    } else {
        mixedColor.copy(colorPalette[0]).lerp(colorPalette[2], Math.random()); // Bordes purpura/cyan
    }

    colors[idx]   = mixedColor.r;
    colors[idx+1] = mixedColor.g;
    colors[idx+2] = mixedColor.b;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

// Textura redonda luminosa mejorada
function createGlowT() {
    let canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    let context = canvas.getContext("2d");
    let grad = context.createRadialGradient(16,16,0, 16,16,16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.2, 'rgba(255,255,255,0.7)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.2)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = grad;
    context.fillRect(0,0,32,32);
    return new THREE.CanvasTexture(canvas);
}

const material = new THREE.PointsMaterial({
    size: 0.35, // Puntos volumétricos
    vertexColors: true,
    map: createGlowT(),
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const galaxyMesh = new THREE.Points(geometry, material);
scene.add(galaxyMesh);

// ESTRELLAS DE FONDO (TWINKLING)
const bgStarsGeo = new THREE.BufferGeometry();
const bgStarsPoints = 5000;
const bgStarsPos = new Float32Array(bgStarsPoints * 3);
for(let i=0; i<bgStarsPoints; i++) {
    bgStarsPos[i*3] = (Math.random() - 0.5) * 150;
    bgStarsPos[i*3+1] = (Math.random() - 0.5) * 150;
    bgStarsPos[i*3+2] = (Math.random() - 0.5) * 150;
}
bgStarsGeo.setAttribute('position', new THREE.BufferAttribute(bgStarsPos, 3));
const bgStarsMat = new THREE.PointsMaterial({
    size: 0.15,
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
    map: createGlowT(),
    blending: THREE.AdditiveBlending
});
const bgStarsMesh = new THREE.Points(bgStarsGeo, bgStarsMat);
scene.add(bgStarsMesh);

// ==========================
// 2. TEXTOS, FOTOS Y PLANETAS FLOTANTES (UI 3D ORDENADA)
// ==========================
const textlove = [
    "Eres brillante", "Eres valiente", "Eres hermosa", "Eres única", "Tienes magia", "Luz propia", "Eres increíble",
    "Fuerte", "Poderosa", "Invencible", "Radical", "Maravillosa", "Inspiradora", "Mágica",
    "Genuina", "Auténtica", "Inteligente", "Creativa", "Especial", "Importante", "Valiosa",
    "Irremplazable", "Fascinante", "Deslumbrante", "Libre", "Soñadora", "Guerrera", "Estrella",
    "Preciosa", "Divina", "Asombrosa", "Extraordinaria", "Capaz", "Imparable", "Decidida",
    "Alegre", "Divertida", "Tierna", "Cariñosa", "Leal", "Sincera", "Honesta", "Auténtica",
    "Talentosa", "Hermosa alma", "Luz de estrella", "Paz", "Refugio", "Poesía", "Bravura"
];

const photosPaths = [];

const planetClasses = ["planet-jupiter", "planet-tierra", "planet-marte", "planet-luna", "planet-venus"];

// Mezclamos inteligentemente los elementos para que no hayan repetidos seguidos
const itemsToProject = [];
textlove.forEach(t => itemsToProject.push({type: 'text', data: t}));
photosPaths.forEach(p => itemsToProject.push({type: 'photo', data: p}));
for(let i=0; i<3; i++) {
    planetClasses.forEach(p => itemsToProject.push({type: 'planet', data: p}));
}
// Barajar el arreglo (Fisher-Yates) para que se entrelacen fotos, textos y planetas
for (let i = itemsToProject.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [itemsToProject[i], itemsToProject[j]] = [itemsToProject[j], itemsToProject[i]];
}

const projectedElements = []; 

const textColors = ["text-glow-blue", "text-glow-pink", "text-glow-gold", "text-glow-cyan"];

itemsToProject.forEach((item, index) => {
    let el;
    if (item.type === 'text') {
        el = document.createElement("div");
        el.classList.add("floating-label");
        // Asignación de color estelar variada
        el.classList.add(textColors[Math.floor(Math.random() * textColors.length)]);
        el.innerText = item.data;
    } else if (item.type === 'photo') {
        el = document.createElement("img");
        el.src = item.data;
        el.classList.add("floating-photo");
    } else if (item.type === 'planet') {
        el = document.createElement("div");
        el.classList.add("css-planet", item.data);
    }
    labelsContainer.appendChild(el);

    // ==========================================
    // MAGIA ESPIRAL PERFECTA (ORDEN GALÁCTICO)
    // ==========================================
    const brancesNum = 4; // 4 brazos galácticos donde irán colgados
    
    // Su radio va creciendo desde adentro hacia afuera ordenadamente
    // Empezamos en radio 4 (cerca del centro) hasta el radio 16 (bordes)
    let r = 4 + (index / itemsToProject.length) * 12; 
    let spinAngle = r * 0.45; // Siguiendo exactamente la misma rotación de la constelación
    let branchAngle = ((index % brancesNum) / brancesNum) * Math.PI * 2;
    let theta = branchAngle + spinAngle;
    
    // Un poquito de ruido en Y y Theta para que no sea una línea rígida perfecta, sino viva
    let randomTheta = theta + (Math.random() - 0.5) * 0.3;
    let randomY = (Math.random() - 0.5) * 1.5;

    projectedElements.push({
        element: el,
        pos3d: new THREE.Vector3(Math.cos(randomTheta) * r, randomY, Math.sin(randomTheta) * r),
        orbitAngle: theta,
        orbitRadius: r,
        orbitSpeed: 0.002 // Tienen la misma rotación lenta, marchan juntos en orden
    });
});


// ==========================
// ANIMACIÓN PRINCIPAL / RENDER LOOP
// ==========================
let time = 0;

function animate() {
    requestAnimationFrame(animate);
    
    time += 0.005; // Más lento y majestuoso
    controls.update();

    // Rotación del fondo estrellado
    bgStarsMesh.rotation.y = time * 0.08;
    bgStarsMesh.rotation.z = time * 0.05;

    // Rotación suave del grupo de galaxias (ya no hay planetas del mesh)
    galaxyMesh.rotation.y = time * 0.1; 

    // =================================
    // CÁLCULO DE NIVEL DE DETALLE (LOD)
    // =================================
    let camDist = camera.position.length();
    let targetOpac = 0;
    
    // Ahora, Fade in rápido desde distancia 26 hasta 15
    if (camDist < 26) {
        targetOpac = 1.0 - (camDist - 16) / 10; 
        if(targetOpac > 1) targetOpac = 1;
        if(targetOpac < 0) targetOpac = 0;
    }

    // B) Animación y Proyección Geométrica (DOM)
    const vector = new THREE.Vector3();
    const halfWidth = window.innerWidth / 2;
    const halfHeight = window.innerHeight / 2;

    projectedElements.forEach((obj) => {
        // Orbitar
        obj.orbitAngle += obj.orbitSpeed;
        obj.pos3d.x = Math.cos(obj.orbitAngle) * obj.orbitRadius;
        obj.pos3d.z = Math.sin(obj.orbitAngle) * obj.orbitRadius;

        // Rebote suave global en Y para que no sean tan estáticos
        let bounceY = Math.sin(time*2 + obj.orbitAngle*5) * 0.2;
        vector.copy(obj.pos3d);
        vector.y += bounceY; 
        
        // Proyectar
        vector.project(camera);
        
        let px = (vector.x * halfWidth) + halfWidth;
        let py = -(vector.y * halfHeight) + halfHeight;
        
        if (vector.z > 1) {
            obj.element.style.display = "none";
        } else {
            obj.element.style.display = "block";
            obj.element.style.transform = `translate(${px}px, ${py}px) translate(-50%, -50%)`;
            
            // ESCALADO PARA NITIDEZ ULTRA-HD
            // Como las clases CSS base son gigantes (font 5rem, width 250px),
            // establecemos una escala del 20% cuando están lejos.
            let pixelScale = 0.20; 
            
            // camDist va de ~1 (Súper Cerca) a 28 (Lejos)
            let zoomMultiplier = Math.max(1, 22 / camDist); // Aumenta agresivamente al acercar
            
            let scale = pixelScale * zoomMultiplier;
            
            // Suavizamos el plano Z también
            let d = 1.0 - Math.max(0, Math.min(1, vector.z));
            scale *= (0.5 + d * 0.8);

            // Textos súper gigantes y claros (ligeramente ajustados según pedido)
            if(obj.element.classList.contains("floating-label")) scale *= 2.0;
            
            // ¡Devolverle el tamaño inmenso a tus fotos!
            if(obj.element.classList.contains("floating-photo")) scale *= 1.9;

            // Planetas un poquito más grandes
            if(obj.element.classList.contains("css-planet")) scale *= 1.2;

            obj.element.style.transform += ` scale(${scale})`;
            obj.element.style.opacity = targetOpac;
        }
    });

    renderer.render(scene, camera);
}


// Eventos Reactivos
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// START
animate();
