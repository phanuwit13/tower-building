import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { along, door, glassWindow, heading, rod } from '../../../models/parts';

// A three-storey white hotel (long side along z, front on +x). Blue-railed balconies run along the front of the
// upper floors, a red awning shades the door and a small coconut palm grows by the door (front, +z corner).
const BASE_H = 0.03;
const W = 1.4; // wall width (x)
const L = 2.5; // wall length (z)
const CX = -0.2; // wall centre x (leaves room for the balconies and the palm in front)
const FRONT = CX + W / 2; // x of the front wall
const STOREY = 0.6;
const TOP = BASE_H + 3 * STOREY; // top of the walls
const WIN = { w: 0.3, h: 0.28 };
const BALCONY = { depth: 0.22, len: 1.9, h: 0.04, rail: 0.2 };
const PALM = { x: 0.68, z: 1.2, top: 0.95 };
const SWAY: MotionOpts = { kind: 'sway', pivot: [PALM.x, PALM.top - 0.02, PALM.z], amount: 0.2 };

/** โรงแรมริมหาด: a white three-storey hotel with balconies, blue railings and a palm by the door. */
export const item: ItemModel = {
  id: 'beach-hotel',
  name: 'โรงแรมริมหาด',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.96, BASE_H, 2.96], [0, BASE_H / 2, 0], 'sand'),
      kit.box([W, 3 * STOREY, L], [CX, BASE_H + 1.5 * STOREY, 0], 'white'),
      // roof slab, blue parapet band and a sun sign on the roof (shapes only, no text)
      kit.box([W + 0.1, 0.07, L + 0.1], [CX, TOP + 0.035, 0], 'blue'),
      kit.box([0.9, 0.12, 0.5], [CX + 0.1, TOP + 0.13, 0.55], 'cream'),
      kit.box([0.04, 0.34, 0.9], [CX + 0.5, TOP + 0.24, -0.5], 'sunYellow'),
      kit.sphere(0.14, [CX + 0.5, TOP + 0.42, -0.5], 'orange', { detail: 0, scale: [0.3, 1, 1] }),
    ];
    // floor bands
    for (const k of [1, 2]) parts.push(kit.box([W + 0.04, 0.04, L + 0.04], [CX, BASE_H + k * STOREY, 0], 'blue'));
    // front: door, awning, windows, balconies with blue railings
    parts.push(
      ...door(kit, { at: [FRONT, BASE_H + 0.22, 0], facing: 'x+', w: 0.26, h: 0.44, color: 'blue', knob: 'sunYellow' }),
      kit.box([0.26, 0.04, 0.5], [FRONT + 0.13, BASE_H + 0.52, 0], 'red', { rotate: [0, 0, -0.12] }),
    );
    for (let floor = 0; floor < 3; floor++) {
      const y = BASE_H + floor * STOREY + 0.33;
      for (const z of floor === 0 ? [-0.8, 0.8] : [-0.8, 0, 0.8]) {
        parts.push(...glassWindow(kit, { at: [FRONT, y, z], facing: 'x+', w: WIN.w, h: WIN.h, panes: 1 }));
      }
      for (const x of [CX - 0.3, CX + 0.3]) {
        parts.push(
          ...glassWindow(kit, { at: [x, y, L / 2], facing: 'z+', w: WIN.w, h: WIN.h, panes: 1 }),
          ...glassWindow(kit, { at: [x, y, -L / 2], facing: 'z-', w: WIN.w, h: WIN.h, panes: 1 }),
        );
      }
      for (const z of [-0.6, 0.6]) parts.push(...glassWindow(kit, { at: [CX - W / 2, y, z], facing: 'x-', w: WIN.w, h: WIN.h, panes: 1 }));
    }
    for (const floor of [1, 2]) {
      const y = BASE_H + floor * STOREY;
      const bx = FRONT + BALCONY.depth / 2;
      const railX = FRONT + BALCONY.depth - 0.02;
      const railY = y + BALCONY.h + BALCONY.rail;
      parts.push(
        kit.box([BALCONY.depth, BALCONY.h, BALCONY.len], [bx, y + BALCONY.h / 2, 0], 'white'),
        kit.box([0.04, 0.04, BALCONY.len], [railX, railY, 0], 'blue'),
      );
      for (const z of [-BALCONY.len / 2 + 0.02, BALCONY.len / 2 - 0.02]) parts.push(kit.box([BALCONY.depth, 0.04, 0.04], [bx, railY, z], 'blue'));
      for (let i = 0; i <= 8; i++) {
        parts.push(kit.box([0.03, BALCONY.rail, 0.03], [railX, y + BALCONY.h + BALCONY.rail / 2, -BALCONY.len / 2 + 0.02 + (i * (BALCONY.len - 0.04)) / 8], 'blue'));
      }
    }
    // palm by the door: trunk stays, crown sways about the trunk top
    parts.push(
      rod(kit, [PALM.x - 0.04, BASE_H, PALM.z], [PALM.x, PALM.top, PALM.z], 0.05, 'wood', { segments: 6 }),
      kit.sphere(0.07, [PALM.x, PALM.top + 0.01, PALM.z], 'leafDark', { detail: 0, motion: SWAY }),
    );
    for (let k = 0; k < 6; k++) {
      const yaw = 0.3 + (k / 6) * Math.PI * 2;
      const len = 0.26;
      const c = along([PALM.x, PALM.top, PALM.z], heading(yaw, -0.3), len / 2);
      parts.push(kit.cylinder(1, 1, 0.02, c, 'leaf', { segments: 4, scale: [len / 2, 1, 0.07], rotate: [0, yaw, -0.3], motion: SWAY }));
    }
    for (const a of [0.5, 2.6, 4.7]) {
      parts.push(kit.sphere(0.04, [PALM.x + Math.cos(a) * 0.05, PALM.top - 0.06, PALM.z - Math.sin(a) * 0.05], 'woodDark', { detail: 0, motion: SWAY }));
    }
    return kit.finish(parts);
  },
};
