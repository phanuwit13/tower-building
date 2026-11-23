import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { aim } from '../../../models/parts';

/** A round window (porthole) at `c`, facing the unit direction `n`: a frame ring and a glass disc that glows at night. */
function porthole(kit: StyleKit, c: Vec3, n: Vec3, r: number, frame: PaletteColor, glow: PaletteColor): Part[] {
  const len = Math.hypot(n[0], n[1], n[2]);
  const u: Vec3 = [n[0] / len, n[1] / len, n[2] / len];
  const rotate = aim(u);
  const at = (d: number): Vec3 => [c[0] + u[0] * d, c[1] + u[1] * d, c[2] + u[2] * d];
  return [
    kit.cylinder(r + 0.03, r + 0.03, 0.03, at(0), frame, { segments: 10, rotate }),
    kit.cylinder(r, r, 0.03, at(0.012), 'skyBlue', { segments: 10, rotate, glow, light: 'window' }),
  ];
}

// A glass dome café (2×2). A white drum with a red band and round windows holds the floor, tables and
// stools; the glass dome is a see-through frame of ribs (so the tables show), and a giant cup sits on top.
const R = 0.92;
const SEG = 16;
const WALL = R * Math.cos(Math.PI / SEG);
const DRUM_H = 0.3;
const RIB_H = 0.5; // dome ribs rise this far above the drum
const RIB_R = 0.86;

function table(kit: StyleKit, x: number, z: number, top: PaletteColor, stool: PaletteColor): Part[] {
  const f = DRUM_H + 0.02;
  return [
    kit.cylinder(0.035, 0.05, 0.2, [x, f + 0.1, z], 'stoneDark', { segments: 8 }),
    kit.cylinder(0.16, 0.16, 0.03, [x, f + 0.215, z], top, { segments: 10 }),
    kit.cylinder(0.06, 0.06, 0.1, [x + 0.24, f + 0.05, z + 0.12], stool, { segments: 8 }),
    kit.cylinder(0.06, 0.06, 0.1, [x - 0.2, f + 0.05, z - 0.18], stool, { segments: 8 }),
  ];
}

/** คาเฟ่อวกาศ: a glass dome café with tables inside and a giant cup on top. */
export const item: ItemModel = {
  id: 'space-cafe',
  name: 'คาเฟ่อวกาศ',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(R + 0.03, R + 0.03, 0.06, [0, 0.03, 0], 'stoneDark', { segments: SEG }),
      kit.cylinder(R, R, DRUM_H - 0.06, [0, 0.06 + (DRUM_H - 0.06) / 2, 0], 'white', { segments: SEG }),
      kit.cylinder(R + 0.02, R + 0.02, 0.1, [0, 0.2, 0], 'red', { segments: SEG }),
      // floor inside, with a pink rug
      kit.cylinder(R - 0.02, R - 0.02, 0.03, [0, DRUM_H + 0.005, 0], 'cream', { segments: SEG }),
      kit.cylinder(0.5, 0.5, 0.02, [0, DRUM_H + 0.02, 0], 'pink', { segments: 14 }),
      // glass dome ribs (half-ring arches, flattened) and a rim ring
      kit.cylinder(R - 0.02, R - 0.02, 0.05, [0, DRUM_H + 0.01, 0], 'white', { segments: SEG }),
    ];
    for (let i = 0; i < 3; i++) {
      parts.push(kit.torus(RIB_R, 0.03, [0, DRUM_H + 0.02, 0], 'white', {
        arc: Math.PI, radialSegments: 4, tubularSegments: 8, scale: [1, RIB_H / RIB_R, 1], rotate: [0, (i * Math.PI) / 3, 0],
      }));
    }
    // a belt ring round the dome halfway up
    parts.push(kit.torus(RIB_R * 0.8, 0.03, [0, DRUM_H + 0.02 + RIB_H * 0.6, 0], 'teal', { radialSegments: 4, tubularSegments: 16, rotate: [Math.PI / 2, 0, 0] }));
    // one lit glass pane between the ribs, low on the +x side
    parts.push(kit.dome(0.17, [0, DRUM_H + RIB_H - 0.02, 0], 'skyBlue', { segments: 8, glow: 'windowWarm', light: 'window' }));
    // tables and a warm lamp inside
    parts.push(...table(kit, 0.4, 0.3, 'sunYellow', 'orange'));
    parts.push(...table(kit, -0.35, 0.4, 'sunYellow', 'blue'));
    parts.push(...table(kit, 0.05, -0.45, 'sunYellow', 'purple'));
    parts.push(kit.sphere(0.07, [0, DRUM_H + 0.3, 0.05], 'lampWarm', { detail: 0, glow: true, light: 'breathe' }));
    // round windows in the drum, on the visible sides
    for (let i = 0; i < 6; i++) {
      const a = (-0.38 + i * 0.28) * Math.PI;
      const n: Vec3 = [Math.cos(a), 0, Math.sin(a)];
      parts.push(...porthole(kit, [n[0] * WALL, 0.2, n[2] * WALL], n, 0.055, 'red', i % 2 ? 'teal' : 'windowWarm'));
    }
    // the giant cup on top: cup, red band, coffee, handle and a saucer
    const cy = DRUM_H + RIB_H + 0.02;
    parts.push(
      kit.cylinder(0.4, 0.4, 0.04, [0, cy + 0.02, 0], 'teal', { segments: 14 }),
      kit.cylinder(0.34, 0.22, 0.4, [0, cy + 0.04 + 0.2, 0], 'white', { segments: 14 }),
      kit.cylinder(0.3, 0.26, 0.1, [0, cy + 0.04 + 0.16, 0], 'pink', { segments: 14 }),
      kit.torus(0.3, 0.025, [0, cy + 0.04 + 0.4, 0], 'white', { radialSegments: 4, tubularSegments: 16, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.27, 0.27, 0.02, [0, cy + 0.04 + 0.38, 0], 'bark', { segments: 14 }),
      kit.torus(0.1, 0.035, [0.36, cy + 0.04 + 0.22, 0], 'white', { radialSegments: 5, tubularSegments: 8 }),
      kit.sphere(0.04, [0.07, cy + 0.04 + 0.5, 0.03], 'white', { detail: 0, scale: [1, 1.4, 1] }),
      kit.sphere(0.035, [-0.07, cy + 0.04 + 0.6, -0.03], 'white', { detail: 0, scale: [1, 1.4, 1] }),
    );
    return kit.finish(parts);
  },
};
