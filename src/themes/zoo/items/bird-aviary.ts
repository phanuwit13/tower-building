import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

// A tall, airy dome of thin white net strands (6 meridians + 2 rings) over a grassy floor, so the tree and the
// colourful birds inside stay easy to see. A low teal ring holds the net and a gap in the +x side forms a doorway.
const R = 0.94; // dome radius at the base
const H = 1.75; // dome height above the base
const BASE_Y = 0.07; // net starts on the grass ring
const GRASS = { r: 0.97, h: 0.05 };
const MERIDIANS = 6;
const ARC_STEPS = 3; // each meridian is 3 straight rods
const RING_STEPS = [1, 2]; // latitude rings at these arc steps (counted from the base)
// The doorway on +x: meridian 0 and the ring/base segments next to it are left out.
const isDoor = (m: number): boolean => m === 0 || m === MERIDIANS - 1;
const NET = { r: 0.016, color: 'white' as PaletteColor };
const TREE = { x: -0.22, z: -0.12, trunkH: 0.8, crown: { y: 1.06, r: 0.34 } };
/** Birds: [x, y, z, yaw, body colour, wing colour]. */
const BIRDS: Array<[number, number, number, number, PaletteColor, PaletteColor]> = [
  [-0.12, 1.27, 0.0, 0.4, 'red', 'redDark'], // on top of the crown
  [0.0, 0.89, 0.02, 5.6, 'blue', 'navy'], // on the +x branch
  [0.18, 0.24, 0.3, 0.3, 'sunYellow', 'orange'], // on the perch
  [0.18, 0.24, -0.25, 5.9, 'pink', 'purple'],
  [0.55, GRASS.h, 0.45, 0.9, 'orange', 'redDark'], // on the grass
];

/** Point on the dome at arc step `i` (0 = base, ARC_STEPS = top) and azimuth `a`. */
function dome(i: number, a: number): Vec3 {
  const e = (i / ARC_STEPS) * (Math.PI / 2);
  return [R * Math.cos(e) * Math.cos(a), BASE_Y + H * Math.sin(e), R * Math.cos(e) * Math.sin(a)];
}

/** A small round bird perched at (x, y, z) (y = underside of its feet), turned by `yaw` about y. */
function bird(kit: StyleKit, x: number, y: number, z: number, yaw: number, body: PaletteColor, wing: PaletteColor): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const at = (f: number, up: number, side = 0): Vec3 => [x + f * c + side * s, y + up, z - f * s + side * c];
  const rotate: Vec3 = [0, yaw, 0];
  return [
    kit.sphere(0.075, at(0, 0.085), body, { detail: 0, scale: [1.25, 1, 0.95], rotate }),
    kit.sphere(0.05, at(0.085, 0.14), body, { detail: 0 }),
    kit.box([0.045, 0.025, 0.03], at(0.14, 0.135), 'orange', { rotate }),
    kit.box([0.1, 0.02, 0.05], at(-0.12, 0.075), wing, { rotate: [0, yaw, 0.35] }), // tail
    kit.box([0.1, 0.035, 0.03], at(0, 0.095, 0.07), wing, { rotate }), // wings
    kit.box([0.1, 0.035, 0.03], at(0, 0.095, -0.07), wing, { rotate }),
    kit.box([0.02, 0.03, 0.03], at(0.115, 0.16, 0.035), 'charcoal', { rotate }), // eyes
    kit.box([0.02, 0.03, 0.03], at(0.115, 0.16, -0.035), 'charcoal', { rotate }),
  ];
}

/** กรงนกใหญ่: a tall dome of thin net with a tree and colourful birds inside (an open, airy look, not a cage). */
export const item: ItemModel = {
  id: 'bird-aviary',
  name: 'กรงนกใหญ่',
  category: 'animal',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(GRASS.r, GRASS.r, GRASS.h, [0, GRASS.h / 2, 0], 'lime', { segments: 16 }),
      // a little stone path to the doorway on +x
      kit.box([0.3, 0.03, 0.26], [0.8, 0.065, 0], 'stone'),
    ];
    // --- the net ---
    for (let m = 1; m < MERIDIANS; m++) {
      const a = (m / MERIDIANS) * Math.PI * 2;
      for (let i = 0; i < ARC_STEPS; i++) parts.push(rod(kit, dome(i, a), dome(i + 1, a), NET.r, NET.color, { segments: 4 }));
    }
    for (const i of RING_STEPS) {
      for (let m = 0; m < MERIDIANS; m++) {
        if (isDoor(m)) continue;
        const a0 = (m / MERIDIANS) * Math.PI * 2;
        const a1 = ((m + 1) / MERIDIANS) * Math.PI * 2;
        parts.push(rod(kit, dome(i, a0), dome(i, a1), NET.r, NET.color, { segments: 4 }));
      }
    }
    // base ring and a golden finial on top
    for (let m = 0; m < MERIDIANS; m++) {
      if (isDoor(m)) continue;
      const a0 = (m / MERIDIANS) * Math.PI * 2;
      const a1 = ((m + 1) / MERIDIANS) * Math.PI * 2;
      parts.push(rod(kit, dome(0, a0), dome(0, a1), 0.03, 'teal', { segments: 4 }));
    }
    parts.push(kit.sphere(0.05, [0, BASE_Y + H + 0.01, 0], 'sunYellow', { detail: 0 }));

    // --- the tree: trunk, two branches and a leafy crown ---
    const top = GRASS.h + TREE.trunkH;
    parts.push(
      kit.cylinder(0.05, 0.08, TREE.trunkH, [TREE.x, GRASS.h + TREE.trunkH / 2, TREE.z], 'bark', { segments: 8 }),
      rod(kit, [TREE.x, top - 0.25, TREE.z], [TREE.x - 0.3, top - 0.02, TREE.z - 0.18], 0.025, 'bark', { segments: 5 }),
      rod(kit, [TREE.x, top - 0.15, TREE.z], [TREE.x + 0.26, top + 0.02, TREE.z + 0.14], 0.025, 'bark', { segments: 5 }),
      kit.sphere(TREE.crown.r, [TREE.x, TREE.crown.y, TREE.z], 'leaf', { scale: [1, 0.8, 1] }),
      kit.sphere(0.22, [TREE.x - 0.25, TREE.crown.y - 0.06, TREE.z - 0.1], 'leafDark', { detail: 0 }),
      kit.sphere(0.2, [TREE.x + 0.22, TREE.crown.y - 0.04, TREE.z + 0.1], 'leafDark', { detail: 0 }),
      kit.sphere(0.04, [TREE.x + 0.15, TREE.crown.y + 0.18, TREE.z + 0.2], 'pink', { detail: 0 }),
      kit.sphere(0.04, [TREE.x - 0.2, TREE.crown.y + 0.2, TREE.z - 0.15], 'sunYellow', { detail: 0 }),
    );
    // a low perch rod on the +x side, with two birds on it
    parts.push(
      rod(kit, [0.18, 0.22, 0.5], [0.18, 0.22, -0.5], 0.02, 'wood', { segments: 5 }),
      kit.cylinder(0.025, 0.03, 0.2, [0.18, 0.12, 0.5], 'wood', { segments: 5 }),
      kit.cylinder(0.025, 0.03, 0.2, [0.18, 0.12, -0.5], 'wood', { segments: 5 }),
    );
    for (const [x, y, z, yaw, body, wing] of BIRDS) parts.push(...bird(kit, x, y, z, yaw, body, wing));
    return kit.finish(parts);
  },
};
