import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { along, heading } from '../../../models/parts';

const TRUNK = { h: 0.8, rBottom: 0.14, rTop: 0.095 }; // short, thick, pale green stem
const CROWN_Y = TRUNK.h - 0.03; // where the leaves come out
const BLADE_T = 0.025; // leaf thickness
const RIB = { w: 0.028, h: 0.018 }; // pale midrib along the top of each leaf
const OVERLAP = 0.08; // the outer half of a leaf starts this far back along the inner half (no waist)
/**
 * The four big leaves, roughly on the diagonals (the longest reach inside the tile): direction
 * around the trunk (radians, 0 = +x, turning towards -z), then two flat oval halves as
 * [length, width, pitch in radians (+ rises, - droops)], so each leaf arches up and hangs at the tip.
 * The gap towards the camera (+x+z) is left for the banana bunch.
 */
interface Leaf { yaw: number; color: PaletteColor; inner: [number, number, number]; outer: [number, number, number] }
const LEAVES: Leaf[] = [
  { yaw: 0.8, color: 'leaf', inner: [0.32, 0.22, 0.45], outer: [0.38, 0.21, -0.6] },
  { yaw: 2.35, color: 'leafDark', inner: [0.3, 0.21, 0.55], outer: [0.36, 0.2, -0.5] },
  { yaw: 3.9, color: 'leaf', inner: [0.32, 0.22, 0.4], outer: [0.38, 0.21, -0.7] },
  { yaw: 5.0, color: 'leafDark', inner: [0.3, 0.21, 0.5], outer: [0.32, 0.2, -0.6] },
];
const SHOOT = { r: 0.045, h: 0.34 }; // the new rolled-up leaf in the middle
const BUNCH = { yaw: 6.0, out: 0.21, y: 0.47 }; // the bananas hang in the gap on the front (+x) side
const FINGER = { r: 0.032, len: 0.1, tilt: 0.5 }; // one banana: a stretched ball leaning out and up


/** One flat oval leaf half from `start`, with its midrib on top; returns the parts and the far end. */
function blade(kit: StyleKit, start: Vec3, yaw: number, [len, width, pitch]: [number, number, number], color: PaletteColor): [Part[], Vec3] {
  const d = heading(yaw, pitch);
  const up = heading(yaw, pitch + Math.PI / 2); // the leaf's top-side normal
  const mid = along(start, d, len / 2);
  const rot: Vec3 = [0, yaw, pitch];
  return [[
    kit.cylinder(1, 1, BLADE_T, mid, color, { segments: 8, scale: [len / 2, 1, width / 2], rotate: rot }),
    kit.box([len * 0.92, RIB.h, RIB.w], along(mid, up, BLADE_T / 2), 'lime', { rotate: rot }),
  ], along(start, d, len)];
}

/** ต้นกล้วย: a banana plant, a short thick stem with four big drooping leaves and a bunch of bananas. */
export const item: ItemModel = {
  id: 'banana-tree',
  name: 'ต้นกล้วย',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(TRUNK.rTop, TRUNK.rBottom, TRUNK.h, [0, TRUNK.h / 2, 0], 'lime', { segments: 8 }),
      kit.cylinder(TRUNK.rBottom + 0.02, TRUNK.rBottom + 0.03, 0.07, [0, 0.035, 0], 'leafDark', { segments: 8 }), // old leaf sheaths at the foot
      kit.cone(SHOOT.r, SHOOT.h, [0, CROWN_Y + SHOOT.h / 2, 0], 'lime', { segments: 6 }),
    ];
    for (const leaf of LEAVES) {
      const start = along([0, CROWN_Y, 0], heading(leaf.yaw, 0), 0.04);
      const [inner, end] = blade(kit, start, leaf.yaw, leaf.inner, leaf.color);
      const [outer] = blade(kit, along(end, heading(leaf.yaw, leaf.inner[2]), -OVERLAP), leaf.yaw, leaf.outer, leaf.color);
      parts.push(...inner, ...outer);
    }
    // banana bunch: a stalk out of the crown, two rows of fingers pointing up and out, and the
    // dark red flower bud hanging under them
    const d = heading(BUNCH.yaw, 0);
    const c: Vec3 = [d[0] * BUNCH.out, BUNCH.y, d[2] * BUNCH.out];
    const stalkOut = BUNCH.out - 0.07;
    const stalkDrop = CROWN_Y - (BUNCH.y + 0.08);
    parts.push(
      kit.cylinder(0.022, 0.022, Math.hypot(stalkOut, stalkDrop) + 0.04, [d[0] * (0.07 + stalkOut / 2), BUNCH.y + 0.08 + stalkDrop / 2, d[2] * (0.07 + stalkOut / 2)],
        'leafDark', { segments: 5, rotate: [0, BUNCH.yaw, Math.atan2(stalkOut, stalkDrop)] }),
      kit.cylinder(0.026, 0.026, 0.2, [c[0], BUNCH.y, c[2]], 'leafDark', { segments: 5 }), // the bunch's own stem
      kit.cone(0.055, 0.13, [c[0], BUNCH.y - 0.16, c[2]], 'redDark', { segments: 6, rotate: [Math.PI, 0, 0] }),
    );
    for (let k = 0; k < 8; k++) {
      const a = (k / 4) * Math.PI * 2 + (k >= 4 ? Math.PI / 4 : 0);
      const y = BUNCH.y + (k < 4 ? 0.05 : -0.04);
      parts.push(kit.sphere(1, [c[0] + Math.cos(a) * 0.05, y, c[2] - Math.sin(a) * 0.05], 'sunYellow', {
        detail: 0, scale: [FINGER.r, FINGER.len / 2, FINGER.r], rotate: [-Math.sin(a) * FINGER.tilt, 0, -Math.cos(a) * FINGER.tilt],
      }));
    }
    return kit.finish(parts);
  },
};
