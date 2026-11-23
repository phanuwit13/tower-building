import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { gableRoof } from '../../../models/parts';

const WALL = { r: 0.34, h: 0.3 };
const RING = { r: 0.28, tube: 0.07 }; // flat stone rim
const WATER_Y = 0.3;
const POST = { x: 0.28, z: 0.4, h: 0.9 };
const ROOF = { y: POST.h, rise: 0.3, width: 0.8, length: 0.9, eave: 0.04 };

/** บ่อน้ำ: a round brick well with a little roof, a pulley and a bucket on a rope. */
export const item: ItemModel = {
  id: 'well',
  name: 'บ่อน้ำ',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(WALL.r, WALL.r, WALL.h, [0, WALL.h / 2, 0], 'terracotta', { segments: 12 }),
      kit.cylinder(WALL.r + 0.01, WALL.r + 0.01, 0.025, [0, 0.1, 0], 'redDark', { segments: 12 }),
      kit.cylinder(WALL.r + 0.01, WALL.r + 0.01, 0.025, [0, 0.2, 0], 'redDark', { segments: 12 }),
      kit.torus(RING.r, RING.tube, [0, WALL.h + 0.02, 0], 'stone', { rotate: [Math.PI / 2, 0, 0], radialSegments: 6, tubularSegments: 12 }),
      // the water, seen below the rim
      kit.cylinder(0.22, 0.22, 0.03, [0, WATER_Y - 0.015 + 0.02, 0], 'navy', { segments: 12, motion: { kind: 'water', water: 'pond' } }),
    ];
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) parts.push(kit.cylinder(0.03, 0.03, POST.h, [sx * POST.x, POST.h / 2, sz * POST.z], 'woodDark', { segments: 6 }));
    }
    parts.push(
      ...gableRoof(kit, { at: [0, ROOF.y, 0], length: ROOF.length, width: ROOF.width, rise: ROOF.rise, eave: ROOF.eave, color: 'red', ridge: 'redDark', along: 'x' }),
      kit.wedge([ROOF.width, ROOF.rise, ROOF.length - 0.02], [0, ROOF.y + ROOF.rise / 2, 0], 'cream', { rotate: [0, Math.PI / 2, 0] }),
      // pulley hanging from the ridge, a rope and the bucket
      kit.box([0.04, 0.12, 0.04], [0, 1.09, 0], 'woodDark'),
      kit.cylinder(0.07, 0.07, 0.04, [0, 1.0, 0], 'stoneDark', { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.012, 0.012, 0.44, [0.06, 0.78, 0], 'stoneDark', { segments: 4 }),
      kit.cylinder(0.075, 0.06, 0.12, [0.06, 0.5, 0], 'wood', { segments: 8 }),
      kit.cylinder(0.078, 0.078, 0.02, [0.06, 0.53, 0], 'chrome', { segments: 8 }),
    );
    return kit.finish(parts);
  },
};
