import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { aim } from '../../../models/parts';

const TRUNK_TOP = 0.85;
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, TRUNK_TOP, 0], amount: 0.06 };
const S = 0.62; // squirrel size

/** A squirrel sitting up on `perch` at (cx, cy, cz), facing yaw (0 = +x, turning towards -z). Never moves. */
function squirrel(kit: StyleKit, cx: number, cy: number, cz: number, yaw: number): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const p = (x: number, y: number, z: number): [number, number, number] => [cx + (x * c + z * s) * S, cy + y * S, cz + (-x * s + z * c) * S];
  const turn: [number, number, number] = [0, yaw, 0];
  return [
    kit.sphere(1, p(0, 0.075, 0), 'terracotta', { scale: [0.06 * S, 0.085 * S, 0.055 * S], rotate: turn }),
    kit.sphere(1, p(0.035, 0.065, 0), 'cream', { detail: 0, scale: [0.035 * S, 0.06 * S, 0.035 * S], rotate: turn }),
    kit.sphere(0.055 * S, p(0.02, 0.19, 0), 'terracotta'),
    kit.sphere(0.02 * S, p(0.0, 0.25, 0.04), 'terracotta', { detail: 0 }),
    kit.sphere(0.02 * S, p(0.0, 0.25, -0.04), 'terracotta', { detail: 0 }),
    kit.sphere(0.012 * S, p(0.07, 0.2, 0.03), 'charcoal', { detail: 0 }),
    kit.sphere(0.012 * S, p(0.07, 0.2, -0.03), 'charcoal', { detail: 0 }),
    kit.sphere(0.014 * S, p(0.075, 0.175, 0), 'charcoal', { detail: 0 }),
    kit.sphere(1, p(-0.09, 0.16, 0), 'orange', { scale: [0.06 * S, 0.15 * S, 0.075 * S], rotate: turn }),
    kit.sphere(0.04 * S, p(0.06, 0.1, 0), 'woodDark', { detail: 0 }), // the nut in its paws
  ];
}

/** ต้นไม้กับกระรอก: a tree with two squirrels on the trunk and a nut. */
export const item: ItemModel = {
  id: 'squirrel-tree',
  name: 'ต้นไม้กับกระรอก',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.09, 0.13, TRUNK_TOP, [0, TRUNK_TOP / 2, 0], 'wood', { segments: 8 }),
      kit.cylinder(0.035, 0.04, 0.2, [0.08, 0.42, 0.08], 'wood', { segments: 6, rotate: aim([1, 0, 1]) }), // the stub one squirrel sits on
      kit.sphere(0.27, [-0.12, 1.0, -0.1], 'leafDark', { motion: SWAY }),
      kit.sphere(0.34, [0.03, 1.15, 0.03], 'leaf', { motion: SWAY }),
      kit.sphere(0.26, [0.1, 1.45, 0.08], 'leaf', { motion: SWAY }),
      kit.sphere(0.2, [-0.12, 1.4, -0.1], 'lime', { detail: 0, motion: SWAY }),
    ];
    parts.push(...squirrel(kit, 0.17, 0.42 + 0.03, 0.17, -Math.PI / 4)); // on the trunk, facing the camera
    parts.push(...squirrel(kit, 0.3, 0.012, 0.18, -0.2)); // on the ground by the roots
    // a nut on the ground (acorn: a little cap on the nut)
    parts.push(
      kit.sphere(0.045, [0.28, 0.05, 0.34], 'woodDark', { detail: 0, scale: [1, 1.1, 1] }),
      kit.sphere(0.04, [0.28, 0.095, 0.34], 'bark', { detail: 0, scale: [1.05, 0.6, 1.05] }),
    );
    return kit.finish(parts);
  },
};
