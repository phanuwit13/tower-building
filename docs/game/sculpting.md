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
- For long footprints, use `w ≤ d` (1×2, 2×3): the long side runs along z and the front is a long side, like the bench and the classroom.
- **`at` is the bounding-box centre of a part.** There are two exceptions: a dome's `at` is the centre of its flat base, and a torus's `at` is the centre of its ring (for a full ring, that is the same thing).
- **`rotate` is Euler XYZ in radians** (`[0, Math.PI / 2, 0]` is a quarter turn about y).
- **`scale` is applied first, then `rotate`, then the move to `at`.** So `scale: [1, 0.5, 1]` squashes the part's own y before it is turned.

## 3. The kit (`kit` in `build(kit)`)

Every primitive is `kit.<name>(..., at, color, opts?)` and returns a `Part`. Every primitive also takes `opts.rotate`, `opts.scale` and `opts.glow`.

| primitive | signature | notes |
|---|---|---|
| box | `box([sx, sy, sz], at, color, { round? })` | `round` gives bevelled edges but costs 300 triangles: use it rarely |
| cylinder | `cylinder(rTop, rBottom, h, at, color, { segments = 12 })` | axis along y; `rTop: 0` gives a cone; `segments: 4` gives a thin rope or chain |
| cone | `cone(r, h, at, color, { segments = 12 })` | point up |
| sphere | `sphere(r, at, color, { detail = 1 })` | low-poly icosphere; `detail: 0` for small balls; `scale` gives an ellipsoid |
| wedge | `wedge([w, h, d], at, color, { apex = 0 })` | triangular prism, ridge along z; `apex` −0.5…0.5 moves the ridge across x (−0.5 = ramp) |
| torus | `torus(radius, tube, at, color, { radialSegments = 6, tubularSegments = 12, arc = 2π })` | stands in the x–y plane (axis along z, like a wheel rolling along x). `rotate: [Math.PI / 2, 0, 0]` lays it flat. `arc: Math.PI` is an arch from +x over the top, with its open ends flat on y = at[1]. A shorter arc gets fewer tubular segments by default. Hide open ends in the ground or another part |
| dome | `dome(radius, at, color, { segments = 12 })` | closed half sphere sitting on y = at[1] (flat base down); `segments / 4` rings. `scale: [1, 0.6, 1]` gives a flatter dome, and its base stays on at[1] |

- `opts.scale: [x, y, z]` works on every primitive: a sphere becomes an egg or a bush, a cylinder becomes an oval drum, a dome becomes a squashed cap. All three values must be non-zero (zero throws). A negative value mirrors the part, and its faces still point outwards.
- `opts.glow`: `true` lights the part up in its own colour at dusk and night (lamps: `lampWarm`). A palette colour, as in `glow: 'windowWarm'`, keeps `color` by day and emits that colour at night. Any palette colour may glow. Glowing parts go in the second mesh automatically.
- `kit.finish(parts)` merges everything into at most 2 meshes (body + glow). Return its group as it is.

## 4. Shared building parts (`src/models/parts.ts`)

```ts
import { door, gableRoof, glassWindow, wallPanel, type Facing } from '../../../models/parts';
```

They return `Part[]`, so spread them in: `parts.push(...glassWindow(kit, {...}))`. `facing` is the direction the wall faces: `'x+' | 'x-' | 'z+' | 'z-'`. For wall parts, `at` is the centre of the part **on the wall's outer surface**, for example `[W / 2, y, z]` on a +x wall of width `W`. The helper builds outwards from there in layers 0.01 apart, so faces never z-fight.

- **`glassWindow(kit, { at, facing, w, h, frame = 'teal', panes = 2 })`**: a frame plus `skyBlue` glass that glows `windowWarm` at night, split by thin bars. `w` × `h` is the glass size; the frame adds 0.04 on each side. **Always use it for windows**: it is the owner-approved look (glass blue by day, warm glow at night). The frame sticks out 0.02 from the wall, the glass 0.03 and the bars 0.04.
- **`door(kit, { at, facing, w, h, color, knob? })`**: a slab 0.03 out from the wall. `at` is the door's centre, so its bottom is at `at[1] − h / 2`. `knob` adds a small round handle.
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

The budget per item is **800 + 400·w·d** triangles: 1×1 = 1200, 1×2 = 1600, 2×2 = 2400, 2×3 = 3200. Validation rejects anything over it. **Aim for ≤ 50 %.** The approved items use 11–41 %: tree 268, bench 180, lamp 292, flagpole 196, swing set 348, classroom 1304.

