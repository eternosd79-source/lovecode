document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // INTRO: LLUVIA DE PÉTALOS + TRANSICIÓN
    // =========================================
    const introScreen   = document.getElementById('intro-screen');
    const introBtn      = document.getElementById('introBtn');
    const waveEl        = document.getElementById('wave-transition');
    const petalsContainer = document.getElementById('petals-container');

    // Generar pétalos cayendo
    const petalEmojis = ['🌸', '🌺', '🌷', '💮', '🌼', '🏵️', '💐'];
    for (let i = 0; i < 35; i++) {
        const p = document.createElement('div');
        p.classList.add('petal');
        p.textContent = petalEmojis[Math.floor(Math.random() * petalEmojis.length)];
        p.style.left     = Math.random() * 100 + '%';
        p.style.fontSize = (Math.random() * 1.2 + 0.8) + 'rem';
        p.style.animationDuration = (Math.random() * 5 + 5) + 's'; // 5s–10s
        p.style.animationDelay   = (Math.random() * 8) + 's';       // stagger
        petalsContainer.appendChild(p);
    }

    // Click en el botón → onda de transición → revelar carta
    introBtn.addEventListener('click', (e) => {
        // Posicionar la onda donde el usuario hizo click
        const rect = introBtn.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        waveEl.style.left = cx + 'px';
        waveEl.style.top  = cy + 'px';
        waveEl.style.marginLeft = '-5px';
        waveEl.style.marginTop  = '-5px';

        // Activar onda expansiva
        waveEl.classList.add('ripple-active');

        // Después de que la onda cubra todo, ocultar intro
        setTimeout(() => {
            introScreen.classList.add('hidden');
            // Desvanecer la onda
            waveEl.classList.replace('ripple-active', 'ripple-done');
            setTimeout(() => {
                waveEl.style.display = 'none';
            }, 600);
        }, 700);
    });

    const backgroundContainer = document.querySelector('.background-container');
    const NUM_HEARTS = 50;
    
    // Corazones o chispas disponibles para diversificar el fondo
    const heartSymbols = ["♥", "♡", "💖", "✨", "💕"];

    for (let i = 0; i < NUM_HEARTS; i++) {
        let heart = document.createElement('div');
        heart.classList.add('bg-heart');
        
        // Simbolo aleatorio
        heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
        
        // Disposición aleatoria a lo ancho
        let leftPos = Math.random() * 100;
        heart.style.left = leftPos + '%';
        
        // Tamaños aleatorios para profundidad y variedad visual
        let scale = Math.random() * 1.5 + 0.5; // Entre 0.5 y 2.0
        heart.style.fontSize = (20 * scale) + 'px';
        
        // Opacidad inicial y sombra
        heart.style.opacity = Math.random() * 0.6 + 0.2;
        heart.style.textShadow = `0 0 ${10 * scale}px rgba(255, 0, 150, 0.6)`;
        
        // Duración de la animación (más rápidos o más lentos al subir)
        let duration = Math.random() * 10 + 6; // Entre 6s y 16s
        heart.style.animationDuration = duration + 's';
        
        // Retraso inicial para que no salgan todos juntos de abajo en el segundo cero
        let delay = Math.random() * 15; 
        heart.style.animationDelay = delay + 's';

        backgroundContainer.appendChild(heart);
    }

    // Funcionalidad del Botón Cerrar 'X'
    const closeBtn = document.getElementById('closeBtn');
    const mainCard = document.getElementById('mainCard');
    
    closeBtn.addEventListener('click', () => {
        // En un modal clásico, aplicaríamos display none, o animaríamos su salida
        mainCard.style.transition = "all 0.6s ease";
        mainCard.style.opacity = "0";
        mainCard.style.transform = "scale(0.8) translateY(-50px)";
        
        // Opcional: Eliminarlo del DOM tras la animación
        setTimeout(() => {
            mainCard.style.display = "none";
        }, 600);
    });

});
