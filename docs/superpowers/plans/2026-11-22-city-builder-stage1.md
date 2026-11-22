# City Builder — Stage 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A playable 3D city-building game in the browser with the complete School theme (≥ 40 items), all scene settings, two quality tiers, screenshot and local saving, deployed on Cloudflare.

**Architecture:** Pure TypeScript game logic (`src/game`, no Three.js, no DOM) is built test-first. A controller (`src/app`) owns app state, ghost rules and autosave, still without Three.js. Three.js rendering (`src/render`) and plain-DOM UI (`src/ui`) subscribe to the controller. Every item is code (`src/themes/<theme>/items/*.ts`) built from a shared style kit that merges each item into ≤ 2 meshes with vertex colours.

**Tech Stack:** TypeScript 7, Vite 8, Three.js 0.187 (incl. `three/addons`), Vitest 5 (+ happy-dom for UI tests), Playwright 1.65 (Chromium smoke tests), Wrangler 4 (Cloudflare Workers static assets), `@fontsource/mitr` (self-hosted Thai font). Node 22.

**Spec:** `docs/superpowers/specs/2026-11-22-city-builder-game-design.md`

## Global Constraints

- Map is a **10 × 10 tile grid**; 1 tile = 1 world unit; map spans x, z ∈ [0, 10].
- Allowed footprints: **1×1, 1×2, 2×2, 2×3** (largest 2×3); rotation in 90° steps.
- Items come from a **shuffle bag** (all items once before repeats); HUD shows **current + 1 next** item.
- Placed items **cannot be moved, removed or undone**. Round ends when the current item fits nowhere in any rotation.
- End screen text **"เมืองเสร็จแล้ว!"**; never "Game Over". **No stars, points or ranking.** End summary: **"วางไป {n} ชิ้น · ใช้พื้นที่ {p}%"**.
- Weather: **sunny, rain**. Time: **dawn, day, dusk, night**. Ground: **grass, dirt, concrete, sand, snow, wood, moon**. Cosmetic only, changeable any time, including after the round ends.
- Screenshot: PNG of the 3D view without HUD, named **`city-<theme>-<yyyy-mm-dd>.png`**; touch devices use the share sheet when file sharing is supported, otherwise download.
- Save to `localStorage` after every action; **refresh must not re-roll the current item**; save has a schema version; unreadable save → theme select, never a crash. **Restart** = new map, same theme + settings. **Clear** = delete save, back to theme select; both confirm first. Quality preference is stored separately and **survives Clear**.
- Quality tiers **สวย (pretty)** / **ลื่น (smooth)**: auto-picked, auto-drop on sustained low FPS with a notice, manual toggle.
- UI copy is **Thai only** (exact strings in Task 7); touch targets **≥ 48 px**; mouse + touch; landscape-first.
- **No runtime requests to third parties** (font is bundled); no analytics, ads or tracking; kid-safe content.
- Performance: first load **≤ ~1 MB gzipped**; **≥ 30 fps on ลื่น on a 4 GB low-end Chromebook**; 60 fps target on สวย on a normal laptop.
- Browsers: current Chrome/Edge (incl. ChromeOS), Safari iPadOS 16+, Chrome Android; **WebGL 2**.
- Do not modify the AI-workflow kit: `CLAUDE.md`, `.claude/`, `scripts/wf/`, `docs/ai-workflow/`, `.gitlab/`, `skills-lock.json`.
- Git: each part on its own feature branch in a worktree under `.claude/worktrees/`; never push `main` (the guard hook blocks it). Commit messages are Conventional Commits and end with the session's Co-Authored-By trailer.

## Review Focus

1. **Storage blocked or throwing** (Safari private mode, school policy, quota) → the game plays normally and shows the save-failed notice once; never crashes. Pinned in Task 4 and Task 8 tests and the Task 13 e2e test.
2. **Corrupt, outdated or hand-edited save** (unknown theme or item id, overlapping or out-of-bounds placements, wrong version, bad enum) → theme select; never crashes. Pinned in Task 4.
3. **Rotating the ghost at the map edge** → the ghost shifts back inside the map rather than hanging off or refusing to rotate. Pinned in Task 2 (`clampPosition`) and Task 8.
4. **Double-tap on "วาง"** on a tablet → exactly one item is placed; the next item needs a new tap to position. Pinned in Task 8.
5. **Share sheet cancelled, or file sharing unsupported** (older iPad, desktop) → cancel does nothing; unsupported falls back to download. Pinned in Task 12.

---

## File structure

```text
package.json  tsconfig.json  vite.config.ts  index.html  wrangler.jsonc  .node-version
playwright.config.ts   e2e/smoke.spec.ts
.github/workflows/ci.yml
docs/game/deploy.md                      owner steps for Cloudflare
src/
  main.ts                                boot + wiring (only place that touches document at startup)
  styles.css
  game/      pure logic, no three/DOM
    types.ts rng.ts bag.ts grid.ts game.ts save.ts simulate.ts
  app/       no three/DOM
    controller.ts quality.ts
  models/
    contract.ts palette.ts kit.ts validate.ts
  themes/
    types.ts registry.ts mix.ts placeholder.ts(removed in Task 14)
    school/index.ts  school/items/<item-id>.ts
  render/
    stage.ts environment.ts ground.ts city.ts input.ts thumbnails.ts screenshot.ts gallery.ts debug.ts
  ui/
    strings.ts dom.ts themeSelect.ts hud.ts settings.ts dialogs.ts endScreen.ts notices.ts
```

Tests sit next to their source as `*.test.ts`; UI tests start with `// @vitest-environment happy-dom`.

## Delivery parts (one branch + PR each)

| Part | Branch | Tasks | Ends with |
|---|---|---|---|
| A | `feat/stage1a-game-core` | 1–5 | PR; owner connects Cloudflare |
| B | `feat/stage1b-scene-ui` | 6–13 | PR with preview link (placeholder blocks) |
| C | `feat/stage1c-style-lock` | 14 | PR + **owner checkpoint** |
| D | `feat/stage1d-school-items` | 15–17 | PR, Stage 1 done |

"Run → FAIL / PASS" in a task means `npx vitest run <that task's test files>`.

Start each part with superpowers:using-git-worktrees: `git fetch origin && git worktree add .claude/worktrees/<part> -b <branch> origin/main`. If the previous part is not merged yet, branch from the previous part's branch instead and say so in the PR description.

