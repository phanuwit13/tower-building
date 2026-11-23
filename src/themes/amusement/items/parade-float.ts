import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A decorated float on four wheels (long side along z): a pink deck, a big crown of flowers on a pedestal and
// two flags on poles that wave. Front faces +x.
const DECK = { w: 0.8, h: 0.14, d: 1.7, y: 0.3 }; // y = centre height
const WHEEL = { r: 0.12, w: 0.06, x: 0.34, z: [-0.55, 0.55] };
const DECK_TOP = DECK.y + DECK.h / 2;
const CROWN = { r: 0.22, y: DECK_TOP + 0.4, n: 8 };
const FLAG = { w: 0.42, h: 0.22, strips: 3, wave: 0.15 };
const FLAG_COLORS: PaletteColor[] = ['red', 'blue'];

/** รถแห่ขบวนพาเหรด: a parade float with a flower crown and waving flags. */
export const item: ItemModel = {
  id: 'parade-float',
  name: 'รถแห่ขบวนพาเหรด',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([DECK.w, DECK.h, DECK.d], [0, DECK.y, 0], 'pink')];
    for (const sx of [-1, 1]) {
      for (const z of WHEEL.z) {
        parts.push(
          kit.cylinder(WHEEL.r, WHEEL.r, WHEEL.w, [sx * WHEEL.x, WHEEL.r, z], 'charcoal', { rotate: [0, 0, Math.PI / 2], segments: 8 }),
          kit.cylinder(0.05, 0.05, WHEEL.w + 0.02, [sx * WHEEL.x, WHEEL.r, z], 'sunYellow', { rotate: [0, 0, Math.PI / 2], segments: 6 }),
        );
      }
    }
    // bunting skirt along both long sides and a bumper at each end
    for (let k = 0; k < 8; k++) {
      const z = -0.74 + k * 0.21;
      const color: PaletteColor = k % 2 === 0 ? 'sunYellow' : 'blue';
      for (const sx of [-1, 1]) parts.push(kit.wedge([0.06, 0.1, 0.18], [sx * (DECK.w / 2 + 0.02), DECK.y - 0.01, z], color, { rotate: [Math.PI, 0, 0] }));
    }
    // the flower crown: a pedestal, a ring of big blossoms and a golden centre
    parts.push(
      kit.cylinder(0.16, 0.2, 0.3, [0, DECK_TOP + 0.15, 0], 'white', { segments: 10 }),
      kit.cylinder(0.24, 0.16, 0.06, [0, DECK_TOP + 0.33, 0], 'sunYellow', { segments: 10 }),
    );
    const blossoms: PaletteColor[] = ['red', 'orange', 'pink', 'purple'];
    for (let k = 0; k < CROWN.n; k++) {
      const a = (k / CROWN.n) * Math.PI * 2;
      parts.push(
        kit.sphere(0.1, [CROWN.r * Math.cos(a), CROWN.y, CROWN.r * Math.sin(a)], blossoms[k % blossoms.length], { detail: 0 }),
      );
    }
    parts.push(kit.cylinder(0.3, 0.3, 0.04, [0, CROWN.y - 0.1, 0], 'leaf', { segments: 8 }), kit.sphere(0.15, [0, CROWN.y + 0.04, 0], 'sunYellow', { detail: 1 }), kit.sphere(0.07, [0, CROWN.y + 0.18, 0], 'white', { detail: 0 }));
    // two flagpoles at the ends, each with a flag cut into strips that wave about the pole
    const poleX = -0.2;
    const poleTop = 1.2;
    FLAG_COLORS.forEach((color, i) => {
      const z = i === 0 ? -0.72 : 0.72;
      const flagTop = poleTop - 0.04;
      const wave: MotionOpts = { kind: 'wave', pivot: [poleX + 0.02, flagTop, z], axis: [1, 0, 0] };
      parts.push(
        kit.cylinder(0.02, 0.02, poleTop - DECK_TOP, [poleX, DECK_TOP + (poleTop - DECK_TOP) / 2, z], 'white', { segments: 6 }),
        kit.sphere(0.04, [poleX, poleTop + 0.02, z], 'sunYellow', { detail: 0 }),
      );
      const strip = FLAG.w / FLAG.strips;
      for (let s = 0; s < FLAG.strips; s++) {
        parts.push(kit.box([strip, FLAG.h, 0.02], [poleX + 0.02 + strip * (s + 0.5), flagTop - FLAG.h / 2, z], s === 1 ? 'white' : color, { motion: wave }));
      }
    });
    return kit.finish(parts);
  },
};
