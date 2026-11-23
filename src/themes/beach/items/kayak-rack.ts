import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

const POST_Z = 0.5; // the two end frames
const POST_X = [-0.9, 0, 0.9];
const POST_H = 1.3;
const BAR_Y = [0.3, 0.78]; // the two shelves (cradle bars along x)
const BAR_T = 0.06;
const KAYAK = { rx: 0.09, ry: 0.065, rz: 0.88 };
/** Kayaks lying along z on the two shelves: [x, shelf, colour]. */
const KAYAKS: Array<[number, number, PaletteColor]> = [
  [-0.62, 0, 'red'], [-0.21, 0, 'sunYellow'], [0.21, 0, 'blue'], [0.62, 0, 'lime'],
  [-0.4, 1, 'teal'], [0, 1, 'orange'], [0.4, 1, 'pink'],
];
const PADDLES: Array<[number, PaletteColor]> = [[-0.2, 'wood'], [0, 'woodDark'], [0.2, 'wood']];

/** One kayak resting on a shelf bar: a long squashed hull, a dark cockpit, a seat rim and bow/stern tips. */
function kayak(kit: StyleKit, x: number, bar: number, color: PaletteColor): Part[] {
  const y = BAR_Y[bar] + BAR_T / 2 + KAYAK.ry * 0.8;
  return [
    kit.sphere(1, [x, y, 0], color, { scale: [KAYAK.rx, KAYAK.ry, KAYAK.rz] }),
    kit.sphere(1, [x, y + KAYAK.ry * 0.78, 0.05], 'charcoal', { detail: 0, scale: [0.055, 0.03, 0.14] }),
    kit.sphere(1, [x, y + KAYAK.ry * 0.5, -0.8], 'white', { detail: 0, scale: [0.05, 0.04, 0.09] }),
  ];
}

/** ชั้นวางเรือคายัค: a wooden rack holding colourful kayaks and paddles. */
export const item: ItemModel = {
  id: 'kayak-rack',
  name: 'ชั้นวางเรือคายัค',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1.96, 0.03, 1.96], [0, 0.015, 0], 'sand')];
    for (const z of [-POST_Z, POST_Z]) {
      for (const x of POST_X) parts.push(kit.box([0.09, POST_H, 0.09], [x, POST_H / 2, z], 'woodDark'));
      for (const y of BAR_Y) parts.push(kit.box([1.98, BAR_T, 0.09], [0, y, z], 'wood'));
      parts.push(kit.box([1.98, 0.06, 0.1], [0, POST_H, z], 'wood'));
    }
    for (const x of [-0.9, 0.9]) parts.push(kit.box([0.08, 0.05, 1.3], [x, 0.055, 0], 'woodDark')); // runners
    for (const [x, bar, color] of KAYAKS) parts.push(...kayak(kit, x, bar, color));
    // paddles leaning on the front frame: a shaft and a flat blade at the top
    const lean = 0.2;
    for (const [z, color] of PADDLES) {
      const foot: [number, number, number] = [0.94, 0.05, z];
      const top: [number, number, number] = [0.94 - lean, 1.1, z];
      parts.push(
        rod(kit, foot, top, 0.018, color, { segments: 4 }),
        kit.box([0.012, 0.2, 0.09], [top[0] - 0.02, top[1] + 0.07, z], color === 'wood' ? 'sunYellow' : 'orange', { rotate: [0, 0, 0.2] }),
      );
    }
    return kit.finish(parts);
  },
};