---

## Part A — game core

### Task 1: Scaffold, seeded RNG and shuffle bag

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.node-version`, `src/main.ts`, `src/styles.css`, `src/game/types.ts`, `src/game/rng.ts`, `src/game/bag.ts`
- Modify: `.gitignore` (append `node_modules/`, `dist/`, `.wrangler/`, `test-results/`, `playwright-report/`)
- Commit also: the spec and this plan (`docs/superpowers/specs/…`, `docs/superpowers/plans/…`)
- Test: `src/game/rng.test.ts`, `src/game/bag.test.ts`

**Interfaces:**
- Produces: all types below (used by every later task); `nextRandom`, `randomSeed`, `shuffle`, `draw`.

```ts
// src/game/types.ts
export const GRID_SIZE = 10;
export type Rotation = 0 | 1 | 2 | 3;                    // quarter turns
export interface Footprint { w: number; d: number }      // tiles along x / z at rotation 0
export interface ItemSpec { id: string; footprint: Footprint }
export interface Catalog { themeId: string; order: readonly string[]; items: Readonly<Record<string, ItemSpec>> }
export interface Placement { uid: number; itemId: string; x: number; z: number; rotation: Rotation } // x,z = min-corner tile of the rotated footprint
export type WeatherId = 'sunny' | 'rain';
export type TimeId = 'dawn' | 'day' | 'dusk' | 'night';
export type GroundId = 'grass' | 'dirt' | 'concrete' | 'sand' | 'snow' | 'wood' | 'moon';
export type QualityTier = 'pretty' | 'smooth';
export interface SceneSettings { weather: WeatherId; time: TimeId; ground: GroundId }
export interface GameState {
  themeId: string; settings: SceneSettings; placements: Placement[];
  bag: string[];            // ids still to draw; next draw = bag[0]
  rng: number;              // uint32 PRNG state
  current: string; next: string;
  status: 'playing' | 'finished'; nextUid: number;
}
export interface FillStats { items: number; tilesUsed: number; percent: number } // percent = Math.round(tilesUsed)  (100 tiles)
```

- [ ] **Step 1: Scaffold.** `npm init -y`, then install exact current versions: deps `three @fontsource/mitr`; devDeps `typescript vite vitest @types/three happy-dom @playwright/test wrangler`. `package.json`: `"type": "module"`, `"private": true`, `"engines": {"node": ">=22.12"}`, scripts `dev: vite`, `build: tsc --noEmit && vite build`, `preview: vite preview`, `test: vitest run`, `typecheck: tsc --noEmit`, `e2e: playwright test`. `tsconfig.json`: `target ES2022`, `module ESNext`, `moduleResolution bundler`, `strict`, `noEmit`, `lib [ES2022, DOM, DOM.Iterable]`, `types ["vite/client"]`, `include ["src", "e2e", "*.ts"]`. `vite.config.ts` via `defineConfig` from `vitest/config`: `build.target 'es2022'`, `test.include ['src/**/*.test.ts']`, `test.environment 'node'`. `.node-version`: `22`. `index.html`: `<html lang="th">`, title `สร้างเมืองของฉัน`, `<div id="app"></div>`, module script `/src/main.ts`. `src/main.ts` for now only imports `@fontsource/mitr/400.css`, `@fontsource/mitr/600.css`, `./styles.css` and renders the title. If `tsc` from TypeScript 7 rejects `@types/three`, pin `typescript@~5.9` and note it in the commit.
- [ ] **Step 2: Write failing tests**

```ts
// rng.test.ts
test('nextRandom is deterministic and in [0,1)', () => {
  const a = run(nextRandom, 12345, 1000), b = run(nextRandom, 12345, 1000); // run = collect values
  expect(a).toEqual(b); expect(a.every(v => v >= 0 && v < 1)).toBe(true);
});
// bag.test.ts  (order = 40 ids 'i0'..'i39')
test('shuffle returns a permutation, same seed same result', ...);   // sorted equals order; two calls equal
test('draw empties the bag before repeating', () => { /* 40 draws from [] → 40 distinct ids; 41st draw refills (bag length 39 after it) */ });
test('draw never mutates its input bag', ...);
```

- [ ] **Step 3: Run** `npx vitest run src/game` → FAIL (modules missing).
- [ ] **Step 4: Implement** `nextRandom(state: number): { value: number; state: number }` (mulberry32), `randomSeed(): number` (`crypto.getRandomValues`), `shuffle(ids: readonly string[], rng: number): { ids: string[]; rng: number }` (Fisher–Yates), `draw(bag: readonly string[], order: readonly string[], rng: number): { id: string; bag: string[]; rng: number }` (refill with `shuffle(order)` when empty).
- [ ] **Step 5: Run** `npm test && npm run typecheck && npm run build` → all pass, `dist/index.html` exists.
- [ ] **Step 6: Commit** `feat: scaffold project with seeded rng and shuffle bag`

### Task 2: Grid logic

**Files:** Create `src/game/grid.ts`; Test `src/game/grid.test.ts`

**Interfaces:**
- Consumes: Task 1 types.
- Produces:
  - `rotatedFootprint(fp: Footprint, r: Rotation): Footprint` — odd r swaps w/d.
  - `buildOccupancy(placements: readonly Placement[], catalog: Catalog): Uint8Array` — length 100, index `z * 10 + x`.
  - `canPlace(occ: Uint8Array, fp: Footprint, r: Rotation, x: number, z: number): boolean`
  - `fitsAnywhere(occ: Uint8Array, fp: Footprint): boolean` — tries r 0 and 1.
  - `clampPosition(fp: Footprint, r: Rotation, x: number, z: number): { x: number; z: number }`
  - `nearestFreeSpot(occ, fp, r, cx: number, cz: number): { x: number; z: number } | null` — valid spot whose rotated-footprint centre is closest (squared distance) to (cx, cz); ties → smaller z, then smaller x.
  - `fillStats(placements, catalog): FillStats`

- [ ] **Step 1: Write failing tests**

```ts
expect(rotatedFootprint({ w: 2, d: 3 }, 1)).toEqual({ w: 3, d: 2 });
expect(rotatedFootprint({ w: 2, d: 3 }, 2)).toEqual({ w: 2, d: 3 });
expect(canPlace(empty, { w: 2, d: 3 }, 0, 9, 0)).toBe(false);   // off the map
expect(canPlace(empty, { w: 2, d: 3 }, 0, 8, 7)).toBe(true);    // touches both far edges exactly
expect(canPlace(occWithTile(3, 3), { w: 1, d: 1 }, 0, 3, 3)).toBe(false);
// map full except a 1×2 hole at (0,0)-(0,1):
expect(fitsAnywhere(hole, { w: 1, d: 1 })).toBe(true);
expect(fitsAnywhere(hole, { w: 1, d: 2 })).toBe(true);
expect(fitsAnywhere(hole, { w: 2, d: 2 })).toBe(false);
// map full except a 3-wide × 2-deep hole: a 2×3 item fits only rotated
expect(fitsAnywhere(hole3x2, { w: 2, d: 3 })).toBe(true);
expect(fitsAnywhere(full, { w: 1, d: 1 })).toBe(false);
expect(clampPosition({ w: 2, d: 3 }, 1, 9, 9)).toEqual({ x: 7, z: 8 });
expect(nearestFreeSpot(empty, { w: 2, d: 2 }, 0, 5, 5)).toEqual({ x: 4, z: 4 });
expect(fillStats([p('big', 0, 0), p('one', 5, 5)], cat /* big 2×3, one 1×1 */)).toEqual({ items: 2, tilesUsed: 7, percent: 7 });
```

- [ ] **Step 2: Run** `npx vitest run src/game/grid.test.ts` → FAIL.
- [ ] **Step 3: Implement** the functions above in `src/game/grid.ts`.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: add grid placement logic`

