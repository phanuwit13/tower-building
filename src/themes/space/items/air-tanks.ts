import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A rack of blue and white air tanks (1×2, long side along z): six upright tanks in two rows on a
// charcoal frame, each with a colour band, a rounded top and a yellow valve.
const BASE_H = 0.06;
const TANK_R = 0.17;
const TANK_H = 0.56;

function tank(kit: StyleKit, x: number, z: number, body: PaletteColor, band: PaletteColor): Part[] {
  const y0 = BASE_H;
  return [
    kit.cylinder(TANK_R, TANK_R, TANK_H, [x, y0 + TANK_H / 2, z], body, { segments: 10 }),
    kit.dome(TANK_R, [x, y0 + TANK_H, z], body, { segments: 8, scale: [1, 0.6, 1] }),
    kit.cylinder(TANK_R + 0.01, TANK_R + 0.01, 0.1, [x, y0 + 0.3, z], band, { segments: 10 }),
    kit.cylinder(0.035, 0.035, 0.08, [x, y0 + TANK_H + 0.12, z], 'sunYellow', { segments: 6 }),
    kit.box([0.1, 0.03, 0.03], [x, y0 + TANK_H + 0.16, z], 'red'),
  ];
}

/** ถังอากาศ: a rack of blue and white air tanks. */
export const item: ItemModel = {
  id: 'air-tanks',
  name: 'ถังอากาศ',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.92, BASE_H, 1.92], [0, BASE_H / 2, 0], 'charcoal'),
      // frame ends and top rails (the tops of the tanks stay visible)
      kit.box([0.06, 0.62, 0.06], [-0.43, 0.37, 0.9], 'orange'),
      kit.box([0.06, 0.62, 0.06], [0.43, 0.37, 0.9], 'orange'),
      kit.box([0.06, 0.62, 0.06], [-0.43, 0.37, -0.9], 'orange'),
      kit.box([0.06, 0.62, 0.06], [0.43, 0.37, -0.9], 'orange'),
      kit.box([0.06, 0.05, 1.86], [-0.43, 0.66, 0], 'orange'),
      kit.box([0.06, 0.05, 1.86], [0.43, 0.66, 0], 'orange'),
      kit.box([0.86, 0.05, 0.05], [0, 0.45, 0.9], 'orange'),
      kit.box([0.86, 0.05, 0.05], [0, 0.45, -0.9], 'orange'),
      kit.box([0.86, 0.05, 0.05], [0, 0.45, 0], 'stoneDark'),
    ];
    const zs = [-0.6, 0, 0.6];
    zs.forEach((z, i) => {
      parts.push(...tank(kit, 0.22, z, i % 2 ? 'white' : 'blue', i % 2 ? 'blue' : 'white'));
      parts.push(...tank(kit, -0.22, z, i % 2 ? 'blue' : 'white', i % 2 ? 'white' : 'blue'));
    });
    return kit.finish(parts);
  },
};
