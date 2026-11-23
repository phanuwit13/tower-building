# Sculpting items: the guide

Read this before you sculpt an item. Every item in every theme is built in code from the style kit, so all 9 themes look like one game. The six approved School items (the "style lock") are the reference for scale, colour and detail; match them.

## 1. What you write, and what you never touch

- One item = one file: `src/themes/<theme>/items/<item-id>.ts`, exporting `item: ItemModel` (see `src/models/contract.ts`). The theme lists its items in `src/themes/<theme>/index.ts`; your task brief says who edits that file.
- An item is `{ id, name, category, footprint: { w, d }, build(kit) }`. `build` returns `kit.finish(parts)`, where `parts` comes from kit primitives (§3) and shared building parts (§4).
- **Never edit** `src/models/kit.ts`, `palette.ts`, `validate.ts` or `parts.ts`. They are controller-owned and shared by everyone sculpting in parallel. If you need a new primitive, colour, helper or option, stop and ask the controller.
- Name your numbers. Put sizes and positions in named constants at the top of the file (`const SEAT_Y = 0.31;`, `const WIN = { w: 0.3, h: 0.32 };`), as the approved items do. Comment anything that is not obvious.

## 2. Coordinates

- **+y is up.** 1 tile = 1 world unit.
- **The origin is the centre of the footprint, on the ground.** The footprint is `w` tiles along x and `d` tiles along z, so the model must stay inside x ∈ [−w/2, w/2] and z ∈ [−d/2, d/2]. Its lowest point must be exactly y = 0.
- **The front faces +x.** The default camera and the HUD thumbnails look from +x+z, above (a 3/4 view), so the +x side and the +z end are what kids see first. Put doors, faces, signs and the most interesting side on +x. Players can turn items in 90° steps, so finish all four sides; the back may be simpler.
- Legal footprints are 1×1, 1×2, 2×1, 2×2, 2×3 and 3×2 (what validation accepts). **The item list you are given fixes the footprint of each item; do not change it.** For long footprints the convention is `w ≤ d` (1×2, 2×3): the long side runs along z and the front is a long side, like the bench and the classroom. It is a convention, not a rule: 2×1 and 3×2 are legal if the list asks for them (then the long side runs along x and the +x face is a short end).
- **`at` is the bounding-box centre of a part.** There are two exceptions: a dome's `at` is the centre of its flat base, and a torus's `at` is the centre of its ring (for a full ring, that is the same thing). This matters with `rotate`: a dome turns about the middle of its base, not about the middle of its height, and a part-ring torus (`arc` below 2π) turns about the ring centre, not about the middle of the visible arch. After rotating, check where the part ended up.
- **`rotate` is Euler XYZ in radians** (`[0, Math.PI / 2, 0]` is a quarter turn about y).
- **`scale` is applied first, then `rotate`, then the move to `at`.** So `scale: [1, 0.5, 1]` squashes the part's own y before it is turned.

### The default camera

The game camera is steep, about 57° above the ground, looking from +x+z. In practice:

- **Roofs fill the view.** From above, a roof hides most of what is under it, and a deep eave hides the wall below it. Vertical façades show only about 40–55% of their height.
- **Put the signature details where the camera sees them**: on roofs, and on fronts facing +x and +z. Tilt signs, emblems and decals towards the camera instead of leaving them flat on a wall, or put them on the roof.
- Keep what matters (a door, a sign, a face) out from under a deep roof, or open the roof up.

## 3. The kit (`kit` in `build(kit)`)

Every primitive is `kit.<name>(..., at, color, opts?)` and returns a `Part`. Every primitive also takes `opts.rotate`, `opts.scale`, `opts.glow`, and the animation options `opts.motion` and `opts.light` (see "Animation" below).

| primitive | signature | notes |
|---|---|---|
| box | `box([sx, sy, sz], at, color, { round? })` | `round` is a corner radius in world units (a number, not `true`); it is capped at half the smallest side. It gives bevelled edges but costs 300 triangles: use it rarely. None of the six approved items uses it; if you do, start small (0.03 to 0.06) |
| cylinder | `cylinder(rTop, rBottom, h, at, color, { segments = 12 })` | axis along y; `rTop: 0` gives a cone; `segments: 4` gives a thin rope or chain |
| cone | `cone(r, h, at, color, { segments = 12 })` | point up |
| sphere | `sphere(r, at, color, { detail = 1 })` | low-poly icosphere; `detail: 0` for small balls; `scale` gives an ellipsoid |
| wedge | `wedge([w, h, d], at, color, { apex = 0 })` | triangular prism, ridge along z; `apex` −0.5…0.5 moves the ridge across x (−0.5 = ramp) |
| torus | `torus(radius, tube, at, color, { radialSegments = 6, tubularSegments = 12, arc = 2π })` | stands in the x–y plane (axis along z, like a wheel rolling along x). `rotate: [Math.PI / 2, 0, 0]` lays it flat. `arc: Math.PI` is an arch from +x over the top, with its open ends flat on y = at[1]. A shorter arc gets fewer tubular segments by default. Hide open ends in the ground or another part |
| dome | `dome(radius, at, color, { segments = 12 })` | closed half sphere sitting on y = at[1] (flat base down); `segments / 4` rings. `scale: [1, 0.6, 1]` gives a flatter dome, and its base stays on at[1] |

