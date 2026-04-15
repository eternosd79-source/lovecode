// ============================================================
// CORAZÓNCÓDIGO — VIDEO-RESUMEN.JS
// Genera una vista previa visual (canvas) del regalo
// que el cliente puede descargar como PNG o compartir
//
// Lo que genera:
//   - Frame animado con el nombre de la plantilla
//   - Colores temáticos de esa experiencia
//   - Datos del cliente (nombre, plan)
//   - Código QR de acceso (si aplica)
//   - Botón de descarga PNG
// ============================================================

/**
 * Genera la vista previa en canvas con los datos del regalo
 * @param {Object} params - { templateId, templateName, customerName, planName, dateStr }
 */
function generateVideoPreview(params = {}) {
    const canvas  = document.getElementById('previewCanvas');
    if (!canvas) return;

    const ctx     = canvas.getContext('2d');
    const W = canvas.width  = 400;
    const H = canvas.height = 280;

    const style = (typeof THUMB_STYLES !== 'undefined' && THUMB_STYLES[params.templateId])
        ? THUMB_STYLES[params.templateId]
        : { bg: ['#0a0a0f', '#151620'], accent: '#c026d3', icon: '💝', label: params.templateName || 'CorazónCódigo' };

    // === FONDO DEGRADADO ===
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, style.bg[0]);
    bg.addColorStop(1, style.bg[1]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // === PARTÍCULAS ===
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.arc(Math.random()*W, Math.random()*H, Math.random()*2+0.5, 0, Math.PI*2);
        ctx.fill();
    }

    // === GLOW CENTRAL ===
    const glow = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 130);
    glow.addColorStop(0, hexToRgba ? hexToRgba(style.accent, 0.15) : 'rgba(192,38,211,0.15)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // === ICONO EMOJI ===
    ctx.font = '56px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = style.accent;
    ctx.shadowBlur  = 20;
    ctx.fillText(style.icon, W/2, 90);
    ctx.shadowBlur = 0;

    // === ENCABEZADO CORAZÓNCÓDIGO ===
    ctx.font = '10px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('❤ CORAZÓNCÓDIGO.ME', W/2, 20);

    // === LÍNEA DECORATIVA ===
    const lineG = ctx.createLinearGradient(80, 0, W-80, 0);
    lineG.addColorStop(0, 'transparent');
    lineG.addColorStop(0.5, style.accent);
    lineG.addColorStop(1, 'transparent');
    ctx.strokeStyle = lineG;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(80, 148); ctx.lineTo(W-80, 148);
    ctx.stroke();

    // === NOMBRE DE LA PLANTILLA ===
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur  = 6;
    ctx.textAlign = 'center';
    ctx.fillText(params.templateName || style.label, W/2, 166);
    ctx.shadowBlur = 0;

    // === NOMBRE DEL DESTINATARIO ===
    if (params.customerName) {
        ctx.font = '13px Arial, sans-serif';
        ctx.fillStyle = style.accent;
        ctx.fillText(`Para: ${params.customerName}`, W/2, 188);
    }

    // === PLAN ===
    if (params.planName) {
        const planShort = params.planName.replace(/\(.*\)/, '').trim();
        ctx.font = '11px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText(planShort, W/2, 206);
    }

    // === BANNER INFERIOR ===
    const bannerGrad = ctx.createLinearGradient(0, H-40, 0, H);
    bannerGrad.addColorStop(0, 'transparent');
    bannerGrad.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = bannerGrad;
    ctx.fillRect(0, H-40, W, 40);

    // === FECHA SI EXISTE ===
    if (params.dateStr) {
        ctx.font = '11px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.textAlign = 'left';
        ctx.fillText(`📅 ${params.dateStr}`, 15, H-15);
    }

    // === SELLO CorazónCódigo ===
    ctx.font = 'bold 10px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillStyle = style.accent;
    ctx.fillText('corazoncodigo.me ✨', W-15, H-15);
}

/**
 * Abre el modal de video-resumen con los datos de la orden actual
 */
function openVideoPreview() {
    const modal   = document.getElementById('videoModal');
    if (!modal) return;

    // Tomar datos del formulario activo
    const templateName = document.getElementById('lblSelectedTemplate')?.textContent || 'CorazónCódigo';
    const templateId   = typeof activeTemplateInfo !== 'undefined' ? activeTemplateInfo?.id : '';
    const selectedPlan = document.querySelector('input[name="planType"]:checked');
    const destino      = document.getElementById('inpDestino')?.value || '';
    const dateVal      = document.getElementById('inpDate')?.value || '';

    generateVideoPreview({
        templateId:   templateId,
        templateName: templateName,
        customerName: destino,
        planName:     selectedPlan?.value || '',
        dateStr:      dateVal
    });

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}
window.openVideoPreview = openVideoPreview;

/**
 * Descarga el canvas como PNG
 */
function downloadCanvasPreview() {
    const canvas = document.getElementById('previewCanvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'mi-regalo-corazoncodigo.png';
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
}

/**
 * Inicializa los listeners del modal de video-resumen
 */
function initVideoResumen() {
    const closeBtn = document.getElementById('btnCloseVideo');
    const dlBtn    = document.getElementById('btnDownloadPreview');
    const modal    = document.getElementById('videoModal');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal?.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    if (dlBtn) {
        dlBtn.addEventListener('click', downloadCanvasPreview);
    }

    // Cerrar click fuera
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Agregar botón "Ver preview" en el modal de éxito
    const successModal = document.getElementById('successModal');
    if (successModal) {
        const existingBtn = successModal.querySelector('.video-preview-btn');
        if (!existingBtn) {
            const previewBtn = document.createElement('button');
            previewBtn.className = 'video-preview-btn';
            previewBtn.innerHTML = '<i class="fa-solid fa-film"></i> Ver Vista Previa de tu Regalo';
            previewBtn.onclick = openVideoPreview;
            
            // Insertar dentro del nuevo contenedor de botones si existe, sino arriba del boton de WA
            const btnContainer = successModal.querySelector('#successButtonsContainer');
            if (btnContainer) {
                btnContainer.prepend(previewBtn);
            } else {
                const container = successModal.querySelector('.wizard-container');
                if (container) {
                    const waBtn = container.querySelector('#btnGoToWA');
                    if (waBtn) container.insertBefore(previewBtn, waBtn);
                    else container.appendChild(previewBtn);
                }
            }
        }
    }
}
