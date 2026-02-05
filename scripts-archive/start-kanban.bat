@echo off
echo Starting Kanban Board...
echo.
echo Access at: http://localhost:8080/kanban-board-v2.html
echo.
echo Press Ctrl+C to stop
echo.

cd /d "%~dp0.."
node scripts\kanban-server-v2.js

echo.
echo Server stopped. Press any key to exit...
pause >nul