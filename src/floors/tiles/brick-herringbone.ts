import type { Part } from '../../models/kit';
import type { FloorTile } from '../types';

const BASE_H = 0.008; // the mortar
const BRICK_H = 0.007; // top at 0.015, the most a tile may rise
const U = 0.25; // one grid cell; a brick is 2 x 1 cells
const GAP = 0.01; // mortar inset on every side, the cell edge included, so a joint shows across cells

/** A brick covers the grid cells [c0, c1] x [r0, r1] (inclusive, 0..3); every side is inset by GAP, so cut halves meet their other half across the cell edge with a joint like any other. */
const brick = (parts: Part[], c0: number, c1: number, r0: number, r1: number, kit: Parameters<FloorTile['build']>[0], color: 'red' | 'terracotta') => {
  const x0 = -0.5 + c0 * U + GAP, x1 = -0.5 + (c1 + 1) * U - GAP;
  const z0 = -0.5 + r0 * U + GAP, z1 = -0.5 + (r1 + 1) * U - GAP;
  parts.push(kit.box([x1 - x0, BRICK_H, z1 - z0], [(x0 + x1) / 2, BASE_H + BRICK_H / 2, (z0 + z1) / 2], color));
};

/**
 * อิฐก้างปลา: a herringbone of 2 x 1 bricks on a 4 x 4 grid. Step k lays a flat brick over cells
 * (k, k+1) of row k and an upright one down column k+2, rows k-1..k; indices wrap, so the four
 * bricks that cross the cell edge are cut in two and meet their other half in the next cell.
 */
export const tile: FloorTile = {
  id: 'brick-herringbone',
  name: 'อิฐก้างปลา',
  group: 'stone',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'stone')];
    for (let k = 0; k < 4; k++) {
      const color = k % 2 === 0 ? 'red' : 'terracotta';
      const other = k % 2 === 0 ? 'terracotta' : 'red';
      // flat brick: columns k, k+1 of row k (wraps at k = 3)
      if (k < 3) brick(parts, k, k + 1, k, k, kit, color);
      else { brick(parts, 3, 3, 3, 3, kit, color); brick(parts, 0, 0, 3, 3, kit, color); }
      // upright brick: column (k+2) mod 4, rows k-1..k (wraps at k = 0)
      const c = (k + 2) % 4;
      if (k > 0) brick(parts, c, c, k - 1, k, kit, other);
      else { brick(parts, c, c, 3, 3, kit, other); brick(parts, c, c, 0, 0, kit, other); }
    }
    return kit.finish(parts);
  },
};
