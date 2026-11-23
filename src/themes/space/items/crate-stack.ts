import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// Stacked cargo containers (1×2, long side along z), bright colours, corrugation ribs and a door end on +z. No text.
const LEN = 1.8;
const W = 0.46;
const H = 0.27;

/** One container with its centre at (x, y, z): box, ribs on the sides and a darker door end at +z. */
function container(kit: StyleKit, x: number, y: number, z: number, body: PaletteColor, rib: PaletteColor): Part[] {
  const parts: Part[] = [
    kit.box([W, H, LEN], [x, y, z], body),
    kit.box([W - 0.04, 0.03, LEN + 0.0], [x, y + H / 2 + 0.015, z], rib), // roof plate
    kit.box([0.04, 0.2, 0.04], [x + W / 2, y, z + LEN / 2 - 0.02], rib),
  ];
  for (let i = -3; i <= 3; i++) {
    parts.push(kit.box([W + 0.03, H - 0.06, 0.04], [x, y, z + i * 0.24], rib));
  }
  parts.push(kit.box([W - 0.06, H - 0.06, 0.03], [x, y, z + LEN / 2 + 0.005], 'stoneDark')); // door end
  return parts;
}

/** กองตู้คาร์โก้: stacked cargo containers. */
export const item: ItemModel = {
  id: 'crate-stack',
  name: 'กองตู้คาร์โก้',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      ...container(kit, 0.24, H / 2, -0.04, 'red', 'redDark'),
      ...container(kit, -0.24, H / 2, 0.02, 'blue', 'navy'),
      ...container(kit, 0.0, H * 1.5 + 0.03, 0, 'sunYellow', 'orange'),
      ...container(kit, -0.24, H * 2.5 + 0.06, 0.0, 'teal', 'leafDark'),
    ];
    return kit.finish(parts);
  },
};
