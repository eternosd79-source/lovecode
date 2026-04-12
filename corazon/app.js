document.addEventListener('DOMContentLoaded', () => {

    const pantallaInicio = document.getElementById('pantalla-inicio');
    const escena3d = document.getElementById('escena-3d');
    
    const cube = document.getElementById('rubik');
    const flechaSaliendo = document.getElementById('flecha-saliendo');
    const flechaImpacto = document.getElementById('flecha-impacto');
    const textoClic = document.getElementById('texto-clic');
    
    const gridWrappers = document.querySelectorAll('.grid-wrapper');
    const tarjeta3d = document.getElementById('tarjeta-3d');
    const instruccion = document.getElementById('instruccion');

    // ARMAR CUBO INICIAL DESORDENADO 
    const coloresBasicos = ['#0045ad', '#009b48', '#ffd500', '#ffffff', '#ff5900', '#e01e37'];
    gridWrappers.forEach(wrapper => {
        for(let i=0; i<9; i++) {
            const div = document.createElement('div');
            div.style.backgroundColor = coloresBasicos[Math.floor(Math.random() * coloresBasicos.length)];
            wrapper.appendChild(div);
        }
    });

    let secuenciaIniciada = false;
    let scrambleInterval;

    pantallaInicio.addEventListener('click', () => {
        if(secuenciaIniciada) return;
        secuenciaIniciada = true;

        textoClic.style.opacity = '0'; 
        cube.classList.add('solve-anim'); // Animación de inspección natural 
        
        // SCRAMBLE DINÁMICO
        const allSquares = document.querySelectorAll('.grid-wrapper div');
        scrambleInterval = setInterval(() => {
            allSquares.forEach(sq => {
                if(Math.random() > 0.4) {
                    sq.style.backgroundColor = coloresBasicos[Math.floor(Math.random() * coloresBasicos.length)];
                }
            });
        }, 120); 

        // DETIENE SCRAMBLE A COLORES SÓLIDOS 
        setTimeout(() => {
            clearInterval(scrambleInterval); 
            const allFaces = document.querySelectorAll('.face');
            allFaces.forEach(face => {
                const squares = face.querySelectorAll('.grid-wrapper div');
                if (squares.length === 0) return; 
                
                let colorObjetivo = '#ffffff'; 
                let shadowObjetivo = 'inset 0 0 5px #ccc';

                if(face.classList.contains('top')) {
                    colorObjetivo = '#e01e37'; // ROJO
                    shadowObjetivo = 'inset 0 0 10px #800020, 0 0 5px #ff4d6d';
                } else if (face.classList.contains('front')) {
                    colorObjetivo = '#0045ad'; // AZUL
                    shadowObjetivo = 'inset 0 0 10px #001f4d';
                } else if (face.classList.contains('right')) {
                    colorObjetivo = '#ff5900'; // NARANJA
                    shadowObjetivo = 'inset 0 0 10px #802d00';
                }

                squares.forEach(sq => {
                    sq.style.backgroundColor = colorObjetivo;
                    sq.style.boxShadow = shadowObjetivo;
                });
            });
        }, 2200); 

        // ABRIR BISAGRA
        setTimeout(() => {
            cube.classList.add('caja-abierta'); 
            
            // SACAR FLECHA DE ADENTRO (Sube elegantemente hacia arriba)
            setTimeout(() => {
                // FLECHA SALE DESPEDIDA HACIA EL ESPACIO (Arriba y desapareciendo)
                setTimeout(() => {
                    flechaSaliendo.classList.add('disparada'); 
                    
                    // FUNDIDO A NEGRO ABSOLUTO: El cubo se opaca lentamente
                    setTimeout(() => {
                        pantallaInicio.style.transition = 'opacity 2.5s ease-in-out';
                        pantallaInicio.style.opacity = '0';
                        
                        // Una vez que es un vacío oscuro espectacular, se forma la magia...
                        setTimeout(() => {
                            pantallaInicio.classList.remove('activa');
                            escena3d.classList.add('activa'); 
                            
                            // Las partículas empiezan a nacer de la nada en el vacío oscuro
                            iniciarCorazonViral();

                            // Esperamos que el corazón dibuje sus delicadas paredes (aprox 3.5 segundos)
                            setTimeout(() => {
                                // APARECE LA FRASE Y EL POEMA LENTAMENTE DESDE EL VACÍO
                                document.getElementById('poema-frontal').classList.add('visible');
                                // OJO: .trasera NO se muestra aquí — solo aparece cuando el usuario gira el corazón
                                document.querySelectorAll('.cara-texto:not(.trasera)').forEach(t => t.classList.add('visible'));
                                
                                // Dejamos que lea las palabras durante 2 segundos románticos...
                                setTimeout(() => {
                                    
                                    // LA FLECHA OBJETIVO APARECE DESLIZÁNDOSE DESDE LA IZQUIERDA
                                    flechaImpacto.classList.remove('oculto');
                                    
                                    // Trigger micro-timeout para que procese el display
                                    setTimeout(() => {
                                        flechaImpacto.classList.add('clavada'); // Corre sobre el rail translateX hacia 0!

                                        // FÍSICA DE IMPACTO: timing ajustado al nuevo flechazo rápido (0.15s)
                                        setTimeout(() => {
                                            tarjeta3d.style.transform = 'scale(0.92) rotateY(3deg) rotateX(-5deg)';
                                            setTimeout(() => tarjeta3d.style.transform = '', 150);
                                        }, 160); // Coincide con fin de transición 0.15s
                                        
                                        // Ahora es seguro girar y explorarlo
                                        setTimeout(() => instruccion.classList.remove('oculto'), 2000);

                                    }, 50);

                                }, 2500); // Segundos leyendo la primera frase poética serenamente

                            }, 4000); // Segundos observando asombrado cómo se teje el corazón gigante

                        }, 2500); // Damos los 2.5s que dura el fundido negro

                    }, 500); // La flecha está ya perdiéndose en el cielo superior

                }, 1000); // 1s visualizando la flecha suspendida

            }, 1000); // Tiempo de la tapa abriéndose
        }, 3600); // Tiempo resolviendo el Rubik
    });

    // FLIP CARD LIMPIO: frente (corazón + instrucción) ↔ reverso (texto)
    let girando = false;
    tarjeta3d.addEventListener('click', () => {
        if (girando) return;
        girando = true;

        if (instruccion && !instruccion.classList.contains('oculto')) {
            instruccion.classList.add('oculto');
        }

        tarjeta3d.classList.toggle('girada');
        setTimeout(() => { girando = false; }, 950);
    });

});


