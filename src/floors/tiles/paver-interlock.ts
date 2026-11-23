import type { Part } from '../../models/kit';
import type { PaletteColor } from '../../models/palette';
import type { FloorTile } from '../types';

const BASE_H = 0.008; // the joints
const PAVER_H = 0.007; // top at 0.015
const JOINT = 0.01; // inset of every paver from its slot, on all four sides (the cell edge included)
const ROW = 1 / 3;
const W = 1 / 3;
const COLORS: PaletteColor[] = ['stone', 'sand', 'terracotta'];
/** Paver slots of a course along x. The middle course is shifted half a paver: half pavers at both ends. */
const FULL_COURSE = [-0.5, -0.5 + W, -0.5 + 2 * W, 0.5];
const SHIFTED_COURSE = [-0.5, -0.5 + W / 2, -0.5 + 1.5 * W, 0.5 - W / 2, 0.5];

/**
 * บล็อกตัวหนอน: interlocking concrete pavers in a stretcher bond. Three courses of equal height;
 * the middle course is shifted half a paver. Every paver is inset by the same joint from its
 * slot, also on the cell edge, so a joint shows across cells and the pattern lines up.
 */
export const tile: FloorTile = {
  id: 'paver-interlock',
  name: 'บล็อกตัวหนอน',
  group: 'stone',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'stoneDark')];
    for (let r = 0; r < 3; r++) {
      const z0 = -0.5 + r * ROW + JOINT, z1 = -0.5 + (r + 1) * ROW - JOINT;
      const edges = r % 2 === 0 ? FULL_COURSE : SHIFTED_COURSE;
      for (let i = 0; i + 1 < edges.length; i++) {
        const x0 = edges[i] + JOINT, x1 = edges[i + 1] - JOINT;
        parts.push(kit.box([x1 - x0, PAVER_H, z1 - z0], [(x0 + x1) / 2, BASE_H + PAVER_H / 2, (z0 + z1) / 2], COLORS[(r + i) % 3]));
      }
    }
    return kit.finish(parts);
  },
};
