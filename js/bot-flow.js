// ============================================================
// CORAZÓNCÓDIGO — ASISTENTE RÁPIDO (Bot Flow)
// Flujo simplificado de 3 pasos para adultos
// ============================================================

const botModal = document.getElementById('botModal');
const btnCloseBot = document.getElementById('btnCloseBot');
const btnBotComprar = document.getElementById('btnBotComprar');
const btnTriggerFile = document.getElementById('btnTriggerFile');
const botFotoFile = document.getElementById('botFotoFile');
const botFotoName = document.getElementById('botFotoName');
const botLoading = document.getElementById('botLoading');
const botLoadingText = document.getElementById('botLoadingText');
const btnSwitchAdvanced = document.getElementById('btnSwitchAdvanced');

let currentBotTemplate = null;

function parsePlanPrice(planLabel) {
    if (typeof planLabel !== 'string') return 0;
    const match = planLabel.match(/\$([0-9]+(?:[.,][0-9]+)?)/);
    if (!match) return 0;
    return Number.parseFloat(match[1].replace(',', '.')) || 0;
}

// Mostrar modal del flujo Asistente
function openBotWizard(templateName) {
    if (typeof activeTemplateInfo !== 'undefined' && activeTemplateInfo) {
        currentBotTemplate = activeTemplateInfo;
    } else if (typeof catalogData !== 'undefined') {
        currentBotTemplate = catalogData.find(x => x.name === templateName);
    }
    
    // Limpiar campos previos
    document.getElementById('botDestino').value = '';
    document.getElementById('botMensaje').value = '';
    botFotoFile.value = '';
    botFotoName.style.display = 'none';
    botFotoName.innerText = '';
    botLoading.style.display = 'none';
    
    // Configurar plan por defecto
    const selectPlan = document.getElementById('botPlanSelect');
    if (currentBotTemplate && currentBotTemplate.badge.includes('Gratis')) {
        selectPlan.value = "Demo Gratis ($0)";
    } else {
        selectPlan.value = "Básico ($1.50)";
    }
    
    // Setear variable de datos para integrarse con checkout (para compatibilidad de backend)
    if (typeof dataForm !== 'undefined') {
        dataForm.template = currentBotTemplate ? currentBotTemplate.name : templateName;
    }

    // Dispatch analytics event
    document.dispatchEvent(new CustomEvent('corazoncodigo:botflow-opened', {
        detail: { templateName }
    }));

    if (botModal) botModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Cerrar Bot Modal
if (btnCloseBot) {
    btnCloseBot.addEventListener('click', () => {
        if (botModal) botModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
}

// Botón para ir al Modo Avanzado
if (btnSwitchAdvanced) {
    btnSwitchAdvanced.addEventListener('click', () => {
        if (botModal) botModal.classList.remove('active');
        if (typeof openCheckoutWizard === 'function' && currentBotTemplate) {
            openCheckoutWizard(currentBotTemplate.name);
        }
    });
}

// Interacción para subir archivo ocultando el feo input
if (btnTriggerFile && botFotoFile) {
    btnTriggerFile.addEventListener('click', (e) => {
        e.preventDefault();
        if (navigator.vibrate) navigator.vibrate(30);
        botFotoFile.click();
    });
    
    botFotoFile.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            botFotoName.innerText = `🖼️ Foto cargada: ${e.target.files[0].name}`;
            botFotoName.style.display = 'block';
            btnTriggerFile.style.borderColor = '#10b981';
            btnTriggerFile.style.color = 'white';
            btnTriggerFile.style.background = '#10b981';
            btnTriggerFile.innerHTML = '<i class="fa-solid fa-check"></i> Foto lista';
        }
    });
}

