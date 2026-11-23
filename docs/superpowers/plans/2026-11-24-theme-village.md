# Village Theme (Stage 2, theme 6) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** The หมู่บ้าน theme (theme id `village`): a Thai countryside village with 60 owner-approved items, playable from theme select.

**Architecture:** The generic theme pipeline (as zoo/beach/market/café). No engine change: outdoors, grass, the standard night.

**Tech Stack:** TypeScript 7, Three.js 0.187, Vite 8, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-22-city-builder-game-design.md` (Stage 2, §4 content rules, owner changes) + item list `docs/game/items-village.md` (owner-approved 2026-11-24; its "The village" and "Content rules" sections are binding).

## Global Constraints
- Branch `feat/theme-village`. Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; commit path-limited (`git commit -m ... -- <paths>`); never `--amend`; never push.
- Item rules: `docs/game/sculpting.md`. Footprints, ids, Thai names, categories, animations and batches exactly as `docs/game/items-village.md`.
- Content: no people; nothing religious (temple, monk, stupa, spirit house); no royal imagery or royal-project symbols; no alcohol, cockfighting or gambling; no text on signs; a cheerful, tidy village.
- The other six themes unchanged: their geometry snapshots pass without regeneration.
- Owner rules for browser checks: Playwright's bundled headless Chromium only (no `channel`; `--use-angle=metal --ignore-gpu-blocklist --enable-gpu` for real-GPU numbers), one launch per script, never headed, never the real Chrome app or chrome-devtools MCP, never `pkill`/`killall` (stop a dev server by its own task or PID); no per-item sweeps.

## Review Focus
1. Each item reads as itself from the default camera (about 57° up from +x+z), especially animals and water items.
2. Items from different batches match in scale (shared heights in the sculptor brief).
3. The night is a calm country night that is not too dark: lanterns, lit windows, fireflies and market bulbs show.
4. Content rules: no religious, royal or gambling imagery slips in (e.g. no spirit-house-like shrine on a post, no fighting cocks).
5. Saved cities of the other six themes still load; theme select works for all seven.

---

### Task 1: Village scaffold
`src/themes/village/{info.ts, index.ts, index.test.ts, batches/v1..v7.ts (+ tests), batches/batch.test-helper.ts}` (empty batches; NOT in `THEMES`), `src/themes/mix.ts` (`VILLAGE_MIX` 19/17/14/10) + `src/game/simulate.test.ts`, `docs/game/items-village.md`. Theme: id `village`, หมู่บ้าน, emoji 🏡, defaultGround `grass`.
- [ ] Commit `feat: village scaffold`.

### Tasks 2–8: Sculpt batches v1 … v7 (parallel, disjoint files)
Commit per batch `feat: village batch vN`.

### Task 9: Register the theme, snapshot, verification
`src/themes/registry.ts` (add village after cafe), `src/themes/registry.test.ts`, `src/themes/village/geometry.test.ts` + snapshot, e2e (theme select → หมู่บ้าน round starts with a village item), `docs/game/deploy.md` (`&theme=village`). Verify vitest, tsc, build, e2e; real-GPU `?demo=full&theme=village&fps=1` day and night. Commit `feat: the village joins the theme list`.
