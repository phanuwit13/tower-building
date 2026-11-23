import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const G = 0.03;
const DOG = { x: -0.08, z: -0.12 }; // faces +x
const BODY_Y = G + 0.17;
const BALL = { x: 0.3, z: -0.05, r: 0.06 };
const BOWL = { x: -0.1, z: 0.3, r: 0.1, h: 0.055 };

/** สุนัขกับลูกบอล: a friendly brown-and-cream dog standing beside a red ball and a blue water bowl. */
export const item: ItemModel = {
  id: 'park-dog',
  name: 'สุนัขกับลูกบอล',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const { x, z } = DOG;
    const parts: Part[] = [
      kit.box([0.96, G, 0.96], [0, G / 2, 0], 'lime'),
      kit.sphere(0.13, [x, BODY_Y, z], 'wood', { scale: [1.5, 0.85, 0.85] }),
      kit.sphere(0.075, [x + 0.04, BODY_Y - 0.04, z], 'cream', { scale: [1.5, 0.7, 0.9], detail: 0 }), // belly patch
      kit.sphere(0.1, [x + 0.2, BODY_Y + 0.08, z], 'wood', { detail: 0 }), // head
      kit.sphere(0.055, [x + 0.29, BODY_Y + 0.05, z], 'cream', { scale: [1.2, 0.85, 0.9], detail: 0 }), // snout
      kit.sphere(0.022, [x + 0.34, BODY_Y + 0.06, z], 'charcoal', { detail: 0 }), // nose
      kit.cone(0.035, 0.16, [x - 0.2, BODY_Y + 0.1, z], 'wood', { segments: 6, rotate: [0, 0, 0.9] }), // tail, up and back
      kit.sphere(0.03, [x - 0.28, BODY_Y + 0.17, z], 'cream', { detail: 0 }),
    ];
    for (const s of [-1, 1]) {
      parts.push(
        kit.sphere(0.018, [x + 0.27, BODY_Y + 0.12, z + s * 0.055], 'charcoal', { detail: 0 }), // eyes
        kit.wedge([0.05, 0.08, 0.04], [x + 0.17, BODY_Y + 0.15, z + s * 0.085], 'woodDark', { rotate: [0, 0, 0] }), // floppy ears
        kit.box([0.07, 0.1, 0.07], [x + 0.1, G + 0.05, z + s * 0.07], 'wood'), // front legs
        kit.box([0.07, 0.1, 0.07], [x - 0.13, G + 0.05, z + s * 0.07], 'wood'), // back legs
        kit.box([0.09, 0.025, 0.08], [x + 0.115, G + 0.0125 + 0.0, z + s * 0.07], 'cream'), // paws
      );
    }
    parts.push(
      kit.box([0.04, 0.04, 0.2], [x + 0.2, BODY_Y - 0.01, z], 'red'), // collar
      kit.sphere(BALL.r, [BALL.x, G + BALL.r * 0.851, BALL.z], 'sunYellow', { detail: 0 }),
      kit.torus(BALL.r * 0.95, 0.008, [BALL.x, G + BALL.r * 0.851, BALL.z], 'red', { radialSegments: 3, tubularSegments: 8, rotate: [0, 0.6, 0] }),
      kit.cylinder(BOWL.r, BOWL.r - 0.02, BOWL.h, [BOWL.x, G + BOWL.h / 2, BOWL.z], 'blue', { segments: 12 }),
      kit.cylinder(BOWL.r - 0.018, BOWL.r - 0.018, 0.01, [BOWL.x, G + BOWL.h + 0.001, BOWL.z], 'skyBlue', { segments: 12 }),
    );
    return kit.finish(parts);
  },
};
