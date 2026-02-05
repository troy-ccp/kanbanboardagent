#!/bin/bash
# Enhanced Mission Control Task Update Script
# Usage: mc-update.sh <command> [args...]
#
# Commands:
#   create "Title" "Description" <priority>  - Create new task
#   delete <task_id>                       - Delete task
#   list [status]                          - List all tasks (or filtered by status)
#   status <task_id> <new_status>          - Update task status
#   block <task_id> "reason"               - Mark task as blocked/needs input
#   unblock <task_id>                      - Clear blocked status
#   on-hold <task_id>                      - Move task to on_hold status
#   subtask <task_id> <subtask_id> done    - Mark subtask as done
#   comment <task_id> "comment text"       - Add comment to task
#   add-subtask <task_id> "title"          - Add new subtask
#   complete <task_id> "summary"           - Move to review + add summary
#   start <task_id>                        - Mark as being processed

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
TASKS_FILE="$REPO_DIR/data/tasks.json"

cd "$REPO_DIR"

case "$1" in
    create)
        TITLE="$2"
        DESCRIPTION="$3"
        PRIORITY="${4:-medium}"  # Default: medium

        if [[ -z "$TITLE" || -z "$DESCRIPTION" ]]; then
            echo "Usage: mc-update.sh create \"Title\" \"Description\" [high|medium|low]"
            exit 1
        fi

        python3 << PYEOF
import json
from datetime import datetime
import uuid

with open('$TASKS_FILE', 'r', encoding='utf-8') as f:
    data = json.load(f)

task_id = f"task_{datetime.now().strftime('%Y%m%d%H%M%S')}"
task = {
    'id': task_id,
    'title': '''$TITLE''',
    'description': '''$DESCRIPTION''',
    'status': 'backlog',
    'priority': '''$PRIORITY''',
    'createdAt': datetime.now().isoformat() + 'Z',
    'updatedAt': datetime.now().isoformat() + 'Z',
    'subtasks': [],
    'comments': [],
    'blocked': False,
    'blockedReason': None
}

data['tasks'].append(task)

with open('$TASKS_FILE', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"✓ Created task: {task_id}")
print(f"  Title: {task['title']}")
print(f"  Priority: {task['priority']}")
print(f"  Status: {task['status']}")
PYEOF
        ;;

    delete)
        TASK_ID="$2"

        if [[ -z "$TASK_ID" ]]; then
            echo "Usage: mc-update.sh delete <task_id>"
            exit 1
        fi

        python3 << PYEOF
import json

with open('$TASKS_FILE', 'r', encoding='utf-8') as f:
    data = json.load(f)

original_count = len(data['tasks'])
data['tasks'] = [t for t in data['tasks'] if t['id'] != '$TASK_ID']
deleted = original_count - len(data['tasks'])

if deleted == 0:
    print(f"✗ Task '$TASK_ID' not found")
    exit(1)

with open('$TASKS_FILE', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"✓ Deleted task: $TASK_ID")
PYEOF
        ;;

    list)
        STATUS_FILTER="$2"

        python3 << PYEOF
import json
from datetime import datetime

with open('$TASKS_FILE', 'r', encoding='utf-8') as f:
    data = json.load(f)

tasks = data['tasks']
if '$STATUS_FILTER' != '':
    tasks = [t for t in tasks if t['status'] == '$STATUS_FILTER']

if not tasks:
    print("No tasks found.")
    exit(0)

