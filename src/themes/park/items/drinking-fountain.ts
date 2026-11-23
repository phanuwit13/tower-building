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
      kit.box([0.98, BASE, 0.98], [0, BASE / 2, 0], 'cream'),
      kit.box([STEP.w, STEP.h, STEP.d], [STEP.x, BASE + STEP.h / 2, 0], 'sunYellow'),
      kit.box([STEP.w - 0.04, 0.014, STEP.d - 0.04], [STEP.x, BASE + STEP.h + 0.007, 0], 'orange'),
      // the post: a bright teal column on a white foot
      kit.box([POST.w + 0.1, 0.06, POST.w + 0.1], [-0.05, BASE + 0.03, 0], 'white'),
      kit.box([POST.w, POST.h, POST.w], [-0.05, BASE + POST.h / 2, 0], 'teal'),
      // basin on top: a big white bowl, sky-blue hollow, a blue drain disc
      kit.box([0.64, 0.08, 0.52], [0, BOWL_Y + 0.04, 0], 'white'),
      kit.box([0.52, 0.02, 0.4], [0, BOWL_Y + 0.085, 0], 'skyBlue'),
      kit.cylinder(0.05, 0.05, 0.015, [0.08, BOWL_Y + 0.1, 0], 'blue', { segments: 8 }),
      // spout: a chrome pipe up from the back of the bowl, curving over the basin, with a thin jet of water
      kit.cylinder(0.045, 0.055, 0.2, [-0.2, BOWL_Y + 0.18, 0], 'chrome', { segments: 8 }),
      rod(kit, [-0.2, BOWL_Y + 0.28, 0], [-0.03, BOWL_Y + 0.3, 0], 0.03, 'chrome', { segments: 6 }),
      kit.sphere(0.04, [-0.02, BOWL_Y + 0.29, 0], 'chrome', { detail: 0 }),
      kit.cylinder(0.014, 0.014, 0.17, [-0.02, BOWL_Y + 0.2, 0], 'glassBlue', { segments: 4 }),
      // push button on the +x face of the post
      kit.cylinder(0.055, 0.055, 0.03, [-0.05 + POST.w / 2 + 0.015, BASE + 0.38, 0], 'red', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
    ];
    // a puddle and a little flower by the post
    parts.push(
      kit.cylinder(0.08, 0.08, 0.008, [0.32, BASE + 0.004, 0.36], 'skyBlue', { segments: 8 }),
      kit.cylinder(0.012, 0.016, 0.16, [-0.38, BASE + 0.08, -0.36], 'leaf', { segments: 4 }),
      kit.sphere(0.045, [-0.38, BASE + 0.18, -0.36], 'pink', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
