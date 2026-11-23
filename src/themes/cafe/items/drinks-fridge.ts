import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A wide glass-door fridge (2×2) facing +x: three lit glass doors showing three shelves of bottles
// (orange juice, milk, water, berry, lime), a bright header with fruit pictures and cups on top.
const BODY = { x0: -0.8, x1: 0.5, h: 1.3, d: 1.84 };
const SHELF_YS = [0.28, 0.62, 0.96];
const DRINKS: PaletteColor[] = ['orange', 'white', 'skyBlue', 'pink', 'lime', 'sunYellow', 'purple', 'red'];

/** ตู้แช่เครื่องดื่ม: a lit glass-door fridge with juice, milk and water bottles. */
export const item: ItemModel = {
  id: 'drinks-fridge',
  name: 'ตู้แช่เครื่องดื่ม',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit: StyleKit) => {
    const bw = BODY.x1 - BODY.x0;
    const cx = (BODY.x0 + BODY.x1) / 2;
    const parts: Part[] = [
      // cabinet shell (charcoal), white top and a plinth
      kit.box([bw, BODY.h, BODY.d], [cx, BODY.h / 2, 0], 'charcoal'),
      kit.box([bw + 0.04, 0.05, BODY.d + 0.04], [cx, BODY.h + 0.025, 0], 'white'),
      // header band with fruit pictures: lit
      kit.box([0.04, 0.2, BODY.d - 0.1], [BODY.x1 + 0.02, 1.17, 0], 'teal', { glow: 'teal', light: 'breathe' }),
      kit.sphere(0.07, [BODY.x1 + 0.06, 1.17, -0.55], 'orange', { detail: 0 }),
      kit.sphere(0.07, [BODY.x1 + 0.06, 1.17, 0], 'pink', { detail: 0 }),
      kit.sphere(0.07, [BODY.x1 + 0.06, 1.17, 0.55], 'lime', { detail: 0 }),
    ];
    // three lit glass doors (a bright panel) with handles; bottles stand on shelves in front of the glass
    for (let d = 0; d < 3; d++) {
      const z = -0.6 + d * 0.6;
      parts.push(
        kit.box([0.03, 1.02, 0.56], [BODY.x1 + 0.015, 0.58, z], 'glassBlue', { glow: 'windowWarm', light: 'window' }),
        kit.box([0.05, 0.4, 0.03], [BODY.x1 + 0.08, 0.58, z + 0.23], 'chrome'),
      );
      SHELF_YS.forEach((y, row) => {
        parts.push(kit.box([0.16, 0.03, 0.54], [BODY.x1 + 0.08, y, z], 'chrome'));
        for (let b = 0; b < 4; b++) {
          const bz = z - 0.2 + b * 0.133;
          const color = DRINKS[(d * 3 + row * 2 + b) % DRINKS.length];
          parts.push(
            kit.box([0.09, 0.2, 0.08], [BODY.x1 + 0.08, y + 0.115, bz], color),
            kit.box([0.04, 0.06, 0.04], [BODY.x1 + 0.08, y + 0.245, bz], color === 'white' ? 'sunYellow' : 'white'),
          );
        }
      });
    }
    // three cups on top
    for (let i = 0; i < 3; i++) {
      const z = -0.5 + i * 0.5;
      parts.push(
        kit.cylinder(0.06, 0.045, 0.1, [0.1, BODY.h + 0.1, z], (['pink', 'sunYellow', 'mint'] as const)[i], { segments: 8 }),
      );
    }
    return kit.finish(parts);
  },
};
