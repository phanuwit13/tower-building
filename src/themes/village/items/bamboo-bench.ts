import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const TOP = 0.35; // a raised bamboo platform (the shared 0.35)
const LEN = 1.6;
const POLE_R = 0.035;

/** แคร่ไม้ไผ่: a low bamboo platform bench with a woven mat, a pillow and a palm fan on it. */
export const item: ItemModel = {
  id: 'bamboo-bench',
  name: 'แคร่ไม้ไผ่',
  category: 'seating',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    // bamboo poles side by side, lying along z
    for (let i = 0; i < 8; i++) {
      parts.push(kit.cylinder(POLE_R, POLE_R, LEN, [-0.35 + 0.1 * i, TOP - POLE_R, 0], i % 2 ? 'sand' : 'lime', { segments: 8, rotate: [Math.PI / 2, 0, 0] }));
    }
    for (const z of [-0.6, 0.6]) {
      parts.push(kit.box([0.84, 0.05, 0.06], [0, TOP - 2 * POLE_R - 0.025, z], 'woodDark'));
      for (const x of [-0.37, 0.37]) parts.push(kit.cylinder(0.04, 0.04, TOP - 2 * POLE_R - 0.05, [x, (TOP - 2 * POLE_R - 0.05) / 2, z], 'wood', { segments: 8 }));
    }
    // woven mat with stripes, pillow, and a round palm fan with a handle
    const matTop = TOP + 0.03;
    parts.push(kit.box([0.56, 0.03, 1.1], [0, TOP + 0.015, 0.1], 'red'));
    for (const x of [-0.17, 0, 0.17]) parts.push(kit.box([0.06, 0.04, 1.1], [x, TOP + 0.02, 0.1], 'cream'));
    parts.push(
      kit.sphere(0.12, [0, matTop + 0.07, -0.38], 'pink', { scale: [1.2, 0.6, 1.3], detail: 1 }),
      kit.cylinder(0.14, 0.14, 0.02, [0.02, matTop + 0.01, 0.42], 'sunYellow', { segments: 10 }),
      kit.box([0.04, 0.02, 0.18], [0.02, matTop + 0.01, 0.6], 'woodDark'),
    );
    return kit.finish(parts);
  },
};
