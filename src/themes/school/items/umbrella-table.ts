import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const TABLE = { r: 0.25, top: 0.4, t: 0.045 }; // round wooden top: radius, top surface height, thickness
const LEG_R = 0.045; // the table's central post
const FOOT = { len: 0.4, h: 0.04, w: 0.06 }; // two crossed feet under the post
const STOOL = { r: 0.1, h: 0.24, z: 0.34, seat: 0.04 }; // two drum stools at z = ±STOOL.z
const POLE = { r: 0.02, top: 1.32 }; // the parasol pole rises from the middle of the table
// Parasol: a wide, flat, rounded canopy (not a cone like the ice-cream cart's). Two eight-sided
// domes, blue and white, turned 22.5° apart, so their faces alternate in 16 stripes.
const SHADE = { r: 0.47, rise: 0.24, base: 1.1 };

/** โต๊ะร่ม: a round wooden table with two stools under a blue and white parasol. */
export const item: ItemModel = {
  id: 'umbrella-table',
  name: 'โต๊ะร่ม',
  category: 'seating',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const legH = TABLE.top - TABLE.t - FOOT.h;
    const squash: [number, number, number] = [1, SHADE.rise / SHADE.r, 1];
    const parts: Part[] = [
      // table: crossed feet, a post and the round top
      kit.box([FOOT.len, FOOT.h, FOOT.w], [0, FOOT.h / 2, 0], 'woodDark', { rotate: [0, Math.PI / 4, 0] }),
      kit.box([FOOT.len, FOOT.h, FOOT.w], [0, FOOT.h / 2, 0], 'woodDark', { rotate: [0, -Math.PI / 4, 0] }),
      kit.cylinder(LEG_R, LEG_R, legH, [0, FOOT.h + legH / 2, 0], 'woodDark', { segments: 8 }),
      kit.cylinder(TABLE.r, TABLE.r, TABLE.t, [0, TABLE.top - TABLE.t / 2, 0], 'wood'),
      // parasol: pole, a white hub under the canopy, the two striped domes and a yellow knob
      kit.cylinder(POLE.r, POLE.r, POLE.top - TABLE.top, [0, (POLE.top + TABLE.top) / 2, 0], 'white', { segments: 6 }),
      kit.cylinder(0.035, 0.05, 0.06, [0, SHADE.base - 0.03, 0], 'white', { segments: 8 }),
      kit.dome(SHADE.r, [0, SHADE.base, 0], 'blue', { segments: 8, scale: squash }),
      kit.dome(SHADE.r, [0, SHADE.base, 0], 'white', { segments: 8, scale: squash, rotate: [0, Math.PI / 8, 0] }),
      kit.sphere(0.04, [0, SHADE.base + SHADE.rise + 0.03, 0], 'sunYellow', { detail: 0 }),
    ];
    // two wooden drum stools, one each side
    for (const z of [-STOOL.z, STOOL.z]) {
      const bodyH = STOOL.h - STOOL.seat;
      parts.push(
        kit.cylinder(STOOL.r - 0.02, STOOL.r - 0.01, bodyH, [0, bodyH / 2, z], 'woodDark', { segments: 8 }),
        kit.cylinder(STOOL.r, STOOL.r, STOOL.seat, [0, bodyH + STOOL.seat / 2, z], 'wood'),
      );
    }
    return kit.finish(parts);
  },
};
