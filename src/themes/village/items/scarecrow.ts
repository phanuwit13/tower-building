import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A straw scarecrow on a pole, facing +x. Arms run along z. The sleeves and three ribbons are cloth strips that `wave`,
// each cloth with ONE pivot at the point where it leaves the still body, so nothing tears or cuts through the torso.
const ARM_Y = 1.0;
const TORSO = { w: 0.2, h: 0.34, d: 0.16, y: 0.86 };
const HEAD = { r: 0.13, y: 1.2 };
const SLEEVE = { z0: 0.08, len: 0.28, strip: 0.05, depth: 0.14 };

const waveFrom = (pivot: [number, number, number], axis: [number, number, number]): MotionOpts => ({ kind: 'wave', pivot, axis });

/** หุ่นไล่กา: a straw scarecrow in a hat with flapping sleeves and ribbons. */
export const item: ItemModel = {
  id: 'scarecrow',
  name: 'หุ่นไล่กา',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.22, 0.26, 0.04, [0, 0.02, 0], 'bark', { segments: 12 }), // soil mound
      kit.cylinder(0.04, 0.04, 1.2, [0, 0.64, 0], 'woodDark', { segments: 8 }), // the pole
      kit.cylinder(0.025, 0.025, 0.9, [0, ARM_Y, 0], 'wood', { segments: 8, rotate: [Math.PI / 2, 0, 0] }), // the arm bar
      kit.box([TORSO.d, TORSO.h, TORSO.w], [0, TORSO.y, 0], 'blue'), // shirt body (still)
      kit.box([0.02, 0.1, 0.1], [TORSO.d / 2 + 0.01, TORSO.y - 0.02, 0.0], 'red'), // patch
      // trousers and straw legs
      kit.box([0.07, 0.4, 0.07], [0, 0.45, 0.055], 'terracotta'),
      kit.box([0.07, 0.4, 0.07], [0, 0.45, -0.055], 'terracotta'),
      ...[-0.07, 0.07].map((z) => kit.cone(0.05, 0.1, [0, 0.04, z], 'sunYellow', { segments: 5, scale: [1.2, 0.6, 1] })),
      // head with a sack-cloth face
      kit.sphere(HEAD.r, [0, HEAD.y, 0], 'cream', { detail: 1 }),
      kit.box([0.03, 0.035, 0.03], [HEAD.r - 0.005, HEAD.y + 0.02, 0.05], 'charcoal'),
      kit.box([0.03, 0.035, 0.03], [HEAD.r - 0.005, HEAD.y + 0.02, -0.05], 'charcoal'),
      kit.cone(0.03, 0.06, [HEAD.r + 0.02, HEAD.y - 0.02, 0], 'orange', { segments: 6, rotate: [0, 0, -Math.PI / 2] }),
      kit.box([0.025, 0.02, 0.1], [HEAD.r - 0.012, HEAD.y - 0.075, 0], 'redDark'),
      // straw hat
      kit.cylinder(0.26, 0.26, 0.03, [0, 1.3, 0], 'sand', { segments: 12 }),
      kit.cylinder(0.12, 0.14, 0.14, [0, 1.385, 0], 'sand', { segments: 12 }),
      kit.cylinder(0.145, 0.145, 0.035, [0, 1.34, 0], 'red', { segments: 12 }),
      // straw tufts at the neck
      ...[0.1, -0.1].map((z) => kit.cone(0.04, 0.1, [0.02, 1.05, z], 'sunYellow', { segments: 5, rotate: [0, 0, 0.3] })),
    ];
    const colours: PaletteColor[] = ['blue', 'teal', 'blue'];
    // sleeves: strips stacked in y, running out along +z and -z from the shoulder
    for (const sz of [1, -1]) {
      const m = waveFrom([0, ARM_Y, sz * SLEEVE.z0], [0, 0, sz]);
      for (let i = 0; i < 3; i++) {
        parts.push(kit.box([SLEEVE.depth, SLEEVE.strip, SLEEVE.len],
          [0, ARM_Y + (i - 1) * SLEEVE.strip, sz * (SLEEVE.z0 + SLEEVE.len / 2)], colours[i], { motion: m }));
      }
      parts.push(kit.cone(0.05, 0.1, [0, ARM_Y, sz * (SLEEVE.z0 + SLEEVE.len + 0.05)], 'sunYellow', { segments: 5, rotate: [sz * (Math.PI / 2), 0, 0] }));
      // ribbon from the hand streaming back (-x)
      const rm = waveFrom([-0.0, ARM_Y - 0.1, sz * 0.4], [-1, 0, 0]);
      const rc: PaletteColor[] = ['sunYellow', 'orange', 'sunYellow'];
      for (let i = 0; i < 3; i++) {
        parts.push(kit.box([0.3, 0.025, 0.02], [-0.15, ARM_Y - 0.1 + (i - 1) * 0.025, sz * 0.4], rc[i], { motion: rm }));
      }
    }
    // hat ribbon streaming back
    const hm = waveFrom([-0.14, 1.36, 0], [-1, 0, 0]);
    const hc: PaletteColor[] = ['red', 'pink', 'red'];
    for (let i = 0; i < 3; i++) {
      parts.push(kit.box([0.3, 0.03, 0.02], [-0.29, 1.36 + (i - 1) * 0.03, 0], hc[i], { motion: hm }));
    }
    return kit.finish(parts);
  },
};
