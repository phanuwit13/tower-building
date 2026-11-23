import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A single bed along z (head at -z), empty: pillow, blanket, side rails and a small teddy sitting at the foot.
const MATT_TOP = 0.45;
const W = 0.84;

/** เตียงผู้ป่วย: a single bed with rails, a pillow, a blanket and a small teddy. */
export const item: ItemModel = {
  id: 'hospital-bed',
  name: 'เตียงผู้ป่วย',
  category: 'seating',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([W, 0.12, 1.84], [0, 0.22, 0], 'white'),
      kit.box([W - 0.06, 0.15, 1.76], [0, MATT_TOP - 0.075, 0], 'glassBlue'),
      // head board (tall) and foot board (low)
      kit.box([W + 0.06, 0.62, 0.06], [0, 0.4, -0.94], 'mint'),
      kit.box([W + 0.06, 0.34, 0.06], [0, 0.32, 0.94], 'mint'),
      kit.box([W + 0.06, 0.05, 0.08], [0, 0.73, -0.94], 'white'),
      // pillow
      kit.box([0.5, 0.1, 0.3], [0, MATT_TOP + 0.05, -0.7], 'white'),
      kit.box([0.46, 0.02, 0.26], [0, MATT_TOP + 0.105, -0.7], 'cream'),
      // blanket with a band
      kit.box([W + 0.02, 0.06, 1.0], [0, MATT_TOP + 0.03, 0.3], 'pink'),
      kit.box([W + 0.04, 0.07, 0.14], [0, MATT_TOP + 0.035, -0.12], 'sunYellow'),
    ];
    // four little wheels and legs
    for (const x of [-0.3, 0.3]) {
      for (const z of [-0.76, 0.76]) {
        parts.push(kit.cylinder(0.035, 0.035, 0.1, [x, 0.12, z], 'stoneDark', { segments: 8 }));
        parts.push(kit.cylinder(0.06, 0.06, 0.05, [x, 0.06, z], 'charcoal', { segments: 8, rotate: [0, 0, Math.PI / 2] }));
      }
    }
    // side rails: top bar, lower bar and posts, both sides
    for (const x of [-W / 2 - 0.02, W / 2 + 0.02]) {
      parts.push(
        kit.box([0.03, 0.03, 1.1], [x, 0.6, 0.05], 'chrome'),
        kit.box([0.03, 0.03, 1.1], [x, 0.5, 0.05], 'chrome'),
      );
      for (const z of [-0.5, -0.1, 0.3, 0.6]) parts.push(kit.box([0.03, 0.13, 0.03], [x, 0.55, z], 'chrome'));
    }
    // a small teddy sitting on the blanket near the foot (faces +x)
    const tz = 0.62;
    const ty = MATT_TOP + 0.06;
    parts.push(
      kit.sphere(0.09, [0, ty + 0.08, tz], 'sand', { detail: 0 }),
      kit.sphere(0.07, [0.02, ty + 0.2, tz], 'sand', { detail: 0 }),
      kit.sphere(0.035, [0.07, ty + 0.19, tz], 'wood', { detail: 0 }),
      kit.sphere(0.025, [0.1, ty + 0.2, tz], 'charcoal', { detail: 0 }),
      kit.sphere(0.03, [0.02, ty + 0.27, tz - 0.06], 'sand', { detail: 0 }),
      kit.sphere(0.03, [0.02, ty + 0.27, tz + 0.06], 'sand', { detail: 0 }),
      kit.sphere(0.03, [0.07, ty + 0.05, tz - 0.07], 'wood', { detail: 0 }),
      kit.sphere(0.03, [0.07, ty + 0.05, tz + 0.07], 'wood', { detail: 0 }),
      kit.sphere(0.028, [0.06, ty + 0.11, tz - 0.1], 'sand', { detail: 0 }),
      kit.sphere(0.028, [0.06, ty + 0.11, tz + 0.1], 'sand', { detail: 0 }),
      kit.box([0.02, 0.04, 0.1], [0.085, ty + 0.12, tz], 'pink'),
    );
    return kit.finish(parts);
  },
};
