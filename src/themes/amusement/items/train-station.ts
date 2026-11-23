import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, gableRoof, glassWindow, wallPanel } from '../../../models/parts';

// A small station (2x3, long side along z): a stone platform on the -x side with a cream waiting hall under a
// red gable roof and a platform canopy, a clock over the door on +x, and a short piece of track beside the
// platform on +x with a red buffer stop at the -z end.
const PLAT = { x0: -0.98, x1: 0.44, h: 0.1, z: 1.46 }; // platform slab (x range, height, half length)
const HALL = { x0: -0.88, x1: -0.2, z0: -1.44, z1: 0.4, wall: 0.78 }; // hall walls above the platform (x range, z range, top)
const PITCH = 0.6;
const RISE = ((HALL.x1 - HALL.x0) / 2) * Math.tan(PITCH);
const EAVE = 0.04;
const CANOPY = { z0: 0.44, z1: 1.44, y: 0.74, post: 0.036 }; // flat red roof over the platform at the +z end
const CLOCK = { r: 0.17, y: 0.78, z: -0.66 };
const DOOR = { w: 0.28, h: 0.46, z: -0.66 };
const BED = { x0: 0.5, x1: 0.98, h: 0.03 }; // gravel under the track
const RAIL_X = [0.62, 0.86];
const SLEEPERS = 10;

/** สถานีรถไฟเล็ก: a small station with a platform, a clock and a short piece of track. */
export const item: ItemModel = {
  id: 'train-station',
  name: 'สถานีรถไฟเล็ก',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const hx = (HALL.x0 + HALL.x1) / 2;
    const hw = HALL.x1 - HALL.x0;
    const hl = HALL.z1 - HALL.z0;
    const hz = (HALL.z0 + HALL.z1) / 2;
    const parts: Part[] = [
      kit.box([PLAT.x1 - PLAT.x0, PLAT.h, 2 * PLAT.z], [(PLAT.x0 + PLAT.x1) / 2, PLAT.h / 2, 0], 'stone'),
      kit.box([0.05, 0.012, 2 * PLAT.z], [PLAT.x1 - 0.04, PLAT.h + 0.006, 0], 'sunYellow'), // safety line at the edge
      kit.box([hw, HALL.wall - PLAT.h, hl], [hx, (PLAT.h + HALL.wall) / 2, hz], 'cream'),
      kit.box([hw + 0.04, 0.06, hl + 0.04], [hx, HALL.wall, hz], 'white'),
      kit.wedge([hw, RISE, hl], [hx, HALL.wall + RISE / 2, hz], 'cream'),
      ...gableRoof(kit, { at: [hx, HALL.wall, hz], length: hl + 0.08, width: hw, rise: RISE, eave: EAVE, color: 'red', ridge: 'redDark' }),
      ...door(kit, { at: [HALL.x1, PLAT.h + DOOR.h / 2, DOOR.z], facing: 'x+', w: DOOR.w, h: DOOR.h, color: 'woodDark', knob: 'sunYellow' }),
    ];
    // windows (they glow at night)
    for (const z of [-1.16, -0.2]) parts.push(...glassWindow(kit, { at: [HALL.x1, 0.5, z], facing: 'x+', w: 0.2, h: 0.28, frame: 'white' }));
    for (const z of [-1.1, -0.6, -0.1]) parts.push(...glassWindow(kit, { at: [HALL.x0, 0.5, z], facing: 'x-', w: 0.2, h: 0.28, frame: 'white' }));
    parts.push(...glassWindow(kit, { at: [hx, 0.5, HALL.z0], facing: 'z-', w: 0.3, h: 0.28, frame: 'white' }));
    // clock over the door, face to +x
    parts.push(
      kit.cylinder(CLOCK.r + 0.025, CLOCK.r + 0.025, 0.04, [HALL.x1 + 0.02, CLOCK.y + 0.07, CLOCK.z], 'sunYellow', { rotate: [0, 0, Math.PI / 2], segments: 12 }),
      kit.cylinder(CLOCK.r, CLOCK.r, 0.04, [HALL.x1 + 0.04, CLOCK.y + 0.07, CLOCK.z], 'white', { rotate: [0, 0, Math.PI / 2], segments: 12 }),
      kit.box([0.02, 0.1, 0.02], [HALL.x1 + 0.065, CLOCK.y + 0.12, CLOCK.z], 'navy'),
      kit.box([0.02, 0.02, 0.08], [HALL.x1 + 0.065, CLOCK.y + 0.07, CLOCK.z + 0.04], 'navy'),
    );
    // platform canopy on four posts, with a bench under it
    const cw = PLAT.x1 - HALL.x0 - 0.04;
    parts.push(kit.box([cw, 0.06, CANOPY.z1 - CANOPY.z0], [HALL.x0 + cw / 2, CANOPY.y, (CANOPY.z0 + CANOPY.z1) / 2], 'red'));
    for (const z of [CANOPY.z0 + 0.04, CANOPY.z1 - 0.04]) {
      for (const x of [HALL.x0 + 0.04, PLAT.x1 - 0.08]) {
        parts.push(kit.cylinder(CANOPY.post, CANOPY.post, CANOPY.y - PLAT.h, [x, (CANOPY.y + PLAT.h) / 2, z], 'white', { segments: 6 }));
      }
    }
    parts.push(
      kit.box([0.16, 0.04, 0.6], [-0.55, PLAT.h + 0.2, 0.95], 'wood'),
      kit.box([0.04, 0.2, 0.6], [-0.65, PLAT.h + 0.28, 0.95], 'woodDark'),
    );
    // the track: gravel, sleepers, two rails and a buffer stop
    const len = 2 * PLAT.z;
    parts.push(kit.box([BED.x1 - BED.x0, BED.h, len], [(BED.x0 + BED.x1) / 2, BED.h / 2, 0], 'stoneDark'));
    for (let i = 0; i < SLEEPERS; i++) {
      parts.push(kit.box([0.46, 0.03, 0.07], [0.74, BED.h + 0.015, -PLAT.z + 0.15 + i * ((len - 0.3) / (SLEEPERS - 1))], 'woodDark'));
    }
    for (const x of RAIL_X) parts.push(kit.box([0.035, 0.035, len - 0.04], [x, BED.h + 0.03 + 0.0175, 0], 'chrome'));
    parts.push(
      kit.box([0.4, 0.14, 0.08], [0.74, BED.h + 0.12, -PLAT.z + 0.1], 'red'),
      ...wallPanel(kit, { at: [0.74, BED.h + 0.12, -PLAT.z + 0.14], facing: 'z+', w: 0.4, h: 0.05, depth: 0.02, color: 'white' }),
    );
    return kit.finish(parts);
  },
};
