import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';
import { aim, along, heading } from '../../../models/parts';

const SAND_H = 0.03;
const TRUNK = { z: 0.58, lean: 0.05, top: 1.15, r: 0.065, n: 4 }; // two short leaning palms at z = +-0.58
const ATTACH = { y: 0.8, z: 0.57 }; // where the hammock ropes meet the trunks (on the hammock's rocking axis)
const HAMMOCK = { z: 0.5, sag: 0.3, w: 0.32, segs: 8 };
const FROND_SCALE = 0.55;
const FROND_T = 0.02;
const FROND_PIECES: Array<[number, number, number]> = [[0.22, 0.15, 0.3], [0.2, 0.13, -0.25], [0.16, 0.09, -0.85]];
// the crowns sway about the tops of their trunks (each its own pivot), the hammock rocks about the line between the ropes' ends
const HAMMOCK_ROCK: MotionOpts = { kind: 'swing', pivot: [0, ATTACH.y, 0], axis: [0, 0, 1], amount: 0.1, speed: 1.7 };

/** One short palm at z = sign * TRUNK.z: ringed leaning trunk, a crown of fronds and two coconuts. */
function palm(kit: StyleKit, sign: number): Part[] {
  const top: Vec3 = [0, TRUNK.top, sign * (TRUNK.z + TRUNK.lean)];
  const sway: MotionOpts = { kind: 'sway', pivot: [top[0], top[1] - 0.02, top[2]], amount: 0.08 };
  const at = (t: number): Vec3 => [0, SAND_H + (TRUNK.top - SAND_H) * t, sign * (TRUNK.z + TRUNK.lean * t)];
  const parts: Part[] = [];
  for (let i = 0; i < TRUNK.n; i++) {
    const a = at(i / TRUNK.n);
    const b = at((i + 1) / TRUNK.n);
    const dir: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    parts.push(kit.cylinder(TRUNK.r * (0.85 + 0.0 * i), TRUNK.r * 1.05, Math.hypot(dir[1], dir[2]) + 0.01, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2],
      i % 2 ? 'woodDark' : 'wood', { segments: 7, rotate: aim(dir) }));
  }
  parts.push(kit.sphere(0.08, [top[0], top[1] + 0.02, top[2]], 'leafDark', { detail: 0, motion: sway }));
  for (let k = 0; k < 2; k++) {
    const a = 1.5 + k * Math.PI;
    parts.push(kit.sphere(0.06, [top[0] + Math.cos(a) * 0.07, top[1] - 0.09, top[2] - Math.sin(a) * 0.07], 'woodDark', { detail: 0, motion: sway }));
  }
  for (let f = 0; f < 7; f++) {
    const yaw = 0.2 + (f / 7) * Math.PI * 2;
    const color: PaletteColor = f % 2 === 0 ? 'leaf' : 'leafDark';
    let p = along([top[0], top[1] + 0.04, top[2]], heading(yaw, 0), 0.03);
    for (const [len0, wid0, pitch] of FROND_PIECES) {
      const len = len0 * FROND_SCALE;
      const d = heading(yaw, pitch);
      parts.push(kit.cylinder(1, 1, FROND_T, along(p, d, len / 2), color, { segments: 4, scale: [len / 2, 1, (wid0 * FROND_SCALE) / 2], rotate: [0, yaw, pitch], motion: sway }));
      p = along(p, d, len * 0.8);
    }
  }
  return parts;
}

/** เปลญวนระหว่างมะพร้าว: a hammock strung between two short palms; the palms and the hammock sway together. */
export const item: ItemModel = {
  id: 'palm-hammock',
  name: 'เปลญวนระหว่างมะพร้าว',
  category: 'seating',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.96, SAND_H, 1.96], [0, SAND_H / 2, 0], 'sand'), ...palm(kit, 1), ...palm(kit, -1)];
    // hammock cloth: a hanging chain of tilted strips along z, alternating colours
    const pt = (k: number): Vec3 => {
      const z = -HAMMOCK.z + (2 * HAMMOCK.z * k) / HAMMOCK.segs;
      return [0, ATTACH.y - HAMMOCK.sag * (1 - (z / HAMMOCK.z) ** 2), z];
    };
    for (let k = 0; k < HAMMOCK.segs; k++) {
      const a = pt(k);
      const b = pt(k + 1);
      const len = Math.hypot(b[1] - a[1], b[2] - a[2]);
      parts.push(kit.box([HAMMOCK.w, 0.025, len * 1.08], [0, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], k % 2 ? 'sunYellow' : 'red',
        { rotate: [Math.atan2(-(b[1] - a[1]), b[2] - a[2]), 0, 0], motion: HAMMOCK_ROCK }));
    }
    // ropes: from the trunk (on the rocking axis) out to both edges of each hammock end
    for (const s of [-1, 1]) {
      for (const e of [-1, 1]) {
        const from: Vec3 = [0, ATTACH.y, s * ATTACH.z];
        const to: Vec3 = [e * HAMMOCK.w / 2, pt(s > 0 ? HAMMOCK.segs : 0)[1], s * HAMMOCK.z];
        const dir: Vec3 = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
        parts.push(kit.cylinder(0.012, 0.012, Math.hypot(...dir), [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2], 'sand',
          { segments: 4, rotate: aim(dir), motion: HAMMOCK_ROCK }));
      }
    }
    return kit.finish(parts);
  },
};
