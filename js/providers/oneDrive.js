/**
 * OneDrive Provider
 * Verwaltet die Verbindung und Operationen mit Microsoft OneDrive
 * Verwendet die Microsoft Graph API
 */

class OneDriveProvider {
    constructor() {
        this.name = 'OneDrive';
        this.id = 'onedrive';
        this.isConnected = false;
        this.accessToken = null;
        this.quota = { total: 0, used: 0, free: 0 }; // in Bytes
        this.msalInstance = null;
    }

    /**
     * Initialisiert MSAL (Microsoft Authentication Library)
     */
    async init() {
        try {
            // Prüfe ob CONFIG existiert
            if (typeof CONFIG === 'undefined' || !CONFIG.microsoft) {
                console.error('OneDrive Konfiguration fehlt!');
                throw new Error('Bitte erstelle config.js aus config.example.js');
            }

            // Erstelle MSAL Konfiguration
            const msalConfig = {
                auth: {
                    clientId: CONFIG.microsoft.clientId,
                    authority: 'https://login.microsoftonline.com/common',
                    redirectUri: CONFIG.microsoft.redirectUri
                },
                cache: {
                    cacheLocation: 'localStorage',
                    storeAuthStateInCookie: false
                }
            };

            // Initialisiere MSAL
            this.msalInstance = new msal.PublicClientApplication(msalConfig);
            await this.msalInstance.initialize();

            // Prüfe ob bereits ein Account vorhanden ist
            const accounts = this.msalInstance.getAllAccounts();
            if (accounts.length > 0) {
                // Versuche Silent Token zu holen
                await this.acquireTokenSilent();
            }

        } catch (error) {
            console.error('OneDrive Init Fehler:', error);
            throw error;
        }
    }

    /**
     * Verbindet mit OneDrive (OAuth Login)
     */
    async connect() {
        try {
            const loginRequest = {
                scopes: CONFIG.microsoft.scopes.map(scope => `https://graph.microsoft.com/${scope}`)
            };

            // Öffne Microsoft Login Popup
            const loginResponse = await this.msalInstance.loginPopup(loginRequest);
            
            if (loginResponse) {
                this.accessToken = loginResponse.accessToken;
                this.isConnected = true;

                // Hole Speicher-Quota
                await this.updateQuota();

                return { success: true, message: 'Erfolgreich mit OneDrive verbunden!' };
            }

        } catch (error) {
            console.error('OneDrive Verbindungsfehler:', error);
            return { 
                success: false, 
                message: error.message || 'Verbindung fehlgeschlagen' 
            };
        }
    }

