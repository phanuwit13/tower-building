import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A long glass-fronted cabinet (long side along z, front +x): a teal base with two doors, two lit-looking
// shelves of colourful boxes and bottles, and a round sign on top with a green plus in a circle.
const W = 0.6;
const LEN = 1.8;
const BASE_H = 0.42;
const TOP = 1.1;
const BOX_COLORS: readonly PaletteColor[] = ['pink', 'sunYellow', 'orange', 'purple', 'lime', 'blue', 'red', 'mint'];

/** ตู้ยา: glass cabinet with colourful boxes and a green plus-in-circle sign. */
export const item: ItemModel = {
  id: 'medicine-cabinet',
  name: 'ตู้ยา',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([W, BASE_H, LEN], [0, BASE_H / 2, 0], 'teal'),
      kit.box([W + 0.04, 0.05, LEN + 0.04], [0, BASE_H + 0.025, 0], 'woodDark'),
      kit.box([W + 0.04, 0.07, LEN + 0.04], [0, TOP - 0.035, 0], 'teal'),
      kit.box([0.03, TOP - BASE_H - 0.12, LEN - 0.1], [-W / 2 + 0.03, (BASE_H + 0.05 + TOP - 0.07) / 2, 0], 'glassBlue'), // back pane
    ];
    // base doors on the +x face with round knobs
    for (const zc of [-0.45, 0.45]) {
      parts.push(
        kit.box([0.03, BASE_H - 0.1, 0.8], [W / 2 + 0.015, BASE_H / 2, zc], 'mint'),
        kit.sphere(0.035, [W / 2 + 0.045, BASE_H / 2, zc + (zc < 0 ? 0.3 : -0.3)], 'sunYellow', { detail: 0 }),
      );
    }
    // frame posts, shelves
    for (const sx of [-W / 2 + 0.03, W / 2 - 0.03]) {
      for (const sz of [-LEN / 2 + 0.03, 0, LEN / 2 - 0.03]) parts.push(kit.box([0.05, TOP - BASE_H - 0.12, 0.05], [sx, (BASE_H + 0.05 + TOP - 0.07) / 2, sz], 'teal'));
    }
    const shelfY = (BASE_H + 0.05 + TOP - 0.07) / 2 + 0.02;
    parts.push(kit.box([W - 0.1, 0.03, LEN - 0.1], [0, shelfY, 0], 'woodDark'));
    // boxes and bottles on both shelves
    const rows = [BASE_H + 0.05, shelfY + 0.015];
    rows.forEach((y0, r) => {
      for (let i = 0; i < 7; i++) {
        const z = -0.78 + i * 0.26;
        const col = BOX_COLORS[(i + r * 3) % BOX_COLORS.length];
        if ((i + r) % 2 === 0) {
          parts.push(kit.box([0.14, 0.15 + (i % 3) * 0.02, 0.2], [0.02, y0 + 0.08, z], col), kit.box([0.15, 0.03, 0.1], [0.02, y0 + 0.14 + (i % 3) * 0.01, z], 'white'));
        } else {
          parts.push(kit.cylinder(0.07, 0.07, 0.16, [0.0, y0 + 0.08, z], col, { segments: 8 }), kit.cylinder(0.035, 0.035, 0.05, [0.0, y0 + 0.185, z], 'white', { segments: 8 }));
        }
      }
    });
    // the sign: a round disc on a short stem with a green plus
    const sy = TOP + 0.25;
    parts.push(
      kit.box([0.06, 0.14, 0.06], [0, TOP + 0.07, 0], 'stoneDark'),
      kit.cylinder(0.22, 0.22, 0.05, [0.0, sy, 0], 'white', { segments: 16, rotate: [0, 0, Math.PI / 2] }),
      kit.torus(0.22, 0.025, [0.03, sy, 0], 'leafDark', { radialSegments: 4, tubularSegments: 16, rotate: [0, Math.PI / 2, 0] }),
      kit.box([0.02, 0.3, 0.09], [0.035, sy, 0], 'leaf'),
      kit.box([0.02, 0.09, 0.3], [0.035, sy, 0], 'leaf'),
      kit.box([0.05, 0.3, 0.09], [-0.035, sy, 0], 'leaf'), // plus on the back too
    );
    return kit.finish(parts);
  },
};
