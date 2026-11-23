import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// An ornate fair-ground light pole: a stepped base, a purple pole with brass collars, a flat crown
// ring of eight bulbs that chase round, and a cone and ball on top.
const RING = { r: 0.22, y: 1.35 };
const BULBS = 8;

/** เสาไฟประดับ: a decorated pole with a ring of chasing bulbs. */
export const item: ItemModel = {
  id: 'light-pole',
  name: 'เสาไฟประดับ',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.2, 0.24, 0.08, [0, 0.04, 0], 'stoneDark', { segments: 8 }),
      kit.cylinder(0.12, 0.17, 0.12, [0, 0.14, 0], 'brass', { segments: 8 }),
      kit.cylinder(0.05, 0.05, 1.1, [0, 0.75, 0], 'purple', { segments: 8 }),
      kit.cylinder(0.08, 0.08, 0.05, [0, 0.5, 0], 'brass', { segments: 8 }),
      kit.cylinder(0.08, 0.08, 0.05, [0, 1.0, 0], 'brass', { segments: 8 }),
      kit.cylinder(0.12, 0.05, 0.1, [0, 1.3, 0], 'brass', { segments: 8 }),
      kit.torus(RING.r, 0.02, [0, RING.y, 0], 'pink', { radialSegments: 4, tubularSegments: 16, rotate: [Math.PI / 2, 0, 0] }),
      kit.cone(0.1, 0.2, [0, RING.y + 0.1, 0], 'red', { segments: 8 }),
      kit.sphere(0.05, [0, RING.y + 0.23, 0], 'sunYellow', { detail: 0 }),
    ];
    for (let index = 0; index < BULBS; index++) {
      const a = (index / BULBS) * Math.PI * 2;
      parts.push(kit.sphere(0.045, [RING.r * Math.cos(a), RING.y, -RING.r * Math.sin(a)], 'lampWarm',
        { detail: 0, glow: true, light: 'chase', chase: { index, count: BULBS } }));
    }
    return kit.finish(parts);
  },
};