### Task 3: Game state transitions

**Files:** Create `src/game/game.ts`; Test `src/game/game.test.ts`

**Interfaces:**
- Consumes: Tasks 1–2.
- Produces:
  - `newGame(catalog: Catalog, settings: SceneSettings, seed: number): GameState` — empty map, draws current then next, `status 'playing'`, `nextUid 1`.
  - `placeCurrent(state: GameState, catalog: Catalog, x: number, z: number, r: Rotation): GameState | null` — `null` if finished or `!canPlace`; otherwise appends `{ uid: nextUid, itemId: current, x, z, rotation: r }`, `current = next`, draws a new `next`, sets `status 'finished'` when the new current fits nowhere.
  - `restartGame(state: GameState, catalog: Catalog, seed: number): GameState` — `newGame` with the same theme and settings.
  - `withSettings(state: GameState, patch: Partial<SceneSettings>): GameState`

- [ ] **Step 1: Write failing tests** — `current` and `next` are distinct ids from `order`; first placement gets `uid 1` and next becomes current; placing on an occupied tile returns `null`; a state whose map leaves no room for a 2×3 when the next current is the 2×3 item ends `'finished'`; `placeCurrent` on a finished state returns `null`; `restartGame` keeps `themeId` and `settings` and empties `placements`; same seed → same sequence of `current` ids over 10 placements.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: add game state transitions`

### Task 4: Save and load

**Files:** Create `src/game/save.ts`; Test `src/game/save.test.ts`

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces:
  - `SAVE_KEY = 'city-builder/save'`, `QUALITY_KEY = 'city-builder/quality'`, `SAVE_VERSION = 1`
  - `interface KeyValueStore { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void }`
  - `saveGame(store: KeyValueStore, state: GameState): boolean` — `false` if the store throws.
  - `loadGame(store: KeyValueStore, getCatalog: (themeId: string) => Catalog | undefined): GameState | null` — `null` when missing, throwing, unparsable, `v !== SAVE_VERSION`, unknown theme, any unknown item id (placements, bag, current, next), settings value outside its union, placement out of bounds or overlapping, bad status, non-uint32 rng, or `nextUid` ≤ the largest uid.
  - `clearGame(store: KeyValueStore): void` — removes `SAVE_KEY` only; swallows errors.
  - `loadQuality(store): QualityTier | null`, `saveQuality(store, q: QualityTier): boolean`
  - Stored JSON shape: `{ v: 1, state: GameState }`.

- [ ] **Step 1: Write failing tests** — round trip of a playing state equals the original; **round trip of a finished state stays finished**; one test per `null` case listed above (Review Focus 2); a store whose `getItem` throws → `loadGame` returns `null`; a store whose `setItem` throws → `saveGame` returns `false` (Review Focus 1); `clearGame` removes `SAVE_KEY` and leaves `QUALITY_KEY`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: add versioned local save`

### Task 5: Cloudflare config, CI and hand-off

**Files:** Create `wrangler.jsonc`, `.github/workflows/ci.yml`, `docs/game/deploy.md`

