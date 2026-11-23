import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';

// A long U-shaped front desk (2×3, long side along z, front on +x) with rounded outer corners. On the
// counter: a heart-and-plus sign (teal heart, white plus) on a stand, two screens showing sun pictures,
// a bell and two plants. The front carries colour blocks, no text.
const TOP_Y = 0.62;
const SLAB = 0.04;
const BODY_H = TOP_Y - SLAB;
const FRONT_X = 0.55; // centre of the front bar
const WING_Z = 1.2; // centre z of each wing / corner
const SIGN_X = FRONT_X;
const SIGN_Y = 1.07;

/** เคาน์เตอร์ประชาสัมพันธ์: long curved front desk with screens, a heart-and-plus sign and plants. */
export const item: ItemModel = {
  id: 'reception-desk',
  name: 'เคาน์เตอร์ประชาสัมพันธ์',
  category: 'facility',
  footprint: { w: 2, d: 3 },
  build: (kit: StyleKit) => {
    const parts: Part[] = [
      // body: front bar, wings and rounded corners, with a teal plinth
      kit.box([0.5, BODY_H - 0.04, 2.4], [FRONT_X, 0.04 + (BODY_H - 0.04) / 2, 0], 'mint'),
      kit.box([0.56, 0.04, 2.46], [FRONT_X, 0.02, 0], 'teal'),
      // top slabs
      kit.box([0.56, SLAB, 2.4], [FRONT_X, TOP_Y - SLAB / 2, 0], 'teal'),
    ];
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([1.25, BODY_H - 0.04, 0.5], [-0.075, 0.04 + (BODY_H - 0.04) / 2, s * WING_Z], 'mint'),
        kit.box([1.31, 0.04, 0.56], [-0.075, 0.02, s * WING_Z], 'teal'),
        kit.box([1.31, SLAB, 0.56], [-0.075, TOP_Y - SLAB / 2, s * WING_Z], 'teal'),
        kit.cylinder(0.25, 0.25, BODY_H - 0.04, [FRONT_X, 0.04 + (BODY_H - 0.04) / 2, s * WING_Z], 'mint', { segments: 12 }),
        kit.cylinder(0.28, 0.28, 0.04, [FRONT_X, 0.02, s * WING_Z], 'teal', { segments: 12 }),
        kit.cylinder(0.28, 0.28, SLAB, [FRONT_X, TOP_Y - SLAB / 2, s * WING_Z], 'teal', { segments: 12 }),
      );
    }

    // front colour blocks on the +x face
    const blocks = ['sunYellow', 'pink', 'lime', 'orange', 'skyBlue', 'purple', 'sunYellow', 'pink'] as const;
    blocks.forEach((c, i) => parts.push(kit.box([0.02, 0.26, 0.2], [FRONT_X + 0.26, 0.31, -0.84 + i * 0.24], c)));

    // heart-and-plus sign on a stand: white board in a teal frame, teal heart, white plus
    const faceX = SIGN_X + 0.02;
    parts.push(
      kit.box([0.14, 0.03, 0.4], [SIGN_X, TOP_Y + 0.015, 0], 'charcoal'),
      kit.box([0.04, 0.2, 0.04], [SIGN_X, TOP_Y + 0.12, -0.18], 'charcoal'),
      kit.box([0.04, 0.2, 0.04], [SIGN_X, TOP_Y + 0.12, 0.18], 'charcoal'),
      kit.box([0.04, 0.5, 0.7], [SIGN_X, SIGN_Y, 0], 'white'),
      kit.box([0.05, 0.04, 0.74], [SIGN_X, SIGN_Y + 0.27, 0], 'teal'),
      kit.box([0.05, 0.04, 0.74], [SIGN_X, SIGN_Y - 0.27, 0], 'teal'),
      kit.box([0.05, 0.5, 0.04], [SIGN_X, SIGN_Y, -0.35], 'teal'),
      kit.box([0.05, 0.5, 0.04], [SIGN_X, SIGN_Y, 0.35], 'teal'),
      kit.sphere(0.11, [faceX + 0.015, SIGN_Y + 0.07, -0.085], 'teal', { scale: [0.25, 1, 1] }),
      kit.sphere(0.11, [faceX + 0.015, SIGN_Y + 0.07, 0.085], 'teal', { scale: [0.25, 1, 1] }),
      kit.cone(0.2, 0.26, [faceX + 0.015, SIGN_Y - 0.05, 0], 'teal', { rotate: [Math.PI, 0, 0], scale: [0.25, 1, 1] }),
      kit.box([0.04, 0.15, 0.045], [faceX + 0.045, SIGN_Y + 0.02, 0], 'white'),
      kit.box([0.04, 0.045, 0.15], [faceX + 0.045, SIGN_Y + 0.02, 0], 'white'),
    );

    // two screens on the front bar: sun picture (yellow sun, white cloud, green hill)
    for (const z of [-0.72, 0.72]) {
      const sx = 0.45;
      parts.push(
        kit.box([0.08, 0.04, 0.1], [sx, TOP_Y + 0.02, z], 'charcoal'),
        kit.box([0.04, 0.05, 0.05], [sx, TOP_Y + 0.065, z], 'charcoal'),
        kit.box([0.04, 0.18, 0.26], [sx, TOP_Y + 0.17, z], 'charcoal'),
        kit.box([0.01, 0.14, 0.22], [sx + 0.025, TOP_Y + 0.17, z], 'skyBlue', { glow: 'skyBlue', light: 'window' }),
        kit.box([0.012, 0.05, 0.22], [sx + 0.03, TOP_Y + 0.125, z], 'lime'),
        kit.sphere(0.035, [sx + 0.035, TOP_Y + 0.2, z + 0.06], 'sunYellow', { detail: 0, scale: [0.3, 1, 1] }),
        kit.sphere(0.025, [sx + 0.035, TOP_Y + 0.21, z - 0.05], 'white', { detail: 0, scale: [0.3, 1, 1.4] }),
      );
    }

    // service bell and pen cup
    parts.push(
      kit.cylinder(0.07, 0.08, 0.02, [0.42, TOP_Y + 0.01, -1.05], 'brass', { segments: 10 }),
      kit.dome(0.06, [0.42, TOP_Y + 0.02, -1.05], 'sunYellow', { segments: 10 }),
      kit.cylinder(0.05, 0.05, 0.1, [0.42, TOP_Y + 0.05, 1.05], 'orange', { segments: 8 }),
      kit.box([0.015, 0.1, 0.015], [0.42, TOP_Y + 0.15, 1.04], 'blue'),
      kit.box([0.015, 0.1, 0.015], [0.43, TOP_Y + 0.15, 1.07], 'red'),
    );

    // plants on the wing ends
    for (const s of [-1, 1]) {
      const z = s * 1.2;
      parts.push(
        kit.cylinder(0.12, 0.09, 0.16, [-0.55, TOP_Y + 0.08, z], 'terracotta', { segments: 10 }),
        kit.sphere(0.17, [-0.55, TOP_Y + 0.28, z], 'leaf'),
        kit.sphere(0.1, [-0.5, TOP_Y + 0.4, z + 0.05], 'leafDark', { detail: 0 }),
      );
    }
    return kit.finish(parts);
  },
};
