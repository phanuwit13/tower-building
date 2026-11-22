# Item Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** GPU-driven item animation (wind sway, flag wave, water shimmer, rotating/swinging parts), animated night lights, a moon, moonlit pond and glowing pool — with draw calls unchanged.

**Architecture:** Per-vertex animation attributes written by the style kit, merged and transformed by the chunk batcher, interpreted by patched shaders of the two shared kit materials using shared uniforms advanced once per frame.

**Tech Stack:** TypeScript 7, Three.js 0.187 (`onBeforeCompile` shader patches), Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-23-item-animation-design.md`

## Global Constraints
- Draw calls with `?demo=full` unchanged (smooth ≈ 11, pretty ≈ 40); ≥ 30 fps on smooth on a 4 GB Chromebook.
- Every body and glow geometry carries exactly the same attribute set (zero defaults) so chunk merges never mismatch; `pivot` transforms as a position, `axis` as a direction.
- One shared uniform object (`uTime`, `uWind`, `uMotion`, `uNight`) advanced once per frame by the stage; thumbnails render with time frozen.
- Blinking ≤ 3 Hz; `prefers-reduced-motion: reduce` → `uMotion` 0 (lights may stay steady-on).
- Shadows stay static: animation never sets `shadowMap.needsUpdate`.
- Item positions/colours unchanged: the geometry fingerprint test (`src/themes/school/geometry.test.ts`) must keep passing without regeneration unless a task says otherwise.
- `src/models/{kit,palette,validate,parts}.ts` are controller-owned: only tasks that name them may edit them.
- Thai UI only; no new UI copy needed. Commits end with the Co-Authored-By trailer; never push.

## Review Focus
1. A chunk containing animated and non-animated items merges without errors and animates correctly after item rotation (pivot/axis transformed).
2. Reduced-motion users see no sway/spin/blink.
3. Thumbnails and gallery don't freeze or drift oddly (shared time uniform).
4. Swaying crowns near chunk/frustum edges don't pop (bounding margin).
5. Night lights don't strobe (≤ 3 Hz) and the pond doesn't become a bright glowing disc again.

---

### Task 1: Animation core (kit attributes, motion shader, batching, uniforms)
**Files:** Modify `src/models/kit.ts`, `src/models/validate.ts` (accept the new attributes), `src/render/batch.ts`, `src/render/stage.ts`, `src/render/thumbnails.ts`; Create `src/models/motion.ts` (shared uniforms + shader chunks), tests in `src/models/motion.test.ts`, `src/models/kit.test.ts`, `src/render/batch.test.ts`.
**Interfaces (produces):**
- `PartOpts.motion?: { kind: 'sway' | 'wave' | 'spin' | 'swing' | 'water'; pivot?: Vec3; axis?: Vec3; amount?: number; speed?: number; water?: 'pond' | 'pool' }`
- Vertex attributes on every prepared part: `anim` (vec4: kind code, amount, speed, phase offset), `pivot` (vec3), `axis` (vec3); zeros = static.
- `motionUniforms: { uTime: {value:number}; uWind: {value:number}; uMotion: {value:number}; uNight: {value:number} }` exported from `motion.ts`; both kit materials use it via `onBeforeCompile`.
- `advanceMotion(dtMs: number)` called once per frame by the stage; `setWind(w)`, `setNight(n)`, `setReducedMotion(b)` used by environment/main.
- `mergeItems` transforms `pivot` (position) and `axis` (direction, normalised) per placement; merged bounding spheres +0.3 margin.
**Steps:** TDD: attribute presence/defaults for static and animated parts; kind codes; merge of mixed static/animated items succeeds; a rotated placement rotates pivot/axis; validate accepts anim/pivot/axis and still rejects foreign attributes. Implement vertex shader motion: sway (bend proportional to height above pivot along wind direction, phase from world pivot), wave (ripple along the cloth's length from the pole), spin (rotate around axis through pivot at speed), swing (sinusoidal angle around axis), water (no vertex motion; flag for fragment). Stage advances time; `matchMedia('(prefers-reduced-motion: reduce)')` → `uMotion` 0 with live updates. Thumbnails: freeze time while rendering. Verify in real Chrome with a temporary DEV test item (not committed) that sway/spin/swing animate and shadows stay static; draw calls unchanged with `?demo=full`. Commit `feat: GPU animation attributes and motion shader`.

### Task 2: Animated lights
**Files:** Modify `src/models/kit.ts` (glow `light` option → `anim` light codes on glow parts), `src/models/motion.ts` (glow fragment patch), tests.
**Interfaces:** `PartOpts.light?: 'steady' | 'breathe' | 'blink' | 'window'` (glow parts only; default steady). Glow intensity = existing `glowStrength` × pattern(time, phase): breathe 0.65–1.0 over ~3 s; blink on/off at ≤ 1 Hz; window steady with a per-pane brightness variation of ±15 % from the world pivot hash. `uMotion` 0 → patterns hold at 1.0 (steady).
**Steps:** TDD the pattern functions as pure TS mirrors (same maths as GLSL) incl. the ≤ 3 Hz bound; implement shader; verify night/dusk in Chrome. Commit `feat: breathing, blinking and window lights`.

### Task 3: Moon, moonlit pond and glowing pool
**Files:** Modify `src/render/environment.ts` (+ test), `src/models/motion.ts` (water fragment patch), tests.
**Interfaces:** moon = emissive disc + halo on the night light direction, elevation chosen so it is visible near the top of the default view; visibility: night 1, dusk/dawn ~0.35, day 0, rain 0. Water (`motion.kind 'water'`): day shimmer = slow moving highlight bands; night `pond` = sparse silver glints (no whole-surface glow); night `pool` = soft cyan emissive glow + shimmer. `envPreset` gains `moon: number` (pure, tested).
**Steps:** TDD envPreset moon values; implement moon and water shading; verify day/dusk/night × sunny/rain screenshots, both tiers, with a scratch water quad if needed before Task 4. Commit `feat: moon, moonlit pond and glowing pool`.

### Task 4: Retrofit School items, docs and verification
**Files:** Modify the School items listed in the spec's goals table (add `motion` / `light` options only — positions/colours unchanged), `docs/game/sculpting.md` (animation section: options, pivots/axes conventions, examples, safety rules), maybe `src/render/gallery.ts` (animation on in gallery). The geometry fingerprint must still pass unchanged.
**Steps:** add options to: tree, banana-tree, coconut-palm, flower-planter, flower-garden, vegetable-garden (sway); flagpole (wave); fish-pond (water pond), swimming-pool (water pool); merry-go-round (spin), swing-set (swing), seesaw (swing); street-lamp and canteen lamps (breathe); bus-stop sign and school-bus roof markers (blink); building panes (window). Verify in real Chrome: gallery day/night, a full `?demo=full&fps=1` map (draw calls unchanged, fps), reduced-motion emulation, iPad viewport; console clean; `npx vitest run`, `npx tsc --noEmit`, `npm run build`, `npm run e2e`. Commit `feat: animate the school items` and `docs: animation in the sculpting guide`.
