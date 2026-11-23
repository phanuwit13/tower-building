# Floor Tiles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** A freestyle floor-tile layer: ~34 sculpted 1 × 1 tiles painted by tap or rectangle drag from a bottom drawer, saved with the game, shared by all themes.

**Architecture:** Tiles are kit-built models like items (validated, thumbnailed), stored per cell in `GameState.floors`, drawn as a separate merged floor layer per map chunk (no shadow casting), painted through new controller actions driven by a floor-mode input path and a DOM drawer.

**Tech Stack:** TypeScript 7, Three.js 0.187, Vite 8, Vitest, Playwright (real Chrome).

**Spec:** `docs/superpowers/specs/2026-11-23-floor-tiles-design.md`

## Global Constraints
- Branch `feat/floor-tiles` (stacked on `feat/item-animation`, PR #6). Commits end with the Co-Authored-By trailer; never push.
- `?demo=full` draw calls after Task 1 stay smooth 11 day / 13 night, pretty 40 / 42; after Task 3 the floor layer adds at most one call per floor chunk per scene pass (4 chunks), never per tile.
- Smooth tier: fully tiled map + full demo items ≥ 30 fps on a 4 GB Chromebook (proxy: Mac Chrome frame time within ~1.3× of no-floor `?demo=full`).
- Geometry fingerprint (`src/themes/school/geometry.test.ts`) passes without regeneration in every task.
- Tiles: footprint 1 × 1, tops ≤ 0.03 above ground (relief ≤ 0.05), no shadow casting, kit materials only, triangle budget 160 per tile.
- Save: v2 format; v1 saves load with no floors; unknown tile ids in a save are dropped (cell left empty), never reject the city.
- Floor painting never changes placements, the bag, fill %, or status; works while playing and after the round finished.
- `src/models/{kit,palette,validate,parts}.ts` are controller-owned: only Task 1 (kit/validate) and the controller's palette step may edit them.
- Thai UI only; touch targets ≥ 48 px; no new runtime network requests.

## Review Focus
1. A rectangle drag on touch that becomes a two-finger gesture cancels cleanly (no half-painted stroke, camera moves).
2. Painting over items' cells and then placing items keeps both visible (no z-fighting, no buried item bases).
3. An old (v1) save and a save with an unknown tile id both load the city intact.
4. Painting a 20 × 20 rectangle doesn't stall (only touched floor chunks re-merge; item chunks untouched).
5. Water tiles shimmer like the pond and stop under reduced motion.

---

### Task 1: Pack the animation attributes
**Files:** `src/models/kit.ts`, `src/models/validate.ts`, `src/render/batch.ts`, `src/models/motion.ts` (+ their tests).
**Interfaces:** attribute names stay `anim`, `pivot`, `axis` (merge and validation keep working by name); total bytes for those three ≤ 24 per vertex (was 40), e.g. Int16/Int8 normalised or packed halves — implementer's choice, decoded in the shared vertex patch. The vertex shader skips all motion maths when `anim.x == 0`.
- [ ] TDD: byte size per vertex of a body and a glow part; round-trip of extreme values (amount, speed, phase, pane hash, pivot ±GRID_SIZE after merge, unit axis) within tolerance; merged rotated placements still transform pivot/axis; validate accepts the packed types and still rejects foreign attributes.
- [ ] Implement; keep TS mirrors/parity tests green.
- [ ] Verify in Chrome: `?demo=full&fps=1` draw calls unchanged; gallery day/night screenshots match before/after visually; a tree, the flag, merry-go-round still move; report full-map vertex bytes before/after.
- [ ] Commit `perf: pack animation attributes`.

### Task 2: Floor state, save v2 and controller actions
**Files:** `src/game/types.ts`, `src/game/save.ts`, `src/game/floors.ts` (new: pure rect/paint helpers), `src/app/controller.ts` (+ tests).
**Interfaces (produces):**
- `GameState.floors: (string | null)[]` length `GRID_SIZE * GRID_SIZE`, index `z * GRID_SIZE + x`.
- `FloorRect { x0: number; z0: number; x1: number; z1: number }` (inclusive, any corner order); `normaliseRect`, `rectCells(rect): number[]`, `paintRect(floors, rect, tileId | null): (string | null)[]` (pure, new array).
- `AppState.floor: { open: boolean; pick: string | 'eraser'; tool: 'paint' | 'camera'; preview: FloorRect | null }`.
- Controller: `openFloors()`, `closeFloors()`, `pickFloor(id: string | 'eraser')` (also sets tool 'paint'), `setFloorTool(t)`, `previewFloors(r: FloorRect | null)`, `paintFloors(r: FloorRect)` (saves). `restart()` clears floors. `ControllerDeps.isFloorTile(id): boolean` for validation.
- [ ] TDD: rect normalisation/cells/paint; paint and erase; painting doesn't touch placements/bag/status; works when status 'finished'; restart clears; v1 save → floors all null; v2 round-trip; unknown tile id → that cell null, rest of the city kept; floors wrong length → floors reset to empty, city kept.
- [ ] Implement; `SAVE_VERSION = 2`, loader accepts 1 and 2.
- [ ] Commit `feat: floor tile state and save v2`.

### Task 3: Floor catalogue, floor layer rendering and the first 4 tiles
**Files:** `src/floors/types.ts`, `src/floors/index.ts` (registry: `FLOOR_TILES`, `getFloorTile(id)`, `FLOOR_GROUPS`), `src/floors/validate.ts` (tile checks), `src/floors/tiles/{wood-light,brick-red,lawn,water-shallow}.ts`, `src/render/floors.ts` (floor layer + rectangle preview), wiring in `src/main.ts`/`city` sync, `docs/game/sculpting.md` (floor-tile section) (+ tests).
**Interfaces:** `FloorGroup = 'wood' | 'tile' | 'stone' | 'earth' | 'special'` with Thai names ไม้ / ปูน-กระเบื้อง / หิน-อิฐ / ดิน-หญ้า / พิเศษ; `FloorTile { id; name; group: FloorGroup; build(kit: StyleKit): THREE.Object3D }` (same build contract as items, footprint fixed 1 × 1, centred on the cell). Floor layer: one merged mesh per map chunk (`CHUNK_TILES`), `castShadow=false`, `receiveShadow=true`, re-merges only chunks whose cells changed; tile prototypes cached. Preview: semi-transparent tiles of the picked tile (or a red outline for the eraser) over the rect, outline, and a count label (`n ช่อง`).
- [ ] TDD: every tile passes `validateFloorTile` (bounds within the cell, top ≤ 0.05, ≤ 160 triangles, kit attributes); registry ids unique, Thai names non-empty, groups valid; floor-chunk diff touches only changed chunks.
- [ ] Implement; water-shallow uses `motion: { kind: 'water', water: 'pond' }` on its surface.
- [ ] Verify in Chrome with a temporary dev hook (not committed) or the Task 2 controller: tiles under/around items, night/day, both tiers, draw calls (+≤4).
- [ ] Commit `feat: floor tile layer and first tiles`, `docs: floor tiles in the sculpting guide`.

### Task 4: Floor drawer UI and floor-mode input
**Files:** `src/ui/floorDrawer.ts` (+ test), `src/ui/hud.ts` ([พื้น] button), `src/ui/strings.ts`, `src/render/input.ts`, `src/main.ts`, styles, `e2e/floors.spec.ts`.
**Interfaces:** drawer view `{ open; group; pick; tool; tiles: { id; name; thumb }[] }`; handlers `onPick`, `onEraser`, `onTool`, `onGroup`, `onDone`. Thumbnails via the existing thumbnailer, rendered when a group is first shown. Input in floor mode + tool 'paint': pointer down → preview from that cell; move → preview rect; up → `paintFloors`; a second pointer or Escape cancels (preview null, camera takes the gesture); tap = one cell. Tool 'camera': existing camera behaviour; two-finger touch always moves the camera; wheel always zooms. While the drawer is open: item cards, หมุน/วาง and item ghost/hover hidden. เริ่มใหม่ confirm text mentions the floor.
- [ ] TDD (unit): drawer render/handlers; strings; input decision helpers (pure) for paint vs camera vs cancel.
- [ ] e2e (real Chrome): open drawer → pick a tile → drag a 3 × 4 rect → 12 cells painted (state) → reload → still there; eraser rect clears; restart clears; works after the round finished (`?demo=full`).
- [ ] Verify iPad viewport (1024 × 768) touch emulation: paint, two-finger cancel, ✋ tool orbits; console clean.
- [ ] Commit `feat: floor drawer and painting`.

### Task 5: Sculpt the remaining 30 tiles (3 parallel batches)
**Files:** `src/floors/tiles/*.ts`, `src/floors/batches/f{1,2,3}.ts` (+ tests), registry order.
Controller step first: add ≤ 4 palette colours if the sculptors need them (e.g. `asphalt`, `mud`), shown to the owner in the PR preview.
- f1 (10): wood-dark, parquet-herringbone, deck-boards, parquet-square, concrete, concrete-slabs, tile-white, tile-checker, tile-hex, tile-blue.
- f2 (10): terrazzo, asphalt, brick-herringbone, gravel, cobblestone, flagstone, stepping-stones, paver-interlock, grass-paver, dirt.
- f3 (10): mud, sand, lawn-flowers, tilled-soil, fallen-leaves, rubber-play, carpet-red, snow, hopscotch, rainbow-path.
Thai names from the spec's tile list. Same checks as Task 3; review each batch with `?gallery=floors`.
- [ ] Each batch: sculpt, tests green, gallery screenshots day/night.
- [ ] Commit per batch `feat: floor tiles batch fN`.

### Task 6: Demo floors, gallery and verification
**Files:** `src/game/demo.ts` (`?demo=full` also lays floors: paths and plazas covering the whole map with a mix of all tiles), `src/render/gallery.ts` (`?gallery=floors`), `docs/game/deploy.md` or README note if `?demo=full` changed.
- [ ] Verify: `?demo=full&fps=1` both tiers day/night — draw calls (record), frame time vs Task 1 numbers, screenshots; reduced motion; iPad viewport; `npx vitest run`, `npx tsc --noEmit`, `npm run build`, `npm run e2e`.
- [ ] Commit `feat: floors in the full demo and gallery`.
