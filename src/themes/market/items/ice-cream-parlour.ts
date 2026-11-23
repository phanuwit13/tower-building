import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import { door, glassWindow } from '../../../models/parts';

// A pastel parlour with a giant cone and two scoops on the roof, a striped awning and a pink neon
// cone on a dark board.
const BASE = { w: 1.9, h: 0.05, d: 1.9 };
const BX = -0.2;
const W = 1.1;
const L = 1.6;
const WALL_TOP = 0.95;
const FRONT = BX + W / 2;
const ROOF_TOP = WALL_TOP + 0.07;

function stroke(kit: StyleKit, x: number, a: [number, number], b: [number, number], t = 0.055): Part {
  const dy = b[0] - a[0];
  const dz = b[1] - a[1];
  return kit.box([t, Math.hypot(dy, dz) + t * 0.6, t], [x, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2], 'pink',
    { rotate: [Math.atan2(dz, dy), 0, 0], glow: 'pink' });
}

/** ร้านไอศกรีม: a pastel ice-cream parlour with a giant cone on the roof and a pink cone neon. */
export const item: ItemModel = {
  id: 'ice-cream-parlour',
  name: 'ร้านไอศกรีม',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'stone'),
      kit.box([W, WALL_TOP - BASE.h, L], [BX, (BASE.h + WALL_TOP) / 2, 0], 'mint'),
      kit.box([W + 0.02, 0.06, L + 0.02], [BX, WALL_TOP - 0.1, 0], 'pink'),
      kit.box([W + 0.12, 0.07, L + 0.12], [BX, WALL_TOP + 0.035, 0], 'white'),
      // giant cone (point down on the roof), rim, two scoops and a cherry
      kit.cylinder(0.33, 0.03, 0.7, [BX - 0.05, ROOF_TOP + 0.35, 0.05], 'sand', { segments: 8 }),
      kit.cylinder(0.35, 0.34, 0.05, [BX - 0.05, ROOF_TOP + 0.725, 0.05], 'wood', { segments: 8 }),
      kit.sphere(0.31, [BX - 0.05, ROOF_TOP + 0.9, 0.05], 'pink'),
      kit.sphere(0.25, [BX - 0.05, ROOF_TOP + 1.2, 0.05], 'mint'),
      kit.sphere(0.07, [BX - 0.05, ROOF_TOP + 1.45, 0.05], 'red', { detail: 0 }),
    ];
    parts.push(
      ...door(kit, { at: [FRONT, 0.3, 0.55], facing: 'x+', w: 0.28, h: 0.5, color: 'pink', knob: 'white' }),
      ...glassWindow(kit, { at: [FRONT, 0.58, -0.25], facing: 'x+', w: 0.7, h: 0.36, panes: 3 }),
      kit.box([0.14, 0.04, 0.8], [FRONT + 0.07, 0.34, -0.25], 'white'),
      // scoops on the counter
      kit.sphere(0.06, [FRONT + 0.08, 0.4, -0.5], 'pink', { detail: 0 }),
      kit.sphere(0.06, [FRONT + 0.08, 0.4, -0.35], 'sunYellow', { detail: 0 }),
      kit.sphere(0.06, [FRONT + 0.08, 0.4, -0.2], 'mint', { detail: 0 }),
      kit.sphere(0.06, [FRONT + 0.08, 0.4, -0.05], 'purple', { detail: 0 }),
    );
    for (let i = 0; i < 8; i++) {
      parts.push(kit.box([0.5, 0.04, 0.2], [FRONT + 0.25, 0.92, -0.8 + 0.2 * i + 0.1], i % 2 === 0 ? 'pink' : 'white', { rotate: [0, 0, -0.35] }));
    }
    parts.push(
      ...glassWindow(kit, { at: [BX, 0.55, L / 2], facing: 'z+', w: 0.6, h: 0.36, panes: 3 }),
      ...glassWindow(kit, { at: [BX, 0.55, -L / 2], facing: 'z-', w: 0.6, h: 0.36, panes: 3 }),
      ...glassWindow(kit, { at: [BX - W / 2, 0.55, 0], facing: 'x-', w: 0.7, h: 0.36, panes: 3 }),
    );
    // pink light strip along the awning edge
    parts.push(kit.box([0.03, 0.03, 1.6], [FRONT + 0.5, 0.83, 0], 'pink', { glow: 'pink' }));
    // neon cone sign on the roof front
    const SX = FRONT - 0.1;
    const SY = ROOF_TOP + 0.31;
    parts.push(kit.box([0.06, 0.62, 0.6], [SX, SY, 0], 'charcoal'));
    const x = SX + 0.05;
    parts.push(
      stroke(kit, x, [SY - 0.07, -0.13], [SY - 0.07, 0.13]),
      stroke(kit, x, [SY - 0.07, -0.13], [SY - 0.31, 0]),
      stroke(kit, x, [SY - 0.07, 0.13], [SY - 0.31, 0]),
      kit.torus(0.11, 0.025, [x, SY + 0.1, 0], 'pink', { radialSegments: 4, tubularSegments: 12, rotate: [0, Math.PI / 2, 0], glow: 'pink' }),
    );
    return kit.finish(parts);
  },
};
