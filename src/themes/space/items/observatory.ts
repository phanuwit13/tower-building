import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { door, glassWindow } from '../../../models/parts';

// An observatory (2x3, long side along z). A round tower at the +z end carries a big white dome with
// a glowing slit; the dome turns slowly about the tower's axis, so the slit moves round. Behind it a
// low annex with lit windows and a little telescope on its terrace.
const PAD = { w: 1.9, h: 0.06, d: 2.9 };
const TOWER = { x: 0, z: 0.55, r: 0.8, h: 0.85 }; // drum on the pad
const RING = { r: 0.86, h: 0.06 }; // orange collar between drum and dome (still)
const BASE_Y = PAD.h + TOWER.h + RING.h; // the dome sits here
const DOME_R = 0.8;
const SLIT = { elevations: [14, 32, 50, 68, 84], radius: 0.78, len: 0.2, thick: 0.08, width: 0.15 }; // degrees
const ANNEX = { w: 1.7, h: 0.7, d: 1.1, z: -0.9 };
const ANNEX_TOP = PAD.h + ANNEX.h;

// The whole dome (and its slit) turns about the tower axis: one shared pivot.
const SPIN: MotionOpts = { kind: 'spin', pivot: [TOWER.x, BASE_Y, TOWER.z], axis: [0, 1, 0], speed: 0.35 };

/** หอดูดาว: a tower with a big turning dome and glowing slit, plus an annex with a rooftop telescope. */
export const item: ItemModel = {
  id: 'observatory',
  name: 'หอดูดาว',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([PAD.w, PAD.h, PAD.d], [0, PAD.h / 2, 0], 'stone'),
      // round tower, blue band, orange collar
      kit.cylinder(TOWER.r, TOWER.r, TOWER.h, [TOWER.x, PAD.h + TOWER.h / 2, TOWER.z], 'white', { segments: 16 }),
      kit.cylinder(TOWER.r + 0.02, TOWER.r + 0.02, 0.14, [TOWER.x, PAD.h + 0.3, TOWER.z], 'blue', { segments: 16 }),
      kit.cylinder(RING.r, RING.r, RING.h, [TOWER.x, PAD.h + TOWER.h + RING.h / 2, TOWER.z], 'orange', { segments: 16 }),
      // turning dome
      kit.dome(DOME_R, [TOWER.x, BASE_Y, TOWER.z], 'white', { segments: 16, motion: SPIN }),
      kit.sphere(0.07, [TOWER.x, BASE_Y + DOME_R + 0.02, TOWER.z], 'sunYellow', { detail: 0, motion: SPIN }),
    ];
    // the slit: lit panes up the +x side of the dome (at rest), each laid along the dome's surface
    for (const deg of SLIT.elevations) {
      const e = (deg * Math.PI) / 180;
      parts.push(
        kit.box([SLIT.thick, SLIT.len, SLIT.width], [TOWER.x + SLIT.radius * Math.cos(e), BASE_Y + SLIT.radius * Math.sin(e), TOWER.z], 'skyBlue', {
          rotate: [0, 0, e], glow: 'windowWarm', light: 'window', motion: SPIN,
        }),
      );
    }
    // annex: walls, teal roof slab, lit windows, an orange door, a stripe
    parts.push(
      kit.box([ANNEX.w, ANNEX.h, ANNEX.d], [0, PAD.h + ANNEX.h / 2, ANNEX.z], 'white'),
      kit.box([ANNEX.w + 0.1, 0.07, ANNEX.d + 0.1], [0, ANNEX_TOP + 0.035, ANNEX.z], 'teal'),
      kit.box([ANNEX.w + 0.02, 0.1, ANNEX.d + 0.02], [0, PAD.h + 0.15, ANNEX.z], 'blue'),
      ...glassWindow(kit, { at: [ANNEX.w / 2, PAD.h + 0.45, ANNEX.z - 0.25], facing: 'x+', w: 0.4, h: 0.22, panes: 2 }),
      ...glassWindow(kit, { at: [ANNEX.w / 2, PAD.h + 0.45, ANNEX.z + 0.28], facing: 'x+', w: 0.3, h: 0.22, panes: 1 }),
      ...glassWindow(kit, { at: [0.2, PAD.h + 0.45, ANNEX.z - ANNEX.d / 2], facing: 'z-', w: 0.6, h: 0.22, panes: 2 }),
      ...glassWindow(kit, { at: [-ANNEX.w / 2, PAD.h + 0.45, ANNEX.z], facing: 'x-', w: 0.6, h: 0.22, panes: 2 }),
      ...door(kit, { at: [-0.45, PAD.h + 0.2, ANNEX.z + ANNEX.d / 2 + 0.0], facing: 'z+', w: 0.26, h: 0.4, color: 'orange' }),
    );
    // little roof telescope on a pedestal (still): tube aimed up and towards +x
    const tz = ANNEX.z;
    const tx = 0.3;
    parts.push(
      kit.cylinder(0.08, 0.1, 0.16, [tx, ANNEX_TOP + 0.07 + 0.08, tz], 'charcoal', { segments: 8 }),
      kit.sphere(0.09, [tx, ANNEX_TOP + 0.07 + 0.2, tz], 'red', { detail: 0 }),
      kit.cylinder(0.075, 0.09, 0.5, [tx + 0.12, ANNEX_TOP + 0.07 + 0.38, tz], 'white', { segments: 10, rotate: [0, 0, -0.7] }),
      kit.cylinder(0.08, 0.08, 0.05, [tx + 0.29, ANNEX_TOP + 0.07 + 0.55, tz], 'orange', { segments: 10, rotate: [0, 0, -0.7] }),
    );
    return kit.finish(parts);
  },
};
