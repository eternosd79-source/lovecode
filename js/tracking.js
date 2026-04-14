// ============================================================
// CORAZÓNCÓDIGO — TRACKING DE PEDIDOS (Mis Pedidos)
// El cliente ingresa su ID de orden para ver el estado
// y recibir el link de su regalo o el botón de descarga ZIP.
//
// ✅ FIX: El número de WhatsApp usa CONFIG.whatsappNumber
//    (ya no está hardcodeado como 00000000000)
// ============================================================

const btnTrackOrder    = document.getElementById('btnTrackOrder');
const inpOrderId       = document.getElementById('inpOrderId');
const orderStatusResult = document.getElementById('orderStatusResult');

function openQRModal(linkStr) {
    let qrOverlay = document.getElementById('qrOverlay');
    if (!qrOverlay) {
        qrOverlay = document.createElement('div');
        qrOverlay.id = 'qrOverlay';
        qrOverlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:99999; display:flex; justify-content:center; align-items:center; opacity:0; pointer-events:none; transition: opacity 0.3s ease;';
        qrOverlay.innerHTML = `
            <div style="background:var(--bg-card); padding:40px; border-radius:15px; border:1px solid rgba(255,255,255,0.1); text-align:center; position:relative; max-width:400px; width:90%;">
                <button onclick="document.getElementById('qrOverlay').style.opacity='0'; setTimeout(()=>document.getElementById('qrOverlay').style.pointerEvents='none',300)" style="position:absolute; top:10px; right:15px; background:transparent; border:none; color:white; font-size:1.2rem; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
                <h3 class="neon-cyan" style="margin-top:0;">Código QR</h3>
                <p style="font-size:0.9rem; color:var(--color-dim); margin-bottom:20px;">Escanea este código con tu celular para ver el regalo.</p>
                <div id="trackingQRBox" style="background:white; padding:20px; border-radius:12px; display:inline-block; margin-bottom: 20px;"></div>
                <button class="btn-primary" onclick="downloadPaidQR()" style="width: 100%;"><i class="fa-solid fa-download"></i> Descargar QR</button>
            </div>
        `;
        document.body.appendChild(qrOverlay);
        
        // Add download function to window if it doesn't exist
        window.downloadPaidQR = function() {
            const container = document.getElementById('trackingQRBox');
            if (!container) return;
            const canvas = container.querySelector('canvas');
            
            let rawCanvas = canvas;
            if (!rawCanvas) {
                const img = container.querySelector('img');
                if (!img) return;
                rawCanvas = document.createElement('canvas');
                rawCanvas.width = img.width || 200;
                rawCanvas.height = img.height || 200;
                rawCanvas.getContext('2d').drawImage(img, 0, 0);
            }
            
            if (typeof generateAndDownloadBeautifulQR === 'function') {
                const orderTitle = document.querySelector('.card-title')?.innerText || 'Regalo Experiencia';
                generateAndDownloadBeautifulQR(rawCanvas, orderTitle, '', true);
            } else {
                const link = document.createElement('a');
                link.href = rawCanvas.toDataURL('image/png');
                link.download = 'LoveCode-QR-Premium.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        };
    }
    document.getElementById('trackingQRBox').innerHTML = '';
    new QRCode(document.getElementById('trackingQRBox'), { text: linkStr, width: 200, height: 200, colorDark: "#000000", colorLight: "#ffffff" });
    qrOverlay.style.pointerEvents = 'auto';
    qrOverlay.style.opacity = '1';
}

if (btnTrackOrder) {
    btnTrackOrder.addEventListener('click', async () => {
        const id = inpOrderId.value.trim();
        if (!id) return alert("Por favor ingresa un ID válido.");
        if (!db)  return alert("Error de conexión con la base de datos. Intenta de nuevo.");

        const { data: order, error } = await db
            .from('orders')
            .or(`id.eq.${id},id.ilike.${id}%`)
            .single();

        if (orderStatusResult) {
            orderStatusResult.style.display = 'block';
            orderStatusResult.scrollIntoView({ behavior: 'smooth' });
            if (order) {
                renderOrderStatus(order);
            } else {
                console.error("Error o no encontrado:", error);
                orderStatusResult.innerHTML = `
                    <div class="status-card error">
                        <i class="fa-solid fa-circle-exclamation"></i>
                        <h4>Orden no encontrada</h4>
                        <p>Verifica que el ID sea correcto o contacta a soporte por WhatsApp.</p>
                        <a href="https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent('Hola CorazónCódigo! Necesito ayuda para ubicar mi pedido. Mi ID aproximado es: ' + id)}"
                           target="_blank" class="btn-whatsapp" style="display:inline-flex; margin-top:15px; text-decoration:none;">
                           <i class="fa-brands fa-whatsapp"></i> Contactar Soporte
                        </a>
                    </div>
                `;
            }
        }
    });
}

function renderOrderStatus(order) {
    const displayId = order.id.substring(0, 8).toUpperCase();

    let fullLink = order.final_link || "";
    if (fullLink) {
        const separator = fullLink.includes('?') ? '&' : '?';
        fullLink += `${separator}orderId=${order.id}`;
    }

    // WhatsApp para enviar comprobante (número real desde CONFIG)
    const waComprobante = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(
        `Hola CorazónCódigo! Te envío el comprobante de pago de mi pedido #${displayId}. ¡Gracias!`
    )}`;

    const isPaid = order.status === 'paid';
    const isHub  = order.plan_name && order.plan_name.includes('$4.50');

    let statusHTML = ``;

    if (order.status === 'pending') {
        statusHTML = `
            <div class="status-card ${order.status}">
                <div class="status-header">
                    <span>Orden: <strong>#${displayId}</strong></span>
                    <span class="badge-status">⏳ Pendiente de Pago</span>
                </div>
                <div class="status-body">
                    <p><strong>Plantilla:</strong> ${order.template_name || order.template_id || 'N/A'}</p>
                    <p><strong>Plan:</strong> ${order.plan_name}</p>
                    <p><strong>Para:</strong> ${order.target_name || 'N/A'}</p>
                    <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:15px 0;">
                    <p class="status-msg">
                        ✅ Tu pedido está registrado. Envíanos el comprobante de pago por WhatsApp
                        y en minutos activaremos tu regalo.
                    </p>
                    <a href="${waComprobante}" target="_blank" class="btn-whatsapp" style="display:inline-flex; width:100%; justify-content:center; text-decoration:none; margin-top:10px;">
                        <i class="fa-brands fa-whatsapp"></i> Enviar Comprobante Activo
                    </a>
                </div>
            </div>`;
    } else {
        // Tarjeta VIP Profesional para pagos realizados
        statusHTML = `
            <div class="product-card" style="margin: 0 auto; max-width: 400px; text-align: left; animation: floatUp 0.6s ease-out backwards;">
                <div class="card-image" id="tracking-card-img" style="position:relative; height: 180px; overflow: hidden; border-radius: 12px 12px 0 0;">
                    <span class="badge" style="background:#10b981; color:#fff; font-weight:bold; position:absolute; top:10px; left:10px; z-index:10;"><i class="fa-solid fa-check"></i> Activo</span>
                </div>
                <div class="card-content" style="padding: 20px;">
                    <h3 class="card-title" style="margin:0 0 10px; font-size:1.3rem;">${order.template_name || 'Regalo Experiencia'}</h3>
                    <p class="card-desc" style="font-size:0.9rem; margin-bottom:15px;">¡Gracias por tu compra! Tu regalo digital está vivo y operando. Listo para ser enviado.</p>
                    
                    ${order.plan_name && order.plan_name.includes('$7') ? `
                        <button class="btn-primary" onclick="window.open('${order.zip_url || '#'}')" style="width:100%; justify-content:center; margin-bottom:15px;">
                            <i class="fa-solid fa-file-zipper"></i> Descargar Código Fuente (.zip)
                        </button>
                    ` : `
                        <div class="final-link-box" style="margin-bottom: 15px; border-color:var(--accent-cyan);">
                            <input type="text" readonly value="${fullLink}" id="finalLink" style="font-size:0.8rem;">
                            <button onclick="copyLink()" title="Copiar"><i class="fa-solid fa-copy"></i></button>
                        </div>

                        <div class="card-actions" style="display:flex; gap:10px; margin-bottom: 15px;">
                            <button class="btn-primary" onclick="window.open('${fullLink}','_blank')" style="flex:1; justify-content:center; text-decoration:none;">
                                <i class="fa-solid fa-eye"></i> Abrir Link
                            </button>
                            <button class="btn-secondary" onclick="openQRModal('${fullLink}')" style="width:50px; padding:0; justify-content:center; flex-shrink:0;" title="Ver Código QR">
                                <i class="fa-solid fa-qrcode"></i>
                            </button>
                        </div>
                        <button class="video-preview-btn" onclick="openVideoPreview()" style="width:100%; justify-content:center;">
                            <i class="fa-solid fa-film"></i> Generar Video-Miniatura
                        </button>
                    `}
                </div>
            </div>`;
    }

    orderStatusResult.innerHTML = statusHTML;

    // Pintar canvas thumbnail
    if (order.status === 'paid' && order.template_id) {
        setTimeout(() => {
            const container = document.getElementById('tracking-card-img');
            if (container && typeof generateThumb === 'function') {
                const cv = generateThumb(order.template_id);
                if (cv) {
                    cv.style.width = '100%';
                    cv.style.height = '100%';
                    cv.style.objectFit = 'cover';
                    cv.style.position = 'absolute';
                    cv.style.top = '0';
                    cv.style.left = '0';
                    container.appendChild(cv);
                }
            }
        }, 100);
    }

    // Si es Membresía Hub y está pagado → mostrar dashboard de afiliado
    if (isPaid && isHub && typeof renderAffiliateDashboard === 'function') {
        renderAffiliateDashboard(order.id).then(dashboardHTML => {
            if (dashboardHTML) {
                orderStatusResult.insertAdjacentHTML('beforeend', dashboardHTML);
            }
        });
    }
}

function copyLink() {
    const copyText = document.getElementById("finalLink");
    const text = copyText ? copyText.value : '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => alert('Link copiado al portapapeles'))
            .catch(() => { copyText.select(); document.execCommand('copy'); alert('Link copiado al portapapeles'); });
    } else {
        copyText.select();
        document.execCommand('copy');
        alert('Link copiado al portapapeles');
    }
}
