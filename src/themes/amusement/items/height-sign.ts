import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

const PAD = { w: 0.8, h: 0.04, d: 0.8 };
const BOARD = { t: 0.08, h: 1.3, d: 0.62, y: 0.04 }; // yellow board on a stone pad; the giraffe's neck is the board
const FACE = BOARD.t / 2; // x of the board's front surface
/** Giraffe spots on the front: [z, y (from the board's foot), size]. */
const SPOTS: Array<[number, number, number]> = [[-0.14, 0.2, 0.12], [0.16, 0.34, 0.1], [-0.12, 0.62, 0.11], [0.15, 0.82, 0.1], [-0.05, 1.0, 0.09]];
const HAND = { y: 0.62, z: 0.0 }; // the hand is held out at ride height
const MARKS = 5; // ruler ticks along the left edge
const MARK_COLORS: PaletteColor[] = ['blue', 'white'];

/** ป้ายวัดส่วนสูง: a cartoon giraffe board with a ruler down one side and a hand held out at the ride height. */
export const item: ItemModel = {
  id: 'height-sign',
  name: 'ป้ายวัดส่วนสูง',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const top = PAD.h + BOARD.h;
    const parts: Part[] = [
      kit.box([PAD.w, PAD.h, PAD.d], [0, PAD.h / 2, 0], 'stone'),
      kit.box([BOARD.t, BOARD.h, BOARD.d], [0, PAD.h + BOARD.h / 2, 0], 'sunYellow'),
    ];
    for (const [z, y, s] of SPOTS) {
      parts.push(kit.box([0.012, s, s * 0.9], [FACE + 0.006, PAD.h + y, z], 'orange'));
    }
    // ruler ticks on the -z edge
    for (let k = 0; k < MARKS; k++) {
      parts.push(kit.box([0.012, 0.07, 0.07], [FACE + 0.006, PAD.h + 0.2 + k * 0.2, -BOARD.d / 2 + 0.06], MARK_COLORS[k % 2]));
    }
    // head: a rounded top with a snout, ears, horns, eyes and a smile
    parts.push(
      kit.sphere(0.2, [0.04, top + 0.06, 0], 'sunYellow', { detail: 1, scale: [0.8, 0.9, 1.15] }),
      kit.sphere(0.075, [0.2, top + 0.0, 0], 'orange', { detail: 0, scale: [1, 0.8, 1.3] }),
      kit.sphere(0.012, [0.265, top + 0.01, -0.03], 'charcoal', { detail: 0 }),
      kit.sphere(0.012, [0.265, top + 0.01, 0.03], 'charcoal', { detail: 0 }),
      kit.box([0.02, 0.02, 0.1], [0.19, top - 0.05, 0], 'redDark'),
    );
    for (const s of [-1, 1]) {
      parts.push(
        kit.cylinder(0.022, 0.03, 0.14, [0.02, top + 0.3, s * 0.08], 'woodDark', { segments: 6 }),
        kit.sphere(0.04, [0.02, top + 0.39, s * 0.08], 'orange', { detail: 0 }),
        kit.box([0.04, 0.06, 0.12], [0.0, top + 0.1, s * 0.22], 'orange', { rotate: [s * 0.5, 0, 0] }),
        kit.sphere(0.025, [0.12, top + 0.1, s * 0.1], 'white', { detail: 0 }),
        kit.sphere(0.014, [0.14, top + 0.1, s * 0.1], 'charcoal', { detail: 0 }),
      );
    }
    // the hand: an arm out of the board, a palm, four fingers and a thumb, with a red line across the board at its height
    parts.push(
      kit.box([0.02, 0.04, BOARD.d - 0.1], [FACE + 0.01, PAD.h + HAND.y, 0], 'red'),
      kit.box([0.12, 0.05, 0.06], [FACE + 0.06, PAD.h + HAND.y, HAND.z], 'pink'),
      kit.box([0.05, 0.12, 0.14], [FACE + 0.14, PAD.h + HAND.y + 0.02, HAND.z], 'pink'),
      kit.box([0.05, 0.06, 0.05], [FACE + 0.14, PAD.h + HAND.y - 0.03, HAND.z + 0.1], 'pink', { rotate: [0.6, 0, 0] }),
    );
    for (let k = 0; k < 4; k++) {
      parts.push(kit.box([0.04, 0.09, 0.025], [FACE + 0.14, PAD.h + HAND.y + 0.12, HAND.z - 0.055 + k * 0.037], 'pink'));
    }
    return kit.finish(parts);
  },
};
