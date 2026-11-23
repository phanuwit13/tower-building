import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';

const PAD_H = 0.03; // the paved spot
const S = 1.0;

/** A cartoon pigeon at (cx, cz) on the paving, facing yaw (0 = +x, turning towards -z), pecking: head down, tail up. */
function pigeon(kit: StyleKit, cx: number, cz: number, yaw: number, dip: number): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const y0 = PAD_H + 0.05 * S;
  const p = (x: number, y: number, z: number): [number, number, number] => [cx + (x * c + z * s) * S, y0 + y * S, cz + (-x * s + z * c) * S];
  const lean = -0.3 - dip * 0.2; // front down
  const head = p(0.085, 0.0 - dip * 0.02, 0);
  return [
    kit.sphere(1, p(0, 0.03, 0), 'stone', { scale: [0.085 * S, 0.06 * S, 0.062 * S], rotate: [0, yaw, lean] }),
    kit.sphere(1, p(-0.01, 0.05, 0), 'chrome', { detail: 0, scale: [0.065 * S, 0.03 * S, 0.066 * S], rotate: [0, yaw, lean] }), // wings
    kit.sphere(1, p(-0.1, 0.075, 0), 'stoneDark', { detail: 0, scale: [0.05 * S, 0.018 * S, 0.035 * S], rotate: [0, yaw, -0.6] }), // tail up
    kit.sphere(0.042 * S, head, 'stone', { detail: 0 }),
    kit.box([0.05 * S, 0.012 * S, 0.014 * S], p(0.085, 0.04 - dip * 0.02, 0), 'white', { rotate: [0, yaw, 0] }), // white head stripe
    kit.cone(0.014 * S, 0.05 * S, p(0.14, -0.015 - dip * 0.02, 0), 'orange', { segments: 6, rotate: [0, yaw, -Math.PI / 2 - 0.5] }),
    kit.sphere(0.011 * S, p(0.105, 0.015 - dip * 0.02, 0.034), 'charcoal', { detail: 0 }),
    kit.sphere(0.011 * S, p(0.105, 0.015 - dip * 0.02, -0.034), 'charcoal', { detail: 0 }),
    kit.box([0.04 * S, 0.012, 0.016 * S], p(0.01, -0.043, 0.025), 'pink', { rotate: [0, yaw, 0] }), // feet
    kit.box([0.04 * S, 0.012, 0.016 * S], p(0.01, -0.043, -0.025), 'pink', { rotate: [0, yaw, 0] }),
  ];
}

/** ฝูงนกพิราบ: grey pigeons pecking round a little paved spot. */
export const item: ItemModel = {
  id: 'pigeons',
  name: 'ฝูงนกพิราบ',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.44, 0.46, PAD_H, [0, PAD_H / 2, 0], 'sand', { segments: 12 }),
      kit.cylinder(0.18, 0.18, 0.005, [0, PAD_H + 0.0025, 0], 'stone', { segments: 10 }),
    ];
    parts.push(
      ...pigeon(kit, 0.2, 0.12, 0.4, 1),
      ...pigeon(kit, -0.1, 0.27, -2.4, 0.5),
      ...pigeon(kit, -0.22, -0.12, 3.3, 1),
      ...pigeon(kit, 0.16, -0.24, -0.6, 0.6),
    );
    // breadcrumbs
    for (const [x, z] of [[0.04, 0.02], [0.12, 0.05], [-0.05, -0.04], [0.02, -0.12], [-0.02, 0.14], [0.08, -0.08]] as const) {
      parts.push(kit.box([0.025, 0.012, 0.025], [x, PAD_H + 0.006, z], 'white', { rotate: [0, x * 20, 0] }));
    }
    return kit.finish(parts);
  },
};
