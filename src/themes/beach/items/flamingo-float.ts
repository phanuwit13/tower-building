import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { rod } from '../../../models/parts';

// A pink flamingo swim ring floating in a patch of water (long side along z). The flamingo's neck and head
// rise at the +z end; its tail fans out behind.
const RIM = 0.03;
const WATER_TOP = 0.07;
const SEA: MotionOpts = { kind: 'water', water: 'pond' };
const RING = { z: -0.12, r: 0.32, tube: 0.12, y: WATER_TOP + 0.06 };

/** ห่วงยางฟลามิงโก: a pink flamingo swim ring floating on the water. */
export const item: ItemModel = {
  id: 'flamingo-float',
  name: 'ห่วงยางฟลามิงโก',
  category: 'play',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const nz = RING.z + RING.r; // the front of the ring, where the neck grows
    const parts: Part[] = [
      kit.box([0.96, RIM, 1.96], [0, RIM / 2, 0], 'sand'),
      kit.box([0.88, WATER_TOP - RIM, 1.88], [0, (WATER_TOP + RIM) / 2, 0], 'navy', { motion: SEA }),
      kit.torus(RING.r, RING.tube, [0, RING.y, RING.z], 'pink', { rotate: [Math.PI / 2, 0, 0], radialSegments: 8, tubularSegments: 16 }),
      // white stripes round the ring
      kit.torus(RING.r, RING.tube * 0.55, [0, RING.y + 0.075, RING.z], 'white', { rotate: [Math.PI / 2, 0, 0], radialSegments: 4, tubularSegments: 16 }),
      // neck: two rods in an S, then the head and beak
      rod(kit, [0, RING.y + 0.05, nz - 0.02], [0, RING.y + 0.36, nz + 0.1], 0.05, 'pink', { segments: 8 }),
      rod(kit, [0, RING.y + 0.34, nz + 0.1], [0, RING.y + 0.62, nz + 0.2], 0.045, 'pink', { segments: 8 }),
      kit.sphere(0.075, [0, RING.y + 0.66, nz + 0.24], 'pink'),
      kit.cone(0.035, 0.14, [0, RING.y + 0.63, nz + 0.35], 'orange', { segments: 6, rotate: [Math.PI / 2 + 0.3, 0, 0] }),
      kit.cone(0.02, 0.05, [0, RING.y + 0.6, nz + 0.41], 'charcoal', { segments: 6, rotate: [Math.PI / 2 + 0.5, 0, 0] }),
      // eyes, wings and tail
      kit.sphere(0.02, [0.06, RING.y + 0.69, nz + 0.27], 'charcoal', { detail: 0 }),
      kit.sphere(0.02, [-0.06, RING.y + 0.69, nz + 0.27], 'charcoal', { detail: 0 }),
      kit.sphere(0.14, [0.3, RING.y + 0.1, RING.z], 'pink', { scale: [0.35, 0.5, 1.2] }),
      kit.sphere(0.14, [-0.3, RING.y + 0.1, RING.z], 'pink', { scale: [0.35, 0.5, 1.2] }),
      kit.sphere(0.12, [0, RING.y + 0.1, RING.z - RING.r - 0.05], 'pink', { scale: [1.2, 0.5, 0.9] }),
    ];
    return kit.finish(parts);
  },
};
