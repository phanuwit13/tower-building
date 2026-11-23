import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A T-shaped perch (1 x 2, long side along z) on a stand with two bright parrots, facing +x.
// The bar and both parrots rock gently together about the top of the pole (ONE shared pivot).
const BASE_H = 0.05;
const BAR = { y: 1.0, len: 1.5, r: 0.04 };
const ROCK: MotionOpts = { kind: 'swing', pivot: [0, BAR.y, 0], axis: [1, 0, 0], amount: 0.05, speed: 1.2 };

/** A parrot perched on the bar at z, body `main`, belly `belly`, wing `wing`. */
function parrot(kit: StyleKit, parts: Part[], z: number, main: PaletteColor, belly: PaletteColor, wing: PaletteColor, tail: PaletteColor): void {
  const top = BAR.y + BAR.r;
  const p = (x: number, y: number, zz = 0): Vec3 => [x, top + y, z + zz];
  const m = { motion: ROCK };
  parts.push(
    kit.sphere(0.13, p(0, 0.2), main, { scale: [0.9, 1.35, 0.95], ...m }),
    kit.sphere(0.09, p(0.07, 0.17), belly, { detail: 0, scale: [0.7, 1.2, 0.9], ...m }),
    // wings at the sides, tail down the back
    kit.sphere(0.09, p(-0.03, 0.19, 0.115), wing, { detail: 0, scale: [0.8, 1.7, 0.5], ...m }),
    kit.sphere(0.09, p(-0.03, 0.19, -0.115), wing, { detail: 0, scale: [0.8, 1.7, 0.5], ...m }),
    kit.cylinder(0.045, 0.02, 0.3, p(-0.1, 0.1), tail, { segments: 6, rotate: [0, 0, 0.35], ...m }),
    // head, face patch, eye, beak
    kit.sphere(0.1, p(0.03, 0.46), main, { ...m }),
    kit.sphere(0.06, p(0.09, 0.44), 'white', { scale: [0.6, 1, 1.2], detail: 0, ...m }),
    kit.sphere(0.03, p(0.115, 0.47, 0.055), 'charcoal', { detail: 0, ...m }),
    kit.sphere(0.03, p(0.115, 0.47, -0.055), 'charcoal', { detail: 0, ...m }),
    kit.sphere(0.065, p(0.13, 0.42), 'sunYellow', { scale: [0.9, 1, 0.75], detail: 0, ...m }),
    kit.cone(0.03, 0.06, p(0.18, 0.38), 'charcoal', { segments: 6, rotate: [0, 0, Math.PI], ...m }),
    // feet on the bar
    kit.box([0.06, 0.03, 0.04], p(0.03, 0.0, 0.05), 'orange', { ...m }),
    kit.box([0.06, 0.03, 0.04], p(0.03, 0.0, -0.05), 'orange', { ...m }),
  );
}

/** นกแก้วบนคอน: a T-perch on a stand with two bright parrots; the bar rocks gently. */
export const item: ItemModel = {
  id: 'parrot-perch',
  name: 'นกแก้วบนคอน',
  category: 'animal',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.8, BASE_H, 1.7], [0, BASE_H / 2, 0], 'sand'),
      kit.cylinder(0.09, 0.14, 0.16, [0, BASE_H + 0.08, 0], 'stone', { segments: 8 }),
      kit.cylinder(0.05, 0.06, 0.85, [0, 0.525, 0], 'woodDark', { segments: 8 }),
      kit.sphere(0.07, [0, BAR.y - BAR.r - 0.03, 0], 'brass', { detail: 0 }),
      // the T bar (along z) and its caps
      kit.cylinder(BAR.r, BAR.r, BAR.len, [0, BAR.y, 0], 'wood', { segments: 8, rotate: [Math.PI / 2, 0, 0], motion: ROCK }),
      kit.sphere(BAR.r * 1.2, [0, BAR.y, BAR.len / 2], 'woodDark', { detail: 0, motion: ROCK }),
      kit.sphere(BAR.r * 1.2, [0, BAR.y, -BAR.len / 2], 'woodDark', { detail: 0, motion: ROCK }),
    ];
    parrot(kit, parts, 0.42, 'red', 'sunYellow', 'blue', 'blue');
    parrot(kit, parts, -0.4, 'blue', 'sunYellow', 'leaf', 'red');
    // a food dish on the base
    parts.push(kit.cylinder(0.12, 0.09, 0.05, [0.28, BASE_H + 0.025, 0.55], 'terracotta', { segments: 8 }), kit.sphere(0.08, [0.28, BASE_H + 0.05, 0.55], 'orange', { detail: 0, scale: [1, 0.5, 1] }));
    return kit.finish(parts);
  },
};
