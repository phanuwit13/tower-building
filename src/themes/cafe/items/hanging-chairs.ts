import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

// Two rattan egg chairs, each hanging from the arm of its own stand; each swings about its own arm tip.
const TOP_Y = 1.5; // arm height
const POST_X = -0.75;
const CX = 0.3; // chair / arm tip x
const CHAIR_Y = 0.58; // egg centre
const CHAIRS: Array<{ z: number; cushion: 'pink' | 'mint' }> = [{ z: -0.45, cushion: 'pink' }, { z: 0.45, cushion: 'mint' }];

/** เก้าอี้รังนกแขวน: two rattan egg chairs hanging from stands, swinging gently. */
export const item: ItemModel = {
  id: 'hanging-chairs',
  name: 'เก้าอี้รังนกแขวน',
  category: 'seating',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const { z, cushion } of CHAIRS) {
      // stand: round base, post, arm out over the chair (all still)
      parts.push(
        kit.cylinder(0.2, 0.22, 0.05, [POST_X, 0.025, z], 'charcoal', { segments: 12 }),
        kit.cylinder(0.04, 0.04, TOP_Y, [POST_X, TOP_Y / 2, z], 'charcoal', { segments: 8 }),
        kit.cylinder(0.04, 0.04, CX - POST_X + 0.04, [(POST_X + CX) / 2 + 0.02, TOP_Y, z], 'charcoal', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
        kit.sphere(0.06, [CX, TOP_Y, z], 'brass', { detail: 0 }),
      );
      // the chair: one pivot at the arm tip, rope + egg + cushion move together
      const swing: MotionOpts = { kind: 'swing', pivot: [CX, TOP_Y, z], axis: [1, 0, 0], amount: 0.12, speed: 1.4 };
      parts.push(
        kit.cylinder(0.016, 0.016, TOP_Y - CHAIR_Y - 0.2, [CX, (TOP_Y + CHAIR_Y + 0.2) / 2, z], 'stoneDark', { segments: 4, motion: swing }),
        kit.sphere(0.3, [CX, CHAIR_Y, z], 'wood', { scale: [0.85, 1, 1], motion: swing }),
        // opening on the +x face: a bright rim and a soft cushion
        kit.torus(0.2, 0.03, [CX + 0.25, CHAIR_Y, z], 'sand', { rotate: [0, Math.PI / 2, 0], radialSegments: 6, tubularSegments: 12, motion: swing }),
        kit.sphere(0.2, [CX + 0.12, CHAIR_Y - 0.03, z], cushion, { scale: [0.8, 0.95, 0.95], motion: swing }),
        kit.sphere(0.07, [CX + 0.07, CHAIR_Y + 0.12, z + 0.1], 'sunYellow', { detail: 0, motion: swing }),
      );
    }
    return kit.finish(parts);
  },
};
