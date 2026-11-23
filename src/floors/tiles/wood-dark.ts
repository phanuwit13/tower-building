import type { Part } from '../../models/kit';
import type { FloorTile } from '../types';

const BASE_H = 0.008; // the dark joints between the planks
const PLANK_H = 0.007; // top at 0.015, the most a tile may rise
const PLANK_D = 0.23; // four planks across the cell leave a 0.02 joint between them
const PLANK_Z = [-0.375, -0.125, 0.125, 0.375];

/** พื้นไม้เข้ม: four dark planks side by side, laid along x, with a nearly black joint. */
export const tile: FloorTile = {
  id: 'wood-dark',
  name: 'พื้นไม้เข้ม',
  group: 'wood',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'bark')];
    PLANK_Z.forEach((z, i) => {
      parts.push(kit.box([1, PLANK_H, PLANK_D], [0, BASE_H + PLANK_H / 2, z], i % 2 === 0 ? 'woodDark' : 'wood'));
    });
    return kit.finish(parts);
  },
};
