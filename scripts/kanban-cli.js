#!/usr/bin/env node

/**
 * Simple Kanban CLI for task management
 */

const fs = require('fs');
const path = require('path');

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(TASKS_FILE))) {
  fs.mkdirSync(path.dirname(TASKS_FILE), { recursive: true });
}

// Load tasks
function loadTasks() {
  if (!fs.existsSync(TASKS_FILE)) {
    return { tasks: [], version: '1.0.0', lastUpdated: new Date().toISOString() };
  }
  return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
}

// Save tasks
function saveTasks(data) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2));
}

// Generate task ID
function generateId() {
  return 'task_' + Date.now();
}

// Commands
const commands = {
  add: (args) => {
    if (args.length < 2) {
      console.error('Usage: add <title> <priority> [status]');
      console.error('Priority: low|medium|high|urgent');
      console.error('Status: backlog|in_progress|review|done (default: backlog)');
      return;
    }

    const [title, priority, status = 'backlog'] = args;
    const data = loadTasks();

    const task = {
      id: generateId(),
      title,
      priority,
      status,
      description: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: []
    };

    data.tasks.push(task);
    saveTasks(data);

    console.log(`✅ Task created: ${task.id}`);
    console.log(`   Title: ${title}`);
    console.log(`   Priority: ${priority}`);
  },

  list: (args) => {
    const data = loadTasks();
    const filterStatus = args[0];

    let tasks = data.tasks;
    if (filterStatus && filterStatus !== 'all') {
      tasks = tasks.filter(t => t.status === filterStatus);
    }

    if (tasks.length === 0) {
      console.log('No tasks found.');
      return;
    }

    console.log('\n📋 Tasks:\n');
    tasks.forEach(task => {
      const icon = getStatusIcon(task.status);
      const priorityIcon = getPriorityIcon(task.priority);
      console.log(`${icon} [${task.id}] ${priorityIcon} ${task.title}`);
      console.log(`   Status: ${task.status} | Created: ${new Date(task.createdAt).toLocaleDateString()}`);
      if (task.description) {
        console.log(`   ${task.description}`);
      }
      console.log();
    });
  },

  update: (args) => {
    if (args.length < 2) {
      console.error('Usage: update <task_id> <field> <value>');
      console.error('Fields: status|priority|title|description');
      return;
    }

    const [taskId, field, value] = args;
    const data = loadTasks();
    const task = data.tasks.find(t => t.id === taskId);

    if (!task) {
      console.error('❌ Task not found:', taskId);
      return;
    }

    task[field] = value;
    task.updatedAt = new Date().toISOString();
    saveTasks(data);

    console.log(`✅ Task updated: ${taskId}`);
    console.log(`   ${field}: ${value}`);
  },

  delete: (args) => {
    if (args.length < 1) {
      console.error('Usage: delete <task_id>');
      return;
    }

    const taskId = args[0];
    const data = loadTasks();
    const initialLength = data.tasks.length;

    data.tasks = data.tasks.filter(t => t.id !== taskId);

    if (data.tasks.length === initialLength) {
      console.error('❌ Task not found:', taskId);
      return;
    }

    saveTasks(data);
    console.log(`✅ Task deleted: ${taskId}`);
  },

  move: (args) => {
    if (args.length < 2) {
      console.error('Usage: move <task_id> <status>');
      console.error('Status: backlog|in_progress|review|done');
      return;
    }

    const [taskId, status] = args;
    const validStatuses = ['backlog', 'in_progress', 'review', 'done'];

    if (!validStatuses.includes(status)) {
      console.error('❌ Invalid status. Use: backlog|in_progress|review|done');
      return;
    }

    const data = loadTasks();
    const task = data.tasks.find(t => t.id === taskId);

    if (!task) {
      console.error('❌ Task not found:', taskId);
      return;
    }

    const oldStatus = task.status;
    task.status = status;
    task.updatedAt = new Date().toISOString();
    saveTasks(data);

    console.log(`✅ Task moved: ${taskId}`);
    console.log(`   ${oldStatus} → ${status}`);

    // If moved to in_progress, announce it
    if (status === 'in_progress') {
      console.log(`🎬 Now working on: ${task.title}`);
    }
  },

  stats: () => {
    const data = loadTasks();
    const stats = {
      backlog: 0,
      in_progress: 0,
      review: 0,
      done: 0
    };

    data.tasks.forEach(task => {
      stats[task.status]++;
    });

    console.log('\n📊 Kanban Status:');
    console.log(`📥 Backlog:      ${stats.backlog}`);
    console.log(`🔄 In Progress: ${stats.in_progress}`);
    console.log(`👀 Review:      ${stats.review}`);
    console.log(`✅ Done:         ${stats.done}`);
    console.log(`\nTotal: ${data.tasks.length} tasks\n`);
  }
};

function getStatusIcon(status) {
  const icons = {
    backlog: '📥',
    in_progress: '🔄',
    review: '👀',
    done: '✅'
  };
  return icons[status] || '📋';
}

function getPriorityIcon(priority) {
  const icons = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    urgent: '🔴'
  };
  return icons[priority] || '⚪';
}

// Run command
const args = process.argv.slice(2);
const command = args[0];
const cmdArgs = args.slice(1);

if (commands[command]) {
  commands[command](cmdArgs);
} else {
  console.log('Kanban CLI - Task Management');
  console.log('\nUsage: node scripts/kanban-cli.js <command> [args]\n');
  console.log('Commands:');
  console.log('  add <title> <priority> [status]     Add a new task');
  console.log('  list [status]                      List tasks (all or by status)');
  console.log('  update <id> <field> <value>         Update task field');
  console.log('  delete <id>                        Delete a task');
  console.log('  move <id> <status>                 Move task to status');
  console.log('  stats                              Show task statistics\n');
  console.log('Priority: low|medium|high|urgent');
  console.log('Status: backlog|in_progress|review|done');
}
