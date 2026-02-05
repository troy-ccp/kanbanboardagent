---
name: kokoro-tts
description: Generate spoken audio from text using the local Kokoro TTS engine. Use when the user asks to "say" something, requests a voice message, or wants text converted to speech.
---

# Kokoro TTS

This skill allows you to generate high-quality AI speech using a local or remote Kokoro-TTS instance.

## Configuration

The skill uses the `KOKORO_API_URL` environment variable to locate the API.

- **Default:** `http://localhost:8880/v1/audio/speech`
- **WSL2/Docker (Linux container):** May need network configuration
- **To Configure:** Add `KOKORO_API_URL=http://your-server:port/v1/audio/speech` to your `.env` file or environment.

## Usage

To generate speech, run the included Node.js script.

### Command

```bash
node scripts/kokoro-tts.js "<text>" [voice] [speed]
```

- **text**: The text to speak. Wrap in quotes.
- **voice**: (Optional) The voice ID. Defaults to `am_puck`.
- **speed**: (Optional) Speech speed (0.25 to 4.0). Defaults to `1.0`.

### Example

```bash
node scripts/kokoro-tts.js "Hello Troy, this is Max speaking." am_puck
```

### Output

The script will output a single line starting with `MEDIA:` followed by the path to the generated MP3 file. OpenClaw will automatically pick this up and send it as an audio attachment.

Example Output:
`MEDIA: media/tts_1706745000000.mp3`

## Available Voices

Common choices for Troy's setup:
- `am_puck` (Default, Male, Playful) - Use for Troy/Max alerts
- `af_heart` (Female, Warm) - Use for Ady (2-year-old granddaughter)
- `af_nova` (Female, Professional)
- `am_adam` (Male, Deep)
- `bf_alice` (British Female)

For a full list, query the API directly.

## Network Configuration

The Kokoro TTS server needs to be accessible from this container.

### Scenario 1: Server on Windows, OpenClaw in Docker (WSL2)

Try these URLs (one will work based on your setup):

1. **host.docker.internal** (if configured):
   ```
   KOKORO_API_URL=http://host.docker.internal:8880/v1/audio/speech
   ```

2. **Docker bridge gateway** (usually 172.18.0.1):
   ```
   KOKORO_API_URL=http://172.18.0.1:8880/v1/audio/speech
   ```

3. **Windows host IP** (find with `ipconfig` on Windows):
   ```
   KOKORO_API_URL=http://<windows-ip>:8880/v1/audio/speech
   ```

### Scenario 2: Everything on Linux

If running natively on Linux:
```
KOKORO_API_URL=http://localhost:8880/v1/audio/speech
```

### Testing Connectivity

Test if the server is reachable:
```bash
curl http://localhost:8880/health
# Or your configured URL
```

## Quick Voice Alerts

For simple task completion alerts to Troy:

```bash
node scripts/voice-alert.js "Troy, I'm done with my task."
```

Or vary it for different situations:
- Task complete: "Troy, all finished!" | "Got it done, Troy!" | "Task complete!"
- Need input: "Troy, I need your input." | "Troy, got a question."
- Stuck: "Troy, I need help." | "Troy, I'm stuck."

## Important Notes

- **Ady pronunciation:** "Add-ee" (two syllables)
- **Default voice for Troy:** `am_puck` (male, playful)
- **Default voice for Ady:** `af_heart` (warm, female)
