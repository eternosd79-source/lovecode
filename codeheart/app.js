// =================================
// 1. SMART TYPEWRITER (HTML SYNTAX)
// =================================
const codeTarget = document.getElementById("codeTarget");
const btnRun = document.getElementById("btnRun");

// El script romántico con span classes (Syntax Highlighting VIP)
const rawCodeHTML = `
<span class="cm">// Algoritmo de colisión de almas</span>
<span class="kw">import</span> { <span class="var">Tú</span>, <span class="var">Yo</span> } <span class="kw">from</span> <span class="str">"./Universo"</span>;

<span class="kw">async function</span> <span class="fn">nuestroDestino</span>() {
    <span class="kw">let</span> <span class="var">felicidad</span> <span class="op">=</span> <span class="var">0</span>;
    
    <span class="kw">while</span> (<span class="var">true</span>) {
        <span class="kw">await</span> <span class="fn">amarteCadaMicrosegundo</span>();
        <span class="var">felicidad</span> <span class="op">=</span> <span class="var">Infinity</span>;
    }
}

<span class="cm">// Inicializando...</span>
`;

// Typewriter que salta los tags HTML instantáneamente para no escribirlos en crudo
function typeWriterHTML(element, htmlString, speed, onComplete) {
    let i = 0;
    let currentHTML = "";
    
    function type() {
        if (i < htmlString.length) {
            // Si encuentra un <, lee hasta el > de inmediato
            if (htmlString.charAt(i) === '<') {
               let tag = "";
               while(htmlString.charAt(i) !== '>' && i < htmlString.length) {
                   tag += htmlString.charAt(i);
                   i++;
               }
               tag += ">";
               currentHTML += tag;
               // Llamada recursiva sin retraso
               type(); 
               return; 
            } else {
               currentHTML += htmlString.charAt(i);
               element.innerHTML = currentHTML + '<span class="cursor-blink"></span>';
               i++;
               // Velocidad muy variada para simular dedos humanos
               const randDelay = (htmlString.charAt(i-1) === ' ') ? 10 : Math.random() * speed + 5;
               setTimeout(type, randDelay);
            }
        } else {
           if(onComplete) onComplete();
        }
    }
    type();
}

setTimeout(() => {
    typeWriterHTML(codeTarget, rawCodeHTML.trim(), 40, () => {
        // Al terminar, revelar el botón de Run
        setTimeout(() => {
            btnRun.classList.remove("hidden");
            setTimeout(() => { btnRun.classList.add("fade-in"); }, 50);
        }, 800);
    });
}, 1000);


// =================================
// 2. MOTOR HOLOGRAMA 3D (THREE.JS)
// =================================
const container = document.getElementById("threejs-canvas");

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050508, 0.015);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = window.innerWidth < 600 ? 70 : 60;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const heartGroup = new THREE.Group();

// Forma del corazón paramétrica simple a Shape
const x = 0, y = 0;
const heartShape = new THREE.Shape();
heartShape.moveTo( x + 5, y + 5 );
heartShape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
heartShape.bezierCurveTo( x - 6, y, x - 6, y + 7,x - 6, y + 7 );
heartShape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
heartShape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
heartShape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
heartShape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );

const extrudeSettings = { 
    depth: 5, 
    bevelEnabled: true, 
    bevelSegments: 5, 
    steps: 2, 
    bevelSize: 1.5, 
    bevelThickness: 1.5 
};
const heartGeo = new THREE.ExtrudeGeometry( heartShape, extrudeSettings );
heartGeo.center(); 
heartGeo.rotateZ(Math.PI); // Voltear hacia arriba

// WIREFRAME 1: Cyan Neón (Dracula)
const wireMat = new THREE.MeshBasicMaterial({ 
    color: 0x8be9fd, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.15 
});
const wireMesh = new THREE.Mesh(heartGeo, wireMat);
heartGroup.add(wireMesh);

