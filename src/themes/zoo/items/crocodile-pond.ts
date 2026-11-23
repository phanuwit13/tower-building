import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';

// A reedy pond (2×2). A smiling green crocodile lies on the bank along the +x side; a second one floats in the water.
const BANK_H = 0.07;
const POND = { x0: -0.85, x1: 0.3, z: 0.8 }; // the water spans x0..x1, ±z
const WATER_H = 0.1;

/** A friendly crocodile facing +x, closed mouth and a smile. `base` is the ground under it, `k` the size. */
function crocodile(kit: StyleKit, base: Vec3, yaw: number, k: number): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const pt = (lx: number, ly: number, lz: number): Vec3 => [base[0] + (lx * c + lz * s) * k, base[1] + ly * k, base[2] + (-lx * s + lz * c) * k];
  const rotate: Vec3 = [0, yaw, 0];
  const parts: Part[] = [
    kit.sphere(0.2 * k, pt(0, 0.13, 0), 'leaf', { scale: [1.5, 0.6, 0.85], rotate }),
    kit.sphere(0.15 * k, pt(0.06, 0.09, 0), 'lime', { detail: 0, scale: [1.5, 0.5, 0.8], rotate }),
    // tail: three shrinking balls curving a little
    kit.sphere(0.12 * k, pt(-0.34, 0.1, 0.02), 'leaf', { detail: 0, scale: [1.5, 0.6, 0.8], rotate }),
    kit.sphere(0.085 * k, pt(-0.5, 0.08, 0.07), 'leaf', { detail: 0, scale: [1.6, 0.6, 0.8], rotate }),
    kit.sphere(0.05 * k, pt(-0.62, 0.07, 0.1), 'leaf', { detail: 0, scale: [1.6, 0.6, 0.8], rotate }),
    // head: a round skull and a short closed snout
    kit.sphere(0.13 * k, pt(0.34, 0.15, 0), 'leaf', { scale: [1.1, 0.9, 1.05], rotate }),
    kit.box([0.22 * k, 0.1 * k, 0.17 * k], pt(0.5, 0.115, 0), 'leaf', { rotate }),
    kit.box([0.2 * k, 0.03 * k, 0.15 * k], pt(0.5, 0.065, 0), 'lime', { rotate }),
    kit.sphere(0.04 * k, pt(0.62, 0.135, 0), 'leaf', { detail: 0, scale: [0.8, 0.7, 1.4], rotate }),
    // smile: a thin dark line along both sides of the snout, curling up at the end
    kit.box([0.26 * k, 0.012 * k, 0.012 * k], pt(0.5, 0.09, 0.088), 'charcoal', { rotate }),
    kit.box([0.26 * k, 0.012 * k, 0.012 * k], pt(0.5, 0.09, -0.088), 'charcoal', { rotate }),
    kit.box([0.04 * k, 0.012 * k, 0.012 * k], pt(0.62, 0.105, 0.088), 'charcoal', { rotate: [0, yaw, 0.7] }),
    kit.box([0.04 * k, 0.012 * k, 0.012 * k], pt(0.62, 0.105, -0.088), 'charcoal', { rotate: [0, yaw, 0.7] }),
    kit.sphere(0.012 * k, pt(0.65, 0.16, 0.025), 'charcoal', { detail: 0 }),
    kit.sphere(0.012 * k, pt(0.65, 0.16, -0.025), 'charcoal', { detail: 0 }),
    // big round eyes on top of the skull
    kit.sphere(0.055 * k, pt(0.36, 0.265, 0.075), 'white', { detail: 0 }),
    kit.sphere(0.055 * k, pt(0.36, 0.265, -0.075), 'white', { detail: 0 }),
    kit.sphere(0.03 * k, pt(0.405, 0.27, 0.08), 'charcoal', { detail: 0 }),
    kit.sphere(0.03 * k, pt(0.405, 0.27, -0.08), 'charcoal', { detail: 0 }),
    // little legs
    kit.sphere(0.06 * k, pt(0.15, 0.04, 0.2), 'leafDark', { detail: 0, scale: [1.2, 0.8, 1], rotate }),
    kit.sphere(0.06 * k, pt(0.15, 0.04, -0.2), 'leafDark', { detail: 0, scale: [1.2, 0.8, 1], rotate }),
    kit.sphere(0.06 * k, pt(-0.2, 0.04, 0.19), 'leafDark', { detail: 0, scale: [1.2, 0.8, 1], rotate }),
    kit.sphere(0.06 * k, pt(-0.2, 0.04, -0.19), 'leafDark', { detail: 0, scale: [1.2, 0.8, 1], rotate }),
  ];
  // soft bumps down the back
  for (const lx of [-0.45, -0.3, -0.15, 0, 0.15]) {
    parts.push(kit.cone(0.04 * k, 0.07 * k, pt(lx, 0.25 - Math.abs(lx) * 0.18, 0), 'leafDark', { segments: 6 }));
  }
  return parts;
}

/** บ่อจระเข้: a reedy pond with a smiling green crocodile on the bank and one floating. */
export const item: ItemModel = {
  id: 'crocodile-pond',
  name: 'บ่อจระเข้',
  category: 'animal',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const wx = (POND.x0 + POND.x1) / 2;
    const ww = POND.x1 - POND.x0;
    const parts: Part[] = [
      // bank: lawn all over, a muddy rim round the water
      kit.box([1.98, BANK_H, 1.98], [0, BANK_H / 2, 0], 'lime'),
      kit.box([ww + 0.2, BANK_H + 0.02, POND.z * 2 + 0.2], [wx, (BANK_H + 0.02) / 2, 0], 'sand'),
      kit.box([ww, WATER_H, POND.z * 2], [wx, WATER_H / 2, 0], 'navy', { motion: { kind: 'water', water: 'pond' } }),
    ];
    parts.push(...crocodile(kit, [0.68, BANK_H, 0.05], -Math.PI / 2, 0.95));
    // the floating one: only the back, the head and the eyes show above the water
    parts.push(...crocodile(kit, [-0.38, WATER_H - 0.075, -0.1], 0.5, 0.75));
    // reeds with brown tips, round the pond edges
    const reeds: Array<[number, number, number]> = [
      [-0.9, 0.78, 0.5], [-0.78, 0.9, 0.42], [-0.9, -0.8, 0.46], [0.3, -0.9, 0.5], [0.18, -0.82, 0.4], [0.32, 0.9, 0.44], [-0.2, 0.92, 0.36],
    ];
    for (const [x, z, h] of reeds) {
      parts.push(
        kit.cylinder(0.014, 0.022, h, [x, BANK_H + h / 2, z], 'leaf', { segments: 4 }),
        kit.cylinder(0.026, 0.026, 0.1, [x, BANK_H + h + 0.02, z], 'bark', { segments: 6 }),
      );
    }
    // lily pad, rocks and a bush
    parts.push(
      kit.cylinder(0.12, 0.12, 0.02, [-0.15, WATER_H + 0.01, 0.55], 'leaf', { segments: 10 }),
      kit.sphere(0.04, [-0.15, WATER_H + 0.04, 0.55], 'pink', { detail: 0 }),
      kit.sphere(0.14, [0.76, BANK_H + 0.08, -0.7], 'stoneDark', { detail: 0, scale: [1.2, 0.7, 1] }),
      kit.sphere(0.2, [0.75, BANK_H + 0.12, 0.8], 'leaf', { detail: 0, scale: [1.2, 0.8, 1] }),
      kit.sphere(0.13, [0.62, BANK_H + 0.08, 0.86], 'leafDark', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
