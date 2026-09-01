# 🌥️ Cloud Unified Storage WebApp

Eine moderne, vollständig funktionsfähige WebApp, die mehrere Cloud-Speicher (Google Drive, Dropbox, Microsoft Azure Storage) zu einem einheitlichen Speicher verbindet.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow.svg)

## 📋 Inhaltsverzeichnis

- [Über das Projekt](#-über-das-projekt)
- [Features](#-features)
- [Demo Screenshots](#-demo-screenshots)
- [Technologie-Stack](#-technologie-stack)
- [Voraussetzungen](#-voraussetzungen)
- [Installation](#-installation)
- [Konfiguration](#-konfiguration)
  - [Google Drive Setup](#1-google-drive-api-einrichten)
  - [Dropbox Setup](#2-dropbox-api-einrichten)
  - [Azure Storage Setup](#3-azure-blob-storage-einrichten)
- [Verwendung](#-verwendung)
- [Projektstruktur](#-projektstruktur)
- [Features im Detail](#-features-im-detail)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Sicherheitshinweise](#-sicherheitshinweise)
- [Browser-Kompatibilität](#-browser-kompatibilität)
- [Häufig gestellte Fragen (FAQ)](#-häufig-gestellte-fragen-faq)
- [Lizenz](#-lizenz)
- [Kontakt](#-kontakt)

---

## 🎯 Über das Projekt

Cloud Unified Storage ist eine **Single-Page-WebApp**, die es dir ermöglicht, mehrere Cloud-Speicher-Dienste über eine einzige Oberfläche zu verwalten. Keine Installation erforderlich - läuft direkt im Browser!

### Warum Cloud Unified Storage?

- 📊 **Einheitliche Übersicht**: Sieh all deine Dateien aus verschiedenen Clouds an einem Ort
- 🤖 **Intelligente Speicher-Verteilung**: Automatische Auswahl des Providers mit dem meisten freien Speicher
- 🔍 **Globale Suche**: Durchsuche alle deine Cloud-Dateien gleichzeitig
- 🎨 **Modernes Design**: Glassmorphism-Effekte und Dark Mode
- 🔒 **Sicher**: Deine API-Keys bleiben lokal, OAuth 2.0 Authentifizierung
- 📱 **Responsive**: Funktioniert auf Desktop, Tablet und Mobile

---

## ✨ Features

### Zusatz: Vivaldi-Extension für Discord (Windows)
- ✅ Enthält eine lokale Vivaldi-Extension unter `vivaldi-discord-channel-extension/`
- ✅ Zeigt den aktuell erkannten Discord-Kanal aus der Windows-Desktop-App
- ✅ Nutzt Native Messaging Host für die Kommunikation mit der Windows-App

### Cloud-Provider Unterstützung
- ✅ **Google Drive** - OAuth 2.0 Integration mit Google Drive API v3
- ✅ **Dropbox** - OAuth 2.0 mit PKCE Integration über Dropbox HTTP API v2
- ✅ **Azure Blob Storage** - Connection String Authentifizierung
- ℹ️ **iCloud** - Hinweis: Keine offizielle API verfügbar (siehe FAQ)

### Benutzeroberfläche
- 🎨 **Modernes Glassmorphism-Design** mit Blur-Effekten
- 🌙 **Dark Mode** mit persistenter Speicherung
- 📱 **Vollständig responsive** (Mobile-First Design)
- 🔄 **Loading States** mit Skeleton Screens
- ⚡ **Schnelle Performance** durch intelligentes Caching

### Datei-Verwaltung
- 📤 **Drag & Drop Upload** - Ziehe Dateien direkt in die Upload-Zone
- 📥 **Download** - Lade Dateien von jedem Provider herunter
- 📊 **Datei-Informationen** - Name, Größe, Änderungsdatum, Quelle
- 🔍 **Globale Suche** - Durchsuche alle Clouds gleichzeitig
- 📈 **Upload-Progress** - Live-Fortschrittsanzeige

### Intelligente Funktionen
- 🤖 **Auto-Upload** - Wählt automatisch den Provider mit dem meisten freien Speicher
- 🎯 **Manuelle Auswahl** - Du kannst auch selbst den Ziel-Provider wählen
- 📊 **Speicher-Statistiken** - Visuelles Dashboard mit Balkendiagrammen
- 💾 **Quota-Überwachung** - Echtzeit-Anzeige von verfügbarem Speicher

---

## 📸 Demo Screenshots

> Hinweis: Screenshots werden nach dem ersten Deployment hinzugefügt

---

## 🛠 Technologie-Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Modern CSS3 mit Flexbox/Grid
- **APIs**: 
  - Google Drive API v3
  - Dropbox HTTP API v2
  - Azure Storage Blob SDK
- **Authentifizierung**: OAuth 2.0
- **Icons**: Font Awesome 6.4.0
- **Hosting**: Statisches Hosting (Netlify, Vercel, GitHub Pages)

### Keine Build-Tools erforderlich!
Diese App läuft direkt im Browser ohne Node.js, npm oder andere Build-Tools. Perfekt für Anfänger!

---

## 📦 Voraussetzungen

### Was du brauchst:
1. ✅ Einen modernen Webbrowser (Chrome, Firefox, Edge, Safari)
2. ✅ Einen Texteditor (VS Code, Sublime Text, Notepad++)
3. ✅ (Optional) Einen lokalen Webserver für Tests
4. ✅ Accounts bei den Cloud-Providern, die du nutzen möchtest:
   - Google Account (für Google Drive)
   - Dropbox Account (für Dropbox)
   - Azure Account (für Azure Storage)

### Keine Programmierkenntnisse nötig!
Diese Anleitung führt dich Schritt für Schritt durch das Setup.

---

## 🚀 Installation

### Schritt 1: Repository klonen oder herunterladen

**Option A: Mit Git (empfohlen)**
```bash
git clone https://github.com/46Dvniiel/cloud-unified-storage.git
cd cloud-unified-storage
```

**Option B: Als ZIP herunterladen**
1. Klicke auf den grünen "Code" Button oben rechts
2. Wähle "Download ZIP"
3. Entpacke die ZIP-Datei in einen Ordner deiner Wahl

### Schritt 2: config.js erstellen

1. Kopiere die Datei `config.example.js`
2. Benenne die Kopie in `config.js` um
3. Öffne `config.js` in einem Texteditor

```bash
# macOS/Linux
cp config.example.js config.js

# Windows (PowerShell)
Copy-Item config.example.js config.js
```

### Schritt 3: Im Browser öffnen

**Option A: Direkt öffnen (einfach, aber mit Einschränkungen)**
- Doppelklicke auf `index.html`
- ⚠️ Achtung: OAuth funktioniert möglicherweise nicht korrekt

**Option B: Mit lokalem Server (empfohlen)**

Mit Python:
```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

Mit Node.js (npx):
```bash
npx http-server -p 8080
```

Mit VS Code:
- Installiere die Extension "Live Server"
- Rechtsklick auf `index.html` → "Open with Live Server"

Dann öffne: `http://localhost:8080`

---

## ⚙️ Konfiguration

Jetzt musst du API-Keys für die Cloud-Provider erstellen. Folge den Schritten für jeden Provider, den du nutzen möchtest.

### 1. Google Drive API einrichten

#### Schritt 1.1: Google Cloud Console öffnen
1. Gehe zu [Google Cloud Console](https://console.cloud.google.com/)
2. Melde dich mit deinem Google Account an

#### Schritt 1.2: Neues Projekt erstellen
1. Klicke oben auf den Projektnamen → "New Project"
2. Gib einen Namen ein (z.B. "Cloud Unified Storage")
3. Klicke "Create"

#### Schritt 1.3: Google Drive API aktivieren
1. Im Menü links: "APIs & Services" → "Library"
2. Suche nach "Google Drive API"
3. Klicke auf "Google Drive API"
4. Klicke "Enable"

#### Schritt 1.4: OAuth Consent Screen konfigurieren
1. "APIs & Services" → "OAuth consent screen"
2. Wähle "External" → "Create"
3. Fülle die Pflichtfelder aus:
   - **App name**: Cloud Unified Storage
   - **User support email**: Deine E-Mail
   - **Developer contact**: Deine E-Mail
4. Klicke "Save and Continue"
5. Bei "Scopes": Klicke "Add or Remove Scopes"
   - Suche und füge hinzu: `../auth/drive.file` und `../auth/drive.metadata.readonly`
6. "Save and Continue" → "Save and Continue"

#### Schritt 1.5: OAuth Client ID erstellen
1. "APIs & Services" → "Credentials"
2. Klicke "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "Cloud Unified Storage Web Client"
5. Authorized JavaScript origins:
   ```
   http://localhost:8080
   http://127.0.0.1:8080
   ```
6. Klicke "Create"
7. **Kopiere die Client ID** (sieht aus wie: `xxx.apps.googleusercontent.com`)

#### Schritt 1.6: API Key erstellen
1. "Create Credentials" → "API key"
2. **Kopiere den API Key**
3. (Optional) Klicke auf "Restrict Key" und beschränke auf "Google Drive API"

#### Schritt 1.7: In config.js eintragen
```javascript
google: {
    clientId: 'DEINE_CLIENT_ID.apps.googleusercontent.com',
    apiKey: 'DEIN_API_KEY',
    scopes: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
}
```

---

### 2. Dropbox API einrichten

#### Schritt 2.1: Dropbox App Console öffnen
1. Gehe zu [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Melde dich mit deinem Dropbox Account an

#### Schritt 2.2: Neue App erstellen
1. Klicke "Create app"
2. Wähle folgende Optionen:
   - **Choose an API**: Scoped access
   - **Choose the type of access**: Full Dropbox
   - **Name your app**: Cloud Unified Storage (oder einen anderen eindeutigen Namen)
3. Klicke "Create app"

#### Schritt 2.3: App Key und App Secret kopieren
1. Auf der App-Seite findest du:
   - **App key**: Kopiere diesen Wert
   - **App secret**: Klicke "Show" und kopiere den Wert
2. ⚠️ **WICHTIG**: Behandle das App Secret wie ein Passwort!

#### Schritt 2.4: Redirect URIs konfigurieren
1. Scrolle zu "OAuth 2" → "Redirect URIs"
2. Füge hinzu: `http://localhost:8000/callback`
3. Für Produktion füge deine Production-URL hinzu (z.B. `https://deine-domain.com/callback`)
4. Klicke "Add"

#### Schritt 2.5: Permissions setzen
1. Scrolle zu "Permissions"
2. Aktiviere folgende Scopes:
   - **files.metadata.read** - Dateimetadaten lesen
   - **files.content.read** - Dateiinhalte lesen
   - **files.content.write** - Dateien hochladen
   - **account_info.read** - Kontoinformationen lesen (für Quota)
3. Klicke "Submit" am Ende der Seite

#### Schritt 2.6: In config.js eintragen
```javascript
dropbox: {
    appKey: 'DEINE_DROPBOX_APP_KEY_HIER',  // Ersetze mit deinem App Key
    appSecret: 'DEINE_DROPBOX_APP_SECRET_HIER',  // Ersetze mit deinem App Secret
    redirectUri: 'http://localhost:8000/callback'
}
```

⚠️ **KRITISCHER SICHERHEITSHINWEIS**: 
- Das App Secret sollte in Produktion **NIEMALS** im Frontend-Code stehen!
- Jeder kann JavaScript-Code im Browser lesen und das Secret extrahieren
- **Für Produktion**: Implementiere einen Backend-Service (Node.js, Python, etc.) für den Token-Exchange
- Der Backend-Service hält das Secret geheim und tauscht nur Authorization Codes gegen Tokens
- Diese Frontend-Konfiguration ist **NUR** für lokale Entwicklung/Demo/Lernen geeignet!

**Produktions-Alternative (Empfohlen)**:
1. Erstelle einen Backend-Endpunkt (z.B. `/api/dropbox/token`)
2. Frontend sendet Authorization Code an Backend
3. Backend tauscht Code gegen Token (mit Secret)
4. Backend sendet Access Token zurück

**Dropbox API Dokumentation**:
- [OAuth Guide](https://www.dropbox.com/developers/reference/oauth-guide)
- [HTTP API](https://www.dropbox.com/developers/documentation/http/documentation)
- [PKCE Flow](https://www.dropbox.com/developers/reference/oauth-guide#oauth-2-authorization-code-flow-with-pkce)

---

### 3. Azure Blob Storage einrichten

#### Schritt 3.1: Storage Account erstellen
1. Im [Azure Portal](https://portal.azure.com/)
2. Suche nach "Storage accounts"
3. Klicke "Create"
4. Fülle aus:
   - **Subscription**: Deine Subscription
   - **Resource group**: Erstelle eine neue oder wähle eine existierende
   - **Storage account name**: z.B. `cloudunifiedstorage` (muss eindeutig sein)
   - **Region**: Wähle eine Region in deiner Nähe
   - **Performance**: Standard
   - **Redundancy**: LRS (Locally-redundant storage)
5. Klicke "Review + create" → "Create"

#### Schritt 3.2: Container erstellen
1. Gehe zu deinem Storage Account
2. Im Menü links: "Containers"
3. Klicke "+ Container"
4. Name: `cloud-unified-storage`
5. Public access level: "Private"
6. Klicke "Create"

#### Schritt 3.3: Connection String kopieren
1. Im Menü links: "Access keys"
2. Unter "key1" → Zeige "Connection string"
3. **Kopiere den Connection String**

#### Schritt 3.4: CORS konfigurieren (wichtig!)
1. Im Menü links: "Resource sharing (CORS)"
2. Im Tab "Blob service":
   - **Allowed origins**: `http://localhost:8080`
   - **Allowed methods**: GET, PUT, POST, DELETE, OPTIONS
   - **Allowed headers**: *
   - **Exposed headers**: *
   - **Max age**: 3600
3. Klicke "Save"

#### Schritt 3.5: In config.js eintragen
```javascript
azure: {
    connectionString: 'DEIN_CONNECTION_STRING',
    containerName: 'cloud-unified-storage'
}
```

⚠️ **WICHTIG**: Der Connection String sollte in Produktion **NIEMALS** im Frontend verwendet werden! Dies ist nur für Demo/Entwicklung. In Produktion solltest du einen Backend-Service verwenden, der SAS-Tokens generiert.

---

## 📖 Verwendung

### Erste Schritte

1. **Öffne die App** in deinem Browser (`http://localhost:8080`)

2. **Verbinde einen Cloud-Provider**
   - Klicke auf "Verbinden" bei Google Drive, Dropbox oder Azure
   - Melde dich mit deinem Account an
   - Erlaube der App den Zugriff

3. **Sieh deine Speicher-Übersicht**
   - Die Gesamtspeicher-Anzeige zeigt alle verbundenen Clouds
   - Jede Provider-Card zeigt den individuellen Speicher

4. **Dateien hochladen**
   - Wähle "Automatisch" für intelligente Provider-Auswahl
   - Oder wähle manuell einen Provider
   - Ziehe Dateien in die Upload-Zone ODER klicke "Dateien auswählen"

5. **Dateien durchsuchen**
   - Nutze die Suchleiste für globale Suche
   - Klicke auf Download-Icon zum Herunterladen

### Tipps & Tricks

💡 **Auto-Upload nutzen**: Wähle "Automatisch" als Ziel-Provider, und die App lädt die Datei zum Provider mit dem meisten freien Speicher hoch.

💡 **Dark Mode**: Klicke auf den Mond-Button oben rechts. Deine Präferenz wird gespeichert.

💡 **Globale Suche**: Die Suche durchsucht alle verbundenen Clouds gleichzeitig.

💡 **Mehrere Dateien**: Du kannst mehrere Dateien gleichzeitig per Drag & Drop hochladen.

---

## 📁 Projektstruktur

```
cloud-unified-storage/
├── index.html              # Haupt-HTML-Datei
├── config.example.js       # Template für Konfiguration
├── config.js              # Deine Konfiguration (nicht in Git!)
├── README.md              # Diese Datei
├── LICENSE                # MIT Lizenz
├── .gitignore            # Git Ignore Regeln
├── css/
│   └── styles.css        # Alle Styles (Glassmorphism, Dark Mode)
└── js/
    ├── app.js            # Haupt-App-Logik, Initialisierung
    ├── ui.js             # UI-Updates, DOM-Manipulation
    ├── storageManager.js # Zentrale Provider-Verwaltung
    └── providers/
        ├── googleDrive.js    # Google Drive Integration
        ├── dropbox.js        # Dropbox Integration
        └── azure.js          # Azure Storage Integration
```

---

## 🎯 Features im Detail

### Intelligente Speicher-Verteilung

Die App wählt automatisch den besten Provider basierend auf:
- Verfügbarem freiem Speicher
- Verbindungsstatus
- Upload-Größe vs. verfügbarer Speicher

### Datei-Browser

- **Echtzeit-Updates**: Dateien werden sofort nach Upload angezeigt
- **Sortierung**: Neueste Dateien zuerst
- **Provider-Kennzeichnung**: Jede Datei zeigt ihre Quelle
- **Größen-Formatierung**: Automatische Konvertierung (Bytes → KB → MB → GB)
- **Datumsformatierung**: Relative Zeiten ("Heute", "Gestern", "Vor X Tagen")

### Sicherheit

- **Keine API-Keys im Code**: Alle Keys in separater, nicht-committeter config.js
- **OAuth 2.0**: Sichere Authentifizierung über offizielle Provider-APIs
- **XSS-Schutz**: HTML-Escaping für Benutzereingaben
- **HTTPS**: Produktions-Deployment nur über HTTPS
- **LocalStorage**: Sichere Token-Speicherung im Browser

### Performance

- **Lazy Loading**: Große Dateilisten werden effizient geladen
- **Caching**: LocalStorage für Dateilisten
- **Debouncing**: Suchfunktion optimiert für Performance
- **Skeleton Screens**: Bessere User Experience beim Laden

---

## 🌐 Deployment

### Option 1: Netlify (Empfohlen für Anfänger)

1. **Erstelle einen Netlify Account** auf [netlify.com](https://netlify.com)

2. **Neue Site erstellen**
   - "Add new site" → "Import an existing project"
   - Verbinde dein GitHub Repository
   - Build settings: **Leer lassen** (kein Build erforderlich)
   - Klicke "Deploy"

3. **Umgebungsvariablen setzen** (Optional)
   - Site settings → Environment variables
   - Füge API-Keys hinzu (sicherer als lokale config.js)

4. **Custom Domain** (Optional)
   - Domain settings → Add custom domain
   - Folge den DNS-Anweisungen

5. **HTTPS** ist automatisch aktiviert! ✅

### Option 2: Vercel

1. **Vercel Account** auf [vercel.com](https://vercel.com)
2. **Import Git Repository**
3. **Deploy** (keine Build-Konfiguration nötig)
4. Fertig!

### Option 3: GitHub Pages

1. **GitHub Repository Settings**
2. "Pages" → Source: "main branch"
3. Wähle "/" als root
4. Speichern

⚠️ **Wichtig für Production**:
- Aktualisiere OAuth Redirect URIs mit deiner Production-URL
- Füge Production-Domain zu "Authorized JavaScript origins" hinzu
- Verwende **HTTPS** für alle Deployments (OAuth Requirement)

---

## 🔧 Troubleshooting

### Problem: "config.js nicht gefunden"

**Lösung**:
1. Stelle sicher, dass `config.js` im Root-Ordner liegt
2. Prüfe Schreibweise (Groß-/Kleinschreibung beachten)
3. Laufe nicht direkt `index.html` öffnen, sondern nutze einen lokalen Server

### Problem: Google Drive Login funktioniert nicht

**Mögliche Ursachen**:
1. **Redirect URI nicht konfiguriert**
   - Gehe zu Google Cloud Console
   - Credentials → OAuth Client
   - Füge `http://localhost:8080` zu "Authorized JavaScript origins" hinzu

2. **App nicht published**
   - OAuth consent screen → "Publish App"
   - Oder füge deine E-Mail als Test-User hinzu

3. **Falscher Scope**
   - Prüfe, ob Scopes in config.js korrekt sind

### Problem: Dropbox OAuth funktioniert nicht

**Mögliche Ursachen**:
1. **Redirect URI nicht konfiguriert**
   - Gehe zur Dropbox App Console
   - OAuth 2 → Redirect URIs
   - Füge `http://localhost:8000/callback` hinzu
   - Stelle sicher, dass die URI exakt übereinstimmt (auch Port!)

2. **App Permissions fehlen**
   - Dropbox App Console → Permissions
   - Aktiviere: files.metadata.read, files.content.read, files.content.write
   - Klicke "Submit" am Ende der Seite

3. **App Key oder Secret falsch**
   - Prüfe, ob App Key und App Secret korrekt in config.js eingetragen sind
   - Keine Leerzeichen am Anfang/Ende

4. **PKCE Fehler**
   - Stelle sicher, dass dein Browser Crypto API unterstützt
   - Lösche LocalStorage: F12 → Application → Local Storage → Clear All

### Problem: Azure Upload funktioniert nicht

**Mögliche Ursachen**:
1. **CORS nicht konfiguriert**
   - Azure Portal → Storage Account → CORS
   - Füge `http://localhost:8080` als Allowed Origin hinzu

2. **Connection String falsch**
   - Prüfe, ob der komplette String kopiert wurde
   - Achte auf Leerzeichen am Anfang/Ende

3. **Container existiert nicht**
   - Azure Portal → Containers
   - Erstelle Container mit dem Namen aus `config.js`

### Problem: "Nicht genug Speicher"

**Lösung**:
1. Verbinde weitere Cloud-Provider
2. Oder lösche nicht benötigte Dateien
3. Wähle manuell einen Provider mit mehr Speicher

### Problem: Dateien werden nicht angezeigt

**Lösung**:
1. Öffne Browser-Konsole (F12)
2. Prüfe auf Fehler (rot markiert)
3. Stelle sicher, dass Provider verbunden ist
4. Aktualisiere die Seite (F5)

### Problem: Dark Mode funktioniert nicht

**Lösung**:
1. Lösche Browser-Cache
2. Prüfe LocalStorage: F12 → Application → Local Storage
3. Setze zurück: `localStorage.clear()` in Konsole

---

## 🔒 Sicherheitshinweise

### ⚠️ WICHTIG: Niemals committen!

Füge **NIE** folgende Dateien zu Git hinzu:
- ❌ `config.js` (enthält API-Keys)
- ❌ Dateien mit Passwörtern oder Tokens
- ❌ `.env` Dateien mit Secrets

✅ Die `.gitignore` ist bereits konfiguriert!

### API-Key Sicherheit

- **Google API Key**: Beschränke auf deine Domain
- **Azure Connection String**: Nutze in Produktion SAS-Tokens statt Connection Strings
- **OAuth Tokens**: Werden nur im Browser LocalStorage gespeichert

### Best Practices

1. ✅ Nutze HTTPS in Produktion
2. ✅ Erneuere API-Keys regelmäßig
3. ✅ Beschränke OAuth Scopes auf Minimum
4. ✅ Überwache API-Usage in Cloud Consoles
5. ✅ Nutze Environment Variables für Deployment

### Azure Storage Warnung

⚠️ **Connection Strings im Frontend = Sicherheitsrisiko!**

Für Produktion:
1. Erstelle einen Backend-Service
2. Backend generiert kurzlebige SAS-Tokens
3. Frontend nutzt nur SAS-Tokens
4. Niemals Connection Strings im Frontend-Code!

---

## 🌍 Browser-Kompatibilität

### Unterstützte Browser

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Vollständig unterstützt |
| Firefox | 88+ | ✅ Vollständig unterstützt |
| Edge | 90+ | ✅ Vollständig unterstützt |
| Safari | 14+ | ✅ Vollständig unterstützt |
| Opera | 76+ | ✅ Vollständig unterstützt |

### Benötigte Features

- ✅ ES6+ JavaScript
- ✅ Fetch API
- ✅ LocalStorage
- ✅ File API
- ✅ Drag & Drop API

### Mobile Browser

- ✅ Chrome Mobile (Android)
- ✅ Safari (iOS)
- ⚠️ Upload per Drag & Drop nur auf Desktop

---

## ❓ Häufig gestellte Fragen (FAQ)

### Warum wird iCloud nicht unterstützt?

Apple bietet keine offizielle REST-API für iCloud Drive an. Verfügbare Optionen:
- **CloudKit JS**: Sehr limitierte Funktionalität
- **iCloud für Windows**: Lokaler Ordner-Sync
- **Drittanbieter-APIs**: Sicherheitsrisiko, nicht empfohlen

### Kostet die Nutzung Geld?

Die App selbst ist **kostenlos und Open Source**. 

Cloud-Provider können Kosten verursachen:
- **Google Drive**: 15 GB kostenlos
- **Dropbox**: 2 GB kostenlos (2 TB mit Dropbox Plus)
- **Azure Storage**: Bezahlt nach Nutzung (sehr günstig)

### Kann ich weitere Cloud-Provider hinzufügen?

Ja! Die Architektur ist modular. Du kannst Provider hinzufügen:
1. Erstelle neue Datei in `js/providers/`
2. Implementiere die Provider-Klasse
3. Registriere in `storageManager.js`

Beliebte Kandidaten:
- Dropbox
- Box
- AWS S3

### Werden meine Dateien hochgeladen?

Ja, aber:
- Nur zu den Providern, die **DU** verbindest
- Nur Dateien, die **DU** auswählst
- Kein automatischer Upload ohne deine Aktion
- App hat **keinen eigenen Server** - alles läuft lokal

### Kann ich die App ohne Internet nutzen?

Nein. Die App benötigt Internet für:
- OAuth-Authentifizierung
- Zugriff auf Cloud-APIs
- Laden von CDN-Ressourcen

Offline-Modus könnte mit Service Worker hinzugefügt werden (zukünftiges Feature).

### Ist meine Daten sicher?

Ja:
- OAuth 2.0 Standard-Authentifizierung
- Keine Speicherung auf Drittserver
- Tokens nur in deinem Browser (LocalStorage)
- Open Source - du kannst den Code überprüfen

⚠️ Aber: Schütze deine `config.js` mit API-Keys!

### Kann ich mehrere Accounts gleichzeitig nutzen?

Derzeit nicht. Du kannst nur einen Account pro Provider verbinden.

Feature-Request? Erstelle ein Issue auf GitHub!

---

## 📄 Lizenz

Dieses Projekt ist lizenziert unter der **MIT License** - siehe [LICENSE](LICENSE) Datei für Details.

### Was bedeutet das?

✅ Du darfst:
- Das Projekt kommerziell nutzen
- Das Projekt modifizieren
- Das Projekt verteilen
- Privat nutzen

⚠️ Bedingungen:
- Lizenz- und Copyright-Hinweis beibehalten

---

## 📞 Kontakt

**Projekt Repository**: [github.com/46Dvniiel/cloud-unified-storage](https://github.com/46Dvniiel/cloud-unified-storage)

**Issues & Feature Requests**: [GitHub Issues](https://github.com/46Dvniiel/cloud-unified-storage/issues)

---

## 🙏 Danksagungen

- **Font Awesome** für die Icons
- **Google**, **Microsoft**, **Azure** für die Cloud APIs
- Alle Contributors und Tester

---

## 🚀 Nächste Schritte

Jetzt bist du bereit! 

1. ✅ Folge der [Installation](#-installation)
2. ✅ Konfiguriere deine [API-Keys](#-konfiguration)
3. ✅ Starte die App und verbinde deine Clouds
4. ✅ Genieße dein einheitliches Cloud-Storage! 🎉

**Viel Erfolg!** 🌥️

---

*Erstellt mit ❤️ für Cloud-Enthusiasten und Anfänger*