// ==========================================
// MOTOR MATEMÁTICO DEL CORAZÓN (Szenia Zadvornykh)
// ==========================================
function iniciarCorazonViral() {
    var settings = {
        particles: {
            length:   350,    
            duration:   2.5,  
            velocity: 80,    
            effect: -0.75,    
            size:      22,    
        },
    };

    (function() {
        var b = 0;
        var c = ["ms", "moz", "webkit", "o"];
        for (var a = 0; a < c.length && !window.requestAnimationFrame; ++a) {
            window.requestAnimationFrame = window[c[a] + "RequestAnimationFrame"];
            window.cancelAnimationFrame = window[c[a] + "CancelAnimationFrame"] || window[c[a] + "CancelRequestAnimationFrame"]
        }
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(h, e) {
                var d = new Date().getTime();
                var f = Math.max(0, 16 - (d - b));
                var g = window.setTimeout(function() { h(d + f) }, f);
                b = d + f;
                return g
            }
        }
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(d) { clearTimeout(d) }
        }
    }());

    var Point = (function() {
        function Point(x, y) { this.x = (typeof x !== 'undefined') ? x : 0; this.y = (typeof y !== 'undefined') ? y : 0; }
        Point.prototype.clone = function() { return new Point(this.x, this.y); };
        Point.prototype.length = function(length) {
            if (typeof length == 'undefined') return Math.sqrt(this.x * this.x + this.y * this.y);
            this.normalize(); this.x *= length; this.y *= length; return this;
        };
        Point.prototype.normalize = function() {
            var length = this.length(); this.x /= length; this.y /= length; return this;
        };
        return Point;
    })();

    var Particle = (function() {
        function Particle() {
            this.position = new Point(); this.velocity = new Point(); this.acceleration = new Point(); this.age = 0;
        }
        Particle.prototype.initialize = function(x, y, dx, dy) {
            this.position.x = x; this.position.y = y; this.velocity.x = dx; this.velocity.y = dy;
            this.acceleration.x = dx * settings.particles.effect; this.acceleration.y = dy * settings.particles.effect;
            this.age = 0;
        };
        Particle.prototype.update = function(deltaTime) {
            this.position.x += this.velocity.x * deltaTime; this.position.y += this.velocity.y * deltaTime;
            this.velocity.x += this.acceleration.x * deltaTime; this.velocity.y += this.acceleration.y * deltaTime;
            this.age += deltaTime;
        };
        Particle.prototype.draw = function(context, image) {
            function ease(t) { return (--t) * t * t + 1; }
            var size = image.width * ease(this.age / settings.particles.duration);
            context.globalAlpha = 1 - this.age / settings.particles.duration;
            context.drawImage(image, this.position.x - size / 2, this.position.y - size / 2, size, size);
        };
        return Particle;
    })();

    var ParticlePool = (function() {
        var particles, firstActive = 0, firstFree = 0, duration = settings.particles.duration;
        function ParticlePool(length) {
            particles = new Array(length);
            for (var i = 0; i < particles.length; i++) particles[i] = new Particle();
        }
        ParticlePool.prototype.add = function(x, y, dx, dy) {
            particles[firstFree].initialize(x, y, dx, dy);
            firstFree++;
            if (firstFree == particles.length) firstFree = 0;
            if (firstActive == firstFree) firstActive++;
            if (firstActive == particles.length) firstActive = 0;
        };
        ParticlePool.prototype.update = function(deltaTime) {
            var i;
            if (firstActive < firstFree) { for (i = firstActive; i < firstFree; i++) particles[i].update(deltaTime); }
            if (firstFree < firstActive) {
                for (i = firstActive; i < particles.length; i++) particles[i].update(deltaTime);
                for (i = 0; i < firstFree; i++) particles[i].update(deltaTime);
            }
            while (particles[firstActive].age >= duration && firstActive != firstFree) {
                firstActive++; if (firstActive == particles.length) firstActive = 0;
            }
        };
        ParticlePool.prototype.draw = function(context, image) {
            var i;
            if (firstActive < firstFree) { for (i = firstActive; i < firstFree; i++) particles[i].draw(context, image); }
            if (firstFree < firstActive) {
                for (i = firstActive; i < particles.length; i++) particles[i].draw(context, image);
                for (i = 0; i < firstFree; i++) particles[i].draw(context, image);
            }
        };
        return ParticlePool;
    })();

    (function(canvas) {
        var context = canvas.getContext('2d'),
            particles = new ParticlePool(settings.particles.length),
            particleRate = settings.particles.length / settings.particles.duration, 
            time;

        function pointOnHeart(t) {
            // Corazón más pequeño para que la flecha y los textos queden bien visibles en mobile
            var baseWidth = Math.min(window.innerWidth * 0.38, 190); 
            var scale = baseWidth / 380; 

            return new Point(
                (190 * scale * Math.pow(Math.sin(t), 3)),
                (155 * scale * Math.cos(t) - 60 * scale * Math.cos(2 * t) - 24 * scale * Math.cos(3 * t) - 12 * scale * Math.cos(4 * t) + 30 * scale)
            );
        }

        var image = (function() {
            var canvas = document.createElement('canvas'), context = canvas.getContext('2d');
            canvas.width = settings.particles.size; canvas.height = settings.particles.size;
            function to(t) {
                var point = pointOnHeart(t);
                point.x = settings.particles.size / 2 + point.x * settings.particles.size / 350;
                point.y = settings.particles.size / 2 - point.y * settings.particles.size / 350;
                return point;
            }
            context.beginPath();
            var t = -Math.PI; var point = to(t); context.moveTo(point.x, point.y);
            while (t < Math.PI) { t += 0.01; point = to(t); context.lineTo(point.x, point.y); }
            context.closePath();
            context.fillStyle = '#ff1493'; 
            context.fill();
            var image = new Image(); image.src = canvas.toDataURL();
            return image;
        })();

        function render() {
            requestAnimationFrame(render);
            var newTime = new Date().getTime() / 1000, deltaTime = newTime - (time || newTime);
            time = newTime;

            context.clearRect(0, 0, canvas.width, canvas.height);

            var amount = particleRate * deltaTime;
            for (var i = 0; i < amount; i++) {
                var pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
                var dir = pos.clone().length(settings.particles.velocity);
                particles.add(canvas.width / 2 + pos.x, canvas.height / 2 - pos.y, dir.x, -dir.y);
            }

            particles.update(deltaTime);
            particles.draw(context, image);
        }

        function onResize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        setTimeout(function() {
            onResize();
            render();
        }, 10);
        window.addEventListener('resize', onResize);

    })(document.getElementById('corazonCanvas'));
}