import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

// A bunch of bright balloons on strings tied to a little weight (1×1). Still: no wind indoors.
const WEIGHT = { r: 0.15, h: 0.1 };
const TIE: [number, number, number] = [0, WEIGHT.h + 0.04, 0];
const BALLOONS: { at: [number, number, number]; c: PaletteColor }[] = [
  { at: [0.2, 1.22, 0.06], c: 'red' },
  { at: [-0.18, 1.3, 0.1], c: 'sunYellow' },
  { at: [0.02, 1.34, -0.2], c: 'skyBlue' },
  { at: [-0.1, 1.05, -0.26], c: 'pink' },
  { at: [0.14, 1.05, 0.3], c: 'lime' },
  { at: [-0.28, 1.1, 0.06], c: 'purple' },
  { at: [0.3, 1.06, -0.18], c: 'orange' },
];
const R = 0.16;

/** ลูกโป่ง: a bunch of bright balloons tied to a little weight. */
export const item: ItemModel = {
  id: 'balloon-bunch',
  name: 'ลูกโป่ง',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(WEIGHT.r, WEIGHT.r + 0.02, WEIGHT.h, [0, WEIGHT.h / 2, 0], 'stoneDark', { segments: 8 }),
      kit.cylinder(WEIGHT.r - 0.03, WEIGHT.r - 0.03, 0.02, [0, WEIGHT.h + 0.01, 0], 'teal', { segments: 8 }),
      kit.sphere(0.035, TIE, 'white', { detail: 0 }),
    ];
    for (const b of BALLOONS) {
      const bottom: [number, number, number] = [b.at[0], b.at[1] - R * 1.2 - 0.02, b.at[2]];
      parts.push(
        kit.sphere(R, b.at, b.c, { detail: 1, scale: [1, 1.2, 1] }),
        kit.cone(0.03, 0.05, [b.at[0], b.at[1] - R * 1.2 - 0.015, b.at[2]], b.c, { segments: 6, rotate: [Math.PI, 0, 0] }),
        rod(kit, TIE, bottom, 0.008, 'stoneDark', { segments: 4 }),
      );
    }
    return kit.finish(parts);
  },
};
