import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, glassWindow } from '../../../models/parts';

// A slim, colourful party building (2×2): mint and pink storeys, a big purple neon music note (a pair of
// joined eighth notes) on a dark board and chase bulbs round the board.
const W = 1.5;
const BASE_H = 0.05;
const FLOOR = 0.9;
const TOP = BASE_H + FLOOR * 3;
const BOARD = { y: 2.05, w: 1.3, h: 1.3, z: 1.2 }; // z: the board's width along z
const FACE = W / 2;

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
    // the sign: a dark board and a big purple neon note, on the +x face and the +z face (both seen from the camera)
    const y = BOARD.y;
    const HEAD_U = [-0.3, 0.26]; // across the board
    const HEAD_Y = y - 0.4;
    const STEM_TOP = y + 0.5;
    const ring: [number, number][] = [];
    const hz = BOARD.z / 2 - 0.04;
    const hy = BOARD.h / 2 - 0.05;
    const n = 4;
    for (let i = 0; i < n; i++) ring.push([y - hy, -hz + (2 * hz * i) / n]);
    for (let i = 0; i < n; i++) ring.push([y - hy + (2 * hy * i) / n, hz]);
    for (let i = 0; i < n; i++) ring.push([y + hy, hz - (2 * hz * i) / n]);
    for (let i = 0; i < n; i++) ring.push([y + hy - (2 * hy * i) / n, -hz]);
    for (const face of ['x', 'z'] as const) {
      // `at(u, y, d)`: u runs across the board, d out of the wall
      const at = (u: number, yy: number, d: number): [number, number, number] => (face === 'x' ? [FACE + d, yy, u] : [u, yy, FACE + d]);
      const dims = (d: number, h: number, w: number): [number, number, number] => (face === 'x' ? [d, h, w] : [w, h, d]);
      parts.push(kit.box(dims(0.08, BOARD.h, BOARD.z), at(0, y, 0.04), 'charcoal'));
      for (const u of HEAD_U) {
        parts.push(kit.sphere(0.2, at(u, HEAD_Y, 0.1), 'purple', { scale: face === 'x' ? [0.25, 0.8, 1] : [1, 0.8, 0.25], glow: 'purple' }));
        // the stem rises from the right edge of its head
        parts.push(kit.box(dims(0.06, STEM_TOP - HEAD_Y, 0.07), at(u + 0.18, (STEM_TOP + HEAD_Y) / 2, 0.1), 'purple', { glow: 'purple' }));
      }
      // a thick level beam joining the stem tops
      parts.push(kit.box(dims(0.07, 0.14, HEAD_U[1] - HEAD_U[0] + 0.07), at((HEAD_U[0] + HEAD_U[1]) / 2 + 0.18, STEM_TOP - 0.05, 0.1), 'purple', { glow: 'purple' }));
      ring.forEach(([by, bu], index) => {
        parts.push(kit.sphere(0.04, at(bu, by, 0.1), 'lampWarm', { detail: 0, glow: true, light: 'chase', chase: { index, count: ring.length } }));
      });
    }
    return kit.finish(parts);
  },
};
