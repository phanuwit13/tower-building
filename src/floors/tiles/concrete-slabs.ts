import type { Part } from '../../models/kit';
import type { FloorTile } from '../types';

const BASE_H = 0.008; // the dark joints between the slabs
const SLAB_H = 0.007; // top at 0.015, the most a tile may rise
const SLAB = 0.48; // 2 x 2 slabs leave a 0.02 joint, also against the neighbouring cell
const AT = [-0.25, 0.25];

/** แผ่นปูนสี่เหลี่ยม: square concrete paving slabs, 2 x 2, in two greys. */
export const tile: FloorTile = {
  id: 'concrete-slabs',
  name: 'แผ่นปูนสี่เหลี่ยม',
  group: 'tile',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'stoneDark')];
    AT.forEach((x, i) => {
      AT.forEach((z, j) => {
        parts.push(kit.box([SLAB, SLAB_H, SLAB], [x, BASE_H + SLAB_H / 2, z], (i + j) % 2 === 0 ? 'stone' : 'chrome'));
      });
    });
    return kit.finish(parts);
  },
};
