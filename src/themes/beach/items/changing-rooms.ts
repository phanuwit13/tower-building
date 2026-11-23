import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { door, wallPanel } from '../../../models/parts';

// A row of three beach cabins along z with coloured doors (front = +x), a wooden duckboard in front and an
// outdoor shower post with a chrome head at the front corner.
const CABIN = { x: -0.45, w: 0.7, d: 0.5, h: 0.9, count: 3 }; // x = centre of the row's depth
const FRONT = CABIN.x + CABIN.w / 2;
const WALLS: PaletteColor[] = ['mint', 'skyBlue', 'sunYellow'];
const DOORS: PaletteColor[] = ['orange', 'pink', 'red'];
const SHOWER = { x: 0.6, z: 0.65, h: 1.05 };

/** ห้องอาบน้ำเปลี่ยนชุด: a row of beach cabins and an outdoor shower. */
export const item: ItemModel = {
  id: 'changing-rooms',
  name: 'ห้องอาบน้ำเปลี่ยนชุด',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.34, 0.03, CABIN.d * CABIN.count], [FRONT + 0.17, 0.015, 0], 'wood')]; // duckboard
    for (let i = 0; i < CABIN.count; i++) {
      const z = (i - 1) * CABIN.d;
      parts.push(
        kit.box([CABIN.w, CABIN.h, CABIN.d - 0.02], [CABIN.x, CABIN.h / 2, z], WALLS[i]),
        kit.box([CABIN.w + 0.08, 0.05, CABIN.d + 0.02], [CABIN.x, CABIN.h + 0.025, z], 'white'), // flat roof with a little eave
        kit.wedge([CABIN.w, 0.1, CABIN.d - 0.04], [CABIN.x, CABIN.h + 0.1, z], 'redDark', { apex: -0.5 }), // roof slopes down to the front
        ...door(kit, { at: [FRONT, 0.33, z - 0.04], facing: 'x+', w: 0.3, h: 0.62, color: DOORS[i], knob: 'white' }),
        ...wallPanel(kit, { at: [FRONT, 0.76, z], facing: 'x+', w: 0.28, h: 0.07, depth: 0.02, color: 'woodDark' }), // vent slot
      );
    }
    // outdoor shower: stone slab, post, pipe over, head tilted down and a tap
    parts.push(
      kit.box([0.4, 0.04, 0.4], [SHOWER.x, 0.02, SHOWER.z], 'stone'),
      kit.cylinder(0.03, 0.03, SHOWER.h - 0.04, [SHOWER.x, 0.04 + (SHOWER.h - 0.04) / 2, SHOWER.z], 'chrome', { segments: 8 }),
      kit.cylinder(0.02, 0.02, 0.16, [SHOWER.x - 0.08, SHOWER.h - 0.02, SHOWER.z], 'chrome', { segments: 6, rotate: [0, 0, Math.PI / 2] }),
      kit.cone(0.07, 0.05, [SHOWER.x - 0.17, SHOWER.h - 0.04, SHOWER.z], 'chrome', { segments: 8, rotate: [0, 0, Math.PI] }),
      kit.sphere(0.035, [SHOWER.x, 0.5, SHOWER.z], 'blue', { detail: 0 }), // tap knob
      kit.cylinder(0.015, 0.015, 0.1, [SHOWER.x + 0.06, 0.5, SHOWER.z], 'blue', { segments: 6, rotate: [0, 0, Math.PI / 2] }),
    );
    return kit.finish(parts);
  },
};
