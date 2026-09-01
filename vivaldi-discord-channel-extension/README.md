# Vivaldi Extension: Discord Channel

This extension shows the currently open Discord channel from the **Windows Discord desktop app**.

## What it does

- Adds a Vivaldi toolbar popup.
- Reads the Discord desktop window title via a Windows native messaging host.
- Displays detected:
  - Channel (`#channel`)
  - Server
  - Full window title

## Files

- `manifest.json` - Vivaldi/Chromium extension manifest (MV3)
- `popup.html`, `popup.css`, `popup.js` - extension UI and native message request
- `native-host/windows/discord-channel-host.ps1` - native host process logic
- `native-host/windows/discord-channel-host.cmd` - launcher used by native messaging
- `native-host/windows/install-native-host.ps1` - helper installer for native host manifest
- `native-host/windows/com.46dvniiel.discord_channel_host.json` - native host manifest template

## Setup (Windows + Vivaldi)

1. Open `vivaldi://extensions` in Vivaldi.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select:
   `/home/runner/work/cloud-unified-storage/cloud-unified-storage/vivaldi-discord-channel-extension`
4. Copy the extension ID from the loaded extension card.
5. On Windows PowerShell, run:

   ```powershell
   cd <repo>\vivaldi-discord-channel-extension\native-host\windows
   .\install-native-host.ps1 -ExtensionId <YOUR_EXTENSION_ID>
   ```

6. The installer writes the manifest and registers the host in `HKCU` for Vivaldi/Chromium.
7. Fully close and reopen Vivaldi.
8. Click the extension icon and press **Refresh**.

## Notes / limitations

- Discord must be running as the desktop app on Windows.
- Detection depends on Discord's window title format (`#channel | server | Discord`).
- If Discord changes its window title format, parsing may return no channel.
