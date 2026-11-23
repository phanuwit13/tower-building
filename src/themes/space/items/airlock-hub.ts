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

// A round hub module (2×2): a white drum with an orange belt, a flat dome roof with a lit skylight,
// four round doors (one on each side, each with a small lit window) and four portholes between them.
const R = 0.94;
const SEG = 16;
const WALL = R * Math.cos(Math.PI / SEG);
const DRUM_H = 0.72;

/** One round door on the drum at yaw `a` (turning from +x towards +z). */
function roundDoor(kit: StyleKit, a: number, color: PaletteColor): Part[] {
  const n: Vec3 = [Math.cos(a), 0, Math.sin(a)];
  const rotate = aim(n);
  const at = (y: number, d: number): Vec3 => [n[0] * (WALL + d), y, n[2] * (WALL + d)];
  return [
    kit.cylinder(0.27, 0.27, 0.06, at(0.36, 0.0), 'redDark', { segments: 12, rotate }),
    kit.cylinder(0.22, 0.22, 0.06, at(0.36, 0.015), color, { segments: 12, rotate }),
    ...porthole(kit, [n[0] * (WALL + 0.045), 0.42, n[2] * (WALL + 0.045)], n, 0.07, 'white', 'windowWarm'),
    kit.cylinder(0.04, 0.04, 0.05, at(0.24, 0.05), 'white', { segments: 8, rotate }), // wheel handle hub
  ];
}

/** ชุมทางประตูลม: a round hub with four round doors. */
export const item: ItemModel = {
  id: 'airlock-hub',
  name: 'ชุมทางประตูลม',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(R + 0.03, R + 0.03, 0.06, [0, 0.03, 0], 'stoneDark', { segments: SEG }),
      kit.cylinder(R, R, DRUM_H - 0.06, [0, 0.06 + (DRUM_H - 0.06) / 2, 0], 'white', { segments: SEG }),
      kit.cylinder(R + 0.02, R + 0.02, 0.1, [0, 0.62, 0], 'orange', { segments: SEG }),
      kit.cylinder(R + 0.02, R + 0.02, 0.05, [0, 0.1, 0], 'teal', { segments: SEG }),
      // flat dome roof, teal rim, lit skylight and a little mast
      kit.cylinder(R - 0.02, R - 0.02, 0.05, [0, DRUM_H + 0.015, 0], 'teal', { segments: SEG }),
      kit.dome(R - 0.06, [0, DRUM_H + 0.04, 0], 'white', { segments: SEG, scale: [1, 0.48, 1] }),
      kit.dome(0.2, [0, DRUM_H + 0.04 + 0.4, 0], 'teal', { segments: 12, scale: [1, 0.7, 1], glow: 'teal', light: 'window' }),
      kit.cylinder(0.25, 0.25, 0.05, [0, DRUM_H + 0.04 + 0.4, 0], 'orange', { segments: 12 }),
      kit.cylinder(0.015, 0.015, 0.3, [0, DRUM_H + 0.04 + 0.4 + 0.25, 0], 'stoneDark', { segments: 6 }),
      kit.sphere(0.045, [0, DRUM_H + 0.04 + 0.4 + 0.42, 0], 'red', { detail: 0 }),
    ];
    const doorColors: PaletteColor[] = ['sunYellow', 'blue', 'sunYellow', 'blue'];
    for (let i = 0; i < 4; i++) parts.push(...roundDoor(kit, (i * Math.PI) / 2, doorColors[i]));
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      const n: Vec3 = [Math.cos(a), 0, Math.sin(a)];
      parts.push(...porthole(kit, [n[0] * WALL, 0.36, n[2] * WALL], n, 0.08, 'teal', i % 2 ? 'teal' : 'windowWarm'));
    }
    return kit.finish(parts);
  },
};
