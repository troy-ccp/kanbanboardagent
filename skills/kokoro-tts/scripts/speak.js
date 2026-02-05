#!/usr/bin/env node

/**
 * Speak - Generate audio with Kokoro TTS and automatically play it
 * Usage: node skills/kokoro-tts/scripts/speak.js "<text>" [voice]
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Get command line args
const text = process.argv[2] || "Hello";
const voice = process.argv[3] || "am_puck";

// Kokoro API endpoint
const API_URL = "http://localhost:8880/v1/audio/speech";

// Generate audio
async function speak() {
  try {
    console.log(`🎤 Speaking with voice: ${voice}`);
    console.log(`📝 Text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

    // Call Kokoro API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,  // Note: Kokoro uses 'input', not 'text'
        voice: voice,
        speed: 1.0,
        response_format: 'mp3',
        model: 'kokoro',
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    // Get audio buffer
    const audioBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(audioBuffer);

    // Save to temp file
    const timestamp = Date.now();
    const outputPath = path.join(__dirname, `temp_speech_${timestamp}.wav`);
    fs.writeFileSync(outputPath, buffer);

    console.log(`✅ Audio saved to: ${outputPath}`);

    // Play the audio automatically
    playAudio(outputPath);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Play audio using Windows
function playAudio(filePath) {
  const command = `powershell -NoProfile -Command "(New-Object Media.SoundPlayer '${filePath}').PlaySync()"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Failed to play audio:', error);
      return;
    }

    console.log('✅ Audio played successfully');

    // Clean up temp file after a short delay
    setTimeout(() => {
      try {
        fs.unlinkSync(filePath);
        console.log('🗑️  Temp file cleaned up');
      } catch (e) {
        // Ignore cleanup errors
      }
    }, 1000);
  });
}

speak();
