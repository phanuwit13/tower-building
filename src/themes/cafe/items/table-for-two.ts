import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

const TOP_Y = 0.5; // table top surface
const TABLE = 0.64; // table top side
const CHAIR_Z = 0.65; // chair centre distance from the table centre

/** A chair at z = cz with its back toward `s` (+1 or -1 along z); the seat top is 0.31. */
function chair(kit: StyleKit, cz: number, s: number, color: PaletteColor): Part[] {
  const parts: Part[] = [
    kit.box([0.32, 0.03, 0.32], [0, 0.255, cz], 'wood'),
    kit.box([0.28, 0.04, 0.28], [0, 0.29, cz - s * 0.01], color),
    kit.box([0.32, 0.22, 0.03], [0, 0.51, cz + s * 0.145], color),
  ];
  for (const x of [-0.13, 0.13]) {
    for (const d of [-0.13, 0.13]) {
      const back = d * s > 0;
      parts.push(kit.box([0.035, back ? 0.62 : 0.24, 0.035], [x, back ? 0.31 : 0.12, cz + d], 'woodDark'));
    }
  }
  return parts;
}

/** โต๊ะสองที่นั่ง: a small square table with two chairs facing each other, a cake and a cup. */
export const item: ItemModel = {
  id: 'table-for-two',
  name: 'โต๊ะสองที่นั่ง',
  category: 'seating',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.4, 0.04, 0.4], [0, 0.02, 0], 'woodDark'),
      kit.box([0.07, TOP_Y - 0.08, 0.07], [0, TOP_Y / 2, 0], 'woodDark'),
      kit.box([TABLE, 0.04, TABLE], [0, TOP_Y - 0.02, 0], 'wood'),
      kit.box([0.5, 0.012, 0.5], [0, TOP_Y + 0.006, 0], 'pink'), // placemat cloth
      // cake on a plate
      kit.cylinder(0.12, 0.12, 0.015, [0.0, TOP_Y + 0.0195, -0.13], 'white', { segments: 10 }),
      kit.cylinder(0.09, 0.09, 0.07, [0.0, TOP_Y + 0.0545 + 0.0, -0.13], 'cream', { segments: 10 }),
      kit.cylinder(0.085, 0.085, 0.025, [0.0, TOP_Y + 0.1, -0.13], 'red', { segments: 10 }),
      kit.sphere(0.025, [0.0, TOP_Y + 0.14, -0.13], 'white', { detail: 0 }),
      // cup and saucer
      kit.cylinder(0.08, 0.08, 0.015, [0.0, TOP_Y + 0.0195, 0.15], 'white', { segments: 8 }),
      kit.cylinder(0.06, 0.05, 0.075, [0.0, TOP_Y + 0.06, 0.15], 'teal', { segments: 8 }),
      kit.torus(0.03, 0.012, [0.08, TOP_Y + 0.06, 0.15], 'teal', { radialSegments: 4, tubularSegments: 8 }),
    ];
    parts.push(...chair(kit, CHAIR_Z, 1, 'orange'), ...chair(kit, -CHAIR_Z, -1, 'mint'));
    return kit.finish(parts);
  },
};
