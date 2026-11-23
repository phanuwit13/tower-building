# Park Theme (Stage 2, theme 7) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** The สวนสาธารณะ theme (theme id `park`): a big city park with 60 owner-approved items, playable from theme select.

**Architecture:** The generic theme pipeline (as zoo/beach/market/café/village). No engine change: outdoors, grass, the standard night.

**Tech Stack:** TypeScript 7, Three.js 0.187, Vite 8, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-22-city-builder-game-design.md` (Stage 2, §4 content rules, owner changes) + item list `docs/game/items-park.md` (owner-approved 2026-11-24; its "The park" section, with the content rules, is binding).

## Global Constraints
- Branch `feat/theme-park`. Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; commit path-limited (`git commit -m ... -- <paths>`); never `--amend`; push the branch; the controller opens and merges the PR (owner permission 2026-11-24) once every gate passes.
- Item rules: `docs/game/sculpting.md`. Footprints, ids, Thai names, categories, animations and batches exactly as `docs/game/items-park.md`.
- Content: no people, no statues of people or monuments, no royal imagery, nothing religious (no shrine, no sacred tree with cloth), no alcohol, no brands, no text on signs.
- The other seven themes unchanged: their geometry snapshots pass without regeneration.
- Owner rules for browser checks: Playwright's bundled headless Chromium only (no `channel`; `--use-angle=metal --ignore-gpu-blocklist --enable-gpu` for real-GPU numbers), one launch per script, never headed, never the real Chrome app or chrome-devtools MCP, never `pkill`/`killall` (stop a dev server by its own task or PID); no per-item sweeps.

## Review Focus
1. Each item reads as itself from the default camera (about 57° up from +x+z), especially play equipment and water items.
2. Items from different batches match in scale (shared heights in the sculptor brief).
3. The night shows park lamps, the stage, kiosks and the greenhouse lit.
4. Content rules: no statue of a person or monument, no royal or religious imagery slips in.
5. Saved cities of the other seven themes still load; theme select works for all eight.

---

### Task 1: Park scaffold
`src/themes/park/{info.ts, index.ts, index.test.ts, batches/p1..p7.ts (+ tests), batches/batch.test-helper.ts}` (empty batches; NOT in `THEMES`), `src/themes/mix.ts` (`PARK_MIX` 19/17/14/10) + `src/game/simulate.test.ts`, `docs/game/items-park.md`. Theme: id `park`, สวนสาธารณะ, emoji 🌳, defaultGround `grass`.
- [ ] Commit `feat: park scaffold`.

### Tasks 2–8: Sculpt batches p1 … p7 (parallel, disjoint files)
Commit per batch `feat: park batch pN`.

### Task 9: Register the theme, snapshot, verification
`src/themes/registry.ts` (add park after village), `src/themes/registry.test.ts`, `src/themes/park/geometry.test.ts` + snapshot, e2e (theme select → สวนสาธารณะ round starts with a park item), `docs/game/deploy.md` (`&theme=park`). Verify vitest, tsc, build, e2e; real-GPU `?demo=full&theme=park&fps=1` day and night. Commit `feat: the park joins the theme list`. Then PR, CI green, merge.
