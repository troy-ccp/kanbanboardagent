@echo off
if "%~2"=="" (
    set VOICE=am_adam
) else (
    set VOICE=%~2
)
node skills/kokoro-tts/scripts/tts.js "%~1" %VOICE% > temp_output.txt
for /f "tokens=2 delims= " %%i in (temp_output.txt) do set AUDIO_FILE=%%i
powershell -Command "$path=Join-Path (Get-Location).Path '%AUDIO_FILE%'; (New-Object Media.SoundPlayer $path).PlaySync()"
del temp_output.txt
echo Done!
REM FIX: Convert relative path to absolute - tts.js outputs 'MEDIA: media/tts_xxx.mp3' (relative)
REM PowerShell needs absolute path to play. Fixed 2026-02-04 (see TOOLS.md & ERRORS.md)