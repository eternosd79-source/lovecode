// ===================================
// PASARELA REAL (Bancos + QR + PayPhone)
// ===================================

const supabaseUrl = 'https://qmnbcmioylgmcbzqrjiv.supabase.co';
const supabaseKey = 'sb_publishable_AZWTMqB-hCTA_Oiiu0juAQ_LRyE9gcc';
let db = null;

// Datos de los bancos centralizados - INFORMACIÓN COMPLETA
const bankDataInfo = {
    pichincha: {
        title: 'Banco Pichincha',
        qr: null, // Temporalmente sin QR
        text: `<strong>🏦 BANCO PICHINCHA</strong><br><br>
               <strong>Tipo de Cuenta:</strong> Cuenta de Ahorros<br>
               <strong>Número de Cuenta:</strong> 20005033691<br>
               <strong>Titular:</strong> DENNIS ALBERTO VILLAGRAN CABRERA<br>
               <strong>Cédula/RUC:</strong> 1720384161<br>
               <strong>Correo:</strong> dennisvillagran16pin@gmail.com<br>
               <strong>Celular:</strong> 0990480389<br><br>
               <strong>📋 INSTRUCCIONES:</strong><br>
               1. Abre tu app del Banco Pichincha<br>
               2. Selecciona "Transferir"<br>
               3. Ingresa el número: 20005033691<br>
               4. Confirma el titular: DENNIS ALBERTO VILLAGRAN CABRERA<br>
               5. Realiza la transferencia<br><br>
               <em>💡 Una vez realizado el pago, haz clic en "Ya pagué, enviar comprobante"</em>`
    },
    loja: {
        title: 'Banco de Loja',
        qr: null, // Temporalmente sin QR
        text: `<strong>🏦 BANCO DE LOJA</strong><br><br>
               <strong>Tipo de Cuenta:</strong> Cuenta de Ahorros<br>
               <strong>Número de Cuenta:</strong> 20005033691<br>
               <strong>Titular:</strong> DENNIS ALBERTO VILLAGRAN CABRERA<br>
               <strong>Cédula/RUC:</strong> 1720384161<br>
               <strong>Correo:</strong> dennisvillagran16pin@gmail.com<br>
               <strong>Celular:</strong> 0990480389<br><br>
               <strong>📋 INSTRUCCIONES:</strong><br>
               1. Abre tu app del Banco de Loja<br>
               2. Selecciona "Transferencias"<br>
               3. Ingresa el número: 20005033691<br>
               4. Confirma el titular: DENNIS ALBERTO VILLAGRAN CABRERA<br>
               5. Realiza la transferencia<br><br>
               <em>💡 Una vez realizado el pago, haz clic en "Ya pagué, enviar comprobante"</em>`
    },
    produbanco: {
        title: 'Produbanco',
        qr: null,
        text: `<strong>🏦 PRODUBANCO</strong><br><br>
               <strong>Tipo de Cuenta:</strong> Cuenta de Ahorros<br>
               <strong>Número de Cuenta:</strong> 20005033691<br>
               <strong>Titular:</strong> DENNIS ALBERTO VILLAGRAN CABRERA<br>
               <strong>Cédula/RUC:</strong> 1720384161<br>
               <strong>Correo:</strong> dennisvillagran16pin@gmail.com<br>
               <strong>Celular:</strong> 0990480389<br><br>
               <strong>📋 INSTRUCCIONES:</strong><br>
               1. Abre tu app de Produbanco<br>
               2. Selecciona "Pagar y Transferir"<br>
               3. Ingresa el número: 20005033691<br>
               4. Confirma el titular: DENNIS ALBERTO VILLAGRAN CABRERA<br>
               5. Realiza la transferencia<br><br>
               <em>💡 Una vez realizado el pago, haz clic en "Ya pagué, enviar comprobante"</em>`
    }
};

// 1. Inicialización de Base de Datos
try {
    const lib = (typeof supabase !== 'undefined' && supabase.createClient)
        ? supabase
        : (typeof supabasejs !== 'undefined' ? supabasejs : null);
    if (lib) db = lib.createClient(supabaseUrl, supabaseKey);
} catch (e) {
    console.error('Error inicializando Supabase:', e);
}

