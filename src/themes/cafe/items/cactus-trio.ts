import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Three cacti in colourful pots: a tall one with two arms, a round one with a pink flower and a
// paddle one made of flat ovals.
const POT_H = 0.16;

/** กระบองเพชรสามกระถาง: three small cacti in colourful pots. */
export const item: ItemModel = {
  id: 'cactus-trio',
  name: 'กระบองเพชรสามกระถาง',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [];
    const pot = (x: number, z: number, r: number, c: 'terracotta' | 'teal' | 'sunYellow' | 'pink') => {
      parts.push(
        kit.cylinder(r, r * 0.78, POT_H, [x, POT_H / 2, z], c, { segments: 8 }),
        kit.cylinder(r + 0.015, r + 0.015, 0.035, [x, POT_H - 0.0175, z], c, { segments: 8 }),
        kit.cylinder(r - 0.01, r - 0.01, 0.01, [x, POT_H, z], 'bark', { segments: 8 }),
      );
    };
    // tall saguaro, back left
    pot(-0.22, -0.2, 0.17, 'terracotta');
    const sx = -0.22;
    const sz = -0.2;
    parts.push(
      kit.cylinder(0.075, 0.08, 0.5, [sx, POT_H + 0.25, sz], 'leaf', { segments: 8 }),
      kit.sphere(0.075, [sx, POT_H + 0.5, sz], 'leaf', { detail: 1 }),
      kit.cylinder(0.04, 0.04, 0.1, [sx + 0.11, POT_H + 0.25, sz], 'leaf', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.04, 0.04, 0.2, [sx + 0.15, POT_H + 0.35, sz], 'leaf', { segments: 8 }),
      kit.sphere(0.04, [sx + 0.15, POT_H + 0.45, sz], 'leaf', { detail: 0 }),
      kit.cylinder(0.04, 0.04, 0.1, [sx - 0.11, POT_H + 0.32, sz], 'leaf', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.04, 0.04, 0.16, [sx - 0.15, POT_H + 0.4, sz], 'leaf', { segments: 8 }),
      kit.sphere(0.04, [sx - 0.15, POT_H + 0.48, sz], 'leaf', { detail: 0 }),
      kit.sphere(0.03, [sx, POT_H + 0.58, sz], 'pink', { detail: 0 }),
    );
    // round barrel cactus with a flower, front
    pot(0.25, 0.15, 0.17, 'teal');
    parts.push(
      kit.sphere(0.16, [0.25, POT_H + 0.1, 0.15], 'leafDark', { detail: 1, scale: [1, 0.9, 1] }),
      kit.sphere(0.045, [0.25, POT_H + 0.25, 0.15], 'sunYellow', { detail: 0 }),
      kit.sphere(0.025, [0.25, POT_H + 0.28, 0.15], 'orange', { detail: 0 }),
    );
    // paddle cactus, back right
    pot(0.12, -0.3, 0.13, 'sunYellow');
    parts.push(
      kit.sphere(1, [0.12, POT_H + 0.12, -0.3], 'mint', { detail: 1, scale: [0.14, 0.12, 0.04], rotate: [0, 0.6, 0] }),
      kit.sphere(1, [0.17, POT_H + 0.27, -0.3], 'mint', { detail: 1, scale: [0.1, 0.1, 0.035], rotate: [0, 0.6, 0.3] }),
      kit.sphere(1, [0.05, POT_H + 0.24, -0.3], 'mint', { detail: 1, scale: [0.09, 0.09, 0.035], rotate: [0, 0.6, -0.3] }),
      kit.sphere(0.03, [0.17, POT_H + 0.36, -0.3], 'red', { detail: 0 }),
    );
    // a little pebble yard
    parts.push(kit.sphere(0.04, [-0.3, 0.04, 0.3], 'stone', { detail: 0 }), kit.sphere(0.03, [-0.15, 0.03, 0.38], 'stoneDark', { detail: 0 }));
    return kit.finish(parts);
  },
};