- `opts.scale: [x, y, z]` works on every primitive: a sphere becomes an egg or a bush, a cylinder becomes an oval drum, a dome becomes a squashed cap. All three values must be non-zero (zero throws). A negative value mirrors the part, and its faces still point outwards.
- `opts.glow`: `true` lights the part up in its own colour at dusk and night (lamps: `lampWarm`). A palette colour, as in `glow: 'windowWarm'`, keeps `color` by day and emits that colour at night. Any palette colour may glow. Glowing parts go in the second mesh automatically.
- `kit.finish(parts)` merges everything into at most 2 meshes (body + glow). Return its group as it is.

Kit tips learned on the School items:

- **Torus `tubularSegments` in multiples of 4** (8, 12, 16) give clean wheels: a vertex sits at the bottom, so the tyre rests on y = 0 exactly.
- **Euler order is XYZ** for `rotate`: the z turn is applied first, then y, then x. For an x-then-z tilt, `[a, 0, c]` means "turn about z by c, then about x by a".
- **Striped canopies**: two six-sided cones in two colours, turned 30° apart (half a segment), so their faces alternate in twelve stripes; the same trick works with two domes.
- **Resting a detail-0 sphere** on the ground or a surface: use `ICO_LOW` (§4).

### Animation: motion and lights

Items can move and glow in patterns. It is all done on the graphics card from options on a part, so it costs no extra draw calls, no triangles and nothing per frame in your code. Still parts stay exactly as they are. Shadows are drawn once and stay put (a swaying crown does not move its shadow). With "reduce motion" switched on in the player's device, everything holds its rest pose, so build the rest pose to look right on its own.

**`opts.motion: { kind, pivot?, axis?, amount?, speed?, phase?, water? }`** on any primitive:

| kind | what moves | pivot (default) | axis (default) | amount | speed |
|---|---|---|---|---|---|
| `sway` | bends downwind, more the higher the vertex is above the pivot (nothing below it moves) | the lowest point of the part under `at`. **Set it by hand** (see below) | up | lean per unit of height, default 0.05 (a crown 1 unit above the pivot leans 5 cm). Small plants need 0.1 to 0.2 | 1.7 rad/s (about 3.7 s a sway) |
| `wave` | a ripple runs along cloth away from the pole and grows towards the free edge | `at` | `+x`, along the cloth, away from the pole; it must not be up or down | sideways ripple per unit of cloth, 0.18 | 6 rad/s |
| `spin` | turns round the axis, a whole turn after turn | `at` | up | unused | rad/s (negative turns the other way), 0.5 = one turn in 12.6 s. Use about 0.4 |
| `swing` | rocks back and forth about the axis, like a swing or a seesaw | `at` | `x` (the bar it hangs from) | the biggest angle in radians, 0.3 (about 17 degrees) | 2 rad/s |
| `water` | a flat water surface that stays put; the shimmer is drawn on it | not used | not used | not used | not used |

- **Every animated part of one item gets the same explicit `pivot` (and the same `phase`)**, so a tree's leaf balls sway together and do not tear apart. Each placed copy of an item also gets its own phase, so a row of trees never moves in lockstep. Put the pivot where the moving piece joins the part that stays: the top of the trunk, the soil line, the pole, the bar, the axle.
- Pivots and axes are in item space, like `at`; placing and turning the item moves them with it.
- **Split cloth into strips.** `wave` ripples along the cloth, so a flag made of one box only flaps its free edge. Cut it into 3 or 4 vertical strips (the flagpole uses 4 per stripe), all with the same `pivot` and `axis`.
- **Water**: `motion: { kind: 'water', water: 'pond' }` (default) or `'pool'` on a body part (not a glow part) makes its top face a water surface: slow highlight bands by day, moonlight glints on a pond at night, a soft cyan glow on a pool at night. Mark every part that is the same water, such as the navy notches of the lily pads, so it all shimmers together.
- **Limits** (a value outside them throws when the part is built): `|amount|` at most 4, `|speed|` at most 16, `|phase|` at most 16. Real motion is far gentler than that; the limits only catch typos.
- **Combine freely** with `rotate` and `scale` (a swaying cone, a spinning torus). A part can both move and glow.

**`opts.light`** on glow parts only (a glow part is one with `glow` set; `light` on a part without it throws):

