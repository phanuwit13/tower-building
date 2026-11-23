import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import { door, glassWindow } from '../../../models/parts';

// A slim, colourful party building (2×2): mint and pink storeys, a big purple neon music note (a pair of
// joined eighth notes) on a dark board and chase bulbs round the board.
const W = 1.5;
const BASE_H = 0.05;
const FLOOR = 0.9;
const TOP = BASE_H + FLOOR * 3;
const BOARD = { y: 2.05, w: 1.3, h: 1.3, z: 1.2 }; // z: the board's width along z
const FACE = W / 2;

function stroke(kit: StyleKit, x: number, a: [number, number], b: [number, number], t: number): Part {
  const dy = b[0] - a[0];
  const dz = b[1] - a[1];
  return kit.box([t, Math.hypot(dy, dz) + t * 0.6, t], [x, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2], 'purple',
    { rotate: [Math.atan2(dz, dy), 0, 0], glow: 'purple' });
}

/** ตึกคาราโอเกะ: a slim colourful building with a neon music note. */
export const item: ItemModel = {
  id: 'karaoke-building',
  name: 'ตึกคาราโอเกะ',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([W + 0.1, BASE_H, W + 0.1], [0, BASE_H / 2, 0], 'stone'),
      kit.box([W, FLOOR, W], [0, BASE_H + FLOOR / 2, 0], 'mint'),
      kit.box([W, FLOOR, W], [0, BASE_H + FLOOR * 1.5, 0], 'pink'),
      kit.box([W, FLOOR, W], [0, BASE_H + FLOOR * 2.5, 0], 'mint'),
      kit.box([W + 0.06, 0.06, W + 0.06], [0, BASE_H + FLOOR, 0], 'white'),
      kit.box([W + 0.06, 0.06, W + 0.06], [0, BASE_H + FLOOR * 2, 0], 'white'),
      kit.box([W + 0.1, 0.1, W + 0.1], [0, TOP + 0.05, 0], 'charcoal'),
      // roof: two round speaker domes
      kit.sphere(0.16, [-0.3, TOP + 0.1, -0.3], 'pink', { scale: [1, 0.8, 1] }),
      kit.sphere(0.16, [-0.3, TOP + 0.1, 0.3], 'pink', { scale: [1, 0.8, 1] }),
      ...door(kit, { at: [FACE, BASE_H + 0.21, 0], facing: 'x+', w: 0.5, h: 0.42, color: 'purple', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [FACE, 0.4, 0.5], facing: 'x+', w: 0.3, h: 0.45 }),
      ...glassWindow(kit, { at: [FACE, 0.4, -0.5], facing: 'x+', w: 0.3, h: 0.45 }),
    ];
    for (let k = 0; k < 3; k++) {
      const y = BASE_H + FLOOR * k + 0.5;
      parts.push(
        ...glassWindow(kit, { at: [-FACE, y, 0], facing: 'x-', w: 0.9, h: 0.4 }),
        ...glassWindow(kit, { at: [0, y, FACE], facing: 'z+', w: 0.9, h: 0.4 }),
        ...glassWindow(kit, { at: [0, y, -FACE], facing: 'z-', w: 0.9, h: 0.4 }),
      );
    }
    // the sign: a dark board and a purple neon pair of eighth notes
    const bx = FACE + 0.04;
    const nx = FACE + 0.09;
    parts.push(kit.box([0.08, BOARD.h, BOARD.z * 1], [bx, BOARD.y, 0], 'charcoal'));
    const y = BOARD.y;
    const heads: [number, number][] = [[y - 0.38, -0.3], [y - 0.5, 0.2]];
    for (const [hy, hz] of heads) {
      parts.push(kit.sphere(0.14, [nx, hy, hz], 'purple', { scale: [0.3, 0.75, 1], glow: 'purple' }));
    }
    const tops: [number, number][] = heads.map(([hy, hz]) => [y + 0.38, hz + 0.12]);
    heads.forEach(([hy, hz], i) => {
      parts.push(stroke(kit, nx, [hy + 0.03, hz + 0.12], tops[i], 0.06));
    });
    parts.push(stroke(kit, nx, [tops[0][0], tops[0][1] - 0.03], [tops[1][0] - 0.1, tops[1][1] + 0.03], 0.08));
    // chase bulbs round the board (a ring of 16)
    const ring: [number, number][] = [];
    const hz = BOARD.z / 2 - 0.04;
    const hy = BOARD.h / 2 - 0.05;
    const n = 4;
    for (let i = 0; i < n; i++) ring.push([y - hy, -hz + (2 * hz * i) / n]);
    for (let i = 0; i < n; i++) ring.push([y - hy + (2 * hy * i) / n, hz]);
    for (let i = 0; i < n; i++) ring.push([y + hy, hz - (2 * hz * i) / n]);
    for (let i = 0; i < n; i++) ring.push([y + hy - (2 * hy * i) / n, -hz]);
    ring.forEach(([by, bz], index) => {
      parts.push(kit.sphere(0.04, [nx, by, bz], 'lampWarm', { detail: 0, glow: true, light: 'chase', chase: { index, count: ring.length } }));
    });
    return kit.finish(parts);
  },
};
