import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A round track with a grass island, a centre post with a striped canopy and four small cars on arms.
// The post, canopy, arms and cars all turn together about the centre; the base, track and rail stay.
const BASE = { r: 0.97, h: 0.04 };
const TRACK = { r: 0.88, h: 0.02 };
const ISLAND = { r: 0.48, h: 0.03 };
const TRACK_TOP = BASE.h + TRACK.h;
const ISLAND_TOP = TRACK_TOP + ISLAND.h;
const POST = { r: 0.06, top: 0.78 };
const CANOPY = { r: 0.85, h: 0.3 };
const RC = 0.66; // radius of the cars' circle
const CARS: PaletteColor[] = ['red', 'blue', 'sunYellow', 'leaf'];
const ARM = { y: 0.72, len: Math.hypot(RC, 0.72 - 0.2), tilt: Math.atan2(RC, 0.72 - 0.2) };
const SPIN: MotionOpts = { kind: 'spin', pivot: [0, 0, 0], axis: [0, 1, 0], speed: 0.5 };

/** รถเด็กวนรอบ: small cars going round a centre post, on a round track. */
export const item: ItemModel = {
  id: 'kiddie-cars',
  name: 'รถเด็กวนรอบ',
  category: 'ride',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(BASE.r, BASE.r, BASE.h, [0, BASE.h / 2, 0], 'stone', { segments: 20 }),
      kit.cylinder(TRACK.r, TRACK.r, TRACK.h, [0, BASE.h + TRACK.h / 2, 0], 'charcoal', { segments: 20 }),
      kit.cylinder(ISLAND.r, ISLAND.r, ISLAND.h, [0, TRACK_TOP + ISLAND.h / 2, 0], 'leaf', { segments: 16 }),
      kit.torus(0.93, 0.03, [0, TRACK_TOP + 0.02, 0], 'red', { rotate: [Math.PI / 2, 0, 0], radialSegments: 4, tubularSegments: 20 }),
      // everything below turns together
      kit.cylinder(0.14, 0.14, 0.05, [0, ISLAND_TOP + 0.025, 0], 'sunYellow', { segments: 10, motion: SPIN }),
      kit.cylinder(POST.r, POST.r, POST.top - ISLAND_TOP, [0, (ISLAND_TOP + POST.top) / 2, 0], 'red', { segments: 8, motion: SPIN }),
      kit.cone(CANOPY.r, CANOPY.h, [0, POST.top + CANOPY.h / 2, 0], 'red', { segments: 6, motion: SPIN }),
      kit.cone(CANOPY.r, CANOPY.h, [0, POST.top + CANOPY.h / 2, 0], 'white', { segments: 6, rotate: [0, Math.PI / 6, 0], motion: SPIN }),
      kit.sphere(0.05, [0, POST.top + CANOPY.h + 0.03, 0], 'sunYellow', { detail: 0, motion: SPIN }),
    ];
    CARS.forEach((color, i) => {
      const a = (i * Math.PI) / 2;
      const c = Math.cos(a);
      const s = Math.sin(a);
      // car frame: x radial (outwards), z along the track; y is world height
      const at = (x: number, y: number, z: number): [number, number, number] => [c * (RC + x) - s * z, y, s * (RC + x) + c * z];
      const turn: [number, number, number] = [0, -a, 0];
      const box = (size: [number, number, number], p: [number, number, number], col: PaletteColor) =>
        kit.box(size, at(...p), col, { rotate: turn, motion: SPIN });
      parts.push(
        // arm: from the hub (0, ARM.y) down and out to the car, tilted about z in the car's frame
        kit.cylinder(0.02, 0.02, ARM.len, at(-RC / 2, (ARM.y + 0.2) / 2, 0), 'sunYellow', { segments: 4, rotate: [0, -a, ARM.tilt], motion: SPIN }),
        box([0.26, 0.05, 0.42], [0, TRACK_TOP + 0.025, 0], 'charcoal'),
        box([0.24, 0.09, 0.4], [0, TRACK_TOP + 0.095, 0], color),
        box([0.2, 0.08, 0.2], [0, TRACK_TOP + 0.18, -0.05], 'white'),
        box([0.05, 0.04, 0.03], [0.06, TRACK_TOP + 0.1, 0.205], 'sunYellow'),
        box([0.05, 0.04, 0.03], [-0.06, TRACK_TOP + 0.1, 0.205], 'sunYellow'),
        kit.sphere(0.05, at(0, TRACK_TOP + 0.27, -0.05), 'sand', { detail: 0, motion: SPIN }),
      );
    });
    return kit.finish(parts);
  },
};
