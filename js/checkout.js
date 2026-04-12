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
                const { data: tData } = await db.from('templates').select('id').eq('slug', activeTemplateInfo.id).single();
                if (tData) templateUUID = tData.id;

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

                const orderData = {
                    customer_name:  dataForm.destino || "Cliente Web",
                    target_name:    dataForm.destino || "N/A",
                    plan_name:      dataForm.plan,
                    price:          price,
                    template_id:    templateUUID,
                    template_name:  activeTemplateInfo.name,
                    custom_date:    dataForm.date     || "",
                    custom_message: dataForm.message  || "",
                    photo_urls:     [], // Se omite el paso de fotos anticuado
                    music_url:      dataForm.musicUrl || "",
                    music_start:    parseInt(dataForm.musicStart)    || 0,
                    music_duration: parseInt(dataForm.musicDuration) || 30,
                    dynamic_texts:  dynamicTexts,
                    status: 'pending'
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

        // Modo contingencia: pedido igual aunque falle la DB
        processFinalOrder({ id: tempId, customer_name: dataForm.destino || "Cliente", plan_name: dataForm.plan }, true);
    });
}

function processFinalOrder(order, isOffline = false) {
    const displayId    = isOffline ? order.id : order.id.substring(0, 8).toUpperCase();
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
// Toggle de Foto Flotante
// -------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const chkFloat = document.getElementById('chkUseFloatImg');
    const floatControls = document.getElementById('floatImgControls');
    if (chkFloat && floatControls) {
        chkFloat.addEventListener('change', (e) => {
            const container = document.getElementById('dynamicTextContainer');
            if (e.target.checked) {
                floatControls.style.display = 'block';
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
