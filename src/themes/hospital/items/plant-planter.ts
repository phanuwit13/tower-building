import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A long planter box of green plants (1×2, long side along z, front on +x). Still: nothing sways indoors.
const BOX = { w: 0.5, h: 0.32, len: 1.9 };

/** กระบะต้นไม้: a long wooden planter with a row of bushy plants and a few flowers. */
export const item: ItemModel = {
  id: 'plant-planter',
  name: 'กระบะต้นไม้',
  category: 'nature',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BOX.w, BOX.h, BOX.len], [0, BOX.h / 2, 0], 'woodDark'),
      kit.box([BOX.w + 0.06, 0.04, BOX.len + 0.06], [0, BOX.h + 0.02, 0], 'wood'),
      kit.box([BOX.w - 0.06, 0.02, BOX.len - 0.06], [0, BOX.h + 0.04, 0], 'bark'),
      // two teal bands on the front
      kit.box([0.02, 0.06, BOX.len - 0.1], [BOX.w / 2 + 0.01, 0.2, 0], 'teal'),
    ];
    const GREENS: PaletteColor[] = ['leaf', 'leafDark', 'lime'];
    for (let i = 0; i < 6; i++) {
      const z = -0.8 + i * 0.32;
      const x = (i % 2 === 0 ? -1 : 1) * 0.06;
      parts.push(kit.sphere(0.16 + (i % 3) * 0.015, [x, 0.5 + (i % 3) * 0.04, z], GREENS[i % 3], { detail: 0, scale: [1, 1.1, 1] }));
    }
    // spiky leaves and little flowers
    for (let i = 0; i < 5; i++) {
      const z = -0.64 + i * 0.32;
      parts.push(kit.cone(0.05, 0.3, [0.14 * (i % 2 === 0 ? 1 : -1), 0.52, z], 'leaf', { segments: 6 }));
    }
    const FLOWERS: PaletteColor[] = ['pink', 'sunYellow', 'orange', 'purple', 'pink'];
    FLOWERS.forEach((c, i) => parts.push(kit.sphere(0.045, [0.17 * (i % 2 === 0 ? -1 : 1), 0.68, -0.64 + i * 0.32], c, { detail: 0 })));
    return kit.finish(parts);
  },
};
