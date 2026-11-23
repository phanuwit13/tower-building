import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';

const PAD_H = 0.03; // the paved spot
const S = 1.25;

/** A cartoon pigeon at (cx, cz) on the paving, facing yaw (0 = +x, turning towards -z); `peck` dips the head to the ground. */
function pigeon(kit: StyleKit, cx: number, cz: number, yaw: number, peck: boolean): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const y0 = PAD_H + 0.04 * S;
  const p = (x: number, y: number, z: number): [number, number, number] => [cx + (x * c + z * s) * S, y0 + y * S, cz + (-x * s + z * c) * S];
  const turn: [number, number, number] = [0, yaw, 0];
  const head = peck ? p(0.09, 0.0, 0) : p(0.065, 0.075, 0);
  const beak = peck ? p(0.14, -0.015, 0) : p(0.115, 0.07, 0);
  return [
    kit.sphere(1, p(0, 0.03, 0), 'chrome', { scale: [0.085 * S, 0.06 * S, 0.06 * S], rotate: turn }),
    kit.sphere(1, p(-0.01, 0.045, 0), 'stoneDark', { detail: 0, scale: [0.065 * S, 0.035 * S, 0.062 * S], rotate: turn }), // wings
    kit.sphere(1, p(-0.095, 0.03, 0), 'charcoal', { detail: 0, scale: [0.045 * S, 0.02 * S, 0.035 * S], rotate: turn }), // tail
    kit.sphere(0.04 * S, head, 'chrome', { detail: 0 }),
    kit.sphere(0.025 * S, p(0.05, 0.04, 0), 'purple', { detail: 0 }), // shiny neck
    kit.sphere(0.012 * S, beak, 'orange', { detail: 0 }),
    kit.sphere(0.01 * S, [head[0] + 0.02 * c * S + 0.025 * s * S, head[1] + 0.012, head[2] - 0.02 * s * S + 0.025 * c * S], 'charcoal', { detail: 0 }),
    kit.sphere(0.01 * S, [head[0] + 0.02 * c * S - 0.025 * s * S, head[1] + 0.012, head[2] - 0.02 * s * S - 0.025 * c * S], 'charcoal', { detail: 0 }),
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
      ...pigeon(kit, 0.2, 0.15, 0.4, true),
      ...pigeon(kit, -0.12, 0.25, -2.4, false),
      ...pigeon(kit, -0.2, -0.15, 3.3, true),
      ...pigeon(kit, 0.18, -0.22, -0.6, false),
    );
    // crumbs
    for (const [x, z] of [[0.04, 0.02], [0.1, 0.08], [-0.05, -0.04], [0.02, -0.12]] as const) {
      parts.push(kit.box([0.025, 0.012, 0.025], [x, PAD_H + 0.006, z], 'sand'));
    }
    return kit.finish(parts);
  },
};
