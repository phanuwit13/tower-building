import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// 2x2. A flower garden; four big butterflies rest on the tallest flowers. Flowers and butterflies sway from the soil line.
const BASE = 0.04;
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, BASE, 0], amount: 0.16 };

/** Flowers: [x, z, stem height, petal colour]. */
const FLOWERS: Array<[number, number, number, PaletteColor]> = [
  [-0.75, -0.7, 0.3, 'pink'], [-0.35, -0.62, 0.36, 'sunYellow'], [0.1, -0.75, 0.3, 'red'], [0.55, -0.8, 0.34, 'purple'], [0.76, -0.45, 0.3, 'orange'],
  [-0.8, -0.25, 0.34, 'sunYellow'], [-0.45, -0.35, 0.28, 'purple'], [0.1, -0.3, 0.4, 'pink'], [0.5, -0.2, 0.3, 'sunYellow'],
  [-0.75, 0.2, 0.3, 'red'], [-0.35, 0.15, 0.4, 'orange'], [0.15, 0.2, 0.3, 'purple'], [0.6, 0.25, 0.36, 'pink'], [0.76, 0.6, 0.3, 'red'],
  [-0.7, 0.7, 0.34, 'purple'], [-0.2, 0.75, 0.3, 'pink'], [0.25, 0.6, 0.4, 'sunYellow'], [0.6, 0.8, 0.28, 'orange'],
];
/** Butterflies sit on flowers (index into FLOWERS): [flower index, wing colour, spot colour]. */
const BUTTERFLIES: Array<[number, PaletteColor, PaletteColor]> = [
  [7, 'blue', 'white'], [10, 'purple', 'sunYellow'], [16, 'red', 'sunYellow'], [1, 'orange', 'white'],
];

function butterfly(kit: Parameters<ItemModel['build']>[0], x: number, y: number, z: number, wing: PaletteColor, spot: PaletteColor): Part[] {
  const m = { motion: SWAY };
  const parts: Part[] = [kit.cylinder(0.02, 0.02, 0.17, [x, y, z], 'charcoal', { segments: 6, rotate: [0, 0, Math.PI / 2], ...m })];
  for (const s of [-1, 1]) {
    const tilt = -s * 0.4; // wings lift up and outward
    parts.push(
      kit.box([0.2, 0.014, 0.22], [x + 0.04, y + 0.04, z + s * 0.12], wing, { rotate: [tilt, 0, 0], ...m }),
      kit.box([0.14, 0.014, 0.15], [x - 0.09, y + 0.033, z + s * 0.1], wing, { rotate: [tilt, 0, 0], ...m }),
      kit.box([0.07, 0.014, 0.07], [x + 0.04, y + 0.058, z + s * 0.17], spot, { rotate: [tilt, 0, 0], ...m }),
    );
  }
  parts.push(kit.sphere(0.025, [x + 0.1, y + 0.01, z], 'charcoal', { detail: 0, ...m }));
  return parts;
}

/** สวนผีเสื้อ: a flower garden with big colourful butterflies resting on the flowers. */
export const item: ItemModel = {
  id: 'butterfly-garden',
  name: 'สวนผีเสื้อ',
  category: 'nature',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.96, BASE, 1.96], [0, BASE / 2, 0], 'lime'),
      kit.box([1.7, 0.03, 1.7], [0, BASE + 0.005, 0], 'leaf'),
    ];
    for (const [x, z, h, c] of FLOWERS) {
      parts.push(
        kit.cylinder(0.014, 0.014, h, [x, BASE + h / 2, z], 'leaf', { segments: 4, motion: SWAY }),
        kit.sphere(0.11, [x, BASE + h, z], c, { detail: 0, scale: [1, 0.55, 1], motion: SWAY }),
        kit.sphere(0.05, [x, BASE + h + 0.04, z], c === 'sunYellow' ? 'orange' : 'sunYellow', { detail: 0, motion: SWAY }),
        kit.sphere(0.07, [x + 0.05, BASE + 0.07, z - 0.04], 'leafDark', { detail: 0, scale: [1.2, 0.7, 1], motion: SWAY }),
      );
    }
    for (const [i, wing, spot] of BUTTERFLIES) {
      const [x, z, h] = FLOWERS[i];
      parts.push(...butterfly(kit, x, BASE + h + 0.09, z, wing, spot));
    }
    return kit.finish(parts);
  },
};
