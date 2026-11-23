import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';

// A small stone-edged pond (1×2, long side along z) with orange-and-white koi and a lily pad with a pink flower.
const RIM = { w: 0.96, d: 1.9, t: 0.13, h: 0.12 };
const WATER_H = 0.07;

/** A koi facing +x at `at` (the water surface), turned by `yaw`. */
function koi(kit: StyleKit, at: Vec3, yaw: number, k: number, body: 'orange' | 'white'): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const pt = (lx: number, ly: number, lz: number): Vec3 => [at[0] + (lx * c + lz * s) * k, at[1] + ly * k, at[2] + (-lx * s + lz * c) * k];
  const rotate: Vec3 = [0, yaw, 0];
  const patch = body === 'orange' ? 'white' : 'orange';
  return [
    kit.sphere(0.1 * k, pt(0, 0.015, 0), body, { detail: 0, scale: [1.7, 0.6, 0.85], rotate }),
    kit.sphere(0.06 * k, pt(-0.03, 0.045, 0.01), patch, { detail: 0, scale: [1.6, 0.5, 1], rotate }),
    kit.sphere(0.06 * k, pt(0.12, 0.02, 0), body, { detail: 0, scale: [1, 0.7, 0.9], rotate }),
    // tail fin and side fins
    kit.wedge([0.1 * k, 0.012 * k, 0.1 * k], pt(-0.22, 0.01, 0), patch, { rotate: [0, yaw + Math.PI / 2, 0], apex: 0 }),
    kit.box([0.07 * k, 0.012 * k, 0.04 * k], pt(0.02, 0.01, 0.1), patch, { rotate: [0, yaw + 0.5, 0] }),
    kit.box([0.07 * k, 0.012 * k, 0.04 * k], pt(0.02, 0.01, -0.1), patch, { rotate: [0, yaw - 0.5, 0] }),
    // big eyes
    kit.sphere(0.024 * k, pt(0.16, 0.05, 0.04), 'white', { detail: 0 }),
    kit.sphere(0.024 * k, pt(0.16, 0.05, -0.04), 'white', { detail: 0 }),
    kit.sphere(0.014 * k, pt(0.178, 0.055, 0.04), 'charcoal', { detail: 0 }),
    kit.sphere(0.014 * k, pt(0.178, 0.055, -0.04), 'charcoal', { detail: 0 }),
  ];
}

/** บ่อปลาคาร์ป: a small stone-edged pond with koi and a lily pad. */
export const item: ItemModel = {
  id: 'koi-pond',
  name: 'บ่อปลาคาร์ป',
  category: 'animal',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const iw = RIM.w - 2 * RIM.t;
    const id = RIM.d - 2 * RIM.t;
    const parts: Part[] = [
      kit.box([iw + 0.02, WATER_H, id + 0.02], [0, WATER_H / 2, 0], 'navy', { motion: { kind: 'water', water: 'pond' } }),
      kit.box([RIM.t, RIM.h, RIM.d], [(RIM.w - RIM.t) / 2, RIM.h / 2, 0], 'stone'),
      kit.box([RIM.t, RIM.h, RIM.d], [-(RIM.w - RIM.t) / 2, RIM.h / 2, 0], 'stone'),
      kit.box([iw, RIM.h, RIM.t], [0, RIM.h / 2, (RIM.d - RIM.t) / 2], 'stone'),
      kit.box([iw, RIM.h, RIM.t], [0, RIM.h / 2, -(RIM.d - RIM.t) / 2], 'stone'),
      // pale caps on the long sides
      kit.box([RIM.t + 0.02, 0.03, RIM.d * 0.9], [(RIM.w - RIM.t) / 2, RIM.h + 0.015, 0], 'white'),
      kit.box([RIM.t + 0.02, 0.03, RIM.d * 0.9], [-(RIM.w - RIM.t) / 2, RIM.h + 0.015, 0], 'white'),
      // a rock and a bush in the -z corner, lily pad and flower
      kit.sphere(0.13, [0.3, RIM.h + 0.05, -0.72], 'stoneDark', { detail: 0, scale: [1.2, 0.8, 1] }),
      kit.sphere(0.16, [-0.28, RIM.h + 0.06, -0.78], 'leaf', { detail: 0, scale: [1.2, 0.8, 1] }),
      kit.cylinder(0.14, 0.14, 0.02, [-0.08, WATER_H + 0.01, 0.52], 'leaf', { segments: 10 }),
      kit.cone(0.05, 0.05, [-0.08, WATER_H + 0.045, 0.52], 'pink', { segments: 6 }),
      kit.sphere(0.02, [-0.08, WATER_H + 0.075, 0.52], 'sunYellow', { detail: 0 }),
      kit.cylinder(0.08, 0.08, 0.02, [0.12, WATER_H + 0.01, 0.15], 'leafDark', { segments: 8 }),
    ];
    parts.push(...koi(kit, [0.05, WATER_H, -0.35], 0.4, 1, 'orange'));
    parts.push(...koi(kit, [-0.12, WATER_H, 0.0], 3.5, 0.85, 'white'));
    parts.push(...koi(kit, [0.1, WATER_H, 0.6], 5.2, 0.9, 'orange'));
    return kit.finish(parts);
  },
};
