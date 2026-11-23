import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

// A fair-ground toy game: a booth with a counter, chunky bright cork pop-guns on chains (a fat tube, a ball
// pump and a cork on a string: nothing like a real firearm), shelves of tin cans and yellow ducks, and a run of
// chase bulbs along the top. Front faces +x. The counter is at +x, the targets at the back (-x).
const BASE = { w: 0.96, h: 0.04, d: 1.9 };
const COUNTER = { x: 0.3, w: 0.3, h: 0.4, d: 1.7 };
const COUNTER_TOP = BASE.h + COUNTER.h;
const WALL = { x: -0.4, t: 0.06, h: 1.2, d: 1.8 };
const POST = { x: 0.4, h: 1.3 };
const ROOF = { x: -0.02, w: 0.96, t: 0.06, y: BASE.h + POST.h + 0.03 };
const BULBS = 10;
const SHELVES = [0.6, 0.85, 1.1]; // heights of the target shelves
const SHELF_X = -0.28;
const GUN_Z = [-0.5, 0, 0.5];
const GUN_COLORS: PaletteColor[] = ['lime', 'pink', 'skyBlue'];

/** สนามยิงปืน: a fair-ground cork-gun booth. */
export const item: ItemModel = {
  id: 'shooting-gallery',
  name: 'สนามยิงปืน',
  category: 'play',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'wood'),
      kit.box([WALL.t, WALL.h, WALL.d], [WALL.x, BASE.h + WALL.h / 2, 0], 'blue'),
      kit.box([COUNTER.w, COUNTER.h, COUNTER.d], [COUNTER.x, BASE.h + COUNTER.h / 2, 0], 'red'),
      kit.box([COUNTER.w + 0.04, 0.04, COUNTER.d + 0.04], [COUNTER.x, COUNTER_TOP + 0.02, 0], 'white'),
      // striped skirt on the counter front
      ...[-0.68, -0.34, 0, 0.34, 0.68].map((z) => kit.box([0.02, 0.3, 0.17], [COUNTER.x + COUNTER.w / 2 + 0.01, BASE.h + 0.2, z], 'white')),
    ];
    for (const sz of [-1, 1]) parts.push(kit.cylinder(0.04, 0.04, POST.h, [POST.x, BASE.h + POST.h / 2, sz * 0.85], 'sunYellow', { segments: 4 }));
    // roof board with a bright front lip, tilted a little towards the camera
    parts.push(
      kit.box([ROOF.w, ROOF.t, WALL.d + 0.1], [ROOF.x, ROOF.y, 0], 'orange', { rotate: [0, 0, -0.06] }),
      kit.box([0.04, 0.12, WALL.d + 0.1], [POST.x + 0.03, ROOF.y - 0.05, 0], 'sunYellow'),
    );
    // chase bulbs in a line along the front lip (running along z)
    for (let index = 0; index < BULBS; index++) {
      const z = -0.84 + (index / (BULBS - 1)) * 1.68;
      parts.push(kit.sphere(0.035, [POST.x + 0.06, ROOF.y - 0.05, z], 'lampWarm', { detail: 0, glow: true, light: 'chase', chase: { index, count: BULBS } }));
    }
    // target shelves: tin cans (stone with a red band) and yellow ducks, alternating
    SHELVES.forEach((y, row) => {
      parts.push(kit.box([0.2, 0.03, 1.6], [SHELF_X, y, 0], 'woodDark'));
      for (let k = 0; k < 5; k++) {
        const z = -0.6 + k * 0.3;
        if ((k + row) % 2 === 0) {
          parts.push(
            kit.cylinder(0.05, 0.05, 0.11, [SHELF_X, y + 0.015 + 0.055, z], 'stone', { segments: 6 }),
            kit.box([0.086, 0.04, 0.086], [SHELF_X, y + 0.015 + 0.055, z], 'red', { rotate: [0, Math.PI / 6, 0] }),
          );
        } else {
          parts.push(
            kit.sphere(0.06, [SHELF_X, y + 0.015 + 0.06, z], 'sunYellow', { detail: 0, scale: [1.1, 0.9, 1] }),
            kit.sphere(0.04, [SHELF_X + 0.05, y + 0.015 + 0.13, z], 'sunYellow', { detail: 0 }),
            kit.box([0.04, 0.015, 0.03], [SHELF_X + 0.09, y + 0.015 + 0.125, z], 'orange'),
          );
        }
      }
    });
    // toy cork guns on the counter: fat bright tube along x, a big red ball pump behind, a cork in the muzzle on a string
    GUN_Z.forEach((z, i) => {
      const gx = COUNTER.x - 0.02;
      const gy = COUNTER_TOP + 0.04 + 0.05;
      parts.push(
        kit.cylinder(0.05, 0.05, 0.2, [gx, gy, z], GUN_COLORS[i], { rotate: [0, 0, Math.PI / 2], segments: 8 }),
        kit.sphere(0.065, [gx + 0.14, gy + 0.005, z], 'red', { detail: 0 }),
        kit.cylinder(0.035, 0.035, 0.05, [gx - 0.125, gy, z], 'sunYellow', { rotate: [0, 0, Math.PI / 2], segments: 8 }),
        rod(kit, [gx - 0.13, gy, z], [WALL.x + 0.2, COUNTER_TOP + 0.45, z], 0.008, 'charcoal', { segments: 4 }), // chain up to the wall
      );
    });
    return kit.finish(parts);
  },
};
