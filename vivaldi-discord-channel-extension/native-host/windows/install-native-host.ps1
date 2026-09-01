param(
    [Parameter(Mandatory = $true)]
    [string]$ExtensionId
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$hostScriptPath = Join-Path $scriptDir 'discord-channel-host.ps1'
$templatePath = Join-Path $scriptDir 'com.46dvniiel.discord_channel_host.json'
$targetDir = Join-Path $env:LOCALAPPDATA 'Vivaldi\User Data\NativeMessagingHosts'
$targetPath = Join-Path $targetDir 'com.46dvniiel.discord_channel_host.json'

if (!(Test-Path $hostScriptPath)) {
    throw "Host script not found at $hostScriptPath"
}

if (!(Test-Path $templatePath)) {
    throw "Manifest template not found at $templatePath"
}

if (!(Test-Path $targetDir)) {
    New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
}

$template = Get-Content -Path $templatePath -Raw
$filled = $template.Replace('C:\\REPLACE_WITH_ABSOLUTE_PATH\\discord-channel-host.ps1', $hostScriptPath.Replace('\', '\\'))
$filled = $filled.Replace('REPLACE_WITH_EXTENSION_ID', $ExtensionId)
Set-Content -Path $targetPath -Value $filled -Encoding UTF8

Write-Host "Native host manifest installed to: $targetPath"