- [ ] **Step 1: `wrangler.jsonc`**

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "city-builder",                 // must equal the Worker name in the Cloudflare dashboard
  "compatibility_date": "<today, YYYY-MM-DD>",
  "assets": { "directory": "./dist" },
  "preview_urls": true
}
```

- [ ] **Step 2: Verify** `npm run build && npx wrangler deploy --dry-run` → exits 0 and lists the `dist` assets (no login needed for a dry run).
- [ ] **Step 3: CI** — `.github/workflows/ci.yml` on `pull_request` and `push` to `main`: checkout, `actions/setup-node` with Node 22 and npm cache, `npm ci`, `npm run typecheck`, `npm test`, `npm run build`.
- [ ] **Step 4: `docs/game/deploy.md`** (English): owner steps — Cloudflare dashboard → Workers & Pages → Create → Import a repository → `phanuwit13/tower-building`; Worker name **`city-builder`**; build command `npm run build`; deploy command `npx wrangler deploy`; enable builds for non-production branches (default command `npx wrangler preview`, which posts a preview URL on PRs); keep workers.dev enabled. Note: preview URLs are public; if the school network blocks `*.workers.dev`, add a custom domain under the Worker's Domains & Routes.
- [ ] **Step 5: Commit** `chore: add cloudflare deploy config and ci`
- [ ] **Step 6: Hand-off** — `git push -u origin feat/stage1a-game-core`. Tell the owner: open the PR from the link GitHub prints, connect Cloudflare following `docs/game/deploy.md`, then merge. Wait for the merge (or continue Part B stacked on this branch).

---

## Part B — scene, UI and controls (placeholder blocks)

### Task 6: Model contract, style kit core, themes registry, placeholder blocks

**Files:**
- Create: `src/models/contract.ts`, `src/models/palette.ts`, `src/models/kit.ts`, `src/models/validate.ts`, `src/themes/types.ts`, `src/themes/registry.ts`, `src/themes/placeholder.ts`, `src/themes/school/index.ts`
- Test: `src/models/validate.test.ts`, `src/themes/registry.test.ts`

**Interfaces:**
- Consumes: Task 1 types.
- Produces:

```ts
// contract.ts
export type Category = 'building' | 'nature' | 'seating' | 'food' | 'play' | 'ride' | 'animal' | 'vehicle' | 'decoration' | 'facility';
export interface ItemModel extends ItemSpec { name: string; category: Category; build(kit: StyleKit): THREE.Object3D }
// palette.ts
export const PALETTE = { /* named hex colours; Task 14 finalises ~24 */ } as const;
export type PaletteColor = keyof typeof PALETTE;
// kit.ts — parts are positioned geometries with a vertex 'color' attribute
export interface Part { geometry: THREE.BufferGeometry; glow: boolean }
type Vec3 = [number, number, number];
interface PartOpts { rotate?: Vec3; glow?: boolean }
export interface StyleKit {
  materials: { body: THREE.MeshStandardMaterial; glow: THREE.MeshStandardMaterial };
  setGlowStrength(v: number): void;                                   // 0 = off, 1 = full
  box(size: Vec3, at: Vec3, color: PaletteColor, opts?: PartOpts & { round?: number }): Part;
  cylinder(rTop: number, rBottom: number, h: number, at: Vec3, color: PaletteColor, opts?: PartOpts & { segments?: number }): Part;
  cone(r: number, h: number, at: Vec3, color: PaletteColor, opts?: PartOpts & { segments?: number }): Part;
  sphere(r: number, at: Vec3, color: PaletteColor, opts?: PartOpts & { detail?: number }): Part;
  finish(parts: Part[]): THREE.Group;   // merge non-glow parts → 1 mesh (body), glow parts → 1 mesh (glow); cast + receive shadows
}
export function getStyleKit(): StyleKit   // singleton: shared materials
// validate.ts
export function validateItemModel(m: ItemModel, kit: StyleKit): string[]
export function validateTheme(t: ThemeDef, kit: StyleKit, opts: { minItems: number }): string[]
// themes/types.ts
export type ThemeId = 'school' | 'amusement' | 'cafe' | 'village' | 'hospital' | 'zoo' | 'beach' | 'space' | 'park';
export interface ThemeDef { id: ThemeId; name: string; emoji: string; defaultGround: GroundId; items: readonly ItemModel[] }
export function toCatalog(t: ThemeDef): Catalog
// registry.ts
export const THEMES: readonly ThemeDef[];          // Stage 1: [school]
export function getTheme(id: string): ThemeDef | undefined
export function getCatalog(id: string): Catalog | undefined
```

- Body material: `MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85, metalness: 0 })`. Glow material: same, plus emissive = vertex colour × a shared uniform:

```ts
glow.onBeforeCompile = (s) => {
  s.uniforms.glowStrength = glowUniform;                        // { value: 0 }
  s.fragmentShader = 'uniform float glowStrength;\n' + s.fragmentShader.replace(
    'vec3 totalEmissiveRadiance = emissive;',
    'vec3 totalEmissiveRadiance = vColor.rgb * glowStrength * 1.5;');
};
```

- `validateItemModel` errors when: id not `/^[a-z0-9-]+$/`; empty `name`; footprint not one of 1×1, 1×2, 2×1, 2×2, 2×3, 3×2; unknown category; built object has > 2 meshes or any mesh not using `kit.materials.body`/`.glow`; bounding box outside x ∈ [−w/2, w/2], z ∈ [−d/2, d/2], y ∈ [0, 5] (tolerance 0.001); triangles > `800 + 400 × w × d`. `validateTheme` adds: duplicate ids, duplicate names, fewer than `minItems` items.
- `placeholder.ts`: `placeholderItems(): ItemModel[]` — 12 rounded blocks (ids `block-1x1-a`…, Thai names like `กล่อง 1×1`, category `decoration`): four 1×1, four 1×2, three 2×2, one 2×3. School `defaultGround: 'grass'`, `name: 'โรงเรียน'`, `emoji: '🏫'`, items = placeholders for now.

- [ ] **Step 1: Write failing tests** — a valid sample model → `[]`; a 1×1 model with a 1.2-wide box → an error containing `footprint`; a mesh with its own material → error containing `material`; a model over budget → error containing `triangles`; two items with one id → error containing `duplicate`; `registry.test.ts`: every theme in `THEMES` passes `validateTheme(t, kit, { minItems: 1 })` and `getCatalog('school')!.order.length === 12`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: add style kit, model contract and placeholder school theme`

### Task 7: Thai copy and DOM UI components

**Files:**
- Create: `src/ui/strings.ts`, `src/ui/dom.ts`, `src/ui/themeSelect.ts`, `src/ui/hud.ts`, `src/ui/settings.ts`, `src/ui/dialogs.ts`, `src/ui/endScreen.ts`, `src/ui/notices.ts`; Modify `src/styles.css`
- Test: `src/ui/hud.test.ts`, `src/ui/dialogs.test.ts`, `src/ui/endScreen.test.ts`

**Interfaces:**
- Consumes: Task 1 types, Task 6 `ThemeDef`.
- Produces:
  - `T` (all copy below), `placedLabel(n)`, `summaryLabel(s: FillStats)`, `sizeLabel(fp: Footprint)`
  - `createThemeSelect(root: HTMLElement, themes: readonly ThemeDef[], onPick: (id: ThemeId) => void): { show(): void; hide(): void }`
  - `interface ItemCard { name: string; size: string; thumb: string | null }`
  - `interface HudView { visible: boolean; current: ItemCard | null; next: ItemCard | null; placed: number; canPlace: boolean; canRotate: boolean; hint: string | null }`
  - `createHud(root, h: { onRotate(): void; onPlace(): void; onSettings(): void; onScreenshot(): void }): { update(v: HudView): void }`
  - `createSettingsPanel(root, h: { onWeather(w: WeatherId): void; onTime(t: TimeId): void; onGround(g: GroundId): void; onQuality(q: QualityTier): void; onRestart(): void; onClear(): void }): { open(cur: { settings: SceneSettings; quality: QualityTier }): void; close(): void }`
  - `confirmDialog(root, o: { message: string; confirmLabel: string }): Promise<boolean>` — cancel button uses `T.cancel`; Escape = cancel.
  - `createEndScreen(root, h: { onScreenshot(): void; onRestart(): void; onView(): void }): { show(s: FillStats): void; hide(): void }`
  - `showNotice(root, text: string, ms = 4000): void`

