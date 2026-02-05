# Voice Notification Skill

## Purpose
Notify Troy with spoken audio when tasks complete or need attention.

## Quick Start
```bash
curl http://host.docker.internal:8881/notify?preset=done
```

## If Services Are Down (connection refused)
Start them with:
```bash
curl http://host.docker.internal:8882/start
```
Then retry your notification.

## Check Service Status
```bash
curl http://host.docker.internal:8882/status
```

## Available Presets

| Preset | Message |
|--------|---------|
| `done` | "Troy, task complete." |
| `ready` | "Troy, I'm ready for your next instruction." |
| `error` | "Troy, I encountered an error." |
| `question` | "Troy, I have a question for you." |
| `waiting` | "Troy, I'm waiting for your response." |
| `urgent` | "Troy, this needs your attention." |

## Custom Messages

For custom messages, use URL-encoded text:
```bash
curl "http://host.docker.internal:8881/notify?msg=Hello+Troy+the+report+is+ready"
```

## When to Use

- **Always notify** when completing a significant task
- **Use `done`** for standard task completion
- **Use `question`** when you need user input to proceed
- **Use `error`** when something failed
- **Use `urgent`** for time-sensitive matters

## Important
- The notification server must be running on Windows (port 8881)
- Kokoro TTS server must be running on Windows (port 8880)
