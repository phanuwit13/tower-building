import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, gableRoof, glassWindow, wallPanel } from '../../../models/parts';

// A small cream shop (long ridge along z) with a red roof. Surfboards lean on the front (+x) wall and a blue
// sign with three white waves sits over the door and window.
const SHOP = { x: -0.2, w: 1.0, d: 1.3, h: 0.7 }; // walls
const FRONT = SHOP.x + SHOP.w / 2; // the +x wall
const BOARD = { len: 0.76, w: 0.09, t: 0.045, lean: 0.33, x: SHOP.x + 0.8, y: 0.365 };

/** ร้านเช่ากระดานโต้คลื่น: a surf-board rental shop with leaning boards and a wave sign. */
export const item: ItemModel = {
  id: 'surf-shop',
  name: 'ร้านเช่ากระดานโต้คลื่น',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([SHOP.w + 0.1, 0.05, SHOP.d + 0.1], [SHOP.x, 0.025, 0], 'stone'), // slab
      kit.box([SHOP.w, SHOP.h - 0.05, SHOP.d], [SHOP.x, 0.05 + (SHOP.h - 0.05) / 2, 0], 'cream'),
      ...gableRoof(kit, { at: [SHOP.x, SHOP.h, 0], length: SHOP.d + 0.2, width: SHOP.w, rise: 0.32, eave: 0.04, color: 'red', ridge: 'redDark' }),
      kit.wedge([SHOP.w, 0.32, SHOP.d - 0.02], [SHOP.x, SHOP.h + 0.16, 0], 'cream'),
    ];
    parts.push(
      ...glassWindow(kit, { at: [FRONT, 0.36, -0.36], facing: 'x+', w: 0.4, h: 0.22, panes: 2 }),
      ...door(kit, { at: [FRONT, 0.28, 0.0], facing: 'x+', w: 0.26, h: 0.46, color: 'woodDark', knob: 'sunYellow' }),
      // sign over the door and window, with three white waves
      ...wallPanel(kit, { at: [FRONT, 0.605, -0.1], facing: 'x+', w: 0.8, h: 0.1, depth: 0.03, color: 'blue' }),
    );
    for (const z of [-0.3, -0.1, 0.1]) parts.push(kit.torus(0.05, 0.012, [FRONT + 0.035, 0.565, z], 'white', { arc: Math.PI, radialSegments: 4, tubularSegments: 8, rotate: [0, Math.PI / 2, 0] }));
    // three boards leaning on the wall, nose up
    const colors = ['orange', 'mint', 'pink'] as const;
    colors.forEach((c, i) => {
      const z = 0.2 + i * 0.19;
      parts.push(kit.sphere(1, [BOARD.x, BOARD.y, z], c, { scale: [BOARD.t, BOARD.len / 2, BOARD.w], rotate: [0, 0, BOARD.lean] }));
    });
    return kit.finish(parts);
  },
};
