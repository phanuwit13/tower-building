import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import type { MotionOpts } from '../../../models/motion';
import { rod } from '../../../models/parts';

// 1x2 (x 1, z 2). A wooden bench facing +x, with a small cherry tree at its -z end.
const SEAT_Y = 0.31; // shared seat height
const BZ = 0.1; // bench centre along z
const LEN = 1.4;
const TREE = { x: -0.28, z: BZ, top: 0.8 };
const SWAY: MotionOpts = { kind: 'sway', pivot: [TREE.x, TREE.top, TREE.z], amount: 0.05 };

/** [x, y, z, radius, colour, detail] in world units: the crown spreads over the bench; |x| + r < 0.45 so the sway stays inside x in [-0.5, 0.5]. */
const BLOSSOMS: Array<[number, number, number, number, PaletteColor, 0 | 1]> = [
  [-0.1, 1.3, BZ, 0.28, 'pink', 1],
  [-0.05, 1.2, BZ - 0.45, 0.24, 'pink', 1],
  [-0.05, 1.2, BZ + 0.45, 0.24, 'pink', 1],
  [0.08, 1.12, BZ - 0.2, 0.2, 'pink', 1],
  [0.08, 1.12, BZ + 0.22, 0.2, 'white', 0],
  [-0.15, 1.55, BZ + 0.15, 0.2, 'pink', 0],
  [-0.12, 1.5, BZ - 0.22, 0.2, 'white', 0],
  [0.1, 1.3, BZ + 0.58, 0.14, 'pink', 0],
];

/** ม้านั่งใต้ซากุระ: a bench beside a small cherry tree, petals on the seat and the ground. */
export const item: ItemModel = {
  id: 'sakura-bench',
  name: 'ม้านั่งใต้ซากุระ',
  category: 'seating',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const x of [0.02, 0.15, 0.28]) parts.push(kit.box([0.11, 0.05, LEN], [x, SEAT_Y - 0.025, BZ], 'wood'));
    for (const [x, y] of [[-0.02, 0.46], [-0.05, 0.56]] as const) {
      parts.push(kit.box([0.04, 0.08, LEN], [x, y, BZ], 'wood', { rotate: [0, 0, 0.15] }));
    }
    for (const z of [BZ - LEN / 2 + 0.08, BZ + LEN / 2 - 0.08]) {
      parts.push(
        kit.box([0.34, 0.06, 0.06], [0.16, 0.26, z], 'woodDark'),
        kit.box([0.06, 0.26, 0.06], [0.3, 0.13, z], 'woodDark'),
        kit.box([0.06, 0.62, 0.06], [-0.03, 0.31, z], 'woodDark'),
      );
    }
    // the tree
    parts.push(
      kit.cylinder(0.06, 0.1, TREE.top, [TREE.x, TREE.top / 2, TREE.z], 'bark', { segments: 7 }),
      rod(kit, [TREE.x, 0.5, TREE.z], [TREE.x + 0.08, 0.78, TREE.z + 0.04], 0.03, 'bark', { segments: 5 }),
    );
    for (const [x, y, z, r, c, detail] of BLOSSOMS) {
      parts.push(kit.sphere(r, [x, y, z], c, { detail, motion: SWAY }));
    }
    // petals on the seat and the ground
    parts.push(kit.cylinder(0.03, 0.03, 0.01, [0.1, SEAT_Y + 0.005, BZ - 0.3], 'pink', { segments: 6 }));
    parts.push(kit.cylinder(0.03, 0.03, 0.01, [0.2, SEAT_Y + 0.005, BZ + 0.1], 'pink', { segments: 6 }));
    for (const [x, z] of [[0.38, -0.4], [0.3, -0.8], [0.36, 0.85], [-0.38, 0.5], [0.25, -0.15], [-0.35, -0.5], [0.4, 0.5]] as const) {
      parts.push(kit.cylinder(0.04, 0.04, 0.02, [x, 0.01, z], 'pink', { segments: 6 }));
    }
    return kit.finish(parts);
  },
};
