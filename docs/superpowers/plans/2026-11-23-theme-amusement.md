# Amusement Park Theme (Stage 2, theme 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** The สวนสนุก theme with 53 owner-approved items, playable from theme select, plus the theme pipeline generalised so the next 7 themes reuse it.

**Architecture:** Same pipeline as the School theme: kit-built items in per-sculptor batches checked against the theme's item doc, a per-theme geometry snapshot, registration in `THEMES`; plus a new `chase` light kind in the shared motion shader.

**Tech Stack:** TypeScript 7, Three.js 0.187, Vite 8, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-22-city-builder-game-design.md` (Stage 2; content rules §4; owner changes) + item list `docs/game/items-amusement.md` (owner-approved).

## Global Constraints
- Branch `feat/theme-amusement`. Commits end with the Co-Authored-By trailer; never push.
- Item rules: `docs/game/sculpting.md` (style kit, master palette only, validation, triangle budget, item ground surfaces ≥ 0.02, animation options and limits). Footprints, ids, Thai names and batches exactly as `docs/game/items-amusement.md`.
- Content: kid-friendly; the doc's content rules for บ้านผีสิง / สนามยิงปืน / บ้านยักษ์; no copyrighted characters, no religious or royal imagery.
- School theme unchanged: its geometry fingerprint passes without regeneration.
- Draw calls with a full amusement map stay in the School range (smooth ≈ 15/17 with floors, pretty ≈ 48/50); 60 fps on the Mac real-GPU headless check.
- `src/models/{kit,palette,validate,parts}.ts` are controller-owned; only Task 1 may edit kit/motion for the chase light.
- Owner rules for browser checks: Playwright's bundled headless Chromium only (no `channel`; add `--use-angle=metal --ignore-gpu-blocklist --enable-gpu` for real-GPU numbers), one launch per script, never headed, never the real Chrome app or chrome-devtools MCP; no per-item sweeps — batch gallery day + night only.

## Review Focus
1. Chase lights read as running lights (≤ 3 Hz per bulb), hold steady under reduced motion, and work after rotation/merge.
2. Spinning/swinging parts of one item move together (shared pivot) and never cut through their own static parts at the extremes.
3. The amusement mix (16/15/12/10) still lets a planning player fill most of the map (simulation).
4. A saved School city still loads; switching themes in theme select works both ways.
5. Items stay inside their footprint and over the 0.02 ground-surface rule (floor tiles never bury them).

---

### Task 1: Theme pipeline for any theme + chase lights + amusement scaffold
**Files:** generalise `src/themes/school/batches/batch.test-helper.ts` into a shared helper (`src/themes/batchHelper.ts`) that takes the theme's item doc; generalise the DEV batch gallery to `?gallery=<themeId>-batch-<n>` (keep `?gallery=batch-<n>` working for School); a shared geometry-snapshot helper usable per theme; `src/models/motion.ts` + `src/models/kit.ts` (new light kind `chase`); `src/themes/amusement/{index.ts, batches/a1..a6.ts (+tests), items/}` with empty batches (theme NOT added to `THEMES` yet); `src/game/simulate.test.ts` (amusement mix 16/15/12/10 meets the same targets as School); `docs/game/sculpting.md` (chase option).
**Interfaces:** `PartOpts.light: 'chase'` with `chase?: { index: number; count: number }` (the bulb's place in its run) — bulbs light in sequence, one step ≤ 3 Hz, a lit run of about a third of the bulbs; reduced motion → all on steady; only at dusk/night like other lights.
- [ ] TDD: chase pattern pure TS mirror + GLSL parity; packing guard; batch helper works for both themes; simulation for the amusement mix.
- [ ] Commit `feat: theme pipeline for every theme and chase lights`.

### Tasks 2–7: Sculpt batches a1 … a6 (parallel, disjoint files)
Each sculptor builds the items of its batch from `docs/game/items-amusement.md`, files `src/themes/amusement/items/<id>.ts` + `batches/aN.ts` (+ `aN.test.ts` using the shared batch helper). Review on `?gallery=amusement-batch-<n>` (own dev port), day + night shots only. Runs only `npx vitest run src/themes/amusement` and `npx tsc --noEmit` (the controller runs build + e2e).
- [ ] Commit per batch `feat: amusement batch aN`.

### Task 8: Register the theme, snapshot, demo and verification
**Files:** `src/themes/registry.ts` (add amusement: name สวนสนุก, emoji 🎡, defaultGround `concrete`), `src/themes/amusement/geometry.test.ts` + snapshot, `?demo=full&theme=amusement` (demo for any theme), e2e (theme select → amusement round starts; School save still loads), `docs/game/deploy.md`.
- [ ] Verify: vitest, tsc, build, e2e; real-GPU headless `?demo=full&theme=amusement&fps=1` draw calls + fps both tiers day/night; 4 shots.
- [ ] Commit `feat: amusement park theme`.
