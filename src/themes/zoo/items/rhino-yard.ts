import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';

// A dusty yard with a mud wallow (and a little water in it), a rhino and a baby rhino.
const YARD = { w: 1.96, d: 2.96, h: 0.03 };
const MUD = { r: 0.5, h: 0.05, x: 0.35, z: -0.85 };

/** A chunky grey rhino at (x, z) facing `yaw` (0 = +x), scaled by `s`. */
function rhino(kit: StyleKit, x: number, z: number, yaw: number, s: number): Part[] {
  const c = Math.cos(yaw);
  const sn = Math.sin(yaw);
  const at = (lx: number, ly: number, lz = 0): Vec3 => [x + (lx * c + lz * sn) * s, ly * s + YARD.h, z + (-lx * sn + lz * c) * s];
  const turn: Vec3 = [0, yaw, 0];
  const lean = (tz: number): Vec3 => [0, yaw, tz];
  const parts: Part[] = [
    kit.sphere(0.3 * s, at(0, 0.42), 'stone', { scale: [1.35, 0.95, 0.95], rotate: turn }),
    kit.sphere(0.2 * s, at(0.46, 0.38), 'stone', { scale: [1.25, 0.9, 0.85], rotate: turn }),
    kit.sphere(0.12 * s, at(0.62, 0.32), 'stoneDark', { detail: 0, scale: [1.1, 0.8, 1.2], rotate: turn }),
    kit.cone(0.065 * s, 0.22 * s, at(0.68, 0.5), 'cream', { segments: 8, rotate: lean(-0.45) }),
    kit.cone(0.04 * s, 0.12 * s, at(0.5, 0.52), 'cream', { segments: 8, rotate: lean(-0.3) }),
    kit.sphere(0.05 * s, at(0.5, 0.35, 0.0), 'stone', { detail: 0, scale: [0.6, 0.5, 0.6], rotate: turn }),
    kit.sphere(0.2 * s, at(-0.38, 0.4), 'stoneDark', { detail: 0, scale: [0.7, 0.9, 0.9], rotate: turn }), // rump shading
    kit.cylinder(0.015 * s, 0.025 * s, 0.2 * s, at(-0.62, 0.32), 'stoneDark', { segments: 4, rotate: lean(0.5) }),
  ];
  for (const lz of [-1, 1]) {
    parts.push(
      kit.cone(0.06 * s, 0.1 * s, at(0.36, 0.6, lz * 0.14), 'stoneDark', { segments: 6 }), // ears
      kit.sphere(0.045 * s, at(0.58, 0.45, lz * 0.13), 'white', { detail: 0 }), // big eyes
      kit.sphere(0.024 * s, at(0.62, 0.45, lz * 0.14), 'charcoal', { detail: 0 }),
    );
    for (const lx of [-0.24, 0.26]) parts.push(kit.cylinder(0.075 * s, 0.085 * s, 0.24 * s, at(lx, 0.12, lz * 0.16), 'stoneDark', { segments: 8 }));
  }
  return parts;
}

/** ลานแรด: dusty yard, mud wallow, a rhino and a baby rhino. */
export const item: ItemModel = {
  id: 'rhino-yard',
  name: 'ลานแรด',
  category: 'animal',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([YARD.w, YARD.h, YARD.d], [0, YARD.h / 2, 0], 'sand'),
      kit.cylinder(MUD.r, MUD.r, MUD.h, [MUD.x, MUD.h / 2, MUD.z], 'bark', { segments: 16, scale: [1.3, 1, 1] }),
      kit.cylinder(0.26, 0.26, 0.012, [MUD.x + 0.05, MUD.h + 0.006, MUD.z], 'navy', { segments: 12, scale: [1.3, 1, 1], motion: { kind: 'water', water: 'pond' } }),
      ...rhino(kit, -0.15, 0.55, 0.25, 1),
      ...rhino(kit, 0.45, 1.15, -0.5, 0.55),
    ];
    // low log fence along the back, two rocks and grass tufts
    parts.push(kit.box([0.12, 0.12, YARD.d], [-YARD.w / 2 + 0.06, YARD.h + 0.06, 0], 'wood'));
    parts.push(kit.box([YARD.w, 0.12, 0.12], [0, YARD.h + 0.06, -YARD.d / 2 + 0.06], 'wood'));
    parts.push(
      kit.sphere(0.2, [-0.6, 0.16, -1.1], 'stoneDark', { detail: 0, scale: [1.2, 0.8, 1] }),
      kit.sphere(0.13, [-0.3, 0.1, -1.25], 'stone', { detail: 0, scale: [1.2, 0.8, 1] }),
      kit.sphere(0.11, [0.75, 0.1, 0.2], 'leaf', { detail: 0, scale: [1.2, 0.8, 1.2] }),
      kit.sphere(0.09, [0.85, 0.08, 0.35], 'lime', { detail: 0, scale: [1.2, 0.8, 1.2] }),
    );
    return kit.finish(parts);
  },
};
