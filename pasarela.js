// ===================================
// LÓGICA DE LA PASARELA INTERNACIONAL SIMULADA
// ===================================

// CONFIGURACIÓN SUPABASE
const supabaseUrl = 'https://qmnbcmioylgmcbzqrjiv.supabase.co';
const supabaseKey = 'sb_publishable_AZWTMqB-hCTA_Oiiu0juAQ_LRyE9gcc';
let db = null;

try {
    const lib = (typeof supabase !== 'undefined' && supabase.createClient) ? supabase : (typeof supabasejs !== 'undefined' ? supabasejs : null);
    if (lib) {
        db = lib.createClient(supabaseUrl, supabaseKey);
    }
} catch (e) {
    console.error("Error inicializando Supabase:", e);
}

const urlParams = new URLSearchParams(window.location.search);
const plan = urlParams.get('plan') || 'Desconocido';
const template = urlParams.get('template') || 'Desconocida';
const folder = urlParams.get('folder') || 'unknown';
const orderId = urlParams.get('orderId');

document.getElementById('lblPlantilla').innerText = template;
document.getElementById('lblPlan').innerText = plan;

const isSourceCodePlan = plan.includes('$4.50');

// Mostrar aviso si es plan de $7 que incluye descarga
if (isSourceCodePlan) {
    document.getElementById('txtInfoDownload').style.display = 'block';
}

// Simulador de Proceso del Formulario de Tarjeta
const payForm = document.getElementById('payForm');
const loadingOverlay = document.getElementById('loadingOverlay');
const paymentView = document.getElementById('paymentView');
const successScreen = document.getElementById('successScreen');
const btnDownloadZip = document.getElementById('btnDownloadZip');
const msgZipDesc = document.getElementById('msgZipDesc');
const btnWspClaim = document.getElementById('btnWspClaim');

payForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evitamos recargar
    
    // Mostramos overlay de "Procesando"
    loadingOverlay.style.display = 'flex';
    
    // ACTUALIZAR ESTADO EN SUPABASE SI TENEMOS EL ID
    if (orderId && db) {
        await db
            .from('orders')
            .update({ status: 'paid', payment_method: 'Tarjeta/PayPal' })
            .eq('id', orderId);
    }

    // Simulamos un delay de 2.5 Segundos de consulta bancaria
    setTimeout(() => {
        loadingOverlay.style.display = 'none';
        paymentView.style.display = 'none';
        successScreen.style.display = 'block';
        
        // Decisión del botón a mostrar
        if (isSourceCodePlan) {
            btnDownloadZip.style.display = 'flex';
            msgZipDesc.style.display = 'block';
        } else {
            btnWspClaim.style.display = 'flex';
        }
        
    }, 2500);
});

// Acción: Descargar ZIP (Para planes de $7)
function triggerDownload() {
    // Apuntamos al archivo zip alojado en la carpeta del proyecto.
    // Ejemplo: "../arbol/arbol.zip"
    const zipUrl = `../${folder}/${folder}.zip`;
    
    const a = document.createElement('a');
    a.href = zipUrl;
    a.download = `${folder}_corazoncodigo.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Acción: Ir a WhatsApp (Para planes menores Internacionales)
function triggerWspClaim() {
    const phone = "00000000000"; 
    let textBody = `¡Hola! Acabo de hacer el pago con Tarjeta de Crédito 💳 (Internacional) exitosamente a través de la web pasarela.%0A%0A`;
    textBody += `*👉 MI ORDEN YA PAGADA:*%0A`;
    textBody += `- Plantilla: ${template}%0A`;
    textBody += `- Plan Comprado: ${plan}%0A`;
    textBody += `%0AEnvíame el link apenas puedas generarlo con mis detalles y avísame para mandarte las fotos modificables correspondientes al plan. Gracias!`;
    
    window.open(`https://wa.me/${phone}?text=${textBody}`, '_blank');
}
