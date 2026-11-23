import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A wooden post (1 x 1) with four arrow boards in different colours, each turned its own way and
// carrying a tiny animal silhouette in colour blocks on both faces (no text).
const GROUND_H = 0.03;
const POST = { r: 0.05, h: 1.45 };
const BOARD = { len: 0.4, h: 0.15, t: 0.03, tip: 0.12 }; // shaft length (from the post), height, thickness, arrow-head length

/** Tiny silhouettes as blocks on the shaft: [x along the arrow, y up, w, h]. Centred on the board's middle. */
const GIRAFFE: Array<[number, number, number, number]> = [[0.2, 0, 0.12, 0.05], [0.14, -0.04, 0.02, 0.04], [0.26, -0.04, 0.02, 0.04], [0.3, 0.03, 0.025, 0.07], [0.325, 0.065, 0.045, 0.03]];
const ELEPHANT: Array<[number, number, number, number]> = [[0.2, 0, 0.14, 0.07], [0.14, -0.05, 0.03, 0.04], [0.26, -0.05, 0.03, 0.04], [0.3, 0.02, 0.07, 0.07], [0.35, -0.03, 0.02, 0.06]];
const PENGUIN: Array<[number, number, number, number]> = [[0.22, 0, 0.07, 0.11], [0.22, 0.065, 0.05, 0.04], [0.26, 0.065, 0.025, 0.012], [0.22, -0.06, 0.06, 0.015]];
const PARROT: Array<[number, number, number, number]> = [[0.22, 0, 0.07, 0.09], [0.25, 0.055, 0.05, 0.04], [0.285, 0.05, 0.025, 0.03], [0.18, -0.065, 0.025, 0.06], [0.22, -0.045, 0.1, 0.015]];

/** [yaw (radians), height of the board centre, colour, silhouette]. Yaw 0 points along +x, positive turns towards -z. */
const BOARDS: Array<[number, number, PaletteColor, Array<[number, number, number, number]>]> = [
  [0.45, 0.62, 'red', GIRAFFE],
  [-0.85, 0.82, 'blue', ELEPHANT],
  [2.4, 1.02, 'sunYellow', PENGUIN],
  [-2.3, 1.22, 'leaf', PARROT],
];

/** เสาป้ายบอกทาง: a wooden post with four arrow boards, each with a tiny animal silhouette. */
export const item: ItemModel = {
  id: 'direction-post',
  name: 'เสาป้ายบอกทาง',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.9, GROUND_H, 0.9], [0, GROUND_H / 2, 0], 'lime'),
      kit.cylinder(0.16, 0.2, 0.1, [0, GROUND_H + 0.05, 0], 'stone', { segments: 8 }),
      kit.cylinder(POST.r, POST.r * 1.2, POST.h, [0, GROUND_H + POST.h / 2, 0], 'wood', { segments: 8 }),
      kit.sphere(0.075, [0, GROUND_H + POST.h + 0.02, 0], 'sunYellow', { detail: 0 }),
    ];
    for (const [yaw, y, color, animal] of BOARDS) {
      const c = Math.cos(yaw);
      const s = Math.sin(yaw);
      // a point in the board's own frame (x along the arrow, y up, z across its thickness) -> world
      const at = (x: number, dy: number, z: number): [number, number, number] => [x * c + z * s, y + dy, -x * s + z * c];
      parts.push(
        kit.box([BOARD.len, BOARD.h, BOARD.t], at(BOARD.len / 2 + POST.r * 0.5, 0, 0), color, { rotate: [0, yaw, 0] }),
        // arrow head: a triangle prism with its point along the arrow
        kit.wedge([BOARD.h + 0.04, BOARD.tip, BOARD.t], at(BOARD.len + POST.r * 0.5 + BOARD.tip / 2 - 0.005, 0, 0), color, { rotate: [0, yaw, -Math.PI / 2] }),
      );
      for (const face of [-1, 1]) {
        const z = face * (BOARD.t / 2 + 0.006);
        for (const [x, dy, w, h] of animal) parts.push(kit.box([w, h, 0.012], at(x, dy, z), 'charcoal', { rotate: [0, yaw, 0] }));
      }
    }
    return kit.finish(parts);
  },
};
