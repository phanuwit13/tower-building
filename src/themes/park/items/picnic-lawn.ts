import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { ICO_LOW } from '../../../models/parts';

const LAWN = { w: 1.9, d: 2.9, h: 0.03 }; // the grass pad (x by z), top at 0.03
const BLANKET_H = 0.02; // the blanket's base slab, on the lawn
const CHECK_H = 0.01; // the coloured check squares on the blanket
const BLANKET_TOP = LAWN.h + BLANKET_H;
const KITE = { x: 0.58, z: 0.55, yaw: 0.4 }; // lies on the grass; its long axis points along +z, then turns by yaw

/** A checked blanket seen from above: a pale base slab with coloured squares on alternate cells. */
function blanket(kit: StyleKit, cx: number, cz: number, sx: number, sz: number, nx: number, nz: number, yaw: number, a: PaletteColor, b: PaletteColor): Part[] {
  const parts: Part[] = [kit.box([sx, BLANKET_H, sz], [cx, LAWN.h + BLANKET_H / 2, cz], b, { rotate: [0, yaw, 0] })];
  const cx0 = sx / nx;
  const cz0 = sz / nz;
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < nz; j++) {
      if ((i + j) % 2 !== 0) continue;
      const ox = -sx / 2 + cx0 * (i + 0.5);
      const oz = -sz / 2 + cz0 * (j + 0.5);
      parts.push(kit.box([cx0, CHECK_H, cz0], [cx + ox * Math.cos(yaw) + oz * Math.sin(yaw), BLANKET_TOP + CHECK_H / 2, cz - ox * Math.sin(yaw) + oz * Math.cos(yaw)], a, { rotate: [0, yaw, 0] }));
    }
  }
  return parts;
}

/** ลานปิกนิก: a lawn with two checked blankets, baskets, fruit and a kite lying on the grass. */
export const item: ItemModel = {
  id: 'picnic-lawn',
  name: 'ลานปิกนิก',
  category: 'seating',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const top = BLANKET_TOP + CHECK_H;
    const parts: Part[] = [
      kit.box([LAWN.w, LAWN.h, LAWN.d], [0, LAWN.h / 2, 0], 'lime'),
      ...blanket(kit, 0.1, -0.7, 0.9, 1.2, 3, 4, 0.1, 'red', 'white'),
      ...blanket(kit, -0.1, 0.45, 0.85, 0.85, 3, 3, -0.3, 'blue', 'white'),
    ];
    // wicker basket on the red blanket, with a fruit plate beside it
    parts.push(
      kit.box([0.22, 0.12, 0.17], [0.3, top + 0.06, -0.95], 'wood', { rotate: [0, 0.1, 0] }),
      kit.box([0.24, 0.03, 0.19], [0.3, top + 0.135, -0.95], 'woodDark', { rotate: [0, 0.1, 0] }),
      kit.torus(0.08, 0.016, [0.3, top + 0.15, -0.95], 'woodDark', { arc: Math.PI, radialSegments: 4, tubularSegments: 8, rotate: [0, 0.1 + Math.PI / 2, 0] }),
      kit.cylinder(0.11, 0.1, 0.02, [-0.05, top + 0.01, -0.5], 'white', { segments: 8 }),
      kit.sphere(0.045, [-0.09, top + 0.02 + 0.045 * ICO_LOW, -0.5], 'red', { detail: 0 }),
      kit.sphere(0.045, [-0.01, top + 0.02 + 0.045 * ICO_LOW, -0.47], 'orange', { detail: 0 }),
      kit.sphere(0.04, [-0.05, top + 0.02 + 0.04 * ICO_LOW, -0.42], 'lime', { detail: 0 }),
    );
    // a second basket and a round cake tin on the blue blanket
    parts.push(
      kit.box([0.2, 0.11, 0.16], [-0.25, top + 0.055, 0.6], 'terracotta', { rotate: [0, -0.3, 0] }),
      kit.box([0.22, 0.03, 0.18], [-0.25, top + 0.125, 0.6], 'woodDark', { rotate: [0, -0.3, 0] }),
      kit.torus(0.075, 0.016, [-0.25, top + 0.14, 0.6], 'woodDark', { arc: Math.PI, radialSegments: 4, tubularSegments: 8, rotate: [0, -0.3 + Math.PI / 2, 0] }),
      kit.cylinder(0.08, 0.08, 0.06, [0.08, top + 0.03, 0.3], 'pink', { segments: 8 }),
      kit.sphere(0.03, [0.08, top + 0.06 + 0.03 * ICO_LOW, 0.3], 'red', { detail: 0 }),
    );
    // the kite: a long diamond with a yellow centre, two sticks and a tail of bows
    const y = LAWN.h;
    parts.push(
      kit.cylinder(0.2, 0.2, 0.012, [KITE.x, y + 0.006, KITE.z], 'red', { segments: 4, scale: [0.75, 1, 1.35], rotate: [0, KITE.yaw, 0] }),
      kit.cylinder(0.12, 0.12, 0.01, [KITE.x, y + 0.017, KITE.z], 'sunYellow', { segments: 4, scale: [0.75, 1, 1.35], rotate: [0, KITE.yaw, 0] }),
      kit.box([0.025, 0.012, 0.54], [KITE.x, y + 0.028, KITE.z], 'woodDark', { rotate: [0, KITE.yaw, 0] }),
      kit.box([0.3, 0.012, 0.025], [KITE.x, y + 0.028, KITE.z], 'woodDark', { rotate: [0, KITE.yaw, 0] }),
    );
    const dx = Math.sin(KITE.yaw);
    const dz = Math.cos(KITE.yaw);
    const tail: PaletteColor[] = ['pink', 'blue', 'sunYellow', 'purple', 'pink'];
    tail.forEach((c, i) => {
      const s = 0.31 + i * 0.12; // distance along the kite's axis from its centre
      const wiggle = (i % 2 === 0 ? 1 : -1) * 0.05; // sideways, so the tail swings a little
      parts.push(kit.sphere(0.035, [KITE.x + dx * s + dz * wiggle, y + 0.035 * 0.45 * ICO_LOW, KITE.z + dz * s - dx * wiggle], c, { detail: 0, scale: [1, 0.45, 1] }));
    });
    return kit.finish(parts);
  },
};
