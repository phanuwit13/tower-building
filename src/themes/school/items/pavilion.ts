import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { gableRoof } from '../../../models/parts';

// A plain, open rest sala: four timber posts on a raised floor, built-in benches with back rails
// on the two z sides, open at the front (+x) and back, and one plain gable roof (no tiers, no finials).
const PLINTH = { size: 1.7, h: 0.1 }; // stone base
const FLOOR = { size: 1.6, h: 0.04 }; // timber floor on the plinth
const FLOOR_TOP = PLINTH.h + FLOOR.h;
const STEP = { w: 0.13, h: 0.05, len: 0.56 }; // a stone step at the front and the back
const P = 0.62; // posts at x, z = ±P: inside the floor's edge, so the deck shows round the roof
const POST = 0.1;
const EAVE_Y = 1.1; // top of the posts and beams: the roof sits here (tall, so the benches show under it)
const BEAM = 0.08; // square beams joining the post tops
const WIDTH = 2 * P + POST; // across the ridge, outside of the posts
const RISE = 0.36;
const ROOF = { length: 1.62, eave: 0.12 }; // length along the ridge (z); eave past the posts
const SEAT = { y: FLOOR_TOP + 0.2, d: 0.2, t: 0.05 };
const RAILS = [FLOOR_TOP + 0.4, FLOOR_TOP + 0.55]; // back rails behind each bench
const POT = { x: 0.91, z: 0.56, r: 0.06, h: 0.1 }; // potted shrubs either side of the front step

/** ศาลาพักร้อน: a plain open rest pavilion with timber posts, benches on two sides and a red gable roof. */
export const item: ItemModel = {
  id: 'pavilion',
  name: 'ศาลาพักร้อน',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const postH = EAVE_Y - FLOOR_TOP;
    const span = 2 * P - POST; // clear width between two posts
    const parts: Part[] = [
      kit.box([PLINTH.size, PLINTH.h, PLINTH.size], [0, PLINTH.h / 2, 0], 'stone'),
      kit.box([FLOOR.size, FLOOR.h, FLOOR.size], [0, PLINTH.h + FLOOR.h / 2, 0], 'wood'),
      kit.box([2 * P, 0.06, 0.06], [0, EAVE_Y - 0.03, 0], 'woodDark'), // tie beam across the middle
      kit.wedge([WIDTH, RISE, 0.05], [0, EAVE_Y + RISE / 2, P], 'cream'), // gable ends, set back under the roof
      kit.wedge([WIDTH, RISE, 0.05], [0, EAVE_Y + RISE / 2, -P], 'cream'),
      ...gableRoof(kit, { at: [0, EAVE_Y, 0], length: ROOF.length, width: WIDTH, rise: RISE, eave: ROOF.eave, color: 'red', ridge: 'redDark' }),
    ];
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([STEP.w, STEP.h, STEP.len], [s * (PLINTH.size / 2 + STEP.w / 2), STEP.h / 2, 0], 'stone'),
        kit.box([2 * P + POST, BEAM, BEAM], [0, EAVE_Y - BEAM / 2, s * P], 'woodDark'), // beams along x
        kit.box([BEAM, BEAM, 2 * P + POST], [s * P, EAVE_Y - BEAM / 2, 0], 'woodDark'), // beams along z
        // bench along this z side: seat on three legs, two back rails between the posts
        kit.box([span, SEAT.t, SEAT.d], [0, SEAT.y, s * (P - SEAT.d / 2)], 'sand'),
      );
      for (const x of [-0.36, 0, 0.36]) {
        parts.push(kit.box([0.05, SEAT.y - FLOOR_TOP, 0.14], [x, (FLOOR_TOP + SEAT.y) / 2, s * (P - SEAT.d / 2)], 'woodDark'));
      }
      for (const y of RAILS) parts.push(kit.box([span, 0.05, 0.05], [0, y, s * P], 'sand'));
      for (const sz of [-1, 1]) {
        parts.push(kit.box([POST, postH, POST], [s * P, FLOOR_TOP + postH / 2, sz * P], 'woodDark'));
      }
      // potted shrubs beside the front step
      parts.push(
        kit.cylinder(POT.r, POT.r * 0.75, POT.h, [POT.x, POT.h / 2, s * POT.z], 'orange', { segments: 8 }),
        kit.sphere(0.085, [POT.x, POT.h + 0.06, s * POT.z], 'leaf', { detail: 0, scale: [1, 0.9, 1] }),
      );
    }
    return kit.finish(parts);
  },
};
