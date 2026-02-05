# Voice Alert Rule

## Rule: Voice alerts must AUTO-PLAY in main sessions
- **Default behavior:** When I complete tasks or need attention, voice alerts should play automatically
- **User experience:** Troy shouldn't need to click/trigger playback manually
- **Implementation:**
  1. Use `tts` tool (auto-plays in supported channels) - PRIMARY
  2. Use `speak.bat` (auto-plays after PowerShell fix) - BACKUP
- **Context:** Troy works with screen behind him, needs audible alerts without interaction
- **Date established:** 2026-02-04
- **Source:** "Can you make sure the voice alert is documented properly. Whenever we start a new session I always need to prompt you to run the voice alert yourself. You want to default to me playing it." - Troy

## Protocol
1. Task completion → voice alert auto-plays
2. Need input → voice alert auto-plays  
3. Blocking issue → voice alert auto-plays
4. Update TOOLS.md and AGENTS.md with this rule
5. New sessions should follow this automatically