/**
 * Storage Manager
 * Zentrale Verwaltung aller Cloud-Provider
 * Koordiniert Provider-Operationen und intelligente Speicher-Verteilung
 */

class StorageManager {
    constructor() {
        // Initialisiere Provider
        this.providers = {
            google: new GoogleDriveProvider(),
            onedrive: new OneDriveProvider(),
            azure: new AzureStorageProvider()
        };

        this.allFiles = []; // Cache für alle Dateien
    }

    /**
     * Initialisiert alle Provider
     */
    async init() {
        const results = {
            google: false,
            onedrive: false,
            azure: false
        };

        // Initialisiere Google Drive
        try {
            await this.providers.google.init();
            results.google = true;
        } catch (error) {
            console.error('Google Drive Init fehlgeschlagen:', error);
        }

        // Initialisiere OneDrive
        try {
            await this.providers.onedrive.init();
            results.onedrive = true;
        } catch (error) {
            console.error('OneDrive Init fehlgeschlagen:', error);
        }

        // Initialisiere Azure
        try {
            await this.providers.azure.init();
            results.azure = true;
        } catch (error) {
            console.error('Azure Init fehlgeschlagen:', error);
        }

        return results;
    }

    /**
     * Verbindet einen Provider
     * @param {string} providerId - ID des Providers (google, onedrive, azure)
     */
    async connectProvider(providerId) {
        const provider = this.providers[providerId];
        if (!provider) {
            return { success: false, message: 'Provider nicht gefunden' };
        }

        return await provider.connect();
    }

    /**
     * Trennt einen Provider
     * @param {string} providerId - ID des Providers
     */
    async disconnectProvider(providerId) {
        const provider = this.providers[providerId];
        if (!provider) {
            return { success: false, message: 'Provider nicht gefunden' };
        }

        return await provider.disconnect();
    }

    /**
     * Prüft ob ein Provider verbunden ist
     * @param {string} providerId - ID des Providers
     */
    isProviderConnected(providerId) {
        const provider = this.providers[providerId];
        return provider ? provider.isConnected : false;
    }

    /**
     * Hole alle Dateien von allen verbundenen Providern
     * @returns {Array} Alle Dateien
     */
    async getAllFiles() {
        const allFiles = [];

        // Hole Dateien von jedem verbundenen Provider
        for (const [providerId, provider] of Object.entries(this.providers)) {
            if (provider.isConnected) {
                try {
                    const files = await provider.listFiles();
                    allFiles.push(...files);
                } catch (error) {
                    console.error(`Fehler beim Laden von ${providerId} Dateien:`, error);
                }
            }
        }

        // Sortiere nach Änderungsdatum (neueste zuerst)
        allFiles.sort((a, b) => b.modified - a.modified);

        // Cache aktualisieren
        this.allFiles = allFiles;

        return allFiles;
    }

    /**
     * Suche nach Dateien über alle Provider
     * @param {string} query - Suchbegriff
     * @returns {Array} Gefundene Dateien
     */
    async searchFiles(query) {
        if (!query || query.trim() === '') {
            return this.allFiles;
        }

        const searchResults = [];

        // Suche in jedem verbundenen Provider
        for (const [providerId, provider] of Object.entries(this.providers)) {
            if (provider.isConnected) {
                try {
                    const files = await provider.searchFiles(query);
                    searchResults.push(...files);
                } catch (error) {
                    console.error(`Fehler bei ${providerId} Suche:`, error);
                }
            }
        }

        // Alternativ: Lokale Suche im Cache
        const localResults = this.allFiles.filter(file =>
            file.name.toLowerCase().includes(query.toLowerCase())
        );

        // Kombiniere und dedupliziere Ergebnisse
        // Verwende robusteren Key mit Delimiter um Kollisionen zu vermeiden
        const combined = [...searchResults, ...localResults];
        const unique = Array.from(new Map(combined.map(f => [`${f.provider}:${f.id}`, f])).values());

        return unique;
    }

