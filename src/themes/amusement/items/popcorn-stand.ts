import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { glassWindow } from '../../../models/parts';

const BASE = { w: 0.9, d: 1.6, h: 0.08 };
const BODY = { w: 0.8, h: 0.55, d: 1.5 };
const COUNTER_Y = BASE.h + BODY.h; // counter underside
const COUNTER = { w: 0.9, d: 1.6, t: 0.06 };
const CASE = { w: 0.56, h: 0.5, d: 0.7, z: 0.3 }; // glass popcorn box
const CASE_Y = COUNTER_Y + COUNTER.t; // bottom of the case
const BUCKET = { z: -0.45, rTop: 0.26, rBottom: 0.2, h: 0.5 };
/** Popcorn heap: [x, y offset, z offset, radius, colour] (offsets from the top middle of the heap). */
const HEAP: Array<[number, number, number, number, PaletteColor]> = [
  [0, 0.05, 0, 0.13, 'cream'], [0.1, 0.02, 0.08, 0.1, 'white'], [-0.1, 0.03, 0.06, 0.1, 'sunYellow'],
  [0.06, 0.02, -0.1, 0.1, 'white'], [-0.08, 0.02, -0.08, 0.1, 'cream'], [0.02, 0.15, 0.0, 0.09, 'white'],
];

/** ร้านป๊อปคอร์น: a red-and-white striped stand with a glass popcorn box that glows warm at night, and a striped bucket sign. */
export const item: ItemModel = {
  id: 'popcorn-stand',
  name: 'ร้านป๊อปคอร์น',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'charcoal')];
    for (let i = 0; i < 5; i++) {
      parts.push(kit.box([BODY.w, BODY.h, BODY.d / 5], [0, BASE.h + BODY.h / 2, -BODY.d / 2 + (BODY.d / 5) * (i + 0.5)], i % 2 === 0 ? 'red' : 'white'));
    }
    parts.push(kit.box([COUNTER.w, COUNTER.t, COUNTER.d], [0, COUNTER_Y + COUNTER.t / 2, 0], 'woodDark'));
    // glass case, glass on the front (+x) and both ends (+z, -z)
    parts.push(kit.box([CASE.w, CASE.h, CASE.d], [0, CASE_Y + CASE.h / 2, CASE.z], 'red'));
    const glassY = CASE_Y + CASE.h / 2;
    parts.push(
      ...glassWindow(kit, { at: [CASE.w / 2, glassY, CASE.z], facing: 'x+', w: 0.54, h: 0.34, frame: 'white' }),
      ...glassWindow(kit, { at: [0, glassY, CASE.z + CASE.d / 2], facing: 'z+', w: 0.38, h: 0.34, frame: 'white', panes: 1 }),
      ...glassWindow(kit, { at: [0, glassY, CASE.z - CASE.d / 2], facing: 'z-', w: 0.38, h: 0.34, frame: 'white', panes: 1 }),
      ...glassWindow(kit, { at: [-CASE.w / 2, glassY, CASE.z], facing: 'x-', w: 0.54, h: 0.34, frame: 'white' }),
    );
    // popcorn heap overflowing the top of the case
    const heapY = CASE_Y + CASE.h;
    for (const [x, y, z, r, c] of HEAP) parts.push(kit.sphere(r, [x, heapY + y, CASE.z + z], c, { detail: 0 }));
    // striped popcorn bucket sign at the back, heaped with popcorn
    const by = COUNTER_Y + COUNTER.t + BUCKET.h / 2;
    for (const [c, turn] of [['red', 0], ['white', Math.PI / 8]] as const) {
      parts.push(kit.cylinder(BUCKET.rTop, BUCKET.rBottom, BUCKET.h, [0, by, BUCKET.z], c, { segments: 8, rotate: [0, turn, 0] }));
    }
    const bt = COUNTER_Y + COUNTER.t + BUCKET.h;
    for (const [x, y, z, r, c] of HEAP) parts.push(kit.sphere(r * 1.15, [x * 1.5, bt + y, BUCKET.z + z * 1.5], c, { detail: 0 }));
    return kit.finish(parts);
  },
};
