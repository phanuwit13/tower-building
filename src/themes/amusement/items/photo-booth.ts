import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { glassWindow, wallPanel } from '../../../models/parts';

// A purple photo booth (long side along z) with a red curtain on +x, a little glass window on three sides,
// a camera on the roof with a blinking flash bulb, and a board of photo strips next to it.
const PLINTH = 0.06;
const BOOTH = { w: 0.8, h: 1.5, z0: -0.9, z1: 0.25 };
const BZ = (BOOTH.z0 + BOOTH.z1) / 2; // booth centre along z
const FRONT = BOOTH.w / 2;
const ROOF_TOP = PLINTH + BOOTH.h + 0.08;
const OPEN = { w: 0.6, h: 1.0 };
const BOARD = { z: 0.65, w: 0.55, h: 0.9, y: 0.9 };

/** ตู้ถ่ายรูป: a photo booth with a curtain, a camera with a flash bulb on top and a board of photo strips. */
export const item: ItemModel = {
  id: 'photo-booth',
  name: 'ตู้ถ่ายรูป',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.9, PLINTH, 1.9], [0, PLINTH / 2, 0], 'stone'),
      kit.box([BOOTH.w, BOOTH.h, BOOTH.z1 - BOOTH.z0], [0, PLINTH + BOOTH.h / 2, BZ], 'purple'),
      kit.box([0.9, 0.08, BOOTH.z1 - BOOTH.z0 + 0.1], [0, PLINTH + BOOTH.h + 0.04, BZ], 'pink'),
      // opening and curtain
      ...wallPanel(kit, { at: [FRONT, PLINTH + OPEN.h / 2, BZ], facing: 'x+', w: OPEN.w, h: OPEN.h, depth: 0.02, color: 'navy' }),
      ...wallPanel(kit, { at: [FRONT, PLINTH + OPEN.h / 2, BZ - 0.2175], facing: 'x+', w: 0.165, h: OPEN.h - 0.02, depth: 0.06, color: 'red' }),
      ...wallPanel(kit, { at: [FRONT, PLINTH + OPEN.h / 2, BZ + 0.2175], facing: 'x+', w: 0.165, h: OPEN.h - 0.02, depth: 0.06, color: 'red' }),
      ...wallPanel(kit, { at: [FRONT, PLINTH + OPEN.h + 0.05, BZ], facing: 'x+', w: OPEN.w + 0.04, h: 0.1, depth: 0.07, color: 'redDark' }),
      // sign above the curtain: a little camera
      ...wallPanel(kit, { at: [FRONT, 1.3, BZ], facing: 'x+', w: 0.7, h: 0.24, depth: 0.03, color: 'sunYellow' }),
      ...wallPanel(kit, { at: [FRONT, 1.3, BZ], facing: 'x+', w: 0.24, h: 0.13, depth: 0.04, color: 'charcoal' }),
      kit.cylinder(0.045, 0.045, 0.03, [FRONT + 0.055, 1.3, BZ], 'skyBlue', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      ...glassWindow(kit, { at: [-FRONT, 0.9, BZ], facing: 'x-', w: 0.4, h: 0.5 }),
      ...glassWindow(kit, { at: [0, 0.9, BOOTH.z0], facing: 'z-', w: 0.4, h: 0.5 }),
      ...glassWindow(kit, { at: [0, 0.9, BOOTH.z1], facing: 'z+', w: 0.4, h: 0.5 }),
      // camera on the roof
      kit.box([0.34, 0.22, 0.3], [0.05, ROOF_TOP + 0.11, BZ], 'charcoal'),
      kit.cylinder(0.08, 0.08, 0.12, [0.22 + 0.06, ROOF_TOP + 0.11, BZ], 'chrome', { segments: 10, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.03, 0.03, 0.06, [0, ROOF_TOP + 0.25, BZ], 'chrome', { segments: 6 }),
      kit.sphere(0.07, [0, ROOF_TOP + 0.35, BZ], 'lampWarm', { glow: true, light: 'blink' }),
      // photo-strip board on two legs
      kit.box([0.06, 0.4, 0.06], [0, PLINTH + 0.2, BOARD.z - 0.2], 'woodDark'),
      kit.box([0.06, 0.4, 0.06], [0, PLINTH + 0.2, BOARD.z + 0.2], 'woodDark'),
      kit.box([0.06, BOARD.h, BOARD.w], [0, BOARD.y, BOARD.z], 'blue'),
    ];
    const strips: Array<[number, Array<'pink' | 'skyBlue' | 'sunYellow' | 'leaf' | 'orange' | 'purple'>]> = [
      [BOARD.z - 0.13, ['pink', 'skyBlue', 'sunYellow']], [BOARD.z + 0.13, ['leaf', 'orange', 'purple']],
    ];
    for (const [z, colors] of strips) {
      parts.push(...wallPanel(kit, { at: [0.03, BOARD.y, z], facing: 'x+', w: 0.2, h: 0.8, depth: 0.02, color: 'white' }));
      colors.forEach((c, i) => parts.push(...wallPanel(kit, { at: [0.03, BOARD.y + (1 - i) * 0.26, z], facing: 'x+', w: 0.14, h: 0.2, depth: 0.03, color: c })));
    }
    return kit.finish(parts);
  },
};
