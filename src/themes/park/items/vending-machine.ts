import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

const BODY = { x: 0.5, h: 1.15, z: 0.64 };
const FRONT_X = BODY.x / 2; // the front face (+x)

/** ตู้กดเครื่องดื่ม: a drinks vending machine. The front glows at night with rows of bottles (no brand, no text). */
export const item: ItemModel = {
  id: 'vending-machine',
  name: 'ตู้กดเครื่องดื่ม',
  category: 'food',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BODY.x, BODY.h, BODY.z], [0, BODY.h / 2, 0], 'blue'),
      kit.box([BODY.x + 0.04, 0.05, BODY.z + 0.04], [0, BODY.h + 0.025, 0], 'navy'), // roof cap
      kit.box([BODY.x + 0.04, 0.06, BODY.z + 0.04], [0, 0.03, 0], 'navy'), // plinth
      // glowing top bar: a plain light strip, no words
      kit.box([0.02, 0.09, 0.42], [FRONT_X + 0.01, 1.02, -0.07], 'lampWarm', { glow: true, light: 'breathe' }),
    ];
    // glass window over the bottles (glows at night)
    parts.push(kit.box([0.02, 0.66, 0.42], [FRONT_X + 0.01, 0.63, -0.07], 'skyBlue', { glow: 'windowWarm', light: 'window' }));
    // shelves and bottles
    const colours: PaletteColor[] = ['orange', 'red', 'leaf', 'sunYellow', 'pink', 'purple', 'lime', 'orange', 'blue'];
    const shelfYs = [0.43, 0.63, 0.83];
    shelfYs.forEach((sy, row) => {
      parts.push(kit.box([0.1, 0.025, 0.42], [FRONT_X - 0.03, sy - 0.07, -0.07], 'charcoal'));
      for (let c = 0; c < 3; c++) {
        const z = -0.07 + (c - 1) * 0.125;
        const col = colours[row * 3 + c];
        parts.push(
          kit.cylinder(0.034, 0.034, 0.11, [FRONT_X + 0.005, sy - 0.0, z], col, { segments: 8, glow: true }),
          kit.cylinder(0.014, 0.03, 0.04, [FRONT_X + 0.005, sy + 0.075, z], col, { segments: 8, glow: true }),
        );
      }
    });
    // button strip on the right (+z) of the front: a coin plate and coloured pads, no digits
    parts.push(
      kit.box([0.025, 0.5, 0.1], [FRONT_X + 0.012, 0.7, 0.245], 'charcoal'),
      kit.box([0.03, 0.06, 0.06], [FRONT_X + 0.015, 0.88, 0.245], 'sunYellow'),
    );
    for (let i = 0; i < 3; i++) {
      parts.push(kit.box([0.03, 0.04, 0.06], [FRONT_X + 0.015, 0.74 - i * 0.07, 0.245], i === 0 ? 'red' : i === 1 ? 'leaf' : 'white'));
    }
    // dispenser flap at the bottom
    parts.push(
      kit.box([0.03, 0.13, 0.42], [FRONT_X + 0.015, 0.2, -0.07], 'charcoal'),
      kit.box([0.035, 0.07, 0.3], [FRONT_X + 0.0175, 0.2, -0.07], 'stoneDark'),
    );
    return kit.finish(parts);
  },
};
