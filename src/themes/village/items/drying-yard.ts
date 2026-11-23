import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A concrete yard with golden rice spread in raked stripes, a wooden rake and two baskets of grain.
const SLAB_H = 0.03;
const CURB = { w: 0.06, h: 0.07 };
const RICE_H = 0.04;
const STRIPES = 7; // raked stripes along z
const STRIPE_W = 0.18;
const STRIPE_X0 = -0.85;
const STRIPE_LEN = 1.7;

/** ลานตากข้าว: a drying yard of golden rice with a wooden rake and baskets. */
export const item: ItemModel = {
  id: 'drying-yard',
  name: 'ลานตากข้าว',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.96, SLAB_H, 1.96], [0, SLAB_H / 2, 0], 'stone'),
      kit.box([1.96, CURB.h, CURB.w], [0, CURB.h / 2, 0.98 - CURB.w / 2], 'stoneDark'),
      kit.box([1.96, CURB.h, CURB.w], [0, CURB.h / 2, -0.98 + CURB.w / 2], 'stoneDark'),
      kit.box([CURB.w, CURB.h, 1.96 - 2 * CURB.w], [0.98 - CURB.w / 2, CURB.h / 2, 0], 'stoneDark'),
      kit.box([CURB.w, CURB.h, 1.96 - 2 * CURB.w], [-0.98 + CURB.w / 2, CURB.h / 2, 0], 'stoneDark'),
    ];
    for (let i = 0; i < STRIPES; i++) {
      const x = STRIPE_X0 + i * (STRIPE_W + 0.0) + STRIPE_W / 2;
      parts.push(kit.box([STRIPE_W - 0.02, RICE_H, STRIPE_LEN], [x, SLAB_H + RICE_H / 2, 0], i % 2 === 0 ? 'sunYellow' : 'sand'));
    }
    // a heap being turned
    parts.push(kit.dome(0.26, [-0.35, SLAB_H + RICE_H, -0.2], 'sunYellow', { segments: 8, scale: [1, 0.5, 1] }));
    // wooden rake lying on the bare strip at the +x side
    parts.push(
      kit.box([0.04, 0.04, 0.85], [0.78, SLAB_H + 0.02, 0.45], 'wood'),
      kit.box([0.34, 0.035, 0.045], [0.78, SLAB_H + 0.0175, 0.9], 'woodDark'),
      ...[-0.13, -0.065, 0, 0.065, 0.13].map((dx) => kit.box([0.02, 0.03, 0.08], [0.78 + dx, SLAB_H + 0.015, 0.95], 'woodDark')),
    );
    // two baskets of grain
    for (const [x, z] of [[0.75, -0.7], [0.72, -0.25]] as const) {
      parts.push(
        kit.cylinder(0.16, 0.12, 0.14, [x, SLAB_H + 0.07, z], 'sand', { segments: 10 }),
        kit.cylinder(0.165, 0.165, 0.03, [x, SLAB_H + 0.14, z], 'wood', { segments: 10 }),
        kit.dome(0.13, [x, SLAB_H + 0.15, z], 'sunYellow', { segments: 8, scale: [1, 0.55, 1] }),
      );
    }
    return kit.finish(parts);
  },
};
