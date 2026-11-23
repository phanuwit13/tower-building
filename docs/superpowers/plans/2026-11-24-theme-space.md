# Space Theme (Stage 2, theme 9) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** The อวกาศ theme (theme id `space`): a friendly moon base with 60 owner-approved items on the moon ground, playable from theme select.

**Architecture:** The generic theme pipeline (as village/park). No engine change: the `moon` ground already exists; the standard night.

**Tech Stack:** TypeScript 7, Three.js 0.187, Vite 8, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-22-city-builder-game-design.md` + item list `docs/game/items-space.md` (owner-approved 2026-11-24 with "รวมทั้งหมด 4 theme เริ่มทำได้เลย"; its sections are binding).

## Global Constraints
- Branch `feat/theme-space` (worktree `.claude/worktrees/space`). Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; path-limited; never `--amend`. The controller opens and merges the PR once every gate passes.
- Item rules: `docs/game/sculpting.md`; ids, names, footprints, categories, animations, batches exactly as the doc. **No wind on the moon: no `sway`/`wave`.**
- Content: no people (no astronauts; robots and one friendly alien are fine); no national flags or space-agency logos; no weapons or lasers; no scary aliens; no text, letters or numbers; no brands.
- Other themes unchanged (their snapshots pass unregenerated).
- Browser checks: Playwright's bundled headless Chromium only, one launch per script, never headed, never `pkill`/`killall`; no per-item sweeps.

## Review Focus
1. Each item reads as itself from the default camera on the pale lavender moon ground (enough contrast: whites and greys need colour accents).
2. Night: domes, beacons, crystals and landing lights glow; not blown out.
3. Spinning parts (dishes, drills, rotors) share one pivot and stay inside the footprint.
4. Items from different batches match in scale.
5. Saved cities of every other theme still load; theme select works for all.

### Task 1: Space scaffold — id `space`, อวกาศ, 🚀, defaultGround `moon`.
### Tasks 2–8: Sculpt batches s1 … s7 (parallel)
### Task 9: Register, snapshot, e2e, demo check, PR, CI, merge
