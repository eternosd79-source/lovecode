// ==============================
// GESTIÓN DE UI / ESTADOS
// ==============================
const introScreen = document.getElementById("introScreen");
const btnStart    = document.getElementById("btnStart");
const hudScreen   = document.getElementById("hudScreen");
const energyRing  = document.getElementById("energyRing");
const climaxScreen= document.getElementById("climaxScreen");
const cl1 = document.getElementById("cl1");
const cl2 = document.getElementById("cl2");

let state = "INTRO"; // INTRO, PLAYING, SUPERNOVA
let energy = 0;       // 0 a 100
let isCharging = false;

// Secuencia Intro
setTimeout(() => document.getElementById("int1").classList.add("visible"), 500);
setTimeout(() => document.getElementById("int2").classList.add("visible"), 2500);
setTimeout(() => {
    btnStart.classList.remove("hidden");
    setTimeout(() => btnStart.classList.add("visible"), 50);
}, 4500);

btnStart.addEventListener("click", () => {
    introScreen.classList.add("fade-out");
    setTimeout(() => {
        introScreen.style.display = "none";
        hudScreen.classList.remove("hidden"); // Mostrar instrucciones interactivas
        state = "PLAYING";
    }, 2000);
});

// ==============================
// THREE.JS CONFIGURACIÓN BASE
// ==============================
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.015);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// Solo el canvas interactúa para no bloquear el clímax visual
document.getElementById('canvas-container').appendChild(renderer.domElement);

// ==============================
// GEOMETRÍA DEL CORAZÓN
// ==============================
const numParticles = 25000; 
const vertices = [];

for (let i = 0; i < numParticles; i++) {
    const t = Math.random() * Math.PI * 2;
    let hx = 16 * Math.pow(Math.sin(t), 3);
    let hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    
    const radioFill = Math.pow(Math.random(), 0.6); 
    hx *= radioFill;
    hy *= radioFill;
    
    const maxZOffset = 8;
    const thickness = maxZOffset * (1 - Math.pow(radioFill, 2));
    const hz = (Math.random() - 0.5) * thickness * 2;
    
    const noiseX = (Math.random() - 0.5) * 0.5;
    const noiseY = (Math.random() - 0.5) * 0.5;
    const noiseZ = (Math.random() - 0.5) * 0.5;

    const scale = 1.2;
    vertices.push((hx + noiseX) * scale, (hy + noiseY) * scale, (hz + noiseZ) * scale);
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(238, 82, 130, 0.8)'); 
    gradient.addColorStop(0.5, 'rgba(238, 82, 130, 0.3)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 16, 16);
    return new THREE.CanvasTexture(canvas);
}

const material = new THREE.PointsMaterial({
    color: 0xee5282, 
    size: (window.innerWidth < 600) ? 1.0 : 0.8, 
    map: createParticleTexture(), 
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending, 
    depthWrite: false 
});

const heartParticles = new THREE.Points(geometry, material);
scene.add(heartParticles);

// ==============================
// FONDO CÓSMICO
// ==============================
const bgStarsGeo = new THREE.BufferGeometry();
const bgStarsVerts = [];
for(let i=0; i<800; i++) {
    bgStarsVerts.push(
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 300 - 50 
    );
}
bgStarsGeo.setAttribute('position', new THREE.Float32BufferAttribute(bgStarsVerts, 3));
const bgStarsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, transparent: true, opacity: 0.3 });
const bgStarsPoints = new THREE.Points(bgStarsGeo, bgStarsMat);
scene.add(bgStarsPoints);

// ==============================
// LÓGICA INTERACTIVA "HOLD TO CHARGE"
// ==============================

function startCharging() {
    if(state !== "PLAYING") return;
    isCharging = true;
    hudScreen.style.opacity = "1"; // HUD más visible
}

function stopCharging() {
    if(state !== "PLAYING") return;
    isCharging = false;
    hudScreen.style.opacity = "0.5"; // HUD relajado
}

