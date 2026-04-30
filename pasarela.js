// ===================================
// PASARELA REAL (Bancos + QR + PayPhone)
// ===================================
const supabaseUrl = 'https://qmnbcmioylgmcbzqrjiv.supabase.co';
const supabaseKey = 'sb_publishable_AZWTMqB-hCTA_Oiiu0juAQ_LRyE9gcc';
const WHATSAPP = '593990480389';
let db = null;

try {
    const lib = (typeof supabase !== 'undefined' && supabase.createClient)
        ? supabase
        : (typeof supabasejs !== 'undefined' ? supabasejs : null);
    if (lib) db = lib.createClient(supabaseUrl, supabaseKey);
} catch (e) {
    console.error('Error inicializando Supabase:', e);
}

const urlParams = new URLSearchParams(window.location.search);
const plan = urlParams.get('plan') || 'Desconocido';
const template = urlParams.get('template') || urlParams.get('tpl') || 'Desconocida';
const orderId = urlParams.get('orderId');

function initPasarela() {
    const lblPlantilla = document.getElementById('lblPlantilla');
    const lblPlan = document.getElementById('lblPlan');
    const lblOrderId = document.getElementById('lblOrderId');
    if (lblPlantilla) lblPlantilla.textContent = template;
    if (lblPlan) lblPlan.textContent = plan;
    if (lblOrderId) lblOrderId.textContent = orderId ? orderId.substring(0, 8).toUpperCase() : 'N/A';

    const btnTabEcuador = document.getElementById('btnTabEcuador');
    const btnTabMundo = document.getElementById('btnTabMundo');
    if (btnTabEcuador) btnTabEcuador.addEventListener('click', () => setTab('ec'));
    if (btnTabMundo) btnTabMundo.addEventListener('click', () => setTab('ww'));
    setTab('ec');
}

function setTab(tab) {
    const btnEc = document.getElementById('btnTabEcuador');
    const btnWw = document.getElementById('btnTabMundo');
    const ec = document.getElementById('payEcuador');
    const ww = document.getElementById('payMundo');
    if (!btnEc || !btnWw || !ec || !ww) return;

    const isEc = tab === 'ec';
    btnEc.classList.toggle('active', isEc);
    btnWw.classList.toggle('active', !isEc);
    ec.style.display = isEc ? 'block' : 'none';
    ww.style.display = isEc ? 'none' : 'block';
}

const bankDataInfo = {
    pichincha: {
        title: 'Banco Pichincha',
        qr: 'qrPichincha.png',
        text: `<strong>Pichincha</strong>Tipo: CUENTA Ahorros<br>Número cuenta: 20005033691<br>Nombre: DENNIS ALBERTO VILLAGRAN<br>RUC/Identificacion: 1720384161<br>Correo: dennisvillagran16pin@gmail.com<br>Celular: 0990480389`
    },
    loja: {
        title: 'Banco de Loja',
        qr: 'qrLoja.png',
        text: `<strong>Banco de Loja</strong>Tipo: CUENTA Ahorros<br>Número cuenta: 20005033691<br>Nombre: DENNIS ALBERTO VILLAGRAN<br>RUC/Identificacion: 1720384161<br>Correo: dennisvillagran16pin@gmail.com<br>Celular: 0990480389`
    },
    produbanco: {
        title: 'Produbanco',
        qr: null,
        text: `<strong>Produbanco</strong>Tipo: CUENTA Ahorros<br>Número cuenta: 20005033691<br>Nombre: DENNIS ALBERTO VILLAGRAN<br>RUC/Identificacion: 1720384161<br>Correo: dennisvillagran16pin@gmail.com<br>Celular: 0990480389`
    }
};

function showBankModal(bankId) {
    const data = bankDataInfo[bankId];
    if (!data) return;
    const overlay = document.getElementById('bankModalOverlay');
    const title = document.getElementById('bankModalTitle');
    const qrContainer = document.getElementById('bankModalQr');
    const qrImg = document.getElementById('bankModalImg');
    const text = document.getElementById('bankModalText');
    if (!overlay || !title || !qrContainer || !qrImg || !text) return;

    title.textContent = data.title;
    if (data.qr) {
        qrImg.src = data.qr;
        qrContainer.style.display = 'block';
    } else {
        qrContainer.style.display = 'none';
    }
    text.innerHTML = `<div class="bank-text-modal">${data.text}</div>`;
    overlay.style.display = 'flex';
}

function closeBankModal(e) {
    const overlay = document.getElementById('bankModalOverlay');
    if (!overlay) return;
    if (!e || e.target.id === 'bankModalOverlay' || e.target.classList.contains('bank-modal-close') || e.target.tagName === 'BUTTON') {
        overlay.style.display = 'none';
    }
}

async function markOrderPaid(method) {
    if (!orderId || !db) return;
    try {
        await db.from('orders')
            .update({ status: 'paid', payment_method: method })
            .eq('id', orderId);
    } catch (e) {
        console.warn('[Pasarela] No se pudo actualizar estado de orden:', e?.message || e);
    }
}

async function confirmPayment(method) {
    await markOrderPaid(method);
    const msg = encodeURIComponent(
        `Hola CorazónCódigo! Ya hice el pago de mi pedido.\n\nID: ${orderId || 'N/A'}\nPlantilla: ${template}\nPlan: ${plan}\nMétodo: ${method}\n\nTe envío el comprobante.`
    );
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank');
}

window.showBankModal = showBankModal;
window.closeBankModal = closeBankModal;
window.confirmPayment = confirmPayment;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPasarela);
} else {
    initPasarela();
}
