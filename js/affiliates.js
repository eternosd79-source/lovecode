// ============================================================
// CORAZÓNCÓDIGO — AFFILIATES.JS
// Sistema completo de afiliados para Membresía Hub ($4.50)
// 
// Flujo:
//   1. Cliente compra Membresía Hub → se crea registro en 'affiliates'
//   2. Recibe link único: corazoncodigo.me/?ref=CODIGO
//   3. Cuando alguien compra via ese link → se registra en 'referrals'
//   4. Admin puede pagar comisión (20% por venta)
//   5. Cliente ve su dashboard en "Mis Pedidos"
// ============================================================

// -------------------------------------------------------
// REF TRACKING — Captura el parámetro ?ref= al entrar
// -------------------------------------------------------
(function captureRefParam() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && ref.length > 3) {
        sessionStorage.setItem('lc_ref', ref.toUpperCase());
        // También guardamos en cookie de 30 días
        document.cookie = `lc_ref=${ref.toUpperCase()};max-age=${30*24*3600};path=/;SameSite=Lax`;
    }
})();

/**
 * Obtiene el código de referido de la sesión actual
 */
function getActiveRef() {
    // Prioridad: sessionStorage → cookie
    const fromSession = sessionStorage.getItem('lc_ref');
    if (fromSession) return fromSession;
    const cookieMatch = document.cookie.match(/lc_ref=([^;]+)/);
    return cookieMatch ? cookieMatch[1] : null;
}

/**
 * Registra una referencia cuando alguien completa una compra
 * Se llama desde checkout.js al procesar la orden exitosa
 */
async function trackReferral(orderId, orderPrice) {
    const refCode = getActiveRef();
    if (!refCode || !window.db) return;

    try {
        // Buscar el afiliado dueño de este código
        const { data: affiliate } = await window.db
            .from('affiliates')
            .select('id, total_referrals, total_earned')
            .eq('ref_code', refCode)
            .single();

        if (!affiliate) return;

        // Calcular comisión (20%)
        const commission = parseFloat((orderPrice * 0.20).toFixed(2));

        // Insertar referral
        await window.db.from('referrals').insert([{
            affiliate_id:   affiliate.id,
            order_id:       orderId,
            commission_usd: commission,
            status:         'pending',
            ref_code:       refCode
        }]);

        // Actualizar contador del afiliado
        await window.db.from('affiliates').update({
            total_referrals: (affiliate.total_referrals || 0) + 1,
            total_earned:    parseFloat(((affiliate.total_earned || 0) + commission).toFixed(2))
        }).eq('id', affiliate.id);

        console.log(`[Affiliates] Referral registrado — código: ${refCode}, comisión: $${commission}`);
    } catch(e) {
        console.warn('[Affiliates] Error tracking referral:', e.message);
    }
}
window.trackReferral = trackReferral;

/**
 * Crea un nuevo afiliado cuando alguien compra la Membresía Hub
 * Se llama desde checkout.js cuando el plan es Membresía Hub
 */
async function createOrGetAffiliate(orderId, customerName) {
    if (!window.db) return null;
    try {
        // Generar código único: nombre + 6 chars random
        const base = (customerName || 'LC')
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .substring(0, 4);
        const rand = Math.random().toString(36).substr(2, 5).toUpperCase();
        const refCode = `${base}${rand}`;

        const { data, error } = await window.db.from('affiliates').insert([{
            order_id:        orderId,
            ref_code:        refCode,
            customer_name:   customerName,
            total_referrals: 0,
            total_earned:    0,
            status:          'active'
        }]).select().single();

        if (error) throw error;
        console.log(`[Affiliates] Nuevo afiliado creado: ${refCode}`);
        return data;
    } catch(e) {
        console.warn('[Affiliates] Error creando afiliado:', e.message);
        return null;
    }
}
window.createOrGetAffiliate = createOrGetAffiliate;

/**
 * Renderiza el dashboard de afiliado en la sección "Mis Pedidos"
 * Se llama desde tracking.js cuando la orden es Membresía Hub
 */
async function renderAffiliateDashboard(orderId) {
    if (!window.db) return '';

    try {
        // Buscar afiliado por order_id
        const { data: affiliate } = await window.db
            .from('affiliates')
            .select('*, referrals(*)')
            .eq('order_id', orderId)
            .single();

        if (!affiliate) return '';

        // Calcular ganancia pendiente
        const pendingEarnings = (affiliate.referrals || [])
            .filter(r => r.status === 'pending')
            .reduce((sum, r) => sum + (r.commission_usd || 0), 0);
        const paidEarnings = (affiliate.referrals || [])
            .filter(r => r.status === 'paid')
            .reduce((sum, r) => sum + (r.commission_usd || 0), 0);

        const siteBase = window.SITE_BASE_URL;
        const refLink  = `${siteBase}/?ref=${affiliate.ref_code}`;

        return `
        <div class="affiliate-dashboard">
            <h4><i class="fa-solid fa-users"></i> Tu Panel de Afiliad@</h4>
            <p style="font-size:0.85rem; color:var(--color-dim); margin-bottom:15px;">
                Comparte tu link único y gana <strong style="color:var(--accent-cyan);">20% de comisión</strong> por cada venta que generes.
            </p>
            <div class="affiliate-stats-row">
                <div class="aff-stat">
                    <span class="aff-num">${affiliate.total_referrals || 0}</span>
                    <span class="aff-lbl">Referidos</span>
                </div>
                <div class="aff-stat">
                    <span class="aff-num">$${parseFloat(pendingEarnings).toFixed(2)}</span>
                    <span class="aff-lbl">Pendiente</span>
                </div>
                <div class="aff-stat">
                    <span class="aff-num">$${parseFloat(paidEarnings).toFixed(2)}</span>
                    <span class="aff-lbl">Cobrado</span>
                </div>
            </div>
            <p style="font-size:0.8rem; color:var(--color-dim); margin-bottom:10px;">
                <i class="fa-solid fa-link" style="color:var(--accent-purple);"></i>
                Tu link de referido (compártelo en redes sociales, WhatsApp, etc.):
            </p>
            <div class="affiliate-ref-box">
                <input type="text" value="${refLink}" id="affRefLink" readonly>
                <button onclick="copyAffiliateLink()"><i class="fa-solid fa-copy"></i> Copiar Link</button>
            </div>
            <p style="font-size:0.75rem; color:var(--color-dim); margin-top:12px;">
                <i class="fa-solid fa-circle-info"></i>
                Los pagos de comisiones se realizan vía WhatsApp al acumular $5+ en ganancias.
                <a href="https://wa.me/${CONFIG?.whatsappNumber || '593990480389'}?text=Hola%20CorazónCódigo!%20Quiero%20cobrar%20mis%20comisiones%20de%20afiliado." 
                   target="_blank" style="color:var(--accent-cyan); text-decoration:none;">
                   Solicitar pago →
                </a>
            </p>
        </div>`;
    } catch(e) {
        console.warn('[Affiliates] Error cargando dashboard:', e.message);
        return '';
    }
}
window.renderAffiliateDashboard = renderAffiliateDashboard;

/**
 * Copia el link de afiliado al portapapeles
 */
function copyAffiliateLink() {
    const input = document.getElementById('affRefLink');
    if (!input) return;
    const text = input.value;
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast && showToast('¡Link copiado!', 'Compártelo y empieza a ganar comisiones. 💜');
        });
    } else {
        input.select();
        document.execCommand('copy');
        alert('Link de afiliado copiado!');
    }
}
window.copyAffiliateLink = copyAffiliateLink;
