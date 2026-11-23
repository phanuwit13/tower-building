import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';

// A round wicker basket with a cream cushion and a cat curled up asleep, a ball of yarn beside it.
const BASKET = { r: 0.4, rb: 0.34, h: 0.22, cushion: 0.23 };
const LOOK = 0.8; // the sleeper's head turns towards +x+z

/** แมวนอนในตะกร้า: a basket with a curled-up sleeping cat. */
export const item: ItemModel = {
  id: 'cat-basket',
  name: 'แมวนอนในตะกร้า',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const y0 = BASKET.cushion;
    const head: Vec3 = [0.12, y0 + 0.13, 0.13];
    /** A point on the head: f forward (towards the face), u up, s to the left. */
    const onHead = (f: number, u: number, s: number): Vec3 =>
      [head[0] + f * Math.cos(LOOK) - s * Math.sin(LOOK), head[1] + u, head[2] + f * Math.sin(LOOK) + s * Math.cos(LOOK)];
    const look: Vec3 = [0, -LOOK, 0];
    const parts: Part[] = [
      kit.cylinder(BASKET.r, BASKET.rb, BASKET.h, [0, BASKET.h / 2, 0], 'sand', { segments: 12 }),
      kit.cylinder(BASKET.r + 0.005, BASKET.r - 0.015, 0.04, [0, 0.12, 0], 'wood', { segments: 12 }), // weave band
      kit.torus(BASKET.r - 0.005, 0.035, [0, BASKET.h + 0.005, 0], 'woodDark', { rotate: [Math.PI / 2, 0, 0], tubularSegments: 12 }),
      kit.cylinder(BASKET.r - 0.03, BASKET.r - 0.03, 0.02, [0, BASKET.cushion - 0.01 + 0.0, 0], 'cream', { segments: 12 }),
      // the sleeping cat: a flat ring of body, round belly, head on its paws, ears and a curled tail
      kit.torus(0.16, 0.085, [0, y0 + 0.07, 0], 'orange', { rotate: [Math.PI / 2, 0, 0], tubularSegments: 12 }),
      kit.sphere(1, [0, y0 + 0.07, 0], 'orange', { detail: 1, scale: [0.2, 0.1, 0.2] }),
      kit.sphere(1, head, 'orange', { scale: [0.1, 0.09, 0.105], rotate: look }),
      kit.sphere(1, onHead(0.08, -0.02, 0), 'white', { detail: 0, scale: [0.06, 0.05, 0.075], rotate: look }),
      kit.sphere(0.02, onHead(0.125, 0.0, 0), 'pink', { detail: 0 }),
      kit.box([0.012, 0.012, 0.035], onHead(0.09, 0.03, -0.05), 'charcoal', { rotate: look }), // closed eyes: two little bars
      kit.box([0.012, 0.012, 0.035], onHead(0.09, 0.03, 0.05), 'charcoal', { rotate: look }),
      kit.sphere(1, [0.0, y0 + 0.03, 0.28], 'white', { detail: 0, scale: [0.06, 0.05, 0.05] }), // tail tip beside the paws
      // yarn ball outside
      kit.sphere(0.06, [0.36, 0.06, -0.32], 'red', { detail: 1 }),
      kit.torus(0.055, 0.008, [0.36, 0.06, -0.32], 'redDark', { rotate: [0.6, 0, 0.3], tubularSegments: 10 }),
    ];
    for (const s of [-1, 1]) {
      parts.push(
        kit.cone(0.045, 0.08, onHead(-0.01, 0.1, s * 0.065), 'orange', { segments: 3, rotate: [s * 0.3, -Math.PI / 2 - LOOK, 0] }),
      );
    }
    return kit.finish(parts);
  },
};
