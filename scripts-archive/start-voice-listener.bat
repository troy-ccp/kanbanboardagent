@echo off
REM Start Voice Alert Listener for OpenClaw
REM This listens on port 8890 and auto-plays TTS audio

echo Starting Voice Alert Listener...
echo Listening on http://localhost:8890
echo Press Ctrl+C to stop
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0voice-listener.ps1"
