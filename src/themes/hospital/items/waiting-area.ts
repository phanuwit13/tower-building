import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// Two rows of joined seats (2×3, long side along z) facing each other across a low table of magazines,
// with a floor screen at the -z end that shows a sun picture. Row A (x-) faces +x, row B (x+) faces -x.
const SEAT_Y = 0.31;
const BACK_TOP = 0.62;
const SEATS = 3;
const SEAT_W = 0.86; // each seat's width along z
const TABLE_Y = 0.42;

/** ที่นั่งรอ: rows of joined seats round a low table with magazines and a sun screen. */
export const item: ItemModel = {
  id: 'waiting-area',
  name: 'ที่นั่งรอ',
  category: 'seating',
  footprint: { w: 2, d: 3 },
  build: (kit: StyleKit) => {
    const parts: Part[] = [];
    const len = SEATS * SEAT_W;
    // dir +1: backrest at the -x side of the row (faces +x)
    const row = (cx: number, dir: 1 | -1, cushion: PaletteColor, back: PaletteColor): void => {
      const bx = cx - dir * 0.18; // backrest x
      parts.push(
        kit.box([0.5, 0.05, len], [cx, 0.025, 0], 'charcoal'), // base rail
        kit.box([0.08, SEAT_Y - 0.1, len - 0.1], [cx, 0.05 + (SEAT_Y - 0.15) / 2, 0], 'charcoal'),
        kit.box([0.44, 0.06, len], [cx + dir * 0.02, SEAT_Y - 0.03, 0], cushion),
        kit.box([0.08, BACK_TOP - SEAT_Y, len], [bx - dir * 0.02, (BACK_TOP + SEAT_Y) / 2, 0], back),
      );
      for (let i = 0; i <= SEATS; i++) {
        const z = -len / 2 + i * SEAT_W;
        const zz = i === 0 ? z + 0.03 : i === SEATS ? z - 0.03 : z;
        parts.push(kit.box([0.44, 0.04, 0.05], [cx + dir * 0.02, SEAT_Y + 0.005, zz], 'charcoal'));
        if (i === 0 || i === SEATS) parts.push(kit.box([0.4, 0.14, 0.06], [cx + dir * 0.02, SEAT_Y + 0.07, zz], 'charcoal'));
      }
    };
    row(-0.68, 1, 'teal', 'mint');
    row(0.68, -1, 'orange', 'sunYellow');

    // low table with magazines and a cup
    parts.push(
      kit.box([0.6, 0.05, 0.9], [0, TABLE_Y - 0.025, 0.1], 'wood'),
      kit.box([0.1, TABLE_Y - 0.05, 0.1], [0, (TABLE_Y - 0.05) / 2, 0.1], 'woodDark'),
      kit.box([0.4, 0.03, 0.4], [0, 0.015, 0.1], 'woodDark'),
      kit.box([0.22, 0.012, 0.3], [-0.1, TABLE_Y + 0.006, 0.0], 'pink', { rotate: [0, 0.15, 0] }),
      kit.box([0.2, 0.012, 0.28], [-0.1, TABLE_Y + 0.018, 0.0], 'skyBlue', { rotate: [0, -0.1, 0] }),
      kit.box([0.2, 0.012, 0.28], [0.12, TABLE_Y + 0.006, 0.35], 'lime', { rotate: [0, 0.3, 0] }),
      kit.box([0.2, 0.012, 0.28], [0.12, TABLE_Y + 0.018, 0.35], 'sunYellow', { rotate: [0, -0.2, 0] }),
      kit.cylinder(0.04, 0.035, 0.06, [0.15, TABLE_Y + 0.03, -0.15], 'white', { segments: 8 }),
    );

    // floor screen at the -z end, facing +z: sun, cloud and hill
    const sz = -1.25;
    parts.push(
      kit.cylinder(0.18, 0.2, 0.03, [0, 0.015, sz], 'charcoal', { segments: 10 }),
      kit.cylinder(0.04, 0.04, 0.85, [0, 0.445, sz], 'charcoal', { segments: 8 }),
      kit.box([0.7, 0.46, 0.05], [0, 1.1, sz], 'charcoal'),
      kit.box([0.62, 0.38, 0.015], [0, 1.1, sz + 0.03], 'skyBlue', { glow: 'skyBlue', light: 'window' }),
      kit.box([0.62, 0.1, 0.018], [0, 0.95, sz + 0.032], 'lime'),
      kit.sphere(0.09, [0.15, 1.2, sz + 0.04], 'sunYellow', { detail: 0, scale: [1, 1, 0.25] }),
      kit.sphere(0.06, [-0.18, 1.2, sz + 0.04], 'white', { detail: 0, scale: [1.5, 1, 0.25] }),
      kit.sphere(0.05, [-0.1, 1.17, sz + 0.04], 'white', { detail: 0, scale: [1.4, 1, 0.25] }),
    );
    return kit.finish(parts);
  },
};
