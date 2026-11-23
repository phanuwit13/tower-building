import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// Two small kids' beds (heads to -x, mattress top 0.45) with a bedside table between them, a teddy on each bed,
// and a curtain rail with pastel curtains behind the heads. Beds are empty: only the teddies keep them company.
const BED = { x0: -0.85, x1: 0.77, w: 0.88, zc: 0.78, frame: 0.28, mat: 0.45 }; // x range, width along z, bed centre z, frame top, mattress top
const CURTAIN_X = -0.93;
const RAIL_Y = 1.45;

/** ห้องพักผู้ป่วยเด็ก: two small beds with animal-print blankets, a curtain rail, bedside tables and teddy bears. */
export const item: ItemModel = {
  id: 'kids-ward-beds',
  name: 'ห้องพักผู้ป่วยเด็ก',
  category: 'seating',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [];
    const len = BED.x1 - BED.x0;
    const xc = (BED.x0 + BED.x1) / 2;

    const teddy = (x: number, y: number, z: number): void => {
      const k = 1.5; // size: a good big bear
      parts.push(
        kit.sphere(1, [x, y + 0.075 * k, z], 'wood', { detail: 0, scale: [0.075 * k, 0.09 * k, 0.075 * k] }),
        kit.sphere(0.065 * k, [x + 0.02 * k, y + 0.19 * k, z], 'wood', { detail: 0 }),
        kit.sphere(0.03 * k, [x + 0.075 * k, y + 0.18 * k, z], 'sand', { detail: 0 }),
        kit.sphere(0.012 * k, [x + 0.098 * k, y + 0.19 * k, z], 'charcoal', { detail: 0 }),
        kit.sphere(0.028 * k, [x + 0.015 * k, y + 0.245 * k, z - 0.05 * k], 'wood', { detail: 0 }),
        kit.sphere(0.028 * k, [x + 0.015 * k, y + 0.245 * k, z + 0.05 * k], 'wood', { detail: 0 }),
      );
    };

    // one bed: z centre, frame colour, pillow colour, blanket colour, and its animal print
    const bed = (z: number, frame: PaletteColor, pillow: PaletteColor, blanket: PaletteColor, print: 'giraffe' | 'paws'): void => {
      const legX = [BED.x0 + 0.05, BED.x1 - 0.05];
      for (const x of legX) for (const s of [-1, 1]) parts.push(kit.box([0.06, BED.frame, 0.06], [x, BED.frame / 2, z + s * (BED.w / 2 - 0.04)], frame));
      parts.push(
        kit.box([len, 0.1, BED.w], [xc, BED.frame - 0.05, z], frame), // bed base
        kit.box([len - 0.1, 0.07, BED.w - 0.08], [xc, BED.mat - 0.035, z], 'cream'), // mattress
        kit.box([0.06, 0.5, BED.w], [BED.x0 + 0.03, BED.frame + 0.25 - 0.05, z], frame), // headboard
        kit.box([0.05, 0.28, BED.w], [BED.x1 - 0.025, BED.frame + 0.14 - 0.05, z], frame), // footboard
        kit.sphere(1, [BED.x0 + 0.26, BED.mat + 0.03, z], pillow, { scale: [0.16, 0.05, 0.28] }), // pillow
        kit.box([1.0, 0.05, BED.w - 0.06], [BED.x1 - 0.5 - 0.1 + 0.05, BED.mat + 0.025, z], blanket), // blanket
        kit.box([0.12, 0.06, BED.w - 0.04], [BED.x1 - 1.0 + 0.0, BED.mat + 0.03, z], 'cream'), // turned-down edge
      );
      const px = BED.x1 - 0.6; // the print area: x from px - 0.45 to px + 0.45
      if (print === 'giraffe') {
        const spots: Array<[number, number, number]> = [[-0.35, -0.22, 0.4], [-0.2, 0.18, 1.0], [-0.05, -0.05, 0.2], [0.1, -0.25, 0.8], [0.12, 0.2, 0.3], [0.28, 0.0, 0.6], [0.4, -0.2, 1.2], [0.38, 0.22, 0.1]];
        for (const [dx, dz, a] of spots) parts.push(kit.box([0.12, 0.02, 0.1], [px + dx, BED.mat + 0.06, z + dz], 'terracotta', { rotate: [0, a, 0] }));
      } else {
        const paws: Array<[number, number, number]> = [[-0.3, -0.18, 0.3], [-0.05, 0.12, -0.3], [0.2, -0.15, 0.2], [0.4, 0.15, -0.2]];
        for (const [dx, dz, a] of paws) {
          const c: Vec3 = [px + dx, BED.mat + 0.06, z + dz];
          const at = (u: number, v: number): Vec3 => [c[0] + u * Math.cos(a) - v * Math.sin(a), c[1], c[2] + u * Math.sin(a) + v * Math.cos(a)];
          parts.push(kit.sphere(1, at(-0.01, 0), 'pink', { detail: 0, scale: [0.045, 0.012, 0.055] }));
          for (const v of [-0.06, -0.02, 0.02, 0.06]) parts.push(kit.sphere(0.02, at(0.05, v), 'pink', { detail: 0, scale: [1, 0.6, 1] }));
        }
      }
      teddy(-0.05, BED.mat + 0.05, z + 0.1); // sits on the blanket (blanket top 0.5)
    };
    bed(-BED.zc, 'skyBlue', 'mint', 'sunYellow', 'giraffe');
    bed(BED.zc, 'pink', 'lampWarm', 'purple', 'paws');

    // bedside table between the beds, with a lamp, a cup and blocks
    const TX = -0.5;
    parts.push(
      kit.box([0.4, 0.5, 0.4], [TX, 0.25, 0], 'wood'),
      kit.box([0.01, 0.17, 0.3], [TX + 0.205, 0.37, 0], 'sunYellow'), // drawer front on +x
      kit.sphere(0.02, [TX + 0.22, 0.37, 0], 'orange', { detail: 0 }),
      kit.cylinder(0.05, 0.05, 0.1, [TX - 0.06, 0.55, 0], 'orange', { segments: 8 }), // lamp base
      kit.cone(0.1, 0.12, [TX - 0.06, 0.66, 0], 'pink', { segments: 8 }), // lamp shade
      kit.cylinder(0.035, 0.03, 0.06, [TX + 0.1, 0.53, 0.1], 'blue', { segments: 8 }), // cup
      kit.box([0.08, 0.08, 0.08], [TX + 0.1, 0.54, -0.1], 'red', { rotate: [0, 0.4, 0] }), // block
    );

    // curtain rail behind the heads: two posts, a rail and pleated curtains gathered at both ends
    const post = BED.zc + 0.64; // 1.42
    parts.push(kit.box([0.05, 0.05, 2 * post + 0.1], [CURTAIN_X, RAIL_Y + 0.025, 0], 'chrome'));
    for (const s of [-1, 1]) {
      parts.push(kit.cylinder(0.03, 0.03, RAIL_Y, [CURTAIN_X, RAIL_Y / 2, s * post], 'chrome', { segments: 8 }));
      for (let i = 0; i < 6; i++) {
        const z = s * (post - 0.06 - i * 0.065);
        parts.push(kit.box([0.04, 0.8, 0.07], [CURTAIN_X, RAIL_Y - 0.4, z], i % 2 === 0 ? 'mint' : 'skyBlue'));
      }
    }
    return kit.finish(parts);
  },
};
