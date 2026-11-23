import type { ItemModel } from '../../../models/contract';
import { ICO_LOW } from '../../../models/parts';
import type { Part } from '../../../models/kit';

// A wide oval crater: a shallow stone rim, a frozen blue floor with pale ice shards, rocks on the rim.
const RX = 0.78; // rim radius across x
const STRETCH = 1.5; // the crater is longer along z
const TUBE = 0.08; // rim tube radius (the rim is 2 * TUBE high)
const FLOOR_TOP = 0.03;

/** หลุมน้ำแข็ง: a wide crater with frozen blue ice and rocks on the rim. */
export const item: ItemModel = {
  id: 'ice-crater',
  name: 'หลุมน้ำแข็ง',
  category: 'nature',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.torus(RX, TUBE, [0, TUBE, 0], 'stoneDark', { radialSegments: 5, tubularSegments: 20, rotate: [Math.PI / 2, 0, 0], scale: [1, STRETCH, 1] }),
      kit.cylinder(RX, RX, FLOOR_TOP, [0, FLOOR_TOP / 2, 0], 'blue', { segments: 20, scale: [1, 1, STRETCH] }),
      kit.cylinder(RX * 0.8, RX * 0.8, 0.012, [0, FLOOR_TOP + 0.006, 0], 'skyBlue', { segments: 16, scale: [1, 1, STRETCH] }),
    ];
    // pale ice shards standing in the floor
    const shards: [number, number, number, number][] = [
      [0.1, -0.35, 0.28, 0.06], [-0.3, 0.2, 0.2, 0.05], [0.28, 0.55, 0.22, 0.05], [-0.15, 0.75, 0.16, 0.045], [0.05, 0.1, 0.14, 0.04],
    ];
    for (const [x, z, h, r] of shards) parts.push(kit.cone(r, h, [x, FLOOR_TOP + h / 2, z], 'glassBlue', { segments: 5 }));
    // rocks on the rim (detail-0 balls rest on y = 0)
    const rocks: [number, number, number, 'stone' | 'purple' | 'charcoal' | 'stoneDark', number][] = [
      [RX, 0.1, 0.2, 'stone', 0.9], [-RX * 0.9, -0.5, 0.17, 'purple', 0.8], [0.55, -1.12, 0.22, 'stoneDark', 1], [-0.6, 1.1, 0.19, 'stone', 1.1], [0.4, 1.15, 0.13, 'charcoal', 0.8],
      [-RX - 0.02, 0.55, 0.12, 'stoneDark', 1],
    ];
    for (const [x, z, r, c, sy] of rocks) parts.push(kit.sphere(r, [x, r * sy * ICO_LOW, z], c, { detail: 0, scale: [1, sy, 1], rotate: [0, x * 5, 0] }));
    return kit.finish(parts);
  },
};
