import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

// 2x3 (x by z). A pond with koi, a little arched bridge across it, rocks, moss and a pine.
const WATER_TOP = 0.05;
const POND = { x: 0.05, z: -0.3, rx: 0.72, rz: 0.98 };
const BRIDGE = { z: POND.z, half: 0.66, rise: 0.3, base: 0.07, width: 0.34, n: 6 };
/** Rim rocks, round the pond: [angle, size, colour]. */
const ROCKS: Array<[number, number, PaletteColor]> = [
  [0.3, 0.12, 'stone'], [0.95, 0.1, 'stoneDark'], [1.6, 0.13, 'stone'], [2.35, 0.11, 'stone'], [3.0, 0.12, 'stoneDark'],
  [3.7, 0.1, 'stone'], [4.2, 0.13, 'stone'], [4.75, 0.11, 'stoneDark'], [5.5, 0.12, 'stone'],
];

function koi(kit: StyleKit, x: number, z: number, yaw: number, body: PaletteColor, patch: PaletteColor): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const at = (f: number, up: number): Vec3 => [x + f * c, WATER_TOP + up, z - f * s];
  const rotate: Vec3 = [0, yaw, 0];
  return [
    kit.sphere(0.09, at(0, 0.03), body, { detail: 0, scale: [1.7, 0.55, 0.8], rotate }),
    kit.sphere(0.055, at(0.02, 0.07), patch, { detail: 0, scale: [1.5, 0.4, 0.8], rotate }),
    kit.cone(0.06, 0.12, at(-0.18, 0.025), body, { segments: 4, rotate: [0, yaw, Math.PI / 2], scale: [1, 1, 0.3] }),
  ];
}