Exact copy (`T`):

| key | text |
|---|---|
| appTitle | สร้างเมืองของฉัน |
| pickTheme | เลือกธีมเมือง |
| current / next | ชิ้นนี้ / ชิ้นถัดไป |
| rotate / place | หมุน / วาง |
| placedLabel(n) | วางแล้ว {n} ชิ้น |
| sizeLabel | {w}×{d} ช่อง |
| hintTap | แตะพื้นเพื่อเลือกที่วาง |
| settings, screenshot, close, cancel | ตั้งค่า, ถ่ายรูป, ปิด, ยกเลิก |
| weather: title, sunny, rain | สภาพอากาศ, แดดออก, ฝนตก |
| time: title, dawn, day, dusk, night | ช่วงเวลา, เช้าตรู่, กลางวัน, หัวค่ำ, กลางคืน |
| ground: title, grass, dirt, concrete, sand, snow, wood, moon | พื้น, หญ้า, ดิน, ปูน, ทราย, หิมะ, พื้นไม้, พื้นดวงจันทร์ |
| quality: title, pretty, smooth | คุณภาพภาพ, สวย, ลื่น |
| restart / confirmRestart / confirmRestartOk | เริ่มใหม่ / เริ่มเมืองใหม่ไหม? เมืองนี้จะหายไป / เริ่มใหม่ |
| clear / confirmClear / confirmClearOk | เคลียร์ / ลบทุกอย่างแล้วกลับไปเลือกธีมไหม? / ลบเลย |
| endTitle / summaryLabel / viewCity | เมืองเสร็จแล้ว! / วางไป {n} ชิ้น · ใช้พื้นที่ {p}% / ดูเมือง |
| noticeQualityDrop | เปลี่ยนเป็นโหมดลื่น เพื่อให้เล่นได้ไม่กระตุก |
| noticeSaveFailed | เครื่องนี้บันทึกเมืองไม่ได้ ถ้าปิดหน้าเว็บ เมืองจะหายไป |
| noticeShotSaved | บันทึกรูปแล้ว |
| noWebGL | เครื่องนี้เปิดเกม 3 มิติไม่ได้ ลองเปิดด้วย Chrome หรือ Safari รุ่นใหม่ |

CSS: every `button` has `min-height: 48px; min-width: 48px`; font-family `'Mitr', sans-serif`; HUD is an overlay (`position: fixed`) so the canvas stays full-screen; settings open as a bottom sheet on narrow screens.

- [ ] **Step 1: Write failing tests** — `hud.update({..., placed: 3})` shows `วางแล้ว 3 ชิ้น`; the place button is `disabled` when `canPlace` is false; clicking rotate calls `onRotate`; `confirmDialog` resolves `true` on confirm, `false` on cancel and on Escape; end screen shows `เมืองเสร็จแล้ว!` and `วางไป 34 ชิ้น · ใช้พื้นที่ 87%` for `{ items: 34, tilesUsed: 87, percent: 87 }` and its text contains no `Game Over`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: add thai ui components`

### Task 8: Controller

**Files:** Create `src/app/controller.ts`; Test `src/app/controller.test.ts`

**Interfaces:**
- Consumes: Tasks 1–4, Task 6 registry functions.
- Produces:

```ts
export interface GhostState { x: number; z: number; rotation: Rotation; valid: boolean }
export interface AppState {
  screen: 'theme-select' | 'playing' | 'finished';
  game: GameState | null; ghost: GhostState | null;
  quality: QualityTier; saveFailed: boolean;          // saveFailed is sticky once true
}
export interface ControllerDeps {
  store: KeyValueStore; getTheme(id: string): ThemeDef | undefined; getCatalog(id: string): Catalog | undefined;
  seed(): number; detectQuality(): QualityTier;
}
export interface Controller {
  getState(): AppState; subscribe(fn: (s: AppState) => void): () => void;
  chooseTheme(id: ThemeId): void;
  tapTile(tx: number, tz: number): void; dragGhostTo(tx: number, tz: number): void;
  moveGhost(dx: number, dz: number): void; rotateGhost(): void; place(): boolean;
  setSettings(patch: Partial<SceneSettings>): void; setQuality(q: QualityTier, source: 'user' | 'auto'): void;
  restart(): void; clearAll(): void;                   // callers confirm first
}
export function createController(deps: ControllerDeps): Controller
```

Rules:
- Start: `quality = loadQuality(store) ?? detectQuality()`; `game = loadGame(...)`; screen from the game (`null` → theme-select, finished → finished).
- `chooseTheme`: `newGame(catalog, { weather: 'sunny', time: 'day', ground: theme.defaultGround }, seed())`.
- `tapTile` / `dragGhostTo` (playing only): the tapped tile becomes the footprint's centre tile — `x = tx − ⌊(w′−1)/2⌋`, `z = tz − ⌊(d′−1)/2⌋` with the ghost's current rotation (0 if none), then `clampPosition`; `valid = canPlace(...)`.
- `moveGhost`: hidden ghost → appears at `nearestFreeSpot(occ, fp, 0, 5, 5)` (or clamped centre if none); visible → shift and clamp.
- `rotateGhost`: no-op without a ghost; else rotation + 1 mod 4, re-clamp, re-validate.
- `place`: `false` without a ghost or when invalid; on success **ghost becomes `null`** (the next item needs a new tap).
- Every game change → `saveGame`; a `false` result sets `saveFailed = true`; play continues.
- `setSettings` works while playing and finished; `status` is unchanged. `setQuality` always `saveQuality`.
- `restart` → `restartGame`, ghost `null`, screen playing. `clearAll` → `clearGame`, game `null`, screen theme-select.

- [ ] **Step 1: Write failing tests**
  - empty store → `screen 'theme-select'`; store with a saved playing game → `'playing'` with the same `current`; saved finished game → `'finished'`.
  - `chooseTheme('school')` → `game.settings.ground === 'grass'` and the store has `SAVE_KEY`.
  - **double tap** (Review Focus 4): `tapTile(0,0); place(); place()` → first `true`, second `false`, `placements.length === 1`, `ghost === null`.
  - **edge rotate** (Review Focus 3): with a 2×3 current item, `tapTile(9,9)` → ghost `{ x: 8, z: 7, rotation: 0 }`; `rotateGhost()` → `{ x: 7, z: 8, rotation: 1 }`.
  - `moveGhost(1, 0)` with no ghost → ghost at the nearest free spot to the centre.
  - placing on an occupied spot → `false`.
  - **throwing store** (Review Focus 1): `chooseTheme` and `place` work, `saveFailed === true`.
  - `clearAll` leaves `QUALITY_KEY`; `restart` keeps theme and settings.
  - `setSettings({ time: 'night' })` on a finished game → saved, still `'finished'`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: add app controller with ghost rules and autosave`

