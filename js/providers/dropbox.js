/**
 * Dropbox Provider
 * Verwaltet die Verbindung und Operationen mit Dropbox
 * Verwendet die Dropbox HTTP API v2
 * Dokumentation: https://www.dropbox.com/developers/documentation/http/documentation
 */

class DropboxProvider {
    constructor() {
        this.name = 'Dropbox';
        this.id = 'dropbox';
        this.isConnected = false;
        this.accessToken = null;
        this.quota = { total: 0, used: 0, free: 0 }; // in Bytes
        this.codeVerifier = null; // Für PKCE (Proof Key for Code Exchange)
    }

    /**
     * Initialisiert den Dropbox Provider
     * Prüft ob bereits ein Access Token vorhanden ist
     */
    async init() {
        try {
            // Prüfe ob CONFIG existiert
            if (typeof CONFIG === 'undefined' || !CONFIG.dropbox) {
                console.error('Dropbox Konfiguration fehlt!');
                throw new Error('Bitte erstelle config.js aus config.example.js');
            }

            // Prüfe ob Access Token im LocalStorage vorhanden ist
            const storedToken = localStorage.getItem('dropbox_access_token');
            if (storedToken) {
                this.accessToken = storedToken;
                this.isConnected = true;
                
                // Hole Speicher-Quota
                await this.updateQuota();
            }

            // Prüfe ob wir von OAuth Callback kommen
            await this.handleOAuthCallback();

        } catch (error) {
            console.error('Dropbox Init Fehler:', error);
            throw error;
        }
    }

    /**
     * Verbindet mit Dropbox (OAuth 2.0 Login mit PKCE)
     * PKCE schützt gegen Authorization Code Interception Angriffe
     */
    async connect() {
        try {
            // Generiere Code Verifier und Challenge für PKCE
            this.codeVerifier = this.generateCodeVerifier();
            const codeChallenge = await this.generateCodeChallenge(this.codeVerifier);
            
            // Speichere Code Verifier für später (nach Redirect)
            localStorage.setItem('dropbox_code_verifier', this.codeVerifier);

            // Erstelle OAuth URL mit PKCE
            const authUrl = new URL('https://www.dropbox.com/oauth2/authorize');
            authUrl.searchParams.append('client_id', CONFIG.dropbox.appKey);
            authUrl.searchParams.append('response_type', 'code');
            authUrl.searchParams.append('redirect_uri', CONFIG.dropbox.redirectUri);
            authUrl.searchParams.append('code_challenge', codeChallenge);
            authUrl.searchParams.append('code_challenge_method', 'S256');
            authUrl.searchParams.append('token_access_type', 'offline'); // Für Refresh Token

            // Speichere State für Callback-Erkennung
            localStorage.setItem('dropbox_auth_state', 'pending');

            // Öffne Dropbox Login
            window.location.href = authUrl.toString();

        } catch (error) {
            console.error('Dropbox Verbindungsfehler:', error);
            return { 
                success: false, 
                message: error.message || 'Verbindung fehlgeschlagen' 
            };
        }
    }

    /**
     * Behandelt den OAuth Callback von Dropbox
     * Wird aufgerufen nachdem der Benutzer die Autorisierung gegeben hat
     */
    async handleOAuthCallback() {
        // Prüfe ob wir in einem OAuth Callback sind
        const authState = localStorage.getItem('dropbox_auth_state');
        if (authState !== 'pending') {
            return;
        }

        // Parse URL für Authorization Code
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
            console.error('Dropbox OAuth Fehler:', error);
            localStorage.removeItem('dropbox_auth_state');
            localStorage.removeItem('dropbox_code_verifier');
            return;
        }

        if (!code) {
            return;
        }

