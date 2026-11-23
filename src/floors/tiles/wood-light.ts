import type { Part } from '../../models/kit';
import type { FloorTile } from '../types';

const BASE_H = 0.008; // the dark joints between the planks
const PLANK_H = 0.007; // top at 0.015, the most a tile may rise
const PLANK_W = 0.23; // four planks across the cell leave a 0.02 joint between them
const PLANK_Z = [-0.375, -0.125, 0.125, 0.375];

/** ไม้อ่อน: four light planks side by side, laid along x. */
export const tile: FloorTile = {
  id: 'wood-light',
  name: 'พื้นไม้อ่อน',
  group: 'wood',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'wood')];
    PLANK_Z.forEach((z, i) => {
      parts.push(kit.box([1, PLANK_H, PLANK_W], [0, BASE_H + PLANK_H / 2, z], i % 2 === 0 ? 'sand' : 'cream'));
    });
    return kit.finish(parts);
  },
};
