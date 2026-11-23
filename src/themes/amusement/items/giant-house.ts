import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, gableRoof, glassWindow, wallPanel } from '../../../models/parts';

// A fairy-tale giant's cottage: an oversized door and windows, a giant boot and a giant chair outside.
// Front faces +x. (A storybook giant, not a temple guardian.)
const BASE = { w: 1.94, h: 0.05, d: 2.94 };
const BODY = { x: -0.2, w: 1.3, d: 2.2, h: 1.1 };
const WALL_TOP = BASE.h + BODY.h;
const FRONT = BODY.x + BODY.w / 2;
const ROOF = { rise: 0.55, eave: 0.05 };

/** บ้านยักษ์: a giant's cottage with a huge door, a boot and a chair. */
export const item: ItemModel = {
  id: 'giant-house',
  name: 'บ้านยักษ์',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'leaf'),
      kit.box([0.5, 0.02, 2.4], [0.4, BASE.h + 0.01, 0], 'sand'), // path in front
      kit.box([BODY.w + 0.08, 0.1, BODY.d + 0.08], [BODY.x, BASE.h + 0.05, 0], 'stone'),
      kit.box([BODY.w, BODY.h, BODY.d], [BODY.x, BASE.h + BODY.h / 2, 0], 'cream'),
      kit.box([BODY.w + 0.02, 0.06, BODY.d + 0.02], [BODY.x, WALL_TOP - 0.03, 0], 'woodDark'), // beam under the eaves
      ...gableRoof(kit, { at: [BODY.x, WALL_TOP, 0], length: BODY.d + 0.3, width: BODY.w, rise: ROOF.rise, eave: ROOF.eave, color: 'terracotta', ridge: 'redDark' }),
      kit.wedge([BODY.w, ROOF.rise, BODY.d], [BODY.x, WALL_TOP + ROOF.rise / 2, 0], 'cream'),
      kit.box([0.26, 0.5, 0.26], [BODY.x - 0.3, WALL_TOP + 0.5, -0.6], 'stoneDark'), // chimney
      kit.box([0.32, 0.06, 0.32], [BODY.x - 0.3, WALL_TOP + 0.78, -0.6], 'stone'),
      // the huge door with a round knob and a stone step
      kit.box([0.3, 0.04, 0.8], [FRONT + 0.15, BASE.h + 0.02, 0], 'stone'),
      ...door(kit, { at: [FRONT, BASE.h + 0.1 + 0.5, 0], facing: 'x+', w: 0.62, h: 0.9, color: 'woodDark' }),
      kit.sphere(0.06, [FRONT + 0.06, BASE.h + 0.55, 0.2], 'brass', { detail: 0 }),
      ...wallPanel(kit, { at: [FRONT, WALL_TOP - 0.14, 0], facing: 'x+', w: 0.8, h: 0.08, depth: 0.03, color: 'sunYellow' }),
    ];
    // oversized windows (they glow warm at night)
    const win = (x: number, z: number, facing: 'x+' | 'x-' | 'z+' | 'z-') =>
      glassWindow(kit, { at: [x, 0.75, z], facing, w: 0.36, h: 0.4, frame: 'woodDark' });
    parts.push(...win(FRONT, -0.78, 'x+'), ...win(FRONT, 0.78, 'x+'), ...win(BODY.x - BODY.w / 2, -0.5, 'x-'), ...win(BODY.x - BODY.w / 2, 0.5, 'x-'));
    for (const x of [BODY.x - 0.28, BODY.x + 0.28]) parts.push(...win(x, BODY.d / 2, 'z+'), ...win(x, -BODY.d / 2, 'z-'));

    // giant boot (z = +1.1): sole, foot, leg, toe cap, cuff
    const bx = 0.72;
    const bz = 1.05;
    parts.push(
      kit.box([0.34, 0.05, 0.5], [bx + 0.03, BASE.h + 0.025, bz], 'bark'),
      kit.box([0.3, 0.2, 0.46], [bx + 0.03, BASE.h + 0.15, bz], 'wood'),
      kit.sphere(0.17, [bx + 0.1, BASE.h + 0.16, bz], 'wood', { scale: [1, 0.9, 1.3] }),
      kit.box([0.24, 0.4, 0.26], [bx - 0.02, BASE.h + 0.4, bz - 0.1], 'wood'),
      kit.box([0.28, 0.06, 0.3], [bx - 0.02, BASE.h + 0.63, bz - 0.1], 'woodDark'),
      kit.box([0.04, 0.2, 0.26], [bx + 0.15, BASE.h + 0.4, bz - 0.1], 'sunYellow'), // buckle strap
    );
    // giant chair (z = -1.1): seat, back and four chunky legs
    const cx = 0.7;
    const cz = -1.05;
    parts.push(kit.box([0.4, 0.08, 0.42], [cx, BASE.h + 0.42, cz], 'woodDark'), kit.box([0.06, 0.5, 0.42], [cx - 0.17, BASE.h + 0.7, cz], 'woodDark'));
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) parts.push(kit.box([0.07, 0.38, 0.07], [cx + sx * 0.16, BASE.h + 0.19, cz + sz * 0.17], 'wood'));
    }
    parts.push(kit.box([0.34, 0.04, 0.36], [cx + 0.01, BASE.h + 0.48, cz], 'red')); // seat cushion
    return kit.finish(parts);
  },
};
