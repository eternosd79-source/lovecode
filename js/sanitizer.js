// ============================================================
// CORAZÓNCÓDIGO — SANITIZER.JS
// Sistema centralizado de sanitización contra XSS
// TODOS los datos user-generated DEBEN pasar por estas funciones
// ============================================================

/**
 * Escape HTML entities para prevenir XSS
 * @param {string} text
 * @returns {string}
 */
function sanitizeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;'
    };
    return String(text).replace(/[&<>"'\/]/g, c => map[c]);
}

/**
 * Validar y limpiar URLs (solo http/https)
 * @param {string} url
 * @returns {string|null}
 */
function sanitizeUrl(url) {
    if (!url) return null;
    const trimmed = String(url).trim();
    if (!/^https?:\/\//i.test(trimmed)) return null;
    try {
        const parsed = new URL(trimmed);
        // Rechazar URLs sospechosas
        if (parsed.hostname.includes('localhost') && !isDevelopment()) return null;
        return trimmed;
    } catch {
        return null;
    }
}

/**
 * Sanitizar atributos de datos (JSON JSONB)
 * @param {object} data
 * @returns {object}
 */
function sanitizeData(data) {
    if (!data || typeof data !== 'object') return {};
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
        // Solo permitir keys alfanuméricas + guion/guion bajo
        if (!/^[a-zA-Z0-9_-]+$/.test(key)) continue;
        
        if (typeof value === 'string') {
            sanitized[key] = sanitizeHtml(value);
        } else if (typeof value === 'number' || typeof value === 'boolean') {
            sanitized[key] = value;
        } else if (value === null) {
            sanitized[key] = null;
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map(v => 
                typeof v === 'string' ? sanitizeHtml(v) : v
            );
        }
    }
    return sanitized;
}

/**
 * Crear elemento DOM de forma segura (con textContent)
 * @param {string} tag - 'div', 'p', 'span', etc.
 * @param {string} text - Texto para insertar (escapado automáticamente)
 * @param {object} attributes - {class, id, data-*, etc}
 * @returns {HTMLElement}
 */
function createSafeElement(tag, text = '', attributes = {}) {
    const el = document.createElement(tag);
    if (text) el.textContent = text; // Usar textContent, NO innerHTML
    for (const [key, value] of Object.entries(attributes)) {
        if (key.startsWith('data-')) {
            el.dataset[key.slice(5)] = String(value);
        } else if (key === 'class') {
            el.className = String(value);
        } else if (key === 'id') {
            el.id = String(value);
        } else if (key === 'aria-' || key.startsWith('aria-')) {
            el.setAttribute(key, String(value));
        }
    }
    return el;
}

/**
 * Inyectar HTML seguro (con validación)
 * @param {HTMLElement} container
 * @param {string} html
 */
function setSafeInnerHTML(container, html) {
    if (!container || !html) return;
    // Crear elemento temporal para validar
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Remover scripts y event handlers
    const scripts = temp.querySelectorAll('script');
    scripts.forEach(s => s.remove());
    
    const withHandlers = temp.querySelectorAll('[on*]');
    withHandlers.forEach(el => {
        for (const attr of el.attributes) {
            if (attr.name.startsWith('on')) {
                el.removeAttribute(attr.name);
            }
        }
    });
    
    container.innerHTML = temp.innerHTML;
}

/**
 * Detectar si estamos en desarrollo
 * @returns {boolean}
 */
function isDevelopment() {
    return (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('.local') ||
        window.location.hostname.includes('dev')
    );
}

/**
 * Sanitizar nombre de usuario (solo alfanuméricos + espacios)
 * @param {string} name
 * @returns {string}
 */
function sanitizeName(name) {
    if (!name) return '';
    return String(name)
        .trim()
        .replace(/[^a-zA-Z0-9\s\-ñáéíóúÑÁÉÍÓÚ]/g, '')
        .substring(0, 100); // Máximo 100 caracteres
}

/**
 * Sanitizar email (validación básica)
 * @param {string} email
 * @returns {string|null}
 */
function sanitizeEmail(email) {
    if (!email) return null;
    const cleaned = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(cleaned) ? cleaned : null;
}

/**
 * Sanitizar teléfono (solo números, +, guiones)
 * @param {string} phone
 * @returns {string|null}
 */
function sanitizePhone(phone) {
    if (!phone) return null;
    const cleaned = String(phone).replace(/[^\d+\-()]/g, '').trim();
    return cleaned.length >= 7 ? cleaned : null;
}

// ============================================================
// EXPORTAR A WINDOW (para acceso global)
// ============================================================
window.Sanitizer = {
    html: sanitizeHtml,
    url: sanitizeUrl,
    data: sanitizeData,
    element: createSafeElement,
    setHTML: setSafeInnerHTML,
    name: sanitizeName,
    email: sanitizeEmail,
    phone: sanitizePhone,
    isDev: isDevelopment
};

console.log('%c✓ Sanitizer.js loaded', 'color:#06b6d4;font-weight:bold;');
