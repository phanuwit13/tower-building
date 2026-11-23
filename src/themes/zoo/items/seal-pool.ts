import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A round pool with a striped show platform; a seal sits on it balancing a beach ball on its nose.
const POOL = { r: 0.95, floor: 0.13, water: 0.06, rim: 0.075 };
const WATER_TOP = POOL.floor + POOL.water;
const PLAT = { x: -0.1, z: 0, r: 0.34, top: 0.5 };

/** สระแมวน้ำ: a round pool, a show platform and a seal with a ball on its nose. */
export const item: ItemModel = {
  id: 'seal-pool',
  name: 'สระแมวน้ำ',
  category: 'animal',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const sx = PLAT.x;
    const by = PLAT.top; // seal sits here
    const parts: Part[] = [
      kit.cylinder(POOL.r, POOL.r, POOL.floor, [0, POOL.floor / 2, 0], 'stone', { segments: 20 }),
      kit.cylinder(POOL.r - 0.12, POOL.r - 0.12, POOL.water, [0, POOL.floor + POOL.water / 2, 0], 'skyBlue', { segments: 20, motion: { kind: 'water', water: 'pool' } }),
      kit.torus(POOL.r - 0.075, POOL.rim, [0, WATER_TOP - 0.01, 0], 'white', { radialSegments: 6, tubularSegments: 20, rotate: [Math.PI / 2, 0, 0] }),
      // platform: red and white drum with a gold top
      kit.cylinder(PLAT.r, PLAT.r, PLAT.top - POOL.floor, [sx, (PLAT.top + POOL.floor) / 2, PLAT.z], 'red', { segments: 12 }),
      kit.cylinder(PLAT.r + 0.01, PLAT.r + 0.01, 0.06, [sx, WATER_TOP + 0.13, PLAT.z], 'white', { segments: 12 }),
      kit.cylinder(PLAT.r + 0.03, PLAT.r + 0.03, 0.04, [sx, PLAT.top - 0.02, PLAT.z], 'sunYellow', { segments: 12 }),
      // the seal: upright round body, head tipped up, flippers, tail flippers
      kit.sphere(0.2, [sx, by + 0.17, 0], 'stoneDark', { scale: [0.9, 1.1, 0.9] }),
      kit.sphere(0.14, [sx + 0.05, by + 0.14, 0], 'stone', { detail: 0, scale: [0.7, 1.3, 1] }),
      kit.sphere(0.14, [sx + 0.03, by + 0.46, 0], 'stoneDark', { scale: [1, 0.95, 1] }),
      kit.sphere(0.065, [sx + 0.14, by + 0.42, 0], 'stone', { detail: 0, scale: [1, 0.8, 1.3] }),
      kit.sphere(0.03, [sx + 0.2, by + 0.45, 0], 'charcoal', { detail: 0 }),
      kit.sphere(0.075, [sx - 0.18, by + 0.04, 0], 'stoneDark', { detail: 0, scale: [1.2, 0.5, 1.6] }),
      // beach ball on the nose
      kit.sphere(0.09, [sx + 0.2, by + 0.57, 0], 'red'),
      kit.sphere(0.092, [sx + 0.2, by + 0.57, 0], 'white', { detail: 0, scale: [0.5, 1, 1] }),
      kit.sphere(0.04, [sx + 0.2, by + 0.67, 0], 'sunYellow', { detail: 0 }),
      // floating ring
      kit.torus(0.1, 0.035, [0.45, WATER_TOP + 0.01, 0.4], 'orange', { rotate: [Math.PI / 2, 0, 0], radialSegments: 6, tubularSegments: 12 }),
    ];
    for (const s of [-1, 1]) {
      parts.push(
        kit.sphere(0.04, [sx + 0.15, by + 0.5, s * 0.07], 'white', { detail: 0 }),
        kit.sphere(0.022, [sx + 0.18, by + 0.5, s * 0.075], 'charcoal', { detail: 0 }),
        kit.sphere(0.065, [sx + 0.1, by + 0.15, s * 0.2], 'stoneDark', { detail: 0, scale: [0.7, 1.4, 0.5] }), // flippers
        kit.sphere(0.04, [sx + 0.17, by + 0.4, s * 0.05], 'stone', { detail: 0 }),
      );
    }
    return kit.finish(parts);
  },
};
