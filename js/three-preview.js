// ============================================================
// CORAZÓNCÓDIGO — 3D GIFT PREVIEW (THREE.JS)
// Módulo para renderizar un modelo 3D (Caja de Regalo/Corazón)
// en el modal de éxito utilizando Three.js
// ============================================================

let scene, camera, renderer, giftGroup;
let is3DInitialized = false;
let animationFrameId;

function init3DSuccess() {
    const container = document.getElementById('threeContainer');
    if (!container || is3DInitialized) return;

    if (typeof THREE === 'undefined') {
        console.warn('[ThreeJS] THREE.js no está cargado.');
        return;
    }

    is3DInitialized = true;
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 200;

    // Escena y Cámara
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 5;

    // Renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xc026d3, 2, 50);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 1.5, 50);
    cyanLight.position.set(-2, -1, 3);
    scene.add(cyanLight);

    // Crear el Grupo del Regalo
    giftGroup = new THREE.Group();

    // Material de Cristal
    const boxMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x111111,
        metalness: 0.9,
        roughness: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.85
    });

    // Material de la Cinta
    const ribbonMaterial = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        metalness: 0.3,
        roughness: 0.4,
        emissive: 0x4a0010
    });

    // Caja base
    const boxGeo = new THREE.BoxGeometry(1.5, 1.2, 1.5);
    const boxMesh = new THREE.Mesh(boxGeo, boxMaterial);
    giftGroup.add(boxMesh);

    // Tapa
    const lidGeo = new THREE.BoxGeometry(1.6, 0.3, 1.6);
    const lidMesh = new THREE.Mesh(lidGeo, boxMaterial);
    lidMesh.position.y = 0.75;
    giftGroup.add(lidMesh);

    // Cinta Horizontal
    const hRibbonGeo = new THREE.BoxGeometry(1.52, 1.22, 0.3);
    const hRibbon = new THREE.Mesh(hRibbonGeo, ribbonMaterial);
    giftGroup.add(hRibbon);

    // Cinta Vertical
    const vRibbonGeo = new THREE.BoxGeometry(0.3, 1.22, 1.52);
    const vRibbon = new THREE.Mesh(vRibbonGeo, ribbonMaterial);
    giftGroup.add(vRibbon);

    // Lazo superior (centro)
    const bowGeo = new THREE.TorusGeometry(0.2, 0.08, 16, 32);
    const bow1 = new THREE.Mesh(bowGeo, ribbonMaterial);
    bow1.position.set(-0.2, 0.95, 0);
    bow1.rotation.y = Math.PI / 2;
    giftGroup.add(bow1);

    const bow2 = new THREE.Mesh(bowGeo, ribbonMaterial);
    bow2.position.set(0.2, 0.95, 0);
    bow2.rotation.y = Math.PI / 2;
    giftGroup.add(bow2);

    // Inclinación inicial
    giftGroup.rotation.x = 0.3;
    scene.add(giftGroup);

    // Animar
    animate3D();

    // Handle Resize
    window.addEventListener('resize', () => {
        if (!container) return;
        const newW = container.clientWidth;
        const newH = container.clientHeight;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
    });

    // Interactividad simple: seguir mouse
    document.addEventListener('mousemove', (e) => {
        if (!giftGroup) return;
        const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        
        giftGroup.rotation.x = 0.3 + (mouseY * 0.2);
        giftGroup.rotation.y += (mouseX * 0.05);
    });
}

function animate3D() {
    animationFrameId = requestAnimationFrame(animate3D);
    if (giftGroup) {
        giftGroup.rotation.y += 0.005; // Rotación lenta y elegante
        giftGroup.position.y = Math.sin(Date.now() * 0.002) * 0.1; // Efecto de flotación
    }
    renderer.render(scene, camera);
}

// Escuchar cuando se abre el modal de checkout success
document.addEventListener('corazoncodigo:order-completed', () => {
    // Pequeño delay para asegurar que el contenedor esté visible
    setTimeout(init3DSuccess, 300);
});
