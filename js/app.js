/**
 * Cloud Unified Storage - Haupt-Anwendung
 * Initialisiert und koordiniert alle Komponenten
 */

// Globale Variablen
let storageManager;
let ui;

/**
 * Initialisiert die Anwendung
 * Wird aufgerufen, wenn die Seite geladen ist
 */
async function initApp() {
    console.log('🌥️ Cloud Unified Storage wird gestartet...');

    try {
        // Prüfe ob config.js geladen wurde
        if (typeof CONFIG === 'undefined') {
            showConfigError();
            return;
        }

        // Erstelle Storage Manager
        storageManager = new StorageManager();
        
        // Initialisiere UI Manager
        ui = new UIManager(storageManager);
        
        // Lade Dark Mode Präferenz
        ui.loadDarkModePreference();
        
        // Initialisiere Event Listeners
        ui.initEventListeners();

        // Zeige Lade-Zustand
        console.log('Initialisiere Cloud-Provider...');

        // Initialisiere alle Provider
        const initResults = await storageManager.init();
        
        console.log('Provider Initialisierung:', initResults);

        // Zeige Willkommens-Nachricht
        showWelcomeMessage();

        console.log('✅ App erfolgreich gestartet!');

    } catch (error) {
        console.error('❌ Fehler beim Starten der App:', error);
        ui.showErrorModal(`Fehler beim Starten: ${error.message}`);
    }
}

/**
 * Zeigt Fehler an, wenn config.js fehlt
 */
function showConfigError() {
    const errorHtml = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            max-width: 500px;
            text-align: center;
            z-index: 10000;
        ">
            <h2 style="color: #E74C3C; margin-bottom: 1rem;">
                ⚠️ Konfiguration fehlt
            </h2>
            <p style="margin-bottom: 1rem;">
                Die Datei <code>config.js</code> wurde nicht gefunden.
            </p>
            <p style="margin-bottom: 1rem;">
                Bitte erstelle <code>config.js</code> aus <code>config.example.js</code>
                und füge deine API-Keys hinzu.
            </p>
            <div style="
                background: #F0F4F8;
                padding: 1rem;
                border-radius: 8px;
                margin-top: 1rem;
                text-align: left;
            ">
                <strong>Schritte:</strong>
                <ol style="margin: 0.5rem 0; padding-left: 1.5rem;">
                    <li>Kopiere <code>config.example.js</code></li>
                    <li>Benenne die Kopie in <code>config.js</code> um</li>
                    <li>Trage deine API-Keys ein</li>
                    <li>Lade die Seite neu</li>
                </ol>
            </div>
            <p style="margin-top: 1rem; font-size: 0.875rem; color: #7F8C8D;">
                Siehe README.md für detaillierte Anweisungen
            </p>
        </div>
    `;

    document.body.innerHTML += errorHtml;
}

/**
 * Zeigt eine Willkommens-Nachricht in der Konsole
 */
function showWelcomeMessage() {
    console.log(`
╔════════════════════════════════════════════╗
║   🌥️  Cloud Unified Storage WebApp       ║
║                                            ║
║   Verbinde deine Cloud-Speicher:          ║
║   • Google Drive                           ║
║   • OneDrive                               ║
║   • Azure Blob Storage                     ║
║                                            ║
║   Klicke auf "Verbinden" um zu starten!   ║
╚════════════════════════════════════════════╝
    `);
}

/**
 * Hilfsfunktion: Formatiert Bytes zu lesbarer Größe
 * @param {number} bytes - Bytes
 * @returns {string} Formatierte Größe
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Hilfsfunktion: Debounce für Event Handler
 * @param {Function} func - Funktion die ausgeführt werden soll
 * @param {number} wait - Wartezeit in ms
 * @returns {Function} Debounced Funktion
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Error Handler für unbehandelte Fehler
 */
window.addEventListener('error', (event) => {
    console.error('Unbehandelter Fehler:', event.error);
    
    // Zeige nur in Development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        if (ui && typeof ui.showErrorModal === 'function') {
            ui.showErrorModal(`Unerwarteter Fehler: ${event.error.message}`);
        }
    }
});

/**
 * Handler für unbehandelte Promise Rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unbehandelte Promise Rejection:', event.reason);
    
    // Zeige nur in Development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        if (ui && typeof ui.showErrorModal === 'function') {
            ui.showErrorModal(`Promise Fehler: ${event.reason}`);
        }
    }
});

/**
 * Service Worker Registration (für zukünftige Offline-Funktionalität)
 */
if ('serviceWorker' in navigator) {
    // Deaktiviert für jetzt, kann später aktiviert werden
    // window.addEventListener('load', () => {
    //     navigator.serviceWorker.register('/sw.js')
    //         .then(reg => console.log('Service Worker registriert'))
    //         .catch(err => console.log('Service Worker Fehler:', err));
    // });
}

/**
 * Performance Monitoring (optional)
 */
if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`📊 Seite geladen in ${pageLoadTime}ms`);
        }, 0);
    });
}

// Starte die App, wenn das DOM geladen ist
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM ist bereits geladen
    initApp();
}

// Exportiere für Debugging (nur in Development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugApp = {
        storageManager,
        ui,
        formatBytes,
        version: '1.0.0'
    };
}
