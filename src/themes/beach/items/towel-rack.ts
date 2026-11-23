import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A wooden drying rack: two posts with feet and a bar along z. Three striped towels hang from the bar; each is cut
// into strips along z so the wave can ripple across it (sideways, along x). The bar sits above the cloth so the
// moving strips never cut through it.
const POST_Z = 0.82;
const BAR = { y: 0.78, r: 0.03 };
const TOWEL = { len: 0.5, w: 0.42, strips: 3, t: 0.03 }; // hang length (y), width along z
const TOP = BAR.y - BAR.r - 0.005; // top of the cloth, just under the bar
const BANDS = 5; // stripes across the hanging length
const SETS: Array<[PaletteColor, PaletteColor, number]> = [
  ['red', 'white', -0.55],
  ['blue', 'white', 0],
  ['sunYellow', 'pink', 0.55],
];

/** ราวตากผ้าเช็ดตัว: a rack of striped towels that ripple. */
export const item: ItemModel = {
  id: 'towel-rack',
  name: 'ราวตากผ้าเช็ดตัว',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.cylinder(BAR.r, BAR.r, 2 * POST_Z + 0.12, [0, BAR.y, 0], 'wood', { segments: 8, rotate: [Math.PI / 2, 0, 0] })];
    for (const s of [1, -1]) {
      parts.push(
        kit.box([0.5, 0.06, 0.1], [0, 0.03, s * POST_Z], 'woodDark'), // foot
        kit.box([0.08, BAR.y, 0.08], [0, BAR.y / 2, s * POST_Z], 'wood'), // post
        kit.sphere(0.055, [0, BAR.y, s * (POST_Z + 0.06)], 'woodDark', { detail: 0 }), // end knob
      );
    }
    const strip = TOWEL.w / TOWEL.strips;
    const band = TOWEL.len / BANDS;
    for (const [c1, c2, z0] of SETS) {
      const zStart = z0 - TOWEL.w / 2;
      const wave: MotionOpts = { kind: 'wave', pivot: [0, TOP, zStart], axis: [0, 0, 1], amount: 0.16 };
      for (let k = 0; k < TOWEL.strips; k++) {
        for (let b = 0; b < BANDS; b++) {
          parts.push(kit.box([TOWEL.t, band, strip], [0, TOP - band * (b + 0.5), zStart + strip * (k + 0.5)], b % 2 === 0 ? c1 : c2, { motion: wave }));
        }
      }
    }
    return kit.finish(parts);
  },
};
