#!/usr/bin/env node
/**
 * Simple notification server - runs on Windows
 * Agent just needs to call: curl http://host.docker.internal:8881/notify?msg=Task+complete
 */

const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 8881;
const KOKORO_URL = 'http://localhost:8880/v1/audio/speech';

// Default messages for common notifications
const PRESETS = {
  done: "Troy, task complete.",
  ready: "Troy, I'm ready for your next instruction.",
  error: "Troy, I encountered an error.",
  question: "Troy, I have a question for you.",
  waiting: "Troy, I'm waiting for your response.",
  urgent: "Troy, this needs your attention."
};

async function speak(message, voice = 'am_puck') {
  console.log(`Speaking: "${message}"`);
  
  const response = await fetch(KOKORO_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: message, voice: voice, speed: 1.0 })
  });
  
  if (!response.ok) {
    throw new Error(`Kokoro error: ${response.status}`);
  }
  
  const audioBuffer = await response.arrayBuffer();
  
  // Save to temp file
  const tempFile = path.join(process.env.TEMP || 'C:\\Temp', 'notify.wav');
  fs.writeFileSync(tempFile, Buffer.from(audioBuffer));
  
  // Play audio on Windows
  return new Promise((resolve, reject) => {
    exec(`powershell -c "(New-Object Media.SoundPlayer '${tempFile}').PlaySync()"`, (err) => {
      if (err) {
        console.error('Play error:', err.message);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${url.pathname}`);
    
    if (url.pathname === '/notify' || url.pathname === '/speak') {
      let message = url.searchParams.get('msg') || url.searchParams.get('message');
      const preset = url.searchParams.get('preset');
      const voice = url.searchParams.get('voice') || 'am_puck';
      
      if (preset && PRESETS[preset]) {
        message = PRESETS[preset];
      }
      
      if (!message) {
        message = PRESETS.done;
      }
      
      message = decodeURIComponent(message);
      
      await speak(message, voice);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: message }));
      
    } else if (url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      
    } else {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Notify Server\n\nUsage:\n  /notify?preset=done\n  /notify?msg=Your+message\n\nPresets: done, ready, error, question, waiting, urgent');
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: error.message }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(`Notification server running on port ${PORT}`);
  console.log('='.repeat(50));
  console.log('');
  console.log('From OpenClaw agent, use:');
  console.log('  curl "http://host.docker.internal:8881/notify?preset=done"');
  console.log('  curl "http://host.docker.internal:8881/notify?msg=Hello+Troy"');
  console.log('');
  console.log('Presets: done, ready, error, question, waiting, urgent');
  console.log('');
});
