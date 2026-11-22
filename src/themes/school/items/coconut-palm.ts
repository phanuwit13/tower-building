import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// The trunk follows a curve in the x-y plane: it leans out from the back (-x) and bends upright under the crown.
const BASE: Vec3 = [-0.24, 0, 0];
const BEND: Vec3 = [0.12, 0.95, 0]; // the curve's control point
const TOP: Vec3 = [0.02, 1.86, 0]; // the crown
const TRUNK_SEGMENTS = 6;
const TRUNK_R = { bottom: 0.085, top: 0.055 };
const FLARE = { h: 0.14, r: 0.12 }; // root flare: the part that stands on the ground
const FROND_T = 0.02; // frond thickness
const FRONDS = 7;
/** Each frond is three flat diamonds getting smaller towards the tip: [length, width, pitch (+ up, - droops)]. */
const FROND_PIECES: Array<[number, number, number]> = [[0.22, 0.15, 0.3], [0.2, 0.13, -0.25], [0.16, 0.09, -0.85]];
const COCONUT = { r: 0.075, out: 0.085, drop: 0.11 };

function bezier(t: number): Vec3 {
  const u = 1 - t;
  return [0, 1, 2].map((i) => u * u * BASE[i] + 2 * u * t * BEND[i] + t * t * TOP[i]) as Vec3;
}
function dir(yaw: number, pitch: number): Vec3 {
  return [Math.cos(pitch) * Math.cos(yaw), Math.sin(pitch), -Math.cos(pitch) * Math.sin(yaw)];
}
const along = (p: Vec3, d: Vec3, s: number): Vec3 => [p[0] + d[0] * s, p[1] + d[1] * s, p[2] + d[2] * s];

/** A flat diamond (a 4-sided cylinder squashed flat) from `start`; returns the part and where the next piece starts. */
function diamond(kit: StyleKit, start: Vec3, yaw: number, [len, width, pitch]: [number, number, number], color: PaletteColor): [Part, Vec3] {
  const d = dir(yaw, pitch);
  const part = kit.cylinder(1, 1, FROND_T, along(start, d, len / 2), color, {
    segments: 4, scale: [len / 2, 1, width / 2], rotate: [0, yaw, pitch],
  });
  return [part, along(start, d, len * 0.8)]; // pieces overlap a little: the frond edge looks like a row of leaflets
}

/** ต้นมะพร้าว: a coconut palm, a slim curved ringed trunk, a star of long fronds and three coconuts. */
export const item: ItemModel = {
  id: 'coconut-palm',
  name: 'ต้นมะพร้าว',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(TRUNK_R.bottom, FLARE.r, FLARE.h, [BASE[0], FLARE.h / 2, BASE[2]], 'woodDark', { segments: 7 }),
    ];
    // trunk: short cups, each a little wider at its top, so the trunk looks ringed
    for (let i = 0; i < TRUNK_SEGMENTS; i++) {
      const a = bezier(i / TRUNK_SEGMENTS);
      const b = bezier((i + 1) / TRUNK_SEGMENTS);
      if (i === 0) a[1] = FLARE.h * 0.6; // start inside the flare
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const r = TRUNK_R.bottom + (TRUNK_R.top - TRUNK_R.bottom) * ((i + 0.5) / TRUNK_SEGMENTS);
      parts.push(kit.cylinder(r * 1.12, r * 0.88, Math.hypot(dx, dy) + 0.02, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0],
        i % 2 === 0 ? 'wood' : 'woodDark', { segments: 7, rotate: [0, 0, -Math.atan2(dx, dy)] }));
    }
    parts.push(kit.sphere(0.1, [TOP[0], TOP[1] + 0.02, TOP[2]], 'leafDark', { detail: 0 }));
    for (let k = 0; k < 3; k++) {
      const a = 0.4 + (k / 3) * Math.PI * 2;
      parts.push(kit.sphere(COCONUT.r, [TOP[0] + Math.cos(a) * COCONUT.out, TOP[1] - COCONUT.drop, TOP[2] - Math.sin(a) * COCONUT.out], 'woodDark', { detail: 0 }));
    }
    for (let f = 0; f < FRONDS; f++) {
      const yaw = 0.2 + (f / FRONDS) * Math.PI * 2;
      const color: PaletteColor = f % 2 === 0 ? 'leaf' : 'leafDark';
      let p = along([TOP[0], TOP[1] + 0.04, TOP[2]], dir(yaw, 0), 0.04);
      for (const piece of FROND_PIECES) {
        const [part, next] = diamond(kit, p, yaw, piece, color);
        parts.push(part);
        p = next;
      }
    }
    return kit.finish(parts);
  },
};