Measured costs, with defaults unless stated:

| part | triangles |
|---|---|
| box | 12 |
| box with `round` | 300 |
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

Cheap tricks: use `segments: 8` for small cylinders, `detail: 0` for small balls and `segments: 4` for ropes. Get roundness from spheres, cylinders and chunky proportions, not from `round`.

## 7. Palette (`src/models/palette.ts`)

Use only these names. They describe the colour, not its use: a `red` can be a roof, a slide or a tomato. Each main colour has a darker shade; use it for trim and for shaded parts of the same object, not for whole items.

| name | hex | typical uses |
|---|---|---|
| white | #f7f3ea | trim, bands and cornices, poles, clock faces, flag stripes |
| cream | #f4e3c1 | building walls, gable ends |
| stone | #bcc2cb | plinths, steps, paving, concrete bases |
| stoneDark | #7f8898 | ropes and chains, metal fittings, shaded stone |
| charcoal | #3e4456 | iron frames, tyres, dark metal |
| sand | #e8c78e | sandpits, beach, light timber |
| wood | #c4874f | timber, benches, trunks, fences |
| woodDark | #8a5935 | doors, wooden trim, shaded wood |
| bark | #5a3a22 | shaded bark, chocolate, soil |
| red | #e5534b | roofs, slides, flag stripes, fruit |
| redDark | #b03a3c | ridge caps, red trim |
| orange | #f4923a | toys, seats, fruit, traffic cones |
| sunYellow | #ffc83d | gold tops, clock rims, knobs, flowers, toys |
| pink | #f59ac2 | flowers, toys, sweets |
| purple | #9b78d8 | flowers, toys, accents |
| leaf | #4aa84e | leaves, hedges, plants |
| leafDark | #2e8549 | shaded or dark foliage |
| lime | #a8d93c | lawns, young leaves, fruit, aliens |
| mint | #94dcc1 | pale accents, pastel walls and toys |
| teal | #2aa6a2 | window frames (the default), playground metal |
| skyBlue | #7dc4f0 | window glass (via `glassWindow`), water |
| blue | #3f7fdb | playground frames, signs, roofs |
| navy | #2f4a86 | lamp posts, clock hands, dark trim, flag stripe |
| glassBlue | #c2e8f7 | pale glass, ice |
| lampWarm | #ffeaa6 | bulbs and lamp globes, with `glow: true` |
| windowWarm | #ffd873 | night glow of windows: `glow: 'windowWarm'` on a `skyBlue` part |

Any colour may glow (a screen, a neon sign, a lit pool). Make windows with `glassWindow` and lamps with `lampWarm` and `glow: true`. Keep glowing areas small: large ones bloom a lot at night.

## 8. Rules

Validation (`src/models/validate.ts`) enforces these, and every theme is checked by `src/themes/registry.test.ts`:

- id matches `/^[a-z0-9-]+$/`, the Thai `name` is not empty, and both are unique within the theme. The category is one of `building, nature, seating, food, play, ride, animal, vehicle, decoration, facility`.
- Footprint is 1×1, 1×2, 2×2 or 2×3.
- **Stay inside the footprint**, with no overhang at all (not even leaves, roofs or awnings).
- **Sit on the ground**: the lowest point is exactly y = 0. The height is at most 5.
- **Fill the footprint**: on each axis of n ≥ 2 tiles, the model spans at least n − 0.6.
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
- Hospital (Stage 2): no red cross on white. Use a green cross, a heart or an "H".
- No real brand names or logos. There are no textures, so there is no written text: let shapes and colours tell the story. A single letter built from boxes, like the hospital "H", is fine.

## 10. Checking your work

1. `npx vitest run src/themes src/models`. Every item of every theme is validated, and errors name the item and the rule. Also run `npx tsc --noEmit`.
2. `npm run dev` and open `http://localhost:5173/?gallery=<theme>` (for example `?gallery=school`). Look at your item next to the approved ones, page with ◀ ▶, and orbit to see every side.
   - Switch to night with ตั้งค่า → ช่วงเวลา → กลางคืน: windows and lamps should glow, and nothing else should.
   - Once Task 15b lands, `&item=<id>` shows one item close up with its triangle count and budget.
3. Compare with the style references: the same chunkiness, palette and scale. The front (+x) should read in the 3/4 view.

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
