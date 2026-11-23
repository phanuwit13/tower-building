import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A round mission sign (1x1) on a post, tilted back so its face looks up towards the camera: a navy disc with a
// bold four-point star and a ringed planet that glow at night. A picture, not text. Both faces carry it.
const BASE = { r: 0.26, h: 0.08 };
const DISC = { r: 0.46, cy: 1.0, t: 0.07 };
const TILT = 0.5; // radians the face leans back
const N = [Math.cos(TILT), Math.sin(TILT)] as const; // face normal in x-y
const UP = [-Math.sin(TILT), Math.cos(TILT)] as const; // face "up" in x-y
const AXIS_TURN = TILT - Math.PI / 2; // turns a cylinder's y axis onto the face normal

/** One face of the sign: `s` is +1 (front) or -1 (back). */
function face(kit: StyleKit, s: 1 | -1): Part[] {
  // a flat disc on the face at depth `u` (along the normal), `v` up the face, `w` across it; squashed by `sv` x `sw`
  const flat = (r: number, u: number, v: number, w: number, color: PaletteColor, glow: { glow: PaletteColor; light: 'window' }, sv = 1, sw = 1, segments = 16): Part => {
    const d = s * (DISC.t / 2 + u);
    const opts = { segments, rotate: [0, 0, AXIS_TURN] as [number, number, number], scale: [sv, 1, sw] as [number, number, number], ...glow };
    return kit.cylinder(r, r, 0.02, [d * N[0] + v * UP[0], DISC.cy + d * N[1] + v * UP[1], w], color, opts);
  };
  const lit = (c: PaletteColor) => ({ glow: c, light: 'window' as const });
  return [
    // star (up-left): two thin diamonds crossing, plus a round heart
    flat(0.2, 0.01, 0.17, -0.12, 'sunYellow', lit('sunYellow'), 1, 0.3, 4),
    flat(0.2, 0.01, 0.17, -0.12, 'sunYellow', lit('sunYellow'), 0.3, 1, 4),
    flat(0.07, 0.02, 0.17, -0.12, 'white', lit('windowWarm'), 1, 1, 8),
    // ringed planet (down-right): pink ring ellipse, orange ball, a pink band across it
    flat(0.24, 0.01, -0.13, 0.1, 'pink', lit('pink'), 0.35, 1),
    flat(0.14, 0.02, -0.13, 0.1, 'orange', lit('orange')),
    flat(0.24, 0.03, -0.13, 0.1, 'pink', lit('pink'), 0.1, 1),
  ];
}

export const item: ItemModel = {
  id: 'mission-sign',
  name: 'ป้ายภารกิจ',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(BASE.r - 0.04, BASE.r, BASE.h, [0, BASE.h / 2, 0], 'stoneDark', { segments: 10 }),
      kit.cylinder(0.04, 0.04, DISC.cy - BASE.h, [0, BASE.h + (DISC.cy - BASE.h) / 2, 0], 'chrome', { segments: 8 }),
      // disc: orange rim and a navy face, leaning back
      kit.cylinder(DISC.r + 0.04, DISC.r + 0.04, DISC.t - 0.02, [0, DISC.cy, 0], 'orange', { segments: 16, rotate: [0, 0, AXIS_TURN] }),
      kit.cylinder(DISC.r, DISC.r, DISC.t, [0, DISC.cy, 0], 'navy', { segments: 16, rotate: [0, 0, AXIS_TURN] }),
      ...face(kit, 1),
      ...face(kit, -1),
    ];
    return kit.finish(parts);
  },
};
