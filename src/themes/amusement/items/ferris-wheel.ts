import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

// A tall ferris wheel standing in the z-y plane on two A-frames (the wheel itself holds still: its
// cabins would turn upside down). Two rims, spokes and a hub; eight coloured cabins hang between the
// rims; chase bulbs run round both rims.
const BASE = { w: 1.7, h: 0.04, d: 2.6 };
const HUB_Y = 1.65;
const R = 1.15; // rim radius
const RIM_X = 0.14; // the two rims sit at x = +-RIM_X
const TUBE = 0.035;
const FRAME_X = 0.32; // the A-frames stand just outside the rims
const FOOT_Z = 0.95;
const CABIN = { w: 0.2, h: 0.14, d: 0.2, hang: 0.08 };
const CABIN_COLORS: PaletteColor[] = ['red', 'sunYellow', 'blue', 'pink', 'leaf', 'orange', 'purple', 'mint'];
const BULBS = 12;

/** ชิงช้าสวรรค์: a tall ferris wheel with coloured cabins and chasing rim lights. */
export const item: ItemModel = {
  id: 'ferris-wheel',
  name: 'ชิงช้าสวรรค์',
  category: 'ride',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'stone')];
    // hub and axle along x
    parts.push(
      kit.cylinder(0.1, 0.1, 2 * FRAME_X + 0.1, [0, HUB_Y, 0], 'sunYellow', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
    );
    for (const sx of [-1, 1]) {
      const x = sx * RIM_X;
      parts.push(kit.torus(R, TUBE, [x, HUB_Y, 0], 'white', { radialSegments: 4, tubularSegments: 16, rotate: [0, Math.PI / 2, 0] }));
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 4;
        const dz = R * Math.cos(a);
        const dy = R * Math.sin(a);
        parts.push(rod(kit, [x, HUB_Y - dy, -dz], [x, HUB_Y + dy, dz], 0.02, 'stoneDark', { segments: 4 }));
      }
      // A-frame: two legs from the axle down to the base, with a cross bar
      const hubTop: [number, number, number] = [sx * FRAME_X, HUB_Y, 0];
      for (const sz of [-1, 1]) {
        parts.push(
          rod(kit, hubTop, [sx * FRAME_X, BASE.h - 0.01, sz * FOOT_Z], 0.045, 'red', { segments: 6 }),
          kit.box([0.12, 0.06, 0.16], [sx * FRAME_X, BASE.h + 0.03, sz * FOOT_Z], 'redDark'),
        );
      }
      const barY = 0.6;
      const barZ = FOOT_Z * (1 - (barY - BASE.h) / (HUB_Y - BASE.h));
      parts.push(rod(kit, [sx * FRAME_X, barY, -barZ], [sx * FRAME_X, barY, barZ], 0.025, 'redDark', { segments: 4 }));
      // chase bulbs round this rim (anticlockwise seen from +x)
      for (let index = 0; index < BULBS; index++) {
        const a = (index / BULBS) * Math.PI * 2;
        parts.push(kit.sphere(0.04, [x + sx * 0.03, HUB_Y + R * Math.sin(a), R * Math.cos(a)], 'lampWarm',
          { detail: 0, glow: true, light: 'chase', chase: { index, count: BULBS } }));
      }
    }
    // cabins hang between the rims on a pin at the rim, always upright
    CABIN_COLORS.forEach((color, i) => {
      const a = (i / CABIN_COLORS.length) * Math.PI * 2 + Math.PI / 8;
      const pz = R * Math.cos(a);
      const py = HUB_Y + R * Math.sin(a);
      const cy = py - CABIN.hang - CABIN.h / 2;
      parts.push(
        rod(kit, [-RIM_X, py, pz], [RIM_X, py, pz], 0.015, 'stoneDark', { segments: 4 }),
        kit.cylinder(0.012, 0.012, CABIN.hang, [0, py - CABIN.hang / 2, pz], 'stoneDark', { segments: 4 }),
        kit.box([CABIN.w, CABIN.h, CABIN.d], [0, cy, pz], color),
        kit.cone(0.1, 0.1, [0, cy + CABIN.h / 2 + 0.05, pz], 'white', { segments: 6 }),
      );
    });
    return kit.finish(parts);
  },
};
