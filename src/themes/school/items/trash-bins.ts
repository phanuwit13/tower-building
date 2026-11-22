import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { wallPanel } from '../../../models/parts';

// Three wheelie bins in a row along z, fronts (and their white labels) facing +x, wheels and push
// handles at the back (-x). The yellow one in the middle has its lid flipped open.
const PAD = { w: 0.56, h: 0.04, d: 0.96 }; // stone pad under all three
const BIN = { x: 0.02, d: 0.3, w: 0.27, h: 0.45 }; // body: `d` along x, `w` along z; `x` = centre of the row
const GAP = 0.31; // bin centres along z
const LID = { h: 0.045, front: 0.02, side: 0.012 }; // how far the lid sticks out past the body
const OPEN = 1.85; // the open lid is turned this far (radians) about its back hinge: just past upright
const LABEL = { w: 0.15, h: 0.13, y: 0.32 }; // y = centre above the pad
const WHEEL = { r: 0.05, w: 0.035 };
const TOP = PAD.h + BIN.h; // top of the bodies
/** z, body colour, lid colour (its darker shade), lid open? */
const BINS: Array<[number, PaletteColor, PaletteColor, boolean]> = [
  [-GAP, 'leaf', 'leafDark', false],
  [0, 'sunYellow', 'brass', true],
  [GAP, 'blue', 'navy', false],
];

/** ถังขยะแยกประเภท: green, yellow and blue sorting bins on a stone pad; the yellow one has its lid open. */
export const item: ItemModel = {
  id: 'trash-bins',
  name: 'ถังขยะแยกประเภท',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [kit.box([PAD.w, PAD.h, PAD.d], [0, PAD.h / 2, 0], 'stone')];
    const back = BIN.x - BIN.d / 2; // the hinge side
    const lidLen = BIN.d + LID.front;
    const lidW = BIN.w + 2 * LID.side;
    for (const [z, body, lid, open] of BINS) {
      parts.push(
        kit.box([BIN.d, BIN.h, BIN.w], [BIN.x, PAD.h + BIN.h / 2, z], body),
        ...wallPanel(kit, { at: [BIN.x + BIN.d / 2, PAD.h + LABEL.y, z], facing: 'x+', w: LABEL.w, h: LABEL.h, depth: 0.012, color: 'white' }),
        kit.box([0.03, 0.03, 0.18], [back - 0.02, TOP - 0.06, z], 'charcoal'), // push handle at the back
      );
      for (const s of [-1, 1]) {
        parts.push(kit.cylinder(WHEEL.r, WHEEL.r, WHEEL.w, [back + 0.02, PAD.h + WHEEL.r, z + s * (BIN.w / 2 - WHEEL.w / 2 + 0.012)],
          'charcoal', { rotate: [Math.PI / 2, 0, 0], segments: 8 }));
      }
      if (open) {
        // dark opening, then the lid swung up and back about its hinge
        parts.push(kit.box([BIN.d - 0.05, 0.01, BIN.w - 0.05], [BIN.x, TOP + 0.005, z], 'charcoal'));
        const cx = back + (lidLen / 2) * Math.cos(OPEN);
        const cy = TOP + LID.h / 2 + (lidLen / 2) * Math.sin(OPEN);
        parts.push(kit.box([lidLen, LID.h, lidW], [cx, cy, z], lid, { rotate: [0, 0, OPEN] }));
      } else {
        parts.push(
          kit.box([lidLen, LID.h, lidW], [back + lidLen / 2, TOP + LID.h / 2, z], lid),
          kit.box([0.035, 0.025, 0.1], [back + lidLen + 0.012, TOP + LID.h / 2, z], lid), // grip at the front of the lid
        );
      }
    }
    return kit.finish(parts);
  },
};
