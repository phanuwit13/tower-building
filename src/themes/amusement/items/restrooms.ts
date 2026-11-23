import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { door, gableRoof, glassWindow, wallPanel } from '../../../models/parts';

// A tidy toilet block: two doors on the front (+x), each with a round sign and a simple person icon.
const BASE = { w: 1.94, h: 0.05, d: 1.94 };
const BODY = { x: -0.15, w: 1.1, d: 1.5, h: 0.75 };
const WALL_TOP = BASE.h + BODY.h;
const FRONT = BODY.x + BODY.w / 2;

/** ห้องน้ำ: a toilet block with two doors and a small roof. */
export const item: ItemModel = {
  id: 'restrooms',
  name: 'ห้องน้ำ',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'stone'),
      kit.box([BODY.w, BODY.h, BODY.d], [BODY.x, BASE.h + BODY.h / 2, 0], 'mint'),
      kit.box([BODY.w + 0.04, 0.06, BODY.d + 0.04], [BODY.x, BASE.h + 0.03, 0], 'white'),
      kit.box([BODY.w + 0.02, 0.05, BODY.d + 0.02], [BODY.x, WALL_TOP - 0.025, 0], 'teal'),
      ...gableRoof(kit, { at: [BODY.x, WALL_TOP, 0], length: BODY.d + 0.2, width: BODY.w, rise: 0.3, eave: 0.08, color: 'teal', ridge: 'navy' }),
      kit.wedge([BODY.w, 0.3, BODY.d], [BODY.x, WALL_TOP + 0.15, 0], 'mint'),
    ];
    // two doors, each with a round sign above it: blue with a boy, pink with a girl (a skirt)
    const doors: Array<[number, PaletteColor, boolean]> = [[-0.4, 'blue', false], [0.4, 'pink', true]];
    for (const [z, color, skirt] of doors) {
      parts.push(
        kit.box([0.3, 0.03, 0.5], [FRONT + 0.15, BASE.h + 0.015, z], 'stoneDark'),
        ...door(kit, { at: [FRONT, BASE.h + 0.25, z], facing: 'x+', w: 0.36, h: 0.46, color, knob: 'white' }),
        kit.cylinder(0.14, 0.14, 0.03, [FRONT + 0.015, 0.68, z], 'white', { rotate: [0, 0, Math.PI / 2], segments: 12 }),
        kit.sphere(0.035, [FRONT + 0.045, 0.74, z], color, { detail: 0 }),
        skirt
          ? kit.cone(0.065, 0.12, [FRONT + 0.045, 0.64, z], color, { segments: 8, scale: [0.5, 1, 1] })
          : kit.box([0.03, 0.11, 0.07], [FRONT + 0.035, 0.645, z], color),
      );
    }
    // high windows on the ends and back, a bin and a bush by the door
    for (const z of [-0.4, 0.4]) parts.push(...glassWindow(kit, { at: [BODY.x - BODY.w / 2, 0.55, z], facing: 'x-', w: 0.24, h: 0.18, frame: 'white', panes: 1 }));
    for (const x of [-0.45, 0.15]) {
      parts.push(
        ...glassWindow(kit, { at: [x, 0.55, BODY.d / 2], facing: 'z+', w: 0.24, h: 0.18, frame: 'white', panes: 1 }),
        ...glassWindow(kit, { at: [x, 0.55, -BODY.d / 2], facing: 'z-', w: 0.24, h: 0.18, frame: 'white', panes: 1 }),
      );
    }
    parts.push(
      ...wallPanel(kit, { at: [FRONT, WALL_TOP - 0.06, 0], facing: 'x+', w: 1.1, h: 0.08, depth: 0.03, color: 'white' }),
      kit.cylinder(0.07, 0.06, 0.2, [FRONT + 0.3, BASE.h + 0.1, -0.85], 'leaf', { segments: 8 }),
      kit.sphere(0.12, [FRONT + 0.3, BASE.h + 0.3, 0.85], 'leaf', { detail: 1 }),
    );
    return kit.finish(parts);
  },
};
