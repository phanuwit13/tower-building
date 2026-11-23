import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

// A little heap of green and brown coconuts on a wooden tray; one green coconut is opened with a straw.
const BASE_H = 0.04;
const R = 0.14;

/** กองมะพร้าว: green and brown coconuts, one opened with a straw. */
export const item: ItemModel = {
  id: 'coconut-pile',
  name: 'กองมะพร้าว',
  category: 'food',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const y0 = BASE_H + R * 0.9;
    const nut = (x: number, y: number, z: number, color: PaletteColor): Part => kit.sphere(R, [x, y, z], color, { scale: [1, 1.05, 1] });
    const parts: Part[] = [
      kit.box([0.94, BASE_H, 0.94], [0, BASE_H / 2, 0], 'wood'),
      // bottom ring of four, a nut on top of the gap
      nut(0.17, y0, 0.17, 'lime'),
      nut(-0.17, y0, 0.17, 'woodDark'),
      nut(-0.17, y0, -0.17, 'lime'),
      nut(0.17, y0, -0.17, 'woodDark'),
      nut(0.0, y0 + 0.19, 0.0, 'lime'),
      nut(-0.34, y0, 0.0, 'woodDark'),
    ];
    // the opened coconut at the front: pale cut top and a straw
    const ox = 0.34;
    const oz = -0.02;
    parts.push(
      kit.sphere(R + 0.02, [ox, y0 + 0.02, oz], 'lime', { scale: [1, 1.05, 1] }),
      kit.cylinder(0.08, 0.08, 0.02, [ox, y0 + 0.17, oz], 'cream', { segments: 8 }),
      rod(kit, [ox, y0 + 0.14, oz], [ox - 0.04, y0 + 0.4, oz + 0.06], 0.014, 'pink', { segments: 4 }),
    );
    // a loose brown nut at the back
    parts.push(nut(-0.3, y0, -0.34, 'woodDark'), nut(0.3, y0, 0.35, 'woodDark'));
    return kit.finish(parts);
  },
};
