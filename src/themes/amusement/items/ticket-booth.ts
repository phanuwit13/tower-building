import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, gableRoof, glassWindow } from '../../../models/parts';

// A small kiosk with red and white stripes, a ticket window and a counter on the +x side, and a
// sign board on posts above the ridge.
const BASE = { w: 0.86, h: 0.04, d: 1.8 };
const W = 0.7; // across x
const L = 1.5; // along z
const WALL_TOP = 0.7;
const RISE = 0.25;
const STRIPES = 5; // wall bands along z
const SIGN = { w: 0.06, h: 0.26, d: 0.9, y: 1.22 };

/** ซุ้มขายตั๋ว: a striped ticket kiosk with a window, a counter and a sign board. */
export const item: ItemModel = {
  id: 'ticket-booth',
  name: 'ซุ้มขายตั๋ว',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'stone')];
    const band = L / STRIPES;
    for (let i = 0; i < STRIPES; i++) {
      parts.push(kit.box([W, WALL_TOP - BASE.h, band], [0, (BASE.h + WALL_TOP) / 2, -L / 2 + band * (i + 0.5)], i % 2 === 0 ? 'red' : 'white'));
    }
    parts.push(
      kit.wedge([W, RISE, L], [0, WALL_TOP + RISE / 2, 0], 'white'),
      ...gableRoof(kit, { at: [0, WALL_TOP, 0], length: L + 0.1, width: W, rise: RISE, eave: 0.06, color: 'blue', ridge: 'navy' }),
      // ticket window with a counter under it
      kit.box([0.02, 0.34, 0.62], [W / 2 + 0.005, 0.42, 0], 'cream'),
      ...glassWindow(kit, { at: [W / 2, 0.42, 0], facing: 'x+', w: 0.5, h: 0.24, panes: 1 }),
      kit.box([0.1, 0.04, 0.78], [W / 2 + 0.05, 0.27, 0], 'wood'),
      ...door(kit, { at: [-0.1, BASE.h + 0.2, L / 2], facing: 'z+', w: 0.22, h: 0.4, color: 'woodDark', knob: 'sunYellow' }),
      // sign board above the roof
      kit.cylinder(0.02, 0.02, SIGN.y - SIGN.h / 2 - (WALL_TOP + RISE) + 0.04, [0, (WALL_TOP + RISE + SIGN.y - SIGN.h / 2) / 2 - 0.02, -0.3], 'woodDark', { segments: 4 }),
      kit.cylinder(0.02, 0.02, SIGN.y - SIGN.h / 2 - (WALL_TOP + RISE) + 0.04, [0, (WALL_TOP + RISE + SIGN.y - SIGN.h / 2) / 2 - 0.02, 0.3], 'woodDark', { segments: 4 }),
      kit.box([SIGN.w, SIGN.h, SIGN.d], [0, SIGN.y, 0], 'sunYellow'),
      kit.box([SIGN.w + 0.02, 0.1, 0.36], [0.01, SIGN.y, 0], 'red'),
      kit.sphere(0.05, [0.04, SIGN.y, -0.32], 'blue', { detail: 0 }),
      kit.sphere(0.05, [0.04, SIGN.y, 0.32], 'blue', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
