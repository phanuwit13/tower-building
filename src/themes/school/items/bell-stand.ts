import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Two plain wooden posts (along z) with a crossbeam; the bell hangs in the middle, its mouth down,
// and a short rope with a red knob hangs from the clapper. No roof: a school bell, not a temple one.
const SLAB = { w: 0.32, h: 0.05, d: 0.9 }; // stone slab under both posts
const POST = { w: 0.1, z: 0.34, top: 1.28 };
const BEAM = { w: 0.11, h: 0.1, len: 0.86, y: 1.17 }; // y = centre; passes through both posts near the top
const POST_CAP = { w: 0.12, h: 0.04 };
const HANGER = { w: 0.06, h: 0.08 }; // iron block under the beam that holds the bell (tucked 0.01 into the beam)
const BELL = { top: 1.02, h: 0.24, rTop: 0.11, rMouth: 0.185 }; // body is a flared cylinder under a dome crown
const LIP = { h: 0.04, over: 0.02, drop: 0.006 }; // the thicker ring at the mouth, `drop` below the body so their bottoms never z-fight
const CLAPPER = { r: 0.045 };
const ROPE = { r: 0.017, bottom: 0.52 };
const KNOB = { r: 0.045 };

/** ระฆังโรงเรียน: a brass school bell on two plain wooden posts, with a short pull rope. */
export const item: ItemModel = {
  id: 'bell-stand',
  name: 'ระฆังโรงเรียน',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const postH = POST.top - SLAB.h;
    const bodyMid = BELL.top - BELL.h / 2;
    const mouth = BELL.top - BELL.h;
    const clapperY = mouth - CLAPPER.r * 0.4; // peeks out under the mouth
    const parts: Part[] = [
      kit.box([SLAB.w, SLAB.h, SLAB.d], [0, SLAB.h / 2, 0], 'stone'),
      kit.box([BEAM.w, BEAM.h, BEAM.len], [0, BEAM.y, 0], 'wood'),
      kit.box([HANGER.w, HANGER.h, HANGER.w], [0, BEAM.y - BEAM.h / 2 - HANGER.h / 2 + 0.01, 0], 'charcoal'),
      // the bell: dome crown, flared body, thick lip
      kit.dome(BELL.rTop, [0, BELL.top, 0], 'brass', { segments: 12, scale: [1, 0.75, 1] }),
      kit.cylinder(BELL.rTop, BELL.rMouth, BELL.h, [0, bodyMid, 0], 'brass', { segments: 12 }),
      kit.cylinder(BELL.rMouth + LIP.over, BELL.rMouth + LIP.over, LIP.h, [0, mouth + LIP.h / 2 - LIP.drop, 0], 'woodDark', { segments: 12 }),
      kit.sphere(CLAPPER.r, [0, clapperY, 0], 'charcoal', { detail: 0 }),
      kit.cylinder(ROPE.r, ROPE.r, clapperY - ROPE.bottom, [0, (clapperY + ROPE.bottom) / 2, 0], 'sand', { segments: 6 }),
      kit.sphere(KNOB.r, [0, ROPE.bottom, 0], 'red', { detail: 0 }),
    ];
    for (const s of [-1, 1]) {
      const z = s * POST.z;
      parts.push(
        kit.box([POST.w, postH, POST.w], [0, SLAB.h + postH / 2, z], 'wood'),
        kit.box([POST_CAP.w, POST_CAP.h, POST_CAP.w], [0, POST.top + POST_CAP.h / 2, z], 'woodDark'),
        kit.box([POST.w + 0.06, 0.06, POST.w + 0.06], [0, SLAB.h + 0.03, z], 'woodDark'), // foot collar
      );
    }
    return kit.finish(parts);
  },
};
