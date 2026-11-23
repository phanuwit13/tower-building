import type { Part } from '../../models/kit';
import type { PaletteColor } from '../../models/palette';
import type { FloorTile } from '../types';

const BASE_H = 0.008; // the joints
const PAVER_H = 0.007; // top at 0.015
const GAP = 0.01;
const ROW = 1 / 3;
const W = 1 / 3;
const COLORS: PaletteColor[] = ['stone', 'sand', 'terracotta'];

/**
 * บล็อกตัวหนอน: interlocking concrete pavers in a stretcher bond. Three courses; the middle one is
 * shifted half a paver, so it begins and ends with half pavers flush on the cell edge (they join
 * the neighbour's half) and the whole thing tiles.
 */
export const tile: FloorTile = {
  id: 'paver-interlock',
  name: 'บล็อกตัวหนอน',
  group: 'stone',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'stoneDark')];
    for (let r = 0; r < 3; r++) {
      const z0 = -0.5 + r * ROW + GAP / 2, z1 = -0.5 + (r + 1) * ROW - GAP / 2;
      // pavers of this course: [x from, x to]; odd course shifted by half a paver
      const edges = r % 2 === 0 ? [-0.5, -0.5 + W, -0.5 + 2 * W, 0.5] : [-0.5, -0.5 + W / 2, -0.5 + 1.5 * W, 0.5];
      for (let i = 0; i + 1 < edges.length; i++) {
        const x0 = edges[i] + (i === 0 ? 0 : GAP / 2), x1 = edges[i + 1] - (i === edges.length - 2 ? 0 : GAP / 2);
        parts.push(kit.box([x1 - x0, PAVER_H, z1 - z0], [(x0 + x1) / 2, BASE_H + PAVER_H / 2, (z0 + z1) / 2], COLORS[(r + i) % 3]));
      }
    }
    return kit.finish(parts);
  },
};
