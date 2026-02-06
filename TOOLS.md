# TOOLS.md - Max's Reference

## Voice Notifications - AUTO-PLAY (ALWAYS USE THIS)

**PURPOSE:** Troy's computer sits BEHIND him. Voice alerts prevent him from constantly turning around. **ALWAYS use voice notifications for auto-play speech.**

**⚠️ CRITICAL RULE: NEVER GENERATE AUDIO FILES FOR TROY TO PLAY HIMSELF**

**ALWAYS USE:** `curl http://host.docker.internal:8881/notify`

**NEVER USE:** `node scripts/kokoro-tts.js` or `tts` tool (these create MP3 files that Troy has to click to play)

---

**HOW TO SEND VOICE NOTIFICATIONS (AUTO-PLAY):**

**Using presets (quick & easy):**
```bash
# Task complete
curl http://host.docker.internal:8881/notify?preset=done

# Need input/question
curl http://host.docker.internal:8881/notify?preset=question

# Waiting for response
curl http://host.docker.internal:8881/notify?preset=waiting

# Error/blockage
curl http://host.docker.internal:8881/notify?preset=error

# Urgent
curl http://host.docker.internal:8881/notify?preset=urgent
```

**Using custom messages:**
```bash
# Replace spaces with +
curl http://host.docker.internal:8881/notify?msg=Troy,+task+complete

# Or use quotes
curl "http://host.docker.internal:8881/notify?msg=Troy, I'm done with my task"
```

---

**WHEN TO SEND VOICE NOTIFICATIONS (MANDATORY):**
1. ✅ **Task is COMPLETE** - Tell him it's done
2. ✅ **Waiting for INPUT** - Tell him you need something
3. ✅ **Stuck or BLOCKED** - Tell him you need help
4. ✅ **About to START a long task** - Tell him what you're doing
5. ✅ **Speaking to anyone** - Always auto-play, never create audio files

---

**Available Presets:**

| Preset | Message |
|---------|----------|
| `done` | "Troy, task complete." |
| `ready` | "Troy, I'm ready for your next instruction." |
| `question` | "Troy, I have a question for you." |
| `error` | "Troy, I encountered an error." |
| `waiting` | "Troy, I'm waiting for your response." |
| `urgent` | "Troy, this needs your attention." |

---

**TROUBLESHOOTING:**
- If you get "connection refused" → Run: `curl http://host.docker.internal:8882/start`
- Full documentation: `skills/notify/SKILL.md`

---

## Kokoro TTS - FOR AUDIO FILES ONLY (NOT AUTO-PLAY)

**⚠️ IMPORTANT:** Only use this when you need to create an audio FILE for some purpose. Do NOT use for auto-play voice notifications to Troy.

**Purpose:** Generate custom TTS audio files for non-notification purposes (e.g., creating audio content, testing)

**Script:** `scripts/kokoro-tts.js`

**Basic Usage:**
```bash
# Generate audio file (returns MEDIA: path for attachment)
node scripts/kokoro-tts.js "Troy, this is a custom message"

# With voice selection
node scripts/kokoro-tts.js "Message here" am_puck

# With speed adjustment
node scripts/kokoro-tts.js "Fast message" am_puck 1.5
```

**Voices:**
- **am_puck** (Default) - Male, playful - Use for Troy
- **af_heart** - Female, warm - Use for Ady (granddaughter, 2yo)
- **af_nova** - Female, professional
- **am_adam** - Male, deep

**Server Configuration:**
- URL: `http://host.docker.internal:8880/v1/audio/speech`
- Environment variable: `KOKORO_API_URL`
- Audio saved to: `media/tts_*.mp3`

**WHEN TO USE kokoro-tts.js:**
- ❌ NOT for auto-play voice notifications to Troy
- ✅ When you need to attach an audio file to a message
- ✅ When testing voice quality
- ✅ When creating audio content for other purposes

---

## Mission Control Kanban Board

**CLI Script:** `scripts/mc-update.sh`

**Usage:**
```bash
bash scripts/mc-update.sh list
```

**Data:** `data/tasks.json`

---

## Telegram Messaging (Backup Communication)

**Purpose:** Primary backup when voice notifications unavailable

**User ID:** 6416730274 (Troy Harrison)
**Channel:** telegram

---

## Important Notes

**Ady (Troy's granddaughter):**
- Pronunciation: "Add-ee" (two syllables)
- Age: 2 years old
- Loves: Frozen

**Communication Protocol:**
1. **PRIMARY:** Voice notifications (curl to 8881) - Auto-plays
2. **FALLBACK:** Telegram messages

---

## Archived Items

Old Windows-specific scripts and configuration have been moved to:
- `/scripts-archive/` - Windows batch files and PowerShell scripts
- `/memory/archive/` - Old research docs and guides

---

Add whatever helps you do your job. This is your cheat sheet.