// WIREFRAME 2: Rosado brillante expandido
const wireMat2 = new THREE.MeshBasicMaterial({ 
    color: 0xff79c6, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.08 
});
const wireMesh2 = new THREE.Mesh(heartGeo, wireMat2);
wireMesh2.scale.set(1.08, 1.08, 1.08);
heartGroup.add(wireMesh2);

// CAPA DE ESTRELLAS CYBERPUNK
const pCount = 300;
const pGeo = new THREE.BufferGeometry();
const pArr = new Float32Array(pCount * 3);
for(let i=0; i<pCount; i++) {
    pArr[i*3]   = (Math.random() - 0.5) * 60;
    pArr[i*3+1] = (Math.random() - 0.5) * 60;
    pArr[i*3+2] = (Math.random() - 0.5) * 30;
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));

function buildDotTexture() {
    let cvs = document.createElement("canvas");
    cvs.width = 16; cvs.height = 16;
    let ctx = cvs.getContext("2d");
    let grd = ctx.createRadialGradient(8,8,0, 8,8,8);
    grd.addColorStop(0, '#ffffff');
    grd.addColorStop(0.3, '#ff79c6');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,16,16);
    return new THREE.CanvasTexture(cvs);
}
const pMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.0,
    map: buildDotTexture(),
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});
const pMesh = new THREE.Points(pGeo, pMat);
heartGroup.add(pMesh);

scene.add(heartGroup);

// ESTRELLAS DE FONDO OSCURO
const bgStarsGeo = new THREE.BufferGeometry();
const bgStarsVerts = [];
for(let i=0; i<400; i++) {
    bgStarsVerts.push(
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 200 - 50
    );
}
bgStarsGeo.setAttribute('position', new THREE.Float32BufferAttribute(bgStarsVerts, 3));
const bgStarsMat = new THREE.PointsMaterial({ color: 0x6272a4, size: 0.8, transparent: true, opacity: 0.3 });
const bgStarsPoints = new THREE.Points(bgStarsGeo, bgStarsMat);
scene.add(bgStarsPoints);

// =================================
// LÓGICA DE DETONACIÓN (COMPILACIÓN)
// =================================
let time = 0;
let explosionActive = false;

function animate() {
    requestAnimationFrame(animate);
    
    time += 0.01;

    if(!explosionActive) {
        // Rotación arquitectónica suave (El holograma girando detrás del IDE)
        heartGroup.rotation.y += 0.003;
        heartGroup.rotation.x = Math.sin(time) * 0.1;
        heartGroup.rotation.z = Math.cos(time * 0.5) * 0.05;

        // Latido
        const s = 1.0 + Math.sin(time * 3) * 0.02;
        heartGroup.scale.set(s,s,s);
        
        bgStarsPoints.rotation.y -= 0.0005;
        
    } else {
        // COMPILACIÓN ESTALLA: Hiper-escala y fuga
        heartGroup.scale.x += 0.2;
        heartGroup.scale.y += 0.2;
        heartGroup.scale.z += 0.2;
        
        heartGroup.rotation.y += 0.03;
        
        wireMat.opacity -= 0.002; 
        wireMat2.opacity -= 0.001; 
        pMat.opacity -= 0.003;
        bgStarsMat.opacity -= 0.002;
    }

    renderer.render(scene, camera);
}

// "NPM RUN LOVE" Action
btnRun.addEventListener("click", () => {
    // 1. Cerrar Ventana IDE elegantemente
    const ideScreen = document.getElementById("ideScreen");
    ideScreen.classList.add("close-ide");
    
    setTimeout(() => {
        // 2. Detonar compilación en el fondo
        explosionActive = true;
        container.classList.add("blur-bg");
        
        // 3. Revelar Error Fatal: Love Overflow
        const dstScreen = document.getElementById("destinyScreen");
        dstScreen.classList.remove("hidden");
        void dstScreen.offsetWidth; // Force reflow
        dstScreen.classList.add("visible");
        
    }, 800);
});

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.position.z = window.innerWidth < 600 ? 70 : 60;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
