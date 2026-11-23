# Café Theme (Stage 2, theme 5) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** The ร้านคาเฟ่ theme (theme id `cafe`) with 60 owner-approved items, as an indoor room: low walls with windows and a glass door round the map, a pavement outside, rain only outside, a bright warm night.

**Architecture:** The generic theme pipeline (as zoo/beach/market) plus one engine addition: `ThemeDef.indoor`, which shows a built-in room shell (`src/render/room.ts`), turns the land round the map into a pavement, keeps the floor dry and keeps the rain outside the walls.

**Tech Stack:** TypeScript 7, Three.js 0.187, Vite 8, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-22-city-builder-game-design.md` (Stage 2, §4 content rules, owner changes) + item list `docs/game/items-cafe.md` (owner-approved 2026-11-24; its "The room", "no wind indoors" and content-rules sections are binding).

## Global Constraints
- Branch `feat/theme-cafe`. Commits end with the Co-Authored-By trailer; commit path-limited (`git commit -- <paths>`); never push.
- Item rules: `docs/game/sculpting.md`. Footprints, ids, Thai names, categories and batches exactly as `docs/game/items-cafe.md`. No wind motion (`sway`, `wave`) on any café item. Signs and menus are pictures, never text.
- School, amusement, zoo, beach and market unchanged: their geometry snapshots pass without regeneration; with `indoor` unset nothing about their scene changes (no walls, same surround colour, same rain, same wet floor).
- The room never takes a cell and never blocks a tap: tile picking is plane maths at y = 0 and stays so.
- The room is cheap: at most 3 extra draw calls (body, glow, glass) on both tiers; 60 fps on the Mac real-GPU headless check with `?demo=full&theme=cafe`.
- Owner rules for browser checks: Playwright's bundled headless Chromium only (no `channel`; `--use-angle=metal --ignore-gpu-blocklist --enable-gpu` for real-GPU numbers), one launch per script, never headed, never the real Chrome app or chrome-devtools MCP, never `pkill`; no per-item sweeps.

## Review Focus
1. From the default camera the walls never hide the near cells: the base is low, the panes above it are see-through, and items placed on the edge rows stay visible and tappable.
2. In rain, no drop falls inside the walls, the floor inside is never darkened as wet, and the pavement outside is.
3. At night the café reads warm and bright, never blown out (the big panes must not glow).
4. Other themes look exactly as before (no room, same ground, same rain).
5. Saved cities of the other five themes still load; theme select works for all six.

---

### Task 1: Café scaffold
`src/themes/types.ts` (`ThemeDef.indoor?: boolean`), `src/themes/cafe/{info.ts, index.ts, index.test.ts, batches/k1..k7.ts (+ tests), batches/batch.test-helper.ts}` (empty batches; NOT in `THEMES`), `src/themes/mix.ts` (`CAFE_MIX` 19/17/14/10) + `src/game/simulate.test.ts`, `docs/game/items-cafe.md`. Theme: id `cafe`, ร้านคาเฟ่, emoji ☕, defaultGround `wood`, `nightGlow` 1.5 (raised to 1.75 in Task 2's look round: 2 washed out the pretty dusk), `indoor: true`.
- [ ] Commit `feat: café scaffold`.

### Task 2: The room shell (indoor themes)
`src/render/room.ts` (+ test): `createRoom(stage, kit): { setShown(on: boolean): void }`, built once with the style kit (`getStyleKit()`, `kit.finish`) plus one transparent glass mesh; walls stand just outside the grid (inner face on x/z = 0 and 20), from the pavement (y = −0.25) to about 1.3; a solid base to about 0.4 above the floor with a trim, glass panes above in frames with posts, warm wall lamps that glow at night, a two-leaf glass door centred on the +x wall with an awning, a step and a mat outside. (As built after the look round: a teal base and cap, white frames, flower boxes outside on +x/+z, a row of warm bulbs on the cap, the door leaves standing open onto the pavement in red frames under a round coffee-cup sign, and no awning — from the steep default camera a closed door is edge-on and an awning hid it.) `src/render/ground.ts` (indoor: the surround is a paved pavement in its own colour, wet in rain; the floor never wet), `src/render/environment.ts` (rain skips drops inside the walls, in the shader), `src/main.ts` (the shown theme's `indoor` drives the room, ground and rain; the gallery and batch galleries too). Room shown → shadows invalidated.
- [ ] Commit `feat: an indoor room for the café: walls, a glass door, rain only outside`.

### Tasks 3–9: Sculpt batches k1 … k7 (parallel, disjoint files)
Commit per batch `feat: café batch kN`.

### Task 10: Register the theme, snapshot, verification
`src/themes/registry.ts` (add cafe after market), `src/themes/registry.test.ts`, `src/themes/cafe/geometry.test.ts` + snapshot, e2e (theme select → ร้านคาเฟ่ round starts; rain stays outside), `docs/game/deploy.md` (`&theme=cafe`). Verify vitest, tsc, build, e2e; real-GPU `?demo=full&theme=cafe&fps=1` both tiers day/night/rain shots. Commit `feat: café theme`.