- `'steady'` (the default).
- `'breathe'`: the brightness rises and falls slowly (about 3 s, between 22 % and 100 %). For lamps. The dip is deep on purpose: tone mapping flattens a near-white globe, so a shallower dip would look static on the smooth tier.
- `'blink'`: on and off, 1.4 s a cycle (on for 55 %, dim when off). For signs and beacons. Blinking is never faster than 3 Hz, so a blink can never flash.
- `'window'`: steady, but every pane is a slightly different brightness (plus or minus 15 %), so a building's windows are not a flat wall of light. `glassWindow` already does this on every pane; you only write it yourself for your own glass.
- `'chase'`: running lights. The bulbs of one **run** (a ring round a wheel rim or a roof edge, a line along a rail or up a tower) light in turn: a lit stretch of about a third of the bulbs steps on one bulb at a time, 2.5 steps a second (never more than 3), and the other bulbs glow dim. Give every bulb `light: 'chase'` and its place in the run, `chase: { index, count }`: `index` counts 0, 1, 2 … in the order the lights should run (the stretch moves towards higher indices), `count` is the number of bulbs in the run (2 to 64). Make each bulb its own small part (a sphere, `detail: 0` keeps it cheap). Rules:
  - A chase bulb is **still or spins**; it cannot sway, wave or swing (that throws). Still bulbs all take the item's own phase, so a run stays in order; each placed copy runs at its own moment.
  - On a spinning part (a carousel roof), give every bulb of the run the same `motion` as the roof it sits on (same pivot, axis, speed and phase), so the bulbs turn with it and stay in order.
  - Several runs on one item each count from 0. Any palette colour can glow (`lampWarm` for classic bulbs; `sunYellow`, `red`, `pink` … for coloured ones); keep the bulbs small.
- Lights only animate while the lights are on (dusk and night). In the day they look the same as a plain glow. With "reduce motion" every light holds steady and fully on (a chase run is all lit).

