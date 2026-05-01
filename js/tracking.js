// ============================================================
// CORAZÓNCÓDIGO — TRACKING DE PEDIDOS (Mis Pedidos)
// El cliente ingresa su ID de orden para ver el estado
// y recibir el link de su regalo o el botón de descarga ZIP.
// ============================================================

const btnTrackOrder    = document.getElementById('btnTrackOrder');
const inpOrderId       = document.getElementById('inpOrderId');
const orderStatusResult = document.getElementById('orderStatusResult');
const CONFIG = window.getConfig ? window.getConfig() : { whatsappNumber: '593990480389' };

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function sanitizeUrl(value) {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return '';
}

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
                link.download = 'LoveCode-QR.png';
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

        // 1. Buscar en promo_codes (válido o ya usado)
        const { data: promoData } = await db
            .from('promo_codes')
            .select('*')
            .eq('code', id.toUpperCase())
            .maybeSingle();

        if (promoData) {
            if (!promoData.is_used) {
                // Código válido sin usar → redirigir al catálogo para comprar
                window.location.href = `index.html?coupon=${encodeURIComponent(id)}&tpl=${encodeURIComponent(promoData.template_id || '')}`;
                return;
            } else if (promoData.used_by) {
                // Código ya canjeado → buscar y mostrar la orden asociada
                let { data: orderData } = await db.rpc('get_order_safe', { p_id: promoData.used_by });
                const order = orderData && orderData.length > 0 ? orderData[0] : null;
                if (order && orderStatusResult) {
                    orderStatusResult.style.display = 'block';
                    orderStatusResult.scrollIntoView({ behavior: 'smooth' });
                    renderOrderStatus(order);
                    return;
                }
            }
        }

        // 2. Si no es un código de regalo, buscar como orden normal
        let { data: orderData, error } = await db.rpc('search_order_by_id', { search_term: id });
        let order = orderData && orderData.length > 0 ? orderData[0] : null;

        // Fallback extra si no encontró nada con el RPC (puede pasar por diferencias de ID corto)
        if (!order) {
            const normalized = id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            if (normalized.length >= 6) {
                const fallback = await db
                    .from('orders')
                    .select('*')
                    .ilike('id', `${normalized}%`)
                    .limit(1);
                if (fallback && fallback.data && fallback.data.length > 0) {
                    order = fallback.data[0];
                }
            }
        }

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
                        <a href="https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent('Hola CorazónCódigo! Necesito ayuda para ubicar mi pedido. Mi ID aproximado es: ' + escapeHtml(id))}"
                           target="_blank" class="btn-whatsapp" style="display:inline-flex; margin-top:15px; text-decoration:none;">
                           <i class="fa-brands fa-whatsapp"></i> Contactar Soporte
                        </a>
                    </div>
                `;
            }
        }
    });
}

// ──────────────────────────────────────────────────────────────
// BANNER: Tiempo restante del plan (visible al usuario)
// ──────────────────────────────────────────────────────────────
function buildExpirationBanner(order) {
    if (order.status === 'expired') {
        const waRenewal = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(
            `Hola CorazónCódigo! Mi plan expiró (ID: ${order.id.substring(0,8).toUpperCase()}). ¿Cómo puedo renovarlo?`
        )}`;
        return `
            <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:10px;padding:14px 16px;margin-bottom:16px;">
                <p style="color:#ef4444;font-weight:700;margin:0 0 8px;"><i class="fa-solid fa-hourglass-end"></i> Tu plan ha expirado</p>
                <p style="color:var(--color-dim);font-size:0.82rem;margin:0 0 12px;">El período de acceso de tu regalo ya venció. Contáctanos para renovarlo.</p>
                <a href="${waRenewal}" target="_blank" class="btn-whatsapp" style="display:inline-flex;text-decoration:none;padding:8px 16px;font-size:0.85rem;">
                    <i class="fa-brands fa-whatsapp"></i> Renovar mi Plan
                </a>
            </div>`;
    }

    if (!order.expires_at || order.status !== 'paid') return '';

    const now    = new Date();
    const exp    = new Date(order.expires_at);
    const diffMs = exp - now;
    const diffH  = Math.floor(diffMs / 3_600_000);
    const diffD  = Math.floor(diffH / 24);

    const planHours = (function(p) {
        if (!p) return 336;
        const pLower = p.toLowerCase();
        if (pLower.includes('$0') || /demo|gratis/i.test(pLower)) return 24;
        if (pLower.includes('$4.50') || /ultra|premium/i.test(pLower)) return 4320;
        if (pLower.includes('$3') || /fotograf|personalizado/i.test(pLower)) return 1800;
        if (pLower.includes('$2.50') || /hub|suscripc/i.test(pLower)) return 1800;
        if (pLower.includes('$1.50') || /b.?sico/i.test(pLower)) return 336;
        return 336;
    })(order.plan_name);

    const pct       = Math.max(0, Math.min(100, Math.round((diffH / planHours) * 100)));
    const barColor  = pct > 30 ? '#10b981' : pct > 10 ? '#f59e0b' : '#ef4444';
    const bannerBg  = pct > 30 ? 'rgba(16,185,129,0.07)' : pct > 10 ? 'rgba(245,158,11,0.07)' : 'rgba(239,68,68,0.08)';
    const bannerBdr = pct > 30 ? 'rgba(16,185,129,0.2)'  : pct > 10 ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.3)';

    const timeLabel = diffMs <= 0  ? '⌛ Vencido (procesando...)' :
                      diffH < 1    ? '¡Menos de 1 hora restante!' :
                      diffH < 24   ? `${diffH} hora${diffH !== 1 ? 's' : ''} restantes` :
                                     `${diffD} día${diffD !== 1 ? 's' : ''} restantes`;

    const expDate = exp.toLocaleDateString('es-EC', { day:'numeric', month:'long', year:'numeric' });
    const expTime = exp.toLocaleTimeString('es-EC', { hour:'2-digit', minute:'2-digit' });

    return `
        <div style="background:${bannerBg};border:1px solid ${bannerBdr};border-radius:10px;padding:14px 16px;margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
                <span style="color:${barColor};font-weight:700;font-size:0.9rem;">
                    <i class="fa-solid fa-clock"></i> ${timeLabel}
                </span>
                <span style="font-size:0.75rem;color:var(--color-dim);">Expira: ${expDate} a las ${expTime}</span>
            </div>
            <div style="height:6px;background:rgba(255,255,255,0.08);border-radius:6px;overflow:hidden;">
                <div style="height:100%;width:${pct}%;background:${barColor};border-radius:6px;transition:width 1s;"></div>
            </div>
            <p style="font-size:0.75rem;color:var(--color-dim);margin:6px 0 0;text-align:right;">${pct}% del plan activo</p>
        </div>`;
}

