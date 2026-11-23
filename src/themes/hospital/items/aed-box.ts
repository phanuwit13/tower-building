import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A green wall-style cabinet on a stand, door to +x, with a white plate and a pink heart.
const CAB = { y0: 0.6, h: 0.5, w: 0.34, d: 0.46 };
const FACE_X = CAB.w / 2;

/** ตู้ AED: a green cabinet on a stand with a heart icon. */
export const item: ItemModel = {
  id: 'aed-box',
  name: 'ตู้ AED',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const cy = CAB.y0 + CAB.h / 2;
    const parts: Part[] = [
      // stand: base plate, post
      kit.box([0.5, 0.04, 0.5], [0, 0.02, 0], 'stone'),
      kit.box([0.26, 0.04, 0.26], [0, 0.06, 0], 'stoneDark'),
      kit.box([0.12, CAB.y0 - 0.08, 0.12], [0, 0.08 + (CAB.y0 - 0.08) / 2, 0], 'white'),
      kit.box([0.1, 0.12, 0.3], [0, 0.2, 0], 'mint'),
      // cabinet: body, darker lid, door trim, white plate
      kit.box([CAB.w, CAB.h, CAB.d], [0, cy, 0], 'leaf'),
      kit.box([CAB.w + 0.06, 0.05, CAB.d + 0.06], [0, CAB.y0 + CAB.h + 0.025, 0], 'leafDark'),
      kit.box([CAB.w + 0.04, 0.04, CAB.d + 0.04], [0, CAB.y0 - 0.02, 0], 'leaf'),
      kit.box([0.02, CAB.h - 0.08, CAB.d - 0.08], [FACE_X + 0.01, cy, 0], 'lime'),
      kit.box([0.02, CAB.h - 0.2, CAB.d - 0.2], [FACE_X + 0.02, cy, 0], 'white'),
      kit.box([0.03, 0.04, 0.1], [FACE_X + 0.03, CAB.y0 + 0.07, 0.1], 'sunYellow'),
      // a small calm lamp on the lid
      kit.sphere(0.04, [0, CAB.y0 + CAB.h + 0.07, 0], 'lime', { detail: 0 }),
    ];
    // heart on the plate: two lobes and a point
    const hx = FACE_X + 0.04;
    const hy = cy + 0.01;
    parts.push(
      kit.cylinder(0.052, 0.052, 0.012, [hx, hy + 0.03, -0.045], 'pink', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.052, 0.052, 0.012, [hx, hy + 0.03, 0.045], 'pink', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.box([0.012, 0.085, 0.085], [hx, hy - 0.012, 0], 'pink', { rotate: [Math.PI / 4, 0, 0] }),
    );
    return kit.finish(parts);
  },
};
