import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';
import { along, heading, rod } from '../../../models/parts';

// A screwpine: a sandy mound, stilt roots fanning out and up into a short forked trunk, a crown of spiky leaves and two fruits.
const MOUND = { r: 0.38, h: 0.03 };
const TRUNK = { top: 0.95, rBottom: 0.1, rTop: 0.07, base: 0.3 };
const ROOTS = 7;
const ROOT = { foot: 0.32, attachY: 0.5, attachR: 0.05, r: 0.03 };
const LEAVES = 9;
const LEAF_T = 0.02;
/** A spiky leaf is two flat diamonds: [length, width, pitch]. */
const LEAF_PIECES: Array<[number, number, number]> = [[0.2, 0.09, 0.45], [0.17, 0.07, -0.35]];
const CROWN: Vec3 = [0, TRUNK.top, 0];
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, TRUNK.top - 0.03, 0], amount: 0.14 };

function leaf(kit: StyleKit, yaw: number, rise: number, color: PaletteColor): Part[] {
  const out: Part[] = [];
  let p = along([CROWN[0], CROWN[1] + rise, CROWN[2]], heading(yaw, 0), 0.03);
  for (const [len, width, pitch] of LEAF_PIECES) {
    const d = heading(yaw, pitch);
    out.push(kit.cylinder(1, 1, LEAF_T, along(p, d, len / 2), color, { segments: 4, scale: [len / 2, 1, width / 2], rotate: [0, yaw, pitch], motion: SWAY }));
    p = along(p, d, len * 0.85);
  }
  return out;
}

/** ต้นเตยทะเล: a screwpine with stilt roots and a crown of spiky leaves. */
export const item: ItemModel = {
  id: 'sea-pandanus',
  name: 'ต้นเตยทะเล',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(MOUND.r, MOUND.r + 0.02, MOUND.h, [0, MOUND.h / 2, 0], 'sand', { segments: 10 }),
      kit.cylinder(TRUNK.rTop, TRUNK.rBottom, TRUNK.top - TRUNK.base, [0, (TRUNK.top + TRUNK.base) / 2, 0], 'wood', { segments: 7 }),
      kit.cylinder(0.11, 0.12, TRUNK.base + 0.02, [0, (TRUNK.base + 0.02) / 2 + MOUND.h - 0.02, 0], 'woodDark', { segments: 7 }),
      kit.sphere(0.1, [0, TRUNK.top, 0], 'leafDark', { detail: 0, motion: SWAY }),
    ];
    // stilt roots: from the trunk out and down into the mound
    for (let i = 0; i < ROOTS; i++) {
      const a = 0.3 + (i / ROOTS) * Math.PI * 2;
      const attach: Vec3 = [Math.cos(a) * ROOT.attachR, ROOT.attachY + (i % 2) * 0.1, -Math.sin(a) * ROOT.attachR];
      const foot: Vec3 = [Math.cos(a) * ROOT.foot, MOUND.h + 0.02, -Math.sin(a) * ROOT.foot];
      parts.push(rod(kit, foot, attach, ROOT.r, i % 2 === 0 ? 'woodDark' : 'wood', { segments: 5 }));
    }
    for (let i = 0; i < LEAVES; i++) {
      const yaw = 0.2 + (i / LEAVES) * Math.PI * 2;
      parts.push(...leaf(kit, yaw, 0.04 + (i % 3) * 0.03, i % 2 === 0 ? 'leaf' : 'lime'));
    }
    // two knobbly fruits hanging under the crown
    parts.push(
      kit.sphere(0.08, [0.1, TRUNK.top - 0.12, 0.08], 'orange', { detail: 0, motion: SWAY }),
      kit.sphere(0.06, [-0.1, TRUNK.top - 0.1, -0.1], 'sunYellow', { detail: 0, motion: SWAY }),
    );
    return kit.finish(parts);
  },
};
