#!/usr/bin/env node
/**
 * Service Controller - Runs on Windows, lets Docker agent control services
 * Listens on port 8882 for commands to start/stop/check voice services
 */

const http = require('http');
const { exec, spawn } = require('child_process');
const path = require('path');

const PORT = 8882;
const KOKORO_PORT = 8880;
const NOTIFY_PORT = 8881;

// Check if a port is in use
function checkPort(port) {
  return new Promise((resolve) => {
    exec(`netstat -an | findstr ":${port}.*LISTENING"`, (err, stdout) => {
      resolve(stdout && stdout.trim().length > 0);
    });
  });
}

// Start Kokoro TTS server
function startKokoro() {
  return new Promise((resolve) => {
    const kokoroPath = 'c:\\Users\\coach\\OneDrive\\Desktop\\Set Up kokoro Server';
    const pythonPath = path.join(kokoroPath, '.venv', 'Scripts', 'python.exe');
    const serverPath = path.join(kokoroPath, 'server.py');
    
    const child = spawn(pythonPath, [serverPath], {
      cwd: kokoroPath,
      detached: true,
      stdio: 'ignore',
      shell: false
    });
    child.unref();
    
    console.log('Spawned Kokoro process');
    setTimeout(() => resolve(true), 6000);
  });
}

// Start Notify server
function startNotify() {
  return new Promise((resolve) => {
    const scriptPath = 'C:\\Users\\coach\\.openclaw\\workspace\\scripts\\notify-server.js';
    
    const child = spawn('node', [scriptPath], {
      detached: true,
      stdio: 'ignore',
      shell: false
    });
    child.unref();
    
    console.log('Spawned Notify process');
    setTimeout(() => resolve(true), 3000);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  console.log(`[${new Date().toLocaleTimeString()}] ${url.pathname}`);
  
  res.setHeader('Content-Type', 'application/json');
  
  try {
    if (url.pathname === '/status' || url.pathname === '/health') {
      const kokoroUp = await checkPort(KOKORO_PORT);
      const notifyUp = await checkPort(NOTIFY_PORT);
      
      res.writeHead(200);
      res.end(JSON.stringify({
        controller: 'running',
        kokoro: kokoroUp ? 'running' : 'stopped',
        notify: notifyUp ? 'running' : 'stopped',
        allGood: kokoroUp && notifyUp
      }));
      
    } else if (url.pathname === '/start' || url.pathname === '/start-all') {
      const results = { kokoro: 'already running', notify: 'already running' };
      
      if (!(await checkPort(KOKORO_PORT))) {
        await startKokoro();
        results.kokoro = 'started';
      }
      
      if (!(await checkPort(NOTIFY_PORT))) {
        await startNotify();
        results.notify = 'started';
      }
      
      // Verify they started
      const kokoroUp = await checkPort(KOKORO_PORT);
      const notifyUp = await checkPort(NOTIFY_PORT);
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: kokoroUp && notifyUp,
        kokoro: kokoroUp ? 'running' : 'failed',
        notify: notifyUp ? 'running' : 'failed',
        actions: results
      }));
      
    } else if (url.pathname === '/start-kokoro') {
      if (await checkPort(KOKORO_PORT)) {
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, status: 'already running' }));
      } else {
        await startKokoro();
        const up = await checkPort(KOKORO_PORT);
        res.writeHead(200);
        res.end(JSON.stringify({ success: up, status: up ? 'started' : 'failed' }));
      }
      
    } else if (url.pathname === '/start-notify') {
      if (await checkPort(NOTIFY_PORT)) {
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, status: 'already running' }));
      } else {
        await startNotify();
        const up = await checkPort(NOTIFY_PORT);
        res.writeHead(200);
        res.end(JSON.stringify({ success: up, status: up ? 'started' : 'failed' }));
      }
      
    } else {
      res.writeHead(200);
      res.end(JSON.stringify({
        service: 'Voice Service Controller',
        endpoints: {
          '/status': 'Check if services are running',
          '/start': 'Start all voice services',
          '/start-kokoro': 'Start Kokoro TTS only',
          '/start-notify': 'Start Notify server only'
        }
      }));
    }
  } catch (error) {
    console.error('Error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(`Service Controller running on port ${PORT}`);
  console.log('='.repeat(50));
  console.log('');
  console.log('From OpenClaw agent:');
  console.log('  curl http://host.docker.internal:8882/status');
  console.log('  curl http://host.docker.internal:8882/start');
  console.log('');
});
