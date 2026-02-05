# PROTOCOL.md - Memory System Design
*Updated: 2026-02-04 09:32 EST*

## 🎯 Goal
Token-efficient task memory that survives updates, optimized for ADHD-friendly use.

## 📁 File Architecture
```
workspace/
├── AGENTS.md          # Core behavior rules (concise)
├── TOOLS.md           # Command references
├── memory/
│   ├── TASKS.md       # TOON-formatted active/completed tasks
│   ├── PROTOCOL.md    # This file - system design
│   ├── YYYY-MM-DD.md  # Daily session summaries
│   └── brain-dump-*.md # Raw brain dumps (archival)
└── data/tasks.json    # Kanban board data
```

## 🔄 Workflow
1. **Brain dump arrives** → Create `brain-dump-YYYY-MM-DD.md` (raw)
2. **Process tasks** → Update `TASKS.md` (TOON format)
3. **Sync** → Create kanban tasks
4. **Verify** → Read back to Troy
5. **Complete** → Move to TASKS.md Completed section + voice alert

## 💾 TOON Format Rules
- `Category[N]{Header1,Header2}: Value1,Value2 | Value3,Value4`
- Max 15 words per entry
- No conversational filler
- Machine + human readable
- Example: `Active[3]{Project,Task,Status}: CarolinaProps,MCP_config,backlog`

## ⚡ Efficiency Metrics
- **TASKS.md:** ~1.2KB (vs ~1.6KB MAXTODO.md)
- **TOON:** ~40% more token-efficient than markdown lists
- **Single source:** No duplication across files
- **Fast parse:** Simple regex parsing possible

## 🛡️ Persistence Guarantees
- Files survive OpenClaw updates
- Files survive session restarts
- Troy can read/understand directly
- Git-friendly for version control