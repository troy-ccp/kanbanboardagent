#!/usr/bin/env node

/**
 * Simple HTTP server for the Kanban board
 * Serves kanban-board.html and data/tasks.json
 * Run: node scripts/kanban-server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const WORKSPACE_DIR = __dirname + '/..';

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain'
};

const server = http.createServer((req, res) => {
  let filePath = req.url;
  
  // Handle root path
  if (filePath === '/') {
    filePath = '/kanban-board.html';
  }
  
  // Map URLs to workspace files
  let fullPath;
  if (filePath === '/kanban-board.html') {
    fullPath = path.join(WORKSPACE_DIR, 'kanban-board.html');
  } else if (filePath === '/data/tasks.json') {
    fullPath = path.join(WORKSPACE_DIR, 'data/tasks.json');
  } else {
    // For any other path, 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }
  
  const extname = path.extname(fullPath);
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  fs.readFile(fullPath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found - serve 404
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        // Server error
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`500 Internal Server Error: ${err.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, 'localhost', () => {
  console.log(`🚀 Kanban board server running at http://localhost:${PORT}/`);
  console.log(`📋 Open in browser: http://localhost:${PORT}/kanban-board.html`);
  console.log(`📊 Board auto-refreshes every 10 seconds`);
  console.log(`📝 Tasks are stored in: ${WORKSPACE_DIR}/data/tasks.json`);
  console.log(`🛑 Press Ctrl+C to stop the server\n`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down kanban server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});