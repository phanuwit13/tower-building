import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { glassWindow, rod, type Facing } from '../../../models/parts';

// 2x2. A red-and-white lattice tower on four splayed legs, two observation decks, a mast with blinking lights (about 4 tall).
/** Lattice levels: [height, half-width of the leg square]. The legs taper in towards the mast. */
const LV: Array<[number, number]> = [[0.05, 0.85], [0.65, 0.62], [1.3, 0.43], [1.95, 0.31], [2.6, 0.2], [3.1, 0.1]];
const MAIN_Y = 1.3;
const TOP_Y = 2.6;

/** The four faces: [facing, which axis is fixed, sign]. */
const FACES: Array<[Facing, 'x' | 'z', number]> = [['x+', 'x', 1], ['x-', 'x', -1], ['z+', 'z', 1], ['z-', 'z', -1]];

/** A point on a face of the lattice square at level i, `u` across it (-1..1). */
function onFace(axis: 'x' | 'z', sign: number, i: number, u: number): Vec3 {
  const [y, h] = LV[i];
  return axis === 'x' ? [sign * h, y, u * h] : [u * h, y, sign * h];
}

/** โตเกียวทาวเวอร์: a red-and-white lattice tower. */
export const item: ItemModel = {
  id: 'tokyo-tower',
  name: 'โตเกียวทาวเวอร์',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1.96, 0.03, 1.96], [0, 0.015, 0], 'stone')];
    // legs: banded red and white, one stretch per level
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        parts.push(kit.box([0.17, 0.1, 0.17], [sx * 0.86, 0.05, sz * 0.86], 'stoneDark'));
        for (let i = 0; i < LV.length - 1; i++) {
          const a: Vec3 = [sx * LV[i][1], LV[i][0], sz * LV[i][1]];
          const b: Vec3 = [sx * LV[i + 1][1], LV[i + 1][0], sz * LV[i + 1][1]];
          parts.push(rod(kit, a, b, 0.036, i % 2 === 0 ? 'red' : 'white'));
        }
      }
    }
    // rings and crossed braces on every face
    for (const [, axis, sign] of FACES) {
      for (const i of [1, 3]) {
        const [y, h] = LV[i];
        const at: Vec3 = axis === 'x' ? [sign * h, y, 0] : [0, y, sign * h];
        parts.push(kit.box(axis === 'x' ? [0.05, 0.05, 2 * h] : [2 * h, 0.05, 0.05], at, 'white'));
      }
      for (const p of [0, 1, 2, 3]) {
        const colour = p % 2 === 0 ? 'red' : 'white';
        parts.push(
          rod(kit, onFace(axis, sign, p, -1), onFace(axis, sign, p + 1, 1), 0.02, colour, { segments: 4 }),
          rod(kit, onFace(axis, sign, p, 1), onFace(axis, sign, p + 1, -1), 0.02, colour, { segments: 4 }),
        );
      }
    }
    // main deck: red floor, glass band, red roof
    parts.push(
      kit.box([1.04, 0.1, 1.04], [0, MAIN_Y, 0], 'red'),
      kit.box([0.9, 0.16, 0.9], [0, MAIN_Y + 0.13, 0], 'white'),
      kit.box([1.0, 0.06, 1.0], [0, MAIN_Y + 0.24, 0], 'red'),
    );
    for (const [facing] of FACES) {
      const at: Vec3 = facing === 'x+' ? [0.45, MAIN_Y + 0.13, 0] : facing === 'x-' ? [-0.45, MAIN_Y + 0.13, 0] : facing === 'z+' ? [0, MAIN_Y + 0.13, 0.45] : [0, MAIN_Y + 0.13, -0.45];
      parts.push(...glassWindow(kit, { at, facing, w: 0.62, h: 0.08, frame: 'charcoal', panes: 3 }));
    }
    // top deck
    parts.push(
      kit.box([0.5, 0.08, 0.5], [0, TOP_Y, 0], 'red'),
      kit.box([0.4, 0.12, 0.4], [0, TOP_Y + 0.1, 0], 'white'),
      kit.box([0.46, 0.05, 0.46], [0, TOP_Y + 0.19, 0], 'red'),
    );
    for (const [facing] of FACES) {
      const at: Vec3 = facing === 'x+' ? [0.2, TOP_Y + 0.1, 0] : facing === 'x-' ? [-0.2, TOP_Y + 0.1, 0] : facing === 'z+' ? [0, TOP_Y + 0.1, 0.2] : [0, TOP_Y + 0.1, -0.2];
      parts.push(...glassWindow(kit, { at, facing, w: 0.24, h: 0.06, frame: 'charcoal', panes: 2 }));
    }
    // mast: a red base, white and red stretches, a beacon
    parts.push(
      kit.cylinder(0.07, 0.14, 0.34, [0, 3.0, 0], 'red', { segments: 8 }),
      kit.cylinder(0.045, 0.06, 0.25, [0, 3.29, 0], 'white', { segments: 8 }),
      kit.cylinder(0.03, 0.045, 0.25, [0, 3.54, 0], 'red', { segments: 6 }),
      kit.cylinder(0.02, 0.03, 0.25, [0, 3.79, 0], 'white', { segments: 6 }),
      kit.sphere(0.05, [0, 3.95, 0], 'red', { detail: 0, glow: true, light: 'blink' }),
    );
    // blinking aviation lights on the main deck roof (two opposite corners)
    for (const s of [1, -1]) parts.push(kit.sphere(0.045, [s * 0.44, MAIN_Y + 0.27 + 0.045 * 0.851, s * 0.44], 'red', { detail: 0, glow: true, light: 'blink' }));
    return kit.finish(parts);
  },
};
