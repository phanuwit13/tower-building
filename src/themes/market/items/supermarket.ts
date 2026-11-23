import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import { door, glassWindow } from '../../../models/parts';

// A wide single-storey hall with a long glass front on +x, an orange entrance awning, a trolley bay
// and a roof sign: a teal neon shopping basket on a dark board.
const BASE = { w: 1.9, h: 0.05, d: 2.9 };
const W = 1.5;
const L = 2.7;
const WALL_TOP = 0.74;
const SIGN = { x: 0.45, y: 1.55, w: 1.5, h: 0.95, d: 0.08 };

function stroke(kit: StyleKit, x: number, a: [number, number], b: [number, number], t = 0.065): Part {
  const dy = b[0] - a[0];
  const dz = b[1] - a[1];
  return kit.box([t, Math.hypot(dy, dz) + t * 0.6, t], [x, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2], 'teal',
    { rotate: [Math.atan2(dz, dy), 0, 0], glow: 'teal' });
}

/** ซูเปอร์มาร์เก็ต: a market hall with a glass front, trolley bay and a basket neon sign. */
export const item: ItemModel = {
  id: 'supermarket',
  name: 'ซูเปอร์มาร์เก็ต',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'stone'),
      kit.box([W, WALL_TOP - BASE.h, L], [0, (BASE.h + WALL_TOP) / 2, 0], 'mint'),
      kit.box([W + 0.14, 0.06, L + 0.14], [0, WALL_TOP + 0.03, 0], 'white'),
      kit.box([W + 0.12, 0.07, L + 0.12], [0, WALL_TOP + 0.095, 0], 'blue'),
      // rooftop air-conditioner
      kit.box([0.3, 0.2, 0.4], [-0.4, WALL_TOP + 0.23, -0.8], 'stone'),
      kit.cylinder(0.08, 0.08, 0.03, [-0.4, WALL_TOP + 0.345, -0.8], 'stoneDark', { segments: 8 }),
    ];
    // glass front, door and awning on +x
    parts.push(
      ...glassWindow(kit, { at: [W / 2, 0.42, -0.45], facing: 'x+', w: 1.3, h: 0.36, panes: 4 }),
      ...door(kit, { at: [W / 2, BASE.h + 0.23, 0.9], facing: 'x+', w: 0.5, h: 0.46, color: 'navy', knob: 'sunYellow' }),
    );
    for (let i = 0; i < 4; i++) {
      parts.push(kit.box([0.22, 0.04, 0.2], [W / 2 + 0.11, 0.68, 0.5 + 0.2 * i + 0.1], i % 2 === 0 ? 'orange' : 'white'));
    }
    // other sides
    parts.push(
      ...glassWindow(kit, { at: [-0.3, 0.42, L / 2], facing: 'z+', w: 0.5, h: 0.3 }),
      ...glassWindow(kit, { at: [0.3, 0.42, L / 2], facing: 'z+', w: 0.5, h: 0.3 }),
      ...glassWindow(kit, { at: [0, 0.42, -L / 2], facing: 'z-', w: 0.9, h: 0.3, panes: 3 }),
      ...glassWindow(kit, { at: [-W / 2, 0.42, -0.6], facing: 'x-', w: 0.8, h: 0.3, panes: 3 }),
      ...glassWindow(kit, { at: [-W / 2, 0.42, 0.6], facing: 'x-', w: 0.8, h: 0.3, panes: 3 }),
    );
    // trolley bay: three trolleys in a row
    for (let i = 0; i < 3; i++) {
      const z = -1.28 + 0.2 * i;
      parts.push(
        kit.box([0.18, 0.1, 0.16], [0.87, 0.34, z], 'chrome'),
        kit.box([0.16, 0.2, 0.02], [0.87, 0.19, z - 0.07], 'charcoal'),
        kit.box([0.16, 0.2, 0.02], [0.87, 0.19, z + 0.07], 'charcoal'),
        kit.box([0.03, 0.03, 0.16], [0.97, 0.43, z], 'red'),
      );
    }
    // roof sign
    for (const z of [-0.45, 0.45]) parts.push(kit.cylinder(0.03, 0.03, 0.21, [SIGN.x, WALL_TOP + 0.13 + 0.085 + 0.02, z], 'charcoal', { segments: 6 }));
    parts.push(kit.box([SIGN.d, SIGN.h, SIGN.w], [SIGN.x, SIGN.y, 0], 'charcoal'));
    const x = SIGN.x + SIGN.d / 2 + 0.02;
    const y = SIGN.y;
    // big basket: rim, slanted sides, base, mesh and a handle
    parts.push(
      stroke(kit, x, [y + 0.12, -0.4], [y + 0.12, 0.4]),
      stroke(kit, x, [y + 0.12, -0.4], [y - 0.27, -0.27]),
      stroke(kit, x, [y + 0.12, 0.4], [y - 0.27, 0.27]),
      stroke(kit, x, [y - 0.27, -0.27], [y - 0.27, 0.27]),
      stroke(kit, x, [y + 0.12, -0.13], [y - 0.27, -0.09], 0.05),
      stroke(kit, x, [y + 0.12, 0.13], [y - 0.27, 0.09], 0.05),
      stroke(kit, x, [y + 0.12, -0.4], [y + 0.36, -0.2]),
      stroke(kit, x, [y + 0.36, -0.2], [y + 0.36, 0.2]),
      stroke(kit, x, [y + 0.36, 0.2], [y + 0.12, 0.4]),
    );
    // teal light strip along the roof edge
    parts.push(kit.box([0.03, 0.03, L + 0.06], [W / 2 + 0.07, WALL_TOP + 0.1, 0], 'teal', { glow: 'teal' }));
    return kit.finish(parts);
  },
};
