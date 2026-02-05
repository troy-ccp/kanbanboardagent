@echo off
echo Starting Kanban Board in background...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0start-kanban-background.ps1"

echo.
echo If you see errors above, try running PowerShell as Administrator.
echo.
pause