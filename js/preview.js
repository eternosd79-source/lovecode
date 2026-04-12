// ============================================================
// CORAZÓNCÓDIGO — MODALES DE PREVIEW Y QR
// ============================================================

const previewModal    = document.getElementById('previewModal');
const btnClosePreview = document.getElementById('btnClosePreview');
const previewIframe   = document.getElementById('previewIframe');
const prevTitle       = document.getElementById('prevTitle');
const prevOriginalText = document.getElementById('prevOriginalText');
const btnPreviewToBuy = document.getElementById('btnPreviewToBuy');

// QR Modal
const qrModal       = document.getElementById('qrModal');
const btnCloseQR    = document.getElementById('btnCloseQR');
const qrContainer   = document.getElementById('qrContainer');
const qrModalTitle  = document.getElementById('qrModalTitle');
const qrDirectLink  = document.getElementById('qrDirectLink');

// -------------------------------------------------------
// Asignar listeners a las tarjetas del catálogo
// (se llama después de cada renderCatalog)
// -------------------------------------------------------
function attachCatalogListeners() {
    // Vista Previa
    document.querySelectorAll('.btn-preview').forEach(btn => {
        btn.addEventListener('click', (e) => {
            let sid  = e.target.closest('button').getAttribute('data-id');
            let data = catalogData.find(x => x.id === sid);
            activePreviewModel = data;

            if (prevTitle)       prevTitle.innerText = "Vista Previa: " + data.name;
            if (prevOriginalText) prevOriginalText.innerText = data.textRef || '';
            if (previewIframe)   previewIframe.src = window.SITE_BASE_URL + data.path.replace("./", "");

            if (btnPreviewToBuy) {
                if (data.badge.includes('Gratis')) {
                    btnPreviewToBuy.innerHTML = `<i class="fa-solid fa-link"></i> ¡Usar Link Gratis Ahora! 💖`;
                    btnPreviewToBuy.style.background = "#10b981";
                } else {
                    btnPreviewToBuy.innerHTML = `¡Me Encanta, Lo Quiero! ❤`;
                    btnPreviewToBuy.style.background = "";
                }
            }
            if (previewModal) previewModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Comprar
    document.querySelectorAll('.btn-comprar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') return;
            let sName = e.target.closest('button').getAttribute('data-name');
            let sId   = e.target.closest('button').getAttribute('data-id');
            activeTemplateInfo = catalogData.find(x => x.id === sId);
            if (typeof openCheckoutWizard === 'function') openCheckoutWizard(sName);
        });
    });

    // QR Directo para Gratis
    document.querySelectorAll('.btn-qr-direct').forEach(btn => {
        btn.addEventListener('click', (e) => {
            let sId   = e.currentTarget.getAttribute('data-id');
            let sName = e.currentTarget.getAttribute('data-name');
            showFreeQR(sId, sName);
        });
    });
}

// -------------------------------------------------------
// Cerrar Preview
// -------------------------------------------------------
if (btnClosePreview) {
    btnClosePreview.addEventListener('click', () => {
        if (previewModal) previewModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        if (previewIframe)   previewIframe.src = "";
        if (btnPreviewToBuy) btnPreviewToBuy.style.display = "block";
    });
}

// -------------------------------------------------------
// Botón "Me Encanta, Lo Quiero" desde el Modal Preview
// -------------------------------------------------------
if (btnPreviewToBuy) {
    btnPreviewToBuy.addEventListener('click', () => {
        const isFree = activePreviewModel && activePreviewModel.badge.includes('Gratis');

        if (isFree) {
            if (previewModal) previewModal.classList.remove('active');
            const targetName = prompt("¿Para quién es este regalo? (Ej: Dani)\nDeja vacío para usar el link estándar.");
            const customMsg  = prompt("¿Quieres añadir un mensaje o inspiración personalizada?\n(Aparecerá en la animación)");

            let finalPath = activePreviewModel.path;
            let params = new URLSearchParams();
            if (targetName) params.append('para', targetName);
            if (customMsg)  params.append('msg', customMsg);

            const queryString = params.toString();
            if (queryString) finalPath += (finalPath.includes('?') ? '&' : '?') + queryString;

            window.open(window.SITE_BASE_URL + finalPath.replace('./', ''), '_blank');
            document.body.style.overflow = 'auto';
        } else {
            if (previewModal) previewModal.classList.remove('active');
            if (previewIframe) previewIframe.src = "";
            document.body.style.overflow = 'auto';
            if (activePreviewModel && typeof openCheckoutWizard === 'function') {
                activeTemplateInfo = activePreviewModel;
                openCheckoutWizard(activePreviewModel.name);
            }
        }
    });
}

// -------------------------------------------------------
// Modal QR para códigos gratuitos
// -------------------------------------------------------
function showFreeQR(id, name) {
    const targetName = prompt("¿Para quién es este QR? (Opcional)");
    let fullLink = window.SITE_BASE_URL + id + "/index.html";
    if (targetName) fullLink += "?para=" + encodeURIComponent(targetName);

    qrModalTitle.innerText = "QR: " + name + (targetName ? " para " + targetName : "");
    qrDirectLink.value = fullLink;
    qrContainer.innerHTML = "";
    new QRCode(qrContainer, {
        text: fullLink, width: 200, height: 200,
        colorDark: "#000000", colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    qrModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

if (btnCloseQR) {
    btnCloseQR.addEventListener('click', () => {
        qrModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
}

function copyQRLink() {
    const text = qrDirectLink.value;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => alert('Link copiado!'))
            .catch(() => { qrDirectLink.select(); document.execCommand('copy'); alert('Link copiado!'); });
    } else {
        qrDirectLink.select();
        document.execCommand('copy');
        alert('Link copiado!');
    }
}
