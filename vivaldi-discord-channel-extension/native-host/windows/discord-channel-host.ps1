[Console]::InputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Read-Message {
    $stdin = [Console]::OpenStandardInput()
    $lengthBytes = New-Object byte[] 4
    $read = $stdin.Read($lengthBytes, 0, 4)
    if ($read -ne 4) {
        return $null
    }

    $length = [BitConverter]::ToInt32($lengthBytes, 0)
    if ($length -le 0) {
        return $null
    }

    $payloadBytes = New-Object byte[] $length
    $offset = 0
    while ($offset -lt $length) {
        $chunk = $stdin.Read($payloadBytes, $offset, $length - $offset)
        if ($chunk -le 0) {
            break
        }
        $offset += $chunk
    }

    if ($offset -ne $length) {
        return $null
    }

    return [System.Text.Encoding]::UTF8.GetString($payloadBytes)
}

function Write-Message($object) {
    $stdout = [Console]::OpenStandardOutput()
    $json = $object | ConvertTo-Json -Compress -Depth 6
    $payloadBytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    $lengthBytes = [BitConverter]::GetBytes($payloadBytes.Length)

    $stdout.Write($lengthBytes, 0, 4)
    $stdout.Write($payloadBytes, 0, $payloadBytes.Length)
    $stdout.Flush()
}

function Get-DiscordWindowTitle {
    $process = Get-Process Discord -ErrorAction SilentlyContinue |
        Where-Object { $_.MainWindowHandle -ne 0 -and -not [string]::IsNullOrWhiteSpace($_.MainWindowTitle) } |
        Select-Object -First 1

    if (-not $process) {
        return $null
    }

    return $process.MainWindowTitle
}

function Parse-DiscordTitle([string]$title) {
    if ([string]::IsNullOrWhiteSpace($title)) {
        return @{ channel = $null; server = $null }
    }

    $pattern = '#(?<channel>[^|]+)\s*\|\s*(?<server>[^|]+)\s*\|\s*Discord'
    $match = [regex]::Match($title, $pattern)

    if ($match.Success) {
        return @{
            channel = $match.Groups['channel'].Value.Trim()
            server = $match.Groups['server'].Value.Trim()
        }
    }

    return @{ channel = $null; server = $null }
}

while ($true) {
    try {
        $inputJson = Read-Message
        if ($null -eq $inputJson) {
            break
        }

        $request = $inputJson | ConvertFrom-Json
        if ($request.action -ne 'getCurrentChannel') {
            Write-Message @{ error = 'Unsupported action.' }
            continue
        }

        $title = Get-DiscordWindowTitle
        if ($null -eq $title) {
            Write-Message @{
                running = $false
                channel = $null
                server = $null
                title = $null
                timestamp = [DateTime]::UtcNow.ToString('o')
            }
            continue
        }

        $parsed = Parse-DiscordTitle -title $title
        Write-Message @{
            running = $true
            channel = $parsed.channel
            server = $parsed.server
            title = $title
            timestamp = [DateTime]::UtcNow.ToString('o')
        }
    }
    catch {
        Write-Message @{ error = "Native host failure: $($_.Exception.Message)" }
    }
}
