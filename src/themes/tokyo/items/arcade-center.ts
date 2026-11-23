import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { glassWindow, wallPanel } from '../../../models/parts';

// An arcade (2×3, front on +x): a tall purple block at the back and an open hall in front with two rows of game cabinets
// (colour-block screens, joysticks and buttons; no prize, claw or gambling machines). Running lights along the roof edge and the hall
// edge, colour-block pixels on the front, and a big glowing game pad on the roof.
const BASE_H = 0.03;
const FLOOR_TOP = 0.05;
const TALL = { x0: -0.85, x1: -0.1, top: 1.5, d: 2.5 };
const TALL_W = TALL.x1 - TALL.x0;
const TALL_CX = (TALL.x0 + TALL.x1) / 2;
const HALL = { x0: TALL.x1, x1: 0.45, wall: 0.3 };
const HALL_W = HALL.x1 - HALL.x0;
const ROW_Z = [-0.88, -0.44, 0, 0.44, 0.88];

interface Cabinet {
  x: number;
  z: number;
  h: number;
  body: PaletteColor;
  screen: PaletteColor;
  block: PaletteColor;
}

const cabinet = (kit: Parameters<ItemModel['build']>[0], c: Cabinet): Part[] => {
  const y0 = FLOOR_TOP;
  return [
    kit.box([0.2, c.h, 0.34], [c.x, y0 + c.h / 2, c.z], c.body),
    kit.box([0.22, 0.05, 0.36], [c.x, y0 + c.h + 0.025, c.z], 'charcoal'), // marquee top
    // screen: two colour blocks
    kit.box([0.02, 0.16, 0.26], [c.x + 0.1, y0 + c.h * 0.7, c.z], c.screen, { glow: true }),
    kit.box([0.025, 0.07, 0.11], [c.x + 0.1, y0 + c.h * 0.7 - 0.03, c.z + 0.05], c.block, { glow: true }),
    // control panel with a joystick ball
    kit.box([0.09, 0.03, 0.3], [c.x + 0.13, y0 + c.h * 0.42, c.z], 'charcoal', { rotate: [0, 0, -0.25] }),
    kit.sphere(0.025, [c.x + 0.125, y0 + c.h * 0.42 + 0.04, c.z - 0.06], 'red', { detail: 0 }),
  ];
};

