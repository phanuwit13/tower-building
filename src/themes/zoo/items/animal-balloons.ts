import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';
import { aim } from '../../../models/parts';

// A post on a round base with a bunch of balloons on strings: a brown bear, a blue elephant (both
// faces to +x) and a few plain ones. Balloons and strings all sway about the post top.
const BASE = { r: 0.32, h: 0.05 };
const POST = { r: 0.035, top: 0.8 };
const TOP: Vec3 = [0, POST.top, 0];
const SWAY: MotionOpts = { kind: 'sway', pivot: TOP, amount: 0.05 };

const BEAR: Vec3 = [0.14, 1.4, 0.2];
const ELEPHANT: Vec3 = [0.1, 1.15, -0.15];
const BALLOON_R = 0.17;
/** Plain balloons: [position, radius, colour]. */
const PLAIN: Array<[Vec3, number, PaletteColor]> = [
  [[-0.12, 1.62, 0.02], 0.13, 'red'],
  [[-0.1, 1.5, -0.28], 0.12, 'sunYellow'],
  [[-0.22, 1.25, 0.24], 0.12, 'pink'],
];

/** ลูกโป่งรูปสัตว์: a post with a bunch of animal-shaped balloons (bear and elephant). */
export const item: ItemModel = {
  id: 'animal-balloons',
  name: 'ลูกโป่งรูปสัตว์',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const m = { motion: SWAY };
    const string = (to: Vec3, r: number): Part => {
      const end: Vec3 = [to[0], to[1] - r, to[2]];
      const d: Vec3 = [end[0] - TOP[0], end[1] - TOP[1], end[2] - TOP[2]];
      const len = Math.hypot(...d);
      return kit.cylinder(0.012, 0.012, len, [TOP[0] + d[0] / 2, TOP[1] + d[1] / 2, TOP[2] + d[2] / 2], 'white', { segments: 4, rotate: aim(d), ...m });
    };
    const parts: Part[] = [
      kit.cylinder(BASE.r, BASE.r, BASE.h, [0, BASE.h / 2, 0], 'stone', { segments: 16 }),
      kit.cylinder(POST.r, POST.r, POST.top - BASE.h, [0, (POST.top + BASE.h) / 2, 0], 'white', { segments: 8 }),
      kit.sphere(0.06, TOP, 'red', { detail: 0 }),
      // bear balloon: round head, two ears, a pale muzzle and a dark nose
      kit.sphere(BALLOON_R, BEAR, 'wood', m),
      kit.sphere(0.07, [BEAR[0] + 0.14, BEAR[1] - 0.04, BEAR[2]], 'sand', { detail: 0, ...m }),
      kit.sphere(0.028, [BEAR[0] + 0.205, BEAR[1] - 0.02, BEAR[2]], 'charcoal', { detail: 0, ...m }),
      string(BEAR, BALLOON_R),
      // elephant balloon: round head, two big flat ears, a hanging trunk
      kit.sphere(BALLOON_R, ELEPHANT, 'skyBlue', m),
      kit.sphere(0.055, [ELEPHANT[0] + 0.15, ELEPHANT[1] - 0.03, ELEPHANT[2]], 'skyBlue', { detail: 0, ...m }),
      kit.sphere(0.045, [ELEPHANT[0] + 0.17, ELEPHANT[1] - 0.12, ELEPHANT[2]], 'skyBlue', { detail: 0, ...m }),
      kit.sphere(0.038, [ELEPHANT[0] + 0.16, ELEPHANT[1] - 0.2, ELEPHANT[2]], 'skyBlue', { detail: 0, ...m }),
      string(ELEPHANT, BALLOON_R),
    ];
    for (const sz of [-1, 1]) {
      parts.push(
        kit.sphere(0.07, [BEAR[0] - 0.04, BEAR[1] + 0.14, BEAR[2] + sz * 0.12], 'wood', { detail: 0, ...m }),
        kit.sphere(0.03, [BEAR[0] + 0.14, BEAR[1] + 0.05, BEAR[2] + sz * 0.07], 'charcoal', { detail: 0, ...m }),
        kit.sphere(0.12, [ELEPHANT[0] - 0.02, ELEPHANT[1] + 0.02, ELEPHANT[2] + sz * 0.17], 'blue', { detail: 0, scale: [0.3, 1, 0.9], ...m }),
        kit.sphere(0.028, [ELEPHANT[0] + 0.14, ELEPHANT[1] + 0.05, ELEPHANT[2] + sz * 0.07], 'charcoal', { detail: 0, ...m }),
      );
    }
    for (const [at, r, color] of PLAIN) parts.push(kit.sphere(r, at, color, m), string(at, r));
    return kit.finish(parts);
  },
};
