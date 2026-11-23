import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Footprint 1x1 (front faces +x). A little pallet with two lying burlap sacks, one on top, and an open sack
// at the front with coffee beans spilling over its rim. No printing on the sacks.
const PALLET_H = 0.07;
const BEANS = [
  [0.3, 0.25], [0.36, 0.1], [0.34, -0.04], [0.4, -0.16], [0.28, -0.28], [0.42, 0.03], [0.38, 0.22], [0.32, -0.2], [0.44, -0.08], [0.24, 0.34],
] as const;

/** กระสอบเมล็ดกาแฟ: stacked burlap sacks with coffee beans spilling out. */
export const item: ItemModel = {
  id: 'coffee-sacks',
  name: 'กระสอบเมล็ดกาแฟ',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.92, PALLET_H, 0.92], [0, PALLET_H / 2, 0], 'woodDark'),
      kit.box([0.92, 0.02, 0.1], [0, PALLET_H + 0.01, 0.34], 'wood'),
      kit.box([0.92, 0.02, 0.1], [0, PALLET_H + 0.01, -0.34], 'wood'),
    ];
    const sack = (x: number, y: number, z: number, r: number, c: 'sand' | 'wood') => {
      parts.push(
        kit.sphere(r, [x, y, z], c, { scale: [0.95, 0.75, 1.15] }),
        kit.cylinder(0.05, 0.08, 0.1, [x - r * 0.75, y + r * 0.2, z], c, { segments: 8, rotate: [0, 0, Math.PI / 2.4] }),
        kit.cylinder(0.075, 0.075, 0.025, [x - r * 0.62, y + r * 0.16, z], 'woodDark', { segments: 8, rotate: [0, 0, Math.PI / 2.4] }),
      );
    };
    sack(-0.22, PALLET_H + 0.2, -0.2, 0.25, 'wood');
    sack(-0.22, PALLET_H + 0.2, 0.2, 0.25, 'sand');
    sack(-0.2, PALLET_H + 0.5, 0, 0.26, 'wood');
    // open sack standing at the front: rolled rim, dark beans heaped inside
    const sx = 0.2;
    parts.push(
      kit.cylinder(0.21, 0.23, 0.34, [sx, PALLET_H + 0.17, 0.0], 'sand', { segments: 10 }),
      kit.torus(0.2, 0.035, [sx, PALLET_H + 0.35, 0.0], 'wood', { radialSegments: 4, tubularSegments: 12, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.19, 0.19, 0.03, [sx, PALLET_H + 0.35, 0.0], 'bark', { segments: 10 }),
      kit.cylinder(0.215, 0.215, 0.03, [sx, PALLET_H + 0.1, 0.0], 'woodDark', { segments: 10 }),
    );
    const beanY = (n: number) => PALLET_H + 0.04 + (n % 3) * 0.004;
    BEANS.forEach(([x, z], i) => {
      parts.push(kit.sphere(0.035, [x, beanY(i) - 0.003 + 0.004, z], i % 3 === 0 ? 'woodDark' : 'bark', { detail: 0, scale: [1, 0.7, 0.8], rotate: [0, i * 1.3, 0] }));
    });
    // heap of beans in the open sack
    [[0.2, 0.0, 0.42], [0.14, 0.06, 0.4], [0.26, -0.05, 0.4], [0.18, -0.08, 0.41], [0.24, 0.07, 0.41]].forEach(([x, z, y], i) => {
      parts.push(kit.sphere(0.04, [x, PALLET_H + y, z], i % 2 ? 'woodDark' : 'bark', { detail: 0, scale: [1, 0.75, 0.85], rotate: [0, i * 0.9, 0] }));
    });
    return kit.finish(parts);
  },
};
