import type { Part } from '../../models/kit';
import type { PaletteColor } from '../../models/palette';
import type { FloorTile } from '../types';

const BASE_H = 0.008; // the dark joints
const GAP = 0.012; // every slab is inset by this from its region, so joints are even (also across the cell edge)
/** Three bands of irregular slabs: [z from, z to, [x edges...]]; each band spans the whole cell, so it meets the next cell's band. */
const BANDS: Array<[number, number, number[]]> = [
  [-0.5, -0.18, [-0.5, -0.12, 0.26, 0.5]],
  [-0.18, 0.2, [-0.5, -0.28, 0.1, 0.34, 0.5]],
  [0.2, 0.5, [-0.5, 0.02, 0.5]],
];
const COLORS: PaletteColor[] = ['stone', 'cream', 'stone', 'sand', 'stone', 'cream', 'sand', 'stone', 'cream'];

/** หินแผ่นธรรมชาติ: irregular flagstones laid like crazy paving, each slab a slightly different height. */
export const tile: FloorTile = {
  id: 'flagstone',
  name: 'หินแผ่นธรรมชาติ',
  group: 'stone',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'stoneDark')];
    let n = 0;
    for (const [z0, z1, xs] of BANDS) {
      for (let i = 0; i + 1 < xs.length; i++) {
        const h = 0.0055 + ((n * 7) % 5) * 0.0004; // 0.0055 .. 0.0071
        const x0 = xs[i] + GAP, x1 = xs[i + 1] - GAP;
        parts.push(kit.box([x1 - x0, h, z1 - z0 - 2 * GAP], [(x0 + x1) / 2, BASE_H + h / 2, (z0 + z1) / 2], COLORS[n % COLORS.length]));
        n++;
      }
    }
    return kit.finish(parts);
  },
};