// Eventos de entrada
document.addEventListener("mousedown", startCharging);
document.addEventListener("touchstart", startCharging, {passive: true});
document.addEventListener("mouseup", stopCharging);
document.addEventListener("touchend", stopCharging);
document.addEventListener("mouseleave", stopCharging);


// ==============================
// LOOP DE ANIMACIÓN
// ==============================
let time = 0;
let explosionVelocity = 0;
// 2 * PI * radio = ~314 (El path total del SVG SVG ring)
const RING_MAX = 314; 

function animate() {
    requestAnimationFrame(animate);

    if (state === "PLAYING") {
        time += 0.005; // Tiempo base

        // Lógica de carga
        if (isCharging) {
            energy += 0.5; // Velocidad de llenado
            if (energy >= 100) {
                // DISPARAR SUPERNOVA
                energy = 100;
                state = "SUPERNOVA";
                triggerSupernova();
            }
        } else {
            // Se enfría si suelta
            energy -= 0.8;
            if (energy < 0) energy = 0;
        }

        // Actualizar HUD Ring (Dash offset de 314 a 0)
        energyRing.style.strokeDashoffset = RING_MAX - (energy / 100) * RING_MAX;

        // FÍSICAS DE ENERGÍA APLICADAS AL CORAZÓN
        const energyFactor = energy / 100; // 0.0 a 1.0

        // 1. Latido cardiaco se vuelve frenético
        const beatSpeed = 8 + (energyFactor * 30);
        // 2. Amplitud del latido crece
        const beatAmplitude = 0.03 + (energyFactor * 0.15);
        // 3. Escala general crece por acumulación (~ hasta 1.8x)
        const baseScale = 1 + (energyFactor * 0.8);
        
        const pulsate = baseScale + Math.sin(time * beatSpeed) * beatAmplitude;
        heartParticles.scale.set(pulsate, pulsate, pulsate);

        // 4. Rotación se acelera como torbellino
        const rotSpeed = 0.5 + (energyFactor * 4);
        heartParticles.rotation.y += rotSpeed * 0.01;
        heartParticles.rotation.x = Math.sin(time * 2) * (0.1 + energyFactor * 0.3); // Inclinación brusca

        // 5. Brillo se intensifica (Material del glow)
        // Tintar a blanco amarillento/dorado al cargar al máximo
        const r = 238 + (energyFactor * 17); // 238 -> 255
        const g = 82 + (energyFactor * 150); // 82 -> 232
        const b = 130 + (energyFactor * 70); // 130 -> 200
        heartParticles.material.color.setRGB(r/255, g/255, b/255);
        
        // Estrellas giran más rápido
        bgStarsPoints.rotation.y += 0.001 + (energyFactor * 0.01);

    } else if (state === "SUPERNOVA") {
        // La fase de estallido expansivo
        explosionVelocity += 0.05;
        const currentScale = heartParticles.scale.x;
        const newScale = currentScale + explosionVelocity;
        heartParticles.scale.set(newScale, newScale, newScale);
        
        // Desvanecimiento ciego brutal
        heartParticles.material.opacity -= 0.015;
        bgStarsPoints.material.opacity -= 0.01;
        
        // Seguir rotando caóticamente mientras explota
        heartParticles.rotation.y += 0.1;
    } else {
        // Estado INTRO (rotación basal leve y latido calmado)
        time += 0.005;
        const pulsate = 1 + Math.sin(time * 8) * 0.03;
        heartParticles.scale.set(pulsate, pulsate, pulsate);
        heartParticles.rotation.y += 0.005;
        bgStarsPoints.rotation.y += 0.001;
    }

    renderer.render(scene, camera);
}

function triggerSupernova() {
    // 1. Ocultar HUD
    hudScreen.style.opacity = "0";
    
    // 2. Mostrar la pantalla del Clímax después de la ráfaga de luz
    setTimeout(() => {
        climaxScreen.classList.remove("hidden");
        // Animar el TE AMO
        setTimeout(() => cl1.classList.add("visible"), 500);
        setTimeout(() => cl2.classList.add("visible"), 2500);
    }, 600); // Entra casi junto con la expansión volumétrica
}

// Start
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
