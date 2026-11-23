# Shopping District Theme (Stage 2, theme 4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** The ย่านการค้า theme (new theme id `market`) with 70 owner-approved items, a bright colourful "city night", playable from theme select.

**Architecture:** The generic theme pipeline (as zoo/beach) plus one engine addition: a per-theme night brightness so a city theme glows at night.

**Tech Stack:** TypeScript 7, Three.js 0.187, Vite 8, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-22-city-builder-game-design.md` (Stage 2, §4 content rules, owner changes) + item list `docs/game/items-market.md` (owner-approved; its "Night is the showpiece" and content-rules sections are binding).

## Global Constraints
- Branch `feat/theme-market`. Commits end with the Co-Authored-By trailer; never push.
- Item rules: `docs/game/sculpting.md`. Footprints, ids, Thai names, categories and batches exactly as `docs/game/items-market.md`; every shop has lit windows + a neon icon sign in a vivid palette colour; stalls carry bulbs/lamps; signs are icons, never text.
- School, amusement, zoo and beach unchanged: their geometry snapshots pass without regeneration; their night look unchanged (night brightness defaults to 1).
- Draw calls with a full market map stay in the existing range (smooth ≈ 15/17 with floors, pretty ≈ 48/50); 60 fps on the Mac real-GPU headless check.
- Owner rules for browser checks: Playwright's bundled headless Chromium only (no `channel`; `--use-angle=metal --ignore-gpu-blocklist --enable-gpu` for real-GPU numbers), one launch per script, never headed, never the real Chrome app or chrome-devtools MCP, never `pkill`; no per-item sweeps.

## Review Focus
1. At night the market is bright and colourful (lit street, many neon colours), never a white blown-out blob; by day it looks normal.
2. Other themes' night look is unchanged.
3. The 70-item mix (22/20/17/11) still lets a planning player fill most of the map (simulation).
4. Saved cities of the other four themes still load; theme select works for all five.
5. Items stay inside their footprint and over the 0.02 ground-surface rule; moving parts share pivots.

---

### Task 1: Market scaffold + city night
**Files:** `src/themes/types.ts` (add `'market'` to `ThemeId`; `ThemeDef.nightGlow?: number`, default 1), `src/render/environment.ts` (+ test: apply the theme's night glow — brighter ambient/hemisphere fill at dusk/night and a stronger glow strength for lights; day unchanged), the wiring that tells the environment which theme is shown (`src/main.ts` or wherever scene settings are applied; the gallery too), `src/themes/market/{info.ts, index.ts, batches/m1..m8.ts (+ tests)}` (empty batches; NOT in `THEMES`), `src/themes/mix.ts` (`MARKET_MIX` 22/20/17/11) + `src/game/simulate.test.ts`, `docs/game/sculpting.md` (one paragraph: night glow per theme + the neon guidance). Theme: id `market`, ย่านการค้า, emoji 🛍️, defaultGround `concrete`, `nightGlow` ≈ 1.5 (tune so the street reads lit at night on both tiers without washing out neon or blowing out bloom).
- [ ] Commit `feat: shopping district scaffold and a brighter city night`.

### Tasks 2–9: Sculpt batches m1 … m8 (parallel, disjoint files)
Commit per batch `feat: market batch mN`.

### Task 10: Register the theme, snapshot, verification
`src/themes/registry.ts` (add market), `src/themes/market/geometry.test.ts` + snapshot, e2e (theme select → ย่านการค้า round starts), `docs/game/deploy.md` (`&theme=market`). Verify vitest, tsc, build, e2e; real-GPU `?demo=full&theme=market&fps=1` both tiers day/night with night shots. Commit `feat: shopping district theme`.
