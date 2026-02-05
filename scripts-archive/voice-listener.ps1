# Voice Alert Listener for OpenClaw
# Runs on Windows, listens for HTTP requests from Docker container
# Auto-plays TTS audio via Kokoro server

param(
    [int]$Port = 8890,
    [string]$KokoroUrl = "http://localhost:8880/v1/audio/speech",
    [string]$DefaultVoice = "am_puck"
)

Write-Host "Starting Voice Alert Listener..." -ForegroundColor Green
Write-Host "Listening on port $Port" -ForegroundColor Cyan
Write-Host "Kokoro TTS: $KokoroUrl" -ForegroundColor Cyan
Write-Host "Default voice: $DefaultVoice" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Create HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # Parse the request
        $text = if ($request.QueryString["text"]) { [System.Web.HttpUtility]::UrlDecode($request.QueryString["text"]) } else { "" }
        $voice = if ($request.QueryString["voice"]) { $request.QueryString["voice"] } else { $DefaultVoice }

        if ($text) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Speaking: $text" -ForegroundColor Green

            try {
                # Call Kokoro TTS API
                $body = @{
                    model = "kokoro"
                    input = $text
                    voice = $voice
                    response_format = "mp3"
                } | ConvertTo-Json

                $kokoroResponse = Invoke-RestMethod -Uri $KokoroUrl -Method Post -Body $body -ContentType "application/json"

                # Save to temp file
                $tempFile = Join-Path $env:TEMP "voicealert_$(Get-Date -Format 'yyyyMMddHHmmssfff').mp3"
                [System.IO.File]::WriteAllBytes($tempFile, [System.Convert]::FromBase64String($kokoroResponse))

                # Play the audio
                $player = New-Object System.Media.SoundPlayer $tempFile
                $player.PlaySync()

                # Cleanup
                Remove-Item $tempFile -ErrorAction SilentlyContinue

                # Send success response
                $response.StatusCode = 200
                $responseText = '{"status":"ok","message":"Audio played"}'
            } catch {
                Write-Host "Error: $_" -ForegroundColor Red
                $response.StatusCode = 500
                $responseText = '{"status":"error","message":"' + $_.Message.Replace('"', "'") + '"}'
            }
        } else {
            $response.StatusCode = 400
            $responseText = '{"status":"error","message":"Missing text parameter"}'
        }

        $response.ContentLength64 = [System.Text.Encoding]::UTF8.GetByteCount($responseText)
        $response.OutputStream.Write([System.Text.Encoding]::UTF8.GetBytes($responseText), 0, [System.Text.Encoding]::UTF8.GetByteCount($responseText))
        $response.OutputStream.Close()

    } catch {
        Write-Host "Listener error: $_" -ForegroundColor Red
    }
}

$listener.Stop()
