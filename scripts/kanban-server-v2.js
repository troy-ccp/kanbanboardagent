#!/usr/bin/env node

/**
 * Enhanced HTTP server for the Kanban board with archive functionality
 * Serves kanban-board-v2.html, data/tasks.json, and handles archive API
 * Run: node scripts/kanban-server-v2.js
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

// File paths
const TASKS_FILE = path.join(WORKSPACE_DIR, 'data/tasks.json');
const MEMORY_TASKS_FILE = path.join(WORKSPACE_DIR, 'memory/TASKS.md');
const TASK_ARCHIVE_FILE = path.join(WORKSPACE_DIR, 'memory/TASKARCHIVE.md');

// Helper functions
function readJSONFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return null;
  }
}

function writeJSONFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err.message);
    return false;
  }
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return '';
  }
}

function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content);
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err.message);
    return false;
  }
}

// TOON format helper
function taskToTOON(task) {
  const date = task.createdAt ? new Date(task.createdAt).toISOString().split('T')[0] : 'unknown';
  const priority = task.priority || 'medium';
  const description = task.description ? task.description.replace(/\n/g, ' ').substring(0, 100) : '';
  
  return `${task.id}{Date,Priority,Title}: ${date},${priority},"${task.title}"`;
}

// Archive processing
function archiveTasks(taskIds) {
  // Read current tasks
  const tasksData = readJSONFile(TASKS_FILE);
  if (!tasksData || !tasksData.tasks) {
    return { success: false, error: 'Could not read tasks.json' };
  }
  
  // Filter tasks to archive
  const tasksToArchive = tasksData.tasks.filter(task => taskIds.includes(task.id));
  const remainingTasks = tasksData.tasks.filter(task => !taskIds.includes(task.id));
  
  if (tasksToArchive.length === 0) {
    return { success: false, error: 'No matching tasks found' };
  }
  
  // Update tasks.json
  tasksData.tasks = remainingTasks;
  tasksData.lastUpdated = new Date().toISOString();
  const tasksUpdated = writeJSONFile(TASKS_FILE, tasksData);
  
  if (!tasksUpdated) {
    return { success: false, error: 'Failed to update tasks.json' };
  }
  
  // Read or create TASKARCHIVE.md
  let archiveContent = readFile(TASK_ARCHIVE_FILE);
  const today = new Date().toISOString().split('T')[0];
  
  // Find or create Archived section
  if (!archiveContent.includes('## Archived')) {
    archiveContent = `# TASKARCHIVE.md - Archived Tasks (TOON Format)\n\n## Archived[0]{ID,Date,Priority,Title}: \n\n`;
  }
  
  // Parse existing archived entries
  const lines = archiveContent.split('\n');
  let archivedSectionIndex = -1;
  let archivedCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## Archived[')) {
      archivedSectionIndex = i;
      // Extract count from line like "## Archived[5]{ID,Date,Priority,Title}:"
      const match = lines[i].match(/## Archived\[(\d+)\]/);
      if (match) {
        archivedCount = parseInt(match[1]);
      }
      break;
    }
  }
  
  // Add new archived tasks
  const newTOONEntries = tasksToArchive.map(taskToTOON);
  const updatedArchivedCount = archivedCount + tasksToArchive.length;
  
  // Update the Archived line
  if (archivedSectionIndex >= 0) {
    lines[archivedSectionIndex] = `## Archived[${updatedArchivedCount}]{ID,Date,Priority,Title}:`;
    
    // Insert new entries after the Archived line
    const insertIndex = archivedSectionIndex + 1;
    newTOONEntries.reverse().forEach(entry => {
      lines.splice(insertIndex, 0, entry);
    });
  }
  
  // Write updated archive
  const archiveUpdated = writeFile(TASK_ARCHIVE_FILE, lines.join('\n'));
  
  if (!archiveUpdated) {
    return { success: false, error: 'Failed to update TASKARCHIVE.md' };
  }
  
  // TODO: Also update memory/TASKS.md (Active section)
  // This would require parsing TOON format in TASKS.md
  
  return { 
    success: true, 
    archivedCount: tasksToArchive.length,
    archivedTasks: tasksToArchive.map(t => t.id)
  };
}

const server = http.createServer((req, res) => {
  const { url, method } = req;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS (preflight)
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Handle archive API
  if (url === '/archive' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const taskIds = data.taskIds || [];
        
        if (!Array.isArray(taskIds) || taskIds.length === 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'No task IDs provided' }));
          return;
        }
        
        const result = archiveTasks(taskIds);
        
        res.writeHead(result.success ? 200 : 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        
      } catch (err) {
        console.error('Archive request error:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
      }
    });
    
    return;
  }
  
  // Handle file serving
  let filePath = url;
  
  // Handle root path
  if (filePath === '/') {
    filePath = '/kanban-board-v2.html';
  }
  
  // Map URLs to workspace files
  let fullPath;
  if (filePath === '/kanban-board-v2.html') {
    fullPath = path.join(WORKSPACE_DIR, 'kanban-board-v2.html');
  } else if (filePath === '/kanban-board.html') {
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
  console.log(`🚀 Enhanced kanban board server running at http://localhost:${PORT}/`);
  console.log(`📋 New 3-column board: http://localhost:${PORT}/kanban-board-v2.html`);
  console.log(`📋 Original board: http://localhost:${PORT}/kanban-board.html`);
  console.log(`📊 Archive API: POST /archive with {taskIds: ["id1", "id2"]}`);
  console.log(`📝 Tasks are stored in: ${WORKSPACE_DIR}/data/tasks.json`);
  console.log(`📦 Archive file: ${TASK_ARCHIVE_FILE}`);
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