# Group by status
for status in ['backlog', 'in_progress', 'on_hold', 'review', 'done']:
    status_tasks = [t for t in tasks if t['status'] == status]
    if status_tasks:
        print(f"\n{'='*60}")
        print(f"  {status.upper().replace('_', ' ')} ({len(status_tasks)})")
        print(f"{'='*60}")
        for t in status_tasks:
            priority_icon = {'high': '🔴', 'medium': '🟡', 'low': '🟢'}.get(t.get('priority', 'medium'), '⚪')
            blocked = ' 🔶 BLOCKED' if t.get('blocked') else ''
            print(f"{priority_icon} [{t['id']}] {t['title']}{blocked}")
            if t.get('description'):
                print(f"   {t['description'][:80]}{'...' if len(t['description']) > 80 else ''}")
            if t.get('blockedReason'):
                print(f"   ⚠️  {t['blockedReason']}")
            if t.get('subtasks'):
                done = sum(1 for s in t['subtasks'] if s.get('done'))
                total = len(t['subtasks'])
                print(f"   Subtasks: {done}/{total} complete")
PYEOF
        ;;

    status)
        TASK_ID="$2"
        NEW_STATUS="$3"

        if [[ -z "$TASK_ID" || -z "$NEW_STATUS" ]]; then
            echo "Usage: mc-update.sh status <task_id> <new_status>"
            echo "Status options: backlog, in_progress, on_hold, review, done"
            exit 1
        fi

        python3 << PYEOF
import json
from datetime import datetime

with open('$TASKS_FILE', 'r', encoding='utf-8') as f:
    data = json.load(f)

found = False
for t in data['tasks']:
    if t['id'] == '$TASK_ID':
        old_status = t['status']
        t['status'] = '$NEW_STATUS'
        t['updatedAt'] = datetime.now().isoformat() + 'Z'
        found = True
        print(f"✓ {t['title']}: {old_status} → $NEW_STATUS")
        break

if not found:
    print(f"✗ Task '$TASK_ID' not found")
    exit(1)

with open('$TASKS_FILE', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
PYEOF
        ;;

    block)
        TASK_ID="$2"
        REASON="$3"

        if [[ -z "$TASK_ID" || -z "$REASON" ]]; then
            echo "Usage: mc-update.sh block <task_id> \"reason\""
            exit 1
        fi

        python3 << PYEOF
import json
from datetime import datetime

with open('$TASKS_FILE', 'r', encoding='utf-8') as f:
    data = json.load(f)

found = False
for t in data['tasks']:
    if t['id'] == '$TASK_ID':
        t['blocked'] = True
        t['blockedReason'] = '''$REASON'''
        t['updatedAt'] = datetime.now().isoformat() + 'Z'
        if 'comments' not in t:
            t['comments'] = []
        t['comments'].append({
            'id': f"c_{int(datetime.now().timestamp()*1000)}",
            'author': 'Max',
            'text': f"🔶 Blocked: $REASON",
            'createdAt': datetime.now().isoformat() + 'Z'
        })
        found = True
        print(f"✓ Blocked: {t['title']}")
        print(f"  Reason: {t['blockedReason']}")
        break

if not found:
    print(f"✗ Task '$TASK_ID' not found")
    exit(1)

with open('$TASKS_FILE', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
PYEOF
        ;;

    unblock)
        TASK_ID="$2"

        if [[ -z "$TASK_ID" ]]; then
            echo "Usage: mc-update.sh unblock <task_id>"
            exit 1
        fi

        python3 << PYEOF
import json
from datetime import datetime

with open('$TASKS_FILE', 'r', encoding='utf-8') as f:
    data = json.load(f)

found = False
for t in data['tasks']:
    if t['id'] == '$TASK_ID':
        if not t.get('blocked'):
            print(f"⚠️  Task '{t['title']}' is not blocked")
            exit(0)
        t['blocked'] = False
        t['blockedReason'] = None
        t['updatedAt'] = datetime.now().isoformat() + 'Z'
        if 'comments' not in t:
            t['comments'] = []
        t['comments'].append({
            'id': f"c_{int(datetime.now().timestamp()*1000)}",
            'author': 'Max',
            'text': '✅ Unblocked - Ready to continue',
            'createdAt': datetime.now().isoformat() + 'Z'
        })
        found = True
        print(f"✓ Unblocked: {t['title']}")
        break

if not found:
    print(f"✗ Task '$TASK_ID' not found")
    exit(1)

