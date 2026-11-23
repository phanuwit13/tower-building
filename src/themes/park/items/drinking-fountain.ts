import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// 1×1. A drinking fountain on a stone post with a little step on the +x side.
const BASE = 0.03;
const STEP = { x: 0.3, w: 0.4, d: 0.5, h: 0.1 };
const POST = { w: 0.26, h: 0.56 };
const BOWL_Y = BASE + POST.h;

/** ก๊อกน้ำดื่ม: a drinking fountain on a stone post with a step. */
export const item: ItemModel = {
  id: 'drinking-fountain',
  name: 'ก๊อกน้ำดื่ม',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.98, BASE, 0.98], [0, BASE / 2, 0], 'stone'),
      kit.box([STEP.w, STEP.h, STEP.d], [STEP.x, BASE + STEP.h / 2, 0], 'stoneDark'),
      kit.box([STEP.w - 0.04, 0.014, STEP.d - 0.04], [STEP.x, BASE + STEP.h + 0.007, 0], 'stone'),
      // the post
      kit.box([POST.w + 0.1, 0.06, POST.w + 0.1], [-0.05, BASE + 0.03, 0], 'stoneDark'),
      kit.box([POST.w, POST.h, POST.w], [-0.05, BASE + POST.h / 2, 0], 'stone'),
      // basin on top: a wide white bowl with a darker hollow and a drain
      kit.box([0.46, 0.07, 0.4], [0, BOWL_Y + 0.035, 0], 'white'),
      kit.box([0.36, 0.02, 0.3], [0.0, BOWL_Y + 0.075, 0], 'chrome'),
      kit.cylinder(0.03, 0.03, 0.02, [0.04, BOWL_Y + 0.088, 0], 'stoneDark', { segments: 8 }),
      // spout: a short pipe from the back wall of the bowl, curving to the front, a bubble of water
      kit.cylinder(0.04, 0.05, 0.16, [-0.14, BOWL_Y + 0.16, 0], 'chrome', { segments: 8 }),
      rod(kit, [-0.14, BOWL_Y + 0.24, 0], [-0.04, BOWL_Y + 0.26, 0], 0.025, 'chrome', { segments: 6 }),
      kit.sphere(0.03, [-0.02, BOWL_Y + 0.25, 0], 'chrome', { detail: 0 }),
      kit.cylinder(0.014, 0.014, 0.1, [-0.02, BOWL_Y + 0.19, 0], 'glassBlue', { segments: 4 }),
      // push button on the +x face of the post, a blue ring round it
      kit.cylinder(0.05, 0.05, 0.03, [-0.05 + POST.w / 2 + 0.015, BASE + 0.38, 0], 'blue', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.028, 0.028, 0.04, [-0.05 + POST.w / 2 + 0.02, BASE + 0.38, 0], 'sunYellow', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
    ];
    // a puddle and a little flower by the post
    parts.push(
      kit.cylinder(0.08, 0.08, 0.008, [0.32, BASE + 0.004, 0.36], 'glassBlue', { segments: 8 }),
      kit.cylinder(0.012, 0.016, 0.16, [-0.38, BASE + 0.08, -0.36], 'leaf', { segments: 4 }),
      kit.sphere(0.045, [-0.38, BASE + 0.18, -0.36], 'pink', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
