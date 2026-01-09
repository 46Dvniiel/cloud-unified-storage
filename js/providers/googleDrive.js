/**
 * Google Drive Provider
 * Verwaltet die Verbindung und Operationen mit Google Drive
 * Verwendet die Google Drive API v3
 */

class GoogleDriveProvider {
    constructor() {
        this.name = 'Google Drive';
        this.id = 'google';
        this.isConnected = false;
        this.accessToken = null;
        this.quota = { total: 0, used: 0, free: 0 }; // in Bytes
    }

    /**
     * Initialisiert die Google API
     * Lädt die Google API Client Library und setzt die Konfiguration
     */
    async init() {
        return new Promise((resolve, reject) => {
            // Prüfe ob CONFIG existiert
            if (typeof CONFIG === 'undefined' || !CONFIG.google) {
                console.error('Google Drive Konfiguration fehlt!');
                reject(new Error('Bitte erstelle config.js aus config.example.js'));
                return;
            }

            // Lade die Google API Client Library
            gapi.load('client:auth2', async () => {
                try {
                    await gapi.client.init({
                        apiKey: CONFIG.google.apiKey,
                        clientId: CONFIG.google.clientId,
                        discoveryDocs: CONFIG.google.discoveryDocs,
                        scope: CONFIG.google.scopes
                    });

                    // Prüfe ob bereits eingeloggt
                    const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
                    if (isSignedIn) {
                        await this.handleAuthSuccess();
                    }

                    resolve();
                } catch (error) {
                    console.error('Google API Init Fehler:', error);
                    reject(error);
                }
            });
        });
    }

    /**
     * Verbindet mit Google Drive (OAuth Login)
     */
    async connect() {
        try {
            const authInstance = gapi.auth2.getAuthInstance();
            
            // Öffne Google Login Popup
            await authInstance.signIn();
            
            // Erfolgreiche Authentifizierung
            await this.handleAuthSuccess();
            
            return { success: true, message: 'Erfolgreich mit Google Drive verbunden!' };
        } catch (error) {
            console.error('Google Drive Verbindungsfehler:', error);
            return { success: false, message: error.message || 'Verbindung fehlgeschlagen' };
        }
    }

    /**
     * Trennt die Verbindung zu Google Drive
     */
    async disconnect() {
        try {
            const authInstance = gapi.auth2.getAuthInstance();
            await authInstance.signOut();
            
            this.isConnected = false;
            this.accessToken = null;
            this.quota = { total: 0, used: 0, free: 0 };
            
            return { success: true, message: 'Verbindung getrennt' };
        } catch (error) {
            console.error('Google Drive Disconnect Fehler:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Behandelt erfolgreiche Authentifizierung
     */
    async handleAuthSuccess() {
        // Hole Access Token
        const user = gapi.auth2.getAuthInstance().currentUser.get();
        const authResponse = user.getAuthResponse();
        this.accessToken = authResponse.access_token;
        this.isConnected = true;

        // Hole Speicher-Quota
        await this.updateQuota();
    }

    /**
     * Aktualisiert die Speicher-Quota Informationen
     */
    async updateQuota() {
        try {
            const response = await gapi.client.drive.about.get({
                fields: 'storageQuota'
            });

            const quota = response.result.storageQuota;
            
            // Konvertiere zu Zahlen (API gibt Strings zurück)
            this.quota.total = parseInt(quota.limit) || 0;
            this.quota.used = parseInt(quota.usage) || 0;
            this.quota.free = this.quota.total - this.quota.used;

        } catch (error) {
            console.error('Fehler beim Abrufen der Google Drive Quota:', error);
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
            const response = await gapi.client.drive.files.list({
                pageSize: maxResults,
                fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink)',
                // Nur eigene Dateien, keine Ordner der Übersichtlichkeit halber
                q: "trashed=false and mimeType!='application/vnd.google-apps.folder'"
            });

            const files = response.result.files || [];
            
            // Formatiere Dateien für unsere App
            return files.map(file => ({
                id: file.id,
                name: file.name,
                size: parseInt(file.size) || 0,
                modified: new Date(file.modifiedTime),
                provider: this.id,
                providerName: this.name,
                mimeType: file.mimeType,
                webLink: file.webViewLink
            }));

        } catch (error) {
            console.error('Fehler beim Auflisten der Google Drive Dateien:', error);
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
            return { success: false, message: 'Nicht mit Google Drive verbunden' };
        }

        try {
            // Erstelle Metadata
            const metadata = {
                name: file.name,
                mimeType: file.type
            };

            // Erstelle FormData für Multipart Upload
            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', file);

            // Upload mit Fetch API (für Progress Tracking)
            const response = await fetch(
                'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    },
                    body: form
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

        } catch (error) {
            console.error('Google Drive Upload Fehler:', error);
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
            return { success: false, message: 'Nicht mit Google Drive verbunden' };
        }

        try {
            // Für Google Drive müssen wir einen separaten Fetch-Request machen
            // da gapi.client die Binärdaten nicht korrekt zurückgibt
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
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
            console.error('Google Drive Download Fehler:', error);
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
            const response = await gapi.client.drive.files.list({
                q: `name contains '${query}' and trashed=false`,
                fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink)',
                pageSize: 50
            });

            const files = response.result.files || [];
            
            return files.map(file => ({
                id: file.id,
                name: file.name,
                size: parseInt(file.size) || 0,
                modified: new Date(file.modifiedTime),
                provider: this.id,
                providerName: this.name,
                mimeType: file.mimeType,
                webLink: file.webViewLink
            }));

        } catch (error) {
            console.error('Google Drive Suche Fehler:', error);
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
