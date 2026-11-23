import type { Part } from '../../models/kit';
import type { PaletteColor } from '../../models/palette';
import type { FloorTile } from '../types';

const BASE_H = 0.01;
/** Chips: [x, z, size, turn (rad), height above the base, colour]. Heights all differ so crossing chips never z-fight; all stay clear of the cell edge. */
const CHIPS: Array<[number, number, number, number, number, PaletteColor]> = [
  [-0.36, -0.34, 0.1, 0.4, 0.005, 'stone'], [-0.1, -0.38, 0.08, 1.1, 0.004, 'terracotta'], [0.16, -0.32, 0.11, 0.2, 0.0045, 'stoneDark'],
  [0.38, -0.36, 0.07, 0.8, 0.0035, 'sunYellow'], [-0.28, -0.08, 0.09, 1.3, 0.0048, 'terracotta'], [-0.02, -0.04, 0.12, 0.6, 0.0042, 'stone'],
  [0.26, 0.02, 0.08, 0.1, 0.0038, 'stoneDark'], [0.4, 0.3, 0.1, 1.0, 0.0046, 'stone'], [-0.38, 0.3, 0.08, 0.5, 0.0036, 'stoneDark'],
  [-0.12, 0.34, 0.1, 0.9, 0.0044, 'terracotta'], [0.14, 0.38, 0.07, 1.4, 0.004, 'sunYellow'], [0.0, 0.17, 0.06, 0.3, 0.003, 'stone'],
];

/** หินขัด: a pale terrazzo floor, flecked with chips of stone, clay and gold. */
export const tile: FloorTile = {
  id: 'terrazzo',
  name: 'หินขัด',
  group: 'tile',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'white')];
    for (const [x, z, s, turn, h, color] of CHIPS) {
      parts.push(kit.box([s, h, s * 0.8], [x, BASE_H + h / 2, z], color, { rotate: [0, turn, 0] }));
    }
    return kit.finish(parts);
  },
};
