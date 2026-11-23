import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A map board on two posts, tilted back towards the camera. The map is blocks of colour: lawn, a
// river, a white path and little coloured buildings. No text.
const TILT = 0.3;
const CENTRE = { x: 0.0, y: 0.95 };
const BOARD = { t: 0.07, h: 0.62, w: 0.98 };
const COS = Math.cos(TILT);
const SIN = Math.sin(TILT);

/** ป้ายแผนที่สวนสนุก: a board on two posts showing a colourful block map. */
export const item: ItemModel = {
  id: 'park-map',
  name: 'ป้ายแผนที่สวนสนุก',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.5, 0.03, 0.98], [0, 0.015, 0], 'stone'),
      kit.cylinder(0.035, 0.035, CENTRE.y, [0, CENTRE.y / 2, -0.38], 'wood', { segments: 6 }),
      kit.cylinder(0.035, 0.035, CENTRE.y, [0, CENTRE.y / 2, 0.38], 'wood', { segments: 6 }),
      kit.box([BOARD.t, BOARD.h, BOARD.w], [CENTRE.x, CENTRE.y, 0], 'woodDark', { rotate: [0, 0, TILT] }),
    ];
    // a layer on the board face: local x is out of the board (0.035 is the face, so layers start at 0.045)
    const layer = (n: number, size: [number, number], at: [number, number], color: PaletteColor) => {
      const lx = BOARD.t / 2 + 0.01 * n;
      const ly = at[0];
      parts.push(kit.box([0.01, size[0], size[1]], [CENTRE.x + lx * COS - ly * SIN, CENTRE.y + lx * SIN + ly * COS, at[1]], color, { rotate: [0, 0, TILT] }));
    };
    layer(1, [0.52, 0.88], [0, 0], 'lime');
    layer(2, [0.1, 0.88], [-0.14, 0], 'skyBlue'); // river across the bottom
    layer(2, [0.46, 0.08], [0.0, 0.1], 'white'); // path
    layer(3, [0.14, 0.16], [0.16, -0.28], 'red');
    layer(3, [0.14, 0.14], [0.06, 0.32], 'sunYellow');
    layer(3, [0.12, 0.2], [0.18, 0.12], 'purple');
    layer(3, [0.1, 0.1], [0.0, -0.2], 'orange');
    layer(3, [0.1, 0.1], [-0.2, 0.24], 'pink');
    layer(3, [0.1, 0.1], [-0.2, -0.3], 'leaf');
    layer(3, [0.08, 0.08], [0.2, 0.34], 'leafDark');
    return kit.finish(parts);
  },
};
