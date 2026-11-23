import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

// Two rattan egg chairs, each hanging from the arm of its own stand; each swings about its own arm tip.
const TOP_Y = 1.5; // arm height
const POST_X = -0.75;
const CX = 0.3; // chair / arm tip x
const CHAIR_Y = 0.58; // egg centre
const CHAIRS: Array<{ z: number; cushion: 'pink' | 'lime' }> = [{ z: -0.45, cushion: 'pink' }, { z: 0.45, cushion: 'lime' }];

/** เก้าอี้รังนกแขวน: two rattan egg chairs hanging from stands, swinging gently. */
export const item: ItemModel = {
  id: 'hanging-chairs',
  name: 'เก้าอี้รังนกแขวน',
  category: 'seating',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const { z, cushion } of CHAIRS) {
      // stand: a chunky skid base, a thick post and an arm out over the chair (all still)
      parts.push(
        kit.box([CX - POST_X + 0.5, 0.06, 0.2], [(POST_X + CX) / 2, 0.03, z], 'teal'),
        kit.cylinder(0.06, 0.06, TOP_Y, [POST_X, TOP_Y / 2, z], 'teal', { segments: 8 }),
        kit.cylinder(0.055, 0.055, CX - POST_X + 0.06, [(POST_X + CX) / 2, TOP_Y, z], 'teal', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
        kit.sphere(0.08, [CX, TOP_Y, z], 'sunYellow', { detail: 0 }),
      );
      // the chair: one pivot at the arm tip, rope + shell + rim + cushions move together
      const swing: MotionOpts = { kind: 'swing', pivot: [CX, TOP_Y, z], axis: [1, 0, 0], amount: 0.12, speed: 1.4 };
      parts.push(
        kit.cylinder(0.02, 0.02, TOP_Y - CHAIR_Y - 0.2, [CX, (TOP_Y + CHAIR_Y + 0.2) / 2, z], 'white', { segments: 4, motion: swing }),
        kit.sphere(0.3, [CX, CHAIR_Y, z], 'sand', { scale: [0.9, 1, 1], motion: swing }),
        // wide opening on the +x face: a thick rattan rim, a deep cushion and a seat cushion that shows from above
        kit.torus(0.22, 0.04, [CX + 0.22, CHAIR_Y, z], 'wood', { rotate: [0, Math.PI / 2, 0], radialSegments: 6, tubularSegments: 12, motion: swing }),
        kit.sphere(0.24, [CX + 0.1, CHAIR_Y, z], cushion, { scale: [0.7, 0.95, 0.95], motion: swing }),
        kit.sphere(0.2, [CX + 0.2, CHAIR_Y - 0.08, z], 'sunYellow', { scale: [1, 0.4, 1], motion: swing }),
        kit.sphere(0.07, [CX + 0.14, CHAIR_Y + 0.14, z + 0.1], 'white', { detail: 0, motion: swing }),
      );
    }
    return kit.finish(parts);
  },
};