### Task 9: Stage, environment and ground

**Files:** Create `src/render/stage.ts`, `src/render/environment.ts`, `src/render/ground.ts`; Modify `src/main.ts`; Test `src/render/environment.test.ts`

**Interfaces:**
- Consumes: Task 1 types, Task 6 `getStyleKit`.
- Produces:
  - `interface Stage { renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera; controls: OrbitControls; canvas: HTMLCanvasElement; setQuality(q: QualityTier): void; onFrame(cb: (dtMs: number, nowMs: number) => void): void; renderNow(): void }`
  - `createStage(container: HTMLElement, q: QualityTier): Stage`
  - `interface EnvPreset { sky: number; fog: number; fogNear: number; fogFar: number; hemiSky: number; hemiGround: number; hemiIntensity: number; sunColor: number; sunIntensity: number; sunDir: [number, number, number]; glowStrength: number; stars: boolean }`
  - `envPreset(time: TimeId, weather: WeatherId): EnvPreset` (pure)
  - `createEnvironment(stage: Stage, kit: StyleKit): { apply(s: SceneSettings, q: QualityTier): void }` (rain animates via `stage.onFrame`)
  - `createGround(stage: Stage): { setGround(g: GroundId, wet: boolean): void }`

Decisions: camera `PerspectiveCamera(40, aspect, 0.1, 200)` at (16, 13, 16) looking at (5, 0, 5); `OrbitControls` target (5, 0, 5), `enablePan false`, distance 8–26, polar angle 0.25–1.25 rad, damping on, touches `{ ONE: ROTATE, TWO: DOLLY_ROTATE }`. Renderer `antialias: true`, sRGB output, ACES filmic tone mapping, shadows on. Pretty: pixel ratio `min(devicePixelRatio, 2)`, `PCFSoftShadowMap` 2048, `EffectComposer` (render target `samples: 4`) with `RenderPass → GTAOPass → UnrealBloomPass(0.5, 0.4, 0.85) → OutputPass`. Smooth: pixel ratio 1, `PCFShadowMap` 1024, no composer. Resize with a `ResizeObserver` on the container. Preset rules: `glowStrength` night 1, dusk 0.6, dawn 0.3, day 0; `stars` only at night; rain multiplies `sunIntensity` by 0.5, `hemiIntensity` by 0.7 and `fogFar` by 0.6 and greys the sky. Rain is `LineSegments` falling at 18 units/s in a 14 × 12 × 14 box over the map: 2,500 drops (pretty), 500 (smooth). Ground: 10 × 10 map plane (receives shadows) + faint grid lines (opacity 0.25) + a darker surround plane; colour table `GROUND_COLORS: Record<GroundId, number>`; wet → colour × 0.85. Exact colours and light values are the builder's call.

- [ ] **Step 1: Write failing tests** — `envPreset('night','sunny').glowStrength === 1`; `envPreset('day','sunny').glowStrength === 0`; `envPreset('day','rain').sunIntensity < envPreset('day','sunny').sunIntensity`; `stars` is true only for night.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement**, and make `main.ts` mount the stage with ground + environment (default settings).
- [ ] **Step 4: Verify** — `npm test` passes; `npm run dev`, open in Chrome: the 10 × 10 ground with grid lines and lighting is visible, orbit/zoom work, no console errors. Temporarily switch presets from the console to check all 4 times × 2 weathers.
- [ ] **Step 5: Commit** `feat: add 3d stage, lighting presets, rain and ground`

### Task 10: City view, ghost and input

**Files:** Create `src/render/city.ts`, `src/render/input.ts`; Modify `src/main.ts`

**Interfaces:**
- Consumes: Task 8 `Controller`/`AppState`, Task 9 `Stage`, Task 6 kit + registry.
- Produces:
  - `createCityView(stage: Stage, kit: StyleKit, getTheme: (id: string) => ThemeDef | undefined): { sync(s: AppState): void }`
  - `attachInput(stage: Stage, c: Controller): () => void`

Decisions:
- Build each item once per id (`item.build(kit)`) and `clone()` per placement (geometry shared).
- **Placement transform:** with `{ w: w′, d: d′ } = rotatedFootprint(fp, r)`, `object.position.set(x + w′/2, 0, z + d′/2)` and `object.rotation.y = −r · π/2`.
- Ghost: clone of the current item with a translucent material (opacity 0.55, `depthWrite false`), green `0x4caf50` when valid / red `0xe53935` when invalid, a footprint outline on the ground, and a sprite above it showing ✓ or ✗ (canvas texture).
- Picking: raycast to the plane y = 0 → tile `(⌊px⌋, ⌊pz⌋)` if within 0–9.
- Pointer: a press that starts on the ghost's footprint drags the ghost (`controls.enabled = false` until release, `dragGhostTo` on move); any other press orbits; a release within 6 px and 400 ms of the press is a tap → `tapTile`.
- Keyboard (on `document`, ignored when the target is a button or input): arrows → `moveGhost(±1)`; `r` → `rotateGhost`; Enter/Space → `place`.

- [ ] **Step 1: Implement** and wire `controller.subscribe(cityView.sync)` in `main.ts`, with a temporary auto-pick of the school theme.
- [ ] **Step 2: Verify** in `npm run dev`: tapping a tile shows the ghost centred on it; dragging the ghost moves it without orbiting; dragging elsewhere orbits; rotation at the edge stays inside the map; overlapping shows red ✗; keyboard works; in DevTools device mode (iPad, touch) tap/drag/pinch behave the same. No console errors.
- [ ] **Step 3: Commit** `feat: add city view, ghost preview and input`

