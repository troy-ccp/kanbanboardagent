# ERRORS.md - Known Issues & Fixes

## Format
ErrorType[1]{Symptom,Fix,Date}
Use TOON for efficient cross-session learning.

## Errors

### Voice Alerts
VoicePath[1]{speak.bat_no_sound,convert_relative_to_absolute_path,2026-02-04}
**Fix:** Update `speak.bat` PowerShell command:
```powershell
powershell -Command "$path = Join-Path (Get-Location).Path '%AUDIO_FILE%'; (New-Object Media.SoundPlayer $path).PlaySync()"
```
**Why:** `tts.js` outputs `MEDIA: media/tts_xxx.mp3` (relative), PowerShell needs absolute path to play.

## When Something Breaks
1. Check this file first
2. Look in skill SKILL.md for tool-specific issues
3. Search workspace for related scripts