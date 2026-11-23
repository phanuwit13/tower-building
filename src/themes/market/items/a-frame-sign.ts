import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A chalkboard A-frame sign (1×1), facing +x: a wooden frame leaning on a back board, with a cup
// and a cake drawn in glowing chalk (pictures only, no text).
const TILT = 0.3;
const BOARD = { h: 0.82, t: 0.05, w: 0.56 };

/** ป้ายตั้งหน้าร้าน: a chalkboard A-frame with a drawn cup and cake. */
export const item: ItemModel = {
  id: 'a-frame-sign',
  name: 'ป้ายตั้งหน้าร้าน',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const sin = Math.sin(TILT);
    const cos = Math.cos(TILT);
    const yc = (BOARD.h / 2) * cos + (BOARD.t / 2) * sin; // lowest corner at y = 0
    const xc = (BOARD.h / 2) * sin + 0.01;
    /** a point on the front board: s up the board, off out of its face */
    const onFront = (s: number, off: number): [number, number] => [xc + cos * off - sin * s, yc + sin * off + cos * s];
    const rot: [number, number, number] = [0, 0, TILT];
    const parts: Part[] = [
      kit.box([BOARD.t, BOARD.h, BOARD.w], [xc, yc, 0], 'wood', { rotate: rot }),
      kit.box([BOARD.t, BOARD.h, BOARD.w], [-xc, yc, 0], 'woodDark', { rotate: [0, 0, -TILT] }),
      kit.box([0.12, 0.05, BOARD.w], [0, BOARD.h + 0.02, 0], 'woodDark'),
    ];
    const chalk = (size: [number, number, number], s: number, z: number, off: number, color: 'charcoal' | 'orange' | 'pink' | 'red' | 'sunYellow' | 'white', glow = false): Part => {
      const [x, y] = onFront(s, off);
      return kit.box(size, [x, y, z], color, { rotate: rot, ...(glow ? { glow: true } : {}) });
    };
    const cyl = (r0: number, r1: number, h: number, s: number, z: number, off: number, color: 'orange' | 'pink' | 'white'): Part => {
      const [x, y] = onFront(s, off);
      return kit.cylinder(r0, r1, h, [x, y, z], color, { segments: 8, rotate: rot, glow: true });
    };
    parts.push(chalk([0.02, 0.68, 0.46], 0, 0, 0.035, 'charcoal'));
    // a cup with a handle and a saucer, in orange
    parts.push(
      cyl(0.07, 0.05, 0.12, 0.22, 0, 0.065, 'orange'),
      chalk([0.02, 0.07, 0.015], 0.22, 0.095, 0.055, 'orange', true),
      chalk([0.02, 0.015, 0.04], 0.255, 0.1, 0.055, 'orange', true),
      chalk([0.02, 0.015, 0.04], 0.185, 0.1, 0.055, 'orange', true),
      chalk([0.02, 0.02, 0.2], 0.14, 0, 0.055, 'orange', true),
    );
    // a two-layer cake with a cherry, in pink
    parts.push(
      cyl(0.1, 0.1, 0.06, -0.1, 0, 0.065, 'pink'),
      cyl(0.07, 0.07, 0.06, -0.04, 0, 0.065, 'pink'),
      chalk([0.03, 0.03, 0.03], 0.01, 0, 0.065, 'red', true),
    );
    // a string of coloured bulbs along the top cap
    const bulbs: Array<'orange' | 'pink' | 'sunYellow'> = ['orange', 'pink', 'sunYellow', 'pink', 'orange'];
    bulbs.forEach((color, i) => {
      parts.push(kit.sphere(0.04, [0, BOARD.h + 0.075, -0.2 + 0.1 * i], color, { detail: 0, glow: true, light: 'chase', chase: { index: i, count: bulbs.length } }));
    });
    return kit.finish(parts);
  },
};