with open('$TASKS_FILE', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
PYEOF
        ;;

    on-hold)
        TASK_ID="$2"

        if [[ -z "$TASK_ID" ]]; then
            echo "Usage: mc-update.sh on-hold <task_id>"
            exit 1
        fi

        python3 << PYEOF
import json
from datetime import datetime

with open('$TASKS_FILE', 'r', encoding='utf-8') as f:
    data = json.load(f)

found = False
for t in data['tasks']:
    if t['id'] == '$TASK_ID':
        old_status = t['status']
        t['status'] = 'on_hold'
        t['updatedAt'] = datetime.now().isoformat() + 'Z'
        found = True
        print(f"✓ {t['title']}: {old_status} → on_hold")
        break

if not found:
    print(f"✗ Task '$TASK_ID' not found")
    exit(1)

with open('$TASKS_FILE', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
PYEOF
        ;;

    subtask)
        TASK_ID="$2"
        SUBTASK_ID="$3"
        ACTION="$4"

        if [[ -z "$TASK_ID" || -z "$SUBTASK_ID" || "$ACTION" != "done" ]]; then
            echo "Usage: mc-update.sh subtask <task_id> <subtask_id> done"
            exit 1
        fi

        python3 << PYEOF
import json

with open('$TASKS_FILE', 'r', encoding='utf-8') as f:
    data = json.load(f)

found = False
for t in data['tasks']:
    if t['id'] == '$TASK_ID':
        for s in t['subtasks']:
            if s['id'] == '$SUBTASK_ID':
                s['done'] = True
                found = True
                print(f"✓ Subtask '{s['title']}' marked as done")
                break
        break

if not found:
    print(f"✗ Task or subtask not found")
    exit(1)

with open('$TASKS_FILE', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
PYEOF
        ;;

    comment)
        TASK_ID="$2"
        COMMENT_TEXT="$3"

        if [[ -z "$TASK_ID" || -z "$COMMENT_TEXT" ]]; then
            echo "Usage: mc-update.sh comment <task_id> \"comment text\""
            exit 1
        fi

        python3 << PYEOF
import json
from datetime import datetime

with open('$TASKS_FILE', 'r', encoding='utf-8') as f:
    data = json.load(f)

found = False
for t in data['tasks']:
    if t['id'] == '$TASK_ID':
        if 'comments' not in t:
            t['comments'] = []
        comment = {
            'id': f"c_{int(datetime.now().timestamp()*1000)}",
            'author': 'Max',
            'text': '''$COMMENT_TEXT''',
            'createdAt': datetime.now().isoformat() + 'Z'
        }
        t['comments'].append(comment)
        found = True
        print(f"✓ Comment added to '{t['title']}'")
        break

if not found:
    print(f"✗ Task '$TASK_ID' not found")
    exit(1)

with open('$TASKS_FILE', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
PYEOF
        ;;

    add-subtask)
        TASK_ID="$2"
        SUBTASK_TITLE="$3"

        if [[ -z "$TASK_ID" || -z "$SUBTASK_TITLE" ]]; then
            echo "Usage: mc-update.sh add-subtask <task_id> \"subtask title\""
            exit 1
        fi

        python3 << PYEOF
import json

with open('$TASKS_FILE', 'r', encoding='utf-8') as f:
    data = json.load(f)

found = False
for t in data['tasks']:
    if t['id'] == '$TASK_ID':
        subtask_id = f"sub_{len(t['subtasks'])+1}"
        t['subtasks'].append({
            'id': subtask_id,
            'title': '''$SUBTASK_TITLE''',
            'done': False
        })
        found = True
        print(f"✓ Subtask '{subtask_id}' added to '{t['title']}'")
        break

if not found:
    print(f"✗ Task '$TASK_ID' not found")
    exit(1)