### Task 11: Quality tiers and FPS overlay

**Files:** Create `src/app/quality.ts`, `src/render/debug.ts`; Modify `src/render/stage.ts`, `src/render/environment.ts`; Test `src/app/quality.test.ts`

**Interfaces:**
- Produces:
  - `detectTier(info: { userAgent: string; hardwareConcurrency?: number; deviceMemory?: number; maxTouchPoints?: number }): QualityTier` — `'smooth'` if the UA matches `/Android|iPhone|iPad|Mobile|CrOS/`, or `/Macintosh/` with `maxTouchPoints > 1` (iPadOS), or `deviceMemory ≤ 4`, or `hardwareConcurrency ≤ 4`; else `'pretty'`.
  - `class FpsMonitor { constructor(o?: { minFps?: number; windowMs?: number }); sample(nowMs: number): 'ok' | 'drop'; reset(): void }` — defaults 30 fps / 5000 ms; returns `'drop'` once when the average over a full window is below `minFps`; a gap > 1000 ms between samples (tab hidden) restarts the window.
  - `attachFpsOverlay(stage: Stage, getTier: () => QualityTier): void` — shown only when the URL has `?fps=1`; displays fps + tier in a corner (used for the school-device test).

- [ ] **Step 1: Write failing tests** — ChromeOS UA → smooth; iPadOS desktop UA with `maxTouchPoints 5` → smooth; desktop with 8 cores and 8 GB → pretty; `deviceMemory 4` → smooth; 20 fps for 5 s → `'drop'` exactly once; 60 fps for 30 s → never `'drop'`; a single 3 s gap does not trigger `'drop'`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** and make `environment.apply` respect the tier's rain count.
- [ ] **Step 4: Run** → PASS; in the browser, switching tiers at runtime changes shadows/effects without reload.
- [ ] **Step 5: Commit** `feat: add quality tiers and fps overlay`

### Task 12: Screenshot and item thumbnails

**Files:** Create `src/render/screenshot.ts`, `src/render/thumbnails.ts`; Test `src/render/screenshot.test.ts`

**Interfaces:**
- Produces:
  - `screenshotFilename(themeId: string, d: Date): string` — local date, e.g. `city-school-2026-01-05.png`
  - `captureCanvas(stage: Stage): Promise<Blob>` — `stage.renderNow()` then `canvas.toBlob(…, 'image/png')` in the same task (the drawing buffer is not preserved).
  - `interface ShareEnv { isTouch: boolean; canShare?: (d: ShareData) => boolean; share?: (d: ShareData) => Promise<void>; download(blob: Blob, name: string): void }`
  - `deliverImage(blob: Blob, name: string, env: ShareEnv): Promise<'shared' | 'downloaded' | 'cancelled'>` — share only when `isTouch && canShare?.({ files: [file] })`; `AbortError` → `'cancelled'` (no download); any other share error → download.
  - `createThumbnailer(kit: StyleKit): { get(item: ItemModel): string }` — own 128 × 128 renderer (`preserveDrawingBuffer: true`), fixed 3/4 camera framing the item's bounding box, PNG data URL cached by id.

