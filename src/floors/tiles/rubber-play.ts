import type { Part } from '../../models/kit';
import type { PaletteColor } from '../../models/palette';
import type { FloorTile } from '../types';

const BASE_H = 0.008; // the dark seams
const PAD_H = 0.007; // top at 0.015, the most a tile may rise
const PAD = 0.48; // four pads leave a 0.02 seam in the middle and along the edge of the cell
const PADS: Array<[number, number, PaletteColor]> = [[-0.25, -0.25, 'red'], [0.25, -0.25, 'sunYellow'], [-0.25, 0.25, 'blue'], [0.25, 0.25, 'leaf']];

/** พื้นยางสนามเด็กเล่น: four colourful rubber safety pads with seams, like a playground. */
export const tile: FloorTile = {
  id: 'rubber-play',
  name: 'พื้นยางสนามเด็กเล่น',
  group: 'special',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'charcoal')];
    for (const [x, z, c] of PADS) parts.push(kit.box([PAD, PAD_H, PAD], [x, BASE_H + PAD_H / 2, z], c));
    return kit.finish(parts);
  },
};
