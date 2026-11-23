import type { Part } from '../../models/kit';
import type { FloorTile } from '../types';

const BASE_H = 0.008; // the dark joints
const SLAT_H = 0.007; // top at 0.015, the most a tile may rise
const SLAT = 0.15; // three slats make one square of 0.48
const PITCH = 0.165;
const SQUARE_LEN = 0.48;
const SQUARES: Array<[number, number]> = [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]];

/** ไม้ปาร์เก้ตาราง: basket-weave squares of three slats each, the slats turning a quarter between squares. */
export const tile: FloorTile = {
  id: 'parquet-square',
  name: 'ไม้ปาร์เก้ตาราง',
  group: 'wood',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'woodDark')];
    SQUARES.forEach(([cx, cz], s) => {
      const alongX = (s === 0 || s === 3);
      for (const k of [-1, 0, 1]) {
        const size: [number, number, number] = alongX ? [SQUARE_LEN, SLAT_H, SLAT] : [SLAT, SLAT_H, SQUARE_LEN];
        const at: [number, number, number] = alongX
          ? [cx, BASE_H + SLAT_H / 2, cz + k * PITCH]
          : [cx + k * PITCH, BASE_H + SLAT_H / 2, cz];
        parts.push(kit.box(size, at, alongX ? 'wood' : 'sand'));
      }
    });
    return kit.finish(parts);
  },
};
