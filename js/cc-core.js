/**
 * CorazónCódigo Core SDK v1.0
 * Centraliza la lógica de personalización, multimedia y telemetría.
 * Diseñado para ser ligero, robusto y escalable.
 */

window.CC_Core = (function() {
    'use strict';

    const VERSION = '1.0.0';
    const SUPABASE_URL = 'https://qmnbcmioylgmcbzqrjiv.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_AZWTMqB-hCTA_Oiiu0juAQ_LRyE9gcc';

    let db = null;
    let audioInstance = null;
    let config = {
        loaderId: 'cc-loader',
        startOverlayId: 'cc-start-overlay'
    };

    // --- Inicialización ---
    function init() {
        console.log(`%c❤ CC_Core v${VERSION} Initialized`, 'color:#ff2d75; font-weight:bold;');
        _initSupabase();
        _injectStyles();
    }

    function _initSupabase() {
        // Intentar varias formas de encontrar el cliente de Supabase
        const lib = window.supabase || window.supabasejs;
        if (lib) {
            db = lib.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log("CC_Core: Supabase initialized");
        } else {
            console.warn("CC_Core: Supabase library not found yet");
        }
    }

    function _injectStyles() {
        if (document.getElementById('cc-core-styles')) return;
        const css = `
            .cc-loader { position:fixed; inset:0; background:#050005; z-index:999999; display:flex; flex-direction:column; justify-content:center; align-items:center; transition: opacity 0.8s ease; }
            .cc-loader-spinner { width:40px; height:40px; border:3px solid rgba(255,255,255,0.1); border-top:3px solid #ff2d75; border-radius:50%; animation: cc-spin 1s linear infinite; }
            .cc-start-overlay { position:fixed; inset:0; background:rgba(5,0,5,0.9); z-index:999998; display:none; justify-content:center; align-items:center; flex-direction:column; cursor:pointer; backdrop-filter: blur(8px); }
            .cc-start-btn { background: linear-gradient(45deg, #ff2d75, #ff4b8b); color:white; border:none; padding:18px 35px; font-size:1.1rem; border-radius:30px; font-weight:bold; box-shadow: 0 10px 30px rgba(255,45,117,0.4); animation: cc-pulse 2s infinite; }
            @keyframes cc-spin { to { transform: rotate(360deg); } }
            @keyframes cc-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        `;
        const style = document.createElement('style');
        style.id = 'cc-core-styles';
        style.innerHTML = css;
        document.head.appendChild(style);
    }

    // --- Utilidades de URL ---
    function getParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const params = {};
        for (const [key, value] of urlParams) {
            params[key] = value;
        }
        return params;
    }

    // --- Gestión de Datos ---
    async function loadData() {
        const params = getParams();
        const orderId = params.orderId || params.id;

        if (orderId) {
            // Re-intentar inicializar DB si falló antes
            if (!db) _initSupabase();

            if (db) {
                try {
                    const { data, error } = await db.rpc('get_order_safe', { p_id: orderId });
                    if (error) throw error;
                    if (data && data.length > 0) {
                        console.log("CC_Core: Data loaded from DB", data[0]);
                        return data[0];
                    }
                } catch (e) {
                    console.error("CC_Core: Error loading from DB", e);
                }
            }
        }
        console.log("CC_Core: Using URL params as fallback", params);
        return params;
    }

    // --- Multimedia ---
    function setupAudio(url, start = 0, duration = 30) {
        if (!url) return null;
        
        audioInstance = new Audio(url);
        audioInstance.loop = true;
        
        const playWithConstraint = () => {
            audioInstance.currentTime = parseFloat(start) || 0;
            audioInstance.play().catch(e => console.warn("CC_Core: Audio autoplay blocked"));
        };

        return {
            instance: audioInstance,
            play: playWithConstraint,
            stop: () => audioInstance.pause()
        };
    }

    // --- UI Helpers ---
    function hideLoader() {
        const loader = document.getElementById(config.loaderId);
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 800);
        }
    }

    function showStartOverlay(onStart) {
        const overlay = document.getElementById(config.startOverlayId);
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.onclick = () => {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.style.display = 'none', 600);
                if (onStart) onStart();
            };
        }
    }

    // --- API Pública ---
    return {
        init,
        getParams,
        loadData,
        setupAudio,
        hideLoader,
        showStartOverlay,
        db: () => db
    };

})();

// Auto-init
CC_Core.init();
