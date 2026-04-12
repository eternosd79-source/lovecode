// ============================================================
// CORAZÓNCÓDIGO — PAYPAL.JS
// Integración PayPal Checkout para pagos internacionales
//
// Flujo:
//   1. Usuario elige "Resto del Mundo" en paso 4 del wizard
//   2. Se carga el SDK de PayPal dinámicamente con el precio
//   3. Usuario paga → webhook confirma → orden se aprueba auto
//   4. Toast de confirmación + redirect a tracking
//
// CONFIGURACIÓN: Reemplaza PAYPAL_CLIENT_ID con tu Client ID
// de https://developer.paypal.com → My Apps & Credentials
// ============================================================

const PAYPAL_CLIENT_ID = 'sb'; // ← REEMPLAZAR con tu Client ID real en producción
// 'sb' = PayPal Sandbox para pruebas (usa cuentas dummy de paypal.com/sandbox)

let paypalLoaded   = false;
let paypalRendered = false;
let currentPaypalAmount = 0;

/**
 * Carga el SDK de PayPal dinámicamente con la moneda y el amount correcto
 * Se llama cuando el usuario llega al paso 4 y elige "Resto del Mundo"
 */
function loadPayPalSDK(amount) {
    if (!amount || amount <= 0) return;
    currentPaypalAmount = amount;

    // Evitar recargar si ya está listo con el mismo monto
    if (paypalLoaded && paypalRendered) {
        renderPayPalButton(amount);
        return;
    }

    // Eliminar SDK anterior si existía
    const oldScript = document.getElementById('paypal-sdk-script');
    if (oldScript) oldScript.remove();

    const script = document.createElement('script');
    script.id  = 'paypal-sdk-script';
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture&components=buttons`;
    script.onload = () => {
        paypalLoaded = true;
        renderPayPalButton(amount);
    };
    script.onerror = () => {
        console.warn('[PayPal] Error cargando SDK');
        document.getElementById('paypal-button-container').innerHTML =
            '<p style="color:#fbbf24;font-size:0.82rem;text-align:center;padding:10px;"><i class="fa-solid fa-triangle-exclamation"></i> PayPal no disponible. Usa la opción de WhatsApp.</p>';
    };
    document.head.appendChild(script);
}

/**
 * Renderiza el botón de PayPal con el precio de la orden
 */
function renderPayPalButton(amount) {
    const container = document.getElementById('paypal-button-container');
    if (!container) return;

    // Limpiar botón anterior
    container.innerHTML = '';
    paypalRendered = false;

    if (typeof paypal === 'undefined') {
        console.warn('[PayPal] SDK no disponible aún');
        return;
    }

    try {
        paypal.Buttons({
            style: {
                layout: 'vertical',
                color:  'blue',
                shape:  'rect',
                label:  'paypal',
                height: 45
            },

            // Crear orden en PayPal
            createOrder: (data, actions) => {
                const price = parseFloat(currentPaypalAmount).toFixed(2);
                return actions.order.create({
                    purchase_units: [{
                        description: 'CorazónCódigo — Experiencia Romántica Digital',
                        amount: {
                            currency_code: 'USD',
                            value: price
                        }
                    }]
                });
            },

            // Capturar pago exitoso
            onApprove: async (data, actions) => {
                try {
                    const details = await actions.order.capture();
                    console.log('[PayPal] Pago capturado:', details.id);
                    await handlePayPalSuccess(details);
                } catch(e) {
                    console.error('[PayPal] Error capturando:', e);
                    alert('Error procesando el pago. Contacta soporte por WhatsApp.');
                }
            },

            // Si cancela
            onCancel: () => {
                showToast && showToast(
                    'Pago cancelado',
                    'Puedes intentarlo de nuevo cuando quieras.'
                );
            },

            // Error
            onError: (err) => {
                console.error('[PayPal] Error:', err);
                showToast && showToast(
                    'Error en PayPal',
                    'Intenta de nuevo o usa la opción de WhatsApp.'
                );
            }
        }).render('#paypal-button-container');

        paypalRendered = true;
    } catch(e) {
        console.warn('[PayPal] Error renderizando botón:', e.message);
    }
}

/**
 * Procesa el éxito de pago de PayPal:
 * 1. Actualiza la orden en Supabase a 'paid'
 * 2. Envía confirmación por WhatsApp al admin
 * 3. Muestra toast de éxito
 * 4. Abre modal de éxito
 */
async function handlePayPalSuccess(paypalDetails) {
    const paypalTxId = paypalDetails.id;
    const payerEmail = paypalDetails.payer?.email_address || 'N/A';
    const payerName  = paypalDetails.payer?.name?.given_name || 'Cliente';

    // Intentar actualizar la orden actual en Supabase
    if (window.db && window._currentOrderId) {
        try {
            await window.db.from('orders')
                .update({
                    status:         'paid',
                    payment_method: `PayPal - ${paypalTxId}`,
                    final_link:     '' // Admin lo completará según la plantilla
                })
                .eq('id', window._currentOrderId);

            console.log('[PayPal] Orden actualizada a paid:', window._currentOrderId);
        } catch(err) {
            console.warn('[PayPal] Error actualizando orden:', err.message);
        }
    }

    // Mostrar toast de éxito
    showToast && showToast(
        '¡Pago exitoso! 💜',
        `PayPal ID: ${paypalTxId.substring(0, 12)}... Activando tu regalo...`
    );

    // Notificar al admin por WhatsApp
    const waMsg = `💸 PAGO PAYPAL RECIBIDO\n\nID Transacción: ${paypalTxId}\nPagador: ${payerName} (${payerEmail})\nMonto: $${currentPaypalAmount} USD\nOrden CorazónCódigo: ${window._currentOrderId || 'N/A'}\n\n✅ Favor activar el pedido en el admin panel.`;
    const waLink = `https://wa.me/${CONFIG?.whatsappNumber || '593990480389'}?text=${encodeURIComponent(waMsg)}`;

    // Cerrar wizard y mostrar modal éxito
    const checkoutModal = document.getElementById('checkoutModal');
    const successModal  = document.getElementById('successModal');
    const displayOrderId = document.getElementById('displayOrderId');
    const btnGoToWA    = document.getElementById('btnGoToWA');

    if (checkoutModal) checkoutModal.classList.remove('active');
    if (displayOrderId) displayOrderId.textContent = window._currentOrderId?.substring(0,8).toUpperCase() || paypalTxId.substring(0,8);
    if (btnGoToWA) {
        btnGoToWA.onclick = () => {
            window.open(waLink, '_blank');
            if (successModal) successModal.classList.remove('active');
        };
    }
    if (successModal) successModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    localStorage.setItem('lastOrderId', window._currentOrderId || paypalTxId);
}

/**
 * Extrae el precio numérico del plan seleccionado
 * Se llama desde main.js al llegar al paso 4
 */
function getPriceFromPlan(planStr) {
    const match = planStr?.match(/\$(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
}

/**
 * Inicializar PayPal cuando el usuario llega al paso 4 y elige pago mundial
 * Escuchar el tab de "Resto del Mundo"
 */
function initPayPalTabListener() {
    const btnMundo = document.getElementById('btnTabMundo');
    if (!btnMundo) return;

    btnMundo.addEventListener('click', () => {
        // Obtener precio del plan actual
        const selectedPlan = document.querySelector('input[name="planType"]:checked');
        if (!selectedPlan) return;

        const price = getPriceFromPlan(selectedPlan.value);
        if (price > 0) {
            setTimeout(() => loadPayPalSDK(price), 200); // Pequeño delay para que el DOM se muestre
        }
    });
}
