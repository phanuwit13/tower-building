import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

const POT_H = 0.3;
const LEAVES = [
  // yaw angle (rad), distance of the leaf centre from the axis, height of the leaf centre, tilt, size
  { a: 0.3, d: 0.2, y: 0.62, tilt: 0.45, s: 1 },
  { a: 1.35, d: 0.2, y: 0.78, tilt: 0.55, s: 0.9 },
  { a: 2.4, d: 0.22, y: 0.6, tilt: 0.4, s: 1.05 },
  { a: 3.5, d: 0.2, y: 0.82, tilt: 0.5, s: 0.95 },
  { a: 4.45, d: 0.22, y: 0.62, tilt: 0.35, s: 1 },
  { a: 5.45, d: 0.18, y: 0.76, tilt: 0.55, s: 0.85 },
] as const;
const LEAF = { x: 0.2, y: 0.03, z: 0.15 }; // half sizes of the blade

/** ต้นไม้กระถาง: a monstera with big split leaves in a white pot. */
export const item: ItemModel = {
  id: 'potted-plant',
  name: 'ต้นไม้กระถาง',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.2, 0.2, 0.03, [0, 0.015, 0], 'stone', { segments: 12 }), // saucer
      kit.cylinder(0.24, 0.17, POT_H - 0.03, [0, 0.03 + (POT_H - 0.03) / 2, 0], 'white', { segments: 12 }),
      kit.cylinder(0.26, 0.26, 0.04, [0, POT_H - 0.02, 0], 'white', { segments: 12 }), // rim
      kit.cylinder(0.22, 0.22, 0.01, [0, POT_H + 0.001, 0], 'bark', { segments: 12 }), // soil
    ];
    LEAVES.forEach((l, i) => {
      const dir: [number, number] = [Math.cos(l.a), Math.sin(l.a)];
      const yaw = -l.a;
      const c: [number, number, number] = [dir[0] * l.d, l.y, dir[1] * l.d];
      const color = i % 2 === 0 ? 'leaf' : 'leafDark';
      // stem from the soil to the leaf base
      const base: [number, number, number] = [dir[0] * 0.02, POT_H, dir[1] * 0.02];
      parts.push(rod(kit, base, [c[0] - dir[0] * 0.1 * l.s, c[1] - 0.04, c[2] - dir[1] * 0.1 * l.s], 0.018, 'leafDark', { segments: 4 }));
      const rot: [number, number, number] = [0, yaw, l.tilt];
      // local blade offsets -> world: Rz(tilt) then Ry(yaw)
      const at = (lx: number, ly: number, lz: number): [number, number, number] => {
        const x1 = lx * Math.cos(l.tilt) - ly * Math.sin(l.tilt);
        const y1 = lx * Math.sin(l.tilt) + ly * Math.cos(l.tilt);
        return [c[0] + x1 * Math.cos(yaw) + lz * Math.sin(yaw), c[1] + y1, c[2] - x1 * Math.sin(yaw) + lz * Math.cos(yaw)];
      };
      parts.push(kit.sphere(1, c, color, { detail: 0, scale: [LEAF.x * l.s, LEAF.y, LEAF.z * l.s], rotate: rot }));
      parts.push(kit.box([0.3 * l.s, 0.01, 0.014], at(0, LEAF.y * 0.75, 0), 'lime', { rotate: rot })); // midrib
      // splits: dark notches in from each edge
      for (const sz of [-1, 1]) {
        parts.push(kit.box([0.05, 0.01, 0.03], at(-0.07 * l.s, LEAF.y * 0.7, sz * 0.11 * l.s), 'bark', { rotate: rot }));
        parts.push(kit.box([0.05, 0.01, 0.03], at(0.07 * l.s, LEAF.y * 0.7, sz * 0.11 * l.s), 'bark', { rotate: rot }));
      }
    });
    return kit.finish(parts);
  },
};