// SUBIDA REAL A SUPABASE STORAGE Y CREACIÓN DE ORDEN
if (btnBotComprar) {
    btnBotComprar.addEventListener('click', async () => {
        if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
        if (!currentBotTemplate) {
            if (window.showToast) window.showToast("Error", "No se detectó la plantilla elegida."); else alert("No se detectó la plantilla elegida.");
            return;
        }

        const destino = document.getElementById('botDestino').value.trim();
        const mensaje = document.getElementById('botMensaje').value.trim();
        const planSeleccionado = document.getElementById('botPlanSelect').value;
        const file = botFotoFile.files[0];
        
        if (!destino || !mensaje) {
            if (window.showToast) window.showToast("Datos incompletos", "Por favor, ingresa el destinatario y una dedicatoria."); else alert("Por favor, ingresa el destinatario y una dedicatoria.");
            return;
        }

        if (file) {
            const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                if (window.showToast) window.showToast("Archivo no válido", "Solo se permiten imágenes (JPG, PNG, WEBP, GIF)."); else alert("Solo se permiten imágenes.");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                if (window.showToast) window.showToast("Imagen muy pesada", "El tamaño máximo de la foto es de 5MB."); else alert("El tamaño máximo es 5MB.");
                return;
            }
        }

        // Mostrar Loading
        btnBotComprar.disabled = true;
        btnBotComprar.style.opacity = '0.5';
        botLoading.style.display = 'block';
        botLoadingText.innerText = file ? 'Subiendo imagen a los servidores...' : 'Procesando tu pedido mágico...';

        let imagenPublica = null;

        // Subir foto al Bucket de Supabase
        if (file && window.db) {
            try {
                const ext = file.name.split('.').pop();
                const fileName = `foto_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
                const { data, error } = await window.db.storage.from('user_uploads').upload(fileName, file);
                
                if (error) {
                    throw new Error(error.message);
                }

                // Generar Link público
                const { data: linkData } = window.db.storage.from('user_uploads').getPublicUrl(fileName);
                imagenPublica = linkData.publicUrl;
                botLoadingText.innerText = 'Foto lista. Creando tu regalo...';
                
            } catch (err) {
                console.error("Error al subir imagen:", err);
                if (window.showToast) window.showToast("Atención", "Hubo un problema procesando tu imagen. Omitiendo o intenta de nuevo."); else alert("Hubo un problema procesando tu imagen. Omitiendo o intenta de nuevo.");
            }
        }

        // Configurar los datos internamente e invocar al flujo central
        try {
            if (typeof dataForm !== 'undefined') {
                dataForm.destino = destino;
                dataForm.message = mensaje;
                dataForm.plan = planSeleccionado;
                
                // Setear imagen flotante como magia!
                if (imagenPublica) {
                    dataForm.flImg = imagenPublica;
                    dataForm.flS = "50"; // tamaño
                    dataForm.flX = "50"; // centro x
                    dataForm.flY = "50"; // centro y
                    dataForm.flT = "5"; // Aparecer luego de 5seg en el regalo
                }
            }
            
            botLoadingText.innerText = 'Redirigiendo a confirmación...';
            
            // Simular un click interno para grabar el pedido como si pasaran por todo el Checkout
            if (botModal) botModal.classList.remove('active');
            
            // Para poder lanzar el trigger de btnFinishOrder que se encuentra en checkout.js:
            const tempOrderData = {
                customer_name: destino,
                target_name: destino,
                plan_name: planSeleccionado,
                price: parsePlanPrice(planSeleccionado),
                template_id: null,
                template_name: currentBotTemplate.name,
                custom_date: '',
                custom_message: mensaje,
                photo_urls: [],
                music_url: '',
                music_start: 0,
                music_duration: 30,
                dynamic_texts: { 
                    message: mensaje, 
                    title: 'Para ' + destino,
                },
                status: 'pending'
            };

            if (imagenPublica) {
                tempOrderData.dynamic_texts.flImg = imagenPublica;
                tempOrderData.dynamic_texts.flS = "50";
                tempOrderData.dynamic_texts.flX = "50";
                tempOrderData.dynamic_texts.flY = "50";
            }

            // Ocupamos db en checkout.js
            if (window.db) {
                // Obtener ID real de template
                const { data: tData } = await window.db.from('templates').select('id').eq('slug', currentBotTemplate.id).maybeSingle();
                if (tData) tempOrderData.template_id = tData.id;

                const { data: insertData, error: insertError } = await window.db.from('orders').insert([tempOrderData]).select();
                if (insertError) throw insertError;
                
                if (insertData && insertData.length > 0) {
                    if (typeof processFinalOrder === 'function') {
                        processFinalOrder(insertData[0]);
                    }
                }
            } else {
                // Modo Contingencia Local
                if (typeof processFinalOrder === 'function') {
                    processFinalOrder({ id: 'B-001', customer_name: destino, plan_name: planSeleccionado }, true);
                }
            }

        } catch (finalError) {
            console.error("Error final", finalError);
            if (window.showToast) window.showToast("Error", "No pudimos registrar tu orden: " + finalError.message); else alert("No pudimos registrar tu orden: " + finalError.message);
        } finally {
            // Restore Modal UI
            btnBotComprar.disabled = false;
            btnBotComprar.style.opacity = '1';
            botLoading.style.display = 'none';
        }
    });
}
