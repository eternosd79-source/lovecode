// ============================================================
// CORAZÓNCÓDIGO — CHECKOUT WIZARD (4 pasos de personalización)
// ============================================================

const modal              = document.getElementById('checkoutModal');
const btnCloseWizard     = document.getElementById('btnCloseWizard');
const lblSelectedTemplate = document.getElementById('lblSelectedTemplate');
const btnNext            = document.getElementById('btnNext');
const btnPrev            = document.getElementById('btnPrev');
const btnPreviewCustom   = document.getElementById('btnPreviewCustom');
const steps              = document.querySelectorAll('.wizard-step');
const dots               = document.querySelectorAll('.step-dot');
const progressBar        = document.getElementById('progressBar');

const grpPhotos      = document.getElementById('grpPhotos');
const grpMusic       = document.getElementById('grpMusic');
const multimediaDesc = document.getElementById('multimediaDesc');

let currentStep = 1;
const totalSteps = 4;

// -------------------------------------------------------
// Sistema de Confirmación estilizado (reemplaza alert)
// -------------------------------------------------------
const confirmModal   = document.getElementById('confirmModal');
const confirmTitle   = document.getElementById('confirmTitle');
const confirmMessage = document.getElementById('confirmMessage');
const btnConfirmOk   = document.getElementById('btnConfirmOk');
const btnConfirmCancel = document.getElementById('btnConfirmCancel');
let confirmCallback  = null;

function showConfirm(title, message, callback) {
    if (!confirmModal) { if (confirm(message)) callback(); return; }
    confirmTitle.innerText   = title;
    confirmMessage.innerText = message;
    confirmCallback = callback;
    confirmModal.classList.add('active');
}

if (btnConfirmOk) {
    btnConfirmOk.addEventListener('click', () => {
        confirmModal.classList.remove('active');
        if (confirmCallback) confirmCallback();
    });
}
if (btnConfirmCancel) {
    btnConfirmCancel.addEventListener('click', () => {
        confirmModal.classList.remove('active');
        confirmCallback = null;
    });
}

// -------------------------------------------------------
// Abrir Wizard
// -------------------------------------------------------
function openCheckoutWizard(templateName) {
    if (lblSelectedTemplate) lblSelectedTemplate.innerText = templateName;
    dataForm.template = templateName;

    // Dispatch analytics event
    document.dispatchEvent(new CustomEvent('corazoncodigo:checkout-opened', {
        detail: { templateId: activeTemplateInfo?.id, templateName }
    }));

    const container = document.getElementById('dynamicTextContainer');
    if (container && activeTemplateInfo) {
        container.innerHTML = "";
        const fields = activeTemplateInfo.editableTexts || [
            { id: "title",   label: "Título Principal",   default: activeTemplateInfo.name },
            { id: "message", label: "Mensaje / Dedicatoria", default: activeTemplateInfo.textRef || "", type: "textarea" }
        ];
        fields.forEach(field => {
            const group = document.createElement('div');
            group.className = 'form-group';
            group.style.marginBottom = "15px";
            const label = document.createElement('label');
            label.innerText = field.label + ":";
            group.appendChild(label);
            if (field.type === "textarea") {
                const ta = document.createElement('textarea');
                ta.id = `dyn_${field.id}`; ta.className = 'form-input'; ta.rows = 3; ta.value = field.default || "";
                group.appendChild(ta);
            } else {
                const inp = document.createElement('input');
                inp.id = `dyn_${field.id}`; inp.type = 'text'; inp.className = 'form-input'; inp.value = field.default || "";
                group.appendChild(inp);
            }
            container.appendChild(group);
        });
    }

    const optGratis = document.getElementById('optGratis');
    if (activeTemplateInfo && activeTemplateInfo.badge.includes('Gratis')) {
        if (optGratis) optGratis.style.display = 'block';
    } else {
        if (optGratis) optGratis.style.display = 'none';
        const basicRadio = document.querySelector('input[name="planType"][value*="Básico"]');
        if (basicRadio) basicRadio.checked = true;
    }

    resetWizard();
    if (modal) modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function resetWizard()     { currentStep = 1; updateWizardUI(); }
function goToNextStep()    { if (currentStep < totalSteps) { currentStep++; updateWizardUI(); } }

function updateWizardUI() {
    steps.forEach((step, idx) => {
        step.classList.toggle('active', idx === currentStep - 1);
    });
    dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx <= currentStep - 1);
    });
    if (progressBar) progressBar.style.width = (currentStep * 25) + "%";
    if (btnPrev && btnNext) {
        btnPrev.style.visibility = currentStep === 1 ? "hidden" : "visible";
        btnNext.style.display    = currentStep === totalSteps ? "none" : "block";
    }
}

