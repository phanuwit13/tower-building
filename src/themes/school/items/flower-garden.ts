import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A round bed edged with stones, stepped like a cake so every ring of flowers shows from the 3/4 view.
const SOIL = { r: 0.78, h: 0.07 };
const EDGE = { ring: 0.8, n: 16, r: 0.1, squash: 0.62 }; // edging stones round the soil
const ICO_LOW = 0.851; // a detail-0 sphere's lowest point is this share of its radius below the centre
/** Green tiers, outside in: [radius, top height]. Each carries one ring of flowers. */
const TIERS: Array<[number, number]> = [[0.68, 0.15], [0.48, 0.27], [0.28, 0.39]];
/** Flower rings, outside in: [count, colour, start angle]; each sits just inside its tier's edge. */
const RINGS: Array<[number, PaletteColor, number]> = [[12, 'pink', 0], [9, 'sunYellow', 0.3], [6, 'purple', 0.1]];
const FLOWER = { r: 0.07, h: 0.04, inset: 0.075 };
const MIDDLE = { r: 0.15, flower: 0.095 }; // a round bush on the top tier with one big flower

/**
 * A flower: two upside-down four-sided cones turned 45° apart show a flat eight-petal star on
 * top, with a small upside-down cone for its middle. `top` is the height of the petals.
 */
function flower(kit: StyleKit, at: Vec3, r: number, color: PaletteColor, turn: number): Part[] {
  const [x, top, z] = at;
  return [
    kit.cone(r, FLOWER.h, [x, top - FLOWER.h / 2, z], color, { segments: 4, rotate: [Math.PI, turn, 0] }),
    kit.cone(r, FLOWER.h, [x, top - FLOWER.h / 2, z], color, { segments: 4, rotate: [Math.PI, turn + Math.PI / 4, 0] }),
    kit.cone(r * 0.42, 0.03, [x, top + 0.005, z], color === 'sunYellow' ? 'orange' : 'sunYellow', { segments: 4, rotate: [Math.PI, turn + Math.PI / 8, 0] }),
  ];
}

/** สวนดอกไม้: a round stone-edged flowerbed with rings of pink, yellow and purple flowers. */
export const item: ItemModel = {
  id: 'flower-garden',
  name: 'สวนดอกไม้',
  category: 'nature',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.cylinder(SOIL.r, SOIL.r, SOIL.h, [0, SOIL.h / 2, 0], 'bark', { segments: 16 })];
    for (let k = 0; k < EDGE.n; k++) {
      const a = (k / EDGE.n) * Math.PI * 2;
      parts.push(kit.sphere(EDGE.r, [EDGE.ring * Math.cos(a), EDGE.r * EDGE.squash * ICO_LOW, EDGE.ring * Math.sin(a)],
        k % 4 === 1 ? 'stoneDark' : 'stone', { detail: 0, scale: [1.05, EDGE.squash, 1.35], rotate: [0, -a, 0] }));
    }
    TIERS.forEach(([r, top], i) => {
      const bottom = SOIL.h - 0.01;
      parts.push(kit.cylinder(r, r + 0.02, top - bottom, [0, (top + bottom) / 2, 0], i === 1 ? 'leafDark' : 'leaf', { segments: 12 }));
    });
    RINGS.forEach(([n, color, start], i) => {
      const [tierR, top] = TIERS[i];
      const ringR = tierR - FLOWER.inset;
      for (let k = 0; k < n; k++) {
        const a = start + (k / n) * Math.PI * 2;
        parts.push(...flower(kit, [ringR * Math.cos(a), top + FLOWER.h * 0.7, ringR * Math.sin(a)], FLOWER.r, color, -a));
      }
    });
    const top = TIERS[2][1];
    parts.push(
      kit.sphere(MIDDLE.r, [0, top + MIDDLE.r * 0.45, 0], 'leaf', { detail: 0, scale: [1, 0.75, 1] }),
      ...flower(kit, [0, top + MIDDLE.r * 0.45 + MIDDLE.r * 0.75 * ICO_LOW + 0.02, 0], MIDDLE.flower, 'pink', 0),
    );
    return kit.finish(parts);
  },
};
