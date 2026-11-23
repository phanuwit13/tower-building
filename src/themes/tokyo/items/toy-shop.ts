import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { door, glassWindow } from '../../../models/parts';

// A bright toy shop: pink walls, plushies and little robots in the window, a neon star over the door
// and a giant friendly toy robot (generic: a blue box body, square head, antenna) on the roof.
const PAD = 0.03;
const BX = -0.15;
const W = 1.3;
const L = 1.5;
const FRONT = BX + W / 2; // 0.5
const WALL_TOP = 1.0;
const ROOF_TOP = WALL_TOP + 0.08;

function stroke(kit: StyleKit, x: number, a: [number, number], b: [number, number], t = 0.04): Part {
  const dy = b[0] - a[0];
  const dz = b[1] - a[1];
  return kit.box([t, Math.hypot(dy, dz) + t * 0.6, t], [x, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2], 'sunYellow', { rotate: [Math.atan2(dz, dy), 0, 0], glow: 'sunYellow' });
}

/** ร้านของเล่น: a toy shop with robots and plushies in the window and a giant toy robot on the roof. */
export const item: ItemModel = {
  id: 'toy-shop',
  name: 'ร้านของเล่น',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.9, PAD, 1.9], [0, PAD / 2, 0], 'stone'),
      kit.box([W, WALL_TOP - PAD, L], [BX, (PAD + WALL_TOP) / 2, 0], 'pink'),
      kit.box([W + 0.02, 0.1, L + 0.02], [BX, 0.12, 0], 'purple'), // plinth band
      kit.box([W + 0.1, 0.08, L + 0.1], [BX, WALL_TOP + 0.04, 0], 'purple'),
    ];
    // checkered colour blocks along the top of the front wall
    const blocks: PaletteColor[] = ['sunYellow', 'skyBlue', 'lime', 'orange', 'teal'];
    for (let i = 0; i < 5; i++) parts.push(kit.box([0.04, 0.12, 0.26], [FRONT + 0.02, 0.9, -0.6 + i * 0.3], blocks[i]));
    // front: door and a big display window
    parts.push(
      ...door(kit, { at: [FRONT, 0.3, 0.5], facing: 'x+', w: 0.3, h: 0.5, color: 'skyBlue', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [FRONT, 0.5, -0.3], facing: 'x+', w: 0.8, h: 0.4, panes: 3, frame: 'purple' }),
      kit.box([0.22, 0.04, 0.9], [FRONT + 0.11, 0.28, -0.3], 'white'), // display shelf
    );
    // plushies (balls with ears) and tiny robots on the shelf
    const plush: PaletteColor[] = ['orange', 'sunYellow', 'lime'];
    plush.forEach((c, i) => {
      const z = -0.62 + i * 0.22;
      parts.push(
        kit.sphere(0.07, [FRONT + 0.11, 0.37, z], c, { detail: 0 }),
        kit.sphere(0.025, [FRONT + 0.11, 0.45, z - 0.045], c, { detail: 0 }),
        kit.sphere(0.025, [FRONT + 0.11, 0.45, z + 0.045], c, { detail: 0 }),
      );
    });
    [0.05, 0.3].forEach((dz, i) => {
      const z = 0.0 + dz;
      parts.push(
        kit.box([0.08, 0.1, 0.08], [FRONT + 0.11, 0.35, z], i === 0 ? 'red' : 'blue'),
        kit.box([0.06, 0.05, 0.06], [FRONT + 0.11, 0.43, z], 'chrome'),
      );
    });
    // neon star over the door, on a dark board
    const SX = FRONT + 0.01;
    const sy = 0.82;
    const sz = 0.5;
    parts.push(kit.box([0.03, 0.3, 0.3], [SX, sy, sz], 'charcoal'));
    const pt = (k: number): [number, number] => [sy + 0.11 * Math.sin(((90 + k * 72) * Math.PI) / 180), sz + 0.11 * Math.cos(((90 + k * 72) * Math.PI) / 180)];
    for (let k = 0; k < 5; k++) parts.push(stroke(kit, SX + 0.03, pt(k), pt((k + 2) % 5), 0.025));
    // sides
    parts.push(
      ...glassWindow(kit, { at: [BX, 0.55, L / 2], facing: 'z+', w: 0.7, h: 0.36, panes: 3, frame: 'purple' }),
      ...glassWindow(kit, { at: [BX, 0.55, -L / 2], facing: 'z-', w: 0.7, h: 0.36, panes: 3, frame: 'purple' }),
      ...glassWindow(kit, { at: [BX - W / 2, 0.55, 0], facing: 'x-', w: 0.7, h: 0.36, panes: 3, frame: 'purple' }),
    );
    // striped awning over the window
    for (let i = 0; i < 6; i++) parts.push(kit.box([0.3, 0.04, 0.15], [FRONT + 0.15, 0.74, -0.65 + i * 0.15], i % 2 === 0 ? 'white' : 'red', { rotate: [0, 0, -0.35] }));
    // giant toy robot on the roof: legs, body with a panel, arms, head, eyes and antenna
    const RX = BX - 0.05;
    const base = ROOF_TOP;
    parts.push(
      kit.box([0.14, 0.18, 0.14], [RX, base + 0.09, -0.15], 'chrome'),
      kit.box([0.14, 0.18, 0.14], [RX, base + 0.09, 0.15], 'chrome'),
      kit.box([0.1, 0.04, 0.18], [RX + 0.03, base + 0.02, -0.15], 'charcoal'),
      kit.box([0.1, 0.04, 0.18], [RX + 0.03, base + 0.02, 0.15], 'charcoal'),
      kit.box([0.42, 0.34, 0.56], [RX, base + 0.35, 0], 'skyBlue'),
      kit.box([0.04, 0.2, 0.3], [RX + 0.22, base + 0.35, 0], 'white'),
      kit.sphere(0.035, [RX + 0.25, base + 0.4, -0.06], 'red', { detail: 0, glow: true }),
      kit.sphere(0.035, [RX + 0.25, base + 0.4, 0.06], 'lime', { detail: 0, glow: true }),
      kit.box([0.1, 0.3, 0.1], [RX, base + 0.35, -0.35], 'red'), // arms
      kit.box([0.1, 0.3, 0.1], [RX, base + 0.35, 0.35], 'red'),
      kit.box([0.34, 0.26, 0.38], [RX, base + 0.65, 0], 'sunYellow'), // head
      kit.box([0.03, 0.07, 0.08], [RX + 0.18, base + 0.68, -0.08], 'lampWarm', { glow: true }), // eyes
      kit.box([0.03, 0.07, 0.08], [RX + 0.18, base + 0.68, 0.08], 'lampWarm', { glow: true }),
      kit.box([0.03, 0.03, 0.16], [RX + 0.18, base + 0.59, 0], 'charcoal'), // smile
      kit.cylinder(0.015, 0.015, 0.14, [RX, base + 0.85, 0], 'chrome', { segments: 4 }),
      kit.sphere(0.05, [RX, base + 0.94, 0], 'pink', { detail: 0, glow: true }),
    );
    return kit.finish(parts);
  },
};