**Safety rules (kids' game, calm look):**

1. Keep it gentle: sways of a few centimetres, a rock of a few degrees, spins of about 15 s a turn. If you can see it from across the room it is too much.
2. Bases stay: trunks, pots, frames, decks, soil and anything that stands on the ground do not move. Only the free end moves.
3. Rigid motion must not clip. Check the extremes: a swing seat must clear the ground, a seesaw's low end rests on its bumper, so keep that rock small (the seesaw uses 0.04 rad).
4. A spinning or swinging part must stay inside the footprint and clear of walls and the ground in every pose, not only at rest.
5. Do not change positions or colours to add motion: motion options leave the geometry snapshot as it is. Only a deliberate shape change (like cutting a flag into strips) needs the snapshot regenerated, and then only that item may differ.
6. Do not blink more than a few small lights per item, and never make a large area blink.

Examples (all in `src/themes/school/items/`): `tree.ts` (sway with one shared pivot), `flagpole.ts` (wave on strips), `merry-go-round.ts` (spin about the post), `swing-set.ts` (a swing per pair of ropes and seat), `seesaw.ts` (a small rock about the axle), `fish-pond.ts` and `swimming-pool.ts` (water), `street-lamp.ts` and `canteen.ts` (breathe), `bus-stop.ts` and `school-bus.ts` (blink).

```ts
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, 0.65, 0], amount: 0.06 }; // the top of the trunk
kit.sphere(0.41, [0.03, 1.07, 0.04], 'leaf', { motion: SWAY });
kit.sphere(0.16, [0, 1.46, 0], 'lampWarm', { glow: true, light: 'breathe' });
kit.box([w, h, 0.02], at, 'red', { motion: { kind: 'wave', pivot: poleTop, axis: [1, 0, 0] } });

// chase: 12 bulbs round a ring of radius 0.3 at height 1.6, running anticlockwise seen from above
const BULBS = 12;
for (let index = 0; index < BULBS; index++) {
  const a = (index / BULBS) * Math.PI * 2;
  parts.push(kit.sphere(0.035, [0.3 * Math.cos(a), 1.6, -0.3 * Math.sin(a)], 'lampWarm',
    { detail: 0, glow: true, light: 'chase', chase: { index, count: BULBS } }));
}
// on a spinning roof: the same loop, with the roof's own spin on every bulb (the roof parts use ROOF_SPIN too)
const ROOF_SPIN: MotionOpts = { kind: 'spin', pivot: [0, 0, 0], speed: 0.4 };
//   { detail: 0, glow: true, light: 'chase', chase: { index, count: BULBS }, motion: ROOF_SPIN }
```

## 4. Shared building parts (`src/models/parts.ts`)

```ts
import { door, gableRoof, glassWindow, wallPanel, type Facing } from '../../../models/parts';
// and the rod, wheel, roof and direction helpers below: aim, along, barrelRoof, heading, ICO_LOW, rod, wheel
```

They return `Part[]`, so spread them in: `parts.push(...glassWindow(kit, {...}))`. `facing` is the direction the wall faces: `'x+' | 'x-' | 'z+' | 'z-'`. For wall parts, `at` is the centre of the part **on the wall's outer surface**, for example `[W / 2, y, z]` on a +x wall of width `W`. The helper builds outwards from there in layers 0.01 apart, so faces never z-fight.

- **`glassWindow(kit, { at, facing, w, h, frame = 'teal', panes = 2 })`**: a frame plus `skyBlue` glass that glows `windowWarm` at night, split by thin bars. `w` × `h` is the glass size; the frame adds 0.04 on each side. **Always use it for windows**: it is the owner-approved look (glass blue by day, warm glow at night). The frame sticks out 0.02 from the wall, the glass 0.03 and the bars 0.04. The bars are vertical, full glass height and evenly spaced along the wall (along z on `x+`/`x-` walls, along x on `z+`/`z-` walls), `panes − 1` of them: the window is the same on every facing and symmetric, so there is no left or right to get wrong. Horizontal bars are not available.
- **`door(kit, { at, facing, w, h, color, knob? })`**: a slab 0.03 out from the wall. `at` is the door's centre, so its bottom is at `at[1] − h / 2`. `knob` (a palette colour) adds a small round handle, 0.45 of the door height up. There is no handing: the knob sits on the same world side for every facing, at the +z edge of the door on `x+` and `x-` walls and at the +x edge on `z+` and `z-` walls (so seen from outside, it is on the left of an `x+` door and on the right of a `z+` door). Choose `at` and the door's side of the wall with that in mind.
- **`wallPanel(kit, { at, facing, w, h, depth, color, glow? })`**: any flat box on a wall, such as a sign, a notice board, a poster, a step or a shutter. Stack layers 0.01 apart: a board 0.02 deep, then lettering 0.03 deep.
- **`gableRoof(kit, { at, length, width, rise, eave, color, ridge?, along = 'z', thickness = 0.08 })`**: two slabs meeting at a ridge, plus an optional round ridge cap.
  - `at` is the centre of the wall tops.
  - `width` is the width of the walls across the ridge.
  - `length` is the roof's length along the ridge, including any overhang past the end walls.
  - `rise` is the height of the ridge above the wall tops.
  - `eave` is how far the slabs reach past the side walls, measured flat.
  - `along: 'x'` turns the ridge to run along x.
  - The helper does not close the triangular gable ends. Add a wedge in the wall colour for them: `kit.wedge([width, rise, wallLength], [x, wallTop + rise / 2, z], 'cream')` (with `rotate: [0, Math.PI / 2, 0]` when `along: 'x'`).
  - The slabs reach out by `eave + thickness · sin(pitch)` past the walls. Keep that inside the footprint.

Rods, wheels, barrel roofs and the direction maths behind them. Use these instead of writing the same trigonometry in an item file.

- **`rod(kit, a, b, radius, color, { segments = 6, glow? })`**: a cylinder from point `a` to point `b` (struts, bars, net strands, slanted frame members, a rope). Example: `parts.push(rod(kit, [0.2, 0.1, 0], [0.2, 0.9, 0.3], 0.02, 'stoneDark', { segments: 4 }))`. A tilted rod's ends are flat across its axis, so check where they land against a wall or the ground.
- **`aim(dir, turn = 'x')`**: the Euler XYZ `rotate` that turns a part's own +y onto the direction `dir` (any length). Example: `kit.cylinder(r, r, h, at, color, { rotate: aim([nx, ny, nz]) })`. The two `turn`s differ only in the twist about `dir`: `'x'` is what `rod` uses; `'y'` (tilt away from +y, then swing round y) suits things placed around a vertical axis, such as patches on a globe or pins on a pole, because the part's local z stays level.
- **`heading(yaw, pitch)`** and **`along(p, d, s)`**: `heading` is the unit direction for a yaw about y (0 = +x, turning towards −z) and a pitch (positive up); a part rotated `[0, yaw, pitch]` has its +x along it. `along` is the point `s` from `p` along `d`. Together they lay out fronds, leaves and branches: `along(start, heading(yaw, pitch), length / 2)`.
- **`barrelRoof(kit, { at, length, width, rise, color, segments = 8, along = 'x', thickness = 0.07, overlap = 0.03, spring = 0.2, endWall? })`**: a curved (half-ellipse) roof of flat slabs. `at` is the centre of the ellipse (middle of the roof along the barrel, centred across it); the crown is `rise` above `at[1]`; `width` is the full width across the barrel; `length` the roof's length along it. `spring` is the angle where the arch starts, so the roof meets the wall tops at a slant and `at[1]` sits `rise · sin(spring)` above the wall tops. `endWall: { color, length, center? }` adds a fan of wedges that shuts both ends under the arch; give it a `length` 0.01 shorter than the wall so it does not z-fight. Example: `barrelRoof(kit, { at: [0, 1.0, 0], length: 1.5, width: 2.4, rise: 0.9, color: 'teal', spring: 0.22, endWall: { color: 'cream', length: 1.4 } })`.
- **`wheel(kit, { at, radius, tube, axis, color, hubColor?, hubRadius?, hubLength?, spokes = 2, spokeColor = 'white', spokeWidth?, spokeThick?, spokeStep?, tubularSegments = 12, radialSegments = 4 })`**: an upright spoked wheel: a torus tyre, an optional 6-sided hub, and `spokes` full-diameter bars (2 gives four spokes), the first at 45°. `axis: 'z'` stands in the x–y plane (rolls along x), `axis: 'x'` in the z–y plane (rolls along z). Set the tyre's centre `at[1]` to `radius + tube` so it just touches the ground, and use a multiple of 4 for `tubularSegments`, so a vertex sits at the very bottom (y = 0 exactly). Example: `wheel(kit, { at: [0, 0.16, 0.3], radius: 0.12, tube: 0.04, axis: 'z', color: 'charcoal', hubColor: 'stone' })`. A wheel made of cylinders on their side (bus, tuk-tuk) is not this helper: keep those as plain cylinders.
- **`ICO_LOW`** (0.851): how far a `detail: 0` sphere's lowest point sits below its centre, as a share of its radius. To rest a squashed ball on the ground: `y = r * squash * ICO_LOW`.

## 5. Scale chart

Match these heights from the approved items (world units, ground = 0). Small things are drawn a little bigger than real life, so they read at the default camera distance.

| thing | height |
|---|---|
| a child (for proportion) | ≈ 0.45 |
| bench seat / backrest | 0.31 / 0.7 |
| classroom door | 0.44 |
| one storey of a building | 0.62 |
| swing set top bar | 1.24 |
| tree, street lamp | ≈ 1.7 |
| classroom ridge / clock tower | ≈ 2.0 / 2.36 |
| flagpole (the tallest so far) | 2.5 |
| hard limit | 5 |

Fill the footprint. On every footprint axis of n ≥ 2 tiles, the model must span at least n − 0.6 (validation checks this). The approved items span: bench 1.62 along z (1×2), swing set 1.86 × 1.50 (2×2), classroom 1.95 × 2.96 (2×3).

## 6. Triangle budget and costs

The budget per item is **800 + 400·w·d** triangles: 1×1 = 1200, 1×2 (or 2×1) = 1600, 2×2 = 2400, 2×3 (or 3×2) = 3200. Validation rejects anything over it. **Aim for ≤ 50 %.** The approved items use 11–41 %: tree 268, bench 180, lamp 292, flagpole 196, swing set 348, classroom 1304.

Measured costs, with defaults unless stated:

| part | triangles |
|---|---|
| box | 12 |
| box with `round` (any radius) | 300 |
| cylinder (12 / 8 / 16 / 4 segments) | 48 / 32 / 64 / 16 |
| cone (12 / 8 segments), or cylinder with `rTop: 0` | 24 / 16 |
| sphere (detail 0 / 1 / 2) | 20 / 80 / 180 |
| wedge | 8 |
| torus (6 × 12 default / `arc: Math.PI` / 8 × 16) | 144 / 72 / 256 |
| dome (12 default / 8 / 16 segments) | 72 / 32 / 128 |
| glassWindow (2 panes default / 1 / 3) | 36 / 24 / 48 |
| door / door with knob | 12 / 32 |
| wallPanel | 12 |
| gableRoof / with ridge cap | 24 / 56 |
| rod (6 / 4 segments) | 24 / 16 |
| wheel (4 × 12 tyre, 2 spokes, no hub) | 96 + 24 |
| barrelRoof (8 segments) / with endWall | 96 / 160 |

`scale` does not change a part's triangle count: a squashed sphere costs the same as a round one, so use it freely, but remember a scaled-up part still has the same coarse faces.

Cheap tricks: use `segments: 8` for small cylinders, `detail: 0` for small balls and `segments: 4` for ropes. Get roundness from spheres, cylinders and chunky proportions, not from `round`.

## 7. Palette (`src/models/palette.ts`)

Use only these names. They describe the colour, not its use: a `red` can be a roof, a slide or a tomato. Each main colour has a darker shade; use it for trim and for shaded parts of the same object, not for whole items.

| name | hex | typical uses |
|---|---|---|
| white | #f7f3ea | trim, bands and cornices, poles, clock faces, flag stripes |
| cream | #f4e3c1 | building walls, gable ends |
| stone | #bcc2cb | plinths, steps, paving, concrete bases |
| stoneDark | #7f8898 | ropes and chains, metal fittings, shaded stone |
| chrome | #94a8c2 | polished metal: taps, spouts, rails, bike parts |
| charcoal | #3e4456 | iron frames, tyres, dark metal |
| sand | #e8c78e | sandpits, beach, light timber |
| wood | #c4874f | timber, benches, trunks, fences |
| woodDark | #8a5935 | doors, wooden trim, shaded wood |
| bark | #5a3a22 | shaded bark, chocolate, soil |
| terracotta | #c0603a | clay pots, bricks, roof tiles |
| red | #e5534b | roofs, slides, flag stripes, fruit |
| redDark | #b03a3c | ridge caps, red trim |
| orange | #f4923a | toys, seats, fruit, traffic cones |
| sunYellow | #ffc83d | gold tops, clock rims, knobs, flowers, toys |
| brass | #c9962c | bells, horns, lamp fittings: a deeper, duller gold than sunYellow |
| pink | #f59ac2 | flowers, toys, sweets |
| purple | #9b78d8 | flowers, toys, accents |
| leaf | #4aa84e | leaves, hedges, plants |
| leafDark | #2e8549 | shaded or dark foliage |
| lime | #a8d93c | lawns, young leaves, fruit, aliens |
| mint | #94dcc1 | pale accents, pastel walls and toys |
| teal | #2aa6a2 | window frames (the default), playground metal |
| skyBlue | #7dc4f0 | window glass (via `glassWindow`), glass flasks, a tiled swimming pool; not ponds (use navy) |
| blue | #3f7fdb | playground frames, signs, roofs |
| navy | #2f4a86 | lamp posts, clock hands, dark trim, flag stripe, pond water (stays dark at night: the night light is blue, so pale blue water would glare) |
| glassBlue | #c2e8f7 | pale glass, ice |
| lampWarm | #ffeaa6 | bulbs and lamp globes, with `glow: true` |
| windowWarm | #ffd873 | night glow of windows: `glow: 'windowWarm'` on a `skyBlue` part |

Any colour may glow (a screen, a neon sign, a lit pool). Make windows with `glassWindow` and lamps with `lampWarm` and `glow: true`. Keep glowing areas small: large ones bloom a lot at night.

**City nights and neon.** A theme can set `nightGlow` in its `info.ts` (default 1): above 1, its dusk and night get a brighter, warm-neutral street light instead of the moonlit blue, so a city never goes dark and painted reds, yellows and greens read as themselves (the shopping district uses 1.5). Its glowing parts get stronger too, most on ลื่น (no bloom), and on สวย the bloom is tuned for a city: every glowing part, saturated neon included, blooms in its own colour, with a softer, tighter halo so the many windows do not wash the map out. Day and dawn never change. The batch gallery shows your theme's own night, so judge glows there. A neon sign is a glow part in a vivid palette colour (pink, purple, blue, skyBlue, teal, lime, sunYellow, orange, red) shaped as an icon (a cup, a shirt, a star, scissors), never letters or text; neighbouring shops get different colours. Lit up, the deep colours (blue, purple, red, orange, teal) keep their colour best and the pale ones (pink, skyBlue, lime, sunYellow) turn pastel, so put a neon on a dark board and build it from thin strokes and small shapes, never a whole wall.

## 8. Rules

Validation (`src/models/validate.ts`) enforces these, and every theme is checked by `src/themes/registry.test.ts`:

- id matches `/^[a-z0-9-]+$/`, the Thai `name` is not empty, and both are unique within the theme. The category is one of `building, nature, seating, food, play, ride, animal, vehicle, decoration, facility`.
- Footprint is 1×1, 1×2, 2×1, 2×2, 2×3 or 3×2 (the item list fixes which; `w ≤ d` is only a convention).
- **Stay inside the footprint**, with no overhang at all (not even leaves, roofs or awnings).
- **Sit on the ground**: the lowest point is exactly y = 0. The height is at most 5.
- **Fill the footprint**: on each axis of n ≥ 2 tiles, the model spans at least n − 0.6.
- **Ground-level surfaces sit at least 0.02 above the ground** (yards, sand, courts, mats, bases, stepping stones): floor tiles are up to 0.015 tall and must never cover them. A surface lower than that is only allowed as a tiny detail (under 0.01 in area); `src/floors/itemSurfaces.test.ts` checks every School item.
- **At most 2 meshes, made with `kit.finish`.** Only kit materials and only kit attributes: no raw `THREE.Mesh`, materials, textures or geometry.
- **Never transform the returned group** (no `group.position`, `rotation` or `scale`). Transform the parts.
- **Palette colours only**, for both `color` and `glow`.
- **No randomness**: two builds must be identical. For variety, use fixed numbers.
- Finite geometry (no NaN), under the triangle budget.

Not checked, but expected:

- No floating parts: everything rests on the ground or on another part.
- Tilted cylinders and boxes dip below their centre line. Lift them back up (the swing set lifts each leg by `r · sin(tilt)`).
- Faces in the same plane flicker (z-fighting). Layer them at least 0.01 apart, as the wall helpers do.
- Avoid parts thinner than about 0.015: they shimmer at a distance.
- Don't edit the controller-owned files (§1).

## 9. Content rules

- Kid-friendly and cheerful.
- No weapons, no blood, no scary medical imagery.
- No royal portraits or royal imagery, and no religious shrines or Buddha images, unless the owner asks for them.
- The Thai flag appears only on a pole, at full mast (see `flagpole.ts`).
- Hospital (Stage 2): no red cross on white. Use a heart with a plus in teal or green, or a green plus in a circle (the pharmacy); no letters, not even an "H".
- Space (Stage 2): no people or astronauts (robots and the one friendly cartoon alien are fine), no national flags or space-agency logos, no weapons or lasers, no wind (no sway or wave).
- Tokyo (Stage 2): the owner asked for a Japanese temple, so temple and pagoda architecture is allowed there only; no Buddha or deity statues, altars, offerings, incense, prayer boards, fortune slips or torii; no kanji, kana or Latin letters; no lucky-cat charm, no pachinko or prize machines, no sake or beer.
- No real brand names or logos. There are no textures, so there is no written text: let shapes and colours tell the story. Not even a single letter built from boxes: signs are pictures and icons.

## 10. Checking your work

1. `npx vitest run src/themes src/models`. Every item of every theme is validated, and errors name the item and the rule. Also run `npx tsc --noEmit`.
2. `npm run dev` and open `http://localhost:5173/?gallery=<theme>` (for example `?gallery=school`). Look at your item next to the approved ones, page with ◀ ▶, and orbit to see every side.
   - Sculpting a batch: `?gallery=<theme>-batch-<n>` (dev server only; for example `?gallery=amusement-batch-1`) shows just your batch, `src/themes/<theme>/batches/<letter><n>.ts`, even before the theme is registered. `?gallery=batch-<n>` still means the School's. Check the batch with its test, `npx vitest run src/themes/<theme>/batches/<letter><n>.test.ts`: every item valid, assigned to your batch, with the Thai name and footprint of the item doc, and (once the batch has an item) all of the batch's items in doc order.
   - Switch to night with ตั้งค่า → ช่วงเวลา → กลางคืน: windows and lamps should glow, and nothing else should.
   - Animated items move in the gallery too: watch for parts that tear apart, clip into the ground or leave the footprint, and check the rest pose still looks right (the thumbnails and "reduce motion" show it).
   - `&item=<id>` (for example `?gallery=school&item=classroom`) shows one item close up. Every label shows a thumbnail and the triangles used against the budget.
3. Compare with the style references: the same chunkiness, palette and scale. The front (+x) should read in the 3/4 view.
4. Each registered theme has a geometry snapshot (`src/themes/<theme>/geometry.snapshot.json`, checked by `src/themes/<theme>/geometry.test.ts` through `describeGeometrySnapshot` in `src/themes/geometry.test-helper.ts`) that fingerprints every item's built geometry (per mesh: triangles, bounding box, sums of positions and colours), so a change to a shared helper can't silently change an approved item. A new item, or a change you meant to make, fails the theme's `geometry.test.ts` until you regenerate the snapshot (School shown):

   ```bash
   UPDATE_GEOMETRY=1 npx vitest run src/themes/school/geometry.test.ts
   ```

   Then review the JSON diff (`git diff src/themes/school/geometry.snapshot.json`): only the items you meant to change may appear in it. If any other item changed, a shared helper moved it: fix that instead of committing the snapshot.

## 11. Style references (`src/themes/school/items/`)

- `tree.ts`: round cartoon shapes from a few overlapping low-poly spheres in two greens. Simple wins.
- `bench.ts`: a 1×2 piece with its long side along z and facing +x, slats and frame in wood and charcoal, small things drawn chunky.
- `street-lamp.ts`: stacked cylinders with 8 segments and a `lampWarm` globe that glows at night.
- `flagpole.ts`: the Thai flag done right (on a pole, at full mast), with a ripple made of two angled halves rather than more triangles.
- `swing-set.ts`: filling a 2×2 footprint with a base (the sandpit), and tilted legs lifted so they don't dip below the ground.
- `classroom.ts`: a full building made with the shared parts (`glassWindow`, `door`, `wallPanel`, `gableRoof`), with named constants, windows on all four sides and a front feature (the clock tower) on +x.

## 12. Example: a small hut

A complete 1×1 item that passes validation (264 triangles, 22 % of budget). It is an example, not a real item.

```ts
import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, gableRoof, glassWindow } from '../../../models/parts';

const W = 0.7; // wall width (x)
const L = 0.76; // wall length (z)
const BASE = 0.05; // stone base height
const WALL_TOP = 0.62;
const RISE = 0.3; // roof ridge above the wall tops
const WIN_Y = 0.36; // window centres

/** กระท่อม: an example hut, front door on +x. */
export const item: ItemModel = {
  id: 'hut',
  name: 'กระท่อม',
  category: 'building',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([W + 0.08, BASE, L + 0.08], [0, BASE / 2, 0], 'stone'),
      kit.box([W, WALL_TOP - BASE, L], [0, (BASE + WALL_TOP) / 2, 0], 'cream'),
      kit.wedge([W, RISE, L], [0, WALL_TOP + RISE / 2, 0], 'cream'), // closes the gable ends
      ...gableRoof(kit, { at: [0, WALL_TOP, 0], length: L + 0.12, width: W, rise: RISE, eave: 0.08, color: 'blue', ridge: 'navy' }),
      ...door(kit, { at: [W / 2, BASE + 0.22, -0.15], facing: 'x+', w: 0.22, h: 0.44, color: 'woodDark', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [W / 2, WIN_Y, 0.17], facing: 'x+', w: 0.2, h: 0.2 }),
      ...glassWindow(kit, { at: [0, WIN_Y, L / 2], facing: 'z+', w: 0.26, h: 0.2 }),
      ...glassWindow(kit, { at: [0, WIN_Y, -L / 2], facing: 'z-', w: 0.26, h: 0.2 }),
      ...glassWindow(kit, { at: [-W / 2, WIN_Y, 0], facing: 'x-', w: 0.26, h: 0.2 }),
    ];
    return kit.finish(parts);
  },
};
```

## 13. Floor tiles (`src/floors/`)

Besides items, kids paint a floor under the city: one tile per map cell, shared by every theme (wood, bricks, lawn, water...). A tile is built like an item but is flat, so the rules are different. Tiles are not items: they are not in a theme, not counted in the fill %, and items stand on top of them.

**A tile is one file** in `src/floors/tiles/<id>.ts`, exporting `tile: FloorTile`, then added to `FLOOR_TILES` in `src/floors/index.ts`:

```ts
export const tile: FloorTile = {
  id: 'lawn',              // lowercase letters, digits, dashes; unique; saved in the player's city, never rename
  name: 'สนามหญ้า',          // Thai, shown in the drawer
  group: 'earth',          // wood | tile | stone | earth | special  (ไม้ | ปูน-กระเบื้อง | หิน-อิฐ | ดิน-หญ้า | พิเศษ)
  build: (kit) => kit.finish([kit.box([1, 0.012, 1], [0, 0.006, 0], 'lime')]),
};
```

Rules (checked by `validateFloorTile`, run by `npx vitest run src/floors`):

- **Footprint 1 x 1, centred on the cell** like a 1x1 item: x and z inside [-0.5, 0.5]. The ground is y = 0 and the tile sits on it (lowest point 0).
- **Flat:** everything, relief included, is at most 0.015 above the ground (a base of 0.008 plus 0.007 of relief, say). Items' own ground surfaces start at 0.02, so a tile never covers them.
- **At most 160 triangles** (a box is 12). Tiles are merged per map chunk, so a fully painted map stays at 4 draw calls however many tiles it holds.
- **Kit and palette only**, body material: no `glow` (floors do not light up), no own materials, 2 meshes at most (checked, as for items). The root group is identity.
- **Make it tile.** Neighbouring cells touch, so the pattern must continue across the edge: put the full 1 x 1 base to the edge, keep specks and details away from the edge, and in a running pattern (bricks, planks) end every row on the cell edge. Check it as a block of cells, not alone.
- **Water:** put `motion: { kind: 'water', water: 'pond' }` on the surface part (see section 3); a block of water tiles then shimmers as one pool and holds still with "reduce motion". Use `navy` for pond water and `skyBlue` for a tiled pool, like the items.
- Floors cast no shadow and receive the items' shadows. Do not put anything above the cell that should throw one.
- Colours: stay at least a little away from the grounds (the grass, sand and so on show around and under the tiles); the usual palette rules apply.

**Checking a tile:** `npm run dev`, open `http://localhost:5173/?gallery=floors`. Every tile is shown as a 3 x 3 block, so seams and patterns are visible, with its Thai name, group and triangles used against the 160 budget. Switch day and night with ตั้งค่า, and orbit to see it from the side.

Examples: `wood-light.ts` (planks along x), `brick-red.ts` (a running bond that tiles), `lawn.ts` (a base with specks away from the edge), `water-shallow.ts` (water).
