import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

const BED = { w: 0.86, h: 0.03, d: 1.9 }; // sand strip the tyres are buried in
const TYRE = { r: 0.17, tube: 0.06, wide: 1.8 }; // ring radius, tube radius; `wide` stretches the tread along the axle
const STEP = 0.3; // tyre spacing along z
const ZIG = 0.12; // tyres alternate this far either side of the middle (x)
const TWIST = 0.25; // and turn this much (radians) the other way, for a zig-zag path
const COLORS: PaletteColor[] = ['red', 'blue', 'sunYellow', 'leaf', 'red', 'blue'];

/** ยางกระโดด: six painted tyres half-buried in a zig-zag row in a sand strip, for hopping along. */
export const item: ItemModel = {
  id: 'tyre-hop',
  name: 'ยางกระโดด',
  category: 'play',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([BED.w, BED.h, BED.d], [0, BED.h / 2, 0], 'sand')];
    COLORS.forEach((color, i) => {
      const s = i % 2 === 0 ? 1 : -1;
      const z = (i - (COLORS.length - 1) / 2) * STEP;
      // the top half of a tyre (an arch whose open ends stand on y = 0, hidden in the sand)
      parts.push(kit.torus(TYRE.r, TYRE.tube, [s * ZIG, 0, z], color, {
        arc: Math.PI, radialSegments: 6, tubularSegments: 8, scale: [1, 1, TYRE.wide], rotate: [0, s * TWIST, 0],
      }));
    });
    return kit.finish(parts);
  },
};
