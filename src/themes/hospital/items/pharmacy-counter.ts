import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A long counter along z (front +x) with a glass window above it, and a shelf wall behind (-x) holding
// colourful boxes. The sign is a green plus in a white circle on top of the shelves. No text, no pills.
const TOP_Y = 0.62;
const COUNTER = { x: 0.55, w: 0.8, len: 2.8 };
const WINDOW_X = 0.3;
const SHELF = { x: -0.75, d: 0.4, h: 1.2 };
const BOX_COLOURS: PaletteColor[] = ['orange', 'skyBlue', 'pink', 'sunYellow', 'lime', 'purple', 'mint', 'blue'];

/** ห้องจ่ายยา: counter with a glass window, shelves of colourful boxes and a green plus-in-circle sign. */
export const item: ItemModel = {
  id: 'pharmacy-counter',
  name: 'ห้องจ่ายยา',
  category: 'facility',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [];
    // counter: plinth, cream body, teal top, mint front panels
    parts.push(
      kit.box([COUNTER.w + 0.04, 0.04, COUNTER.len], [COUNTER.x, 0.02, 0], 'stoneDark'),
      kit.box([COUNTER.w, TOP_Y - 0.08, COUNTER.len - 0.04], [COUNTER.x, 0.04 + (TOP_Y - 0.08) / 2, 0], 'cream'),
      kit.box([COUNTER.w + 0.08, 0.04, COUNTER.len], [COUNTER.x, TOP_Y - 0.02, 0], 'teal'),
    );
    for (const z of [-0.9, 0, 0.9]) parts.push(kit.box([0.02, 0.36, 0.7], [COUNTER.x + COUNTER.w / 2 + 0.01, 0.3, z], 'mint'));

    // glass window: frame posts, header, two panes with a service gap in the middle and a yellow tray
    const gx = WINDOW_X;
    parts.push(
      kit.box([0.06, 0.06, COUNTER.len - 0.1], [gx, 1.13, 0], 'teal'),
      kit.box([0.14, 0.02, 0.5], [gx + 0.03, TOP_Y + 0.01, 0], 'sunYellow'),
    );
    for (const z of [-1.35, -0.25, 0.25, 1.35]) parts.push(kit.box([0.06, 0.48, 0.06], [gx, TOP_Y + 0.24, z], 'teal'));
    for (const z of [-0.8, 0.8]) parts.push(kit.box([0.02, 0.45, 1.04], [gx, TOP_Y + 0.25, z], 'skyBlue', { glow: 'brass', light: 'window' }));

    // things on the counter, in front of the window: colourful boxes and bottles
    const front = [0.6, 0.8];
    [-1.1, -0.65, 0.7, 1.15].forEach((z, i) => {
      parts.push(kit.box([0.16, 0.1 + (i % 2) * 0.05, 0.2], [front[i % 2], TOP_Y + 0.07, z], BOX_COLOURS[(i * 3) % 8]));
    });
    for (const [z, c] of [[-0.35, 'leaf'], [0.4, 'orange']] as const) {
      parts.push(
        kit.cylinder(0.06, 0.06, 0.14, [0.72, TOP_Y + 0.09, z], 'skyBlue', { segments: 8 }),
        kit.cylinder(0.04, 0.04, 0.04, [0.72, TOP_Y + 0.18, z], c, { segments: 8 }),
      );
    }

    // shelf wall: back, sides, boards
    parts.push(
      kit.box([0.04, SHELF.h, 2.8], [SHELF.x - SHELF.d / 2 + 0.02, SHELF.h / 2, 0], 'wood'),
      kit.box([SHELF.d, 0.06, 2.8], [SHELF.x, 0.03, 0], 'woodDark'),
      kit.box([SHELF.d, 0.04, 2.8], [SHELF.x, SHELF.h - 0.02, 0], 'woodDark'),
    );
    for (const z of [-1.39, 1.39]) parts.push(kit.box([SHELF.d, SHELF.h, 0.04], [SHELF.x, SHELF.h / 2, z], 'woodDark'));
    const levels = [0.06, 0.45, 0.84];
    levels.forEach((y, li) => {
      if (li > 0) parts.push(kit.box([SHELF.d, 0.04, 2.76], [SHELF.x, y - 0.02, 0], 'woodDark'));
      for (let i = 0; i < 12; i++) {
        const z = -1.3 + i * 0.236;
        const h = 0.2 + ((i + li) % 3) * 0.06;
        parts.push(kit.box([0.22, h, 0.19], [SHELF.x + 0.04, y + h / 2, z], BOX_COLOURS[(i + li * 3) % 8]));
      }
    });

    // sign: green ring, white disc, green plus, on a short post above the shelves
    const sx = SHELF.x + 0.02;
    parts.push(
      kit.box([0.08, 0.1, 0.08], [SHELF.x, SHELF.h + 0.05, 0], 'stoneDark'),
      kit.cylinder(0.2, 0.2, 0.04, [sx, 1.38, 0], 'leaf', { segments: 16, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.16, 0.16, 0.02, [sx + 0.025, 1.38, 0], 'white', { segments: 16, rotate: [0, 0, Math.PI / 2] }),
      kit.box([0.02, 0.22, 0.06], [sx + 0.04, 1.38, 0], 'leaf'),
      kit.box([0.02, 0.06, 0.22], [sx + 0.04, 1.38, 0], 'leaf'),
    );
    return kit.finish(parts);
  },
};
