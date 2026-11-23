import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';

const GROUND_H = 0.03;
const WATER_H = 0.05; // puddle top, just above the ground

/** A white duck with an orange bill; faces +x at yaw 0. `base` is the ground (or water) level under it. */
function duck(kit: StyleKit, base: number, x: number, z: number, yaw: number): Part[] {
  const k = 0.8;
  const c = Math.cos(yaw);
  const n = Math.sin(yaw);
  const pt = (f: number, u: number, s = 0): Vec3 => [x + (f * c + s * n) * k, base + u * k, z + (-f * n + s * c) * k];
  const rotate: Vec3 = [0, yaw, 0];
  return [
    kit.sphere(1, pt(0, 0.1, 0), 'white', { scale: [0.12 * k, 0.085 * k, 0.085 * k], rotate }),
    kit.sphere(1, pt(-0.12, 0.13, 0), 'white', { detail: 0, scale: [0.07 * k, 0.035 * k, 0.04 * k], rotate: [0, yaw, 0.4] }),
    kit.sphere(1, pt(-0.01, 0.115, 0.075), 'cream', { detail: 0, scale: [0.08 * k, 0.05 * k, 0.025 * k], rotate }),
    kit.sphere(1, pt(-0.01, 0.115, -0.075), 'cream', { detail: 0, scale: [0.08 * k, 0.05 * k, 0.025 * k], rotate }),
    kit.sphere(0.058 * k, pt(0.11, 0.2, 0), 'white', { detail: 0 }),
    kit.box([0.07 * k, 0.025 * k, 0.05 * k], pt(0.18, 0.19, 0), 'orange', { rotate }),
    kit.sphere(0.012, pt(0.14, 0.22, 0.04 * k), 'charcoal', { detail: 0 }),
    kit.sphere(0.012, pt(0.14, 0.22, -0.04 * k), 'charcoal', { detail: 0 }),
  ];
}

/** เป็ด: three white ducks around a small puddle. */
export const item: ItemModel = {
  id: 'ducks',
  name: 'เป็ด',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.98, GROUND_H, 0.98], [0, GROUND_H / 2, 0], 'lime'),
      kit.cylinder(0.3, 0.3, 0.035, [0, 0.0175 + GROUND_H - 0.0125, 0], 'sand', { segments: 12 }),
      kit.cylinder(0.25, 0.25, WATER_H, [0, WATER_H / 2, 0], 'navy', { segments: 12, motion: { kind: 'water', water: 'pond' } }),
    ];
    parts.push(
      ...duck(kit, GROUND_H, 0.3, 0.2, 0.2),
      ...duck(kit, GROUND_H, -0.3, 0.3, -2.4),
      ...duck(kit, WATER_H - 0.03, -0.02, -0.05, 2.5),
    );
    parts.push(
      kit.sphere(0.1, [0.32, GROUND_H + 0.05, -0.35], 'leaf', { detail: 0, scale: [1.2, 0.8, 1] }),
      kit.sphere(0.07, [0.4, GROUND_H + 0.04, -0.28], 'leafDark', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
