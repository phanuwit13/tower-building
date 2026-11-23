import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// An empty adjustable bed (head end -z raised) with a blanket, a side table with flowers and a pastel curtain on a rail.
const BX = -0.45; // bed centre x
const BW = 0.9;
const MATT_TOP = 0.45;
const HINGE_Z = -0.15; // where the raised head section folds
const TILT = 0.34;
const HEAD_LEN = 0.7;
const CURTAIN_X = 0.85;

/** เตียงพักฟื้น: an empty adjustable bed with a blanket, a side table with flowers and a curtain. */
export const item: ItemModel = {
  id: 'recovery-bed',
  name: 'เตียงพักฟื้น',
  category: 'seating',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    const s = Math.sin(TILT);
    const c = Math.cos(TILT);
    // a point on the raised head section: u along it (towards the head, > 0), h above its surface
    const head = (u: number, h: number): [number, number, number] => [BX, MATT_TOP + h * c + u * s, HINGE_Z - u * c + h * s];

    // frame: base, legs, head board and foot board
    parts.push(
      kit.box([BW, 0.1, 1.7], [BX, 0.2, 0], 'white'),
      kit.box([BW + 0.04, 0.56, 0.06], [BX, 0.4, -0.93], 'mint'),
      kit.box([BW + 0.06, 0.05, 0.08], [BX, 0.7, -0.93], 'white'),
      kit.box([BW + 0.04, 0.3, 0.06], [BX, 0.35, 0.93], 'mint'),
    );
    for (const x of [BX - 0.38, BX + 0.38]) {
      for (const z of [-0.75, 0.75]) {
        parts.push(kit.cylinder(0.04, 0.04, 0.16, [x, 0.08, z], 'stoneDark', { segments: 8 }));
      }
    }
    // flat mattress (hinge to foot) and the raised head section
    parts.push(kit.box([BW - 0.06, 0.15, 1.1], [BX, MATT_TOP - 0.075, HINGE_Z + 0.55 - 0.03], 'glassBlue'));
    const mid = head(HEAD_LEN / 2, -0.075);
    parts.push(kit.box([BW - 0.06, 0.15, HEAD_LEN], mid, 'glassBlue', { rotate: [TILT, 0, 0] }));
    // pillow on the raised section
    parts.push(kit.box([0.5, 0.1, 0.3], head(0.45, 0.05), 'white', { rotate: [TILT, 0, 0] }));
    // blanket over the flat part, with a folded pink band
    parts.push(
      kit.box([BW + 0.02, 0.06, 0.82], [BX, MATT_TOP + 0.03, 0.43], 'mint'),
      kit.box([BW + 0.04, 0.07, 0.2], [BX, MATT_TOP + 0.035, 0.16], 'pink'),
      kit.box([BW + 0.03, 0.07, 0.04], [BX, MATT_TOP + 0.0, 0.85], 'pink'),
    );
    // side rails on the +x side only (low, white)
    parts.push(
      kit.box([0.03, 0.03, 0.9], [BX + BW / 2 + 0.02, 0.58, 0.35], 'chrome'),
      kit.box([0.03, 0.03, 0.9], [BX + BW / 2 + 0.02, 0.5, 0.35], 'chrome'),
      kit.box([0.03, 0.14, 0.03], [BX + BW / 2 + 0.02, 0.54, -0.1], 'chrome'),
      kit.box([0.03, 0.14, 0.03], [BX + BW / 2 + 0.02, 0.54, 0.8], 'chrome'),
    );

    // side table with flowers (z 0.35..0.9), top 0.5
    const TX = 0.4;
    const TZ = 0.62;
    parts.push(
      kit.box([0.5, 0.42, 0.46], [TX, 0.23, TZ], 'wood'),
      kit.box([0.02, 0.14, 0.4], [TX + 0.255, 0.38, TZ], 'sand'),
      kit.box([0.02, 0.14, 0.4], [TX + 0.255, 0.2, TZ], 'sand'),
      kit.box([0.04, 0.03, 0.1], [TX + 0.28, 0.38, TZ], 'sunYellow'),
      kit.box([0.04, 0.03, 0.1], [TX + 0.28, 0.2, TZ], 'sunYellow'),
      kit.box([0.56, 0.04, 0.52], [TX, 0.48, TZ], 'cream'),
      kit.cylinder(0.07, 0.06, 0.14, [TX, 0.57, TZ], 'skyBlue', { segments: 8 }),
      kit.cylinder(0.012, 0.012, 0.12, [TX, 0.69, TZ], 'leaf', { segments: 4 }),
      kit.sphere(0.06, [TX, 0.78, TZ], 'pink', { detail: 0 }),
      kit.sphere(0.05, [TX - 0.07, 0.72, TZ - 0.04], 'sunYellow', { detail: 0 }),
      kit.sphere(0.05, [TX + 0.06, 0.73, TZ + 0.05], 'purple', { detail: 0 }),
      kit.sphere(0.04, [TX + 0.02, 0.74, TZ - 0.09], 'white', { detail: 0 }),
    );

    // curtain: two posts, a rail, a row of pleats in two pastels
    const Z0 = -0.88;
    const Z1 = -0.04;
    for (const z of [Z0, Z1]) parts.push(kit.cylinder(0.03, 0.035, 1.2, [CURTAIN_X, 0.6, z], 'chrome', { segments: 8 }));
    parts.push(
      kit.box([0.07, 0.025, 0.07 + (Z1 - Z0)], [CURTAIN_X, 1.2, (Z0 + Z1) / 2], 'chrome'),
      kit.sphere(0.04, [CURTAIN_X, 1.23, Z0], 'sunYellow', { detail: 0 }),
      kit.sphere(0.04, [CURTAIN_X, 1.23, Z1], 'sunYellow', { detail: 0 }),
    );
    const N = 7;
    for (let i = 0; i < N; i++) {
      const z = Z0 + 0.06 + ((Z1 - Z0 - 0.12) * i) / (N - 1);
      parts.push(kit.box([0.06, 1.0, 0.13], [CURTAIN_X + (i % 2 ? 0.025 : -0.025), 0.68, z], i % 2 ? 'glassBlue' : 'pink'));
      parts.push(kit.box([0.03, 0.1, 0.05], [CURTAIN_X, 1.16, z], 'white'));
    }
    return kit.finish(parts);
  },
};