- [ ] **Step 1: Write failing tests** (Review Focus 5) — filename for `new Date(2026, 0, 5)` and `'school'`; touch + `canShare` true → `share` called, result `'shared'`; share rejects with `DOMException('', 'AbortError')` → `'cancelled'` and `download` not called; share rejects with another error → `'downloaded'`; non-touch → `'downloaded'` even when `canShare` is true; `canShare` missing → `'downloaded'`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: add screenshot delivery and item thumbnails`

### Task 13: Full wiring, WebGL check and smoke tests

**Files:** Modify `src/main.ts`, `.github/workflows/ci.yml`; Create `playwright.config.ts`, `e2e/smoke.spec.ts`

- [ ] **Step 1: Wire `main.ts`:** no WebGL 2 → show only `T.noWebGL`. Otherwise create kit, stage, ground, environment, city view, input, thumbnailer, theme select, HUD, settings, end screen and controller (`store = window.localStorage` wrapped so that merely accessing it cannot throw); subscribe to update screens, HUD (`hint = T.hintTap` while there is no ghost), environment/ground (wet when raining), quality; show `T.noticeSaveFailed` once when `saveFailed` flips; restart/clear go through `confirmDialog`; `FpsMonitor` `'drop'` while pretty → `setQuality('smooth', 'auto')` + `T.noticeQualityDrop`; screenshot → `captureCanvas` → `deliverImage` (download notice `T.noticeShotSaved`); end screen "ดูเมือง" hides the dialog and keeps camera/settings usable.
- [ ] **Step 2: Playwright** — `playwright.config.ts`: Chromium only, `webServer: npm run build && npm run preview -- --port 4173`. Tests:
  - `place survives reload`: pick โรงเรียน, press ArrowRight then Enter → HUD shows `วางแล้ว 1 ชิ้น`; remember the current item's name; reload → still `วางแล้ว 1 ชิ้น` and **the same current item name**.
  - `storage blocked still playable` (Review Focus 1): `addInitScript` makes `Storage.prototype.setItem` throw; pick theme, place one item → `วางแล้ว 1 ชิ้น` and the `noticeSaveFailed` text is visible.
  - `clear returns to theme select`: ตั้งค่า → เคลียร์ → ลบเลย → the theme picker is visible and `localStorage.getItem('city-builder/save')` is `null`.
- [ ] **Step 3: CI** — add `npx playwright install --with-deps chromium` and `npm run e2e` after the build step.
- [ ] **Step 4: Verify** — `npm test`, `npm run typecheck`, `npm run e2e` pass; `npm run build` output sums to ≤ 1 MB gzipped (JS + CSS + fonts). Manual pass in Chrome desktop and DevTools iPad mode: full round with placeholders to the end screen, all settings, both tiers, screenshot, refresh mid-round and after the end.
- [ ] **Step 5: Commit** `feat: wire game screens and add smoke tests`
- [ ] **Step 6: Hand-off** — push `feat/stage1b-scene-ui`; owner opens the PR, checks the Cloudflare preview link, merges.

---

## Part C — style lock

### Task 14: Master palette, first six School items, gallery → owner checkpoint

**Files:**
- Modify: `src/models/palette.ts` (final master palette, ~24 named colours shared by all themes), `src/models/kit.ts` (only if a helper is missing), `src/themes/school/index.ts`
- Create: `src/themes/school/items/{tree,bench,street-lamp,flagpole,swing-set,classroom}.ts`, `src/render/gallery.ts`
- Delete: `src/themes/placeholder.ts`

**Interfaces:**
- Consumes: Task 6 contract/kit.
- Produces: `src/themes/school/items/<id>.ts` each `export const item: ItemModel`; `attachGallery(stage, kit, theme)` shown when the URL has `?gallery=<themeId>` (all items in rows with Thai labels, for reviewing).

The six items cover every footprint and a glow part: `tree` ต้นไม้ 1×1 nature; `bench` ม้านั่ง 1×2 seating; `street-lamp` เสาไฟ 1×1 decoration (glowing lamp); `flagpole` เสาธง 1×1 decoration; `swing-set` ชิงช้า 2×2 play; `classroom` อาคารเรียน 2×3 building (glowing windows).

- [ ] **Step 1: Sculpt** the six items with the kit; `registry.test.ts` (unchanged, `minItems: 1`) and `validate` must pass: `npm test` → PASS.
- [ ] **Step 2: Verify** in the browser: `?gallery=school` and a real round, in day/dawn/dusk/night × sunny/rain, both tiers; capture screenshots of each for the owner.
- [ ] **Step 3: Commit** `feat: add master palette and first school items`
- [ ] **Step 4: Hand-off + CHECKPOINT (stop here)** — push `feat/stage1c-style-lock`. Ask the owner to:
  1. approve the look from the preview link and screenshots (**style lock**);
  2. open the preview with `?fps=1` on a real school device **through the school network**, play a round on ลื่น, and report the fps and whether the page opened at all.
  - fps < 30 on ลื่น → tighten budgets before Part D (triangle formula in `validate.ts`, shadow map size, pixel ratio) and re-check.
  - page blocked → owner adds a custom domain (`docs/game/deploy.md`).
  - Part D starts only after the owner approves.

---

## Part D — complete the School theme

### Task 15: Footprint mix tuned by simulation

**Files:** Create `src/game/simulate.ts`, `src/themes/mix.ts`, `docs/game/items-school.md`; Test `src/game/simulate.test.ts`

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces:
  - `type Placer = (s: GameState, c: Catalog) => { x: number; z: number; rotation: Rotation } | null`
  - `randomPlacer(seed: number): Placer` — uniformly random valid spot.
  - `planningPlacer: Placer` — greedy: maximise the number of footprint edge cells touching the map border or occupied tiles; ties → smaller z, then x, then rotation.
  - `FootprintMix` is defined in `simulate.ts`; `mix.ts` imports it.
  - `simulateRounds(c: Catalog, p: Placer, rounds: number, seed: number): { meanFill: number; p10Fill: number; meanItems: number }`
  - `catalogFromMix(mix: FootprintMix): Catalog` with `type FootprintMix = Record<'1x1' | '1x2' | '2x2' | '2x3', number>`
  - `src/themes/mix.ts`: `export const DEFAULT_MIX: FootprintMix` (start `{ '1x1': 16, '1x2': 12, '2x2': 8, '2x3': 4 }`, tune until the test passes; total ≥ 40).

- [ ] **Step 1: Write the failing test** — with `catalogFromMix(DEFAULT_MIX)`, 500 rounds each, fixed seeds: `planning.meanFill ≥ 80`; `random.meanFill ≤ planning.meanFill − 10`; `planning.p10Fill ≥ 60`.
- [ ] **Step 2: Run** → see whether it fails; **Step 3: implement**, then adjust `DEFAULT_MIX` (not the thresholds) until it passes. If no mix of allowed footprints reaches the targets, stop and report to the owner — that is a rules question.
- [ ] **Step 4: Write `docs/game/items-school.md`** — the full School list (≥ 40 rows: id, Thai name, footprint, category) matching `DEFAULT_MIX`, including the six existing items; kid-safe and school-themed (classrooms, library, canteen stalls, sports field pieces, trees, playground, bicycles, flower beds, etc.).
- [ ] **Step 5: Commit** `feat: tune item footprint mix by simulation`

### Task 16: Sculpt the remaining School items

**Files:** Create `src/themes/school/items/<id>.ts` for every remaining row of `docs/game/items-school.md`; Modify `src/themes/school/index.ts`, `src/themes/registry.test.ts`

- [ ] **Step 1: Tighten the test** — in `registry.test.ts`, School must pass `validateTheme(t, kit, { minItems: 40 })` and its footprint counts (rotation-normalised) must equal `DEFAULT_MIX`. Run → FAIL.
- [ ] **Step 2: Sculpt in parallel** — dispatch subagents in batches of ~8 items. Each gets: the spec §2 look and feel, the model contract (Task 6), the master palette, the six approved items as style references, and its rows from `items-school.md`. Each batch must pass `npx vitest run src/themes src/models`.
- [ ] **Step 3: Review** every batch in `?gallery=school` (day and night); send back anything off-style.
- [ ] **Step 4: Run** `npm test` → PASS.
- [ ] **Step 5: Commit per batch** `feat: add school items <batch>`

### Task 17: Performance pass and Stage 1 sign-off

**Files:** Modify `src/render/debug.ts` (add `?demo=full`), plus any tuning in `stage.ts` / `environment.ts`

- [ ] **Step 1:** `?demo=full` fills the map with a valid packing of random School items (dev aid for measuring).
- [ ] **Step 2: Measure** with `?demo=full&fps=1`: Chrome DevTools CPU 4× slowdown on ลื่น must stay ≥ 30 fps; normal speed on สวย ≈ 60 fps. Tune shadow map size, pixel ratio or GTAO settings if not.
- [ ] **Step 3: Verify** — `npm test`, `npm run typecheck`, `npm run e2e` pass; build ≤ 1 MB gzipped; manual full round on desktop Chrome and DevTools iPad mode.
- [ ] **Step 4: Commit** `perf: tune quality tiers for a full map`
- [ ] **Step 5: Hand-off** — push `feat/stage1d-school-items`; owner reviews the preview (optionally re-tests on the school device with `?fps=1`) and merges. Stage 1 is done.

---

**Not in this plan (Stage 2):** the other 8 themes (one PR each, `DEFAULT_MIX`, master palette), the space sky that is always starry, and the meteor shower that replaces rain in the space theme.
