import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, glassWindow } from '../../../models/parts';

// A lab module (2x2): a white box module with a blue stripe, lit windows, a glass skylight, roof tubes,
// and a rock sample table out front (+x) with rocks and glowing flasks.
const PAD = { w: 1.9, h: 0.04, d: 1.9 };
const BODY = { x: -0.3, w: 1.3, h: 0.7, d: 1.3 }; // x -0.95 .. 0.35
const FRONT = BODY.x + BODY.w / 2; // the +x wall
const TOP = PAD.h + BODY.h;
const ROOF_TOP = TOP + 0.08;
const TABLE = { x: 0.7, w: 0.42, d: 0.9, top: 0.38, t: 0.05 };

/** โมดูลห้องแล็บ: a lab module with glass windows, roof tubes and a rock sample table. */
export const item: ItemModel = {
  id: 'lab-module',
  name: 'โมดูลห้องแล็บ',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([PAD.w, PAD.h, PAD.d], [0, PAD.h / 2, 0], 'stone'),
      kit.box([BODY.w, BODY.h, BODY.d], [BODY.x, PAD.h + BODY.h / 2, 0], 'white'),
      kit.box([BODY.w + 0.02, 0.12, BODY.d + 0.02], [BODY.x, PAD.h + 0.14, 0], 'blue'),
      kit.box([BODY.w + 0.08, 0.08, BODY.d + 0.08], [BODY.x, TOP + 0.04, 0], 'teal'),
      // glass skylight, lit at night
      kit.cylinder(0.3, 0.3, 0.04, [BODY.x + 0.1, ROOF_TOP + 0.02, 0], 'white', { segments: 12 }),
      kit.dome(0.25, [BODY.x + 0.1, ROOF_TOP + 0.04, 0], 'skyBlue', { segments: 12, scale: [1, 0.7, 1], glow: 'windowWarm', light: 'window' }),
      // roof tubes: two stacks and a vent
      kit.cylinder(0.07, 0.07, 0.4, [BODY.x - 0.5, ROOF_TOP + 0.2, -0.35], 'orange', { segments: 8 }),
      kit.sphere(0.09, [BODY.x - 0.5, ROOF_TOP + 0.42, -0.35], 'orange', { detail: 0 }),
      kit.cylinder(0.06, 0.06, 0.3, [BODY.x - 0.5, ROOF_TOP + 0.15, 0.1], 'red', { segments: 8 }),
      kit.sphere(0.08, [BODY.x - 0.5, ROOF_TOP + 0.32, 0.1], 'red', { detail: 0 }),
      kit.cylinder(0.05, 0.05, 0.5, [BODY.x - 0.5, ROOF_TOP + 0.45, 0.45], 'chrome', { segments: 8, rotate: [Math.PI / 2, 0, 0], scale: [1, 0.5, 1] }),
      // windows and door
      ...glassWindow(kit, { at: [FRONT, PAD.h + 0.45, 0], facing: 'x+', w: 0.8, h: 0.28, panes: 3 }),
      ...glassWindow(kit, { at: [BODY.x + 0.2, PAD.h + 0.45, BODY.d / 2], facing: 'z+', w: 0.6, h: 0.28, panes: 2 }),
      ...door(kit, { at: [BODY.x - 0.4, PAD.h + 0.2, BODY.d / 2], facing: 'z+', w: 0.3, h: 0.4, color: 'orange' }),
      ...glassWindow(kit, { at: [BODY.x, PAD.h + 0.45, -BODY.d / 2], facing: 'z-', w: 0.7, h: 0.28, panes: 2 }),
      ...glassWindow(kit, { at: [BODY.x - BODY.w / 2, PAD.h + 0.45, 0], facing: 'x-', w: 0.7, h: 0.28, panes: 2 }),
      // sample table
      kit.box([TABLE.w, TABLE.t, TABLE.d], [TABLE.x, TABLE.top, 0], 'wood'),
    ];
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        parts.push(kit.box([0.05, TABLE.top - PAD.h, 0.05], [TABLE.x + sx * (TABLE.w / 2 - 0.05), PAD.h + (TABLE.top - PAD.h) / 2, sz * (TABLE.d / 2 - 0.05)], 'woodDark'));
      }
    }
    const tt = TABLE.top + TABLE.t / 2;
    parts.push(
      kit.sphere(0.09, [TABLE.x - 0.02, tt + 0.07, -0.3], 'terracotta', { detail: 0, scale: [1, 0.8, 1] }),
      kit.sphere(0.07, [TABLE.x + 0.08, tt + 0.05, -0.12], 'stoneDark', { detail: 0 }),
      kit.sphere(0.06, [TABLE.x - 0.08, tt + 0.04, -0.05], 'sand', { detail: 0 }),
      // glowing flasks (lime / sky) and a tube rack
      kit.cylinder(0.05, 0.065, 0.16, [TABLE.x - 0.05, tt + 0.08, 0.2], 'lime', { segments: 8, glow: true }),
      kit.cylinder(0.025, 0.025, 0.07, [TABLE.x - 0.05, tt + 0.195, 0.2], 'white', { segments: 8 }),
      kit.cylinder(0.04, 0.055, 0.14, [TABLE.x + 0.08, tt + 0.07, 0.33], 'pink', { segments: 8, glow: true }),
      kit.cylinder(0.04, 0.055, 0.12, [TABLE.x - 0.08, tt + 0.06, 0.34], 'skyBlue', { segments: 8, glow: 'windowWarm', light: 'window' }),
    );
    return kit.finish(parts);
  },
};
