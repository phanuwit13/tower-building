import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { rod } from '../../../models/parts';

// A sandy yard (long side along z): a tall wooden feeding platform in the -z corner, an acacia in the
// +x+z corner and two giraffes. The acacia crown sways about the top of its trunk.
const GROUND_H = 0.03;
const PLATFORM = { x: 0.52, z: -1.08, size: 0.5, deck: 0.9 };
const ACACIA = { x: 0.52, z: 1.0, trunkTop: 0.78 };
const SWAY: MotionOpts = { kind: 'sway', pivot: [ACACIA.x, ACACIA.trunkTop - 0.05, ACACIA.z], amount: 0.07 };

/** A friendly giraffe standing on the ground at (x, z), turned by `yaw` (0 faces +x); `head` is the head height. */
function giraffe(kit: StyleKit, x: number, z: number, yaw: number, head: number): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  /** Local (forward, side, up) to world. */
  const at = (f: number, side: number, up: number): Vec3 => [x + f * c + side * s, GROUND_H + up, z - f * s + side * c];
  const rot: Vec3 = [0, yaw, 0];
  const parts: Part[] = [
    kit.sphere(0.2, at(0, 0, 0.68), 'sunYellow', { scale: [1.3, 0.85, 0.8], rotate: rot }),
    rod(kit, at(0.17, 0, 0.74), at(0.4, 0, head - 0.04), 0.065, 'sunYellow', { segments: 6 }),
    kit.sphere(0.085, at(0.44, 0, head), 'sunYellow', { scale: [1.2, 0.9, 0.9], rotate: rot }),
    kit.sphere(0.055, at(0.54, 0, head - 0.03), 'sand', { detail: 0, scale: [1.2, 0.8, 0.9], rotate: rot }),
    kit.sphere(0.03, at(0.56, 0, head - 0.015), 'charcoal', { detail: 0 }),
    // big eyes
    kit.sphere(0.03, at(0.48, 0.065, head + 0.025), 'white', { detail: 0 }),
    kit.sphere(0.03, at(0.48, -0.065, head + 0.025), 'white', { detail: 0 }),
    kit.sphere(0.017, at(0.5, 0.07, head + 0.025), 'charcoal', { detail: 0 }),
    kit.sphere(0.017, at(0.5, -0.07, head + 0.025), 'charcoal', { detail: 0 }),
    // ossicones and ears
    kit.cylinder(0.014, 0.018, 0.07, at(0.42, 0.04, head + 0.12), 'woodDark', { segments: 4 }),
    kit.cylinder(0.014, 0.018, 0.07, at(0.42, -0.04, head + 0.12), 'woodDark', { segments: 4 }),
    kit.sphere(0.025, at(0.42, 0.04, head + 0.165), 'woodDark', { detail: 0 }),
    kit.sphere(0.025, at(0.42, -0.04, head + 0.165), 'woodDark', { detail: 0 }),
    kit.sphere(0.03, at(0.4, 0.1, head + 0.04), 'sunYellow', { detail: 0, scale: [0.6, 0.5, 1.4], rotate: rot }),
    kit.sphere(0.03, at(0.4, -0.1, head + 0.04), 'sunYellow', { detail: 0, scale: [0.6, 0.5, 1.4], rotate: rot }),
    // mane down the back of the neck, tail with a tuft
    rod(kit, at(0.14, 0, 0.8), at(0.36, 0, head - 0.1), 0.02, 'woodDark', { segments: 4 }),
    rod(kit, at(-0.25, 0, 0.74), at(-0.33, 0, 0.5), 0.015, 'woodDark', { segments: 4 }),
    kit.sphere(0.03, at(-0.33, 0, 0.47), 'woodDark', { detail: 0 }),
  ];
  for (const [f, side] of [[0.17, 0.09], [0.17, -0.09], [-0.17, 0.09], [-0.17, -0.09]] as const) {
    parts.push(
      kit.cylinder(0.035, 0.04, 0.55, at(f, side, 0.275), 'sunYellow', { segments: 6 }),
      kit.cylinder(0.042, 0.042, 0.05, at(f, side, 0.025), 'woodDark', { segments: 6 }),
    );
  }
  // brown patches on both flanks and the neck
  for (const side of [1, -1]) {
    for (const [f, up, r] of [[-0.09, 0.74, 0.05], [0.07, 0.62, 0.045], [-0.04, 0.58, 0.035], [0.25, 0.92, 0.035]] as const) {
      parts.push(kit.sphere(r, at(f, side * (f > 0.2 ? 0.07 : 0.15), up), 'woodDark', { detail: 0, scale: [1, 1, 0.4], rotate: rot }));
    }
  }
  return parts;
}

