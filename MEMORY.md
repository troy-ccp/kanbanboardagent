["n8n MCP server configuration (Troy doing this - status unknown)
- [ ] Execute Notion database cleanup (workflow ready, needs CSV export from Troy)

## Server Setup Information

**Kokoro TTS Server:**
- Location: `c:UserscoachOneDriveDesktopSet Up kokoro Server`
- Port: 8880
- Start command: `cd "c:UserscoachOneDriveDesktopSet Up kokoro Server", ".":", "start.ps1`
- Status: Running (confirmed Feb 3, 2026)
- Health check: http://localhost:8880/health
- Detailed setup: KOKORO_SERVER_SETUP.md

**Voice Configuration:**
- **Max/Troy alerts:** am_puck (male, playful)
- **Ady (granddaughter, 2yo):** af_heart (warm, female)
- **Default voice in speak.bat:** am_puck

**Telegram Communication:**
- **User ID:** 6416730274 (Troy Harrison)
- **Confirmed working:** Feb 3, 2026 ~23:07 EST
- **Message format:** `message` tool with `action=send`, `to=6416730274`, `channel=telegram`
- **Last successful test:** Message IDs 32 & 33 delivered successfully
- **Channel config:** Enabled with bot token, DM policy: pairing
- **Use case:** Primary communication backup when Kokoro server down

**Communication Protocol:**
- If Kokoro server down → Telegram message + restart instructions

**System Stability (Updated 2026-02-05):**
- ✅ **eSpeak integration complete** - v1.48.03 installed as espeak-ng.exe
- ✅ **TTS server stable** - Passed 45-second wait stress test
- ✅ **Security hardening complete** - All critical file permissions fixed (0 critical issues)
- ✅ **Voice auto-play system built** - PowerShell listener + container bridge (awaiting Troy to start listener)
- ✅ **Telegram notifications** - Backup communication confirmed

**Voice Alert System (2026-02-05):**
- **Purpose:** Auto-play voice alerts from inside Docker container without user interaction
- **Components:**
  - `scripts/voice-listener.ps1` - PowerShell listener (runs on Windows, port 8890)
  - `scripts/start-voice-listener.bat` - Easy launcher
  - `scripts/voice-alert.js` - Trigger from container
- **How to start:** Run `scripts\start-voice-listener.bat` on Windows
- **Optional:** Add to Windows Task Scheduler for auto-start on login
- **Documentation:** `memory/VOICE_ALERT_SYSTEM.md`"]