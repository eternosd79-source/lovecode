document.addEventListener('DOMContentLoaded', () => {
    // FASE 1 ELEMENTOS
    const cocheContenedor = document.getElementById('coche-contenedor');
    const fraseInicio = document.getElementById('frase-inicio');
    const textoConducir = document.getElementById('texto-conducir');
    const escenarioViaje = document.getElementById('escenario-viaje');
    const escenarioBoulevard = document.getElementById('escenario-boulevard');

    // FASE 2 ELEMENTOS
    const bgBoulevard = document.getElementById('bg-boulevard');
    const imgPersonajes = document.getElementById('img-personajes');
    const cajaPregunta = document.getElementById('caja-pregunta');
    const modalConfirmacion = document.getElementById('modal-confirmacion');
    
    // BOTONES
    const btnSi = document.getElementById('btn-si');
    const btnNo = document.getElementById('btn-no');

    let animacionIniciada = false;

    // ORQUESTADOR DE LA ANIMACIÓN
    cocheContenedor.addEventListener('click', () => {
        if (animacionIniciada) return;
        animacionIniciada = true;

        // 1. Desaparecer textos iniciales
        textoConducir.style.opacity = '0';
        fraseInicio.style.opacity = '0';
        cocheContenedor.classList.remove('coche-pulso');

        // 2. El coche arranca — pasa de largo hacia la derecha y desaparece
        setTimeout(() => {
            cocheContenedor.classList.add('carro-manejando');
        }, 400);

        // 3. Transición de Escenarios: fade out viaje, fade in Boulevard
        setTimeout(() => {
            escenarioViaje.style.opacity = '0';
            escenarioViaje.style.transition = 'opacity 1.2s';
            setTimeout(() => {
                escenarioViaje.style.display = 'none';
                escenarioBoulevard.classList.add('activa');
                bgBoulevard.classList.add('visible');
            }, 1200);
        }, 2500);

        // 4. Mostrar Personajes
        setTimeout(() => {
            imgPersonajes.classList.remove('oculto');
            imgPersonajes.classList.add('visible');
        }, 5500);

        // 5. Hacer la pregunta
        setTimeout(() => {
            cajaPregunta.classList.remove('oculto');
            cajaPregunta.classList.add('visible');
        }, 7000);
    });

    // LÓGICA BOTÓN "NO" EVASIVO
    const esquivar = () => {
        if(!btnNo.classList.contains('btn-no-evasivo')) {
            btnNo.classList.add('btn-no-evasivo');
        }

        // Limites dentro del viewport del móvil
        const viewport = document.getElementById('mobile-viewport');
        const vw = viewport ? viewport.clientWidth : window.innerWidth;
        const vh = viewport ? viewport.clientHeight : window.innerHeight;

        const maxX = vw - btnNo.clientWidth - 10;
        const maxY = vh - btnNo.clientHeight - 10;

        const randomX = Math.floor(Math.random() * maxX);
        const randomY = Math.floor(Math.random() * maxY);

        btnNo.style.left = `${Math.max(10, randomX)}px`;
        btnNo.style.top = `${Math.max(10, randomY)}px`;
    };

    btnNo.addEventListener('mouseover', esquivar);
    btnNo.addEventListener('touchstart', esquivar);
    btnNo.addEventListener('click', esquivar);

    // LÓGICA BOTÓN "SI"
    btnSi.addEventListener('click', () => {
        cajaPregunta.style.opacity = '0';
        setTimeout(() => {
            cajaPregunta.style.display = 'none';
            modalConfirmacion.classList.remove('oculto');
            modalConfirmacion.classList.add('visible');
        }, 500);
    });

});
