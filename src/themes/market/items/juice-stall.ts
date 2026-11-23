import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A juice stall (1×2, front +x): a wooden counter with tall jugs of bright juice, crates of fruit
// out front and a tilted lime-and-white canvas roof with a glowing lamp.
const COUNTER = { w: 0.6, h: 0.42, d: 1.4 };
const POST_X = 0.25;
const POST_Z = 0.65;
const ROOF_Y = 1.08;
const STRIPES = 7;
const JUGS = [
  { z: -0.5, color: 'orange' },
  { z: -0.25, color: 'red' },
  { z: 0, color: 'lime' },
  { z: 0.25, color: 'pink' },
  { z: 0.5, color: 'purple' },
] as const;

/** แผงน้ำผลไม้: a stall with jugs of bright juices and fruit, a glowing lamp. */
export const item: ItemModel = {
  id: 'juice-stall',
  name: 'แผงน้ำผลไม้',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const top = COUNTER.h;
    const parts: Part[] = [
      kit.box([COUNTER.w, COUNTER.h, COUNTER.d], [0, COUNTER.h / 2, 0], 'wood'),
      kit.box([COUNTER.w + 0.02, 0.08, COUNTER.d + 0.02], [0, 0.04, 0], 'woodDark'),
      kit.box([COUNTER.w + 0.04, 0.04, COUNTER.d + 0.04], [0, top + 0.02, 0], 'white'),
      kit.box([0.02, 0.14, COUNTER.d], [COUNTER.w / 2 + 0.005, 0.24, 0], 'lime'),
    ];
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) parts.push(kit.box([0.05, ROOF_Y - 0.1 - top, 0.05], [sx * POST_X, (top + ROOF_Y - 0.1) / 2 + 0.02, sz * POST_Z], 'woodDark'));
    }
    // tilted striped canvas roof (higher at the back)
    const stripe = 1.4 / STRIPES;
    for (let i = 0; i < STRIPES; i++) {
      parts.push(kit.box([0.9, 0.04, stripe], [0, ROOF_Y, -0.7 + stripe * (i + 0.5)], i % 2 === 0 ? 'lime' : 'white', { rotate: [0, 0, -0.1] }));
    }
    // jugs of juice with white lids
    for (const j of JUGS) {
      parts.push(
        kit.cylinder(0.075, 0.075, 0.24, [-0.08, top + 0.04 + 0.12, j.z], j.color, { segments: 8 }),
        kit.cylinder(0.04, 0.075, 0.05, [-0.08, top + 0.04 + 0.265, j.z], j.color, { segments: 8 }),
        kit.cylinder(0.04, 0.04, 0.03, [-0.08, top + 0.04 + 0.305, j.z], 'white', { segments: 8 }),
      );
    }
    // a bowl of fruit and a cut watermelon on the counter, front edge
    parts.push(
      kit.dome(0.1, [0.14, top + 0.04, -0.4], 'red', { segments: 8 }),
      kit.cylinder(0.1, 0.1, 0.02, [0.14, top + 0.05, -0.4], 'white', { segments: 8 }),
      kit.sphere(0.06, [0.14, top + 0.04 + 0.06 * 0.851, 0.2], 'orange', { detail: 0 }),
      kit.sphere(0.06, [0.14, top + 0.04 + 0.06 * 0.851, 0.34], 'sunYellow', { detail: 0 }),
      kit.sphere(0.06, [0.14, top + 0.04 + 0.06 * 0.851, 0.48], 'lime', { detail: 0 }),
    );
    // fruit crates standing in front of the counter (inside the footprint)
    for (const z of [-0.35, 0.35]) {
      parts.push(
        kit.box([0.14, 0.16, 0.34], [0.4, 0.08, z], 'wood'),
        kit.sphere(0.06, [0.4, 0.16 + 0.04, z - 0.07], z < 0 ? 'orange' : 'red', { detail: 0 }),
        kit.sphere(0.06, [0.4, 0.16 + 0.04, z + 0.07], z < 0 ? 'lime' : 'sunYellow', { detail: 0 }),
      );
    }
    // glowing lamp and string bulbs hanging under the roof
    parts.push(
      kit.cylinder(0.01, 0.01, 0.16, [0.2, ROOF_Y - 0.12, 0], 'stoneDark', { segments: 4 }),
      kit.sphere(0.075, [0.2, ROOF_Y - 0.25, 0], 'lampWarm', { detail: 0, glow: true, light: 'breathe' }),
    );
    for (const z of [-0.5, -0.25, 0.25, 0.5]) parts.push(kit.sphere(0.04, [0.2, ROOF_Y - 0.1, z], 'lampWarm', { detail: 0, glow: true, light: 'breathe' }));
    return kit.finish(parts);
  },
};
