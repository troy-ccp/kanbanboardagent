@echo off
echo Launching Kanban Board...
echo This will open a new window that stays open even if you close this terminal.
echo.
echo Access board at: http://localhost:8080/kanban-board-v2.html
echo.

cd /d "%~dp0.."
start "Kanban Board" node scripts\kanban-server-v2.js

echo.
echo Kanban server launched in separate window.
echo It will continue running even if you close this terminal.
echo.
pause