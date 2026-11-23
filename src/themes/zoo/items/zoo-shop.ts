import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, glassWindow } from '../../../models/parts';

// A pink-roofed gift shop, front on +x. A giant plush bear sits on the roof as the sign;
// small plushies sit on the window sill under a red and white awning.
const BASE = 0.04;
const WALL = { w: 1.1, l: 1.5, h: 0.6, x: -0.35 }; // x = centre
const WALL_TOP = BASE + WALL.h;
const FRONT = WALL.x + WALL.w / 2; // x of the front wall
const ROOF = { w: 1.3, l: 1.7, t: 0.06 };
const ROOF_TOP = WALL_TOP + ROOF.t + 0.01;

/** The big plush bear on the roof, facing +x. */
function giantBear(kit: Parameters<ItemModel['build']>[0]): Part[] {
  const cx = WALL.x;
  const y = ROOF_TOP;
  const head: [number, number, number] = [cx + 0.05, y + 0.62, 0];
  const parts: Part[] = [
    kit.sphere(1, [cx, y + 0.27, 0], 'wood', { scale: [0.3, 0.28, 0.28] }),
    kit.sphere(1, [cx + 0.1, y + 0.27, 0], 'sand', { detail: 0, scale: [0.2, 0.22, 0.2] }), // tummy
    kit.sphere(0.21, head, 'wood'),
    kit.sphere(0.09, [head[0] + 0.15, head[1] - 0.05, 0], 'sand', { detail: 0, scale: [1.1, 0.85, 1.1] }),
    kit.sphere(0.035, [head[0] + 0.235, head[1] - 0.02, 0], 'charcoal', { detail: 0 }),
    kit.box([0.04, 0.07, 0.2], [head[0] + 0.1, head[1] - 0.17, 0], 'sunYellow'), // bow tie
  ];
  for (const sz of [-1, 1]) {
    parts.push(
      kit.sphere(0.075, [head[0] - 0.04, head[1] + 0.18, sz * 0.15], 'wood', { detail: 0 }), // ears
      kit.sphere(0.032, [head[0] + 0.15, head[1] + 0.06, sz * 0.08], 'charcoal', { detail: 0 }), // eyes
      kit.sphere(0.1, [cx + 0.2, y + 0.07, sz * 0.15], 'wood', { detail: 0, scale: [1.3, 0.8, 0.9] }), // feet
      kit.sphere(0.09, [cx + 0.12, y + 0.32, sz * 0.29], 'wood', { detail: 0, scale: [0.9, 1.2, 0.8] }), // arms
    );
  }
  return parts;
}

/** ร้านของฝาก: the souvenir shop with a giant plush bear sign and plushies in the window. */
export const item: ItemModel = {
  id: 'zoo-shop',
  name: 'ร้านของฝาก',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.9, BASE, 1.9], [0, BASE / 2, 0], 'stone'),
      kit.box([WALL.w, WALL.h, WALL.l], [WALL.x, BASE + WALL.h / 2, 0], 'mint'),
      kit.box([ROOF.w, ROOF.t, ROOF.l], [WALL.x, WALL_TOP + ROOF.t / 2 + 0.005, 0], 'pink'),
      ...door(kit, { at: [FRONT, BASE + 0.22, -0.45], facing: 'x+', w: 0.26, h: 0.44, color: 'woodDark', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [FRONT, 0.38, 0.35], facing: 'x+', w: 0.5, h: 0.26, panes: 3 }),
      ...glassWindow(kit, { at: [WALL.x, 0.36, 0.75], facing: 'z+', w: 0.5, h: 0.26 }),
      ...glassWindow(kit, { at: [WALL.x, 0.36, -0.75], facing: 'z-', w: 0.5, h: 0.26 }),
      ...glassWindow(kit, { at: [WALL.x - WALL.w / 2, 0.36, 0], facing: 'x-', w: 0.5, h: 0.26 }),
      // window sill with three little plushies
      kit.box([0.1, 0.04, 0.6], [FRONT + 0.06, 0.2, 0.35], 'white'),
      kit.sphere(0.07, [FRONT + 0.07, 0.29, 0.15], 'orange', { detail: 0 }),
      kit.sphere(0.07, [FRONT + 0.07, 0.29, 0.35], 'purple', { detail: 0 }),
      kit.sphere(0.07, [FRONT + 0.07, 0.29, 0.55], 'sunYellow', { detail: 0 }),
      ...giantBear(kit),
      // a blue elephant plush at the front and a toy crate
      kit.sphere(1, [0.7, BASE + 0.13, 0.55], 'skyBlue', { scale: [0.16, 0.13, 0.13] }),
      kit.sphere(0.1, [0.82, BASE + 0.24, 0.55], 'skyBlue', { detail: 0 }),
      kit.sphere(0.08, [0.82, BASE + 0.25, 0.43], 'skyBlue', { detail: 0, scale: [0.4, 1, 1] }),
      kit.sphere(0.08, [0.82, BASE + 0.25, 0.67], 'skyBlue', { detail: 0, scale: [0.4, 1, 1] }),
      kit.cylinder(0.025, 0.035, 0.14, [0.91, BASE + 0.15, 0.55], 'skyBlue', { segments: 6 }),
      kit.sphere(0.012, [0.86, BASE + 0.27, 0.51], 'charcoal', { detail: 0 }),
      kit.sphere(0.012, [0.86, BASE + 0.27, 0.59], 'charcoal', { detail: 0 }),
      kit.box([0.3, 0.2, 0.34], [0.7, BASE + 0.1, -0.55], 'wood'),
      kit.sphere(0.1, [0.7, BASE + 0.27, -0.55], 'pink', { detail: 0 }),
    ];
    // striped awning over the front: red and white boards, low end out
    for (let i = 0; i < 5; i++) {
      parts.push(kit.box([0.46, 0.03, 0.3], [FRONT + 0.2, 0.5, -0.6 + i * 0.3], i % 2 === 0 ? 'red' : 'white', { rotate: [0, 0, -0.3] }));
    }
    return kit.finish(parts);
  },
};
