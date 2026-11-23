import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { aim } from '../../../models/parts';

// A satellite on a display stand (1x2, long side along z): gold foil body, blue solar wings out
// along z with white cell lines, a little white dish on top. Still.
const BASE = { r: 0.4, h: 0.07 };
const POST = { r: 0.07, top: 0.6 };
const BODY = { s: 0.38, y: 0.8 };
const WING = { len: 0.6, w: 0.46 }; // from the body outwards along z

/** ดาวเทียม: a satellite on a display stand with gold foil and blue solar wings. */
export const item: ItemModel = {
  id: 'satellite-stand',
  name: 'ดาวเทียม',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(BASE.r, BASE.r + 0.04, BASE.h, [0, BASE.h / 2, 0], 'blue', { segments: 14 }),
      kit.cylinder(BASE.r - 0.08, BASE.r - 0.08, 0.02, [0, BASE.h + 0.01, 0], 'stone', { segments: 14 }),
      kit.cylinder(POST.r, POST.r + 0.03, POST.top - BASE.h, [0, (POST.top + BASE.h) / 2, 0], 'stoneDark', { segments: 8 }),
      kit.cylinder(0.14, 0.14, 0.05, [0, POST.top, 0], 'red', { segments: 10 }),
      // gold-foil body with crinkled foil patches
      kit.box([BODY.s, BODY.s, BODY.s], [0, BODY.y, 0], 'sunYellow'),
      kit.box([BODY.s + 0.02, 0.07, BODY.s + 0.02], [0, BODY.y - 0.1, 0], 'brass'),
      kit.box([0.2, 0.05, 0.2], [0.02, BODY.y + BODY.s / 2 + 0.02, 0.03], 'brass', { rotate: [0.2, 0.5, 0.1] }),
      kit.box([0.02, 0.2, 0.22], [BODY.s / 2 + 0.01, BODY.y + 0.03, 0], 'brass', { rotate: [0.1, 0, 0.15] }),
      kit.box([0.02, 0.1, 0.1], [BODY.s / 2 + 0.02, BODY.y - 0.05, 0.1], 'sunYellow'),
      // little dish on top
      kit.cylinder(0.01, 0.01, 0.14, [0, BODY.y + BODY.s / 2 + 0.07, 0], 'chrome', { segments: 4 }),
      kit.cylinder(0.13, 0.04, 0.07, [0.07, BODY.y + BODY.s / 2 + 0.17, 0], 'white', { segments: 10, rotate: aim([0.5, 1, 0]) }),
      kit.sphere(0.03, [0.15, BODY.y + BODY.s / 2 + 0.26, 0], 'red', { detail: 0 }),
    ];
    // solar wings: arm, navy frame, blue panel, white cell lines
    for (const s of [-1, 1]) {
      const zc = s * (BODY.s / 2 + 0.08 + WING.len / 2);
      parts.push(
        kit.cylinder(0.025, 0.025, 0.2, [0, BODY.y, s * (BODY.s / 2 + 0.1)], 'chrome', { segments: 6, rotate: [Math.PI / 2, 0, 0] }),
        kit.box([WING.w + 0.05, 0.03, WING.len + 0.05], [0, BODY.y, zc], 'navy'),
        kit.box([WING.w - 0.02, 0.025, WING.len - 0.03], [0, BODY.y + 0.01, zc], 'blue'),
      );
      for (const k of [-1, 0, 1]) {
        parts.push(kit.box([WING.w - 0.02, 0.03, 0.02], [0, BODY.y + 0.012, zc + k * (WING.len / 3.4)], 'white'));
      }
      parts.push(kit.box([0.02, 0.03, WING.len - 0.03], [0, BODY.y + 0.012, zc], 'white'));
    }
    return kit.finish(parts);
  },
};
