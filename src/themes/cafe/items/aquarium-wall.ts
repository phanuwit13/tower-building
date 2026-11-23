import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A long fish tank on a wooden cabinet (2×3, long side along z). The water is a pool-water box whose
// top is a shimmering surface; fish lie on it, seen from above. The glass sides are lit at night.
const CAB = { w: 1.84, h: 0.5, d: 2.9 };
const TANK = { x: 0.8, z: 1.35, base: 0.54, top: 1.08 };
const WATER_Y = 1.0;
const WATER = { kind: 'water', water: 'pool' } as const;

/** A friendly cartoon fish facing +x at `at` (on the water), turned by `yaw`, scaled by `k`. */
function fish(kit: StyleKit, at: Vec3, yaw: number, k: number, body: PaletteColor, fin: PaletteColor): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const pt = (lx: number, ly: number, lz: number): Vec3 => [at[0] + (lx * c + lz * s) * k, at[1] + ly * k, at[2] + (-lx * s + lz * c) * k];
  const rotate: Vec3 = [0, yaw, 0];
  return [
    kit.sphere(0.1 * k, pt(0, 0.03, 0), body, { detail: 0, scale: [1.5, 0.7, 0.8], rotate }),
    kit.wedge([0.1 * k, 0.02 * k, 0.12 * k], pt(-0.2, 0.03, 0), fin, { rotate: [0, yaw + Math.PI / 2, 0], apex: 0 }),
    kit.box([0.08 * k, 0.02 * k, 0.04 * k], pt(0.0, 0.06, 0), fin, { rotate }),
    kit.sphere(0.028 * k, pt(0.11, 0.07, 0.05), 'white', { detail: 0 }),
    kit.sphere(0.028 * k, pt(0.11, 0.07, -0.05), 'white', { detail: 0 }),
  ];
}

/** ตู้ปลาใหญ่: a long lit fish tank on a cabinet, with colourful fish, plants and bubbles. */
export const item: ItemModel = {
  id: 'aquarium-wall',
  name: 'ตู้ปลาใหญ่',
  category: 'animal',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const lit = { glow: 'windowWarm', light: 'window' } as const;
    const parts: Part[] = [
      // cabinet, white top plate and two doors on the +x face
      kit.box([CAB.w, CAB.h, CAB.d], [0, CAB.h / 2, 0], 'woodDark'),
      kit.box([CAB.w + 0.06, 0.04, CAB.d + 0.06], [0, CAB.h + 0.02, 0], 'white'),
      kit.box([0.03, 0.38, 1.2], [CAB.w / 2 + 0.015, 0.26, 0.65], 'wood'),
      kit.box([0.03, 0.38, 1.2], [CAB.w / 2 + 0.015, 0.26, -0.65], 'wood'),
      kit.sphere(0.04, [CAB.w / 2 + 0.035, 0.3, 0.08], 'sunYellow', { detail: 0 }),
      kit.sphere(0.04, [CAB.w / 2 + 0.035, 0.3, -0.08], 'sunYellow', { detail: 0 }),
      // water
      kit.box([TANK.x * 2 - 0.04, WATER_Y - TANK.base - 0.02, TANK.z * 2 - 0.04], [0, (WATER_Y + TANK.base) / 2 + 0.01, 0], 'skyBlue', { motion: WATER }),
      // lit glass sides and a charcoal top frame
      kit.box([0.03, TANK.top - TANK.base, TANK.z * 2], [TANK.x, (TANK.top + TANK.base) / 2, 0], 'glassBlue', lit),
      kit.box([0.03, TANK.top - TANK.base, TANK.z * 2], [-TANK.x, (TANK.top + TANK.base) / 2, 0], 'glassBlue', lit),
      kit.box([TANK.x * 2, TANK.top - TANK.base, 0.03], [0, (TANK.top + TANK.base) / 2, TANK.z], 'glassBlue', lit),
      kit.box([TANK.x * 2, TANK.top - TANK.base, 0.03], [0, (TANK.top + TANK.base) / 2, -TANK.z], 'glassBlue', lit),
      kit.box([0.08, 0.04, TANK.z * 2 + 0.08], [TANK.x, TANK.top + 0.02, 0], 'charcoal'),
      kit.box([0.08, 0.04, TANK.z * 2 + 0.08], [-TANK.x, TANK.top + 0.02, 0], 'charcoal'),
      kit.box([TANK.x * 2 - 0.08, 0.04, 0.08], [0, TANK.top + 0.02, TANK.z], 'charcoal'),
      kit.box([TANK.x * 2 - 0.08, 0.04, 0.08], [0, TANK.top + 0.02, -TANK.z], 'charcoal'),
      // seaweed, coral and a rock poking out of the water
      kit.cone(0.06, 0.4, [-0.6, WATER_Y + 0.12, -1.1], 'leaf', { segments: 6 }),
      kit.cone(0.05, 0.3, [-0.5, WATER_Y + 0.08, -1.0], 'leafDark', { segments: 6 }),
      kit.cone(0.06, 0.34, [-0.65, WATER_Y + 0.1, -0.95], 'lime', { segments: 6 }),
      kit.sphere(0.14, [0.5, WATER_Y + 0.02, 1.0], 'pink', { detail: 0, scale: [1, 0.8, 1] }),
      kit.cone(0.07, 0.24, [0.6, WATER_Y + 0.08, 0.85], 'orange', { segments: 6 }),
      kit.sphere(0.16, [-0.3, WATER_Y + 0.01, 0.9], 'stoneDark', { detail: 0, scale: [1.3, 0.7, 1] }),
      kit.cone(0.05, 0.3, [-0.62, WATER_Y + 0.1, 1.0], 'leaf', { segments: 6 }),
      kit.cone(0.05, 0.22, [-0.52, WATER_Y + 0.06, 1.08], 'lime', { segments: 6 }),
      // a column of bubbles
      kit.sphere(0.035, [0.65, WATER_Y + 0.08, -0.6], 'glassBlue', { detail: 0 }),
      kit.sphere(0.045, [0.67, WATER_Y + 0.2, -0.62], 'glassBlue', { detail: 0 }),
      kit.sphere(0.03, [0.64, WATER_Y + 0.32, -0.58], 'glassBlue', { detail: 0 }),
    ];
    parts.push(...fish(kit, [0.3, WATER_Y, -0.1], 0.3, 1.3, 'orange', 'sunYellow'));
    parts.push(...fish(kit, [-0.2, WATER_Y, 0.4], 3.6, 1.1, 'pink', 'purple'));
    parts.push(...fish(kit, [0.1, WATER_Y, -0.9], 5.6, 1.0, 'sunYellow', 'orange'));
    parts.push(...fish(kit, [-0.45, WATER_Y, -0.3], 2.7, 1.0, 'purple', 'pink'));
    parts.push(...fish(kit, [0.4, WATER_Y, 0.4], 1.0, 0.9, 'red', 'white'));
    parts.push(...fish(kit, [-0.1, WATER_Y, 1.1], 4.4, 0.8, 'mint', 'teal'));
    return kit.finish(parts);
  },
};
