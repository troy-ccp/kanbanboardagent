#!/usr/bin/env node
/**
 * Kokoro TTS - Linux/WSL2 Compatible Version
 * Generates speech from text using Kokoro TTS server
 */

const fs = require('fs');
const path = require('path');

// Configuration
// Note: Server URL may need to be adjusted based on your network setup
// For Windows host from WSL2 Docker, try:
// - http://host.docker.internal:8880 (if configured)
// - http://172.18.0.1:8880 (Docker bridge gateway)
// - http://<windows-host-ip>:8880 (Windows host IP)
const API_URL = process.env.KOKORO_API_URL || 'http://localhost:8880/v1/audio/speech';
const DEFAULT_VOICE = 'am_puck'; // Troy's preferred voice
const DEFAULT_SPEED = 1.0;

// Parse arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node kokoro-tts.js "<text>" [voice] [speed]');
  console.error('');
  console.error('  text  - Text to speak (required, wrap in quotes)');
  console.error('  voice - Voice ID (optional, default: am_puck)');
  console.error('  speed - Speed 0.25-4.0 (optional, default: 1.0)');
  console.error('');
  console.error('Common voices:');
  console.error('  am_puck   - Male, playful (default for Troy)');
  console.error('  af_heart  - Female, warm (for Ady)');
  console.error('  af_nova   - Female, professional');
  console.error('  am_adam   - Male, deep');
  console.error('');
  console.error('Examples:');
  console.error('  node kokoro-tts.js "Troy, task complete"');
  console.error('  node kokoro-tts.js "Hey Troy, quick question" am_puck 1.2');
  process.exit(1);
}

const text = args[0];
const voice = args[1] || DEFAULT_VOICE;
const speed = args[2] ? parseFloat(args[2]) : DEFAULT_SPEED;

// Ensure media directory exists
const mediaDir = path.join(process.cwd(), 'media');
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

// Generate filename
const timestamp = Date.now();
const filename = `tts_${timestamp}.mp3`;
const filePath = path.join(mediaDir, filename);

async function generateSpeech() {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        voice: voice,
        speed: speed
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    // Output in format OpenClaw expects for attachments
    console.log(`MEDIA: ${path.relative(process.cwd(), filePath)}`);

  } catch (error) {
    console.error(`TTS Error: ${error.message}`);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Make sure Kokoro TTS server is running');
    console.error('2. Check server URL: ' + API_URL);
    console.error('3. Update KOKORO_API_URL env var if needed');
    process.exit(1);
  }
}

generateSpeech();
