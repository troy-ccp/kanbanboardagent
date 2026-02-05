# TOOLS.md - Max's Reference

## Voice Notifications - AUTO-PLAY VOICE ALERTS

**PURPOSE:** Troy's computer sits BEHIND him. Voice alerts prevent him from constantly turning around to check if you're done. **ALWAYS use voice notifications for task completion and waiting for input.**

**HOW TO SEND VOICE NOTIFICATIONS (MANDATORY)**

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

**WHEN TO SEND VOICE NOTIFICATIONS (MANDATORY):**
1. ✅ **Task is COMPLETE** - Tell him it's done
2. ✅ **Waiting for INPUT** - Tell him you need something
3. ✅ **Stuck or BLOCKED** - Tell him you need help
4. ✅ **About to START a long task** - Tell him what you're doing

**Available Presets:**
| Preset | Message |
|---------|----------|
| `done` | "Troy, task complete." |
| `ready` | "Troy, I'm ready for your next instruction." |
| `question` | "Troy, I have a question for you." |
| `error` | "Troy, I encountered an error." |
| `waiting` | "Troy, I'm waiting for your response." |
| `urgent` | "Troy, this needs your attention." |

**TROUBLESHOOTING:**
- If you get "connection refused" → Run: `curl http://host.docker.internal:8882/start`
- Full documentation: `skills/notify/SKILL.md`

**VOICE SETTINGS:**
- Default voice for Troy: am_puck (male, playful)
- Server: http://host.docker.internal:8881

## Mission Control Kanban Board

**CLI Script:** `scripts/kanban-cli.js`

**Usage:**
```bash
node scripts/kanban-cli.js add "<title>" "<description>" [priority] [status]
node scripts/kanban-cli.js list [status]
node scripts/kanban-cli.js update <id> <field> <value>
node scripts/kanban-cli.js move <id> <status>
node scripts/kanban-cli.js delete <id>
node scripts/kanban-cli.js stats
```

**Priorities:** low | medium | high | urgent
**Statuses:** backlog | in_progress | review | done

**Rules:**
- ✅ Add tasks to kanban board immediately when Troy gives them
- ✅ Update task status when making progress (move to in_progress)
- ✅ Move tasks to 'done' when completed
- ✅ Data stored in: `data/tasks.json`

## Kokoro TTS - For Custom Audio Files Only

**Purpose:** Generate TTS audio files for non-notification purposes (e.g., creating audio content, testing)

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

**IMPORTANT: Use kokoro-tts.js ONLY when you need audio files. For auto-play voice notifications, use the curl commands above.**

## Telegram Messaging (Backup Communication)

**Purpose:** Primary backup when voice notifications unavailable

**User ID:** 6416730274 (Troy Harrison)
**Channel:** telegram

**Usage (via message tool):**
```javascript
message({
  action: "send",
  to: "6416730274",
  message: "Your message here",
  channel: "telegram"
})
```

**Use when:**
- Voice notification system is down
- Need non-urgent notification

## Important Notes

**Ady (Troy's granddaughter):**
- Pronunciation: "Add-ee" (two syllables)
- Age: 2 years old
- Loves: Frozen
- Voice to use: af_heart

**Communication Protocol:**
1. **PRIMARY:** Voice notifications (curl to 8881) - Use for EVERY task completion and wait-for-input
2. **FALLBACK:** Telegram messages
3. **Acknowledge immediately** when request takes time

## Archived Items

Old Windows-specific scripts and configuration have been moved to:
- `/scripts-archive/` - Windows batch files and PowerShell scripts
- `/memory/archive/` - Old research docs and guides

---

Add whatever helps you do your job. This is your cheat sheet.