    /**
     * Trennt die Verbindung zu OneDrive
     */
    async disconnect() {
        try {
            const accounts = this.msalInstance.getAllAccounts();
            if (accounts.length > 0) {
                await this.msalInstance.logout({
                    account: accounts[0]
                });
            }

            this.isConnected = false;
            this.accessToken = null;
            this.quota = { total: 0, used: 0, free: 0 };

            return { success: true, message: 'Verbindung getrennt' };

        } catch (error) {
            console.error('OneDrive Disconnect Fehler:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Holt Token im Silent-Modus (ohne Popup)
     */
    async acquireTokenSilent() {
        try {
            const accounts = this.msalInstance.getAllAccounts();
            if (accounts.length === 0) {
                return false;
            }

            const silentRequest = {
                scopes: CONFIG.microsoft.scopes.map(scope => `https://graph.microsoft.com/${scope}`),
                account: accounts[0]
            };

            const response = await this.msalInstance.acquireTokenSilent(silentRequest);
            this.accessToken = response.accessToken;
            this.isConnected = true;

            // Hole Speicher-Quota
            await this.updateQuota();

            return true;

        } catch (error) {
            console.error('Silent Token Fehler:', error);
            return false;
        }
    }

    /**
     * Aktualisiert die Speicher-Quota Informationen
     */
    async updateQuota() {
        if (!this.accessToken) return;

        try {
            const response = await fetch('https://graph.microsoft.com/v1.0/me/drive', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Quota Abruf fehlgeschlagen');
            }

            const data = await response.json();
            const quota = data.quota;

            this.quota.total = quota.total || 0;
            this.quota.used = quota.used || 0;
            this.quota.free = quota.remaining || (this.quota.total - this.quota.used);

        } catch (error) {
            console.error('Fehler beim Abrufen der OneDrive Quota:', error);
        }
    }

    /**
     * Listet alle Dateien auf
     * @param {number} maxResults - Maximale Anzahl der Ergebnisse
     * @returns {Array} Liste der Dateien
     */
    async listFiles(maxResults = 100) {
        if (!this.isConnected) {
            return [];
        }

        try {
            const response = await fetch(
                `https://graph.microsoft.com/v1.0/me/drive/root/children?$top=${maxResults}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Dateien abrufen fehlgeschlagen');
            }

            const data = await response.json();
            const files = data.value || [];

            // Formatiere Dateien für unsere App (nur Dateien, keine Ordner)
            return files
                .filter(file => file.file) // Nur Dateien, keine Ordner
                .map(file => ({
                    id: file.id,
                    name: file.name,
                    size: file.size || 0,
                    modified: new Date(file.lastModifiedDateTime),
                    provider: this.id,
                    providerName: this.name,
                    mimeType: file.file.mimeType,
                    webLink: file.webUrl
                }));

        } catch (error) {
            console.error('Fehler beim Auflisten der OneDrive Dateien:', error);
            return [];
        }
    }

    /**
     * Lädt eine Datei hoch
     * @param {File} file - Die hochzuladende Datei
     * @param {Function} progressCallback - Callback für Upload-Fortschritt
     * @returns {Object} Upload-Ergebnis
     */
    async uploadFile(file, progressCallback) {
        if (!this.isConnected) {
            return { success: false, message: 'Nicht mit OneDrive verbunden' };
        }

        try {
            // Für kleine Dateien (<4MB) - einfacher Upload
            if (file.size < 4 * 1024 * 1024) {
                const response = await fetch(
                    `https://graph.microsoft.com/v1.0/me/drive/root:/${file.name}:/content`,
                    {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`,
                            'Content-Type': file.type
                        },
                        body: file
                    }
                );

                if (!response.ok) {
                    throw new Error('Upload fehlgeschlagen');
                }

                const result = await response.json();

                // Aktualisiere Quota
                await this.updateQuota();

                return {
                    success: true,
                    message: `${file.name} erfolgreich hochgeladen!`,
                    fileId: result.id
                };
            } else {
                // Für größere Dateien würde man Upload-Session nutzen
                // Vereinfacht hier: Fehler für große Dateien
                return {
                    success: false,
                    message: 'Dateien über 4MB werden derzeit nicht unterstützt'
                };
            }

        } catch (error) {
            console.error('OneDrive Upload Fehler:', error);
            return {
                success: false,
                message: error.message || 'Upload fehlgeschlagen'
            };
        }
    }

    /**
     * Lädt eine Datei herunter
     * @param {string} fileId - Die ID der Datei
     * @param {string} fileName - Name der Datei für den Download
     */
    async downloadFile(fileId, fileName) {
        if (!this.isConnected) {
            return { success: false, message: 'Nicht mit OneDrive verbunden' };
        }

        try {
            // Hole Download-URL
            const response = await fetch(
                `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );

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
            console.error('OneDrive Download Fehler:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Sucht nach Dateien
     * @param {string} query - Suchbegriff
     * @returns {Array} Gefundene Dateien
     */
    async searchFiles(query) {
        if (!this.isConnected || !query) {
            return [];
        }

        try {
            const response = await fetch(
                `https://graph.microsoft.com/v1.0/me/drive/root/search(q='${encodeURIComponent(query)}')`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Suche fehlgeschlagen');
            }

            const data = await response.json();
            const files = data.value || [];

            return files
                .filter(file => file.file) // Nur Dateien
                .map(file => ({
                    id: file.id,
                    name: file.name,
                    size: file.size || 0,
                    modified: new Date(file.lastModifiedDateTime),
                    provider: this.id,
                    providerName: this.name,
                    mimeType: file.file.mimeType,
                    webLink: file.webUrl
                }));

        } catch (error) {
            console.error('OneDrive Suche Fehler:', error);
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
}
