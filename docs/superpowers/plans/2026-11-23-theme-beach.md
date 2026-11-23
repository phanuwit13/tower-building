# Beach Theme (Stage 2, theme 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** The ชายหาดทะเล theme with 60 owner-approved items, playable from theme select.

**Architecture:** The generic theme pipeline built for สวนสนุก: kit-built items in per-sculptor batches checked against `docs/game/items-beach.md`, a per-theme geometry snapshot, registration in `THEMES`.

**Tech Stack:** TypeScript 7, Three.js 0.187, Vite 8, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-22-city-builder-game-design.md` (Stage 2, §4 content rules, owner changes) + item list `docs/game/items-beach.md` (owner-approved).

## Global Constraints
- Branch `feat/theme-beach`. Commits end with the Co-Authored-By trailer; never push.
- Item rules: `docs/game/sculpting.md`. Footprints, ids, Thai names, categories and batches exactly as `docs/game/items-beach.md`; its content rules (no people, no alcohol, no religious or royal imagery, no text on signs, friendly sea animals).
- School, amusement and zoo unchanged: their geometry snapshots pass without regeneration.
- Draw calls with a full beach map stay in the existing range (smooth ≈ 15/17 with floors, pretty ≈ 48/50); 60 fps on the Mac real-GPU headless check.
- `src/models/*` are controller-owned (no changes expected).
- Owner rules for browser checks: Playwright's bundled headless Chromium only (no `channel`; `--use-angle=metal --ignore-gpu-blocklist --enable-gpu` for real-GPU numbers), one launch per script, never headed, never the real Chrome app or chrome-devtools MCP; no per-item sweeps — batch gallery day + night only.

## Review Focus
1. Items read as themselves from the default camera (size, colour, one or two key features).
2. Moving parts (sea-swing, palm-hammock, sails, towels, kites, sway crowns) share pivots and never cut through static parts.
3. The beach mix (19/17/14/10) still lets a planning player fill most of the map (simulation).
4. Saved School, amusement and zoo cities still load; theme select works for all four.
5. Items stay inside their footprint and over the 0.02 ground-surface rule.

---

### Task 1: Beach scaffold
**Files:** `src/themes/beach/{info.ts, index.ts, batches/c1..c7.ts (+ tests)}` (empty batches; theme NOT in `THEMES` yet), `src/themes/mix.ts` (`BEACH_MIX` 19/17/14/10) + `src/game/simulate.test.ts`, DEV gallery `?gallery=beach-batch-<n>` wiring. Theme details: id `beach`, name ชายหาดทะเล, emoji 🏖️, defaultGround `sand`.
- [ ] Commit `chore: beach theme scaffold`.

### Tasks 2–8: Sculpt batches c1 … c7 (parallel, disjoint files)
Same rules as the amusement sculptors (brief in the SDD workspace). Commit per batch `feat: beach batch cN`.

### Task 9: Register the theme, snapshot, verification
`src/themes/registry.ts` (add beach), `src/themes/beach/geometry.test.ts` + snapshot, e2e (theme select → ชายหาดทะเล round starts), docs. Verify vitest, tsc, build, e2e; real-GPU `?demo=full&theme=beach&fps=1` both tiers day/night. Commit `feat: beach theme`.