with open('$TASKS_FILE', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
PYEOF
        ;;

    complete)
        TASK_ID="$2"
        SUMMARY="$3"

        if [[ -z "$TASK_ID" || -z "$SUMMARY" ]]; then
            echo "Usage: mc-update.sh complete <task_id> \"summary of what was done\""
            exit 1
        fi

        python3 << PYEOF
import json
from datetime import datetime

with open('$TASKS_FILE', 'r', encoding='utf-8') as f:
    data = json.load(f)

found = False
for t in data['tasks']:
    if t['id'] == '$TASK_ID':
        old_status = t['status']
        t['status'] = 'review'
        if 'processingStartedAt' in t:
            del t['processingStartedAt']
        if 'comments' not in t:
            t['comments'] = []
        comment = {
            'id': f"c_{int(datetime.now().timestamp()*1000)}",
            'author': 'Max',
            'text': '''$SUMMARY''',
            'createdAt': datetime.now().isoformat() + 'Z'
        }
        t['comments'].append(comment)
        found = True
        print(f"✓ {t['title']}: {old_status} → review")
        print(f"✓ Added completion comment")
        break

if not found:
    print(f"✗ Task '$TASK_ID' not found")
    exit(1)

with open('$TASKS_FILE', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
PYEOF
        ;;

    start)
        TASK_ID="$2"

        if [[ -z "$TASK_ID" ]]; then
            echo "Usage: mc-update.sh start <task_id>"
            exit 1
        fi

        python3 << PYEOF
import json
from datetime import datetime

with open('$TASKS_FILE', 'r', encoding='utf-8') as f:
    data = json.load(f)

found = False
for t in data['tasks']:
    if t['id'] == '$TASK_ID':
        if t.get('processingStartedAt'):
            print(f"⚠ Task '{t['title']}' is already being processed since {t['processingStartedAt']}")
            exit(1)
        now = datetime.now().isoformat() + 'Z'
        t['processingStartedAt'] = now
        if 'comments' not in t:
            t['comments'] = []
        comment = {
            'id': f"c_{int(datetime.now().timestamp()*1000)}",
            'author': 'Max',
            'text': '🤖 Processing started',
            'createdAt': now
        }
        t['comments'].append(comment)
        found = True
        print(f"✓ Processing started for '{t['title']}'")
        break

if not found:
    print(f"✗ Task '$TASK_ID' not found")
    exit(1)

with open('$TASKS_FILE', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
PYEOF
        ;;

    *)
        echo "Mission Control Task Update Script"
        echo ""
        echo "Usage: mc-update.sh <command> [args...]"
        echo ""
        echo "Task Management:"
        echo "  create \"Title\" \"Description\" [high|medium|low]  - Create new task"
        echo "  delete <task_id>                               - Delete task"
        echo "  list [status]                                  - List tasks"
        echo ""
        echo "Status Updates:"
        echo "  status <task_id> <new_status>                  - Update status"
        echo "  on-hold <task_id>                             - Move to on_hold"
        echo ""
        echo "Block/Unblock:"
        echo "  block <task_id> \"reason\"                     - Mark as blocked"
        echo "  unblock <task_id>                             - Clear blocked status"
        echo ""
        echo "Task Details:"
        echo "  comment <task_id> \"text\"                      - Add comment"
        echo "  add-subtask <task_id> \"title\"                 - Add subtask"
        echo "  subtask <task_id> <subtask_id> done           - Mark subtask done"
        echo ""
        echo "Workflow:"
        echo "  start <task_id>                                - Mark as processing"
        echo "  complete <task_id> \"summary\"                 - Move to review + summary"
        echo ""
        echo "Status options: backlog, in_progress, on_hold, review, done"
        exit 1
        ;;
esac

# Auto commit and push if changes were made
if [[ -n "$(git status --porcelain data/tasks.json)" ]]; then
    git add data/tasks.json
    git commit -m "Task update via mc-update.sh: $1 $2"
    echo "✓ Changes committed to git"
    git push origin master 2>/dev/null && echo "✓ Pushed to GitHub" || echo "⚠ Push failed - run: git push"
fi