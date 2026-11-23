import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { ICO_LOW } from '../../../models/parts';

// A muddy-banked pool (2 x 3, long side along z): a sand yard, a ring of brown mud, a navy pool.
// One hippo stands on the bank at the -z end; the other is mostly under the water, with only its
// eyes, ears and nostrils (and the top of its head) showing. Both face +x.
const BASE_H = 0.04;
const MUD_H = 0.055;
const WATER_H = 0.075;
const POOL = { x: 0.0, z: 0.2, rx: 0.72, rz: 0.78 };
const MUD = { rx: 0.94, rz: 1.18 };
const WATER: MotionOpts = { kind: 'water', water: 'pond' };

/** The head parts shared by both hippos, centred on `c` (the middle of the head), scale `s`. */
function hippoHead(kit: StyleKit, parts: Part[], c: Vec3, s: number): void {
  const p = (x: number, y: number, z: number): Vec3 => [c[0] + x * s, c[1] + y * s, c[2] + z * s];
  parts.push(
    kit.sphere(0.3 * s, p(0, 0, 0), 'purple', { scale: [1.05, 0.85, 1.1] }),
    kit.sphere(0.25 * s, p(0.27, -0.06, 0), 'purple', { scale: [1, 0.7, 1.2] }), // wide muzzle
    kit.sphere(0.03 * s, p(0.5, 0.01, 0.12), 'bark', { detail: 0 }), // nostrils
    kit.sphere(0.03 * s, p(0.5, 0.01, -0.12), 'bark', { detail: 0 }),
  );
  for (const side of [-1, 1]) {
    parts.push(
      kit.sphere(0.07 * s, p(0.02, 0.27, side * 0.2), 'purple', { detail: 0, scale: [0.9, 1.1, 0.8] }), // ears
      kit.sphere(0.035 * s, p(0.03, 0.27, side * 0.215), 'pink', { detail: 0, scale: [0.9, 1.1, 0.5] }),
      kit.sphere(0.085 * s, p(0.2, 0.2, side * 0.15), 'purple', { detail: 0 }), // eye bumps
      kit.sphere(0.058 * s, p(0.25, 0.24, side * 0.155), 'white', { detail: 0 }),
      kit.sphere(0.035 * s, p(0.295, 0.245, side * 0.16), 'charcoal', { detail: 0 }),
    );
  }
}

/** The hippo in the water: only the top of its head (a squashed dome), eyes, ears and nostrils rise above the surface. */
function submergedHead(kit: StyleKit, parts: Part[], x: number, z: number): void {
  const base = WATER_H - 0.01; // the dome's flat base sits just inside the water
  parts.push(
    kit.dome(0.3, [x, base, z], 'purple', { segments: 12, scale: [1.05, 0.5, 1.1] }),
    kit.dome(0.25, [x + 0.27, base, z], 'purple', { segments: 12, scale: [1, 0.3, 1.2] }), // the muzzle, just breaking the surface
    kit.sphere(0.03, [x + 0.5, WATER_H + 0.04, z + 0.12], 'bark', { detail: 0 }),
    kit.sphere(0.03, [x + 0.5, WATER_H + 0.04, z - 0.12], 'bark', { detail: 0 }),
  );
  for (const side of [-1, 1]) {
    parts.push(
      kit.sphere(0.07, [x + 0.02, base + 0.17, z + side * 0.2], 'purple', { detail: 0, scale: [0.9, 1.1, 0.8] }),
      kit.sphere(0.035, [x + 0.03, base + 0.17, z + side * 0.215], 'pink', { detail: 0, scale: [0.9, 1.1, 0.5] }),
      kit.sphere(0.085, [x + 0.2, base + 0.12, z + side * 0.15], 'purple', { detail: 0 }),
      kit.sphere(0.058, [x + 0.25, base + 0.155, z + side * 0.155], 'white', { detail: 0 }),
      kit.sphere(0.035, [x + 0.295, base + 0.16, z + side * 0.16], 'charcoal', { detail: 0 }),
    );
  }
}

/** บ่อฮิปโป: a muddy-banked pool with one hippo on the bank and one almost under the water. */
export const item: ItemModel = {
  id: 'hippo-pool',
  name: 'บ่อฮิปโป',
  category: 'animal',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([2, BASE_H, 3], [0, BASE_H / 2, 0], 'sand'),
      kit.cylinder(1, 1, MUD_H, [POOL.x, MUD_H / 2, POOL.z], 'bark', { segments: 16, scale: [MUD.rx, 1, MUD.rz] }),
      kit.cylinder(1, 1, WATER_H, [POOL.x, WATER_H / 2, POOL.z], 'navy', { segments: 16, scale: [POOL.rx, 1, POOL.rz], motion: WATER }),
    ];
    // hippo in the water: the head's lower half is hidden by the water surface
    submergedHead(kit, parts, 0.0, 0.35);
    // water lilies
    for (const [x, z] of [[-0.35, -0.2], [0.35, -0.3]] as const) {
      parts.push(kit.cylinder(0.1, 0.1, 0.012, [x, WATER_H + 0.006, z], 'leaf', { segments: 8 }));
    }
    parts.push(kit.sphere(0.035, [-0.35, WATER_H + 0.03, -0.2], 'pink', { detail: 0 }));
    // hippo on the bank: stout body, stubby legs, tiny tail
    const bx = -0.2;
    const bz = -1.0;
    const by = BASE_H;
    parts.push(
      kit.sphere(0.42, [bx - 0.15, by + 0.42, bz], 'purple', { scale: [1.35, 0.9, 1.05] }),
      kit.sphere(0.25, [bx - 0.1, by + 0.3, bz], 'pink', { detail: 1, scale: [1.25, 0.6, 1.0] }),
    );
    for (const lx of [-0.45, 0.2]) {
      for (const lz of [-0.22, 0.22]) {
        parts.push(
          kit.cylinder(0.12, 0.13, 0.3, [bx + lx, by + 0.15, bz + lz], 'purple', { segments: 8 }),
          kit.cylinder(0.13, 0.13, 0.04, [bx + lx, by + 0.02, bz + lz], 'pink', { segments: 8 }),
        );
      }
    }
    hippoHead(kit, parts, [bx + 0.5, by + 0.55, bz], 1.2);
    parts.push(kit.sphere(0.06, [bx - 0.68, by + 0.45, bz], 'purple', { detail: 0 }));
    // rocks and reeds on the bank
    for (const [x, z, r] of [[0.75, -1.2, 0.12], [-0.8, -0.6, 0.1], [0.78, 1.15, 0.12], [-0.7, 1.25, 0.09]] as const) {
      parts.push(kit.sphere(r, [x, BASE_H + r * 0.65 * ICO_LOW, z], 'stone', { detail: 0, scale: [1.2, 0.65, 1] }));
    }
    for (const [x, z, h] of [[-0.78, 1.0, 0.45], [-0.68, 1.1, 0.35], [0.82, -0.5, 0.4], [0.7, -0.45, 0.3]] as const) {
      parts.push(kit.cylinder(0.018, 0.022, h, [x, BASE_H + h / 2, z], 'leaf', { segments: 4 }), kit.cylinder(0.035, 0.035, 0.1, [x, BASE_H + h, z], 'woodDark', { segments: 6 }));
    }
    return kit.finish(parts);
  },
};
