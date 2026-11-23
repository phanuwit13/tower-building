import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A red-and-white fire hydrant (1×1): a stout red body on a white flange, a white dome cap, two
// side outlets and a bigger front outlet facing +x.
const BODY = { r: 0.15, h: 0.5, y0: 0.06 };

/** หัวดับเพลิง: a red-and-white fire hydrant. */
export const item: ItemModel = {
  id: 'fire-hydrant',
  name: 'หัวดับเพลิง',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const top = BODY.y0 + BODY.h;
    const outletY = BODY.y0 + 0.3;
    const parts: Part[] = [
      kit.cylinder(0.22, 0.24, BODY.y0, [0, BODY.y0 / 2, 0], 'white', { segments: 10 }),
      kit.cylinder(BODY.r, BODY.r + 0.02, BODY.h, [0, BODY.y0 + BODY.h / 2, 0], 'red', { segments: 10 }),
      kit.cylinder(0.19, 0.19, 0.05, [0, top - 0.05, 0], 'white', { segments: 10 }),
      kit.dome(0.15, [0, top, 0], 'red', { segments: 8 }),
      kit.cylinder(0.05, 0.05, 0.06, [0, top + 0.15 + 0.02, 0], 'white', { segments: 6 }),
    ];
    for (const s of [-1, 1]) {
      parts.push(
        kit.cylinder(0.06, 0.06, 0.12, [0, outletY, s * (BODY.r + 0.04)], 'red', { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
        kit.cylinder(0.075, 0.075, 0.04, [0, outletY, s * (BODY.r + 0.12)], 'white', { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
      );
    }
    parts.push(
      kit.cylinder(0.08, 0.08, 0.12, [BODY.r + 0.04, outletY - 0.02, 0], 'red', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.1, 0.1, 0.04, [BODY.r + 0.12, outletY - 0.02, 0], 'white', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.sphere(0.03, [BODY.r + 0.15, outletY - 0.02, 0], 'sunYellow', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
