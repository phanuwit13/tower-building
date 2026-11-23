import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A free-standing wall section with two closed elevator doors (2×3, wall along z at the back, front on +x),
// small blinking arrows above each door (pictures, no numbers), a floor mat and two potted plants.
const WALL = { x: -0.75, t: 0.3, h: 1.5, len: 2.9 };
const FACE = WALL.x + WALL.t / 2; // x of the wall face the doors sit on
const DOOR_ZS = [-0.7, 0.7];
const TILT = 0.35; // arrows lean a little towards +z, the side the camera looks from
const DOOR = { w: 0.96, h: 1.0, y: 0.52 };

/** โถงลิฟต์: two closed lift doors in a wall section with blinking arrow lights and plants. */
export const item: ItemModel = {
  id: 'elevator-lobby',
  name: 'โถงลิฟต์',
  category: 'facility',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([WALL.t, WALL.h, WALL.len], [WALL.x, WALL.h / 2, 0], 'cream'),
      kit.box([WALL.t + 0.04, 0.1, WALL.len + 0.04], [WALL.x, 0.05, 0], 'charcoal'),
      kit.box([WALL.t + 0.04, 0.06, WALL.len + 0.04], [WALL.x, WALL.h + 0.03, 0], 'teal'),
      // floor mat in front of the doors
      kit.box([1.2, 0.03, 2.6], [0.1, 0.015, 0], 'stone'),
      kit.box([0.9, 0.035, 2.3], [0.1, 0.0175, 0], 'mint'),
    ];
    DOOR_ZS.forEach((z, i) => {
      parts.push(
        // frame, two chrome leaves meeting at a seam, a call button beside the door
        kit.box([0.04, DOOR.h + 0.1, DOOR.w + 0.1], [FACE + 0.02, DOOR.y + 0.03, z], 'charcoal'),
        kit.box([0.03, DOOR.h, DOOR.w / 2 - 0.01], [FACE + 0.045, DOOR.y, z - DOOR.w / 4], 'chrome'),
        kit.box([0.03, DOOR.h, DOOR.w / 2 - 0.01], [FACE + 0.045, DOOR.y, z + DOOR.w / 4], 'chrome'),
        kit.box([0.02, DOOR.h, 0.02], [FACE + 0.06, DOOR.y, z], 'charcoal'),
        // arrow lights above the door: an up arrow and a down arrow (the only blinking parts)
        kit.wedge([0.24, 0.2, 0.03], [FACE + 0.02, 1.24, z - 0.16], 'sunYellow', { rotate: [0, Math.PI / 2 - TILT, 0], glow: true, light: 'blink' }),
        kit.wedge([0.24, 0.2, 0.03], [FACE + 0.02, 1.24, z + 0.16], 'lime', { rotate: [Math.PI, Math.PI / 2 + TILT, 0], glow: true, light: 'blink' }),
        kit.box([0.04, 0.16, 0.1], [FACE + 0.02, 0.5, z + Math.sign(z) * (DOOR.w / 2 + 0.16)], 'charcoal'),
        kit.sphere(0.025, [FACE + 0.05, 0.53, z + Math.sign(z) * (DOOR.w / 2 + 0.16)], i === 0 ? 'orange' : 'sunYellow', { detail: 0 }),
        kit.sphere(0.025, [FACE + 0.05, 0.47, z + Math.sign(z) * (DOOR.w / 2 + 0.16)], 'teal', { detail: 0 }),
      );
    });
    // two potted plants at the ends of the mat
    for (const pz of [-1.25, 1.25]) {
      parts.push(
        kit.cylinder(0.17, 0.12, 0.26, [0.5, 0.17, pz], 'terracotta', { segments: 8 }),
        kit.sphere(0.2, [0.5, 0.48, pz], 'leaf', { detail: 0, scale: [1, 1.1, 1] }),
        kit.sphere(0.13, [0.55, 0.7, pz + 0.04], 'leafDark', { detail: 0 }),
        kit.sphere(0.07, [0.4, 0.62, pz - 0.1], 'lime', { detail: 0 }),
      );
    }
    // a small bench of two cushions between the plants
    parts.push(kit.box([0.34, 0.04, 0.9], [0.6, 0.25, 0], 'woodDark'), kit.box([0.3, 0.04, 0.4], [0.6, 0.29, -0.22], 'pink'), kit.box([0.3, 0.04, 0.4], [0.6, 0.29, 0.22], 'sunYellow'));
    for (const lz of [-0.4, 0.4]) parts.push(kit.box([0.28, 0.23, 0.05], [0.6, 0.115, lz], 'charcoal'));
    return kit.finish(parts);
  },
};
