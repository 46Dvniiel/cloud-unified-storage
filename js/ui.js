/**
 * UI Manager
 * Verwaltet alle UI-Updates und DOM-Manipulationen
 * Trennt die UI-Logik von der Business-Logik
 */

class UIManager {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.currentFiles = [];
    }

    /**
     * Initialisiert Event Listener
     */
    initEventListeners() {
        // Dark Mode Toggle
        const darkModeBtn = document.getElementById('darkModeBtn');
        if (darkModeBtn) {
            darkModeBtn.addEventListener('click', () => this.toggleDarkMode());
        }

        // Provider Connect Buttons
        this.initProviderButtons();

        // Upload Zone
        this.initUploadZone();

        // Search
        this.initSearch();

        // Error Modal Close
        const closeErrorBtn = document.getElementById('closeErrorBtn');
        if (closeErrorBtn) {
            closeErrorBtn.addEventListener('click', () => this.hideErrorModal());
        }
    }

    /**
     * Initialisiert Provider-Connect-Buttons
     */
    initProviderButtons() {
        // Google Drive
        const googleBtn = document.getElementById('googleConnectBtn');
        if (googleBtn) {
            googleBtn.addEventListener('click', async () => {
                await this.connectProvider('google', googleBtn);
            });
        }

        // OneDrive
        const oneDriveBtn = document.getElementById('oneDriveConnectBtn');
        if (oneDriveBtn) {
            oneDriveBtn.addEventListener('click', async () => {
                await this.connectProvider('onedrive', oneDriveBtn);
            });
        }

        // Azure
        const azureBtn = document.getElementById('azureConnectBtn');
        if (azureBtn) {
            azureBtn.addEventListener('click', async () => {
                await this.connectProvider('azure', azureBtn);
            });
        }
    }

    /**
     * Verbindet einen Provider
     */
    async connectProvider(providerId, button) {
        // Deaktiviere Button während der Verbindung
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verbinde...';

        const result = await this.storageManager.connectProvider(providerId);

        if (result.success) {
            this.updateProviderCard(providerId, true);
            await this.refreshAllData();
        } else {
            this.showErrorModal(result.message);
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-plug"></i> Verbinden';
        }
    }

    /**
     * Initialisiert Upload Zone (Drag & Drop)
     */
    initUploadZone() {
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');

        if (!uploadZone || !fileInput) return;

        // Click to select files
        uploadZone.addEventListener('click', () => fileInput.click());

        // File input change
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleFilesUpload(files);
        });

        // Drag & Drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('drag-over');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('drag-over');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('drag-over');
            
            const files = Array.from(e.dataTransfer.files);
            this.handleFilesUpload(files);
        });
    }

    /**
     * Behandelt den Upload von Dateien
     */
    async handleFilesUpload(files) {
        if (files.length === 0) return;

        const targetProvider = document.getElementById('targetProvider').value;
        const uploadProgress = document.getElementById('uploadProgress');
        const uploadProgressBar = document.getElementById('uploadProgressBar');
        const uploadProgressText = document.getElementById('uploadProgressText');

        // Zeige Progress
        uploadProgress.style.display = 'block';

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            uploadProgressText.textContent = `Lädt ${file.name} hoch... (${i + 1}/${files.length})`;
            uploadProgressBar.style.width = '0%';

            const result = await this.storageManager.uploadFile(
                file,
                targetProvider,
                (percent) => {
                    uploadProgressBar.style.width = `${percent}%`;
                }
            );

            if (result.success) {
                uploadProgressBar.style.width = '100%';
            } else {
                this.showErrorModal(result.message);
                break;
            }
        }

        // Verstecke Progress nach kurzer Verzögerung
        setTimeout(() => {
            uploadProgress.style.display = 'none';
        }, 1000);

        // Aktualisiere Daten
        await this.refreshAllData();
    }

    /**
     * Initialisiert die Suchfunktion
     */
    initSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        // Debounce für bessere Performance
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                const query = e.target.value;
                await this.performSearch(query);
            }, 300);
        });
    }

    /**
     * Führt eine Suche aus
     */
    async performSearch(query) {
        this.showLoadingSkeleton();

        const results = await this.storageManager.searchFiles(query);
        this.currentFiles = results;
        this.renderFileList(results);

        this.hideLoadingSkeleton();
    }

    /**
     * Aktualisiert eine Provider-Card
     */
    updateProviderCard(providerId, connected) {
        const statusElement = document.getElementById(`${providerId}Status`);
        const storageElement = document.getElementById(`${providerId}Storage`);
        const buttonElement = document.getElementById(`${providerId}ConnectBtn`);

        if (statusElement) {
            if (connected) {
                statusElement.className = 'status-badge status-connected';
                statusElement.innerHTML = '<i class="fas fa-circle"></i> Verbunden';
            } else {
                statusElement.className = 'status-badge status-disconnected';
                statusElement.innerHTML = '<i class="fas fa-circle"></i> Nicht verbunden';
            }
        }

        if (connected && storageElement) {
            const quota = this.storageManager.getProviderQuota(providerId);
            const usedGB = (quota.used / (1024 ** 3)).toFixed(2);
            const totalGB = (quota.total / (1024 ** 3)).toFixed(2);
            storageElement.textContent = `${usedGB} / ${totalGB} GB`;
        }

        if (buttonElement) {
            if (connected) {
                buttonElement.innerHTML = '<i class="fas fa-check"></i> Verbunden';
                buttonElement.classList.remove('btn-primary');
                buttonElement.classList.add('btn-secondary');
                buttonElement.disabled = true;
            } else {
                buttonElement.innerHTML = '<i class="fas fa-plug"></i> Verbinden';
                buttonElement.classList.remove('btn-secondary');
                buttonElement.classList.add('btn-primary');
                buttonElement.disabled = false;
            }
        }
    }

    /**
     * Aktualisiert die Gesamt-Speicher-Übersicht
     */
    updateStorageOverview() {
        const quota = this.storageManager.getTotalQuota();

        // Konvertiere zu GB
        const totalGB = (quota.total / (1024 ** 3)).toFixed(2);
        const usedGB = (quota.used / (1024 ** 3)).toFixed(2);
        const freeGB = (quota.free / (1024 ** 3)).toFixed(2);

        // Update UI
        document.getElementById('totalStorage').textContent = `${totalGB} GB`;
        document.getElementById('usedStorage').textContent = `${usedGB} GB`;
        document.getElementById('freeStorage').textContent = `${freeGB} GB`;
        
        // Update Progress Bar
        const percentage = quota.percentage.toFixed(1);
        document.getElementById('storageBarFill').style.width = `${percentage}%`;
        document.getElementById('storagePercentage').textContent = `${percentage}%`;
    }

    /**
     * Rendert die Dateiliste
     */
    renderFileList(files) {
        const fileList = document.getElementById('fileList');
        if (!fileList) return;

        // Leere die Liste
        fileList.innerHTML = '';

        if (files.length === 0) {
            fileList.innerHTML = `
                <div class="file-list-empty">
                    <i class="fas fa-folder-open"></i>
                    <p>Keine Dateien gefunden</p>
                    <p class="hint">Verbinde einen Cloud-Provider und lade Dateien hoch</p>
                </div>
            `;
            return;
        }

        // Rendere jede Datei
        files.forEach(file => {
            const fileItem = this.createFileItem(file);
            fileList.appendChild(fileItem);
        });
    }

    /**
     * Erstellt ein Datei-Element
     */
    createFileItem(file) {
        const div = document.createElement('div');
        div.className = 'file-item';

        // Icon basierend auf Dateityp
        const icon = this.getFileIcon(file.name);

        // Formatiere Dateigröße
        const size = this.formatFileSize(file.size);

        // Formatiere Datum
        const date = this.formatDate(file.modified);

        // Provider Badge Farbe
        const providerColor = this.getProviderColor(file.provider);

        div.innerHTML = `
            <div class="file-icon">${icon}</div>
            <div class="file-info">
                <div class="file-name">${this.escapeHtml(file.name)}</div>
                <div class="file-meta">${size} • ${date}</div>
            </div>
            <div class="file-source" style="background-color: ${providerColor};">
                ${file.providerName}
            </div>
            <div class="file-actions">
                <button onclick="ui.downloadFile('${file.provider}', '${file.id}', '${this.escapeHtml(file.name)}')" 
                        title="Herunterladen">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        `;

        return div;
    }

    /**
     * Lädt eine Datei herunter
     */
    async downloadFile(providerId, fileId, fileName) {
        const result = await this.storageManager.downloadFile(providerId, fileId, fileName);
        
        if (!result.success) {
            this.showErrorModal(result.message);
        }
    }

    /**
     * Gibt ein Icon basierend auf Dateiendung zurück
     */
    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        
        const icons = {
            // Bilder
            'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'svg': '🖼️',
            // Dokumente
            'pdf': '📄', 'doc': '📝', 'docx': '📝', 'txt': '📝',
            // Tabellen
            'xls': '📊', 'xlsx': '📊', 'csv': '📊',
            // Präsentationen
            'ppt': '📊', 'pptx': '📊',
            // Code
            'js': '💻', 'html': '💻', 'css': '💻', 'py': '💻', 'java': '💻',
            // Archive
            'zip': '📦', 'rar': '📦', '7z': '📦',
            // Video
            'mp4': '🎥', 'avi': '🎥', 'mov': '🎥',
            // Audio
            'mp3': '🎵', 'wav': '🎵', 'flac': '🎵'
        };

        return icons[ext] || '📄';
    }

    /**
     * Formatiert Dateigröße
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Formatiert Datum
     */
    formatDate(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }

        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Heute';
        if (days === 1) return 'Gestern';
        if (days < 7) return `Vor ${days} Tagen`;

        return date.toLocaleDateString('de-DE');
    }

    /**
     * Gibt Farbe für Provider zurück
     */
    getProviderColor(providerId) {
        const colors = {
            'google': 'rgba(74, 144, 226, 0.2)',
            'onedrive': 'rgba(123, 104, 238, 0.2)',
            'azure': 'rgba(80, 200, 120, 0.2)'
        };
        return colors[providerId] || 'rgba(127, 140, 141, 0.2)';
    }

    /**
     * Escaped HTML für XSS-Schutz
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Toggle Dark Mode
     */
    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        
        // Speichere Präferenz
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);

        // Update Icon
        const icon = document.querySelector('#darkModeBtn i');
        if (icon) {
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    /**
     * Lädt Dark Mode Präferenz
     */
    loadDarkModePreference() {
        const isDark = localStorage.getItem('darkMode') === 'true';
        if (isDark) {
            document.body.classList.add('dark-mode');
            const icon = document.querySelector('#darkModeBtn i');
            if (icon) {
                icon.className = 'fas fa-sun';
            }
        }
    }

    /**
     * Zeigt Error Modal
     */
    showErrorModal(message) {
        const modal = document.getElementById('errorModal');
        const messageElement = document.getElementById('errorMessage');
        
        if (modal && messageElement) {
            messageElement.textContent = message;
            modal.style.display = 'flex';
        }
    }

    /**
     * Versteckt Error Modal
     */
    hideErrorModal() {
        const modal = document.getElementById('errorModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Zeigt Loading Skeleton
     */
    showLoadingSkeleton() {
        const skeleton = document.getElementById('loadingSkeleton');
        const fileList = document.getElementById('fileList');
        
        if (skeleton) skeleton.style.display = 'block';
        if (fileList) fileList.style.display = 'none';
    }

    /**
     * Versteckt Loading Skeleton
     */
    hideLoadingSkeleton() {
        const skeleton = document.getElementById('loadingSkeleton');
        const fileList = document.getElementById('fileList');
        
        if (skeleton) skeleton.style.display = 'none';
        if (fileList) fileList.style.display = 'block';
    }

    /**
     * Aktualisiert alle Daten und UI
     */
    async refreshAllData() {
        // Update Provider Cards
        const status = this.storageManager.getProvidersStatus();
        for (const [providerId, providerStatus] of Object.entries(status)) {
            this.updateProviderCard(providerId, providerStatus.connected);
        }

        // Update Storage Overview
        this.updateStorageOverview();

        // Update File List
        this.showLoadingSkeleton();
        const files = await this.storageManager.getAllFiles();
        this.currentFiles = files;
        this.renderFileList(files);
        this.hideLoadingSkeleton();
    }
}
