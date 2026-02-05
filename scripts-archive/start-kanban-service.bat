@echo off
echo Starting Kanban Board Service...
echo This will run the kanban server and restart it if it crashes.
echo Kanban board: http://localhost:8080/kanban-board-v2.html
echo.

:start
echo [%date% %time%] Starting kanban-server-v2.js...
cd /d "%~dp0.."
node scripts/kanban-server-v2.js

echo [%date% %time%] Server stopped or crashed. Restarting in 5 seconds...
timeout /t 5 /nobreak >nul
goto start