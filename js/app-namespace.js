// ============================================================
// CORAZÓNCÓDIGO — APP NAMESPACE
// Estructura modular centralizada para evitar contaminación global
// Todos los módulos se cargan bajo window.APP.*
// ============================================================

(function initAppNamespace() {
    'use strict';

    // Crear namespace principal
    if (!window.APP) {
        window.APP = {
            VERSION: '3.0.0',
            LAST_UPDATED: '2025-04-30',
            config: {},
            modules: {},
            state: {},
            utils: {},
            errors: [],
            debug: false
        };
    }

    const APP = window.APP;

    // ─────────────────────────────────────────────────────
    // 1. CONFIG MODULE
    // ─────────────────────────────────────────────────────
    APP.config = {
        env: window.CC_ENV || {},
        supabase: window.getSupabaseConfig?.() || {},
        settings: window.getConfig?.() || {},
        
        get isDev() {
            return window.Sanitizer?.isDev?.() || false;
        },
        
        get isProduction() {
            return !this.isDev;
        }
    };

    // ─────────────────────────────────────────────────────
    // 2. DATABASE MODULE
    // ─────────────────────────────────────────────────────
    APP.modules.Database = {
        instance: window.db || null,
        isReady: false,
        
        async init() {
            // Esperar a que window.db esté disponible
            return new Promise((resolve) => {
                const checkDb = setInterval(() => {
                    if (window.db) {
                        this.instance = window.db;
                        this.isReady = true;
                        clearInterval(checkDb);
                        resolve(true);
                    }
                }, 100);
                
                // Timeout después de 5 segundos
                setTimeout(() => {
                    clearInterval(checkDb);
                    if (!this.instance) {
                        APP.Logger.warn('Database init timeout');
                        resolve(false);
                    }
                }, 5000);
            });
        },
        
        async query(table, operation = 'select', params = {}) {
            if (!this.instance) {
                throw new Error('Database not initialized');
            }
            // wrapper para queries seguras
            return this.instance.from(table)[operation](params);
        },
        
        async rpc(functionName, params = {}) {
            if (!this.instance) {
                throw new Error('Database not initialized');
            }
            return this.instance.rpc(functionName, params);
        }
    };

    // ─────────────────────────────────────────────────────
    // 3. LOGGER MODULE (reemplaza console.log)
    // ─────────────────────────────────────────────────────
    APP.modules.Logger = {
        logs: [],
        maxLogs: 1000,
        
        _log(level, message, context = {}) {
            const timestamp = new Date().toISOString();
            const logEntry = { timestamp, level, message, context };
            
            this.logs.push(logEntry);
            if (this.logs.length > this.maxLogs) {
                this.logs.shift(); // FIFO
            }
            
            // Console output con formato
            const color = {
                DEBUG: '#06b6d4',
                INFO: '#06b6d4',
                WARN: '#fbbf24',
                ERROR: '#ef4444'
            }[level] || '#06b6d4';
            
            console[level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log'](
                `%c[${level}] ${message}`,
                `color:${color};font-weight:bold;`,
                context
            );
            
            // Si hay Sentry, enviar errores
            if (level === 'ERROR' && typeof Sentry !== 'undefined') {
                Sentry.captureException(new Error(message), { extra: context });
            }
        },
        
        debug(msg, ctx) { if (APP.debug) this._log('DEBUG', msg, ctx); },
        info(msg, ctx) { this._log('INFO', msg, ctx); },
        warn(msg, ctx) { this._log('WARN', msg, ctx); },
        error(msg, ctx) { this._log('ERROR', msg, ctx); APP.errors.push(msg); },
        
        getLogs(level = null) {
            return level ? this.logs.filter(l => l.level === level) : this.logs;
        }
    };
    
    // Alias para acceso directo
    APP.Logger = APP.modules.Logger;

    // ─────────────────────────────────────────────────────
    // 4. STATE MANAGEMENT
    // ─────────────────────────────────────────────────────
    APP.state = {
        form: {
            template: '',
            plan: '',
            destino: '',
            date: '',
            message: '',
            photosUrl: '',
            musicUrl: '',
            musicStart: 0,
            musicDuration: 30
        },
        
        ui: {
            currentStep: 1,
            isLoading: false,
            isModalOpen: false
        },
        
        user: {
            sessionId: null,
            referralCode: null,
            cart: []
        },
        
        update(path, value) {
            const keys = path.split('.');
            let current = this;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            APP.Logger.debug(`State updated: ${path}`, value);
        },
        
        get(path) {
            const keys = path.split('.');
            let current = this;
            for (const key of keys) {
                current = current[key];
            }
            return current;
        }
    };

    // ─────────────────────────────────────────────────────
    // 5. UTILITIES
    // ─────────────────────────────────────────────────────
    APP.utils = {
        // Convertir horas a fecha relativa
        timeAgo(date) {
            const seconds = Math.floor((new Date() - new Date(date)) / 1000);
            const intervals = {
                year: 31536000,
                month: 2592000,
                week: 604800,
                day: 86400,
                hour: 3600,
                minute: 60
            };
            
            for (const [name, value] of Object.entries(intervals)) {
                const interval = Math.floor(seconds / value);
                if (interval >= 1) {
                    return interval === 1 ? `hace 1 ${name}` : `hace ${interval} ${name}s`;
                }
            }
            return 'hace unos segundos';
        },
        
        // Formatear precio
        formatPrice(price) {
            return new Intl.NumberFormat('es-EC', {
                style: 'currency',
                currency: 'USD'
            }).format(price);
        },
        
        // Copiar al portapapeles
        async copyToClipboard(text) {
            try {
                await navigator.clipboard.writeText(text);
                APP.Logger.info('Copiado al portapapeles');
                return true;
            } catch (e) {
                APP.Logger.error('Error copiando', e);
                return false;
            }
        },
        
        // Generar UUID
        generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = Math.random() * 16 | 0;
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        },
        
        // Delay (para async/await)
        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    };

    // ─────────────────────────────────────────────────────
    // 6. EVENT BUS (para comunicación entre módulos)
    // ─────────────────────────────────────────────────────
    APP.events = {
        listeners: {},
        
        on(event, callback) {
            if (!this.listeners[event]) {
                this.listeners[event] = [];
            }
            this.listeners[event].push(callback);
        },
        
        off(event, callback) {
            if (!this.listeners[event]) return;
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        },
        
        emit(event, data) {
            if (!this.listeners[event]) return;
            this.listeners[event].forEach(cb => {
                try {
                    cb(data);
                } catch (e) {
                    APP.Logger.error(`Event handler error for ${event}`, e);
                }
            });
        }
    };

    // ─────────────────────────────────────────────────────
    // 7. INIT
    // ─────────────────────────────────────────────────────
    APP.init = async function() {
        APP.Logger.info('🚀 CorazónCódigo v' + this.VERSION + ' initializing...');
        
        try {
            await APP.modules.Database.init();
            APP.Logger.info('✓ Database initialized');
        } catch (e) {
            APP.Logger.error('Database init failed', e);
        }
        
        APP.Logger.info('✓ APP Namespace initialized');
    };

    console.log('%c✓ APP Namespace created', 'color:#c026d3;font-weight:bold;');
})();