// 2. Funciones de Navegación (Tabs)
function setTab(tab) {
    console.log("CC_Pasarela: Cambiando a pestaña:", tab);
    
    const btnEc = document.getElementById('btnTabEcuador');
    const btnWw = document.getElementById('btnTabMundo');
    const ec = document.getElementById('payEcuador');
    const ww = document.getElementById('payMundo');

    if (!btnEc || !btnWw || !ec || !ww) {
        console.error("CC_Pasarela: No se encontraron los elementos de las pestañas", {
            btnEc: !!btnEc,
            btnWw: !!btnWw,
            ec: !!ec,
            ww: !!ww
        });
        return;
    }

    if (tab === 'ec') {
        btnEc.classList.add('active');
        btnWw.classList.remove('active');
        ec.style.display = 'block';
        ww.style.display = 'none';
        console.log("CC_Pasarela: Mostrando sección Ecuador");
    } else {
        btnEc.classList.remove('active');
        btnWw.classList.add('active');
        ec.style.display = 'none';
        ww.style.display = 'block';
        console.log("CC_Pasarela: Mostrando sección Resto del Mundo");
    }
    console.log("CC_Pasarela: Pestaña cambiada exitosamente a", tab);
}

// 3. Funciones de UI (Modales)
function showBankModal(bankId) {
    console.log("CC_Pasarela: Abriendo modal para", bankId);
    
    // Verificar que el banco exista
    if (!bankDataInfo[bankId]) {
        console.error("CC_Pasarela: No hay datos para el banco", bankId);
        alert('Banco no encontrado. Por favor selecciona otro banco.');
        return;
    }

    const data = bankDataInfo[bankId];
    console.log("CC_Pasarela: Datos encontrados:", data);

    // Obtener elementos del DOM
    const overlay = document.getElementById('bankModalOverlay');
    const title = document.getElementById('bankModalTitle');
    const qrContainer = document.getElementById('bankModalQr');
    const qrImg = document.getElementById('bankModalImg');
    const text = document.getElementById('bankModalText');

    // Verificar que todos los elementos existan
    if (!overlay || !title || !qrContainer || !qrImg || !text) {
        console.error("CC_Pasarela: No se encontraron los elementos del modal", {
            overlay: !!overlay,
            title: !!title,
            qrContainer: !!qrContainer,
            qrImg: !!qrImg,
            text: !!text
        });
        alert('Error al abrir la ventana bancaria. Por favor recarga la página.');
        return;
    }

    // Establecer el título
    title.textContent = data.title;
    console.log("CC_Pasarela: Título establecido:", data.title);

    // Generar QR dinámicamente usando API externa
    const qrData = `BANCO: ${data.title}\nCUENTA: 20005033691\nTITULAR: DENNIS ALBERTO VILLAGRAN CABRERA\nTIPO: AHORROS\nRUC: 1720384161`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
    
    // Mostrar QR
    qrImg.src = qrUrl;
    qrContainer.style.display = 'block';
    qrImg.onerror = () => {
        console.warn("CC_Pasarela: No se pudo cargar QR generado");
        qrContainer.style.display = 'none';
    };
    console.log("CC_Pasarela: QR generado y mostrado");

    // Establecer el texto con la información bancaria formateada
    const formattedText = `
        <div class="bank-text-modal">
            <strong style="color: #22d3ee; font-size: 1.2rem;">🏦 ${data.title}</strong><br><br>
            <strong>Tipo de Cuenta:</strong> Cuenta de Ahorros<br>
            <strong>Número de Cuenta:</strong> <span style="color: #fbbf24; font-family: monospace; font-size: 1.1rem;">20005033691</span><br>
            <strong>Titular:</strong> DENNIS ALBERTO VILLAGRAN CABRERA<br>
            <strong>Cédula/RUC:</strong> 1720384161<br>
            <strong>Correo:</strong> dennisvillagran16pin@gmail.com<br>
            <strong>Celular:</strong> 0990480389<br><br>
            <div style="background: rgba(34, 211, 238, 0.1); padding: 15px; border-radius: 10px; border-left: 4px solid #22d3ee;">
                <strong style="color: #22d3ee;">📋 INSTRUCCIONES DE PAGO:</strong><br>
                1. Abre la aplicación de tu banco<br>
                2. Selecciona la opción "Transferir"<br>
                3. Ingresa el número de cuenta: <strong>20005033691</strong><br>
                4. Verifica el titular: <strong>DENNIS ALBERTO VILLAGRAN CABRERA</strong><br>
                5. Ingresa el monto y confirma la transferencia<br>
                6. Guarda el comprobante de pago
            </div>
            <br>
            <em style="color: #fbbf24;">💡 Una vez realizado el pago, haz clic en "Ya pagué, enviar comprobante" para notificarlo.</em>
        </div>
    `;
    
    text.innerHTML = formattedText;
    console.log("CC_Pasarela: Texto formateado establecido");

    // Mostrar el modal
    overlay.style.display = 'flex';
    console.log("CC_Pasarela: Modal mostrado correctamente para", data.title);
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
    
    // Forzar scroll al inicio del modal
    setTimeout(() => {
        if (overlay && overlay.querySelector('.bank-modal-content')) {
            overlay.querySelector('.bank-modal-content').scrollTop = 0;
        }
    }, 100);
}

