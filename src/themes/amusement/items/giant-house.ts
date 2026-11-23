import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, gableRoof, glassWindow } from '../../../models/parts';

// A fairy-tale giant's cottage: an oversized door and windows, a giant boot and a giant chair outside.
// Front faces +x. (A storybook giant, not a temple guardian.)
const BASE = { w: 1.94, h: 0.05, d: 2.94 };
const BODY = { x: -0.35, w: 1.0, d: 2.2, h: 1.2 };
const WALL_TOP = BASE.h + BODY.h;
const FRONT = BODY.x + BODY.w / 2;
const DOOR = { w: 0.56, h: 1.1, y: 0.15 + 0.55 }; // from the plinth top to the eaves
const ROOF = { rise: 0.5, eave: 0.05 };

/** บ้านยักษ์: a giant's cottage with a huge door, a boot and a chair. */
export const item: ItemModel = {
  id: 'giant-house',
  name: 'บ้านยักษ์',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'leaf'),
      kit.box([0.5, 0.02, 2.4], [0.5, BASE.h + 0.01, 0], 'sand'), // path in front
      kit.box([BODY.w + 0.08, 0.1, BODY.d + 0.08], [BODY.x, BASE.h + 0.05, 0], 'stone'),
      kit.box([BODY.w, BODY.h, BODY.d], [BODY.x, BASE.h + BODY.h / 2, 0], 'cream'),
      kit.box([BODY.w + 0.02, 0.06, BODY.d + 0.02], [BODY.x, WALL_TOP - 0.03, 0], 'woodDark'), // beam under the eaves
      ...gableRoof(kit, { at: [BODY.x, WALL_TOP, 0], length: BODY.d + 0.3, width: BODY.w, rise: ROOF.rise, eave: ROOF.eave, color: 'terracotta', ridge: 'redDark' }),
      kit.wedge([BODY.w, ROOF.rise, BODY.d], [BODY.x, WALL_TOP + ROOF.rise / 2, 0], 'cream'),
      kit.box([0.26, 0.5, 0.26], [BODY.x - 0.1, WALL_TOP + 0.5, -0.6], 'stoneDark'), // chimney
      kit.box([0.32, 0.06, 0.32], [BODY.x - 0.1, WALL_TOP + 0.78, -0.6], 'stone'),
      // the huge door, the full height of the wall (sits on the plinth), with a big round knob and a stone step
      kit.box([0.3, 0.04, 0.8], [FRONT + 0.15, BASE.h + 0.02 + 0.1, 0], 'stone'),
      ...door(kit, { at: [FRONT, DOOR.y, 0], facing: 'x+', w: DOOR.w, h: DOOR.h, color: 'woodDark' }),
      kit.sphere(0.07, [FRONT + 0.07, DOOR.y, 0.2], 'brass', { detail: 0 }),
      kit.box([0.03, 0.05, 0.03], [FRONT + 0.04, DOOR.y - 0.1, 0.2], 'charcoal'), // keyhole
    ];
    // oversized windows (they glow warm at night)
    const win = (x: number, z: number, facing: 'x+' | 'x-' | 'z+' | 'z-') =>
      glassWindow(kit, { at: [x, 0.85, z], facing, w: 0.36, h: 0.5, frame: 'woodDark' });
    parts.push(...win(FRONT, -0.75, 'x+'), ...win(FRONT, 0.75, 'x+'), ...win(BODY.x - BODY.w / 2, -0.5, 'x-'), ...win(BODY.x - BODY.w / 2, 0.5, 'x-'));
    for (const x of [BODY.x - 0.22, BODY.x + 0.22]) parts.push(...win(x, BODY.d / 2, 'z+'), ...win(x, -BODY.d / 2, 'z-'));

    // giant boot (z = +1.0), taller than the eaves: sole, foot, toe cap, leg, cuff and buckle strap
    const bx = 0.58;
    const bz = 1.0;
    const Y0 = BASE.h;
    parts.push(
      kit.box([0.5, 0.07, 0.7], [bx, Y0 + 0.035, bz], 'bark'),
      kit.box([0.46, 0.3, 0.64], [bx, Y0 + 0.22, bz], 'wood'),
      kit.sphere(0.22, [bx + 0.12, Y0 + 0.2, bz], 'wood', { scale: [1, 0.9, 1.4] }),
      kit.box([0.34, 1.0, 0.36], [bx - 0.08, Y0 + 0.87, bz - 0.12], 'wood'),
      kit.box([0.4, 0.14, 0.42], [bx - 0.08, Y0 + 1.4, bz - 0.12], 'woodDark'),
      kit.box([0.04, 0.4, 0.3], [bx + 0.1, Y0 + 0.9, bz - 0.12], 'sunYellow'),
    );
    // giant chair (z = -1.0): back taller than the eaves, thick legs, red cushion
    const cx = 0.6;
    const cz = -1.0;
    parts.push(
      kit.box([0.5, 0.1, 0.52], [cx, Y0 + 0.7, cz], 'woodDark'),
      kit.box([0.08, 0.85, 0.52], [cx - 0.21, Y0 + 1.17, cz], 'woodDark'),
      kit.box([0.14, 0.14, 0.14], [cx - 0.21, Y0 + 1.66, cz - 0.2], 'wood'), // finials
      kit.box([0.14, 0.14, 0.14], [cx - 0.21, Y0 + 1.66, cz + 0.2], 'wood'),
      kit.box([0.42, 0.06, 0.44], [cx + 0.01, Y0 + 0.78, cz], 'red'),
    );
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) parts.push(kit.box([0.09, 0.65, 0.09], [cx + sx * 0.19, Y0 + 0.325, cz + sz * 0.2], 'wood'));
    }
    return kit.finish(parts);
  },
};
