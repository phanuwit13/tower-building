import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { rod } from '../../../models/parts';

const BEAM_Y = 1.3; // top beam; the shared swing pivot sits on its centre line
const BEAM_HALF = 0.9;
const FRAME_X = 0.78; // the two A-frames stand at x = ±FRAME_X
const FOOT_Z = 0.62;
const TOP_Z = 0.04;
const LEG_R = 0.07;
const SEAT_Y = 0.32;
const ROPE_DX = 0.22;
// The ropes and the seat swing together about the beam (x axis). The seat stays between the frames (x within ±0.3 of the middle),
// so it never meets a leg; at the 0.3 rad extreme it moves about 0.29 along z and stays well inside the footprint.
const SWING: MotionOpts = { kind: 'swing', pivot: [0, BEAM_Y, 0], axis: [1, 0, 0], amount: 0.3 };

/** ชิงช้าริมทะเล: a rope swing under a big driftwood A-frame, on a patch of sand; the seat swings. */
export const item: ItemModel = {
  id: 'sea-swing',
  name: 'ชิงช้าริมทะเล',
  category: 'play',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1.9, 0.03, 1.8], [0, 0.015, 0], 'sand')];
    const lift = LEG_R * Math.sin(Math.atan2(FOOT_Z - TOP_Z, BEAM_Y)); // tilted leg ends dip: keep them above the sand
    for (const x of [-FRAME_X, FRAME_X]) {
      for (const s of [-1, 1]) {
        parts.push(rod(kit, [x, 0.03 + lift, s * FOOT_Z], [x, BEAM_Y + 0.02, s * TOP_Z], LEG_R, s > 0 ? 'wood' : 'woodDark', { segments: 6 }));
      }
      parts.push(kit.sphere(0.1, [x, BEAM_Y + 0.02, 0], 'wood', { detail: 0 })); // knot where the legs meet
    }
    parts.push(
      kit.cylinder(0.065, 0.065, BEAM_HALF * 2, [0, BEAM_Y, 0], 'woodDark', { rotate: [0, 0, Math.PI / 2], segments: 8 }),
      kit.sphere(0.07, [-BEAM_HALF, BEAM_Y, 0], 'woodDark', { detail: 0 }),
      kit.sphere(0.07, [BEAM_HALF, BEAM_Y, 0], 'woodDark', { detail: 0 }),
      // a red float hung on the +x leg (decoration, still)
      kit.torus(0.07, 0.03, [FRAME_X + 0.07, 0.45, 0.4], 'red', { radialSegments: 4, tubularSegments: 8, rotate: [0, Math.PI / 2, 0] }),
    );
    // ropes: the pivot is on the beam; ropes run from the beam down to the seat
    const ropeLen = BEAM_Y - SEAT_Y;
    for (const dx of [-ROPE_DX, ROPE_DX]) {
      parts.push(kit.cylinder(0.02, 0.02, ropeLen, [dx, (BEAM_Y + SEAT_Y) / 2, 0], 'sand', { segments: 4, motion: SWING }));
      parts.push(kit.sphere(0.035, [dx, BEAM_Y, 0], 'sand', { detail: 0, motion: SWING })); // knot on the beam
    }
    parts.push(kit.box([0.6, 0.07, 0.28], [0, SEAT_Y, 0], 'orange', { motion: SWING }));
    return kit.finish(parts);
  },
};
