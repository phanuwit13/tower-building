import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { door, glassWindow } from '../../../models/parts';

// A sunny stationery shop (2×2, front +x): a giant hex pencil lies on the roof, an orange pencil neon stands on a board, coloured notebook racks out front.
const CX = -0.1;
const W = 1.6;
const L = 1.7;
const BASE = 0.05;
const TOP = 1.0;
const FRONT = CX + W / 2;
const SIGN_X = 0.6;
const SIGN_Y = TOP + 0.06 + 0.38;
const NOTEBOOKS: PaletteColor[] = ['pink', 'blue', 'lime', 'red', 'purple'];
const PENCIL_X = -0.3;
const PENCIL_Y = TOP + 0.06 + 0.12;

/** ร้านเครื่องเขียน: a yellow shop with a giant pencil on the roof and a pencil neon. */
export const item: ItemModel = {
  id: 'stationery-shop',
  name: 'ร้านเครื่องเขียน',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit: StyleKit) => {
    const lean = 0.6; // the neon pencil's lean about x (in the y–z plane)
    const dir: [number, number, number] = [0, Math.cos(lean), Math.sin(lean)];
    const nx = SIGN_X + 0.05;
    const at = (s: number): [number, number, number] => [nx, SIGN_Y + dir[1] * s, dir[2] * s];
    const parts: Part[] = [
      kit.box([W + 0.3, BASE, L + 0.2], [CX + 0.05, BASE / 2, 0], 'stone'),
      kit.box([W, TOP - BASE, L], [CX, (BASE + TOP) / 2, 0], 'sunYellow'),
      kit.box([W + 0.02, 0.07, L + 0.02], [CX, BASE + 0.035, 0], 'blue'),
      kit.box([W + 0.12, 0.06, L + 0.1], [CX, TOP + 0.03, 0], 'blue'),
      kit.box([W + 0.04, 0.05, L + 0.04], [CX, TOP - 0.025, 0], 'white'),
      ...door(kit, { at: [FRONT, BASE + 0.26, -0.5], facing: 'x+', w: 0.32, h: 0.52, color: 'red', knob: 'white' }),
      kit.box([0.28, 0.04, 0.5], [FRONT + 0.14, 0.7, -0.5], 'orange'),
      // the giant pencil on the roof: hex body, wooden tip with a lead, ferrule and eraser; two chocks
      kit.cylinder(0.12, 0.12, 1.1, [PENCIL_X, PENCIL_Y, -0.18], 'sunYellow', { segments: 6, rotate: [Math.PI / 2, 0, 0] }),
      kit.cone(0.12, 0.28, [PENCIL_X, PENCIL_Y, 0.51], 'sand', { segments: 6, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.125, 0.125, 0.1, [PENCIL_X, PENCIL_Y, -0.78], 'chrome', { segments: 6, rotate: [Math.PI / 2, 0, 0] }),
      kit.box([0.1, 0.06, 0.05], [PENCIL_X, TOP + 0.09, -0.5], 'woodDark'),
      kit.box([0.1, 0.06, 0.05], [PENCIL_X, TOP + 0.09, 0.3], 'woodDark'),
      // the neon board on the roof front
      kit.box([0.08, 0.8, 0.95], [SIGN_X, SIGN_Y, 0], 'navy'),
      kit.box([0.06, 0.1, 0.5], [SIGN_X - 0.02, TOP + 0.11, 0], 'stoneDark'),
      // neon pencil: body, tip and eraser along the lean
      kit.cylinder(0.095, 0.095, 0.5, at(0), 'orange', { segments: 6, rotate: [lean, 0, 0], glow: true }),
      kit.cone(0.095, 0.2, at(0.35), 'sunYellow', { segments: 6, rotate: [lean, 0, 0], glow: true }),
      kit.cylinder(0.095, 0.095, 0.12, at(-0.31), 'pink', { segments: 6, rotate: [lean, 0, 0], glow: true }),
      // the giant roof pencil is lit too: glowing stripes along it, a lit lead and eraser
      kit.box([0.04, 0.035, 1.1], [PENCIL_X, PENCIL_Y + 0.115, -0.18], 'sunYellow', { glow: true }),
      kit.box([0.035, 0.1, 1.1], [PENCIL_X + 0.1, PENCIL_Y, -0.18], 'orange', { glow: true }),
      kit.cone(0.04, 0.09, [PENCIL_X, PENCIL_Y, 0.69], 'red', { segments: 6, rotate: [Math.PI / 2, 0, 0], glow: true }),
      kit.cylinder(0.115, 0.115, 0.12, [PENCIL_X, PENCIL_Y, -0.89], 'pink', { segments: 6, rotate: [Math.PI / 2, 0, 0], glow: true }),
      kit.sphere(0.05, [nx, SIGN_Y + 0.3, -0.34], 'sunYellow', { detail: 0, glow: true }),
      kit.sphere(0.05, [nx, SIGN_Y - 0.3, 0.34], 'purple', { detail: 0, glow: true }),
    ];
    // colourful notebook racks out front, a window above each
    parts.push(
      ...glassWindow(kit, { at: [FRONT, 0.8, 0.45], facing: 'x+', w: 0.7, h: 0.3, panes: 3 }),
      kit.box([0.12, 0.3, 0.76], [FRONT + 0.06, BASE + 0.15, 0.45], 'white'),
      ...glassWindow(kit, { at: [FRONT, 0.8, -0.5], facing: 'x+', w: 0.2, h: 0.1 }),
    );
    NOTEBOOKS.forEach((c, i) => {
      parts.push(kit.box([0.06, 0.24, 0.1], [FRONT + 0.07, BASE + 0.3 + 0.12, 0.45 - 0.28 + i * 0.14], c, { rotate: [0.1 * (i % 2 ? 1 : -1), 0, 0] }));
    });
    for (const z of [-L / 2, L / 2]) {
      parts.push(...glassWindow(kit, { at: [CX, 0.6, z], facing: z > 0 ? 'z+' : 'z-', w: 0.9, h: 0.4 }));
    }
    parts.push(...glassWindow(kit, { at: [CX - W / 2, 0.6, 0], facing: 'x-', w: 0.9, h: 0.4 }));
    return kit.finish(parts);
  },
};
