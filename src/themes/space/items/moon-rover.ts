import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

const WHEEL = { r: 0.15, w: 0.14, x: 0.37, zs: [-0.6, 0, 0.6] }; // six chunky wheels, three a side
const BODY = { w: 0.5, h: 0.16, l: 1.3, y: 0.3 };

/** รถสำรวจ: a six-wheeled robot rover with a camera mast and a solar panel (nobody on board). */
export const item: ItemModel = {
  id: 'moon-rover',
  name: 'รถสำรวจ',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BODY.w, BODY.h, BODY.l], [0, BODY.y, 0], 'white'),
      kit.box([BODY.w + 0.04, 0.05, BODY.l - 0.2], [0, BODY.y - 0.02, 0], 'teal'), // teal belt
      kit.box([0.4, 0.08, 0.5], [0, BODY.y + BODY.h / 2 + 0.04, 0.3], 'orange'), // equipment box
    ];
    // rocker bars and wheels
    for (const s of [-1, 1]) {
      parts.push(kit.box([0.05, 0.05, 1.2], [s * (WHEEL.x - 0.05), WHEEL.r + 0.03, 0], 'charcoal'));
      for (const z of WHEEL.zs) {
        parts.push(
          kit.cylinder(WHEEL.r, WHEEL.r, WHEEL.w, [s * WHEEL.x, WHEEL.r, z], 'charcoal', { rotate: [0, 0, Math.PI / 2] }),
          kit.cylinder(0.08, 0.08, WHEEL.w + 0.03, [s * WHEEL.x, WHEEL.r, z], 'sunYellow', { rotate: [0, 0, Math.PI / 2], segments: 8 }),
        );
      }
    }
    // camera mast at the front (+z): a pole and a camera head with two lenses
    const top = 0.72;
    parts.push(
      kit.cylinder(0.025, 0.03, top - 0.38, [0, (top + 0.38) / 2, 0.42], 'stoneDark', { segments: 6 }),
      kit.box([0.26, 0.14, 0.14], [0, top + 0.05, 0.42], 'orange'),
      kit.sphere(0.045, [0.06, top + 0.05, 0.5], 'skyBlue', { detail: 0 }),
      kit.sphere(0.045, [-0.06, top + 0.05, 0.5], 'skyBlue', { detail: 0 }),
    );
    // solar panel at the back, tilted up, on a short stand
    const tilt = 0.35;
    parts.push(
      kit.box([0.56, 0.04, 0.5], [0, 0.5, -0.38], 'navy', { rotate: [tilt, 0, 0] }),
      kit.box([0.5, 0.02, 0.04], [0, 0.515, -0.38], 'skyBlue', { rotate: [tilt, 0, 0] }),
      rod(kit, [0.2, BODY.y + BODY.h / 2, -0.5], [0.2, 0.46, -0.45], 0.025, 'stoneDark', { segments: 4 }),
      rod(kit, [-0.2, BODY.y + BODY.h / 2, -0.5], [-0.2, 0.46, -0.45], 0.025, 'stoneDark', { segments: 4 }),
    );
    return kit.finish(parts);
  },
};
