import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { gableRoof, ICO_LOW } from '../../../models/parts';

// A small open-fronted kiosk (long side along z, front counter facing +x) under a thatched roof, with
// bags of animal feed on the counter and a carrot sign on the roof.
const BASE_H = 0.04;
const W = 0.66; // wall width (x)
const OX = -0.07; // the kiosk body sits towards the back (-x) so the counter stands out in front of the roof
const L = 1.7; // wall length (z)
const WALL_TOP = 0.95;
const RISE = 0.2;
const COUNTER = { x: 0.36, h: 0.34, w: 0.22 };

/** A tied feed sack: a squashed ball with a little tuft on top. */
function sack(kit: StyleKit, x: number, y: number, z: number, color: PaletteColor, r = 0.085): Part[] {
  return [
    kit.sphere(r, [x, y + r * 0.8 * ICO_LOW, z], color, { detail: 0, scale: [1, 0.8, 1] }),
    kit.cone(r * 0.4, r * 0.7, [x, y + r * 1.6 + 0.02, z], color, { segments: 5 }),
    kit.box([r * 0.5, 0.012, r * 0.5], [x, y + r * 1.25, z], 'redDark'),
  ];
}

/** ซุ้มขายอาหารสัตว์: a kiosk with a thatched roof and feed bags on the counter. */
export const item: ItemModel = {
  id: 'feed-kiosk',
  name: 'ซุ้มขายอาหารสัตว์',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([W + 0.1, BASE_H, L + 0.1], [0, BASE_H / 2, 0], 'sand'),
      // back wall and the two side walls (half height), plank colour
      kit.box([0.05, WALL_TOP - BASE_H, L], [OX - W / 2 + 0.025, (WALL_TOP + BASE_H) / 2, 0], 'wood'),
      kit.box([W, 0.3, 0.05], [OX, BASE_H + 0.15, -L / 2 + 0.025], 'wood'),
      kit.box([W, 0.3, 0.05], [OX, BASE_H + 0.15, L / 2 - 0.025], 'wood'),
      // corner posts
      ...([[W / 2 - 0.03, L / 2 - 0.03], [W / 2 - 0.03, -L / 2 + 0.03], [-W / 2 + 0.03, L / 2 - 0.03], [-W / 2 + 0.03, -L / 2 + 0.03]] as const)
        .map(([x, z]) => kit.box([0.06, WALL_TOP - BASE_H, 0.06], [OX + x, (WALL_TOP + BASE_H) / 2, z], 'woodDark')),
      // front counter along z with a lighter top
      kit.box([COUNTER.w, COUNTER.h, L - 0.2], [COUNTER.x, BASE_H + COUNTER.h / 2, 0], 'woodDark'),
      kit.box([COUNTER.w + 0.06, 0.04, L - 0.14], [COUNTER.x, BASE_H + COUNTER.h + 0.02, 0], 'wood'),
      // thatched roof: sand slabs, a darker ridge and the gable ends closed
      kit.wedge([W, RISE, L], [OX, WALL_TOP + RISE / 2, 0], 'woodDark'),
      ...gableRoof(kit, { at: [OX, WALL_TOP, 0], length: L + 0.2, width: W, rise: RISE, eave: 0.02, color: 'sand', ridge: 'wood', thickness: 0.08 }),
    ];
    const top = BASE_H + COUNTER.h + 0.04;
    parts.push(
      ...sack(kit, COUNTER.x, top, -0.62, 'leaf'),
      ...sack(kit, COUNTER.x, top, -0.4, 'orange'),
      ...sack(kit, COUNTER.x, top, -0.18, 'sunYellow', 0.095),
      ...sack(kit, COUNTER.x, top, 0.5, 'pink'),
      // a pile of carrots and a bowl of seed
      kit.cylinder(0.1, 0.075, 0.07, [COUNTER.x, top + 0.035, 0.2], 'terracotta', { segments: 8 }),
      kit.sphere(0.085, [COUNTER.x, top + 0.075, 0.2], 'sunYellow', { detail: 0, scale: [1, 0.5, 1] }),
      kit.cone(0.025, 0.16, [COUNTER.x + 0.02, top + 0.15, 0.78], 'orange', { segments: 5, rotate: [0, 0, 0.9] }),
      kit.cone(0.025, 0.16, [COUNTER.x - 0.02, top + 0.14, 0.76], 'orange', { segments: 5, rotate: [0.4, 0, -0.5] }),
      // big sacks inside and on the ground
      ...sack(kit, OX, BASE_H, -0.5, 'sunYellow', 0.14),
      ...sack(kit, OX + 0.02, BASE_H, 0.1, 'leaf', 0.14),
      ...sack(kit, OX, BASE_H, 0.55, 'orange', 0.13),
      // sign on the roof front, tilted to face the camera: a carrot
      kit.cone(0.11, 0.34, [OX + 0.18, WALL_TOP + RISE + 0.12, 0.1], 'orange', { segments: 6, rotate: [0, 0, -1.2] }),
      kit.cone(0.04, 0.12, [OX, WALL_TOP + RISE + 0.12, 0.1], 'leaf', { segments: 4, rotate: [0, 0, 1.3] }),
    );
    return kit.finish(parts);
  },
};
