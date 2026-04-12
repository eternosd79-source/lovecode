const btnNo = document.getElementById('btnNo');
const btnYes = document.getElementById('btnYes');
const evasiveScreen = document.getElementById('evasiveScreen');
const finalScreen = document.getElementById('finalScreen');
const customData = window.customData || {}; // Compatibility for personalize fallback

// Función del botón evasivo
function runaway(e) {
    if (e && e.type === 'touchstart') e.preventDefault(); // Evitar click fantasma en pantallas táctiles
    
    // Obtener los límites del contenedor
    const container = document.querySelector('.button-container');
    const containerRect = container.getBoundingClientRect();
    
    // Calcular el rango máximo dentro del contenedor
    const maxX = containerRect.width - btnNo.offsetWidth;
    const maxY = containerRect.height - btnNo.offsetHeight;
    
    // Coordenadas aleatorias extremas para que huya bastante
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);
    
    btnNo.style.position = 'absolute';
    btnNo.style.left = `${randomX}px`;
    btnNo.style.top = `${randomY}px`;
}

// Escuchadores del botón evasivo
btnNo.addEventListener('mouseover', runaway);
btnNo.addEventListener('touchstart', runaway);
btnNo.addEventListener('click', runaway); // Por si logran darle click

// Flujo de aceptación (Sí)
btnYes.addEventListener('click', () => {
    // Al decir SÍ, cambiamos las clases para transicionar de pantalla
    evasiveScreen.classList.remove('active');
    finalScreen.classList.add('active');
    
    // Generar la celebración visual
    triggerConfetti();
    
    // Si la plataforma mandó ejecutar una música global que dependa del click, esto ya dispara el primer gesto!
});

// Sistema de partículas para sentimiento de celebración/alivio
function triggerConfetti() {
    const box = document.getElementById('particlesBox');
    const colors = ['#ff2d75', '#06b6d4', '#fbbf24', '#ffffff', '#ff4b8b'];
    
    for(let i=0; i<80; i++) {
        const conf = document.createElement('div');
        conf.className = 'confetti';
        
        // Asignar posición aleatoria repartida en todo el ancho
        conf.style.left = (Math.random() * 100) + 'vw';
        
        // Aleatoriedad de velocidad y demoras para que sea fluido
        const duration = (Math.random() * 3 + 2); // entre 2s y 5s
        conf.style.animationDuration = duration + 's';
        conf.style.animationDelay = (Math.random() * 1.5) + 's';
        
        // Color aleatorio del array romántico
        conf.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        // La mitad de las partículas serán círculos en vez de cuadraditos
        if(Math.random() > 0.5) conf.style.borderRadius = '50%';
        
        box.appendChild(conf);
        
        // Limpieza de memoria automática cuando caen
        setTimeout(() => {
            if(conf.parentNode) conf.parentNode.removeChild(conf);
        }, (duration + 1.5) * 1000);
    }
}
