import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// Two drink vending machines side by side (1×2, long side along z, fronts +x): lit product windows, rows of coloured cans (shapes only).
const M = { w: 0.5, h: 1.2, d: 0.82, y0: 0.04 };
const ZS = [-0.45, 0.45];
const BODY: PaletteColor[] = ['red', 'blue'];
const CANS: PaletteColor[][] = [
  ['sunYellow', 'lime', 'pink', 'orange'],
  ['pink', 'sunYellow', 'purple', 'lime'],
  ['orange', 'skyBlue', 'sunYellow', 'pink'],
];

/** ตู้กดเครื่องดื่ม: two drink vending machines with glowing fronts. */
export const item: ItemModel = {
  id: 'vending-machines',
  name: 'ตู้กดเครื่องดื่ม',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const front = M.w / 2;
    const parts: Part[] = [kit.box([M.w + 0.1, M.y0, 1.8], [0, M.y0 / 2, 0], 'stone')];
    ZS.forEach((z, k) => {
      parts.push(
        kit.box([M.w, M.h, M.d], [0, M.y0 + M.h / 2, z], BODY[k]),
        kit.box([M.w + 0.04, 0.06, M.d + 0.04], [0, M.y0 + M.h + 0.03, z], 'white'),
        // glowing product window with a dark frame
        kit.box([0.02, 0.62, 0.66], [front + 0.01, 0.82, z], 'charcoal'),
        kit.box([0.02, 0.56, 0.6], [front + 0.02, 0.82, z], 'skyBlue', { glow: 'windowWarm', light: 'window' }),
        // delivery slot, coin knob and a small glowing pay light
        kit.box([0.04, 0.13, 0.4], [front + 0.02, 0.3, z - 0.06], 'charcoal'),
        kit.cylinder(0.05, 0.05, 0.03, [front + 0.02, 0.3, z + 0.3], 'sunYellow', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
        kit.box([0.03, 0.05, 0.12], [front + 0.02, 0.47, z + 0.26], k ? 'lime' : 'sunYellow', { glow: true, light: 'breathe' }),
      );
      // three rows of cans on the lit shelves (colour blocks)
      CANS.forEach((row, r) => {
        row.forEach((c, i) => {
          parts.push(kit.cylinder(0.035, 0.035, 0.1, [front + 0.05, 0.99 - r * 0.17, z - 0.24 + i * 0.16], c, { segments: 8 }));
        });
      });
    });
    return kit.finish(parts);
  },
};
