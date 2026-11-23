import type { Part } from '../../models/kit';
import type { FloorTile } from '../types';

const BASE_H = 0.012;
/** Pale grit flecks: [x, z, size, turn, height]. Heights differ so none z-fight; all clear of the cell edge. */
const FLECKS: Array<[number, number, number, number, number]> = [
  [-0.34, -0.3, 0.06, 0.5, 0.003], [-0.02, -0.4, 0.05, 1.2, 0.0025], [0.3, -0.26, 0.07, 0.2, 0.0028],
  [-0.4, 0.06, 0.05, 0.9, 0.0022], [-0.1, -0.06, 0.07, 0.4, 0.0026], [0.2, 0.1, 0.05, 1.1, 0.003],
  [0.4, 0.34, 0.06, 0.7, 0.0024], [-0.26, 0.36, 0.06, 0.3, 0.0027], [0.04, 0.32, 0.05, 1.4, 0.0021],
];

/** ยางมะตอย: dark road asphalt with a sprinkle of pale grit. */
export const tile: FloorTile = {
  id: 'asphalt',
  name: 'ยางมะตอย',
  group: 'tile',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'charcoal')];
    for (const [x, z, s, turn, h] of FLECKS) {
      parts.push(kit.box([s, h, s], [x, BASE_H + h / 2, z], 'stoneDark', { rotate: [0, turn, 0] }));
    }
    return kit.finish(parts);
  },
};