// ──────────────────────────────────────────────────────────────
// RENDER PRINCIPAL: Estado de la orden
// ──────────────────────────────────────────────────────────────
function renderOrderStatus(order) {
    const displayId = order.id.substring(0, 8).toUpperCase();
    const safeTemplateName = escapeHtml(order.template_name || order.template_id || 'N/A');
    const safePlanName = escapeHtml(order.plan_name || '');
    const safeTargetName = escapeHtml(order.target_name || 'N/A');

    let fullLink = order.final_link || "";
    // Reconstruir el link en caso de que no se haya guardado
    if (!fullLink && order.template_name && typeof catalogData !== 'undefined') {
        const tpl = catalogData.find(c => c.name === order.template_name);
        if (tpl && tpl.path) {
            let p = tpl.path.replace('./', '');
            if (window.SITE_BASE_URL) {
                fullLink = window.SITE_BASE_URL + p;
            } else {
                fullLink = window.location.origin + window.location.pathname.replace('index.html','') + p;
            }
        }
    }

    if (fullLink) {
        const separator = fullLink.includes('?') ? '&' : '?';
        // Usar URL amigable: ?para=nombre (sin el UUID largo)
        const rawName = (order.target_name || '').trim();
        // Normalizar: minusculas, sin acentos, sin espacios
        const friendlyName = rawName
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar acentos
            .replace(/\s+/g, '-')                             // espacios -> guion
            .replace(/[^a-z0-9-]/g, '');                      // solo alfanumérico
        if (friendlyName) {
            fullLink += `${separator}para=${encodeURIComponent(friendlyName)}`;
        } else {
            // Fallback al orderId si no hay nombre
            fullLink += `${separator}orderId=${order.id}`;
        }
    }
    const safeFullLink = sanitizeUrl(fullLink) || '#';

    const waComprobante = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(
        `Hola CorazónCódigo! Te envío el comprobante de pago de mi pedido #${displayId}. ¡Gracias!`
    )}`;

    const isPaid    = order.status === 'paid';
    const isDemo    = order.plan_name && order.plan_name.includes('$0');
    const isHub     = order.plan_name && order.plan_name.includes('$2.50');
    const isExpired = order.status === 'expired';

    let statusHTML = ``;

    if (order.status === 'pending') {
        statusHTML = `
            <div class="status-card ${order.status}">
                <div class="status-header">
                    <span>Orden: <strong>#${displayId}</strong></span>
                    <span class="badge-status">⏳ Pendiente de Pago</span>
                </div>
                <div class="status-body">
                    <p><strong>Plantilla:</strong> ${safeTemplateName}</p>
                    <p><strong>Plan:</strong> ${safePlanName}</p>
                    <p><strong>Para:</strong> ${safeTargetName}</p>
                    <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:15px 0;">
                    <p class="status-msg">
                        ✅ Tu pedido está registrado. Envíanos el comprobante de pago por WhatsApp
                        y en minutos activaremos tu regalo.
                    </p>
                    <a href="${waComprobante}" target="_blank" class="btn-whatsapp" style="display:inline-flex; width:100%; justify-content:center; text-decoration:none; margin-top:10px;">
                        <i class="fa-brands fa-whatsapp"></i> Enviar Comprobante
                    </a>
                </div>
            </div>`;

    } else if (isExpired) {
        statusHTML = `
            <div class="status-card error">
                <div class="status-header">
                    <span>Orden: <strong>#${displayId}</strong></span>
                    <span class="badge-status" style="background:#ef4444;">⌛ Expirada</span>
                </div>
                <div class="status-body">
                    <p>Tu orden ha expirado. Por favor comunícate por soporte.</p>
                </div>
            </div>`;
    } else {
        // Tarjeta VIP para pedidos pagados y activos
        const isUltra  = order.plan_name && order.plan_name.includes('$4.50');
        const benefit  = (order.dynamic_texts && order.dynamic_texts.ultra_benefit) || 'zip';

        let ultraBlock = '';
        if (isUltra && benefit === 'hosting') {
            ultraBlock = `
                <div style="margin-bottom:14px;padding:12px;background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.3);border-radius:10px;text-align:center;">
                    <i class="fa-solid fa-infinity" style="color:var(--accent-cyan);font-size:1.5rem;"></i>
                    <p style="margin:6px 0 0;color:var(--accent-cyan);font-weight:700;">Hosting Extendido Activo</p>
                    <p style="margin:2px 0;font-size:0.8rem;color:var(--color-dim);">Tu regalo estar\u00e1 en l\u00ednea durante 9 meses 💜</p>
                </div>`;
        } else if (isUltra) {
            ultraBlock = `
                <button class="btn-primary" onclick="window.open('${sanitizeUrl(order.zip_url) || '#'}')" style="width:100%; justify-content:center; margin-bottom:14px;">
                    <i class="fa-solid fa-file-zipper"></i> Descargar C\u00f3digo Fuente (.zip)
                </button>`;
        } else {
            ultraBlock = `
                <div class="final-link-box" style="margin-bottom: 14px; border-color:var(--accent-cyan);">
                    <input type="text" readonly value="${escapeHtml(safeFullLink)}" id="finalLink" style="font-size:0.8rem;">
                    <button onclick="copyLink()" title="Copiar"><i class="fa-solid fa-copy"></i></button>
                </div>
                <div class="card-actions" style="display:flex; gap:10px; margin-bottom: 12px;">
                    <button class="btn-primary" onclick="window.open('${safeFullLink}','_blank')" style="flex:1; justify-content:center;">
                        <i class="fa-solid fa-eye"></i> Abrir Link
                    </button>
                    <button class="btn-secondary" onclick="openQRModal('${safeFullLink}')" style="width:50px; padding:0; justify-content:center; flex-shrink:0;" title="Ver C\u00f3digo QR">
                        <i class="fa-solid fa-qrcode"></i>
                    </button>
                </div>`;
        }

        statusHTML = `
            <div class="product-card" style="margin: 0 auto; max-width: 400px; text-align: left; animation: floatUp 0.6s ease-out backwards;">
                <div class="card-image" id="tracking-card-img" style="position:relative; height: 180px; overflow: hidden; border-radius: 12px 12px 0 0;">
                    <span class="badge" style="background:#10b981; color:#fff; font-weight:bold; position:absolute; top:10px; left:10px; z-index:10;"><i class="fa-solid fa-check"></i> Activo</span>
                </div>
                <div class="card-content" style="padding: 20px;">
                    <h3 class="card-title" style="margin:0 0 6px; font-size:1.2rem;">${escapeHtml(order.template_name || 'Regalo Experiencia')}</h3>
                    <p style="font-size:0.82rem;color:var(--color-dim);margin-bottom:14px;">Orden: #${displayId} \u00b7 ${escapeHtml((order.plan_name || '').split('(')[0].trim())}</p>

                    ${buildExpirationBanner(order)}

                    ${ultraBlock}
                </div>
            </div>`;
    }

    orderStatusResult.innerHTML = statusHTML;

    // Pintar canvas thumbnail
    if (isPaid && order.template_id) {
        setTimeout(() => {
            const container = document.getElementById('tracking-card-img');
            if (container && typeof generateThumb === 'function') {
                const cv = generateThumb(order.template_id);
                if (cv) {
                    cv.style.cssText = 'width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;';
                    container.appendChild(cv);
                }
            }
        }, 100);
    }

    // Dashboard afiliado si es Membresía Hub activa
    if (isPaid && isHub && typeof renderAffiliateDashboard === 'function') {
        renderAffiliateDashboard(order.id).then(dashboardHTML => {
            if (dashboardHTML) orderStatusResult.insertAdjacentHTML('beforeend', dashboardHTML);
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
