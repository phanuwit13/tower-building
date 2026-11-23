import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { gableRoof, glassWindow } from '../../../models/parts';

// An open-sided hall under a big roof: three stalls along the back (-x) and two round tables with stools.
const FLOOR = { w: 1.94, d: 1.94, h: 0.05 };
const POST = { r: 0.05, p: 0.82, top: 0.95 };
const BEAM = 0.07;
const ROOF_TOP = POST.top + BEAM;
const STALL = { x: -0.72, w: 0.32, d: 0.42, h: 0.4 };
const STALL_Z = [-0.55, 0, 0.55];
const STALL_COLORS: PaletteColor[] = ['red', 'blue', 'leaf'];

/** ศูนย์อาหาร: an open food hall with stalls and tables. */
export const item: ItemModel = {
  id: 'food-court',
  name: 'ศูนย์อาหาร',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([FLOOR.w, FLOOR.h, FLOOR.d], [0, FLOOR.h / 2, 0], 'sand')];
    const postH = POST.top - FLOOR.h;
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) parts.push(kit.cylinder(POST.r, POST.r, postH, [sx * POST.p, FLOOR.h + postH / 2, sz * POST.p], 'white', { segments: 6 }));
      parts.push(kit.box([BEAM, BEAM, 2 * POST.p + BEAM], [sx * POST.p, POST.top + BEAM / 2, 0], 'woodDark'));
    }
    parts.push(
      ...gableRoof(kit, { at: [0, ROOF_TOP, 0], length: 1.94, width: 2 * POST.p + BEAM, rise: 0.5, eave: 0.06, color: 'orange', ridge: 'redDark' }),
      kit.box([2 * POST.p + BEAM, BEAM * 0.75, BEAM * 0.75], [0, POST.top + BEAM / 2, 0], 'woodDark'),
      kit.cylinder(0.03, 0.03, 0.5, [0, ROOF_TOP + 0.2, 0], 'woodDark', { segments: 4 }),
      kit.sphere(0.07, [0, ROOF_TOP + 0.55, 0], 'sunYellow', { detail: 0 }),
    );
    // stalls: a counter box, a coloured awning, a glowing window above the counter and a menu sign
    STALL_Z.forEach((z, i) => {
      const color = STALL_COLORS[i];
      const front = STALL.x + STALL.w / 2;
      parts.push(
        kit.box([STALL.w, STALL.h, STALL.d], [STALL.x, FLOOR.h + STALL.h / 2, z], 'cream'),
        kit.box([STALL.w + 0.04, 0.04, STALL.d + 0.04], [STALL.x, FLOOR.h + STALL.h + 0.02, z], color),
        kit.box([0.04, 0.4, STALL.d + 0.04], [STALL.x - STALL.w / 2 + 0.02, FLOOR.h + STALL.h + 0.22, z], 'woodDark'),
        kit.box([0.2, 0.03, STALL.d + 0.1], [front + 0.04, FLOOR.h + STALL.h + 0.4, z], color, { rotate: [0, 0, 0.5] }),
        ...glassWindow(kit, { at: [front, FLOOR.h + 0.2, z], facing: 'x+', w: 0.2, h: 0.16, frame: color }),
        kit.sphere(0.05, [front - 0.03, FLOOR.h + STALL.h + 0.06, z - 0.1], color === 'red' ? 'sunYellow' : 'red', { detail: 0 }), // dish on the counter
      );
    });
    // two round tables with striped stools
    for (const [tx, tz] of [[0.2, -0.45], [0.2, 0.45]]) {
      parts.push(
        kit.cylinder(0.04, 0.04, 0.26, [tx, FLOOR.h + 0.13, tz], 'woodDark', { segments: 6 }),
        kit.cylinder(0.24, 0.24, 0.04, [tx, FLOOR.h + 0.28, tz], 'sunYellow', { segments: 10 }),
      );
      [0, 1, 2, 3].forEach((k) => {
        const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
        parts.push(kit.cylinder(0.07, 0.06, 0.16, [tx + 0.4 * Math.cos(a), FLOOR.h + 0.08, tz + 0.4 * Math.sin(a)], (['red', 'blue', 'leaf', 'pink'] as PaletteColor[])[k], { segments: 6 }));
      });
    }
    // two lamps hanging from the ridge
    for (const z of [-0.45, 0.45]) {
      parts.push(
        kit.cylinder(0.012, 0.012, 0.42, [0.2, 1.09, z], 'charcoal', { segments: 4 }), // from under the roof to the bulb
        kit.sphere(0.05, [0.2, 0.84, z], 'lampWarm', { detail: 0, glow: true, light: 'breathe' }),
      );
    }
    return kit.finish(parts);
  },
};
