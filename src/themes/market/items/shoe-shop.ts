import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, glassWindow, wallPanel } from '../../../models/parts';

// A shoe shop (2×2, front on +x): shelves of shoes in front of a big window and a giant glowing
// sneaker on the roof (blue neon).
const B = { x0: -0.95, x1: 0.3, z: 0.95, top: 1.05 };
const SHELF_X = 0.47;
const SHELF_Y = [0.2, 0.37, 0.54];
const SHOES = ['red', 'orange', 'sunYellow', 'teal', 'pink'] as const;

/** ร้านรองเท้า: a shoe shop with shelves in the window and a sneaker neon. */
export const item: ItemModel = {
  id: 'shoe-shop',
  name: 'ร้านรองเท้า',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const cx = (B.x0 + B.x1) / 2;
    const L = 2 * B.z;
    const parts: Part[] = [
      kit.box([B.x1 - B.x0 + 0.04, 0.05, L + 0.04], [cx, 0.025, 0], 'stone'),
      kit.box([B.x1 - B.x0, B.top - 0.05, L], [cx, (0.05 + B.top) / 2, 0], 'mint'),
      kit.box([B.x1 - B.x0 + 0.1, 0.07, L + 0.1], [cx, B.top + 0.035, 0], 'blue'),
      kit.box([B.x1 - B.x0 + 0.02, 0.05, L + 0.02], [cx, 0.76, 0], 'blue'),
      kit.box([0.65, 0.03, L], [(B.x1 + 0.95) / 2 + 0.02, 0.015, 0], 'stone'),
      // shelves with side boards in front of the window
      kit.box([0.22, 0.5, 0.04], [SHELF_X, 0.28, -0.9], 'woodDark'),
      kit.box([0.22, 0.5, 0.04], [SHELF_X, 0.28, 0.4], 'woodDark'),
      ...glassWindow(kit, { at: [B.x1, 0.42, -0.25], facing: 'x+', w: 1.2, h: 0.5, panes: 3 }),
      ...door(kit, { at: [B.x1, 0.3, 0.66], facing: 'x+', w: 0.3, h: 0.5, color: 'woodDark', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [B.x1, 0.9, -0.45], facing: 'x+', w: 0.5, h: 0.2 }),
      ...glassWindow(kit, { at: [B.x1, 0.9, 0.45], facing: 'x+', w: 0.5, h: 0.2 }),
      ...glassWindow(kit, { at: [-0.3, 0.42, B.z], facing: 'z+', w: 0.7, h: 0.4 }),
      ...glassWindow(kit, { at: [-0.3, 0.42, -B.z], facing: 'z-', w: 0.7, h: 0.4 }),
      ...glassWindow(kit, { at: [-0.3, 0.9, B.z], facing: 'z+', w: 0.6, h: 0.2 }),
      ...glassWindow(kit, { at: [-0.3, 0.9, -B.z], facing: 'z-', w: 0.6, h: 0.2 }),
      ...glassWindow(kit, { at: [B.x0, 0.42, 0], facing: 'x-', w: 1.0, h: 0.4, panes: 3 }),
      ...wallPanel(kit, { at: [B.x1, 0.76, 0], facing: 'x+', w: 1.9, h: 0.05, depth: 0.03, color: 'blue' }),
      // the giant sneaker on the roof, toe towards +z: sole, upper, toe cap, tongue and laces
      kit.box([0.2, 0.05, 0.72], [-0.2, B.top + 0.07 + 0.025, 0], 'sunYellow', { glow: true }),
      kit.box([0.2, 0.2, 0.3], [-0.2, B.top + 0.07 + 0.17, -0.22], 'blue', { glow: true }),
      kit.wedge([0.2, 0.16, 0.34], [-0.2, B.top + 0.07 + 0.15, 0.1], 'blue', { glow: true }),
      kit.sphere(0.12, [-0.2, B.top + 0.07 + 0.12, 0.3], 'skyBlue', { detail: 0, glow: true, scale: [0.85, 0.8, 1.1] }),
      kit.box([0.24, 0.025, 0.2], [-0.2, B.top + 0.07 + 0.29, -0.2], 'pink', { glow: true, rotate: [0.35, 0, 0] }),
      kit.box([0.04, 0.05, 0.2], [-0.07, B.top + 0.07 + 0.18, 0.08], 'orange', { glow: true }),
      kit.box([0.04, 0.05, 0.2], [-0.33, B.top + 0.07 + 0.18, 0.08], 'orange', { glow: true }),
    ];
    // shelves and a few shoes on each
    SHELF_Y.forEach((y, row) => {
      parts.push(kit.box([0.24, 0.03, 1.3], [SHELF_X, y, -0.25], 'wood'));
      for (let k = 0; k < 4; k++) {
        const z = -0.7 + k * 0.3 + (row % 2) * 0.08;
        const c = SHOES[(row * 2 + k) % SHOES.length];
        parts.push(
          kit.box([0.1, 0.03, 0.2], [SHELF_X, y + 0.03, z], 'white'),
          kit.box([0.09, 0.07, 0.12], [SHELF_X, y + 0.085, z - 0.03], c),
          kit.sphere(0.05, [SHELF_X, y + 0.065, z + 0.06], c, { detail: 0, scale: [0.9, 0.7, 1.1] }),
        );
      }
    });
    return kit.finish(parts);
  },
};