/** เกมเซ็นเตอร์: an arcade with cabinets and running neon. */
export const item: ItemModel = {
  id: 'arcade-center',
  name: 'เกมเซ็นเตอร์',
  category: 'play',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.9, BASE_H, 2.9], [0, BASE_H / 2, 0], 'stone'),
      // tall block
      kit.box([TALL_W, TALL.top - FLOOR_TOP, TALL.d], [TALL_CX, (FLOOR_TOP + TALL.top) / 2, 0], 'purple'),
      kit.box([TALL_W + 0.02, 0.07, TALL.d + 0.02], [TALL_CX, 0.55, 0], 'sunYellow'),
      kit.box([TALL_W + 0.02, 0.07, TALL.d + 0.02], [TALL_CX, 1.2, 0], 'pink'),
      kit.box([TALL_W + 0.1, 0.06, TALL.d + 0.1], [TALL_CX, TALL.top + 0.03, 0], 'navy'), // roof slab
      // hall: floor and low side walls
      kit.box([HALL_W, 0.02, TALL.d], [(HALL.x0 + HALL.x1) / 2, BASE_H + 0.01, 0], 'charcoal'),
      kit.box([HALL_W, HALL.wall, 0.08], [(HALL.x0 + HALL.x1) / 2, BASE_H + HALL.wall / 2, TALL.d / 2 - 0.04], 'blue'),
      kit.box([HALL_W, HALL.wall, 0.08], [(HALL.x0 + HALL.x1) / 2, BASE_H + HALL.wall / 2, -TALL.d / 2 + 0.04], 'blue'),
      kit.box([HALL_W + 0.04, 0.04, 0.12], [(HALL.x0 + HALL.x1) / 2, BASE_H + HALL.wall + 0.02, TALL.d / 2 - 0.04], 'white'),
      kit.box([HALL_W + 0.04, 0.04, 0.12], [(HALL.x0 + HALL.x1) / 2, BASE_H + HALL.wall + 0.02, -TALL.d / 2 + 0.04], 'white'),
      // front wall of the tall block: dark sign panel with colour-block pixels
      ...wallPanel(kit, { at: [TALL.x1, 0.92, 0], facing: 'x+', w: 1.9, h: 0.5, depth: 0.02, color: 'navy' }),
      // side windows, back windows
      ...glassWindow(kit, { at: [TALL_CX, 1.0, TALL.d / 2], facing: 'z+', w: 0.4, h: 0.3, frame: 'pink' }),
      ...glassWindow(kit, { at: [TALL_CX, 0.45, TALL.d / 2], facing: 'z+', w: 0.4, h: 0.3, frame: 'pink' }),
      ...glassWindow(kit, { at: [TALL_CX, 1.0, -TALL.d / 2], facing: 'z-', w: 0.4, h: 0.3, frame: 'pink' }),
      ...glassWindow(kit, { at: [TALL_CX, 0.45, -TALL.d / 2], facing: 'z-', w: 0.4, h: 0.3, frame: 'pink' }),
      ...glassWindow(kit, { at: [TALL.x0, 1.0, -0.6], facing: 'x-', w: 0.5, h: 0.3, frame: 'pink', panes: 3 }),
      ...glassWindow(kit, { at: [TALL.x0, 1.0, 0.6], facing: 'x-', w: 0.5, h: 0.3, frame: 'pink', panes: 3 }),
      ...glassWindow(kit, { at: [TALL.x0, 0.45, -0.6], facing: 'x-', w: 0.5, h: 0.3, frame: 'pink', panes: 3 }),
      ...glassWindow(kit, { at: [TALL.x0, 0.45, 0.6], facing: 'x-', w: 0.5, h: 0.3, frame: 'pink', panes: 3 }),
    ];

    // colour-block pixels on the front panel
    const PIXELS: PaletteColor[] = ['red', 'sunYellow', 'teal', 'pink', 'lime', 'orange', 'blue', 'purple'];
    PIXELS.forEach((c, i) => {
      const z = -0.84 + i * 0.24;
      parts.push(kit.box([0.03, 0.16, 0.16], [TALL.x1 + 0.03, 0.92 + (i % 2 === 0 ? 0.08 : -0.08), z], c, { glow: true }));
    });

    // cabinets: back row taller, front row shorter, all facing +x
    const BACK: PaletteColor[] = ['blue', 'red', 'teal', 'orange', 'blue'];
    const FRONT: PaletteColor[] = ['red', 'teal', 'orange', 'blue', 'red'];
    const SCREENS: PaletteColor[] = ['pink', 'lime', 'sunYellow', 'skyBlue', 'purple'];
    const BLOCKS: PaletteColor[] = ['sunYellow', 'pink', 'red', 'lime', 'orange'];
    ROW_Z.forEach((z, i) => {
      parts.push(...cabinet(kit, { x: HALL.x0 + 0.13, z, h: 0.56, body: BACK[i], screen: SCREENS[i], block: BLOCKS[i] }));
      parts.push(...cabinet(kit, { x: HALL.x1 - 0.13, z, h: 0.46, body: FRONT[i], screen: SCREENS[(i + 2) % 5], block: BLOCKS[(i + 3) % 5] }));
    });

    // running lights: along the roof edge (yellow) and along the hall's front edge (pink)
    const RUN = 14;
    for (let index = 0; index < RUN; index++) {
      const z = -1.1 + (2.2 * index) / (RUN - 1);
      parts.push(kit.sphere(0.035, [TALL.x1 + 0.05, TALL.top + 0.02, z], 'sunYellow', { detail: 0, glow: true, light: 'chase', chase: { index, count: RUN } }));
      parts.push(kit.sphere(0.035, [HALL.x1 + 0.01, FLOOR_TOP + 0.04, z], 'pink', { detail: 0, glow: true, light: 'chase', chase: { index, count: RUN } }));
    }

    // roof sign: a big glowing game pad on a navy board
    const SX = -0.35;
    parts.push(kit.box([0.06, 0.62, 1.4], [SX, TALL.top + 0.06 + 0.31, 0], 'navy'));
    parts.push(kit.box([0.04, 0.3, 0.8], [SX + 0.05, TALL.top + 0.37, 0], 'teal', { glow: true })); // pad body
    parts.push(kit.box([0.05, 0.2, 0.06], [SX + 0.06, TALL.top + 0.37, -0.25], 'sunYellow', { glow: true })); // cross
    parts.push(kit.box([0.05, 0.06, 0.2], [SX + 0.06, TALL.top + 0.37, -0.25], 'sunYellow', { glow: true }));
    parts.push(kit.sphere(0.055, [SX + 0.05, TALL.top + 0.42, 0.2], 'pink', { detail: 0, glow: true }));
    parts.push(kit.sphere(0.055, [SX + 0.05, TALL.top + 0.32, 0.3], 'red', { detail: 0, glow: true }));
    parts.push(kit.box([0.03, 0.04, 1.3], [SX + 0.03, TALL.top + 0.06 + 0.6, 0], 'pink', { glow: true })); // top neon strip
    return kit.finish(parts);
  },
};