        try {
            // Hole gespeicherten Code Verifier
            const codeVerifier = localStorage.getItem('dropbox_code_verifier');
            if (!codeVerifier) {
                throw new Error('Code Verifier nicht gefunden');
            }

            // Tausche Authorization Code gegen Access Token
            // WICHTIG: In Produktion sollte dies über ein Backend erfolgen, um das App Secret zu schützen
            const tokenResponse = await fetch('https://api.dropboxapi.com/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    code: code,
                    grant_type: 'authorization_code',
                    client_id: CONFIG.dropbox.appKey,
                    client_secret: CONFIG.dropbox.appSecret,
                    redirect_uri: CONFIG.dropbox.redirectUri,
                    code_verifier: codeVerifier
                })
            });

            if (!tokenResponse.ok) {
                throw new Error('Token-Anfrage fehlgeschlagen');
            }

            const tokenData = await tokenResponse.json();
            this.accessToken = tokenData.access_token;
            
            // Speichere Token
            localStorage.setItem('dropbox_access_token', this.accessToken);
            
            // Optional: Speichere Refresh Token für langfristige Nutzung
            if (tokenData.refresh_token) {
                localStorage.setItem('dropbox_refresh_token', tokenData.refresh_token);
            }

            this.isConnected = true;

            // Cleanup
            localStorage.removeItem('dropbox_auth_state');
            localStorage.removeItem('dropbox_code_verifier');

            // Hole Speicher-Quota
            await this.updateQuota();

            // Entferne OAuth Parameter aus URL
            window.history.replaceState({}, document.title, window.location.pathname);

        } catch (error) {
            console.error('Dropbox OAuth Callback Fehler:', error);
            localStorage.removeItem('dropbox_auth_state');
            localStorage.removeItem('dropbox_code_verifier');
        }
    }

    /**
     * Trennt die Verbindung zu Dropbox
     */
    async disconnect() {
        try {
            // Revoke Token (optional, benötigt API Call)
            if (this.accessToken) {
                await fetch('https://api.dropboxapi.com/2/auth/token/revoke', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                });
            }

            // Cleanup
            this.isConnected = false;
            this.accessToken = null;
            this.quota = { total: 0, used: 0, free: 0 };
            
            localStorage.removeItem('dropbox_access_token');
            localStorage.removeItem('dropbox_refresh_token');

            return { success: true, message: 'Verbindung getrennt' };

        } catch (error) {
            console.error('Dropbox Disconnect Fehler:', error);
            // Auch bei Fehler lokale Daten löschen
            this.isConnected = false;
            this.accessToken = null;
            localStorage.removeItem('dropbox_access_token');
            localStorage.removeItem('dropbox_refresh_token');
            return { success: true, message: 'Verbindung getrennt' };
        }
    }

    /**
     * Aktualisiert die Speicher-Quota Informationen
     * Verwendet die Dropbox API: users/get_space_usage
     */
    async updateQuota() {
        if (!this.accessToken) return;

        try {
            const response = await fetch('https://api.dropboxapi.com/2/users/get_space_usage', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                throw new Error('Quota Abruf fehlgeschlagen');
            }

            const data = await response.json();
            
            // Dropbox gibt used und allocated zurück
            this.quota.used = data.used || 0;
            this.quota.total = data.allocation?.allocated || 0;
            this.quota.free = this.quota.total - this.quota.used;

        } catch (error) {
            console.error('Fehler beim Abrufen der Dropbox Quota:', error);
        }
    }

    /**
     * Listet alle Dateien auf
     * Verwendet die Dropbox API: files/list_folder
     * @param {number} maxResults - Maximale Anzahl der Ergebnisse (wird von Dropbox ignoriert, gibt alle zurück)
     * @returns {Array} Liste der Dateien
     */
    async listFiles(maxResults = 100) {
        if (!this.isConnected) {
            return [];
        }

        try {
            const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    path: '', // Root-Ordner
                    recursive: false, // Nicht rekursiv
                    include_deleted: false,
                    include_has_explicit_shared_members: false,
                    include_mounted_folders: false,
                    limit: maxResults
                })
            });

            if (!response.ok) {
                throw new Error('Dateien abrufen fehlgeschlagen');
            }

            const data = await response.json();
            const entries = data.entries || [];

            // Formatiere Dateien für unsere App (nur Dateien, keine Ordner)
            return entries
                .filter(entry => entry['.tag'] === 'file') // Nur Dateien
                .map(file => ({
                    id: file.id,
                    name: file.name,
                    size: file.size || 0,
                    modified: new Date(file.client_modified || file.server_modified),
                    provider: this.id,
                    providerName: this.name,
                    mimeType: this.getMimeType(file.name),
                    webLink: file.path_display // Dropbox zeigt Pfad statt Web-Link
                }));

        } catch (error) {
            console.error('Fehler beim Auflisten der Dropbox Dateien:', error);
            return [];
        }
    }

    /**
     * Lädt eine Datei hoch
     * Verwendet die Dropbox API: files/upload
     * @param {File} file - Die hochzuladende Datei
     * @param {Function} progressCallback - Callback für Upload-Fortschritt
     * @returns {Object} Upload-Ergebnis
     */
    async uploadFile(file, progressCallback) {
        if (!this.isConnected) {
            return { success: false, message: 'Nicht mit Dropbox verbunden' };
        }

        try {
            // Für Dateien < 150MB - einfacher Upload
            // Für größere Dateien würde man Upload-Sessions nutzen
            if (file.size > 150 * 1024 * 1024) {
                return {
                    success: false,
                    message: 'Dateien über 150MB werden derzeit nicht unterstützt'
                };
            }

            // Lese Datei als ArrayBuffer
            const fileBuffer = await file.arrayBuffer();

            // Upload zu Dropbox
            const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/octet-stream',
                    'Dropbox-API-Arg': JSON.stringify({
                        path: '/' + file.name,
                        mode: 'add', // Fehler wenn Datei existiert
                        autorename: true, // Automatisch umbenennen bei Konflikt
                        mute: false
                    })
                },
                body: fileBuffer
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error_summary || 'Upload fehlgeschlagen');
            }

            const result = await response.json();

            // Aktualisiere Quota
            await this.updateQuota();

            return {
                success: true,
                message: `${file.name} erfolgreich hochgeladen!`,
                fileId: result.id
            };

        } catch (error) {
            console.error('Dropbox Upload Fehler:', error);
            return {
                success: false,
                message: error.message || 'Upload fehlgeschlagen'
            };
        }
    }

    /**
     * Lädt eine Datei herunter
     * Verwendet die Dropbox API: files/download
     * @param {string} fileId - Die ID der Datei
     * @param {string} fileName - Name der Datei für den Download
     */
    async downloadFile(fileId, fileName) {
        if (!this.isConnected) {
            return { success: false, message: 'Nicht mit Dropbox verbunden' };
        }

        try {
            // Dropbox benötigt den Pfad, nicht die ID für Download
            // Wir müssen zuerst die Metadata holen um den Pfad zu bekommen
            const metadataResponse = await fetch('https://api.dropboxapi.com/2/files/get_metadata', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    path: fileId.startsWith('id:') ? fileId : `id:${fileId}`
                })
            });

            if (!metadataResponse.ok) {
                throw new Error('Datei-Metadaten konnten nicht abgerufen werden');
            }

            const metadata = await metadataResponse.json();
            const filePath = metadata.path_display;

            // Jetzt können wir die Datei herunterladen
            const response = await fetch('https://content.dropboxapi.com/2/files/download', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Dropbox-API-Arg': JSON.stringify({
                        path: filePath
                    })
                }
            });

            if (!response.ok) {
                throw new Error('Download fehlgeschlagen');
            }

            // Erstelle Blob und Download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            return { success: true, message: 'Download gestartet' };

        } catch (error) {
            console.error('Dropbox Download Fehler:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Sucht nach Dateien
     * Verwendet die Dropbox API: files/search_v2
     * @param {string} query - Suchbegriff
     * @returns {Array} Gefundene Dateien
     */
    async searchFiles(query) {
        if (!this.isConnected || !query) {
            return [];
        }

        try {
            const response = await fetch('https://api.dropboxapi.com/2/files/search_v2', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: query,
                    options: {
                        path: '', // Gesamtes Dropbox durchsuchen
                        max_results: 50,
                        file_status: 'active',
                        filename_only: true // Nur in Dateinamen suchen
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Suche fehlgeschlagen');
            }

            const data = await response.json();
            const matches = data.matches || [];

            return matches
                .filter(match => match.metadata.metadata['.tag'] === 'file')
                .map(match => {
                    const file = match.metadata.metadata;
                    return {
                        id: file.id,
                        name: file.name,
                        size: file.size || 0,
                        modified: new Date(file.client_modified || file.server_modified),
                        provider: this.id,
                        providerName: this.name,
                        mimeType: this.getMimeType(file.name),
                        webLink: file.path_display
                    };
                });

        } catch (error) {
            console.error('Dropbox Suche Fehler:', error);
            return [];
        }
    }

    /**
     * Gibt die Speicher-Informationen zurück
     * @returns {Object} Speicher-Quota
     */
    getQuota() {
        return {
            total: this.quota.total,
            used: this.quota.used,
            free: this.quota.free
        };
    }

    // ========== PKCE Hilfsfunktionen ==========

    /**
     * Generiert einen zufälligen Code Verifier für PKCE
     * @returns {string} Code Verifier (43-128 Zeichen)
     */
    generateCodeVerifier() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return this.base64URLEncode(array);
    }

    /**
     * Generiert Code Challenge aus Code Verifier
     * @param {string} verifier - Code Verifier
     * @returns {Promise<string>} Code Challenge (SHA-256 Hash)
     */
    async generateCodeChallenge(verifier) {
        const encoder = new TextEncoder();
        const data = encoder.encode(verifier);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return this.base64URLEncode(new Uint8Array(hash));
    }

    /**
     * Base64 URL Encoding (RFC 4648)
     * @param {Uint8Array} buffer - Zu kodierender Buffer
     * @returns {string} Base64 URL-encoded String
     */
    base64URLEncode(buffer) {
        const base64 = btoa(String.fromCharCode(...buffer));
        return base64
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    /**
     * Bestimmt MIME-Type basierend auf Dateiendung
     * @param {string} filename - Dateiname
     * @returns {string} MIME-Type
     */
    getMimeType(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const mimeTypes = {
            'pdf': 'application/pdf',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'txt': 'text/plain',
            'html': 'text/html',
            'css': 'text/css',
            'js': 'application/javascript',
            'json': 'application/json',
            'zip': 'application/zip',
            'mp4': 'video/mp4',
            'mp3': 'audio/mpeg'
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }
}
