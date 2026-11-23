import type { Part } from '../../models/kit';
import type { PaletteColor } from '../../models/palette';
import type { FloorTile } from '../types';

const BASE_H = 0.01;
/** Clods and pebbles: [x, z, size, turn, height, colour]. Distinct heights, clear of the cell edge. */
const LUMPS: Array<[number, number, number, number, number, PaletteColor]> = [
  [-0.34, -0.3, 0.1, 0.4, 0.0045, 'bark'], [-0.04, -0.36, 0.08, 1.1, 0.0038, 'wood'], [0.3, -0.3, 0.11, 0.2, 0.005, 'bark'],
  [-0.4, 0.04, 0.07, 0.8, 0.0035, 'wood'], [-0.08, 0.0, 0.1, 1.3, 0.0042, 'sand'], [0.22, 0.06, 0.08, 0.6, 0.0036, 'bark'],
  [0.4, 0.3, 0.09, 0.3, 0.0046, 'wood'], [-0.3, 0.36, 0.09, 0.9, 0.004, 'bark'], [0.06, 0.34, 0.07, 1.4, 0.0034, 'sand'],
  [0.38, -0.02, 0.06, 0.7, 0.003, 'sand'],
];

/** ดิน: bare brown earth with darker clods and a few light pebbles. */
export const tile: FloorTile = {
  id: 'dirt',
  name: 'ดิน',
  group: 'earth',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'woodDark')];
    for (const [x, z, s, turn, h, color] of LUMPS) {
      parts.push(kit.box([s, h, s * 0.8], [x, BASE_H + h / 2, z], color, { rotate: [0, turn, 0] }));
    }
    return kit.finish(parts);
  },
};
