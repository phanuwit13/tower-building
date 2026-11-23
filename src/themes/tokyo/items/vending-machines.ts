import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// Three drink machines side by side (1×2): each a coloured cabinet with a glowing window full of plain
// coloured cans, a row of buttons and a delivery slot. No brands, no words, no pictures on the cans.
const BODY = { x: 0.42, y: 1.0, z: 0.46 };
const ZS = [-0.52, 0, 0.52];
const BODIES: PaletteColor[] = ['red', 'blue', 'teal'];
const CANS: PaletteColor[][] = [
  ['sunYellow', 'lime', 'white'],
  ['orange', 'pink', 'sunYellow'],
  ['purple', 'white', 'lime'],
];

/** ตู้กดเครื่องดื่ม: a row of three lit drink machines. */
export const item: ItemModel = {
  id: 'vending-machines',
  name: 'ตู้กดเครื่องดื่ม',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.5, 0.04, 1.6], [0, 0.02, 0], 'stone')];
    const fx = BODY.x / 2; // the front face
    ZS.forEach((z, m) => {
      const base = 0.04;
      parts.push(
        kit.box([BODY.x, BODY.y - base, BODY.z], [0, base + (BODY.y - base) / 2, z], BODIES[m]),
        kit.box([BODY.x + 0.04, 0.05, BODY.z + 0.04], [0, BODY.y + 0.025, z], 'white'),
        // the lit window: glass that glows warm, with a dark inner back and three shelves of cans
        kit.box([0.02, 0.5, 0.34], [fx + 0.01, 0.68, z - 0.04], 'skyBlue', { glow: 'windowWarm', light: 'window' }),
      );
      CANS[m].forEach((c, row) => {
        for (let i = 0; i < 3; i++) {
          parts.push(kit.box([0.03, 0.09, 0.07], [fx + 0.035, 0.52 + row * 0.16, z - 0.04 + (i - 1) * 0.1], c));
        }
        parts.push(kit.box([0.03, 0.02, 0.32], [fx + 0.03, 0.455 + row * 0.16, z - 0.04], 'white'));
      });
      // buttons down the right edge (towards +z), a coin plate and the delivery slot
      for (let b = 0; b < 3; b++) parts.push(kit.box([0.03, 0.05, 0.05], [fx + 0.015, 0.84 - b * 0.1, z + 0.17], 'sunYellow'));
      parts.push(
        kit.box([0.03, 0.08, 0.06], [fx + 0.015, 0.5, z + 0.17], 'charcoal'),
        kit.box([0.04, 0.15, 0.34], [fx + 0.02, 0.2, z], 'charcoal'),
        // a glowing header panel: colour only, no picture
        kit.box([0.03, 0.1, 0.38], [fx + 0.015, 0.94, z], c(m), { glow: c(m) }),
      );
    });
    return kit.finish(parts);
  },
};

function c(m: number): PaletteColor {
  return (['pink', 'sunYellow', 'lime'] as const)[m];
}