// Cerrar Wizard
if (btnCloseWizard) {
    btnCloseWizard.addEventListener('click', () => {
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
}

// -------------------------------------------------------
// Previa Personalizada (desde Wizard Paso 2)
// -------------------------------------------------------
if (btnPreviewCustom) {
    btnPreviewCustom.addEventListener('click', () => {
        if (!activeTemplateInfo) return;
        const dateVal = document.getElementById('inpDate') ? document.getElementById('inpDate').value : "";
        let finalPath = activeTemplateInfo.path;
        let params = new URLSearchParams();

        if (activeTemplateInfo.editableTexts) {
            activeTemplateInfo.editableTexts.forEach(field => {
                const el = document.getElementById(`dyn_${field.id}`);
                if (el) { const val = el.value.trim(); if (val) params.append(`txt_${field.id}`, val); }
            });
        }
        if (dateVal) params.append('fecha', dateVal);

        // -- NUEVO: Procesar Imagen Flotante --
        const chkFloat = document.getElementById('chkUseFloatImg');
        if (chkFloat && chkFloat.checked) {
            const url = document.getElementById('flImgUrl').value.trim();
            if (url) {
                params.append('flImg', url);
                params.append('flS', document.getElementById('flImgS').value);
                params.append('flX', document.getElementById('flImgX').value);
                params.append('flY', document.getElementById('flImgY').value);
                params.append('flT', document.getElementById('flImgT') ? document.getElementById('flImgT').value : '0');
            }
        }

        // Capturar el valor más reciente del selector de música (Para que funcione estando aún en el Paso 3)
        const selMusic = document.getElementById('selMusic');
        let liveMusicUrl = dataForm.musicUrl;
        if (selMusic && selMusic.value) {
            liveMusicUrl = (selMusic.value === 'custom') 
                            ? (document.getElementById('inpMusic') ? document.getElementById('inpMusic').value : "") 
                            : selMusic.value;
        }

        if (liveMusicUrl) {
            let mFinal = liveMusicUrl;
            if (!mFinal.startsWith('http')) mFinal = "../" + mFinal;
            params.append('musica', mFinal);
            if (dataForm.musicStart)    params.append('mStart', dataForm.musicStart);
            if (dataForm.musicDuration) params.append('mDur', dataForm.musicDuration);
        }

        const queryString = params.toString();
        if (queryString) finalPath += (finalPath.includes('?') ? '&' : '?') + queryString;

        if (prevTitle)       prevTitle.innerText = "Vista Previa Personalizada: " + activeTemplateInfo.name;
        if (prevOriginalText) prevOriginalText.innerText = "Mostrando tus cambios aplicados...";
        if (previewIframe)   previewIframe.src = finalPath;
        if (btnPreviewToBuy) btnPreviewToBuy.style.display = "none";
        if (previewModal)    previewModal.classList.add('active');
    });
}

// -------------------------------------------------------
// Listener Siguiente (con validaciones por paso)
// -------------------------------------------------------
if (btnNext) {
    btnNext.addEventListener('click', () => {
        if (currentStep === 1) {
            let selectedRadio = document.querySelector('input[name="planType"]:checked');
            if (!selectedRadio) { alert("Por favor selecciona un plan para continuar."); return; }
            dataForm.plan = selectedRadio.value;

            const grpDate = document.getElementById('grpDate');
            if (grpDate) grpDate.style.display = (activeTemplateInfo && activeTemplateInfo.hasDate) ? "block" : "none";

            const grpTextosBase = document.getElementById('grpTextosBase');
            const grpFloatToggle = document.getElementById('grpFloatImageToggle');
            const msgGratis     = document.getElementById('msgGratisRestriccion');
            
            if (dataForm.plan.includes("$0") || dataForm.plan.includes("$3")) {
                if (grpTextosBase) grpTextosBase.style.display = 'none';
                if (grpFloatToggle) grpFloatToggle.style.display = 'none';
                if (msgGratis)     msgGratis.style.display = 'block';
            } else {
                if (grpTextosBase) grpTextosBase.style.display = 'block';
                if (grpFloatToggle) grpFloatToggle.style.display = 'block';
                if (msgGratis)     msgGratis.style.display = 'none';
            }

            if (dataForm.plan.includes("$3") || dataForm.plan.includes("$0")) {
                if (grpMusic)       grpMusic.style.display  = "none";
                if (multimediaDesc) multimediaDesc.innerText = "Este plan no incluye modificaciones de música.";
            } else if (dataForm.plan.includes("$4.50") || dataForm.plan.includes("$5")) {
                if (grpMusic)       grpMusic.style.display  = "none";
                if (multimediaDesc) multimediaDesc.innerText = "Este plan no incluye opciones de música. Solo puedes editar el texto o foto en el paso anterior.";
            } else {
                if (grpMusic)       grpMusic.style.display  = "block";
                if (multimediaDesc) multimediaDesc.innerText = "Elige una canción de nuestra lista para que suene de fondo.";
            }
            goToNextStep();

        } else if (currentStep === 2) {
            const finalTarget = document.getElementById('inpDestino') ? document.getElementById('inpDestino').value : "";
            const msg   = document.getElementById('inpMessage') ? document.getElementById('inpMessage').value : "";
            const dateVal = document.getElementById('inpDate')   ? document.getElementById('inpDate').value   : "";

            // Guardar datos Base
            dataForm.destino = finalTarget;
            dataForm.date    = dateVal;
            dataForm.message = msg;
            
            // Guardar Formato de Imagen Flotante
            const chkFloat = document.getElementById('chkUseFloatImg');
            if (chkFloat && chkFloat.checked) {
                dataForm.flImg = document.getElementById('flImgUrl').value.trim();
                dataForm.flS   = document.getElementById('flImgS').value;
                dataForm.flX   = document.getElementById('flImgX').value;
                dataForm.flY   = document.getElementById('flImgY').value;
                dataForm.flT   = document.getElementById('flImgT') ? document.getElementById('flImgT').value : '0';
            } else {
                dataForm.flImg = null;
            }
            
            goToNextStep();

        } else if (currentStep === 3) {
            // Se omiten fotos aquí, ahora solo Música
            const selMusic = document.getElementById('selMusic');
            let mUrl = "";
            if (selMusic && selMusic.value === 'custom') {
                mUrl = document.getElementById('inpMusic') ? document.getElementById('inpMusic').value : "";
            } else if (selMusic && selMusic.value !== "") {
                mUrl = selMusic.value;
            }
            dataForm.musicUrl      = mUrl;
            if (document.getElementById('musicStart')) {
                dataForm.musicStart = document.getElementById('musicStart').value;
            } else {
                dataForm.musicStart = dataForm.musicStart || 0;
            }

            if (document.getElementById('musicDuration')) {
                dataForm.musicDuration = document.getElementById('musicDuration').value;
            } else {
                dataForm.musicDuration = dataForm.musicDuration || 30;
            }

            if (document.getElementById('sumTemplate')) document.getElementById('sumTemplate').innerText = dataForm.template;
            if (document.getElementById('sumPlan'))     document.getElementById('sumPlan').innerText     = dataForm.plan;
            goToNextStep();
        }
    });
}

if (btnPrev) {
    btnPrev.addEventListener('click', () => {
        if (currentStep > 1) { currentStep--; updateWizardUI(); }
    });
}

// -------------------------------------------------------
// Tabs de pago Ecuador / Mundo
// -------------------------------------------------------
const btnTabEcuador = document.getElementById('btnTabEcuador');
const btnTabMundo   = document.getElementById('btnTabMundo');
const payEcuador    = document.getElementById('payEcuador');
const payMundo      = document.getElementById('payMundo');

if (btnTabEcuador) {
    btnTabEcuador.addEventListener('click', () => {
        btnTabEcuador.classList.add('active');
        if (btnTabMundo) btnTabMundo.classList.remove('active');
        if (payEcuador) payEcuador.style.display = 'block';
        if (payMundo)   payMundo.style.display   = 'none';
    });
}
if (btnTabMundo) {
    btnTabMundo.addEventListener('click', () => {
        btnTabMundo.classList.add('active');
        if (btnTabEcuador) btnTabEcuador.classList.remove('active');
        if (payMundo)   payMundo.style.display   = 'block';
        if (payEcuador) payEcuador.style.display = 'none';
    });
}

// -------------------------------------------------------
// Helper: duración de plan en horas (usado localmente para display)
// -------------------------------------------------------
function getPlanDurationHours(planName) {
    if (!planName) return 336;
    if (planName.includes('$0') || /demo|gratis/i.test(planName)) return 24;
    if (planName.includes('$3') || /básico|basico/i.test(planName))  return 336;
    if (planName.includes('$4.50') || /hub|membresía/i.test(planName)) return 1800;
    if (planName.includes('$5') || /fotografías|personalizado/i.test(planName)) return 1800;
    if (planName.includes('$7') || /ultra/i.test(planName)) return 4320;
    return 336;
}

// -------------------------------------------------------
// Generar Pedido → Supabase + WhatsApp
// -------------------------------------------------------
const btnFinishOrder = document.getElementById('btnFinishOrder');
if (btnFinishOrder) {
    btnFinishOrder.addEventListener('click', async () => {
        if (!activeTemplateInfo) {
            alert("Error: No se detectó la plantilla seleccionada. Por favor cierra y vuelve a intentar.");
            return;
        }

        const tempId = "LC-" + Math.random().toString(36).substr(2, 6).toUpperCase();
        let price = 0;
        try {
            const priceMatch = dataForm.plan.match(/\$(\d+(\.\d+)?)/);
            if (priceMatch) price = parseFloat(priceMatch[1]);
        } catch (e) {}

        if (db) {
            try {
                let templateUUID = null;
                try {
                    const { data: tData, error: tErr } = await db.from('templates')
                        .select('id').eq('slug', activeTemplateInfo.id).maybeSingle();
                    if (tData && !tErr) templateUUID = tData.id;
                } catch(tEx) {
                    console.warn('[Checkout] Tabla templates no encontrada, continuando sin FK:', tEx.message);
                }

                const dynamicTexts = {};
                if (activeTemplateInfo.editableTexts) {
                    activeTemplateInfo.editableTexts.forEach(field => {
                        const el = document.getElementById(`dyn_${field.id}`);
                        if (el) dynamicTexts[field.id] = el.value.trim();
                    });
                }
                if (dataForm.flImg) {
                    dynamicTexts['flImg'] = dataForm.flImg;
                    dynamicTexts['flS']   = dataForm.flS;
                    dynamicTexts['flX']   = dataForm.flX;
                    dynamicTexts['flY']   = dataForm.flY;
                }

                const photosInput = document.getElementById('inpPhotos') ? document.getElementById('inpPhotos').value : "";
                const photoArray  = photosInput.split(/[\n, ]+/).filter(link => link.trim().startsWith('http'));

                // Guardamos plan_duration_hours como referencia informativa.
                // El campo expires_at real lo calcula el trigger de Supabase al aprobar.
                const planHours = getPlanDurationHours(dataForm.plan);

                const orderData = {
                    customer_name:   dataForm.destino || "Cliente Web",
                    target_name:     dataForm.destino || "N/A",
                    plan_name:       dataForm.plan,
                    price:           price,
                    template_id:     templateUUID,
                    template_name:   activeTemplateInfo.name,
                    custom_date:     dataForm.date     || "",
                    custom_message:  dataForm.message  || "",
                    photo_urls:      [],
                    music_url:       dataForm.musicUrl || "",
                    music_start:     parseInt(dataForm.musicStart)    || 0,
                    music_duration:  parseInt(dataForm.musicDuration) || 30,
                    dynamic_texts:   dynamicTexts,
                    status:          'pending'
                    // expires_at: lo establece el trigger en Supabase al cambiar status → 'paid'
                };

                const { data: insertData, error: insertError } = await db.from('orders').insert([orderData]).select();
                if (insertError) throw insertError;
                if (insertData && insertData.length > 0) {
                    processFinalOrder(insertData[0]);
                    return;
                }
            } catch (e) {
                console.warn("Error Supabase — modo contingencia activado:", e);
            }
        }

        processFinalOrder({ id: tempId, customer_name: dataForm.destino || "Cliente", plan_name: dataForm.plan }, true);
    });
}

function processFinalOrder(order, isOffline = false) {
    // Fix: manejar correctamente UUIDs (online) vs tempIds como "LC-XXXXXX" (offline)
    let displayId;
    if (isOffline) {
        displayId = order.id; // "LC-XXXXXX" ya está en formato legible
    } else {
        // UUID de Supabase: tomar primeros 8 chars en mayúscula
        displayId = (order.id || '').substring(0, 8).toUpperCase();
    }
    const successModal = document.getElementById('successModal');
    const displayOrderId = document.getElementById('displayOrderId');
    const btnGoToWA    = document.getElementById('btnGoToWA');

    if (displayOrderId) displayOrderId.innerText = displayId;

    // Guardar ID globalmente para PayPal y otros módulos
    window._currentOrderId = order.id;

    const waMsg  = CONFIG.paymentMsg(displayId, order.customer_name || "Cliente", dataForm.plan);
    const waLink = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(waMsg)}`;

    if (btnGoToWA) {
        btnGoToWA.onclick = () => {
            window.open(waLink, '_blank');
            if (successModal) successModal.classList.remove('active');
        };
    }

    localStorage.setItem('lastOrderId', order.id);
    if (successModal)      successModal.classList.add('active');
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) checkoutModal.classList.remove('active');
    document.body.style.overflow = 'hidden';

    // --- Extraer precio ---
    let price = 0;
    try {
        const m = dataForm.plan.match(/\$(\d+(\.\d+)?)/);
        if (m) price = parseFloat(m[1]);
    } catch(e) {}

    // --- Dispatch analytics event ---
    document.dispatchEvent(new CustomEvent('corazoncodigo:order-completed', {
        detail: { orderId: order.id, price, plan: dataForm.plan }
    }));

    // --- Tracking de afiliado (si vino por referido) ---
    if (typeof trackReferral === 'function' && !isOffline) {
        trackReferral(order.id, price);
    }

    // --- Disparar Email Automático (Edge Function) ---
    if (window.db && !isOffline) {
        window.db.functions.invoke('send-order-email', {
            body: { orderId: order.id }
        }).catch(err => console.warn('[Email] Error al disparar email:', err));
    }

    // --- Crear cuenta de afiliado si compran Membresía Hub ---
    if (dataForm.plan.includes('$4.50') && typeof createOrGetAffiliate === 'function' && !isOffline) {
        createOrGetAffiliate(order.id, order.customer_name || 'LC');
    }

    // --- Toast de confirmación ---
    if (typeof showToast === 'function') {
        showToast(
            '¡Pedido registrado! 💜',
            'Copia tu ID de seguimiento y envíanos el comprobante por WhatsApp.'
        );
    }
}

// -------------------------------------------------------
// Editor Visual Drag & Drop de Foto Flotante
// -------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const chkFloat    = document.getElementById('chkUseFloatImg');
    const floatControls = document.getElementById('floatImgControls');

    if (chkFloat && floatControls) {
        chkFloat.addEventListener('change', (e) => {
            const container = document.getElementById('dynamicTextContainer');
            if (e.target.checked) {
                floatControls.style.display = 'block';
                initPhotoDragEditor();
                if (container) {
                    container.style.opacity = '0.3';
                    container.style.pointerEvents = 'none';
                }
            } else {
                floatControls.style.display = 'none';
                if (container) {
                    container.style.opacity = '1';
                    container.style.pointerEvents = 'auto';
                }
            }
        });
    }
});

// -------------------------------------------------------
// Actualizar preview de foto al pegar URL
// -------------------------------------------------------
function updatePhotoPreview() {
    const urlInput = document.getElementById('flImgUrl');
    if (!urlInput) return;
    const url = urlInput.value.trim();
    const img = document.getElementById('dragPhotoImg');
    const placeholder = document.getElementById('dragPhotoPlaceholder');
    if (!img || !placeholder) return;

    if (url && (url.startsWith('http') || url.startsWith('data:'))) {
        img.src = url;
        img.style.display = 'block';
        placeholder.style.display = 'none';
        img.onerror = () => {
            img.style.display = 'none';
            placeholder.style.display = 'flex';
        };
    } else {
        img.style.display = 'none';
        placeholder.style.display = 'flex';
    }

    // Actualizar iframe en vivo — mostrar SOLO la plantilla limpia (sin la foto encima)
    // La foto pequeña arrastrable representa la posición, no se inyecta al iframe aquí
    const iframe = document.getElementById('livePreviewIframe');
    if (iframe && activeTemplateInfo && activeTemplateInfo.path && !iframe.src.includes(activeTemplateInfo.path)) {
        const params = new URLSearchParams();
        params.append('editorLivePreview', 'true');
        // Inyectar textos personalizados para que la plantilla se vea con el contenido real
        if (activeTemplateInfo.editableTexts) {
            activeTemplateInfo.editableTexts.forEach(field => {
                const el = document.getElementById(`dyn_${field.id}`);
                if (el && el.value.trim()) params.append(`txt_${field.id}`, el.value.trim());
            });
        }
        iframe.src = activeTemplateInfo.path + '?' + params.toString();
    }

    // Actualizar el fondo del canvas según la plantilla activa
    if (activeTemplateInfo) {
        const canvas = document.getElementById('photoPositionCanvas');
        if (canvas) canvas.style.backgroundColor = activeTemplateInfo.color || '#0a0a20';
        const label = document.getElementById('canvasTemplateName');
        if (label) label.innerText = '📱 ' + (activeTemplateInfo.name || 'Previsualización');
    }
}
window.updatePhotoPreview = updatePhotoPreview;

// -------------------------------------------------------
// Resize del elemento arrastrable según slider
// -------------------------------------------------------
function resizeDraggablePhoto(value) {
    const el = document.getElementById('draggablePhoto');   // ID corregido
    const canvas = document.getElementById('photoPositionCanvas');
    const label = document.getElementById('flImgSLabel');
    if (!el || !canvas) return;

    const canvasW = canvas.offsetWidth;
    const canvasH = canvas.offsetHeight;
    const sizeValue = parseInt(value);
    // Convertir el % de tamaño a píxeles relativos al canvas
    const sizePx = Math.round((sizeValue / 100) * Math.min(canvasW, canvasH));
    el.style.width  = sizePx + 'px';
    el.style.height = sizePx + 'px';
    if (label) label.innerText = value + '%';

    // Actualizar el valor oculto
    const inp = document.getElementById('flImgS');
    if (inp) inp.value = value;
}
window.resizeDraggablePhoto = resizeDraggablePhoto;

// -------------------------------------------------------
// Inicializar el editor drag-and-drop del canvas
// -------------------------------------------------------
function initPhotoDragEditor() {
    const canvas   = document.getElementById('photoPositionCanvas');
    const dragEl   = document.getElementById('draggablePhoto');   // ID correcto del HTML
    const inpX     = document.getElementById('flImgX');
    const inpY     = document.getElementById('flImgY');
    const posDisp  = document.getElementById('flPosDisplay');

    if (!canvas || !dragEl) return;
    if (dragEl._dragInitialized) return; // Evitar doble init
    dragEl._dragInitialized = true;

    // Colorear el canvas según la plantilla activa
    if (activeTemplateInfo) {
        canvas.style.backgroundColor = '#000'; // El iframe ya tiene el color o fondo de la plantilla
        const label = document.getElementById('canvasTemplateName');
        if (label) label.innerText = '📱 ' + (activeTemplateInfo.name || 'Vista Previa');

        // Renderizar el Iframe en vivo con los Textos Base si los hay
        const iframe = document.getElementById('livePreviewIframe');
        if (iframe && activeTemplateInfo.path) {
            let finalPath = activeTemplateInfo.path;
            let params = new URLSearchParams();
            if (activeTemplateInfo.editableTexts) {
                activeTemplateInfo.editableTexts.forEach(field => {
                    const el = document.getElementById(`dyn_${field.id}`);
                    if (el && el.value.trim()) params.append(`txt_${field.id}`, el.value.trim());
                });
            }
            const dateVal = document.getElementById('inpDate') ? document.getElementById('inpDate').value : '';
            if (dateVal) params.append('fecha', dateVal);
            
            // Indicar a personalizar.js que es un entorno de editor en vivo (para auto-start visual)
            params.append('editorLivePreview', 'true');
            
            const qs = params.toString();
            iframe.src = qs ? finalPath + '?' + qs : finalPath;
        }
    }

    let isDraggingPhoto = false;
    let offsetX = 0, offsetY = 0;

    function getPercent() {
        const rect   = canvas.getBoundingClientRect();
        const elRect = dragEl.getBoundingClientRect();
        const xPct = Math.round(((elRect.left + elRect.width  / 2 - rect.left) / rect.width)  * 100);
        const yPct = Math.round(((elRect.top  + elRect.height / 2 - rect.top)  / rect.height) * 100);
        return { x: Math.max(0, Math.min(100, xPct)), y: Math.max(0, Math.min(100, yPct)) };
    }

    function updateCoords() {
        const { x, y } = getPercent();
        if (inpX) inpX.value = x;
        if (inpY) inpY.value = y;
        if (posDisp) {
            const quadrant = x < 33 ? 'Izquierda' : x > 66 ? 'Derecha' : 'Centro';
            const vQuadrant = y < 33 ? 'Arriba' : y > 66 ? 'Abajo' : 'Medio';
            posDisp.innerText = `${quadrant}-${vQuadrant} (${x}%, ${y}%)`;
        }
    }

    function onMouseDown(e) {
        e.preventDefault();
        isDraggingPhoto = true;
        const rect = dragEl.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        offsetX = clientX - rect.left - rect.width  / 2;
        offsetY = clientY - rect.top  - rect.height / 2;
        dragEl.style.cursor   = 'grabbing';
        dragEl.style.boxShadow = '0 8px 40px rgba(6,182,212,0.6)';
        dragEl.style.borderColor = 'rgba(6,182,212,0.9)';
    }

    function onMouseMove(e) {
        if (!isDraggingPhoto) return;
        const canvasRect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const halfW = dragEl.offsetWidth  / 2;
        const halfH = dragEl.offsetHeight / 2;

        let newX = clientX - canvasRect.left - offsetX - halfW;
        let newY = clientY - canvasRect.top  - offsetY - halfH;

        // Contener dentro del canvas
        newX = Math.max(-halfW, Math.min(canvasRect.width  - halfW, newX));
        newY = Math.max(-halfH, Math.min(canvasRect.height - halfH, newY));

        dragEl.style.left      = (newX + halfW) + 'px';
        dragEl.style.top       = (newY + halfH) + 'px';
        dragEl.style.transform = 'translate(-50%, -50%)';
        updateCoords();
    }

    function onMouseUp() {
        if (!isDraggingPhoto) return;
        isDraggingPhoto = false;
        dragEl.style.cursor    = 'grab';
        dragEl.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
        dragEl.style.borderColor = 'rgba(255,255,255,0.5)';
    }

    // Click en el canvas para reposicionar directamente
    canvas.addEventListener('click', (e) => {
        if (isDraggingPhoto) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        dragEl.style.left  = x + 'px';
        dragEl.style.top   = y + 'px';
        dragEl.style.transform = 'translate(-50%, -50%)';
        updateCoords();
    });

    dragEl.addEventListener('mousedown',  onMouseDown);
    dragEl.addEventListener('touchstart', onMouseDown, { passive: false });
    window.addEventListener('mousemove',  onMouseMove);
    window.addEventListener('touchmove',  onMouseMove, { passive: false });
    window.addEventListener('mouseup',    onMouseUp);
    window.addEventListener('touchend',   onMouseUp);

    // Trigger inicial para actualizar valores
    updateCoords();
}
window.initPhotoDragEditor = initPhotoDragEditor;

// -------------------------------------------------------
// Lógica de Subida de Archivos (Drag & Drop desde PC / Click)
// -------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('inpLocalPhoto');
    const dragEl = document.getElementById('draggablePhoto');
    const dragDropOverlay = document.getElementById('dragDropOverlay');
    const canvas = document.getElementById('photoPositionCanvas');
    const dragPhotoIcon = document.getElementById('dragPhotoIcon');
    const dragPhotoText = document.getElementById('dragPhotoText');

    if (!fileInput || !dragEl || !canvas) return;

    // Doble clic en la caja flotante para seleccionar archivo en cualquier momento
    dragEl.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    // Si la caja no tiene imagen, incluso un clic sencillo permite abrir el input
    dragEl.addEventListener('click', (e) => {
        const placeholderVisible = document.getElementById('dragPhotoPlaceholder').style.display !== 'none';
        if (placeholderVisible) {
            fileInput.click();
        }
    });

    // Eventos visuales de drag over THE ENTIRE CANVAS
    canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (e.dataTransfer.types.includes('Files')) {
            dragDropOverlay.style.display = 'flex';
            canvas.style.borderColor = 'var(--accent-fuchsia)';
        }
    });

    canvas.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dragDropOverlay.style.display = 'none';
        canvas.style.borderColor = 'rgba(6,182,212,0.5)';
    });

    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        dragDropOverlay.style.display = 'none';
        canvas.style.borderColor = 'rgba(6,182,212,0.5)';

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    async function handleFileUpload(file) {
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecciona una imagen válida de tipo PNG, JPG, GIF...');
            return;
        }

        // Límite local de seguridad: 5MB
        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen es demasiado pesada. El límite es de 5MB por favor.');
            return;
        }

        // Guardar estado original
        const originalIcon = dragPhotoIcon.className;
        const originalText = dragPhotoText.innerHTML;

        dragPhotoIcon.className = "fa-solid fa-spinner fa-spin";
        dragPhotoText.innerHTML = "Subiendo...<br><span style='font-size:0.55rem;'>Por favor espera</span>";
        
        try {
            if (!window.db) throw new Error("Base de datos Supabase no iniciada.");

            const ext = file.name.split('.').pop() || 'png';
            const fileName = `custom_photo_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;

            // Subir usando el SDK asíncrono
            const { data, error } = await window.db.storage
                .from('user_uploads')
                .upload(fileName, file, { cacheControl: '3600', upsert: false });

            if (error) throw error;

            // Obtener link público
            const { data: pubData } = window.db.storage
                .from('user_uploads')
                .getPublicUrl(fileName);

            const fileUrl = pubData.publicUrl;

            // Rellenar input e invocar la vista visual
            const urlInput = document.getElementById('flImgUrl');
            if (urlInput) {
                urlInput.value = fileUrl;
                if (typeof window.updatePhotoPreview === 'function') {
                    window.updatePhotoPreview();
                }
            }

            // Éxito
            dragPhotoIcon.className = "fa-solid fa-check";
            dragPhotoText.innerHTML = "Lista<br><span style='font-size:0.55rem;opacity:0.8;'>Doble clic para cambiar</span>";

            // Se devolverá a ocultar placeholder cuando `updatePhotoPreview` ejecute,
            // si la imagen se procesa bien. 
            setTimeout(() => {
                dragPhotoIcon.className = originalIcon;
            }, 3000);

        } catch (err) {
            console.error(err);
            alert("Error al subir la imagen a Supabase (Revisa si el bucket existe): " + err.message);
            dragPhotoIcon.className = "fa-solid fa-triangle-exclamation";
            dragPhotoText.innerHTML = "Fallo subida<br><span style='font-size:0.55rem;'>Reintenta</span>";
            setTimeout(() => {
                dragPhotoIcon.className = originalIcon;
                dragPhotoText.innerHTML = originalText;
            }, 3000);
        }
    }
});
