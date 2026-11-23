import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A round mission sign (1x1) on a post: navy disc with a star and a ringed planet that glow at night.
// It is a picture, not text. Both faces (+x and -x) carry the picture.
const BASE = { r: 0.26, h: 0.08 };
const DISC = { r: 0.4, cy: 1.0, t: 0.07 };
const FACE = DISC.t / 2;

/** One face of the sign: `s` is +1 (front, +x) or -1 (back, -x). */
function face(kit: StyleKit, s: 1 | -1): Part[] {
  const x = s * (FACE + 0.01);
  // a thin glowing bar lying on the face, turned about the x axis by `rot`
  const bar = (len: number, thick: number, z: number, y: number, color: PaletteColor, rot = 0): Part =>
    kit.box([0.02, thick, len], [x, DISC.cy + y, z], color, { rotate: [rot, 0, 0], glow: 'windowWarm', light: 'window' });
  return [
    // star: two crossed bars and two turned ones (a four-point star), up-left
    bar(0.2, 0.05, -0.15, 0.17, 'sunYellow'),
    bar(0.2, 0.05, -0.15, 0.17, 'sunYellow', Math.PI / 2),
    bar(0.13, 0.04, -0.15, 0.17, 'sunYellow', Math.PI / 4),
    bar(0.13, 0.04, -0.15, 0.17, 'sunYellow', -Math.PI / 4),
    // planet: orange disc with a pink ring, down-right
    kit.cylinder(0.11, 0.11, 0.02, [x, DISC.cy - 0.1, 0.1], 'orange', { segments: 12, rotate: [0, 0, Math.PI / 2], glow: 'orange', light: 'window' }),
    kit.box([0.02, 0.035, 0.36], [x + s * 0.012, DISC.cy - 0.1, 0.1], 'pink', { rotate: [-0.4, 0, 0], glow: 'pink', light: 'window' }),
    // small dots
    kit.box([0.02, 0.04, 0.04], [x, DISC.cy + 0.22, 0.18], 'white', { glow: 'windowWarm', light: 'window' }),
    kit.box([0.02, 0.04, 0.04], [x, DISC.cy - 0.22, -0.18], 'white', { glow: 'windowWarm', light: 'window' }),
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
      // disc: orange rim and a navy face
      kit.cylinder(DISC.r + 0.04, DISC.r + 0.04, DISC.t - 0.02, [0, DISC.cy, 0], 'orange', { segments: 16, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(DISC.r, DISC.r, DISC.t, [0, DISC.cy, 0], 'navy', { segments: 16, rotate: [0, 0, Math.PI / 2] }),
      ...face(kit, 1),
      ...face(kit, -1),
    ];
    return kit.finish(parts);
  },
};
