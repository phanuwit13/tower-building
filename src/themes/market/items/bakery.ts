import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import { door, glassWindow } from '../../../models/parts';

// A cosy shop: striped awning, loaves on a window shelf, a giant loaf on the roof and an orange neon
// croissant on a dark board.
const BASE = { w: 1.9, h: 0.05, d: 1.9 };
const BX = -0.2; // building centre x
const W = 1.1;
const L = 1.6;
const WALL_TOP = 1.0;
const FRONT = BX + W / 2; // 0.35
const ROOF_TOP = WALL_TOP + 0.07;

function stroke(kit: StyleKit, x: number, a: [number, number], b: [number, number], t = 0.055): Part {
  const dy = b[0] - a[0];
  const dz = b[1] - a[1];
  return kit.box([t, Math.hypot(dy, dz) + t * 0.6, t], [x, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2], 'orange',
    { rotate: [Math.atan2(dz, dy), 0, 0], glow: 'orange' });
}

/** เบเกอรี่: a bakery with an awning, bread on display and a croissant neon sign. */
export const item: ItemModel = {
  id: 'bakery',
  name: 'เบเกอรี่',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'stone'),
      kit.box([W, WALL_TOP - BASE.h, L], [BX, (BASE.h + WALL_TOP) / 2, 0], 'cream'),
      kit.box([W + 0.02, 0.08, L + 0.02], [BX, 0.1, 0], 'woodDark'),
      kit.box([W + 0.12, 0.07, L + 0.12], [BX, WALL_TOP + 0.035, 0], 'terracotta'),
      kit.box([0.15, 0.35, 0.15], [BX - 0.4, ROOF_TOP + 0.175, -0.55], 'stoneDark'),
      // giant loaf on the roof, with three slashes
      kit.sphere(0.3, [BX - 0.1, ROOF_TOP + 0.165, 0.1], 'sand', { scale: [1.3, 0.55, 0.8] }),
      kit.box([0.04, 0.025, 0.2], [BX - 0.3, ROOF_TOP + 0.31, 0.1], 'wood', { rotate: [0, 0.5, 0] }),
      kit.box([0.04, 0.025, 0.2], [BX - 0.1, ROOF_TOP + 0.33, 0.1], 'wood', { rotate: [0, 0.5, 0] }),
      kit.box([0.04, 0.025, 0.2], [BX + 0.1, ROOF_TOP + 0.31, 0.1], 'wood', { rotate: [0, 0.5, 0] }),
    ];
    // front: door, shop window with a shelf of bread, striped awning
    parts.push(
      ...door(kit, { at: [FRONT, 0.3, 0.55], facing: 'x+', w: 0.28, h: 0.5, color: 'woodDark', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [FRONT, 0.62, -0.25], facing: 'x+', w: 0.7, h: 0.34, panes: 3 }),
      kit.box([0.2, 0.04, 0.8], [FRONT + 0.1, 0.32, -0.25], 'wood'),
    );
    for (let i = 0; i < 4; i++) {
      parts.push(kit.sphere(0.07, [FRONT + 0.1, 0.4, -0.55 + 0.2 * i], 'sand', { detail: 0, scale: [1.1, 0.8, 1.3] }));
    }
    parts.push(
      kit.cylinder(0.035, 0.035, 0.3, [FRONT + 0.15, 0.37, -0.1], 'sand', { segments: 6, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.035, 0.035, 0.3, [FRONT + 0.15, 0.37, 0.1], 'wood', { segments: 6, rotate: [Math.PI / 2, 0, 0] }),
    );
    for (let i = 0; i < 8; i++) {
      parts.push(kit.box([0.5, 0.04, 0.2], [FRONT + 0.25, 0.97, -0.8 + 0.2 * i + 0.1], i % 2 === 0 ? 'red' : 'white', { rotate: [0, 0, -0.35] }));
    }
    // other sides
    parts.push(
      ...glassWindow(kit, { at: [BX, 0.55, L / 2], facing: 'z+', w: 0.6, h: 0.36, panes: 3 }),
      ...glassWindow(kit, { at: [BX, 0.55, -L / 2], facing: 'z-', w: 0.6, h: 0.36, panes: 3 }),
      ...glassWindow(kit, { at: [BX - W / 2, 0.55, 0], facing: 'x-', w: 0.7, h: 0.36, panes: 3 }),
    );
    // orange light strip along the awning edge
    parts.push(kit.box([0.03, 0.03, 1.6], [FRONT + 0.5, 0.88, 0], 'orange', { glow: 'orange' }));
    // neon croissant sign on the roof front
    const SX = FRONT - 0.1;
    parts.push(kit.box([0.06, 0.42, 0.9], [SX, ROOF_TOP + 0.21, 0], 'charcoal'));
    const x = SX + 0.05;
    const yc = ROOF_TOP + 0.08;
    const R = 0.3;
    const pt = (deg: number, r = R): [number, number] => [yc + r * Math.sin((deg * Math.PI) / 180), r * Math.cos((deg * Math.PI) / 180)];
    for (let i = 0; i < 6; i++) parts.push(stroke(kit, x, pt(15 + i * 25), pt(40 + i * 25)));
    parts.push(
      stroke(kit, x, pt(15), [pt(15)[0] - 0.1, pt(15)[1] + 0.04]),
      stroke(kit, x, pt(165), [pt(165)[0] - 0.1, pt(165)[1] - 0.04]),
      stroke(kit, x, pt(65, 0.14), pt(65)),
      stroke(kit, x, pt(90, 0.14), pt(90)),
      stroke(kit, x, pt(115, 0.14), pt(115)),
    );
    return kit.finish(parts);
  },
};
