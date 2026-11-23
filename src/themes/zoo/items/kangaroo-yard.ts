import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import { aim } from '../../../models/parts';

// A red-sand yard (2 x 2) with a big kangaroo (a joey peeking from the pouch), a smaller one, and a
// shady rock with a bush. Everything faces +x.
const BASE_H = 0.04;

/** One kangaroo standing on y = oy at (ox, oz), `s` times the big one; `joey` adds the baby in the pouch. */
function kangaroo(kit: StyleKit, parts: Part[], ox: number, oy: number, oz: number, s: number, joey: boolean): void {
  const p = (x: number, y: number, z: number): Vec3 => [ox + x * s, oy + y * s, oz + z * s];
  // tail: a thick tapering cone resting on the ground behind
  const tailDir: Vec3 = [-1, -0.18, 0];
  parts.push(kit.cylinder(0.035 * s, 0.13 * s, 0.6 * s, p(-0.37, 0.15, 0), 'wood', { segments: 8, rotate: aim(tailDir) }));
  // body leaning slightly forward, belly and pouch in front
  parts.push(
    kit.sphere(0.23 * s, p(0.02, 0.58, 0), 'wood', { scale: [0.95, 1.5, 0.9], rotate: [0, 0, -0.22] }),
    kit.sphere(0.15 * s, p(0.17, 0.5, 0), 'sand', { scale: [0.6, 1, 1] }),
  );
  // big hind legs and long feet
  for (const side of [-1, 1]) {
    parts.push(
      kit.sphere(0.16 * s, p(-0.03, 0.3, side * 0.15), 'wood', { scale: [1.05, 1.2, 0.7] }),
      kit.box([0.34 * s, 0.06 * s, 0.1 * s], p(0.1, 0.03, side * 0.15), 'woodDark'),
    );
    // short arms
    parts.push(kit.cylinder(0.035 * s, 0.03 * s, 0.22 * s, p(0.2, 0.69, side * 0.14), 'woodDark', { segments: 6, rotate: aim([0.5, -1, 0]) }));
  }
  // head, snout, nose, ears, eyes
  parts.push(
    kit.sphere(0.13 * s, p(0.2, 1.02, 0), 'wood', { scale: [1.1, 1, 0.95] }),
    kit.sphere(0.08 * s, p(0.33, 0.98, 0), 'sand', { scale: [1, 0.85, 1] }),
    kit.sphere(0.035 * s, p(0.405, 0.99, 0), 'charcoal', { detail: 0 }),
  );
  for (const side of [-1, 1]) {
    parts.push(
      kit.cone(0.05 * s, 0.22 * s, p(0.13, 1.22, side * 0.07), 'wood', { segments: 6, rotate: [side * 0.18, 0, 0.1] }),
      kit.cone(0.025 * s, 0.14 * s, p(0.14, 1.21, side * 0.075), 'pink', { segments: 6, rotate: [side * 0.18, 0, 0.1] }),
      kit.sphere(0.04 * s, p(0.3, 1.05, side * 0.075), 'white', { detail: 0 }),
      kit.sphere(0.024 * s, p(0.335, 1.05, side * 0.078), 'charcoal', { detail: 0 }),
    );
  }
  if (joey) {
    parts.push(
      kit.sphere(0.09 * s, p(0.25, 0.6, 0), 'woodDark', { scale: [0.7, 0.6, 1.2] }), // pouch edge
      kit.sphere(0.075 * s, p(0.26, 0.69, 0), 'wood', { detail: 1 }), // joey's head
      kit.sphere(0.03 * s, p(0.32, 0.67, 0), 'sand', { detail: 0 }),
      kit.sphere(0.014 * s, p(0.345, 0.675, 0), 'charcoal', { detail: 0 }),
      kit.sphere(0.022 * s, p(0.3, 0.72, 0.04), 'white', { detail: 0 }),
      kit.sphere(0.022 * s, p(0.3, 0.72, -0.04), 'white', { detail: 0 }),
      kit.sphere(0.012 * s, p(0.318, 0.72, 0.04), 'charcoal', { detail: 0 }),
      kit.sphere(0.012 * s, p(0.318, 0.72, -0.04), 'charcoal', { detail: 0 }),
      kit.cone(0.025 * s, 0.1 * s, p(0.23, 0.79, 0.05), 'wood', { segments: 6 }),
      kit.cone(0.025 * s, 0.1 * s, p(0.23, 0.79, -0.05), 'wood', { segments: 6 }),
    );
  }
}

/** ลานจิงโจ้: a red-sand yard with a mother kangaroo and joey, a smaller kangaroo and a shady rock. */
export const item: ItemModel = {
  id: 'kangaroo-yard',
  name: 'ลานจิงโจ้',
  category: 'animal',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([2, BASE_H, 2], [0, BASE_H / 2, 0], 'terracotta'),
      // paler sand patches and dry tufts
      kit.cylinder(0.35, 0.35, 0.012, [0.4, BASE_H + 0.006, 0.6], 'sand', { segments: 10, scale: [1.3, 1, 0.9] }),
      kit.cylinder(0.3, 0.3, 0.012, [-0.35, BASE_H + 0.006, -0.1], 'sand', { segments: 10, scale: [1.2, 1, 1] }),
    ];
    kangaroo(kit, parts, 0.15, BASE_H, -0.45, 1, true);
    kangaroo(kit, parts, 0.45, BASE_H, 0.55, 0.62, false);
    // shady rock: a stack of boulders with a flat top, a bush at its foot
    const rock = (r: number, x: number, y: number, z: number, color: 'stone' | 'stoneDark', sq: number) =>
      parts.push(kit.sphere(r, [x, y + r * sq, z], color, { detail: 1, scale: [1.15, sq, 1] }));
    rock(0.38, -0.55, BASE_H, 0.55, 'stone', 0.8);
    rock(0.3, -0.6, BASE_H, -0.1, 'stoneDark', 0.8);
    rock(0.26, -0.3, BASE_H, 0.25, 'stoneDark', 0.7);
    parts.push(kit.sphere(0.27, [-0.57, BASE_H + 0.5, 0.45], 'stone', { scale: [1.1, 0.8, 1.1] }));
    for (const [x, z, h] of [[-0.82, -0.55, 0.28], [-0.72, -0.62, 0.22], [-0.9, -0.68, 0.2]] as const) {
      parts.push(kit.cone(0.06, h, [x, BASE_H + h / 2, z], 'lime', { segments: 5 }));
    }
    parts.push(kit.sphere(0.17, [-0.2, BASE_H + 0.1, 0.75], 'leaf', { scale: [1.2, 0.7, 1] }), kit.sphere(0.12, [-0.05, BASE_H + 0.07, 0.8], 'lime', { scale: [1.2, 0.7, 1] }));
    return kit.finish(parts);
  },
};
