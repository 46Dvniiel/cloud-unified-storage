param(
    [Parameter(Mandatory = $true)]
    [string]$ExtensionId
)

$hostName = 'com.46dvniiel.discord_channel_host'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$hostScriptPath = Join-Path $scriptDir 'discord-channel-host.ps1'
$hostLauncherPath = Join-Path $scriptDir 'discord-channel-host.cmd'
$templatePath = Join-Path $scriptDir 'com.46dvniiel.discord_channel_host.json'
$targetDir = Join-Path $env:LOCALAPPDATA 'Vivaldi\User Data\NativeMessagingHosts'
$targetPath = Join-Path $targetDir "$hostName.json"

if (!(Test-Path $hostScriptPath)) {
    throw "Host script not found at $hostScriptPath"
}

if (!(Test-Path $hostLauncherPath)) {
    throw "Host launcher not found at $hostLauncherPath"
}

if (!(Test-Path $templatePath)) {
    throw "Manifest template not found at $templatePath"
}

if (!(Test-Path $targetDir)) {
    New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
}

$template = Get-Content -Path $templatePath -Raw
$filled = $template.Replace('C:\\REPLACE_WITH_ABSOLUTE_PATH\\discord-channel-host.cmd', $hostLauncherPath.Replace('\', '\\'))
$filled = $filled.Replace('REPLACE_WITH_EXTENSION_ID', $ExtensionId)
Set-Content -Path $targetPath -Value $filled -Encoding UTF8

$registryKeys = @(
    "HKCU\Software\Vivaldi\NativeMessagingHosts\$hostName",
    "HKCU\Software\Chromium\NativeMessagingHosts\$hostName"
)

foreach ($key in $registryKeys) {
    & reg.exe add $key /ve /t REG_SZ /d $targetPath /f | Out-Null
}

Write-Host "Native host manifest installed to: $targetPath"
Write-Host "Native host registered in Windows registry for Vivaldi/Chromium user scope."
