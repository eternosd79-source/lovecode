/**
 * CorazónCódigo - Personalizador Universal v2.0 (Powered by CC_Core)
 * Este script actúa como puente entre el SDK central y las experiencias.
 */

(async function() {
    'use strict';

    // 1. Carga dinámica del SDK si no está presente
    async function ensureCore() {
        if (window.CC_Core) return window.CC_Core;
        
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = '../js/cc-core.js';
            script.onload = () => resolve(window.CC_Core);
            script.onerror = () => {
                console.error("CC_Core could not be loaded. Falling back to legacy mode.");
                resolve(null);
            };
            document.head.appendChild(script);
        });
    }

    const Core = await ensureCore();

    // 2. Lógica de Personalización
    async function applyPersonalization() {
        if (!Core) return;

        // Mostrar Loader y Pantalla de Inicio
        const data = await Core.loadData();
        window.ccData = data; // Mantener compatibilidad con scripts de plantillas

        // --- Mapeo de Datos a UI ---
        _applyTexts(data);
        _applyMultimedia(data);
        _applyPhotos(data);
        _applyFloatingImage(data);

        // --- Finalizar Carga ---
        Core.hideLoader();
        Core.showStartOverlay(() => {
            if (window.ccAudio) window.ccAudio.play();
            // Disparar evento de inicio para la plantilla
            document.dispatchEvent(new CustomEvent('cc:started', { detail: data }));
        });
    }

    function _applyTexts(data) {
        const para = data.target_name || data.para;
        const mensaje = data.custom_message || data.mensaje;
        const fecha = data.custom_date || data.fecha;

        // 1. Aplicar todos los campos de dynamic_texts (Prioridad Máxima - Mapeo Universal)
        if (data.dynamic_texts) {
            Object.keys(data.dynamic_texts).forEach(key => {
                const val = data.dynamic_texts[key];
                if (!val) return;

                // Buscar por ID o Clase
                const els = document.querySelectorAll(`#${key}, .${key}`);
                els.forEach(el => {
                    // Usamos innerHTML para permitir que el usuario meta <br> si lo desea (o por compatibilidad)
                    // pero limpiando para evitar inyección si es necesario. Aquí confiamos en el input del admin.
                    el.innerText = val;
                });
            });
        }

        // 2. Aplicar campos estándar (Fallback si no están en dynamic_texts)
        if (para && (!data.dynamic_texts || !data.dynamic_texts.para)) {
            const ids = ['loveText', 'cl1', 'phraseTop', 'mainTitle', 'targetName', 'msgLove'];
            ids.forEach(id => { const el = document.getElementById(id); if (el) el.innerText = para; });
            document.querySelectorAll('.personalizar-nombre, .target-name').forEach(el => {
                el.innerText = para;
            });
            // Solo sobreescribir .title si no se aplicó por dynamic_texts
            if (!data.dynamic_texts || !data.dynamic_texts.title) {
                document.querySelectorAll('.title').forEach(el => {
                    if (el.innerText.length < 50) el.innerText = para;
                });
            }
        }

        if (mensaje && (!data.dynamic_texts || !data.dynamic_texts.message)) {
            const frases = mensaje.split('\n').filter(f => f.trim() !== "");
            if (typeof window.pairs !== 'undefined' && frases.length > 0) {
                window.pairs = frases.map(f => ({ top: f, bot: "" }));
            }
            const msgEls = ['heartCaption', 'final-verse', 'intro-sub', 'phraseBot', 'heart-caption'];
            msgEls.forEach(id => { const el = document.getElementById(id); if (el) el.innerText = mensaje; });
            document.querySelectorAll('.personalizar-mensaje, .message, .poem-container p, .dedicatoria').forEach(el => {
                el.innerText = mensaje;
            });
        }

        if (fecha) {
            if (typeof window.updateChronometerDate === 'function') {
                window.updateChronometerDate(fecha);
            }
            document.querySelectorAll('.fecha-aniversario, .date-display').forEach(el => {
                el.innerText = fecha;
            });
        }

        // Parámetros dinámicos txt_ desde URL (prioridad máxima para pruebas rápidas)
        const params = Core.getParams();
        Object.keys(params).forEach(key => {
            if (key.startsWith('txt_')) {
                const targetId = key.replace('txt_', '');
                const el = document.getElementById(targetId) || document.querySelector(`.${targetId}`);
                if (el) el.innerText = params[key];
            }
        });
    }

    function _applyMultimedia(data) {
        const musicUrl = data.music_url || data.musica;
        if (!musicUrl) return;

        let resolvedUrl = musicUrl;
        if (!/^https?:\/\//i.test(resolvedUrl)) {
            const MUSIC_BASE = 'https://qmnbcmioylgmcbzqrjiv.supabase.co/storage/v1/object/public/music_library/';
            resolvedUrl = MUSIC_BASE + encodeURIComponent(resolvedUrl.replace(/^(\.\.\/|\.\/)+/, '')).replace(/%2F/g, '/');
        }

        const start = data.music_start || data.mStart || 0;
        const duration = data.music_duration || data.mDur || 30;

        window.ccAudio = Core.setupAudio(resolvedUrl, start, duration);
    }

    function _applyPhotos(data) {
        const photos = data.photo_urls || data.fotos || [];
        if (photos.length === 0) return;

        const imgSelectors = ['.user-photo', '.couple-photo', '.dynamic-img', '.photo-slot', 'img[src*="thumb.png"]', 'img[src*="foto.jpg"]'];
        const imgElements = document.querySelectorAll(imgSelectors.join(', '));
        
        imgElements.forEach((img, idx) => {
            const url = photos[idx % photos.length];
            if (url) img.src = url;
        });

        const bgSelectors = ['.user-photo-bg', '.photo-bg', '.dynamic-bg'];
        document.querySelectorAll(bgSelectors.join(', ')).forEach((el, idx) => {
            const url = photos[idx % photos.length];
            if (url) {
                el.style.backgroundImage = `url('${url}')`;
                el.style.backgroundSize = 'cover';
            }
        });
    }

    function _applyFloatingImage(data) {
        const params = Core.getParams();
        const flImgUrl = params.flImg || (data.dynamic_texts && data.dynamic_texts.flImg);
        if (!flImgUrl) return;

        const flImgNode = document.createElement('img');
        flImgNode.src = flImgUrl;
        flImgNode.className = 'cc-floating-image';
        flImgNode.style.cssText = `
            position: fixed; z-index: 999999; object-fit: contain; border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.8); border: 2px solid rgba(255,255,255,0.2);
            left: ${params.flX || 50}%; top: ${params.flY || 50}%; width: ${params.flS || 40}vmin;
            height: ${params.flS || 40}vmin; transform: translate(-50%, -50%);
            opacity: 0; transition: opacity 1s ease;
        `;
        document.body.appendChild(flImgNode);
        setTimeout(() => flImgNode.style.opacity = '1', (params.flT || 0) * 1000);
        
        document.querySelectorAll('.poem-container, .dynamic-text, .dedicatoria').forEach(el => el.style.opacity = '0');
    }

    // --- Ejecución ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyPersonalization);
    } else {
        applyPersonalization();
    }

})();
