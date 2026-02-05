# Mission Control Kanban Board - Agent Instructions

## Overview
You have a Kanban board dashboard hosted on GitHub Pages that Troy (your user) checks to see your task progress. Every time you update a task, it automatically commits and pushes to GitHub, and the dashboard refreshes every 30 seconds.

**Dashboard URL:** https://troy-ccp.github.io/kanbanboardagent/

## How It Works
1. You run `mc-update.sh` commands to manage tasks
2. The script updates `data/tasks.json` locally
3. It automatically commits AND pushes to GitHub
4. GitHub Pages serves the updated dashboard
5. Troy sees your changes within 1-2 minutes

## Task Management Commands

All commands are run from the workspace directory:
```bash
cd /home/node/.openclaw/workspace
```

### Create a Task
```bash
bash scripts/mc-update.sh create "Task Title" "Task description" [high|medium|low]
```
- Priority defaults to `medium` if omitted
- New tasks start in `backlog` status

### Start Working on a Task
```bash
bash scripts/mc-update.sh start <task_id>
```
- Marks the task as being actively processed
- Adds a "Processing started" comment

### Update Task Status
```bash
bash scripts/mc-update.sh status <task_id> <new_status>
```
- Valid statuses: `backlog`, `in_progress`, `on_hold`, `review`, `done`

### Complete a Task
```bash
bash scripts/mc-update.sh complete <task_id> "Summary of what was done"
```
- Moves task to `review` status
- Adds a completion comment with your summary

### Block a Task (Needs Troy's Input)
```bash
bash scripts/mc-update.sh block <task_id> "Reason you're blocked"
```
- Marks the task with a blocked indicator (visible on dashboard)
- Use this when you need a decision, credentials, clarification, or anything from Troy

### Unblock a Task
```bash
bash scripts/mc-update.sh unblock <task_id>
```
- Clears the blocked status after Troy provides what you needed

### Put a Task On Hold
```bash
bash scripts/mc-update.sh on-hold <task_id>
```
- Moves task to `on_hold` status (waiting but not blocked)

### Add a Comment
```bash
bash scripts/mc-update.sh comment <task_id> "Your comment text"
```
- Adds a timestamped comment to the task
- Use for progress updates, notes, or questions

### Add a Subtask
```bash
bash scripts/mc-update.sh add-subtask <task_id> "Subtask title"
```
- Adds a subtask checklist item to an existing task

### Mark Subtask Done
```bash
bash scripts/mc-update.sh subtask <task_id> <subtask_id> done
```
- Marks a specific subtask as completed

### Delete a Task
```bash
bash scripts/mc-update.sh delete <task_id>
```
- Permanently removes the task

### List Tasks
```bash
bash scripts/mc-update.sh list
bash scripts/mc-update.sh list in_progress
bash scripts/mc-update.sh list blocked
```
- Shows all tasks or filters by status

## Workflow Best Practices

### When Starting Work
1. `list` tasks to see what's in your backlog
2. `start <task_id>` on the task you're picking up
3. `status <task_id> in_progress` to move it to the In Progress column

### While Working
- `comment <task_id> "progress note"` to log progress
- `add-subtask <task_id> "step"` to break work into steps
- `subtask <task_id> <sub_id> done` as you complete each step

### When Blocked
- `block <task_id> "What I need from Troy"` - be specific about what you need
- Troy will see the blocked indicator on his dashboard

### When Done
- `complete <task_id> "What was accomplished"` to move to review
- Troy will review and move to done, or give feedback

### Priority Levels
- `high` - Urgent, do first
- `medium` - Normal priority
- `low` - Do when higher priority work is clear

## Dashboard Columns
The dashboard shows 5 columns that Troy monitors:
1. **Backlog** - Tasks waiting to be started
2. **In Progress** - Tasks you're actively working on
3. **On Hold** - Tasks paused for some reason
4. **Review** - Tasks you completed, waiting for Troy to verify
5. **Done** - Verified complete

## Important Notes
- Every command auto-commits and auto-pushes to GitHub. No manual git commands needed.
- The dashboard has a morning summary that shows what you completed overnight, what's blocked, and what's in progress.
- Keep task titles short and descriptive.
- Always provide meaningful summaries when completing tasks.
- When blocked, be very specific about what you need - Troy may not see it for hours.
- Task IDs look like `task_20260205231821` (date-based). Use `list` to find them.
