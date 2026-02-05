#!/bin/bash
# Mission Control Task Update Script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
TASKS_FILE="$REPO_DIR/data/tasks.json"

cd "$REPO_DIR"

case "$1" in
    list)
        python3 << 'PYTHON'
import json
with open('data/tasks.json', 'r') as f:
    data = json.load(f)
    tasks = data.get('tasks', [])
    
    # Group by status
    for status in ['backlog', 'in_progress', 'on_hold', 'review', 'done']:
        status_tasks = [t for t in tasks if t.get('status') == status]
        if status_tasks:
            print(f"{'='*60}")
            print(f"  {status.upper().replace('_', ' ')} ({len(status_tasks)})")
            print(f"{'='*60}")
            for t in status_tasks:
                priority_icon = {'high': '🔴', 'medium': '🟡', 'low': '🟢', 'urgent': '🚨'}.get(t.get('priority', 'medium'), '⚪')
                blocked = ' 🔶 BLOCKED' if t.get('blocked') else ''
                print(f"{priority_icon} [{t['id']}] {t['title']}{blocked}")
                if t.get('blockedReason'):
                    print(f"   ⚠️  {t['blockedReason']}")
PYTHON
        ;;
        
    *)
        echo "Mission Control Task Update Script"
        echo ""
        echo "Available commands:"
        echo "  list - List all tasks"
        echo ""
        echo "Coming soon:"
        echo "  create, delete, status, block, unblock, on-hold, comment, complete"
        exit 1
        ;;
esac