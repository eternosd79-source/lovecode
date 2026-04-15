/**
 * CorazónCódigo - Personalizador Universal
 * Este script lee parámetros de la URL y personaliza la animación.
 * Soporta: 
 *   ?para=Nombre (Personalización directa por URL)
 *   ?orderId=ID (Carga datos desde Supabase)
 */
(function() {
    // 0. Crear pantalla de carga y sistema de modales elegante inmediatamente
    const modalCSS = `
        <style>
            @keyframes lc-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            @keyframes lc-pulse { 0% { transform: scale(1); } 50% { transform: scale(1.08); } 100% { transform: scale(1); } }
            .lc-modal-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:1000000; display:flex; justify-content:center; align-items:center; opacity:0; visibility:hidden; transition:all 0.3s ease; backdrop-filter: blur(5px); }
            .lc-start-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(5,0,5,0.9); z-index:999998; display:none; justify-content:center; align-items:center; flex-direction:column; cursor:pointer; opacity:1; transition: opacity 0.6s ease; backdrop-filter: blur(8px); }
            .lc-start-btn { background: linear-gradient(45deg, #ff2d75, #ff4b8b); color:white; border:none; padding:18px 35px; font-size:1.2rem; border-radius:30px; cursor:pointer; font-family:sans-serif; font-weight:bold; box-shadow: 0 10px 30px rgba(255,45,117,0.4); animation: lc-pulse 2s infinite; pointer-events:none; }
            .lc-modal-overlay.active { opacity:1; visibility:visible; }
            .lc-modal-content { background:#0f0f12; border:1px solid #06b6d4; padding:30px; border-radius:16px; max-width:350px; width:90%; text-align:center; transform:scale(0.8); transition:all 0.3s ease; box-shadow: 0 0 20px rgba(6,182,212,0.2); }
            .lc-modal-overlay.active .lc-modal-content { transform:scale(1); }
            .lc-modal-icon { font-size:3rem; color:#06b6d4; margin-bottom:15px; }
            .lc-modal-title { color:white; font-family:sans-serif; margin-bottom:10px; font-size:1.2rem; }
            .lc-modal-text { color:#aaa; font-family:sans-serif; font-size:0.9rem; margin-bottom:25px; line-height:1.4; }
            .lc-modal-btns { display:flex; gap:10px; }
            .lc-modal-btn { flex:1; padding:12px; border-radius:8px; border:none; cursor:pointer; font-weight:bold; font-family:sans-serif; transition: opacity 0.2s; }
            .lc-modal-btn-ok { background:#06b6d4; color:#000; }
            .lc-modal-btn-cancel { background:rgba(255,255,255,0.1); color:white; }
            .lc-modal-btn:hover { opacity:0.8; }
        </style>
    `;

    const loadingHTML = `
        <div id="corazoncodigo-loader" style="position:fixed; top:0; left:0; width:100%; height:100%; background:#050005; z-index:999999; display:flex; flex-direction:column; justify-content:center; align-items:center; transition: opacity 0.8s ease;">
            <div style="width:50px; height:50px; border:3px solid rgba(255,255,255,0.1); border-top:3px solid #ff2d75; border-radius:50%; animation: lc-spin 1s linear infinite;"></div>
            <p style="color:white; font-family:sans-serif; margin-top:15px; letter-spacing:2px; font-size:0.8rem; opacity:0.7;">PREPARANDO TU REGALO...</p>
        </div>
        <div id="corazoncodigo-start-overlay" class="lc-start-overlay">
            <button class="lc-start-btn">Toca para Abrir tu Regalo ✨</button>
            <p style="color:white; margin-top:20px; font-family:sans-serif; opacity:0.7; font-size: 0.9rem; letter-spacing:1px;">Enciende la magia y el sonido</p>
        </div>
        <div id="lc-custom-modal" class="lc-modal-overlay">
            <div class="lc-modal-content">
                <div class="lc-modal-icon">?</div>
                <h3 class="lc-modal-title" id="lc-modal-title">¿Continuar?</h3>
                <p class="lc-modal-text" id="lc-modal-text"></p>
                <div class="lc-modal-btns">
                    <button class="lc-modal-btn lc-modal-btn-cancel" id="lc-modal-btn-cancel" style="display:none;">Cancelar</button>
                    <button class="lc-modal-btn lc-modal-btn-ok" id="lc-modal-btn-ok">Aceptar</button>
                </div>
            </div>
        </div>
    `;
    
    if (document.body) {
        document.body.insertAdjacentHTML('afterbegin', modalCSS + loadingHTML);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            document.body.insertAdjacentHTML('afterbegin', modalCSS + loadingHTML);
        });
    }

    // --- OVERRIDE ALERT Y CONFIRM ---
    window.alert = function(msg) {
        const modal = document.getElementById('lc-custom-modal');
        document.getElementById('lc-modal-title').innerText = "Aviso";
        document.getElementById('lc-modal-text').innerText = msg;
        document.getElementById('lc-modal-btn-cancel').style.display = 'none';
        document.getElementById('lc-modal-btn-ok').onclick = () => modal.classList.remove('active');
        modal.classList.add('active');
    };

    window.confirm = function(msg) {
        // Confirm nativo es sincrónico (detiene el hilo), pero en web moderna 
        // lo mejor es usar callbacks o promesas. Para no romper los códigos viejos,
        // avisaremos que este confirm ahora es visual.
        console.warn("CorazónCódigo: Se detectó un confirm(). Por seguridad visual, se muestra el modal estilizado.");
        const modal = document.getElementById('lc-custom-modal');
        document.getElementById('lc-modal-title').innerText = "Confirmación";
        document.getElementById('lc-modal-text').innerText = msg;
        document.getElementById('lc-modal-btn-cancel').style.display = 'block';
        
        return new Promise((resolve) => {
            document.getElementById('lc-modal-btn-ok').onclick = () => {
                modal.classList.remove('active');
                resolve(true);
            };
            document.getElementById('lc-modal-btn-cancel').onclick = () => {
                modal.classList.remove('active');
                resolve(false);
            };
            modal.classList.add('active');
        });
    };

    const supabaseUrl = 'https://qmnbcmioylgmcbzqrjiv.supabase.co';
    const supabaseKey = 'sb_publishable_AZWTMqB-hCTA_Oiiu0juAQ_LRyE9gcc';
    
    const urlParams = new URLSearchParams(window.location.search);
    const para = urlParams.get('para');
    // Soportar ambos parámetros: ?id= (tabla Pedidos/token) y ?orderId= (tabla orders/UUID)
    const orderId = urlParams.get('orderId') || urlParams.get('id');
    const directMsg = urlParams.get('msg');
    const directDate = urlParams.get('fecha');
    const directMusic = urlParams.get('musica');
    let mStart = urlParams.get('mStart');
    let mDur = urlParams.get('mDur');

    // Soporte para fotos directas por URL (foto1, foto2, etc.)
    const directPhotos = [];
    for (let i = 1; i <= 10; i++) {
        const f = urlParams.get(`foto${i}`);
        if (f) directPhotos.push(f);
    }

    function removeLoader() {
        const loader = document.getElementById('corazoncodigo-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
            }, 800);
        }
    }

    // Espera activa hasta que la librería de Supabase esté disponible en la página
    function waitForSupabase(timeout = 8000) {
        return new Promise((resolve) => {
            if (typeof supabase !== 'undefined' && supabase.createClient) {
                return resolve(true);
            }
            const start = Date.now();
            const interval = setInterval(() => {
                if (typeof supabase !== 'undefined' && supabase.createClient) {
                    clearInterval(interval);
                    resolve(true);
                } else if (Date.now() - start > timeout) {
                    clearInterval(interval);
                    console.warn('⚠️ Supabase no cargó a tiempo. Modo sin base de datos.');
                    resolve(false);
                }
            }, 100);
        });
    }

    async function applyPersonalization() {
        try {
            let customData = {
                para: para,
                mensaje: directMsg,
                fecha: directDate,
                fotos: [],
                musica: directMusic
            };

            const supabaseReady = await waitForSupabase();
            if (orderId && supabaseReady) {
                try {
                    const db = supabase.createClient(supabaseUrl, supabaseKey);

                    // 1. Buscar en tabla 'Pedidos' por token — solo columnas existentes
                    let encontrado = false;
                    try {
                        const { data: pedido, error: errPed } = await db
                            .from('Pedidos')
                            .select('token, tipo_plantilla, mensaje')
                            .eq('token', orderId)
                            .maybeSingle();

                        if (pedido && !errPed) {
                            encontrado = true;
                            if (pedido.mensaje) customData.mensaje = pedido.mensaje;
                            console.log('✅ Pedido en Pedidos:', pedido.token, '| Plantilla:', pedido.tipo_plantilla);
                        }
                    } catch (e) { /* Pedidos sin acceso — continuar */ }

                    // 2. Si no encontró en Pedidos, buscar en 'orders' (sistema oficial)
                    if (!encontrado) {
                        try {
                            const { data: order, error: errOrd } = await db
                                .from('orders')
                                .select('target_name, custom_message, custom_date, photo_urls, music_url, music_slice, dynamic_texts')
                                .or(`id.eq.${orderId},id.ilike.${orderId}%`)
                                .maybeSingle();

                            if (order && !errOrd) {
                                encontrado = true;
                                customData.para    = order.target_name    || customData.para;
                                customData.mensaje = order.custom_message || customData.mensaje;
                                customData.fecha   = order.custom_date    || customData.fecha;
                                customData.fotos   = order.photo_urls     || [];
                                customData.musica  = order.music_url      || customData.musica;

                                if (order.music_slice) {
                                    mStart = order.music_slice.start    !== undefined ? order.music_slice.start    : mStart;
                                    mDur   = order.music_slice.duration !== undefined ? order.music_slice.duration : mDur;
                                }
                                if (order.dynamic_texts) {
                                    for (const [key, value] of Object.entries(order.dynamic_texts)) {
                                        const elById = document.getElementById(key);
                                        if (elById) elById.innerText = value;
                                        document.querySelectorAll(`.${key}`).forEach(el => el.innerText = value);
                                    }
                                }
                                console.log('✅ Pedido en orders:', orderId);
                            }
                        } catch (e) { /* orders no existe — continuar */ }
                    }

                    if (!encontrado) console.warn('⚠️ No se encontró pedido con ID:', orderId);
                } catch (e) { console.error('Error Supabase:', e); }
            }

            window.ccData = customData;

            if (customData.para) {
                const elements = ['loveText', 'cl1', 'phraseTop', 'mainTitle', 'targetName', 'msgLove'];
                elements.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.innerText = customData.para;
                });
                document.querySelectorAll('.personalizar-nombre, .target-name, .title').forEach(el => {
                    if (el.innerText.length < 50) el.innerText = customData.para;
                });
            }

            if (customData.mensaje) {
                const frases = customData.mensaje.split('\n').filter(f => f.trim() !== "");
                if (typeof pairs !== 'undefined' && frases.length > 0) {
                    window.pairs = frases.map(f => ({ top: f, bot: "" }));
                }
                const msgEls = ['heartCaption', 'final-verse', 'intro-sub', 'phraseBot', 'heart-caption'];
                msgEls.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.innerText = customData.mensaje;
                });
                document.querySelectorAll('.personalizar-mensaje, .message, .poem-container p, .dedicatoria').forEach(el => {
                    el.innerText = customData.mensaje;
                });
            }

            if (customData.fecha) {
                if (typeof window.updateChronometerDate === 'function') {
                    window.updateChronometerDate(customData.fecha);
                }
                document.querySelectorAll('.fecha-aniversario, .date-display').forEach(el => {
                    el.innerText = customData.fecha;
                });
            }

            // 4. Aplicar Textos Genéricos (Cualquier parámetro que empiece con txt_)
            for (const [key, value] of urlParams.entries()) {
                if (key.startsWith('txt_')) {
                    const targetId = key.replace('txt_', '');
                    console.log(`Buscando elemento para personalización dinámica: ${targetId}`);
                    
                    // Buscar por ID
                    const elById = document.getElementById(targetId);
                    if (elById) {
                        elById.innerText = value;
                        continue;
                    }

                    // Buscar por Clase
                    const elsByClass = document.querySelectorAll(`.${targetId}`);
                    if (elsByClass.length > 0) {
                        elsByClass.forEach(el => el.innerText = value);
                        continue;
                    }

                    // Buscar por Atributo Name (útil para inputs si los hubiera)
                    const elsByName = document.querySelectorAll(`[name="${targetId}"]`);
                    if (elsByName.length > 0) {
                        elsByName.forEach(el => {
                            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = value;
                            else el.innerText = value;
                        });
                    }
                }
            }

            // 5. Aplicar Música (Inyectar Audio)
            if (customData.musica) {
                let audio = new Audio();
                audio.loop = false; // Manejaremos el bucle manualmente para respetar el recorte
                audio.volume = 1.0;

                const startS = parseFloat(mStart) || 0;
                const durS = parseFloat(mDur) || 0;
                const endS = startS + durS;

                const setStartTime = () => {
                    if (startS > 0) audio.currentTime = startS;
                };

                // Carga optimizada y anti-fallos (Blob proxy bypasses un-seekable servers)
                fetch(customData.musica)
                    .then(res => res.blob())
                    .then(blob => {
                        audio.src = URL.createObjectURL(blob);
                        audio.load();
                    })
                    .catch(() => {
                        audio.src = customData.musica; // Fallback
                        audio.load();
                    });

                if (audio.readyState >= 1) {
                    setStartTime();
                } else {
                    audio.addEventListener('loadedmetadata', setStartTime);
                }

                document.addEventListener('click', () => {
                    audio.play().catch(e => console.log("Audio bloqueado:", e));
                }, { once: true });

                // Recorte exacto: La música se DETIENE al terminar el segmento seleccionado
                audio.addEventListener('timeupdate', () => {
                    if (durS > 0 && audio.currentTime >= endS) {
                        audio.pause();
                    }
                });
            }

            // 6. Aplicar Fotos
            // Combinar fotos de Supabase con fotos directas por URL
            const allPhotos = [...customData.fotos, ...directPhotos];

            if (allPhotos.length > 0) {
                console.log("Inyectando fotos personalizadas:", allPhotos.length);
                
                // Selectores de imagen estándar
                const imgSelectors = [
                    '.user-photo', 
                    '.couple-photo', 
                    '.dynamic-img', 
                    '.photo-slot', 
                    'img[src*="thumb.png"]',
                    'img[src*="foto.jpg"]',
                    'img[src*="personaje.png"]',
                    '#img-personajes',
                    '#userPhoto'
                ];

                const imgElements = document.querySelectorAll(imgSelectors.join(', '));
                
                imgElements.forEach((img, idx) => {
                    // Si tenemos suficientes fotos, las asignamos una a una. 
                    // Si no, repetimos la última o la primera.
                    const photoUrl = allPhotos[idx % allPhotos.length];
                    if (photoUrl) {
                        img.src = photoUrl;
                        // Quitar clases de error si existieran
                        img.classList.remove('no-photo');
                        if (img.parentElement) img.parentElement.classList.remove('no-photo');
                    }
                });

                // Soporte para fondos (Background Images)
                const bgSelectors = ['.user-photo-bg', '.photo-bg', '.dynamic-bg'];
                const bgElements = document.querySelectorAll(bgSelectors.join(', '));
                bgElements.forEach((el, idx) => {
                    const photoUrl = allPhotos[idx % allPhotos.length];
                    if (photoUrl) {
                        el.style.backgroundImage = `url('${photoUrl}')`;
                        el.style.backgroundSize = 'cover';
                        el.style.backgroundPosition = 'center';
                    }
                });
            }

            // 7. Aplicar Foto Flotante Global (Remplaza textos)
            // Se lee de Supabase (dynamic_texts) o de los URLSearchParams
            const orderDyn = window.ccData && window.ccData.orderData ? window.ccData.orderData.dynamic_texts : null;
            const tempOrder = typeof order !== 'undefined' ? order : null;
            const dynSource = (tempOrder && tempOrder.dynamic_texts) ? tempOrder.dynamic_texts : null;
            
            const flImgUrl = urlParams.get('flImg') || (dynSource && dynSource.flImg);
            
            if (flImgUrl && flImgUrl.trim() !== '') {
                console.log("Inyectando Foto Flotante:", flImgUrl);
                const flS = urlParams.get('flS') || (dynSource && dynSource.flS) || 40;
                const flX = urlParams.get('flX') || (dynSource && dynSource.flX) || 50;
                const flY = urlParams.get('flY') || (dynSource && dynSource.flY) || 50;
                const flT = urlParams.get('flT') || urlParams.get('flTime') || (dynSource && dynSource.flT) || 0;
                
                const flImgNode = document.createElement('img');
                flImgNode.src = flImgUrl;
                flImgNode.style.position = 'fixed';
                flImgNode.style.left = flX + '%';
                flImgNode.style.top = flY + '%';
                // Usamos vmin para que el tamaño coincida EXACTAMENTE con la lógica del editor (Math.min(canvasW, canvasH))
                flImgNode.style.width = flS + 'vmin';
                flImgNode.style.height = flS + 'vmin';
                flImgNode.style.transform = 'translate(-50%, -50%)';
                flImgNode.style.zIndex = '999999';
                flImgNode.style.pointerEvents = 'auto'; 
                flImgNode.style.borderRadius = '15px';
                flImgNode.style.boxShadow = '0 10px 40px rgba(0,0,0,0.8)';
                flImgNode.style.border = '2px solid rgba(255,255,255,0.2)';
                flImgNode.style.objectFit = 'contain'; // Contener la imagen para mostrarla completa sin recortes
                flImgNode.style.transition = 'opacity 1s ease-in-out';
                flImgNode.style.opacity = '0';
                
                document.body.appendChild(flImgNode);

                // Aparecer imagen suavemente según el tiempo flT
                const delayMs = parseFloat(flT) * 1000;
                setTimeout(() => {
                    flImgNode.style.opacity = '1';
                }, delayMs);
                
                // Ocultar textos base porque la premisa es "Reemplaza los textos"
                document.querySelectorAll('.poem-container, .dynamic-text, .dedicatoria, .message-box').forEach(el => el.style.opacity = '0');
            }
            
        } catch (err) {
            console.error("Error en personalización:", err);
        } finally {
            setTimeout(() => {
                const isLivePreview = urlParams.get('editorLivePreview') === 'true';
                const startOverlay = document.getElementById('corazoncodigo-start-overlay');
                
                if (isLivePreview) {
                    // Modo editor: ocultar todo de inmediato y simular clic para arrancar el CSS
                    if (startOverlay) startOverlay.style.display = 'none';
                    removeLoader();
                    // Simular clic en body para iniciar cualquier animación nativa sin afectar audio (se recomienda silenciar si se puede)
                    if (typeof audio !== 'undefined' && audio) audio.muted = true;
                    setTimeout(() => document.body.click(), 100);
                } else {
                    // Flujo normal de regalo web
                    if (startOverlay) {
                        startOverlay.style.display = 'flex';
                        startOverlay.addEventListener('click', () => {
                            startOverlay.style.opacity = '0';
                            setTimeout(() => {
                                if (startOverlay.parentNode) startOverlay.parentNode.removeChild(startOverlay);
                            }, 600);
                        });
                    }
                    removeLoader();
                }
            }, 600);
        }
    }

    // Seguridad extra: Si después de 5 segundos el loader sigue ahí, quitarlo a la fuerza
    setTimeout(removeLoader, 5000);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyPersonalization);
    } else {
        applyPersonalization();
    }
})();