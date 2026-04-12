const canvasContainer = document.getElementById("threejs-canvas");
const statusString = document.getElementById("statusString");
const pbFill = document.getElementById("pbFill");
const heartScreen = document.getElementById("heart-screen");

// ================================
// INTRO CINEMATOGRÁFICO
// ================================
const introOverlay = document.getElementById('introOverlay');
const phrase1 = document.getElementById('iPhrase1');
const phrase2 = document.getElementById('iPhrase2');
const phrase3 = document.getElementById('iPhrase3');
const btnReveal = document.getElementById('btnReveal');

function showPhrase(el, delay, duration, cb) {
    setTimeout(() => {
        el.style.display = 'block';
        el.classList.add('active');
        setTimeout(() => {
            el.classList.replace('active', 'exit');
            setTimeout(() => { el.style.display = 'none'; if (cb) cb(); }, 1500);
        }, duration);
    }, delay);
}

// Iniciar secuencia de frases al cargar
showPhrase(phrase1, 800,  3000, () => {
    showPhrase(phrase2, 200, 3000, () => {
        showPhrase(phrase3, 200, 3000, () => {
            setTimeout(() => { btnReveal.style.display = 'block'; }, 400);
        });
    });
});

btnReveal.addEventListener('click', () => {
    introOverlay.style.opacity = '0';
    introOverlay.style.pointerEvents = 'none';
    
    // Revelar la pantalla del corazón
    heartScreen.style.display = 'block';
    
    // Dejar que el CSS opacity termine el fade y luego arrancar la animación pesada
    setTimeout(() => {
        introOverlay.style.display = 'none';
        initThreeJS();
        animate(); // Iniciar la formación del corazón
    }, 1500);
});


// ================================
// INIT THREE SCENE (Aplazado)
// ================================
let scene, camera, renderer, heartMesh, floatingSprites;
let positionsCurrent, positionsTarget, positionsChaos, particleGeometry;
const particleCount = 20000;

function initThreeJS() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 45;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasContainer.appendChild(renderer.domElement);

    // ================================
    // LÓGICA DE PARTÍCULAS DEL CORAZÓN
    // ================================
    particleGeometry = new THREE.BufferGeometry();
    positionsCurrent = new Float32Array(particleCount * 3);
    positionsTarget = new Float32Array(particleCount * 3);
    positionsChaos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        
        // CAOS
        positionsChaos[idx]     = (Math.random() - 0.5) * 400;
        positionsChaos[idx + 1] = (Math.random() - 0.5) * 400;
        positionsChaos[idx + 2] = (Math.random() - 0.5) * 400;
        
        positionsCurrent[idx]     = positionsChaos[idx];
        positionsCurrent[idx + 1] = positionsChaos[idx + 1];
        positionsCurrent[idx + 2] = positionsChaos[idx + 2];

        // CORAZÓN
        let t = Math.random() * Math.PI * 2;
        let vx = 16 * Math.pow(Math.sin(t), 3);
        let vy = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
        
        const scaleFactor = Math.pow(Math.random(), 0.5);
        vx *= scaleFactor; 
        vy *= scaleFactor;
        
        let vz = (Math.random() - 0.5) * 8 * (1 - scaleFactor);

        positionsTarget[idx]     = vx;
        positionsTarget[idx + 1] = vy;
        positionsTarget[idx + 2] = vz;
    }

    const positionAttribute = new THREE.BufferAttribute(positionsCurrent, 3);
    positionAttribute.setUsage(THREE.DynamicDrawUsage);
    particleGeometry.setAttribute('position', positionAttribute);

    function createGlowRect() {
        const canvas = document.createElement('canvas');
        canvas.width = 16; canvas.height = 16;
        const ctx = canvas.getContext('2d');
        const grd = ctx.createRadialGradient(8,8,0, 8,8,8);
        grd.addColorStop(0, '#ffffff');
        grd.addColorStop(0.3, '#ff0055');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0,0,16,16);
        return new THREE.CanvasTexture(canvas);
    }

    const particleMaterial = new THREE.PointsMaterial({
        size: 1.0,
        map: createGlowRect(),
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false, 
        color: 0xff0055 
    });

    heartMesh = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(heartMesh);


    // ================================
    // "I LOVE YOU" FLOATING TEXT LABELS
    // ================================
    function createIloveYouSprite() {
        const c = document.createElement('canvas');
        c.width = 256; c.height = 64; 
        const cxt = c.getContext('2d');
        cxt.fillStyle = 'rgba(0,0,0,0)';
        cxt.fillRect(0,0,256,64);
        cxt.font = "bold 32px Arial";
        cxt.textAlign = "center";
        cxt.fillStyle = "#ff6699"; 
        cxt.shadowColor = "#ff0055";
        cxt.shadowBlur = 10;
        cxt.fillText("I LOVE YOU", 128, 40);
        
        const tex = new THREE.CanvasTexture(c);
        const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(6, 1.5, 1);
        return sprite;
    }

    floatingSprites = [];
    for(let i=0; i<30; i++) {
        let sprite = createIloveYouSprite();
        sprite.position.set(
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 60 - 10
        );
        sprite.userData = {
            speed: Math.random() * 0.01 + 0.005,
            radius: Math.random() * 20 + 20,
            angle: Math.random() * Math.PI * 2
        };
        floatingSprites.push(sprite);
        scene.add(sprite);
    }
}


