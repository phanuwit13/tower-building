import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';
import { along, heading } from '../../../models/parts';

// A tall coconut palm (1×1) leaning out of a little sand mound: the trunk curves, the crown sways.
const BASE: Vec3 = [-0.3, 0.03, 0.0];
const BEND: Vec3 = [-0.2, 1.05, 0.0];
const TOP: Vec3 = [-0.02, 1.95, 0.0];
const TRUNK_SEGMENTS = 8;
const TRUNK_R = { bottom: 0.09, top: 0.055 };
const FROND_T = 0.022;
const FRONDS = 9;
/** Each frond: three flat diamonds getting smaller towards the tip: [length, width, pitch]. */
const FROND_PIECES: Array<[number, number, number]> = [[0.2, 0.14, 0.35], [0.18, 0.12, -0.2], [0.15, 0.09, -0.8]];
const SWAY: MotionOpts = { kind: 'sway', pivot: [TOP[0], TOP[1] - 0.03, TOP[2]], amount: 0.2 };
const COCONUTS = 4;

function bezier(t: number): Vec3 {
  const u = 1 - t;
  return [0, 1, 2].map((i) => u * u * BASE[i] + 2 * u * t * BEND[i] + t * t * TOP[i]) as Vec3;
}

function diamond(kit: StyleKit, start: Vec3, yaw: number, [len, width, pitch]: [number, number, number], color: PaletteColor): [Part, Vec3] {
  const d = heading(yaw, pitch);
  const part = kit.cylinder(1, 1, FROND_T, along(start, d, len / 2), color, { segments: 4, scale: [len / 2, 1, width / 2], rotate: [0, yaw, pitch], motion: SWAY });
  return [part, along(start, d, len * 0.8)];
}

/** ต้นมะพร้าว: a tall curving coconut palm with coconuts under the fronds. */
export const item: ItemModel = {
  id: 'palm-tree',
  name: 'ต้นมะพร้าว',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.dome(0.4, [0, 0, 0], 'sand', { segments: 8, scale: [1, 0.12, 1] }),
    ];
    for (let i = 0; i < TRUNK_SEGMENTS; i++) {
      const a = bezier(i / TRUNK_SEGMENTS);
      const b = bezier((i + 1) / TRUNK_SEGMENTS);
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const r = TRUNK_R.bottom + (TRUNK_R.top - TRUNK_R.bottom) * ((i + 0.5) / TRUNK_SEGMENTS);
      parts.push(kit.cylinder(r * 1.1, r * 0.9, Math.hypot(dx, dy) + 0.02, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, a[2] + (b[2] - a[2]) / 2], i % 2 === 0 ? 'wood' : 'woodDark', { segments: 7, rotate: [0, 0, -Math.atan2(dx, dy)] }));
    }
    parts.push(kit.sphere(0.1, [TOP[0], TOP[1] + 0.02, TOP[2]], 'leafDark', { detail: 0, motion: SWAY }));
    for (let k = 0; k < COCONUTS; k++) {
      const a = 0.5 + (k / COCONUTS) * Math.PI * 2;
      parts.push(kit.sphere(0.075, [TOP[0] + Math.cos(a) * 0.09, TOP[1] - 0.11, TOP[2] - Math.sin(a) * 0.09], 'bark', { detail: 0, motion: SWAY }));
    }
    for (let f = 0; f < FRONDS; f++) {
      const yaw = 0.15 + (f / FRONDS) * Math.PI * 2;
      const color: PaletteColor = f % 2 === 0 ? 'leaf' : 'leafDark';
      let p = along([TOP[0], TOP[1] + 0.04, TOP[2]], heading(yaw, 0), 0.04);
      for (const piece of FROND_PIECES) {
        const [part, next] = diamond(kit, p, yaw, piece, color);
        parts.push(part);
        p = next;
      }
    }
    return kit.finish(parts);
  },
};
