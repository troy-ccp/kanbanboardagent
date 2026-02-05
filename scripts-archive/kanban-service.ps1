# PowerShell script to run kanban server as a background service
# Run this at startup or manually to keep kanban board always available

$workspace = "C:\Users\coach\.openclaw\workspace"
$serverScript = "scripts\kanban-server-v2.js"
$logFile = "$workspace\logs\kanban-service.log"

# Create logs directory if it doesn't exist
if (-not (Test-Path "$workspace\logs")) {
    New-Item -ItemType Directory -Path "$workspace\logs" -Force | Out-Null
}

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $Message" | Out-File -FilePath $logFile -Append
    Write-Host "$timestamp - $Message"
}

Write-Log "Starting Kanban Board Service"

# Kill any existing node processes on port 8080 (optional)
try {
    $process = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | 
               Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        Write-Log "Killed existing process on port 8080 (PID: $process)"
    }
} catch {
    # Ignore errors
}

# Main loop - restart server if it crashes
while ($true) {
    Write-Log "Starting kanban server..."
    try {
        $process = Start-Process node -ArgumentList "$workspace\$serverScript" -PassThru -NoNewWindow -WorkingDirectory $workspace
        Write-Log "Kanban server started (PID: $($process.Id))"
        $process.WaitForExit()
        
        if ($process.ExitCode -ne 0) {
            Write-Log "Server crashed with exit code: $($process.ExitCode)"
        } else {
            Write-Log "Server stopped normally"
        }
    } catch {
        Write-Log "Error starting server: $_"
    }
    
    Write-Log "Restarting in 10 seconds..."
    Start-Sleep -Seconds 10
}