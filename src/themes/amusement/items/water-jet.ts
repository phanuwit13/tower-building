import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A round stone basin (1x1) with a dark pond surface and a tall jet of water rising from a pedestal in the
// middle; drops fall in a ring around it.
const BASIN = { r: 0.46, floor: 0.16, rim: 0.05 };
const WATER = { r: 0.4, y: 0.19, t: 0.02 }; // top face at y + t / 2
const JET = { y0: 0.2, y1: 1.0 };

/** น้ำพุพุ่ง: small basin with a tall water jet. */
export const item: ItemModel = {
  id: 'water-jet',
  name: 'น้ำพุพุ่ง',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(BASIN.r - 0.04, BASIN.r, BASIN.floor, [0, BASIN.floor / 2, 0], 'stone', { segments: 16 }),
      kit.cylinder(WATER.r, WATER.r, WATER.t, [0, WATER.y, 0], 'navy', { segments: 16, motion: { kind: 'water', water: 'pond' } }),
      kit.torus(BASIN.r - 0.03, 0.05, [0, BASIN.floor + 0.04, 0], 'white', { rotate: [Math.PI / 2, 0, 0], radialSegments: 4, tubularSegments: 16 }),
      // pedestal, then the jet: a slim column topped with a splash
      kit.cylinder(0.08, 0.11, 0.1, [0, WATER.y + 0.04, 0], 'stoneDark', { segments: 8 }),
      kit.cylinder(0.025, 0.045, JET.y1 - JET.y0, [0, (JET.y0 + JET.y1) / 2, 0], 'glassBlue', { segments: 8 }),
      kit.sphere(0.1, [0, JET.y1 + 0.03, 0], 'glassBlue', { detail: 1, scale: [1, 0.75, 1] }),
    ];
    // drops falling around the jet, nearer the ground the further out they are
    [[0.14, 0.82], [0.22, 0.6], [0.3, 0.42]].forEach(([r, y], ring) => {
      for (let i = 0; i < 6; i++) {
        const a = ((i + (ring % 2) * 0.5) / 6) * Math.PI * 2;
        parts.push(kit.sphere(0.035, [Math.cos(a) * r, y, Math.sin(a) * r], 'glassBlue', { detail: 0, scale: [1, 1.3, 1] }));
      }
    });
    return kit.finish(parts);
  },
};
