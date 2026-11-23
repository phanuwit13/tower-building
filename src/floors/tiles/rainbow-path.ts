import type { Part } from '../../models/kit';
import type { PaletteColor } from '../../models/palette';
import type { FloorTile } from '../types';

const H = 0.012;
const BANDS: PaletteColor[] = ['red', 'orange', 'sunYellow', 'leaf', 'skyBlue', 'purple'];

/** ทางสีรุ้ง: six rainbow stripes running along x, so a line of these is one long rainbow. */
export const tile: FloorTile = {
  id: 'rainbow-path',
  name: 'ทางสีรุ้ง',
  group: 'special',
  build: (kit) => {
    const d = 1 / BANDS.length;
    const parts: Part[] = BANDS.map((c, i) => kit.box([1, H, d], [0, H / 2, -0.5 + d * (i + 0.5)], c));
    return kit.finish(parts);
  },
};
