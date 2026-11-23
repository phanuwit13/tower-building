import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

// A bamboo grove (2 x 2): a panda sits and eats bamboo on the grass, another sits on a wooden
// platform. The bamboo stalks and leaf tufts all sway about the soil line (ONE shared pivot);
// the pandas, platform and the stalk being eaten stay still. Pandas face +x.
const BASE_H = 0.04;
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, BASE_H, 0], amount: 0.045 };
const PLATFORM = { x: -0.2, z: 0.5, w: 0.74, h: 0.3 };

/** A sitting panda, `s` times life size, bottom at y = oy, facing +x. */
function panda(kit: StyleKit, parts: Part[], ox: number, oy: number, oz: number, s: number): void {
  const p = (x: number, y: number, z: number): Vec3 => [ox + x * s, oy + y * s, oz + z * s];
  parts.push(
    kit.sphere(0.3 * s, p(0, 0.3, 0), 'white', { scale: [1, 1, 1] }),
    kit.sphere(0.265 * s, p(0.02, 0.31, 0), 'charcoal', { scale: [1.0, 0.45, 1.06] }), // black band across the shoulders
  );
  for (const side of [-1, 1]) {
    parts.push(
      // legs stretched forward
      kit.sphere(0.12 * s, p(0.27, 0.1, side * 0.19), 'charcoal', { detail: 0, scale: [1.5, 0.8, 0.9] }),
      // arms bent up to hold the stalk
      kit.sphere(0.09 * s, p(0.27, 0.36, side * 0.22), 'charcoal', { detail: 0, scale: [1.25, 1, 0.8] }),
    );
  }
  const hy = 0.78;
  parts.push(kit.sphere(0.23 * s, p(0.05, hy, 0), 'white', { scale: [1, 0.92, 1.08] }), kit.sphere(0.05 * s, p(0.27, hy - 0.04, 0), 'charcoal', { detail: 0 }));
  for (const side of [-1, 1]) {
    parts.push(
      kit.sphere(0.085 * s, p(0.02, hy + 0.2, side * 0.17), 'charcoal', { detail: 0 }), // ears
      kit.sphere(0.075 * s, p(0.2, hy + 0.04, side * 0.09), 'charcoal', { detail: 0, scale: [0.6, 1.2, 0.8], rotate: [side * 0.4, 0, 0] }), // eye patches
      kit.sphere(0.03 * s, p(0.245, hy + 0.045, side * 0.09), 'white', { detail: 0 }),
      kit.sphere(0.018 * s, p(0.268, hy + 0.045, side * 0.092), 'charcoal', { detail: 0 }),
    );
  }
}

/** A bamboo stalk of height h at (x, z): two sections with a lighter node ring, all swaying on the shared pivot. */
function stalk(kit: StyleKit, parts: Part[], x: number, z: number, h: number, r: number, leaf: boolean): void {
  const half = h / 2;
  parts.push(
    kit.cylinder(r * 0.95, r, h, [x, BASE_H + half, z], 'leaf', { segments: 6, motion: SWAY }),
    kit.cylinder(r * 1.25, r * 1.25, 0.035, [x, BASE_H + half, z], 'lime', { segments: 6, motion: SWAY }),
  );
  if (leaf) {
    for (const [dx, dz, c] of [[0.07, 0.04, 'leafDark'], [-0.06, -0.05, 'leaf']] as const) {
      parts.push(kit.sphere(0.1, [x + dx, BASE_H + h - 0.02, z + dz], c, { detail: 0, scale: [1, 1.6, 1], motion: SWAY }));
    }
  }
}

/** ป่าไผ่แพนด้า: a swaying bamboo grove with a panda eating and another on a wooden platform. */
export const item: ItemModel = {
  id: 'panda-bamboo',
  name: 'ป่าไผ่แพนด้า',
  category: 'animal',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([2, BASE_H, 2], [0, BASE_H / 2, 0], 'lime')];
    // bamboo along the back (-x) and sides
    const STALKS: Array<[number, number, number, boolean]> = [
      [-0.88, -0.85, 1.7, true], [-0.8, -0.6, 1.45, false], [-0.9, -0.35, 1.8, true], [-0.82, -0.1, 1.5, false],
      [-0.9, 0.2, 1.65, true], [-0.84, 0.95, 1.5, true], [-0.35, -0.9, 1.6, false],
      [-0.1, -0.88, 1.3, true], [0.2, -0.9, 1.55, true], [0.88, -0.86, 1.5, true],
      [0.9, 0.85, 1.3, true],
    ];
    for (const [x, z, h, leaf] of STALKS) stalk(kit, parts, x * 0.8, z * 0.8, h, 0.04, leaf);
    // wooden platform with steps
    const { x: px, z: pz, w, h } = PLATFORM;
    parts.push(
      kit.box([w, 0.05, w], [px, BASE_H + h - 0.025, pz], 'wood'),
      kit.box([w + 0.04, 0.02, w + 0.04], [px, BASE_H + h + 0.01, pz], 'woodDark'),
      kit.box([0.08, h, 0.08], [px - w / 2 + 0.06, BASE_H + h / 2 - 0.025, pz - w / 2 + 0.06], 'woodDark'),
      kit.box([0.08, h, 0.08], [px + w / 2 - 0.06, BASE_H + h / 2 - 0.025, pz - w / 2 + 0.06], 'woodDark'),
      kit.box([0.08, h, 0.08], [px - w / 2 + 0.06, BASE_H + h / 2 - 0.025, pz + w / 2 - 0.06], 'woodDark'),
      kit.box([0.08, h, 0.08], [px + w / 2 - 0.06, BASE_H + h / 2 - 0.025, pz + w / 2 - 0.06], 'woodDark'),
      kit.box([0.2, 0.08, 0.34], [px + w / 2 + 0.1, BASE_H + 0.04, pz], 'wood'),
    );
    panda(kit, parts, px - 0.05, BASE_H + h + 0.02, pz, 0.82);
    panda(kit, parts, 0.3, BASE_H, -0.35, 1);
    // the stalk the first panda eats (still), held in its paws
    parts.push(
      kit.cylinder(0.03, 0.03, 0.5, [0.6, BASE_H + 0.4, -0.35], 'leaf', { segments: 6, rotate: [0, 0, -0.2] }),
      kit.sphere(0.07, [0.5, BASE_H + 0.67, -0.35], 'leafDark', { detail: 0, scale: [1, 1.4, 1] }),
    );
    return kit.finish(parts);
  },
};
