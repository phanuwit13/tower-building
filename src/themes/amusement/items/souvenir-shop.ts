import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { door, gableRoof, glassWindow, rod, wallPanel } from '../../../models/parts';

// A small gift shop: striped awning, a big shop window with a shelf of plushies and a bunch of balloons.
const BASE = { w: 1.94, h: 0.05, d: 1.94 };
const BODY = { x: -0.2, w: 1.2, d: 1.5, h: 0.8 };
const WALL_TOP = BASE.h + BODY.h;
const FRONT = BODY.x + BODY.w / 2;
const STRIPES: PaletteColor[] = ['red', 'white', 'red', 'white', 'red'];

/** A plush bear on a shelf: round body, head and two ears. */
const plush = (kit: Parameters<ItemModel['build']>[0], x: number, y: number, z: number, color: PaletteColor): Part[] => [
  kit.sphere(0.07, [x, y + 0.06, z], color, { detail: 0 }),
  kit.sphere(0.055, [x, y + 0.155, z], color, { detail: 0 }),
  kit.sphere(0.02, [x, y + 0.2, z - 0.04], color, { detail: 0 }),
  kit.sphere(0.02, [x, y + 0.2, z + 0.04], color, { detail: 0 }),
];

/** ร้านของที่ระลึก: a gift shop with plushies and balloons. */
export const item: ItemModel = {
  id: 'souvenir-shop',
  name: 'ร้านของที่ระลึก',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'sand'),
      kit.box([BODY.w, BODY.h, BODY.d], [BODY.x, BASE.h + BODY.h / 2, 0], 'pink'),
      kit.box([BODY.w + 0.04, 0.05, BODY.d + 0.04], [BODY.x, BASE.h + 0.025, 0], 'white'),
      ...gableRoof(kit, { at: [BODY.x, WALL_TOP, 0], length: BODY.d + 0.2, width: BODY.w, rise: 0.4, eave: 0.06, color: 'blue', ridge: 'navy' }),
      kit.wedge([BODY.w, 0.4, BODY.d], [BODY.x, WALL_TOP + 0.2, 0], 'pink'),
      // door, big shop window and a sign on the roof line
      ...door(kit, { at: [FRONT, BASE.h + 0.25, -0.5], facing: 'x+', w: 0.3, h: 0.46, color: 'blue', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [FRONT, 0.48, 0.3], facing: 'x+', w: 0.6, h: 0.3, frame: 'white', panes: 3 }),
      ...wallPanel(kit, { at: [FRONT, WALL_TOP - 0.07, 0], facing: 'x+', w: 1.2, h: 0.1, depth: 0.03, color: 'sunYellow' }),
      // shelf under the window with plushies, and a gift box
      kit.box([0.2, 0.04, 0.7], [FRONT + 0.1, BASE.h + 0.2, 0.3], 'wood'),
      kit.box([0.04, 0.2, 0.7], [FRONT + 0.03, BASE.h + 0.1, 0.3], 'woodDark'),
      kit.box([0.1, 0.09, 0.1], [FRONT + 0.1, BASE.h + 0.265, 0.55], 'red'),
      kit.box([0.1, 0.02, 0.025], [FRONT + 0.1, BASE.h + 0.315, 0.55], 'sunYellow'),
    ];
    parts.push(...plush(kit, FRONT + 0.1, BASE.h + 0.22, 0.05, 'orange'), ...plush(kit, FRONT + 0.1, BASE.h + 0.22, 0.3, 'white'));
    // striped awning over the shop front: slats tilted down and out
    const slat = 0.3;
    STRIPES.forEach((c, i) => {
      parts.push(kit.box([0.34, 0.03, slat], [FRONT + 0.14, 0.72, -0.6 + slat * (i + 0.5)], c, { rotate: [0, 0, -0.45] }));
    });
    // balloon bunch tied to the front-right corner
    const bx = FRONT + 0.3;
    const bz = -0.78;
    const balloons: Array<[PaletteColor, number, number, number]> = [['red', 0, 0.95, 0], ['sunYellow', 0.08, 1.05, 0.1], ['blue', -0.02, 1.03, -0.08], ['leaf', 0.06, 0.88, -0.1]];
    parts.push(kit.cylinder(0.03, 0.04, 0.1, [bx, BASE.h + 0.05, bz], 'stoneDark', { segments: 6 }));
    for (const [color, dx, y, dz] of balloons) {
      parts.push(
        kit.sphere(0.09, [bx + dx, y, bz + dz], color, { detail: 1, scale: [1, 1.15, 1] }),
        rod(kit, [bx, BASE.h + 0.1, bz], [bx + dx, y - 0.1, bz + dz], 0.007, 'white', { segments: 4 }),
      );
    }
    // windows on the other sides
    parts.push(
      ...glassWindow(kit, { at: [BODY.x - BODY.w / 2, 0.5, 0], facing: 'x-', w: 0.5, h: 0.3, frame: 'white' }),
      ...glassWindow(kit, { at: [BODY.x, 0.5, BODY.d / 2], facing: 'z+', w: 0.4, h: 0.3, frame: 'white' }),
      ...glassWindow(kit, { at: [BODY.x, 0.5, -BODY.d / 2], facing: 'z-', w: 0.4, h: 0.3, frame: 'white' }),
    );
    return kit.finish(parts);
  },
};