/** The feeding platform: four posts, a deck, a rail round three sides, a ladder on +x and a hay bucket. */
function platform(kit: StyleKit): Part[] {
  const { x, z, size, deck } = PLATFORM;
  const h = size / 2 - 0.03;
  const parts: Part[] = [kit.box([size, 0.05, size], [x, deck - 0.025 + GROUND_H, z], 'woodDark')];
  for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const) {
    parts.push(kit.box([0.06, deck, 0.06], [x + dx * h, GROUND_H + deck / 2 - 0.02, z + dz * h], 'wood'));
    parts.push(kit.box([0.04, 0.14, 0.04], [x + dx * h, GROUND_H + deck + 0.07, z + dz * h], 'wood'));
  }
  const top = GROUND_H + deck + 0.13;
  parts.push(
    kit.box([0.03, 0.03, size - 0.04], [x - h, top, z], 'wood'),
    kit.box([size - 0.04, 0.03, 0.03], [x, top, z - h], 'wood'),
    kit.box([size - 0.04, 0.03, 0.03], [x, top, z + h], 'wood'),
    // hay bucket
    kit.cylinder(0.1, 0.075, 0.12, [x - 0.02, GROUND_H + deck + 0.06, z - 0.02], 'terracotta', { segments: 8 }),
    kit.sphere(0.09, [x - 0.02, GROUND_H + deck + 0.14, z - 0.02], 'lime', { detail: 0, scale: [1, 0.6, 1] }),
    // ladder on the +x side
    rod(kit, [x + size / 2 + 0.2, GROUND_H + 0.012, z - 0.1], [x + size / 2 + 0.01, GROUND_H + deck, z - 0.1], 0.02, 'wood', { segments: 4 }),
    rod(kit, [x + size / 2 + 0.2, GROUND_H + 0.012, z + 0.1], [x + size / 2 + 0.01, GROUND_H + deck, z + 0.1], 0.02, 'wood', { segments: 4 }),
  );
  for (const t of [0.25, 0.5, 0.75]) {
    parts.push(kit.box([0.025, 0.025, 0.2], [x + size / 2 + 0.2 - t * 0.19, GROUND_H + t * deck, z], 'woodDark'));
  }
  return parts;
}

/** ลานยีราฟ: a sandy yard with two giraffes beside a tall feeding platform and an acacia. */
export const item: ItemModel = {
  id: 'giraffe-yard',
  name: 'ลานยีราฟ',
  category: 'animal',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.96, GROUND_H, 2.96], [0, GROUND_H / 2, 0], 'sand'),
      ...platform(kit),
      ...giraffe(kit, PLATFORM.x - 0.05, -0.38, Math.PI / 2 + 0.1, 1.3),
      ...giraffe(kit, -0.35, 0.5, -0.55, 1.5),
      // rocks
      kit.sphere(0.14, [-0.75, 0.09, -0.8], 'stone', { detail: 0, scale: [1.2, 0.7, 1] }),
      kit.sphere(0.1, [-0.6, 0.07, -1.05], 'stoneDark', { detail: 0, scale: [1.2, 0.7, 1] }),
      kit.sphere(0.11, [-0.8, 0.075, 1.2], 'stone', { detail: 0, scale: [1.2, 0.7, 1] }),
      // the acacia: a thin trunk and a flat crown that sways together
      kit.cylinder(0.05, 0.08, ACACIA.trunkTop, [ACACIA.x, GROUND_H + ACACIA.trunkTop / 2, ACACIA.z], 'wood', { segments: 7 }),
      kit.sphere(0.4, [ACACIA.x, GROUND_H + ACACIA.trunkTop + 0.08, ACACIA.z], 'leaf', { scale: [1, 0.32, 1], motion: SWAY }),
      kit.sphere(0.27, [ACACIA.x - 0.05, GROUND_H + ACACIA.trunkTop + 0.2, ACACIA.z + 0.03], 'leafDark', { scale: [1, 0.35, 1], motion: SWAY }),
    ];
    return kit.finish(parts);
  },
};
