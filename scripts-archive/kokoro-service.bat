@echo off
echo Kokoro TTS Service Manager
echo.
echo Options:
echo   1. Start Kokoro TTS server
echo   2. Stop Kokoro TTS server
echo   3. Check status
echo   4. Auto-start (background)
echo.
set /p choice="Enter choice (1-4): "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto status
if "%choice%"=="4" goto autostart

:start
echo Starting Kokoro TTS server...
cd /d "c:\Users\coach\OneDrive\Desktop\Set Up kokoro Server"
echo Checking port 8880...
netstat -ano | findstr :8880 >nul
if %errorlevel% equ 0 (
    echo Port 8880 is already in use!
    echo Run option 2 to stop existing server first.
    pause
    exit /b 1
)
.\start.ps1
goto :eof

:stop
echo Stopping Kokoro TTS server...
for /f "tokens=5" %%i in ('netstat -ano ^| findstr :8880') do (
    echo Killing PID %%i
    taskkill /PID %%i /F >nul 2>&1
)
echo Done.
pause
goto :eof

:status
echo Checking Kokoro TTS server status...
netstat -ano | findstr :8880 >nul
if %errorlevel% equ 0 (
    echo ✅ Kokoro TTS server is running on port 8880
) else (
    echo ❌ Kokoro TTS server is not running
)
echo.
echo Testing health endpoint...
powershell -Command "try { $resp = Invoke-WebRequest -Uri 'http://localhost:8880/health' -UseBasicParsing -TimeoutSec 3; Write-Host '✅ Health check OK' } catch { Write-Host '❌ Health check failed' }"
pause
goto :eof

:autostart
echo Creating auto-start background service...
echo This will run in background and auto-restart if crashed.
cd /d "c:\Users\coach\.openclaw\workspace"
echo Creating startup script...
(
echo @echo off
echo :loop
echo cd /d "c:\Users\coach\OneDrive\Desktop\Set Up kokoro Server"
echo echo [%%date%% %%time%%] Starting Kokoro TTS server...
echo powershell -ExecutionPolicy Bypass -File start.ps1
echo echo [%%date%% %%time%%] Server stopped, restarting in 10 seconds...
echo timeout /t 10 /nobreak ^>nul
echo goto loop
) > scripts\kokoro-auto.bat

echo Starting background service...
start "Kokoro TTS Service" cmd /c scripts\kokoro-auto.bat
echo.
echo ✅ Kokoro TTS service started in background
echo To stop: Close the "Kokoro TTS Service" window or run option 2
pause
goto :eof