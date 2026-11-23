import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

const TOP_Y = 0.5; // table top surface
const CHAIR_R = 0.64; // chair centre distance from the table centre

/** A chair at (cx, cz) whose back is on the side (ux, uz) (a unit axis direction); the seat top is 0.31. */
function chair(kit: StyleKit, cx: number, cz: number, ux: number, uz: number, color: PaletteColor): Part[] {
  const vx = -uz;
  const vz = ux;
  const at = (a: number, y: number, b = 0): [number, number, number] => [cx + a * ux + b * vx, y, cz + a * uz + b * vz];
  const size = (a: number, y: number, b: number): [number, number, number] => (ux !== 0 ? [a, y, b] : [b, y, a]);
  const parts: Part[] = [
    kit.box(size(0.32, 0.03, 0.32), at(0, 0.255), 'wood'),
    kit.box(size(0.28, 0.04, 0.28), at(-0.01, 0.29), color),
    kit.box(size(0.03, 0.22, 0.32), at(0.145, 0.51), color), // backrest panel
  ];
  for (const a of [-0.13, 0.13]) {
    for (const b of [-0.13, 0.13]) parts.push(kit.box([0.035, a > 0 ? 0.62 : 0.24, 0.035], at(a, a > 0 ? 0.31 : 0.12, b), 'woodDark'));
  }
  return parts;
}

/** โต๊ะกลมสี่ที่นั่ง: a round table with four chairs, two cups and a small vase. */
export const item: ItemModel = {
  id: 'round-table-four',
  name: 'โต๊ะกลมสี่ที่นั่ง',
  category: 'seating',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.2, 0.22, 0.04, [0, 0.02, 0], 'woodDark', { segments: 10 }),
      kit.cylinder(0.05, 0.05, TOP_Y - 0.08, [0, TOP_Y / 2 + 0.0, 0], 'woodDark', { segments: 8 }),
      kit.cylinder(0.44, 0.44, 0.04, [0, TOP_Y - 0.02, 0], 'wood', { segments: 14 }),
      kit.cylinder(0.3, 0.3, 0.012, [0, TOP_Y + 0.006, 0], 'cream', { segments: 12 }), // cloth round
      // two cups with saucers
      kit.cylinder(0.075, 0.075, 0.015, [-0.02, TOP_Y + 0.0145, 0.25], 'white', { segments: 8 }),
      kit.cylinder(0.055, 0.045, 0.07, [-0.02, TOP_Y + 0.057, 0.25], 'red', { segments: 8 }),
      kit.cylinder(0.075, 0.075, 0.015, [-0.02, TOP_Y + 0.0145, -0.25], 'white', { segments: 8 }),
      kit.cylinder(0.055, 0.045, 0.07, [-0.02, TOP_Y + 0.057, -0.25], 'teal', { segments: 8 }),
      // vase with flowers
      kit.cylinder(0.045, 0.035, 0.1, [0.02, TOP_Y + 0.05, 0], 'glassBlue', { segments: 8 }),
      kit.sphere(0.045, [0.02, TOP_Y + 0.13, 0.015], 'pink', { detail: 0 }),
      kit.sphere(0.04, [0.04, TOP_Y + 0.12, -0.03], 'sunYellow', { detail: 0 }),
      kit.sphere(0.035, [-0.015, TOP_Y + 0.115, -0.025], 'purple', { detail: 0 }),
    ];
    parts.push(
      ...chair(kit, CHAIR_R, 0, 1, 0, 'red'),
      ...chair(kit, -CHAIR_R, 0, -1, 0, 'teal'),
      ...chair(kit, 0, CHAIR_R, 0, 1, 'sunYellow'),
      ...chair(kit, 0, -CHAIR_R, 0, -1, 'purple'),
    );
    return kit.finish(parts);
  },
};
