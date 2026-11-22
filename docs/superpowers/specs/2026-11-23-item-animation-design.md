# Item Animation, Moon and Night Water — Design

Date: 2026-11-23 · Status: approved by the owner · Builds on: `2026-11-22-city-builder-game-design.md` (Stage 1, merged)

## Intent
Make the school city feel alive: plants sway in the wind, flags wave, water shimmers, rides move, lights breathe and blink at night, a moon hangs in the night sky, the pond catches moonlight and the pool glows. It must stay smooth on 4 GB school Chromebooks and must be ready before Stage 2, so the ~400 new items can carry animation from the start.

## Goals (owner-approved)
| Kind | School items | Behaviour |
|---|---|---|
| Wind sway | tree, banana-tree, coconut-palm, flower-planter, flower-garden, vegetable-garden | crowns/leaves/flowers bend gently; trunks/bases stay; each instance out of phase |
| Flag wave | flagpole | the flag cloth ripples |
| Water shimmer | fish-pond, swimming-pool | slow moving highlights on the surface |
| Moving parts | merry-go-round (slow spin), swing-set (swing), seesaw (rock) | rigid rotation about a pivot |
| Light: breathe | street-lamp, canteen lamps | brightness rises/falls slowly |
| Light: blink | bus-stop sign, school-bus roof markers | slow on/off |
| Light: windows | buildings with glass windows | steady, each pane slightly different brightness |
| Moon | night sky (faint at dusk/dawn) | full moon with soft halo (bloom on pretty); hidden when raining |
| Pond at night | fish-pond | silver moonlight glints on the water — not a whole-surface glow (the owner asked for darker night water earlier) |
| Pool at night | swimming-pool | water glows soft cyan like underwater lights |

Additions (controller calls, owner-visible): rain makes the wind stronger; light animation only shows when lights are on (dusk/night); blinking never faster than 3 Hz; `prefers-reduced-motion` reduces all motion to (near) zero; ground shadows stay static (no per-frame shadow redraw). "Chase" lights are kept for the Stage 2 amusement-park theme.

## Non-goals
Planar/mirror reflections; walking characters; per-frame shadow updates; sound.

## Approach (chosen)
**GPU-only animation.** All motion and light patterns are computed in the vertex/fragment shaders of the two shared kit materials from per-vertex attributes plus a few shared uniforms. Alternatives rejected: CPU-animated separate meshes (adds draw calls, breaks the Stage 1 chunk batching that brought smooth to ~11 draw calls); mirror reflections (doubles the scene render).

## Decided parts of the how
- **Attribute contract (uniform across every body and glow geometry, zero = no animation):** `anim: vec4` (kind, amount, speed, phase offset), `pivot: vec3` (item-space point the motion is about; a position), `axis: vec3` (rotation/bend axis; a direction). `kit.prepare`/`finish` always emit them so merges never mismatch. `src/render/batch.ts` `mergeItems` transforms `pivot` as a position and `axis` as a direction with each placement matrix.
- **Shared uniforms** on both kit materials (one object, advanced once per frame by the stage, so gallery and thumbnails stay consistent): `uTime`, `uWind` (rain → higher), `uMotion` (0 when reduced motion), `uNight` (0 day → 1 night). Thumbnails render with time frozen.
- **Per-instance variety** comes from a phase derived from the world-space pivot in the shader, so identical items don't move in lockstep.
- **Kit API for sculptors:** `PartOpts.motion?: { kind: 'sway' | 'wave' | 'spin' | 'swing' | 'water'; pivot?: Vec3; axis?: Vec3; amount?: number; speed?: number; water?: 'pond' | 'pool' }`; glow parts add `light?: 'steady' | 'breathe' | 'blink' | 'window'` (default steady). Documented in `docs/game/sculpting.md` with examples.
- **Moon:** one emissive disc (+ halo) in the sky dome on the night light direction, low enough to be seen at the top of the default view; visible at night, faint at dusk/dawn, hidden in rain.
- **Culling:** merged chunk bounding spheres get a small margin for sway.
- **Verification:** draw calls with `?demo=full` unchanged (smooth ≈ 11); fps unchanged; screenshots/short recordings day and night; geometry fingerprint test still passes (positions/colours unchanged).

## Left to the builder
Exact amplitudes/speeds (gentle by default), shader maths, moon size/position, glint pattern, pool glow colour within the palette's spirit.
