import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// An upright piano (keys facing +x) with a round stool.
const BODY = { x: -0.3, w: 0.34, h: 1.15, d: 1.7 };
const KEY = { y: 0.5, count: 14, step: 0.1, x: -0.05 };
const BLACK_AFTER = [0, 1, 3, 4, 5]; // black key follows white key i when i % 7 is in here

/** เปียโน: an upright piano with black and white keys and a stool. */
export const item: ItemModel = {
  id: 'piano',
  name: 'เปียโน',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BODY.w, BODY.h, BODY.d], [BODY.x, BODY.h / 2, 0], 'woodDark'),
      kit.box([BODY.w + 0.06, 0.05, BODY.d + 0.06], [BODY.x, BODY.h + 0.025, 0], 'wood'),
      // music desk and two inlay panels on the front
      kit.box([0.03, 0.34, 1.3], [BODY.x + BODY.w / 2 + 0.015, 0.85, 0], 'wood'),
      kit.box([0.04, 0.26, 0.55], [BODY.x + BODY.w / 2 + 0.03, 0.85, -0.35], 'terracotta'),
      kit.box([0.04, 0.26, 0.55], [BODY.x + BODY.w / 2 + 0.03, 0.85, 0.35], 'terracotta'),
      kit.box([0.04, 0.06, 1.3], [BODY.x + BODY.w / 2 + 0.04, 1.05, 0], 'sunYellow'),
      // key bed, cheeks and legs
      kit.box([0.26, 0.06, 1.5], [KEY.x - 0.01, KEY.y - 0.03, 0], 'woodDark'),
      kit.box([0.3, 0.46, 0.1], [-0.03, 0.25, -0.75], 'woodDark'),
      kit.box([0.3, 0.46, 0.1], [-0.03, 0.25, 0.75], 'woodDark'),
      kit.box([0.1, 0.03, 0.18], [-0.1, 0.05, -0.15], 'brass'),
      kit.box([0.1, 0.03, 0.18], [-0.1, 0.05, 0.15], 'brass'),
    ];
    // keys
    const z0 = -(KEY.count * KEY.step) / 2;
    for (let i = 0; i < KEY.count; i++) {
      parts.push(kit.box([0.22, 0.03, KEY.step - 0.012], [KEY.x, KEY.y + 0.015, z0 + (i + 0.5) * KEY.step], 'white'));
      if (i < KEY.count - 1 && BLACK_AFTER.includes(i % 7)) {
        parts.push(kit.box([0.12, 0.03, 0.055], [KEY.x - 0.05, KEY.y + 0.045, z0 + (i + 1) * KEY.step], 'charcoal'));
      }
    }
    // stool
    parts.push(
      kit.cylinder(0.17, 0.17, 0.06, [0.3, 0.28, 0], 'red', { segments: 10 }),
      kit.cylinder(0.04, 0.05, 0.25, [0.3, 0.125, 0], 'woodDark', { segments: 8 }),
      kit.cylinder(0.14, 0.14, 0.025, [0.3, 0.0125, 0], 'woodDark', { segments: 10 }),
    );
    return kit.finish(parts);
  },
};
