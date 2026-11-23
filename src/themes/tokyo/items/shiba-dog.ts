import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A friendly shiba dog (1×1) standing on a round lawn patch, facing +x: orange coat, cream chest, muzzle and socks, a curled tail.
const PAD = 0.03;
const LEG_H = 0.09;
const BODY_Y = PAD + 0.16;
const HEAD = { x: 0.2, y: PAD + 0.25, r: 0.105 };

/** สุนัขชิบะ: a friendly shiba with a curled tail. */
export const item: ItemModel = {
  id: 'shiba-dog',
  name: 'สุนัขชิบะ',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.42, 0.44, PAD, [0, PAD / 2, 0], 'lime', { segments: 12 }),
      // body, cream chest and belly
      kit.sphere(0.16, [-0.02, BODY_Y, 0], 'orange', { scale: [1.35, 0.85, 0.85] }),
      kit.sphere(0.1, [0.12, BODY_Y - 0.02, 0], 'cream', { scale: [0.7, 1, 1] }),
      // legs and white socks
      ...[
        [0.13, 0.07],
        [0.13, -0.07],
        [-0.14, 0.07],
        [-0.14, -0.07],
      ].flatMap(([x, z]) => [
        kit.cylinder(0.035, 0.04, LEG_H, [x, PAD + LEG_H / 2, z], 'orange', { segments: 8 }),
        kit.box([0.075, 0.03, 0.06], [x + 0.012, PAD + 0.015, z], 'cream'),
      ]),
      // head: cheeks, muzzle, nose, eyes, ears
      kit.sphere(HEAD.r, [HEAD.x, HEAD.y, 0], 'orange'),
      kit.sphere(0.06, [HEAD.x + 0.01, HEAD.y - 0.035, 0.06], 'cream', { detail: 0 }),
      kit.sphere(0.06, [HEAD.x + 0.01, HEAD.y - 0.035, -0.06], 'cream', { detail: 0 }),
      kit.sphere(0.055, [HEAD.x + 0.09, HEAD.y - 0.035, 0], 'cream', { scale: [1.1, 0.8, 1] }),
      kit.sphere(0.022, [HEAD.x + 0.145, HEAD.y - 0.01, 0], 'charcoal', { detail: 0 }),
      kit.sphere(0.017, [HEAD.x + 0.085, HEAD.y + 0.035, 0.05], 'charcoal', { detail: 0 }),
      kit.sphere(0.017, [HEAD.x + 0.085, HEAD.y + 0.035, -0.05], 'charcoal', { detail: 0 }),
      kit.cone(0.045, 0.09, [HEAD.x - 0.02, HEAD.y + 0.13, 0.07], 'orange', { segments: 6 }),
      kit.cone(0.045, 0.09, [HEAD.x - 0.02, HEAD.y + 0.13, -0.07], 'orange', { segments: 6 }),
      kit.cone(0.022, 0.05, [HEAD.x - 0.005, HEAD.y + 0.125, 0.07], 'cream', { segments: 6 }),
      kit.cone(0.022, 0.05, [HEAD.x - 0.005, HEAD.y + 0.125, -0.07], 'cream', { segments: 6 }),
      // curled tail: a ring seen from the side, rising from the rump
      kit.torus(0.07, 0.03, [-0.24, BODY_Y + 0.1, 0], 'orange', { radialSegments: 4, tubularSegments: 12, arc: Math.PI * 1.6, rotate: [0, 0, 0.9] }),
      kit.sphere(0.035, [-0.22, BODY_Y + 0.0, 0], 'orange', { detail: 0 }),
    ];
    return kit.finish(parts);
  },
};
