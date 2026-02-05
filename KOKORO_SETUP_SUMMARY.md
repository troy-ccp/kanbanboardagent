# Kokoro TTS Setup - Linux/WSL2 Docker

## What Was Done

✅ **Updated Kokoro TTS for Linux:**
- Created `scripts/kokoro-tts.js` - Clean Linux-compatible TTS script
- Updated `scripts/voice-alert.js` - Simple alert trigger
- Updated `skills/kokoro-tts/SKILL.md` - Removed Windows references, added network config
- Updated `TOOLS.md` - Linux-only instructions

✅ **Cleaned up workspace:**
- Archived Windows scripts to `/scripts-archive/` (12 .bat and .ps1 files)
- Archived old docs to `/memory/archive/` (7 files)
- Deleted empty skill directories (mcporter, mission-control, notion-api-automation, todo)

✅ **Preserved working tools:**
- Kanban CLI (`scripts/kanban-cli.js`)
- Kanban server scripts
- Utility scripts (vault, cleanup, etc.)
- All memory and configuration files

## What You Need To Do

### 1. Configure Network Access to Kokoro Server

The Kokoro TTS server is running on Windows, but needs to be accessible from the Docker container. Try these URLs in order:

**Option A: host.docker.internal (if configured)**
```powershell
# On Windows, add this to your Docker config or test:
# In container: export KOKORO_API_URL=http://host.docker.internal:8880/v1/audio/speech
```

**Option B: Docker bridge gateway**
```powershell
# Find your Docker gateway IP:
# Usually 172.18.0.1 or similar
# Set in container:
export KOKORO_API_URL=http://172.18.0.1:8880/v1/audio/speech
```

**Option C: Windows host IP**
```powershell
# On Windows, run: ipconfig
# Find your IPv4 address (e.g., 172.x.x.x)
# Set in container:
export KOKORO_API_URL=http://<your-windows-ip>:8880/v1/audio/speech
```

### 2. Test Connectivity

From the Linux container, test if the server is reachable:
```bash
curl http://localhost:8880/health
# Or whatever KOKORO_API_URL you configure
```

Expected output: `{"status":"ok"}` or similar

### 3. Test TTS Generation

```bash
# Test basic TTS
node scripts/kokoro-tts.js "Troy, this is a test from the new setup."

# Test with voice selection
node scripts/kokoro-tts.js "Hey Troy, quick question" am_puck
```

This should generate an MP3 file in `media/` and output: `MEDIA: media/tts_*.mp3`

### 4. Set Persistent Environment Variable (Optional)

If you find a working URL, make it permanent by adding to the container's environment:

Edit the Docker compose file or container startup to include:
```bash
KOKORO_API_URL=http://your-working-url:8880/v1/audio/speech
```

## Quick Reference

**Generate voice alert:**
```bash
node scripts/voice-alert.js "Troy, task complete"
```

**Generate custom TTS:**
```bash
node scripts/kokoro-tts.js "<text>" [voice] [speed]
```

**Voices:**
- `am_puck` - Male, playful (default for Troy)
- `af_heart` - Female, warm (for Ady)
- `af_nova` - Female, professional
- `am_adam` - Male, deep

## Troubleshooting

**TTS Error: connection refused**
- Kokoro server not running on Windows
- Wrong IP address configured
- Firewall blocking the connection

**TTS Error: 404 or 500**
- Server URL incorrect (check port 8880)
- Server version mismatch

**No MEDIA: output**
- Script error (check console output)
- Network issue (test with curl first)

## What Was Archived

**/scripts-archive/** (Windows-specific):
- All .bat and .ps1 files (12 files)
- PowerShell listener scripts
- Batch file launchers

**/memory/archive/** (Old docs):
- LOBEHUB_RESEARCH.md
- MAXTODO.md
- NOTION_CLEANUP_WORKFLOW.md
- TROY_BACKGROUND_RESEARCH.md
- ZOHO_BATCH_EMAIL_GUIDE.md
- VAULT_INTEGRATION_GUIDE.md
- CONTACT_INFO.md

These are kept for reference but not actively used.

## Next Steps After Setup

1. ✅ Confirm TTS works from container
2. ✅ Test voice alerts
3. ⏳ Rebuild kanban web interface if needed
4. ⏳ Set up any missing skills
5. ⏳ Continue with regular tasks
