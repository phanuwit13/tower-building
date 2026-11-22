import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// Players start at the +z end (nearest the default camera) and hop towards -z, so the numbers read upright from there.
const SLAB = { w: 0.74, h: 0.05, d: 1.9 }; // concrete strip
const TILE = 0.25; // painted square
const GAP = 0.035; // bare concrete between squares
const PAINT = 0.015; // paint thickness; digits sit one more layer up
const START_Z = 0.78; // centre of square 1
/** Squares per row, from the start: one-two-one-two-one, then the round "home" at the far end. */
const ROWS = [1, 2, 1, 2, 1];
const COLORS: PaletteColor[] = ['red', 'sunYellow', 'blue'];
const HOME_R = 0.18;
const DIGIT = { w: 0.085, h: 0.14, stroke: 0.024 }; // seven-segment digits made of thin boxes
/** Segments, seven-segment style: a top, b top right, c bottom right, d bottom, e bottom left, f top left, g middle. */
const DIGITS: Record<number, string> = { 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgecd', 7: 'abc' };
const PEBBLE = { r: 0.055, tile: 3 }; // the throwing stone, lying on square 3

/** ตารางกระโดดขาเดียว: a hopscotch court painted on a concrete strip, numbered squares and a round home. */
export const item: ItemModel = {
  id: 'hopscotch',
  name: 'ตารางกระโดดขาเดียว',
  category: 'play',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const paintY = SLAB.h + PAINT / 2;
    const digitY = SLAB.h + PAINT + 0.005;
    const parts: Part[] = [kit.box([SLAB.w, SLAB.h, SLAB.d], [0, SLAB.h / 2, 0], 'stone')];

    /** One digit centred on (cx, cz); its "up" points to -z. */
    const digit = (n: number, cx: number, cz: number, color: PaletteColor) => {
      const { w, h, stroke } = DIGIT;
      const shift = n === 1 ? -w / 2 : 0; // a lone right-hand stroke looks off-centre: move the 1 to the middle
      const seg: Record<string, [number, number, boolean]> = { // [u (right = +x), v (up = -z), horizontal?]
        a: [0, h / 2, true], g: [0, 0, true], d: [0, -h / 2, true],
        f: [-w / 2, h / 4, false], b: [w / 2, h / 4, false], e: [-w / 2, -h / 4, false], c: [w / 2, -h / 4, false],
      };
      for (const key of DIGITS[n]) {
        const [u, v, horizontal] = seg[key];
        const size: [number, number, number] = horizontal ? [w + stroke, 0.01, stroke] : [stroke, 0.01, h / 2 + stroke];
        parts.push(kit.box(size, [cx + u + shift, digitY, cz - v], color));
      }
    };

    let n = 1;
    let z = START_Z;
    for (const count of ROWS) {
      for (let k = 0; k < count; k++) {
        const x = count === 1 ? 0 : (k === 0 ? -1 : 1) * (TILE + GAP) / 2;
        const color = COLORS[(n - 1) % COLORS.length];
        parts.push(kit.box([TILE, PAINT, TILE], [x, paintY, z], color));
        digit(n, x, z, color === 'sunYellow' ? 'navy' : 'white');
        if (n === PEBBLE.tile) {
          parts.push(kit.sphere(PEBBLE.r, [x - 0.06, SLAB.h + PAINT + PEBBLE.r * 0.45, z + 0.07], 'stoneDark', { detail: 0, scale: [1.1, 0.55, 0.9] }));
        }
        n++;
      }
      z -= TILE + GAP;
    }
    // home: a round patch at the far end
    const homeZ = z + TILE / 2 - HOME_R;
    parts.push(kit.cylinder(HOME_R, HOME_R, PAINT, [0, paintY, homeZ], 'blue', { segments: 16 }));
    parts.push(kit.cylinder(HOME_R * 0.62, HOME_R * 0.62, 0.01, [0, digitY, homeZ], 'sunYellow', { segments: 12 }));
    return kit.finish(parts);
  },
};
