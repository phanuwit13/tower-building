import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { gableRoof, glassWindow } from '../../../models/parts';

// A little kiosk: a solid pink counter block with an open serving window on +x, cream walls above,
// a red gable roof and a giant ice-cream cone (tip down) standing on the ridge.
const W = 1.6; // x
const D = 1.7; // z
const COUNTER_TOP = 0.62;
const WALL_TOP = 1.0;
const RISE = 0.22; // roof ridge above the wall tops
const WALL = 0.08;
const POST = 0.07;
const GLOW = { glow: 'windowWarm', light: 'window' } as const;

/** ซุ้มไอศกรีม: an ice-cream kiosk with a giant cone on its roof and a counter that glows at night. */
export const item: ItemModel = {
  id: 'ice-cream-kiosk',
  name: 'ซุ้มไอศกรีม',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const ridgeY = WALL_TOP + RISE;
    const upperH = WALL_TOP - COUNTER_TOP;
    const parts: Part[] = [
      // counter block, white band and white counter top (slightly wider than the block)
      kit.box([W, COUNTER_TOP - 0.04, D], [0, (COUNTER_TOP - 0.04) / 2, 0], 'pink'),
      kit.box([W + 0.06, 0.04, D + 0.06], [0, COUNTER_TOP - 0.02, 0], 'white'),
      // upper walls: back and both sides; the +x side is the open window
      kit.box([WALL, upperH, D], [-W / 2 + WALL / 2, COUNTER_TOP + upperH / 2, 0], 'cream'),
      kit.box([W - 2 * POST, upperH, WALL], [0.0, COUNTER_TOP + upperH / 2, D / 2 - WALL / 2], 'cream'),
      kit.box([W - 2 * POST, upperH, WALL], [0.0, COUNTER_TOP + upperH / 2, -D / 2 + WALL / 2], 'cream'),
      ...gableRoof(kit, { at: [0, WALL_TOP, 0], length: D + 0.14, width: W, rise: RISE, eave: 0.1, color: 'red', ridge: 'redDark', along: 'z' }),
      kit.wedge([W, RISE, D], [0, WALL_TOP + RISE / 2, 0], 'cream'),
      // windows on the two sides
      ...glassWindow(kit, { at: [0, COUNTER_TOP + upperH / 2, D / 2], facing: 'z+', w: 0.5, h: 0.2 }),
      ...glassWindow(kit, { at: [0, COUNTER_TOP + upperH / 2, -D / 2], facing: 'z-', w: 0.5, h: 0.2 }),
      // front corner posts holding the roof
      kit.box([POST, upperH, POST], [W / 2 - POST / 2, COUNTER_TOP + upperH / 2, D / 2 - POST / 2], 'white'),
      kit.box([POST, upperH, POST], [W / 2 - POST / 2, COUNTER_TOP + upperH / 2, -D / 2 + POST / 2], 'white'),
      // the counter glows: a warm strip down the front of the block, and a lit back panel inside the window
      kit.box([0.03, 0.12, D - 0.3], [W / 2 + 0.015, 0.36, 0], 'sunYellow', GLOW),
      kit.box([0.02, 0.22, D - 0.5], [-W / 2 + WALL + 0.01, COUNTER_TOP + 0.17, 0], 'glassBlue', GLOW),
    ];
    // ice-cream tubs on the counter, three scoops in three flavours
    const tubZ = [-0.45, 0, 0.45];
    const scoop = ['pink', 'mint', 'sunYellow'] as const;
    tubZ.forEach((z, i) => {
      parts.push(
        kit.cylinder(0.14, 0.12, 0.1, [0.4, COUNTER_TOP + 0.05, z], 'white', { segments: 8 }),
        kit.sphere(0.11, [0.4, COUNTER_TOP + 0.12, z], scoop[i], { detail: 0, scale: [1, 0.75, 1] }),
      );
    });
    // giant cone on the ridge: wafer tip down (half hidden in the ridge cap), scoop, cherry
    const CONE = { r: 0.23, h: 0.56, tip: ridgeY + 0.02 };
    const mouth = CONE.tip + CONE.h;
    parts.push(
      kit.cone(CONE.r, CONE.h, [0, CONE.tip + CONE.h / 2, 0], 'sand', { rotate: [Math.PI, 0, 0], segments: 8 }),
      kit.sphere(0.21, [0, mouth + 0.05, 0], 'pink'),
      kit.sphere(0.04, [0, mouth + 0.05 + 0.21, 0], 'red', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
