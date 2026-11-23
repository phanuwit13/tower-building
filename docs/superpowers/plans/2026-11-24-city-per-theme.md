# One City per Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Kids switch themes freely; each theme keeps its own saved city.
**Spec:** `docs/superpowers/specs/2026-11-24-city-per-theme-design.md`

## Global Constraints
- Branch `feat/city-per-theme`. Commits end with the Co-Authored-By trailer; never push.
- Never lose a child's city: v1/v2 saves migrate; one corrupt city never drops the others; writes stay atomic (one setItem per save).
- Thai UI only; buttons ≥ 48 px; no new network requests.
- Browser checks: Playwright's bundled headless Chromium only (no `channel`), one launch per script, never headed, never the real Chrome app or chrome-devtools MCP, never `pkill`.

## Review Focus
1. Switch A → B → A: A's placements, floors, bag, settings and status are exactly as left.
2. An old single-city save loads as that theme's city.
3. Restart affects only the current theme; clear deletes all and lands on theme select.
4. Reload resumes the last played theme (or theme select if the child was there).
5. Quota/corrupt storage: the game still starts; the saveFailed notice works.

### Task 1: Per-theme saves, controller, button and theme-select badges
**Files:** `src/game/save.ts` (v3 `{ v: 3, current: ThemeId | null, cities: Record<ThemeId, GameState> }`, load/save/clear APIs, migration from v1/v2, per-city validation), `src/app/controller.ts` (`goToThemeSelect()`, `chooseTheme` resumes or starts, `restart` current only, `clearAll` all; AppState exposes a per-theme summary for theme select), `src/ui/hud.ts` (🏠 เปลี่ยนธีม button), `src/ui/themeSelect.ts` (badge per theme with a city), `src/ui/strings.ts` (new copy + updated confirm texts), `src/main.ts` wiring, tests + `e2e/` (switch A→B→A, reload, migration, restart-only-this, clear-all).
- [ ] Commit `feat: every theme keeps its own city`.
