import type { ItemModel } from '../../../models/contract';
import type { Part, PartOpts } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A long raised wooden planter (1×2, long side along z): soil, leafy bushes and flowers that sway together about the soil line.
const BOX = { w: 0.5, d: 1.8, y0: 0.06, h: 0.28 };
const SOIL_Y = BOX.y0 + BOX.h;
const SWAY: NonNullable<PartOpts['motion']> = { kind: 'sway', pivot: [0, SOIL_Y + 0.02, 0], amount: 0.12 };
const FLOWERS: PaletteColor[] = ['pink', 'sunYellow', 'red', 'purple', 'orange', 'pink', 'sunYellow'];

/** กระบะต้นไม้: a raised planter with flowers. */
export const item: ItemModel = {
  id: 'planter-box',
  name: 'กระบะต้นไม้',
  category: 'nature',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BOX.w, BOX.h, BOX.d], [0, BOX.y0 + BOX.h / 2, 0], 'wood'),
      kit.box([BOX.w + 0.06, 0.05, BOX.d + 0.06], [0, SOIL_Y + 0.0, 0], 'woodDark'),
      kit.box([BOX.w - 0.1, 0.03, BOX.d - 0.1], [0, SOIL_Y + 0.03, 0], 'bark'),
      // feet
      kit.box([0.08, BOX.y0, 0.08], [-0.17, BOX.y0 / 2, -0.8], 'woodDark'),
      kit.box([0.08, BOX.y0, 0.08], [0.17, BOX.y0 / 2, -0.8], 'woodDark'),
      kit.box([0.08, BOX.y0, 0.08], [-0.17, BOX.y0 / 2, 0.8], 'woodDark'),
      kit.box([0.08, BOX.y0, 0.08], [0.17, BOX.y0 / 2, 0.8], 'woodDark'),
      // a slat line along the front (+x)
      kit.box([0.02, 0.03, BOX.d - 0.1], [BOX.w / 2 + 0.01, BOX.y0 + 0.14, 0], 'woodDark'),
    ];
    const n = FLOWERS.length;
    for (let i = 0; i < n; i++) {
      const z = -0.78 + (i * 1.56) / (n - 1);
      const x = i % 2 ? 0.07 : -0.07;
      parts.push(
        kit.sphere(0.13, [x, SOIL_Y + 0.14, z], i % 2 ? 'leaf' : 'leafDark', { detail: 0, scale: [1, 0.8, 1], motion: SWAY }),
        kit.cylinder(0.012, 0.012, 0.2, [-x, SOIL_Y + 0.13, z + 0.02], 'leafDark', { segments: 4, motion: SWAY }),
        kit.sphere(0.075, [-x, SOIL_Y + 0.27, z + 0.02], FLOWERS[i], { detail: 0, motion: SWAY }),
        kit.sphere(0.03, [-x, SOIL_Y + 0.3, z + 0.02], 'sunYellow', { detail: 0, motion: SWAY }),
      );
    }
    return kit.finish(parts);
  },
};
