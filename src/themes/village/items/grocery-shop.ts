import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { door, gableRoof, glassWindow, wallPanel } from '../../../models/parts';

// A mint-green shop whose gable end faces +x. The counter window has its folding shutters open (flat on the
// wall, in bright colours); the counter in front carries snacks and bottles you can read from above. An ice
// cooler and a bench stand out front.
const BODY = { x0: -0.92, x1: 0.05, z: 1.2, h: 1.0 };
const CX = (BODY.x0 + BODY.x1) / 2;
const ROOF = { rise: 0.55, eave: 0.1 };
const COUNTER = { x0: 0.05, x1: 0.4, h: 0.62, z: 0.75 };
const SNACKS: readonly PaletteColor[] = ['red', 'sunYellow', 'blue', 'orange', 'pink', 'lime', 'purple'];
const DRINKS: readonly PaletteColor[] = ['orange', 'lime', 'red', 'skyBlue', 'pink', 'sunYellow'];

/** ร้านขายของชำ: a wooden shop with folding shutters open, shelves of snacks and drinks, an ice cooler and a bench. */
export const item: ItemModel = {
  id: 'grocery-shop',
  name: 'ร้านขายของชำ',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BODY.x1 - BODY.x0, BODY.h, 2 * BODY.z], [CX, BODY.h / 2, 0], 'mint'),
      kit.wedge([2 * BODY.z, ROOF.rise, BODY.x1 - BODY.x0], [CX, BODY.h + ROOF.rise / 2, 0], 'mint', { rotate: [0, Math.PI / 2, 0] }),
      ...gableRoof(kit, { at: [CX, BODY.h, 0], length: BODY.x1 - BODY.x0 + 0.1, width: 2 * BODY.z, rise: ROOF.rise, eave: ROOF.eave, color: 'red', ridge: 'redDark', along: 'x' }),
    ];
    // front: the open counter window (a warm shelf board with shelves and goods), shutters, sign in the gable
    parts.push(
      ...wallPanel(kit, { at: [BODY.x1, 0.82, 0], facing: 'x+', w: 1.5, h: 0.4, depth: 0.02, color: 'cream', glow: 'windowWarm' }),
      ...wallPanel(kit, { at: [BODY.x1, 0.62, 0], facing: 'x+', w: 1.5, h: 0.04, depth: 0.1, color: 'woodDark' }),
      ...wallPanel(kit, { at: [BODY.x1, 0.84, 0], facing: 'x+', w: 1.5, h: 0.03, depth: 0.1, color: 'woodDark' }),
    );
    for (const s of [-1, 1]) {
      parts.push(
        ...wallPanel(kit, { at: [BODY.x1, 0.7, s * 0.92], facing: 'x+', w: 0.2, h: 0.5, depth: 0.025, color: 'teal' }),
        ...wallPanel(kit, { at: [BODY.x1, 0.7, s * 1.12], facing: 'x+', w: 0.18, h: 0.5, depth: 0.025, color: 'sunYellow' }),
      );
    }
    parts.push(
      // gable picture: one big red bottle on a yellow board
      ...wallPanel(kit, { at: [BODY.x1, 1.2, 0], facing: 'x+', w: 0.5, h: 0.3, depth: 0.03, color: 'sunYellow' }),
      kit.cylinder(0.07, 0.07, 0.16, [BODY.x1 + 0.05, 1.18, 0], 'red', { segments: 8 }),
      kit.cylinder(0.03, 0.04, 0.08, [BODY.x1 + 0.05, 1.3, 0], 'red', { segments: 8 }),
      kit.cylinder(0.035, 0.035, 0.02, [BODY.x1 + 0.05, 1.35, 0], 'white', { segments: 8 }),
      // side windows and the door
      ...glassWindow(kit, { at: [BODY.x0, 0.65, -0.5], facing: 'x-', w: 0.3, h: 0.3 }),
      ...glassWindow(kit, { at: [BODY.x0, 0.65, 0.5], facing: 'x-', w: 0.3, h: 0.3 }),
      ...glassWindow(kit, { at: [CX, 0.65, BODY.z], facing: 'z+', w: 0.3, h: 0.3 }),
      ...door(kit, { at: [CX, 0.36, -BODY.z], facing: 'z-', w: 0.4, h: 0.72, color: 'woodDark', knob: 'sunYellow' }),
    );
    // counter with a coloured front, and the snacks and bottles on it
    parts.push(
      kit.box([COUNTER.x1 - COUNTER.x0, COUNTER.h - 0.04, 2 * COUNTER.z], [(COUNTER.x0 + COUNTER.x1) / 2, (COUNTER.h - 0.04) / 2, 0], 'wood'),
      kit.box([0.37, 0.04, 2 * COUNTER.z + 0.04], [(COUNTER.x0 + COUNTER.x1) / 2, COUNTER.h - 0.02, 0], 'woodDark'),
      kit.box([0.02, 0.22, 1.5], [COUNTER.x1 + 0.01, 0.3, 0], 'orange'),
    );
    const topY = COUNTER.h;
    for (let i = 0; i < 7; i++) {
      const z = -0.66 + 0.22 * i;
      parts.push(
        kit.box([0.14, 0.16, 0.05], [0.14, topY + 0.08, z], SNACKS[i], { rotate: [0, 0, -0.15] }),
        kit.box([0.1, 0.1, 0.1], [0.3, topY + 0.05, z], SNACKS[(i + 3) % 7]),
      );
    }
    for (let i = 0; i < 6; i++) {
      const z = -0.55 + 0.22 * i;
      parts.push(kit.cylinder(0.035, 0.035, 0.14, [0.22, topY + 0.07, z], DRINKS[i], { segments: 8 }));
    }
    // goods on the upper shelf
    for (let i = 0; i < 8; i++) {
      parts.push(kit.box([0.06, 0.08, 0.1], [BODY.x1 + 0.05, 0.89 + 0.04, -0.63 + 0.18 * i], SNACKS[(i + 2) % 7]));
    }
    // ice cooler and bench out front
    parts.push(
      kit.box([0.4, 0.3, 0.5], [0.58, 0.15, -1.1], 'blue'),
      kit.box([0.42, 0.05, 0.52], [0.58, 0.325, -1.1], 'white'),
      kit.box([0.02, 0.1, 0.34], [0.8, 0.15, -1.1], 'red'),
      kit.box([0.3, 0.05, 0.7], [0.62, 0.285, 1.0], 'wood'),
    );
    for (const x of [0.52, 0.72]) for (const z of [0.72, 1.28]) parts.push(kit.box([0.05, 0.26, 0.05], [x, 0.13, z], 'woodDark'));
    return kit.finish(parts);
  },
};
