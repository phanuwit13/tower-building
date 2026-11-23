import type { MotionOpts } from '../../models/motion';
import type { FloorTile } from '../types';

const WATER_H = 0.015;
// navy, like the pond: the night light is blue, so pale water would glare (see the sculpting guide).
const WATER: MotionOpts = { kind: 'water', water: 'pond' };

/** น้ำตื้น: a flat sheet of pond water; a block of these reads as one pool that shimmers together. */
export const tile: FloorTile = {
  id: 'water-shallow',
  name: 'น้ำตื้น',
  group: 'special',
  build: (kit) => kit.finish([kit.box([1, WATER_H, 1], [0, WATER_H / 2, 0], 'navy', { motion: WATER })]),
};
