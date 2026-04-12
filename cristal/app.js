const btnYes = document.getElementById("btnYes");
const btnNo = document.getElementById("btnNo");
const successScreen = document.getElementById("successScreen");
const glassContainer = document.getElementById("glassContainer");

// ==============================
// 0. INTRO CINEMÁTICO (EL VELO)
// ==============================
const introScreen = document.getElementById("introScreen");
const btnRevealIntro = document.getElementById("btnRevealIntro");

// Secuencia de textos de entrada
setTimeout(() => document.getElementById("i_t1").classList.add("visible"), 500);
setTimeout(() => document.getElementById("i_t2").classList.add("visible"), 2500);
setTimeout(() => {
    btnRevealIntro.classList.remove("hidden");
    // Pequeño delay extra para la animación CCS
    setTimeout(() => btnRevealIntro.classList.add("visible"), 50); 
}, 4500);

// Transición Intro -> Cristal
btnRevealIntro.addEventListener("click", () => {
    introScreen.classList.add("fade-out");
    setTimeout(() => {
        glassContainer.classList.remove("hidden-start");
        glassContainer.style.pointerEvents = "auto";
    }, 1000);
    setTimeout(() => {
        introScreen.style.display = "none";
    }, 2500);
});

// ==============================
// 1. PARTICULAS ORGÁNICAS (CANVAS)
// ==============================
const canvas = document.getElementById("particlesCanvas");
const ctx = canvas.getContext("2d");

let W, H;
let particles = [];

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

class Particle {
    constructor() {
        this.x = Math.random() * W;
        this.y = H + Math.random() * 200; // Nace abajo
        this.size = Math.random() * 2 + 0.5;
        this.speedY = -(Math.random() * 1 + 0.5); // Sube lento
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.life = Math.random() * 0.5 + 0.2;
        // Colores pastel cálidos
        const colors = ['#ffd6eb', '#fff5ea', '#ffb3c6', '#ffffff'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.y * 0.01) * 0.5; // Movimiento sinuoso
        
        // Destello (Fade in/out basado en altura)
        let alpha = this.life;
        if (this.y < 100) alpha *= (this.y / 100); 
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Reset si sube demasiado
        if (this.y < -50) {
            this.y = H + 50;
            this.x = Math.random() * W;
        }
    }
}

// Inicializar partículas
for(let i = 0; i < 60; i++) {
    particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => p.update());
    requestAnimationFrame(animateParticles);
}
animateParticles();


// ==============================
// 2. BOTÓN "NO" ESCURRIDIZO Y DISOLVENTE
// ==============================
let evadeCount = 0;
const MAX_EVADES = 4; // A la 4ta vez, desaparece

function evadeButton(e) {
    if(evadeCount >= MAX_EVADES) return;
    
    e.preventDefault();
    evadeCount++;

    if (evadeCount >= MAX_EVADES) {
        // Ejecutar disolución romántica
        btnNo.classList.add("dissolving");
        setTimeout(() => {
            btnNo.style.display = "none";
        }, 1000);
        return;
    }

    // Comportamiento de escape normal (fixed position)
    if(btnNo.style.position !== "fixed") {
        btnNo.style.position = "fixed";
    }
    
    const safeX = btnNo.offsetWidth;
    const safeY = btnNo.offsetHeight;
    
    let targetX = Math.random() * (window.innerWidth - safeX - 20) + 10;
    let targetY = Math.random() * (window.innerHeight - safeY - 20) + 10;

    btnNo.style.transition = "top 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28), left 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)";
    btnNo.style.left = targetX + "px";
    btnNo.style.top = targetY + "px";
}

btnNo.addEventListener("mouseover", evadeButton);
btnNo.addEventListener("touchstart", evadeButton, {passive: false});


// ==============================
// 3. VICTORIA CINEMÁTICA
// ==============================
btnYes.addEventListener("click", () => {
    // Desaparece el glass container suavemente
    glassContainer.style.transition = "opacity 1s, transform 1s, filter 1s";
    glassContainer.style.opacity = "0";
    glassContainer.style.transform = "scale(1.1)";
    glassContainer.style.filter = "blur(10px)";
    glassContainer.style.pointerEvents = "none";

    setTimeout(() => {
        successScreen.classList.add("active");

        // Secuencia escalonada de texto ganador
        setTimeout(() => document.getElementById("c_t1").classList.add("visible"), 500);
        setTimeout(() => document.getElementById("c_t2").classList.add("visible"), 2500);
        setTimeout(() => document.getElementById("c_t3").classList.add("visible"), 5000);

    }, 800); 
});