/** สวนญี่ปุ่น: a koi pond, an arched bridge, rocks, moss and a pine. */
export const item: ItemModel = {
  id: 'japanese-garden',
  name: 'สวนญี่ปุ่น',
  category: 'nature',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.98, 0.03, 2.98], [0, 0.015, 0], 'lime'),
      kit.cylinder(1, 1, 0.045, [POND.x, 0.0225, POND.z], 'sand', { segments: 16, scale: [POND.rx + 0.1, 1, POND.rz + 0.1] }),
      kit.cylinder(1, 1, WATER_TOP, [POND.x, WATER_TOP / 2, POND.z], 'navy', { segments: 16, scale: [POND.rx, 1, POND.rz], motion: { kind: 'water', water: 'pond' } }),
    ];
    for (const [a, size, colour] of ROCKS) {
      parts.push(kit.sphere(size, [POND.x + (POND.rx + 0.06) * Math.cos(a), size * 0.6, POND.z - (POND.rz + 0.06) * Math.sin(a)], colour, { detail: 0, scale: [1.2, 0.7, 1], rotate: [0, a, 0] }));
    }
    // koi
    parts.push(
      ...koi(kit, 0.25, -0.75, 0.6, 'orange', 'white'),
      ...koi(kit, -0.3, 0.1, 3.6, 'white', 'orange'),
      ...koi(kit, 0.3, -0.05, 5.2, 'sunYellow', 'white'),
    );
    parts.push(kit.cylinder(0.09, 0.09, 0.02, [-0.35, WATER_TOP + 0.01 + 0.004, -0.55], 'leaf', { segments: 8 }), kit.sphere(0.04, [-0.35, WATER_TOP + 0.045, -0.55], 'pink', { detail: 0 }));
    // arched red bridge across the pond (along x), in short tilted planks
    const y = (t: number): number => BRIDGE.base + BRIDGE.rise * Math.sin(t);
    const bx = (t: number): number => POND.x + BRIDGE.half * Math.cos(t);
    for (let i = 0; i < BRIDGE.n; i++) {
      const t0 = Math.PI - (i / BRIDGE.n) * Math.PI;
      const t1 = Math.PI - ((i + 1) / BRIDGE.n) * Math.PI;
      const dx = bx(t1) - bx(t0);
      const dy = y(t1) - y(t0);
      const len = Math.hypot(dx, dy) + 0.03;
      parts.push(kit.box([len, 0.05, BRIDGE.width], [(bx(t0) + bx(t1)) / 2, (y(t0) + y(t1)) / 2 + 0.025, BRIDGE.z], 'red', { rotate: [0, 0, Math.atan2(dy, dx)] }));
    }
    for (const sz of [-1, 1]) {
      const rz = BRIDGE.z + sz * (BRIDGE.width / 2 - 0.015);
      const tops: Vec3[] = [];
      for (let i = 0; i <= BRIDGE.n; i += 2) {
        const t = Math.PI - (i / BRIDGE.n) * Math.PI;
        const top: Vec3 = [bx(t), y(t) + 0.2, rz];
        tops.push(top);
        parts.push(kit.cylinder(0.025, 0.025, 0.2, [top[0], y(t) + 0.1 + 0.05, rz], 'redDark', { segments: 6 }));
      }
      for (let k = 0; k < tops.length - 1; k++) parts.push(rod(kit, [tops[k][0], tops[k][1] + 0.05, rz], [tops[k + 1][0], tops[k + 1][1] + 0.05, rz], 0.02, 'redDark', { segments: 4 }));
    }
    for (const sx of [-1, 1]) parts.push(kit.box([0.16, 0.06, 0.42], [POND.x + sx * (BRIDGE.half + 0.1), 0.06, BRIDGE.z], 'stone'));
    // stepping stones and a rock-and-moss group on the bank
    for (const [x, z] of [[0.55, 0.78], [0.3, 0.98], [0.05, 1.12], [-0.15, 1.28]] as Array<[number, number]>) parts.push(kit.cylinder(0.12, 0.13, 0.05, [x, 0.025, z], 'stone', { segments: 8 }));
    parts.push(
      kit.sphere(0.24, [0.6, 0.19, 1.15], 'stoneDark', { detail: 1, scale: [1.1, 0.75, 1] }),
      kit.sphere(0.15, [0.35, 0.11, 1.3], 'stone', { detail: 0, scale: [1.2, 0.7, 1] }),
      kit.sphere(0.2, [0.62, 0.36, 1.15], 'leaf', { detail: 0, scale: [1, 0.35, 0.9] }), // moss cap
      kit.sphere(0.1, [-0.7, 0.08, -1.35], 'leafDark', { detail: 0, scale: [1.4, 0.7, 1] }),
      kit.sphere(0.12, [0.75, 0.1, -1.3], 'leaf', { detail: 0, scale: [1.3, 0.7, 1] }),
    );
    // pine: leaning trunk, flat cloud layers
    const PX = -0.5;
    const PZ = 1.05;
    parts.push(
      kit.cylinder(0.07, 0.1, 0.7, [PX, 0.35, PZ], 'bark', { segments: 8 }),
      kit.cylinder(0.05, 0.07, 0.5, [PX + 0.06, 0.85, PZ], 'bark', { segments: 8, rotate: [0, 0, -0.2] }),
    );
    [[0.62, 0.29], [0.93, 0.25], [1.2, 0.2]].forEach(([yy, r], i) => {
      const cx = PX + 0.06 + i * 0.03;
      parts.push(
        kit.sphere(r, [cx, yy, PZ], 'leafDark', { detail: 1, scale: [1.3, 0.4, 1.3] }),
        kit.sphere(r * 0.6, [cx + r * 0.7, yy - 0.02, PZ + r * 0.3], 'leaf', { detail: 0, scale: [1.2, 0.5, 1.2] }),
        kit.sphere(r * 0.6, [cx - r * 0.6, yy - 0.02, PZ - r * 0.4], 'leafDark', { detail: 0, scale: [1.2, 0.5, 1.2] }),
      );
    });
    return kit.finish(parts);
  },
};