// ================================
// LÓGICA DE ENSAMBLAJE
// ================================
let timeRunning = 0;
let assemblyProgress = 0.0; 

function animate() {
    requestAnimationFrame(animate);
    
    timeRunning += 0.01;

    if (assemblyProgress < 1.0) {
        assemblyProgress += 0.002; 
        if(assemblyProgress > 1.0) assemblyProgress = 1.0;
        
        let displayPer = Math.floor(assemblyProgress * 100);
        pbFill.style.width = displayPer + "%";
        
        if (displayPer < 10) {
            statusString.innerText = "Inicializando núcleo hiperluminoso...\u2588";
        } else if (displayPer < 99) {
            statusString.innerText = "Formando geometría de latidos estelares... " + displayPer + "%";
        } else {
            statusString.innerText = "SISTEMA COMPLETADO: TE AMO 💖";
            pbFill.style.backgroundColor = "#fff"; 
            pbFill.style.boxShadow = "0 0 15px #fff";
        }
    }

    const easeFactor = (assemblyProgress * assemblyProgress * (3 - 2 * assemblyProgress));
    
    let beatScale = 1.0;
    if (assemblyProgress > 0.98) {
        beatScale = 1.0 + Math.sin(timeRunning * 12) * 0.05;
    }
    
    let positionArrayAttr = particleGeometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
        let idx = i * 3;
        let cx = positionsChaos[idx];
        let cy = positionsChaos[idx + 1];
        let cz = positionsChaos[idx + 2];
        let tx = positionsTarget[idx] * beatScale;
        let ty = positionsTarget[idx + 1] * beatScale;
        let tz = positionsTarget[idx + 2] * beatScale;
        
        positionArrayAttr[idx]     = cx + (tx - cx) * easeFactor;
        positionArrayAttr[idx + 1] = cy + (ty - cy) * easeFactor;
        positionArrayAttr[idx + 2] = cz + (tz - cz) * easeFactor;
    }
    
    particleGeometry.attributes.position.needsUpdate = true;
    heartMesh.rotation.y = timeRunning * 0.5;

    floatingSprites.forEach(sprite => {
        let sd = sprite.userData;
        sd.angle += sd.speed;
        sprite.position.x = Math.sin(sd.angle) * sd.radius;
        sprite.position.z = Math.cos(sd.angle) * sd.radius - 10;
        sprite.position.y += Math.sin(timeRunning * 2 + sd.angle) * 0.05;
    });

    renderer.render(scene, camera);
}

// Redimension
window.addEventListener('resize', () => {
    if(!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
