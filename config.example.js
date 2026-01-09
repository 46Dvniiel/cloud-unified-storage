/**
 * WICHTIG: Diese Datei ist nur ein Template!
 * 
 * Schritte zum Setup:
 * 1. Kopiere diese Datei und benenne sie um zu "config.js"
 * 2. Ersetze die Platzhalter mit deinen echten API Keys
 * 3. NIEMALS die config.js in Git committen!
 * 
 * Wie du API Keys erhältst:
 * - Google Drive: https://console.cloud.google.com/
 * - Dropbox: https://www.dropbox.com/developers/apps
 * - Azure Storage: https://portal.azure.com/ (Storage Account)
 */

const CONFIG = {
    // Google Drive API Konfiguration
    // Erstelle ein Projekt in der Google Cloud Console und aktiviere die Drive API
    google: {
        clientId: 'DEINE_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
        apiKey: 'DEIN_GOOGLE_API_KEY',
        // Diese Scopes definieren, welche Berechtigungen die App hat
        scopes: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly',
        // Discovery Docs für die API
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
    },

    // Dropbox API Konfiguration
    // Erstelle eine App auf der Dropbox Developer Console
    // https://www.dropbox.com/developers/apps
    dropbox: {
        // App Key von deiner Dropbox App
        appKey: 'DEINE_DROPBOX_APP_KEY_HIER',
        // App Secret von deiner Dropbox App
        // ⚠️ KRITISCHER SICHERHEITSHINWEIS:
        // - Das App Secret sollte NIEMALS im Frontend-Code verwendet werden!
        // - Jeder kann den JavaScript-Code lesen und das Secret extrahieren
        // - Für PRODUKTION: Implementiere einen Backend-Service für Token-Exchange
        // - Diese Konfiguration ist NUR für lokale Entwicklung/Demo/Prototyping
        appSecret: 'DEINE_DROPBOX_APP_SECRET_HIER',
        // Redirect URI muss in der App-Konfiguration eingetragen sein
        // Für lokale Entwicklung: http://localhost:8000/callback
        redirectUri: 'http://localhost:8000/callback'
    },

    // Azure Blob Storage Konfiguration
    // Erstelle einen Storage Account im Azure Portal
    azure: {
        // Format: DefaultEndpointsProtocol=https;AccountName=xxx;AccountKey=xxx;EndpointSuffix=core.windows.net
        connectionString: 'DEINE_AZURE_CONNECTION_STRING',
        // Name des Containers in deinem Storage Account
        containerName: 'cloud-unified-storage'
    }
};

// HINWEIS zu iCloud:
// Apple bietet keine offizielle REST-API für iCloud Drive.
// Alternativen:
// 1. iCloud für Windows nutzen (lokaler Ordner-Sync)
// 2. Drittanbieter-Lösungen (nicht empfohlen wegen Sicherheit)
// 3. CloudKit JS (limitierte Funktionalität)
