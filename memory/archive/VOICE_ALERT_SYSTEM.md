# Voice Alert Auto-Play System

## Problem
The `tts` tool generates audio files but they don't auto-play in webchat. The `speak.bat` script only works when run from Windows, not from inside the Docker container.

## Solution
A PowerShell listener on Windows that:
1. Listens for HTTP requests on port 8890
2. Calls Kokoro TTS server
3. Auto-plays the generated audio
4. No user interaction required

## Setup Instructions

### Step 1: Start the Voice Listener on Windows

Open a PowerShell terminal (as Administrator if needed) and run:

```powershell
cd C:\Users\coach\.openclaw\workspace\scripts
.\start-voice-listener.bat
```

Or manually:

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\coach\.openclaw\workspace\scripts\voice-listener.ps1"
```

**Keep this terminal open** - the listener must be running to receive voice requests.

### Step 2: Test from OpenClaw

In a chat session, ask me to speak something:

```
Max, say "Troy, this is a test"
```

Or I can use the command directly:

```javascript
node scripts/voice-alert.js "Troy, task complete" am_puck
```

### Step 3: Make it Persistent (Optional)

To have the voice listener start automatically:

**Option A: Windows Task Scheduler (Recommended)**
1. Open Task Scheduler
2. Create Basic Task: "OpenClaw Voice Listener"
3. Trigger: "When I log on"
4. Action: Start a program
5. Program: `C:\Users\coach\.openclaw\workspace\scripts\start-voice-listener.bat`
6. Finish

**Option B: Startup Folder**
1. Press `Win+R`, type `shell:startup`
2. Create shortcut to `start-voice-listener.bat`
3. The listener will start when you log in

## How It Works

```
Docker Container                    Windows
     |                                    |
     |-- HTTP Request ------------------>|
     |  /?text="Hello"&voice=am_puck     |
     |                                    |
     |                              [Voice Listener]
     |                                    |-- Call Kokoro TTS
     |                                    |-- Generate MP3
     |                                    |-- Play audio
     |                                    |
     |<-- Response: {"status":"ok"} -----|
```

## Voice Options

- `am_puck` - Male, playful (DEFAULT for Troy)
- `af_heart` - Female, warm (for Ady)
- `am_adam` - Male, deep
- `af_nova` - Female, professional
- More voices available at Kokoro server

## Troubleshooting

**"VOICE_ERROR: Failed to connect to voice listener"**
- Make sure the voice listener is running on Windows
- Check that port 8890 is not blocked by firewall

**No audio plays**
- Check Windows volume
- Verify Kokoro TTS server is running (http://localhost:8880/health)
- Check the voice listener terminal for errors

**Voice listener crashes**
- Check PowerShell error messages
- Ensure Kokoro API is accessible
- Try running the listener with verbose logging

## Files

- `scripts/voice-listener.ps1` - PowerShell listener script (runs on Windows)
- `scripts/start-voice-listener.bat` - Easy launcher for the listener
- `scripts/voice-alert.js` - Node.js script to trigger voice from container

## Status

- ✅ Voice listener script created
- ✅ Container-to-Windows bridge configured
- ⏳ Waiting for Troy to start voice listener on Windows
- ⏳ Test pending

Created: 2026-02-05