function closeBankModal() {
    const overlay = document.getElementById('bankModalOverlay');
    if (overlay) {
        overlay.style.display = 'none';
        console.log("CC_Pasarela: Modal cerrado");
    }
    // Restaurar scroll del body
    document.body.style.overflow = 'auto';
}

// 4. Lógica Principal
async function initPasarela() {
    console.log("CC_Pasarela: Ejecutando init...");

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    const plan = urlParams.get('plan') || 'Básico';
    const template = urlParams.get('template') || urlParams.get('tpl') || 'Desconocida';

    console.log("CC_Pasarela: Parámetros recibidos:", { orderId, plan, template });

    // Rellenar resumen
    const lblOrderId = document.getElementById('lblOrderId');
    const lblPlantilla = document.getElementById('lblPlantilla');
    const lblPlan = document.getElementById('lblPlan');

    if (lblOrderId) {
        const displayId = orderId ? orderId.substring(0, 8).toUpperCase() : 'CARGANDO...';
        lblOrderId.textContent = displayId;
        console.log("CC_Pasarela: ID Order establecido:", displayId);
    }
    if (lblPlantilla) {
        const decodedTemplate = decodeURIComponent(template);
        lblPlantilla.textContent = decodedTemplate;
        console.log("CC_Pasarela: Plantilla establecida:", decodedTemplate);
    }
    if (lblPlan) {
        const decodedPlan = decodeURIComponent(plan);
        lblPlan.textContent = decodedPlan;
        console.log("CC_Pasarela: Plan establecido:", decodedPlan);
    }

    // Si no hay orderId, intentar obtenerlo del localStorage
    if (!orderId && lblOrderId) {
        const lastOrderId = localStorage.getItem('lastOrderId');
        if (lastOrderId) {
            lblOrderId.textContent = lastOrderId.substring(0, 8).toUpperCase();
            console.log("CC_Pasarela: ID Order obtenido del localStorage:", lastOrderId);
        }
    }

    // Event Listeners para Tabs (Uso de addEventListener para mayor seguridad)
    const btnTabEcuador = document.getElementById('btnTabEcuador');
    const btnTabMundo = document.getElementById('btnTabMundo');
    
    if (btnTabEcuador) {
        btnTabEcuador.onclick = (e) => {
            e.preventDefault();
            console.log("CC_Pasarela: Click en tab Ecuador");
            setTab('ec');
        };
        // También agregar addEventListener como backup
        btnTabEcuador.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("CC_Pasarela: Click en tab Ecuador (addEventListener)");
            setTab('ec');
        });
    } else {
        console.error("CC_Pasarela: No se encontró btnTabEcuador");
    }
    
    if (btnTabMundo) {
        btnTabMundo.onclick = (e) => {
            e.preventDefault();
            console.log("CC_Pasarela: Click en tab Mundo");
            setTab('ww');
        };
        // También agregar addEventListener como backup
        btnTabMundo.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("CC_Pasarela: Click en tab Mundo (addEventListener)");
            setTab('ww');
        });
    } else {
        console.error("CC_Pasarela: No se encontró btnTabMundo");
    }

    // Event Listeners para botones de bancos (MUY IMPORTANTE)
    console.log("CC_Pasarela: Configurando botones de bancos...");
    
    // Configurar botón de Banco Pichincha
    const btnPichincha = document.querySelector('[onclick="showBankModal(\'pichincha\')"]');
    if (btnPichincha) {
        btnPichincha.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("CC_Pasarela: Click en Banco Pichincha (addEventListener)");
            showBankModal('pichincha');
        });
        console.log("CC_Pasarela: Botón Pichincha configurado");
    } else {
        console.error("CC_Pasarela: No se encontró botón Pichincha");
    }

    // Configurar botón de Banco de Loja
    const btnLoja = document.querySelector('[onclick="showBankModal(\'loja\')"]');
    if (btnLoja) {
        btnLoja.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("CC_Pasarela: Click en Banco de Loja (addEventListener)");
            showBankModal('loja');
        });
        console.log("CC_Pasarela: Botón Loja configurado");
    } else {
        console.error("CC_Pasarela: No se encontró botón Loja");
    }

    // Configurar botón de Produbanco
    const btnProdubanco = document.querySelector('[onclick="showBankModal(\'produbanco\')"]');
    if (btnProdubanco) {
        btnProdubanco.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("CC_Pasarela: Click en Produbanco (addEventListener)");
            showBankModal('produbanco');
        });
        console.log("CC_Pasarela: Botón Produbanco configurado");
    } else {
        console.error("CC_Pasarela: No se encontró botón Produbanco");
    }

    // Lógica de Cupón
    const btnApplyPromo = document.getElementById('btnApplyPromo');
    const inpPromoCode = document.getElementById('inpPromoCode');
    const promoCodeMsg = document.getElementById('promoCodeMsg');

    if (btnApplyPromo && inpPromoCode) {
        btnApplyPromo.onclick = async () => {
            const code = inpPromoCode.value.trim().toUpperCase();
            if (!code || !db) return;

            btnApplyPromo.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            try {
                const { data: promo } = await db.from('promo_codes').select('*').eq('code', code).eq('is_used', false).maybeSingle();
                if (!promo) {
                    promoCodeMsg.style.display = 'block';
                    promoCodeMsg.style.color = '#ff5e7e';
                    promoCodeMsg.innerText = '❌ Código inválido.';
                } else {
                    promoCodeMsg.style.display = 'block';
                    promoCodeMsg.style.color = '#10b981';
                    promoCodeMsg.innerText = '✅ ¡Validado!';
                    await db.from('orders').update({ status: 'paid', payment_method: `CUPÓN: ${code}` }).eq('id', orderId);
                    await db.from('promo_codes').update({ is_used: true, used_by: orderId }).eq('code', code);
                    setTimeout(() => window.location.href = `index.html?orderId=${orderId}#mis-pedidos`, 1500);
                }
            } catch (e) { console.error(e); }
            btnApplyPromo.innerHTML = 'Validar';
        };
    }

    // Inicializar estado visual por defecto
    setTab('ec');
}

