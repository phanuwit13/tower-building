# Hospital Theme (Stage 2, theme 8) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** The โรงพยาบาล theme (theme id `hospital`): INSIDE a hospital, like the café — 60 owner-approved items to furnish a hospital floor, playable from theme select.

**Architecture:** The generic theme pipeline plus one engine change: the café's indoor room gets a per-theme look (`ThemeDef.room`), so the hospital shows clean hospital walls, windows and open glass doors under a heart-and-plus sign instead of the café front.

**Tech Stack:** TypeScript 7, Three.js 0.187, Vite 8, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-22-city-builder-game-design.md` (Stage 2, §4 content rules — hospital: no red cross on white) + item list `docs/game/items-hospital.md` (owner-approved 2026-11-24, indoors: "inside the hospital, not outside"; its sections are binding).

## Global Constraints
- Branch `feat/theme-hospital` (own worktree `.claude/worktrees/hospital`). Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; commit path-limited; never `--amend`. The controller opens and merges the PR once every gate passes (owner permission 2026-11-24).
- Item rules: `docs/game/sculpting.md`; ids, Thai names, footprints, categories, animations, batches exactly as the doc. Indoors: no `sway`/`wave`.
- Content: no red cross on white anywhere (heart-and-plus in teal/green; pharmacy green plus-in-circle); no people; nothing scary or gory (no blood, needles, drips, surgery, skeletons, ghosts); nothing religious; no royal imagery; no brands; no text, letters or numbers.
- The café keeps its look exactly (its room unchanged); outdoor themes unchanged; all geometry snapshots of other themes pass unregenerated.
- Owner rules for browser checks: Playwright's bundled headless Chromium only, one launch per script, never headed, never `pkill`/`killall`; no per-item sweeps.

## Review Focus
1. The hospital room reads as a hospital from the default camera (walls, windows, open glass doors, heart-and-plus sign) and never a café; the café still reads as the café.
2. No red cross on white anywhere, and nothing scary for a child.
3. Items from different batches match in scale (shared heights).
4. Night: a bright, calm hospital, not blown out.
5. Saved cities of every other theme still load; theme select works for all themes.

---

### Task 1: Hospital scaffold
`src/themes/hospital/{info,index,index.test}.ts`, batches h1..h7 + tests, `HOSPITAL_MIX`, `docs/game/items-hospital.md`. Theme: id `hospital`, โรงพยาบาล, 🏥, defaultGround `snow` (the pale floor), `nightGlow` 1.5, `indoor: true`.
### Task 2: Room look per theme
`ThemeDef.room?: 'cafe' | 'hospital'` (default `'cafe'` for an indoor theme); `src/render/room.ts` builds the look for the shown theme; the hospital look; main.ts + galleries pass it.
### Tasks 3–9: Sculpt batches h1 … h7 (parallel)
### Task 10: Register, snapshot, e2e, demo check, PR, merge
