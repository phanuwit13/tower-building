import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

// A little gift shop (2×2) facing +x: a counter with teddy bears, a card rack and a flower vase, a back
// shelf of teddies and gift boxes, and a bunch of balloons tied to a weight. No text on anything.
const TOP_Y = 0.62;
const COUNTER = { x: 0.3, w: 0.6, d: 1.7 };
const SHELF = { x: -0.78, w: 0.3, d: 1.7, h: 1.2 };

function teddy(kit: StyleKit, at: Vec3, fur: PaletteColor, bow: PaletteColor, s = 1): Part[] {
  const [x, y, z] = at;
  return [
    kit.sphere(0.1 * s, [x, y + 0.1 * s * 0.85, z], fur, { detail: 0 }),
    kit.sphere(0.075 * s, [x, y + 0.23 * s, z], fur, { detail: 0 }),
    kit.sphere(0.03 * s, [x, y + 0.3 * s, z - 0.06 * s], fur, { detail: 0 }),
    kit.sphere(0.03 * s, [x, y + 0.3 * s, z + 0.06 * s], fur, { detail: 0 }),
    kit.sphere(0.035 * s, [x + 0.065 * s, y + 0.21 * s, z], 'sand', { detail: 0 }),
    kit.sphere(0.015 * s, [x + 0.095 * s, y + 0.22 * s, z], 'bark', { detail: 0 }),
    kit.box([0.04 * s, 0.03 * s, 0.09 * s], [x + 0.07 * s, y + 0.14 * s, z], bow),
  ];
}

/** ร้านของขวัญ: counter with teddy bears, balloons, flowers and cards. */
export const item: ItemModel = {
  id: 'gift-shop-corner',
  name: 'ร้านของขวัญ',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit: StyleKit) => {
    const parts: Part[] = [
      // counter
      kit.box([COUNTER.w + 0.04, 0.04, COUNTER.d + 0.04], [COUNTER.x, 0.02, 0], 'woodDark'),
      kit.box([COUNTER.w, TOP_Y - 0.08, COUNTER.d], [COUNTER.x, 0.04 + (TOP_Y - 0.08) / 2, 0], 'pink'),
      kit.box([COUNTER.w + 0.06, 0.04, COUNTER.d + 0.06], [COUNTER.x, TOP_Y - 0.02, 0], 'sunYellow'),
    ];
    for (const z of [-0.56, 0, 0.56]) parts.push(kit.box([0.02, 0.3, 0.4], [COUNTER.x + COUNTER.w / 2 + 0.01, 0.3, z], 'white'));
    // back shelf: three shelves of teddies and gift boxes
    parts.push(
      kit.box([SHELF.w, SHELF.h, SHELF.d], [SHELF.x, SHELF.h / 2, 0], 'teal'),
      kit.box([SHELF.w + 0.04, 0.04, SHELF.d + 0.04], [SHELF.x, SHELF.h + 0.02, 0], 'woodDark'),
    );
    const bx = SHELF.x + SHELF.w / 2; // shelf front
    const boxCols: PaletteColor[] = ['red', 'sunYellow', 'purple', 'lime', 'orange', 'skyBlue'];
    [0.34, 0.68, 1.02].forEach((y, r) => {
      parts.push(kit.box([0.24, 0.03, SHELF.d - 0.08], [bx - 0.05, y - 0.015, 0], 'wood'));
      parts.push(kit.box([0.01, 0.22, SHELF.d - 0.08], [bx + 0.005, y + 0.1, 0], 'woodDark')); // recess back
      for (let i = 0; i < 4; i++) {
        const z = -0.6 + i * 0.4;
        if ((i + r) % 2 === 0) parts.push(...teddy(kit, [bx - 0.1, y, z], r === 1 ? 'sand' : 'wood', boxCols[(i + r) % 6], 0.9));
        else {
          const c = boxCols[(i * 2 + r) % 6];
          parts.push(
            kit.box([0.16, 0.16, 0.22], [bx - 0.09, y + 0.08, z], c),
            kit.box([0.17, 0.03, 0.04], [bx - 0.09, y + 0.165, z], 'white'),
          );
        }
      }
    });
    // two teddies on the counter, a card rack and a vase of flowers
    parts.push(...teddy(kit, [0.3, TOP_Y, -0.5], 'wood', 'red'), ...teddy(kit, [0.32, TOP_Y, -0.1], 'sand', 'skyBlue', 1.1));
    parts.push(
      kit.box([0.2, 0.03, 0.28], [0.28, TOP_Y + 0.015, 0.4], 'charcoal'),
      kit.box([0.03, 0.3, 0.26], [0.2, TOP_Y + 0.15, 0.4], 'charcoal'),
    );
    const cards: PaletteColor[] = ['pink', 'sunYellow', 'skyBlue', 'lime'];
    cards.forEach((c, i) => {
      parts.push(
        kit.box([0.02, 0.07, 0.11], [0.235, TOP_Y + 0.1 + (i % 2) * 0.1, 0.34 + (i >> 1) * 0.13], c, { rotate: [0, 0, -0.35] }),
        kit.sphere(0.02, [0.245, TOP_Y + 0.1 + (i % 2) * 0.1, 0.34 + (i >> 1) * 0.13], 'red', { detail: 0, scale: [0.3, 1, 1] }),
      );
    });
    parts.push(
      kit.cylinder(0.07, 0.055, 0.16, [0.4, TOP_Y + 0.08, 0.72], 'skyBlue', { segments: 8 }),
      kit.sphere(0.06, [0.4, TOP_Y + 0.22, 0.72], 'red', { detail: 0 }),
      kit.sphere(0.06, [0.36, TOP_Y + 0.2, 0.78], 'sunYellow', { detail: 0 }),
      kit.sphere(0.06, [0.44, TOP_Y + 0.2, 0.66], 'pink', { detail: 0 }),
      kit.sphere(0.06, [0.4, TOP_Y + 0.28, 0.72], 'purple', { detail: 0 }),
    );
    // balloon bunch on the floor weight at the +z end
    const BASE: Vec3 = [-0.3, 0.06, 0.7];
    parts.push(kit.cylinder(0.09, 0.1, 0.12, [-0.3, 0.06, 0.7], 'charcoal', { segments: 8 }));
    const balloons: Array<[PaletteColor, Vec3]> = [
      ['red', [-0.4, 1.35, 0.6]],
      ['sunYellow', [-0.22, 1.45, 0.7]],
      ['skyBlue', [-0.34, 1.3, 0.78]],
      ['pink', [-0.18, 1.25, 0.58]],
    ];
    for (const [c, p] of balloons) {
      parts.push(kit.sphere(0.14, p, c, { scale: [1, 1.2, 1] }), kit.cone(0.03, 0.05, [p[0], p[1] - 0.18, p[2]], c, { segments: 6, rotate: [Math.PI, 0, 0] }));
      parts.push(rod(kit, [BASE[0], BASE[1] + 0.06, BASE[2]], [p[0], p[1] - 0.21, p[2]], 0.008, 'white', { segments: 4 }));
    }
    return kit.finish(parts);
  },
};
