import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// The hospital food corner (2×3, long side along z, front on +x): a food counter along the back (-x) with a
// lit menu board of five food pictures (no text), snacks on top, and three round tables with two chairs each.
const COUNTER = { x: -0.72, w: 0.5, h: 0.62, len: 2.6 };
const BOARD = { x: -0.9, y: 1.12, h: 0.5, len: 2.0 };
const CARD_Z = [-0.8, -0.4, 0, 0.4, 0.8];
const CARD_X = -0.86;
const ICON_X = -0.84;
const TABLE_X = 0.3;
const TABLE_ZS = [-1.0, 0, 1.0];
const CLOTHS: PaletteColor[] = ['pink', 'sunYellow', 'mint'];
const SEATS: PaletteColor[] = ['orange', 'teal', 'purple'];

/** โซนอาหาร: a food counter with a lit picture menu, tables and chairs. */
export const item: ItemModel = {
  id: 'hospital-cafe',
  name: 'โซนอาหาร',
  category: 'food',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      // counter: body, white top plate (top at 0.62), colourful panels on the +x face
      kit.box([COUNTER.w, COUNTER.h - 0.04, COUNTER.len], [COUNTER.x, (COUNTER.h - 0.04) / 2, 0], 'cream'),
      kit.box([COUNTER.w + 0.06, 0.04, COUNTER.len + 0.06], [COUNTER.x, COUNTER.h - 0.02, 0], 'white'),
    ];
    const FRONT: PaletteColor[] = ['pink', 'sunYellow', 'mint', 'orange', 'lime', 'skyBlue'];
    FRONT.forEach((c, i) => parts.push(kit.box([0.02, 0.3, 0.36], [COUNTER.x + COUNTER.w / 2 + 0.01, 0.3, -1.0 + i * 0.4], c)));

    // menu board on two posts, five lit cards with food pictures
    parts.push(
      kit.box([0.05, 0.25, 0.05], [BOARD.x, 0.745, -0.9], 'charcoal'),
      kit.box([0.05, 0.25, 0.05], [BOARD.x, 0.745, 0.9], 'charcoal'),
      kit.box([0.06, BOARD.h, BOARD.len], [BOARD.x, BOARD.y, 0], 'charcoal'),
    );
    CARD_Z.forEach((z) => parts.push(kit.box([0.02, 0.4, 0.34], [CARD_X, BOARD.y, z], 'cream', { glow: 'windowWarm', light: 'window' })));
    parts.push(
      // apple
      kit.sphere(0.09, [ICON_X, 1.1, -0.8], 'red', { detail: 0 }),
      kit.sphere(0.035, [ICON_X, 1.22, -0.76], 'leaf', { detail: 0 }),
      // burger
      kit.box([0.04, 0.06, 0.24], [ICON_X, 1.02, -0.4], 'orange'),
      kit.box([0.04, 0.04, 0.26], [ICON_X, 1.07, -0.4], 'lime'),
      kit.box([0.04, 0.05, 0.24], [ICON_X, 1.115, -0.4], 'bark'),
      kit.sphere(0.12, [ICON_X, 1.14, -0.4], 'orange', { detail: 0, scale: [0.3, 0.6, 1] }),
      // drink with a straw
      kit.box([0.04, 0.18, 0.12], [ICON_X, 1.06, 0], 'white'),
      kit.box([0.045, 0.07, 0.12], [ICON_X, 1.04, 0], 'orange'),
      kit.box([0.045, 0.03, 0.15], [ICON_X, 1.165, 0], 'red'),
      kit.box([0.025, 0.12, 0.025], [ICON_X, 1.24, 0.03], 'pink'),
      // ice cream
      kit.cylinder(0.07, 0, 0.17, [ICON_X, 1.02, 0.4], 'sand', { segments: 8 }),
      kit.sphere(0.075, [ICON_X, 1.14, 0.4], 'pink', { detail: 0 }),
      kit.sphere(0.06, [ICON_X, 1.22, 0.4], 'mint', { detail: 0 }),
      // cupcake
      kit.cylinder(0.08, 0.06, 0.1, [ICON_X, 1.0, 0.8], 'terracotta', { segments: 8 }),
      kit.sphere(0.09, [ICON_X, 1.1, 0.8], 'pink', { detail: 0, scale: [0.8, 0.8, 1] }),
      kit.sphere(0.028, [ICON_X, 1.19, 0.8], 'red', { detail: 0 }),
    );

    // on the counter: a cake under a glass dome, a fruit bowl, a tray of cups, a coffee machine
    parts.push(
      kit.cylinder(0.11, 0.11, 0.04, [-0.7, 0.64, -1.0], 'white', { segments: 8 }),
      kit.cylinder(0.08, 0.08, 0.07, [-0.7, 0.695, -1.0], 'pink', { segments: 8 }),
      kit.dome(0.12, [-0.7, 0.66, -1.0], 'glassBlue', { segments: 8 }),
      kit.cylinder(0.14, 0.08, 0.08, [-0.65, 0.66, -0.45], 'wood', { segments: 8 }),
      kit.sphere(0.055, [-0.68, 0.74, -0.47], 'red', { detail: 0 }),
      kit.sphere(0.055, [-0.62, 0.74, -0.42], 'orange', { detail: 0 }),
      kit.sphere(0.05, [-0.64, 0.77, -0.46], 'lime', { detail: 0 }),
      kit.box([0.3, 0.02, 0.4], [-0.64, 0.63, 0.2], 'teal'),
      kit.box([0.2, 0.26, 0.26], [-0.78, 0.75, 0.95], 'charcoal'),
      kit.box([0.22, 0.04, 0.28], [-0.78, 0.89, 0.95], 'sunYellow'),
      kit.cylinder(0.035, 0.03, 0.06, [-0.62, 0.67, 0.95], 'white', { segments: 8 }),
    );
    (['pink', 'skyBlue', 'lime', 'orange'] as PaletteColor[]).forEach((c, i) =>
      parts.push(kit.cylinder(0.035, 0.028, 0.06, [-0.7 + (i % 2) * 0.14, 0.67, 0.08 + Math.floor(i / 2) * 0.24], c, { segments: 8 })),
    );

    // tables (cloth top at 0.50) with a plate, a pastry and a cup; two chairs each
    TABLE_ZS.forEach((tz, t) => {
      parts.push(
        kit.cylinder(0.15, 0.15, 0.03, [TABLE_X, 0.015, tz], 'charcoal', { segments: 8 }),
        kit.cylinder(0.04, 0.04, 0.44, [TABLE_X, 0.25, tz], 'stone', { segments: 8 }),
        kit.cylinder(0.27, 0.27, 0.04, [TABLE_X, 0.48, tz], CLOTHS[t], { segments: 12 }),
        kit.cylinder(0.09, 0.09, 0.02, [TABLE_X - 0.08, 0.51, tz], 'white', { segments: 8 }),
        kit.sphere(0.05, [TABLE_X - 0.08, 0.545, tz], t === 1 ? 'orange' : 'terracotta', { detail: 0 }),
        kit.cylinder(0.04, 0.032, 0.06, [TABLE_X + 0.1, 0.53, tz + 0.08], 'white', { segments: 8 }),
      );
      for (const s of [-1, 1]) {
        const cx = TABLE_X + s * 0.4;
        const c = SEATS[(t + (s > 0 ? 1 : 0)) % 3];
        parts.push(kit.box([0.28, 0.04, 0.28], [cx, 0.29, tz], c), kit.box([0.04, 0.28, 0.28], [cx + s * 0.12, 0.48, tz], c));
        for (const dx of [-0.11, 0.11]) for (const dz of [-0.11, 0.11]) parts.push(kit.box([0.035, 0.27, 0.035], [cx + dx, 0.135, tz + dz], 'charcoal'));
      }
    });
    return kit.finish(parts);
  },
};
