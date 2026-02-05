# Kanban Board Requirements

## User Requirements (Troy, 2026-02-04)
1. **View at a glance**: See all three columns (backlog, in progress, completed) simultaneously in a 1/4 screen window.
2. **Readability**: Project name/title must be easily readable.
3. **Archive interaction**: Completed tasks need a way for user to interact and notify assistant to archive.
4. **Archive workflow**: Archived tasks should be:
   - Removed from kanban board
   - Removed from memory/TASKS.md
   - Placed in memory/TASKARCHIVE.md using TOON schema
5. **Platform**: Could be custom app, enhanced HTML board, or other tool.

## Technical Constraints
- Must fit within 1/4 screen (approx 480x640 pixels on typical display?)
- Must display 3 columns simultaneously
- Must integrate with existing workspace (memory/TASKS.md, memory/TASKARCHIVE.md)
- Must support user interaction for archiving

## Current State
- Existing kanban: CLI (`node scripts/kanban-cli.js`) + web interface (`localhost:8080/kanban-board.html`)
- Current web interface: shows all columns but may not fit 1/4 screen
- Current data: `data/tasks.json`
- Current archive: None (needs creation of memory/TASKARCHIVE.md)