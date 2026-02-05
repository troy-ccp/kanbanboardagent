# Run kanban server in background (detached from terminal)
# Usage: .\start-kanban-background.ps1

$workspace = "C:\Users\coach\.openclaw\workspace"
$serverScript = "scripts\kanban-server-v2.js"
$logFile = "$workspace\logs\kanban-background.log"

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

# Check if already running
try {
    $process = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | 
               Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
        Write-Log "Kanban server already running on port 8080 (PID: $process)"
        Write-Host "✅ Kanban server already running at http://localhost:8080/kanban-board-v2.html"
        exit 0
    }
} catch {
    # Ignore errors
}

Write-Log "Starting kanban server in background..."
Write-Host "Starting kanban server in background..."
Write-Host "Board will be available at: http://localhost:8080/kanban-board-v2.html"
Write-Host "Logs: $logFile"

# Start process in background (detached)
$process = Start-Process node -ArgumentList "$workspace\$serverScript" `
    -PassThru -NoNewWindow -WorkingDirectory $workspace `
    -RedirectStandardOutput "$workspace\logs\kanban-stdout.log" `
    -RedirectStandardError "$workspace\logs\kanban-stderr.log"

Write-Log "Kanban server started with PID: $($process.Id)"
Write-Host "✅ Kanban server started (PID: $($process.Id))"
Write-Host "Access board: http://localhost:8080/kanban-board-v2.html"

# Save PID to file for later reference
$process.Id | Out-File -FilePath "$workspace\logs\kanban-pid.txt" -Force

Write-Host ""
Write-Host "To stop the server, run:"
Write-Host "Stop-Process -Id $($process.Id) -Force"
Write-Host "Or: taskkill /PID $($process.Id) /F"