import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { gableRoof, glassWindow, rod } from '../../../models/parts';

// Three two-storey Thai shophouses in a row along z. Each has a half-raised roll-up shutter, a
// balcony with a rail, a lit window, a low gable roof and a navy sign board with its own neon icon.
const PAD = 0.03;
const WALL_X = 0.72; // front wall surface
const BACK_X = -0.88;
const UNIT_Z = 0.96;
const FLOOR1 = 0.58;
const WALL_TOP = 1.12;
const RISE = 0.2;
const SIGN_Y = 0.48;
const TUBE = 0.035; // neon tube radius
const END_Z = 0.96 + UNIT_Z / 2; // outer face of the end units

type Pt = [number, number];
const UNITS: { z: number; wall: PaletteColor; roof: PaletteColor; neon: PaletteColor; icon: Pt[][] }[] = [
  { z: -0.96, wall: 'cream', roof: 'terracotta', neon: 'purple', icon: [starPts()] },
  { z: 0, wall: 'mint', roof: 'blue', neon: 'red', icon: [heartPts()] },
  { z: 0.96, wall: 'sand', roof: 'red', neon: 'blue', icon: cupPts() },
];

function starPts(): Pt[] {
  // a five-point star drawn as a pentagram: every second point of five, closed
  const r = 0.105;
  const p = (i: number): Pt => [r * Math.sin(Math.PI / 2 + (i * 4 * Math.PI) / 5), r * Math.cos(Math.PI / 2 + (i * 4 * Math.PI) / 5)];
  return [p(0), p(1), p(2), p(3), p(4), p(0)];
}
function heartPts(): Pt[] {
  return [[-0.1, 0], [-0.02, -0.1], [0.06, -0.1], [0.1, -0.05], [0.06, 0], [0.1, 0.05], [0.06, 0.1], [-0.02, 0.1], [-0.1, 0]];
}
function cupPts(): Pt[][] {
  return [
    [[0.07, -0.07], [0.07, 0.07], [-0.07, 0.05], [-0.07, -0.05], [0.07, -0.07]], // cup
    [[0.04, 0.07], [0.04, 0.12], [-0.03, 0.12], [-0.03, 0.06]], // handle
    [[0.1, -0.03], [0.14, 0.0]], // steam
  ];
}

/** ตึกแถวร้านค้า: three Thai shophouses in a row with roll-up shutters, balconies and different neon icons. */
export const item: ItemModel = {
  id: 'shophouse-row',
  name: 'ตึกแถวร้านค้า',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const depth = WALL_X - BACK_X;
    const cx = (WALL_X + BACK_X) / 2;
    const parts: Part[] = [kit.box([1.96, PAD, 2.96], [0, PAD / 2, 0], 'stone')];
    for (const u of UNITS) {
      parts.push(
        kit.box([depth, WALL_TOP - PAD, UNIT_Z], [cx, (PAD + WALL_TOP) / 2, u.z], u.wall),
        kit.wedge([UNIT_Z - 0.02, RISE, depth], [cx, WALL_TOP + RISE / 2, u.z], u.wall, { rotate: [0, Math.PI / 2, 0] }),
        ...gableRoof(kit, { at: [cx, WALL_TOP, u.z], length: depth + 0.1, width: UNIT_Z - 0.04, rise: RISE, eave: 0.02, color: u.roof, ridge: 'redDark', along: 'x' }),
        // floor band
        kit.box([depth + 0.04, 0.04, UNIT_Z], [cx, FLOOR1, u.z], 'white'),
        // roll-up shutter, half raised: slatted panel with a bottom bar
        kit.box([0.03, 0.34, 0.64], [WALL_X + 0.015, PAD + 0.17, u.z], 'stone'),
        kit.box([0.04, 0.03, 0.62], [WALL_X + 0.02, PAD + 0.2, u.z], 'stoneDark'),
        kit.box([0.04, 0.03, 0.62], [WALL_X + 0.02, PAD + 0.12, u.z], 'stoneDark'),
        kit.box([0.05, 0.04, 0.68], [WALL_X + 0.025, PAD + 0.02, u.z], 'chrome'),
        // sign board with neon
        kit.box([0.05, 0.28, 0.76], [WALL_X + 0.025, SIGN_Y, u.z], 'navy'),
        // thin neon strip along the top of the first-floor wall
        kit.box([0.03, 0.035, 0.8], [WALL_X + 0.015, WALL_TOP - 0.03, u.z], u.neon, { glow: u.neon }),
        // balcony: slab, rail and posts on the first floor
        kit.box([0.22, 0.04, 0.82], [WALL_X + 0.11, FLOOR1 + 0.04, u.z], 'stone'),
        kit.box([0.025, 0.04, 0.82], [WALL_X + 0.21, FLOOR1 + 0.15, u.z], 'white'),
        ...[-0.38, -0.19, 0, 0.19, 0.38].map((dz) => kit.box([0.025, 0.11, 0.025], [WALL_X + 0.21, FLOOR1 + 0.095, u.z + dz], 'white')),
        ...glassWindow(kit, { at: [WALL_X, 0.86, u.z], facing: 'x+', w: 0.5, h: 0.3 }),
        ...glassWindow(kit, { at: [BACK_X, 0.86, u.z], facing: 'x-', w: 0.5, h: 0.3 }),
        ...glassWindow(kit, { at: [BACK_X, 0.3, u.z], facing: 'x-', w: 0.4, h: 0.26, panes: 1 }),
      );
      for (const line of u.icon) {
        for (let i = 0; i < line.length; i++) {
          const a = line[i]!;
          const at = (q: Pt): [number, number, number] => [WALL_X + 0.08, SIGN_Y + q[0], u.z + q[1]];
          parts.push(kit.sphere(TUBE, at(a), u.neon, { detail: 0, glow: u.neon }));
          const b = line[i + 1];
          if (b && !(a[0] === b[0] && a[1] === b[1])) parts.push(rod(kit, at(a), at(b), TUBE, u.neon, { segments: 6, glow: u.neon }));
        }
      }
    }
    // end walls windows
    parts.push(
      ...glassWindow(kit, { at: [cx, 0.86, END_Z], facing: 'z+', w: 0.4, h: 0.3 }),
      ...glassWindow(kit, { at: [cx, 0.86, -END_Z], facing: 'z-', w: 0.4, h: 0.3 }),
    );
    return kit.finish(parts);
  },
};