// 5. WhatsApp y Pagos
async function confirmPayment(method) {
    console.log("CC_Pasarela: Iniciando confirmación de pago con método:", method);
    
    const urlParams = new URLSearchParams(window.location.search);
    let orderId = urlParams.get('orderId');
    const plan = urlParams.get('plan') || 'Básico';
    
    // Si no hay orderId en URL, intentar obtenerlo del localStorage o del DOM
    if (!orderId) {
        orderId = localStorage.getItem('lastOrderId');
        if (!orderId) {
            const lblOrderId = document.getElementById('lblOrderId');
            if (lblOrderId && lblOrderId.textContent !== '...' && lblOrderId.textContent !== 'CARGANDO...' && lblOrderId.textContent !== 'N/A') {
                orderId = lblOrderId.textContent;
            }
        }
    }
    
    // Número de WhatsApp con fallback
    const waNumber = (typeof CONFIG !== 'undefined' && CONFIG.whatsappNumber) ? CONFIG.whatsappNumber : '593990480389';
    
    console.log("CC_Pasarela: Datos para WhatsApp:", { orderId, plan, method, waNumber });

    // Actualizar estado en base de datos si es posible
    if (db && orderId) {
        try {
            await db.from('orders').update({ status: 'paid', payment_method: method }).eq('id', orderId);
            console.log("CC_Pasarela: Estado actualizado en base de datos");
        } catch (error) {
            console.warn("CC_Pasarela: Error actualizando base de datos:", error);
        }
    }

    // Construir mensaje
    const msg = `Hola CorazónCódigo! Ya hice el pago de mi pedido.\n\nID: ${orderId || 'N/A'}\nPlan: ${decodeURIComponent(plan)}\nMétodo: ${method}\n\nTe envío el comprobante. 💖`;
    
    console.log("CC_Pasarela: Abriendo WhatsApp con mensaje:", msg);
    
    // Abrir WhatsApp
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
}

// Exponer funciones al scope global (necesario para onclick en HTML)
window.showBankModal = showBankModal;
window.closeBankModal = closeBankModal;
window.confirmPayment = confirmPayment;
window.setTab = setTab;

// Ejecución garantizada
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPasarela);
} else {
    initPasarela();
}
