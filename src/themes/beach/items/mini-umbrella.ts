import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A small striped beach umbrella over a folding canvas chair (the chair faces +x). The pole leans in from behind.
const BASE_H = 0.03;
const SEAT_Y = 0.3;
const CANOPY = { x: -0.03, y: 0.8, r: 0.44, h: 0.22 };

/** ร่มเล็กกับเก้าอี้: a small beach umbrella over a folding chair. */
export const item: ItemModel = {
  id: 'mini-umbrella',
  name: 'ร่มเล็กกับเก้าอี้',
  category: 'seating',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.44, 0.46, BASE_H, [0, BASE_H / 2, 0], 'sand', { segments: 12 }),
      // chair: wooden frame, blue canvas seat and back, white stripe
      kit.box([0.34, 0.04, 0.36], [0.1, SEAT_Y, 0], 'blue'),
      kit.box([0.34, 0.03, 0.12], [0.1, SEAT_Y + 0.005, 0], 'white'),
      kit.box([0.04, 0.34, 0.36], [-0.07, SEAT_Y + 0.2, 0], 'blue', { rotate: [0, 0, -0.2] }),
      kit.box([0.045, 0.34, 0.12], [-0.07, SEAT_Y + 0.2, 0], 'white', { rotate: [0, 0, -0.2] }),
    ];
    for (const z of [-0.2, 0.2]) {
      parts.push(
        rod(kit, [0.24, BASE_H, z], [-0.02, SEAT_Y - 0.02, z], 0.022, 'woodDark', { segments: 6 }),
        rod(kit, [-0.06, BASE_H, z], [0.2, SEAT_Y - 0.02, z], 0.022, 'woodDark', { segments: 6 }),
        kit.box([0.34, 0.03, 0.03], [0.1, SEAT_Y + 0.13, z], 'wood'), // arm rest
      );
    }
    // umbrella: leaning pole, 12-stripe canopy (two cones half a face apart), gold knob
    parts.push(
      rod(kit, [-0.27, BASE_H, 0], [CANOPY.x, CANOPY.y, 0], 0.022, 'white', { segments: 6 }),
      kit.cone(CANOPY.r, CANOPY.h, [CANOPY.x, CANOPY.y + CANOPY.h / 2, 0], 'red', { segments: 6 }),
      kit.cone(CANOPY.r, CANOPY.h, [CANOPY.x, CANOPY.y + CANOPY.h / 2, 0], 'white', { segments: 6, rotate: [0, Math.PI / 6, 0] }),
      kit.sphere(0.035, [CANOPY.x, CANOPY.y + CANOPY.h + 0.02, 0], 'sunYellow', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
