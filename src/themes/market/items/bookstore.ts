import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { door, glassWindow } from '../../../models/parts';

// A brick bookshop (2×3, front +x): tall lit windows, spine racks of coloured books out front and a purple open-book neon on the roof.
const CX = -0.1; // wall centre x
const W = 1.6;
const L = 2.7;
const BASE = 0.05;
const TOP = 1.05; // wall top
const FRONT = CX + W / 2;
const SIGN_X = 0.5;
const SIGN_Y = TOP + 0.06 + 0.375; // board centre
const SPINES: PaletteColor[] = ['red', 'sunYellow', 'blue', 'leaf', 'pink', 'orange', 'purple'];

/** A thin rectangle outline in the y–z plane (a neon stroke), facing +x. */
function outline(kit: StyleKit, x: number, y: number, z: number, w: number, h: number, t: number, color: PaletteColor): Part[] {
  const glow = { glow: true } as const;
  return [
    kit.box([t, t, w], [x, y + h / 2, z], color, glow),
    kit.box([t, t, w], [x, y - h / 2, z], color, glow),
    kit.box([t, h + t, t], [x, y, z - w / 2], color, glow),
    kit.box([t, h + t, t], [x, y, z + w / 2], color, glow),
  ];
}

/** ร้านหนังสือ: a bookshop with spine racks out front and an open-book neon. */
export const item: ItemModel = {
  id: 'bookstore',
  name: 'ร้านหนังสือ',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([W + 0.3, BASE, L + 0.2], [CX + 0.05, BASE / 2, 0], 'stone'),
      kit.box([W, TOP - BASE, L], [CX, (BASE + TOP) / 2, 0], 'terracotta'),
      kit.box([W + 0.02, 0.06, L + 0.02], [CX, BASE + 0.03, 0], 'woodDark'),
      kit.box([W + 0.12, 0.06, L + 0.1], [CX, TOP + 0.03, 0], 'navy'),
      kit.box([W + 0.04, 0.05, L + 0.04], [CX, TOP - 0.025, 0], 'white'),
      // door and a purple awning
      ...door(kit, { at: [FRONT, BASE + 0.275, 0.12], facing: 'x+', w: 0.3, h: 0.55, color: 'woodDark', knob: 'sunYellow' }),
      kit.box([0.28, 0.04, 0.52], [FRONT + 0.14, 0.7, 0], 'purple'),
      // sign board on the roof
      kit.box([0.08, 0.75, 1.4], [SIGN_X, SIGN_Y, 0], 'navy'),
      kit.box([0.06, 0.1, 0.5], [SIGN_X - 0.02, TOP + 0.11, 0], 'stoneDark'),
      // the open book: two pages and a ribbon
      ...outline(kit, SIGN_X + 0.05, SIGN_Y, -0.27, 0.44, 0.38, 0.04, 'purple'),
      ...outline(kit, SIGN_X + 0.05, SIGN_Y, 0.27, 0.44, 0.38, 0.04, 'purple'),
      kit.box([0.04, 0.2, 0.04], [SIGN_X + 0.05, SIGN_Y - 0.28, 0.0], 'pink', { glow: true }),
      kit.sphere(0.05, [SIGN_X + 0.05, SIGN_Y + 0.28, 0], 'sunYellow', { detail: 0, glow: true }),
    ];
    for (const z of [-0.9, 0.9]) {
      parts.push(
        ...glassWindow(kit, { at: [FRONT, 0.81, z], facing: 'x+', w: 0.8, h: 0.32, panes: 3 }),
        // spine rack in front of the window: coloured books standing on a shelf
        kit.box([0.12, 0.3, 0.84], [FRONT + 0.06, BASE + 0.15, z], 'woodDark'),
      );
      SPINES.forEach((c, i) => {
        parts.push(kit.box([0.07, 0.22 - (i % 3) * 0.02, 0.09], [FRONT + 0.07, BASE + 0.3 + 0.11, z - 0.3 + i * 0.1], c));
      });
    }
    for (const z of [-L / 2, L / 2]) {
      parts.push(...glassWindow(kit, { at: [CX, 0.62, z], facing: z > 0 ? 'z+' : 'z-', w: 0.9, h: 0.4 }));
    }
    for (const z of [-0.8, 0.8]) parts.push(...glassWindow(kit, { at: [CX - W / 2, 0.62, z], facing: 'x-', w: 0.7, h: 0.4 }));
    return kit.finish(parts);
  },
};