    /**
     * Intelligente Auswahl des besten Providers für Upload
     * Wählt den Provider mit dem meisten freien Speicher
     * @returns {string|null} Provider-ID oder null
     */
    getBestProviderForUpload() {
        let bestProvider = null;
        let maxFreeSpace = 0;

        for (const [providerId, provider] of Object.entries(this.providers)) {
            if (provider.isConnected) {
                const quota = provider.getQuota();
                if (quota.free > maxFreeSpace) {
                    maxFreeSpace = quota.free;
                    bestProvider = providerId;
                }
            }
        }

        return bestProvider;
    }

    /**
     * Lädt eine Datei hoch
     * @param {File} file - Die Datei
     * @param {string} targetProviderId - Ziel-Provider ('auto' für automatisch)
     * @param {Function} progressCallback - Fortschritts-Callback
     * @returns {Object} Upload-Ergebnis
     */
    async uploadFile(file, targetProviderId = 'auto', progressCallback) {
        // Automatische Provider-Auswahl
        if (targetProviderId === 'auto') {
            targetProviderId = this.getBestProviderForUpload();
            
            if (!targetProviderId) {
                return {
                    success: false,
                    message: 'Kein verbundener Provider verfügbar'
                };
            }
        }

        const provider = this.providers[targetProviderId];
        
        if (!provider) {
            return {
                success: false,
                message: 'Provider nicht gefunden'
            };
        }

        if (!provider.isConnected) {
            return {
                success: false,
                message: `${provider.name} ist nicht verbunden`
            };
        }

        // Prüfe ob genug Speicher vorhanden
        const quota = provider.getQuota();
        if (file.size > quota.free) {
            return {
                success: false,
                message: `Nicht genug Speicher bei ${provider.name}`
            };
        }

        // Upload ausführen
        return await provider.uploadFile(file, progressCallback);
    }

    /**
     * Lädt eine Datei herunter
     * @param {string} providerId - Provider-ID
     * @param {string} fileId - Datei-ID
     * @param {string} fileName - Dateiname
     */
    async downloadFile(providerId, fileId, fileName) {
        const provider = this.providers[providerId];
        
        if (!provider) {
            return {
                success: false,
                message: 'Provider nicht gefunden'
            };
        }

        if (!provider.isConnected) {
            return {
                success: false,
                message: `${provider.name} ist nicht verbunden`
            };
        }

        return await provider.downloadFile(fileId, fileName);
    }

    /**
     * Berechnet die Gesamt-Speicher-Statistiken
     * @returns {Object} Speicher-Statistiken
     */
    getTotalQuota() {
        let total = 0;
        let used = 0;
        let free = 0;

        for (const provider of Object.values(this.providers)) {
            if (provider.isConnected) {
                const quota = provider.getQuota();
                total += quota.total;
                used += quota.used;
                free += quota.free;
            }
        }

        return {
            total,
            used,
            free,
            percentage: total > 0 ? (used / total) * 100 : 0
        };
    }

    /**
     * Gibt die Quota eines spezifischen Providers zurück
     * @param {string} providerId - Provider-ID
     * @returns {Object} Quota-Informationen
     */
    getProviderQuota(providerId) {
        const provider = this.providers[providerId];
        if (!provider) {
            return { total: 0, used: 0, free: 0 };
        }

        return provider.getQuota();
    }

    /**
     * Gibt alle Provider-Status zurück
     * @returns {Object} Status aller Provider
     */
    getProvidersStatus() {
        const status = {};

        for (const [providerId, provider] of Object.entries(this.providers)) {
            status[providerId] = {
                name: provider.name,
                connected: provider.isConnected,
                quota: provider.getQuota()
            };
        }

        return status;
    }

    /**
     * Aktualisiert die Quota-Informationen aller verbundenen Provider
     */
    async refreshAllQuotas() {
        const promises = [];

        for (const provider of Object.values(this.providers)) {
            if (provider.isConnected && typeof provider.updateQuota === 'function') {
                promises.push(provider.updateQuota());
            }
        }

        await Promise.all(promises);
    }
}
