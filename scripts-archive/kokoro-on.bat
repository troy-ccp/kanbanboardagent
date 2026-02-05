@echo off
echo Starting Kokoro TTS Server (Persistent)
echo.
echo This will keep the server running even if you close this window.
echo.

cd /d "c:\Users\coach\OneDrive\Desktop\Set Up kokoro Server"

:check
echo Checking port 8880...
netstat -ano | findstr :8880 >nul
if %errorlevel% equ 0 (
    echo Port 8880 is already in use!
    echo.
    echo Options:
    echo   1. Kill existing server and start new one
    echo   2. Exit
    echo.
    set /p choice="Enter choice (1 or 2): "
    if "%choice%"=="1" (
        for /f "tokens=5" %%i in ('netstat -ano ^| findstr :8880') do (
            echo Killing PID %%i
            taskkill /PID %%i /F >nul 2>&1
        )
        timeout /t 2 /nobreak >nul
        goto start
    ) else (
        exit /b 0
    )
)

:start
echo Starting server...
echo Server will run at: http://localhost:8880
echo Keep this window open for server to stay running.
echo.
echo Press Ctrl+C to stop
echo.

powershell -ExecutionPolicy Bypass -File start.ps1

echo.
echo Server stopped. Restarting in 5 seconds...
timeout /t 5 /nobreak >nul
goto start