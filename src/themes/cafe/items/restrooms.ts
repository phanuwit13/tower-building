import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Two small cubicles side by side, doors and picture signs on the +x face. The walls stop at 1.2 and
// the roof is only three open beams, so kids can see the toilets inside from above.
const SIZE = 1.8;
const FLOOR_H = 0.04;
const WALL = { t: 0.06, h: 1.2 };
const SIGN = { s: 0.26, y: 1.02 };
const DOOR = { w: 0.6, h: 0.82, t: 0.04 };
const DOOR_Z = 0.45;

/** ห้องน้ำ: a small block with two coloured doors, each with a picture sign (no text). */
export const item: ItemModel = {
  id: 'restrooms',
  name: 'ห้องน้ำ',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const half = SIZE / 2;
    const wallY = FLOOR_H + WALL.h / 2;
    const parts: Part[] = [
      kit.box([SIZE, FLOOR_H, SIZE], [0, FLOOR_H / 2, 0], 'mint'),
      kit.box([WALL.t, WALL.h, SIZE - 0.1], [-half + 0.05 + WALL.t / 2, wallY, 0], 'cream'), // back
      kit.box([WALL.t, WALL.h, SIZE - 0.1], [half - 0.05 - WALL.t / 2, wallY, 0], 'cream'), // front
      kit.box([SIZE - 0.2, WALL.h, WALL.t], [0, wallY, -half + 0.05 + WALL.t / 2], 'cream'),
      kit.box([SIZE - 0.2, WALL.h, WALL.t], [0, wallY, half - 0.05 - WALL.t / 2], 'cream'),
      kit.box([SIZE - 0.2, WALL.h, WALL.t], [0, wallY, 0], 'skyBlue'), // divider
    ];
    // open roof: three beams across, resting on the walls
    for (const x of [-0.6, 0, 0.6]) parts.push(kit.box([0.1, 0.06, SIZE - 0.1], [x, FLOOR_H + WALL.h + 0.03, 0], 'woodDark'));
    const frontX = half - 0.05;
    // doors on the front, in two colours, each with a knob and a picture sign above
    const doors = [
      { z: -DOOR_Z, color: 'teal', skirt: false, sign: 'skyBlue' },
      { z: DOOR_Z, color: 'orange', skirt: true, sign: 'pink' },
    ] as const;
    for (const d of doors) {
      parts.push(
        kit.box([DOOR.t, DOOR.h, DOOR.w], [frontX + DOOR.t / 2, FLOOR_H + DOOR.h / 2, d.z], d.color),
        kit.sphere(0.03, [frontX + DOOR.t + 0.01, FLOOR_H + 0.42, d.z + 0.2], 'brass', { detail: 0 }),
        kit.box([0.03, SIGN.s, SIGN.s], [frontX + 0.015, SIGN.y, d.z], 'white'),
        // the pictogram: a round head and a body (trousers: two legs / dress: a cone), shapes only
        kit.sphere(0.04, [frontX + 0.04, SIGN.y + 0.075, d.z], d.sign, { detail: 0 }),
      );
      if (d.skirt) {
        parts.push(kit.cone(0.085, 0.14, [frontX + 0.04, SIGN.y - 0.025, d.z], d.sign, { segments: 8, rotate: [0, 0, 0] }));
      } else {
        parts.push(
          kit.box([0.03, 0.1, 0.09], [frontX + 0.035, SIGN.y + 0.0, d.z], d.sign),
          kit.box([0.03, 0.08, 0.03], [frontX + 0.035, SIGN.y - 0.08, d.z - 0.022], d.sign),
          kit.box([0.03, 0.08, 0.03], [frontX + 0.035, SIGN.y - 0.08, d.z + 0.022], d.sign),
        );
      }
    }
    // inside each cubicle: a toilet (tank, seat, bowl) against the back wall, and a plant by one
    for (const z of [-DOOR_Z, DOOR_Z]) {
      const bx = -half + 0.05 + WALL.t + 0.2;
      parts.push(
        kit.box([0.14, 0.34, 0.3], [bx - 0.05, FLOOR_H + 0.17, z], 'white'),
        kit.cylinder(0.15, 0.11, 0.2, [bx + 0.18, FLOOR_H + 0.1, z], 'white', { segments: 8 }),
        kit.cylinder(0.13, 0.13, 0.02, [bx + 0.18, FLOOR_H + 0.21, z], 'skyBlue', { segments: 8 }),
      );
    }
    parts.push(
      kit.cylinder(0.06, 0.05, 0.08, [0.15, FLOOR_H + 0.04, 0.8], 'terracotta', { segments: 8 }),
      kit.sphere(0.08, [0.15, FLOOR_H + 0.14, 0.8], 'leaf', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
