import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A wooden play ship on a sand pad (bow towards +z). A mast with a striped flag (plain stripes, no emblem),
// a stern helm and a blue slide from the deck down the +x side.
const BASE_H = 0.03;
const HULL = { w: 0.8, h: 0.45, z0: -0.75, z1: 0.55 }; // main hull block
const DECK = BASE_H + HULL.h;
const MAST = { x: -0.05, top: 1.62, r: 0.04 };
const FLAG = { w: 0.5, top: 1.58, strips: 3, stripe: 0.07 };
const STRIPES: Array<[PaletteColor, number]> = [['red', 1], ['white', 1], ['blue', 1], ['white', 1], ['red', 1]];
const WAVE: MotionOpts = { kind: 'wave', pivot: [MAST.x + MAST.r, FLAG.top, 0], axis: [1, 0, 0] };

/** สนามเด็กเล่นเรือโจรสลัด: a wooden play ship with a slide, a mast and a striped flag. */
export const item: ItemModel = {
  id: 'pirate-play-ship',
  name: 'สนามเด็กเล่นเรือโจรสลัด',
  category: 'play',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const hullLen = HULL.z1 - HULL.z0;
    const hullMid = (HULL.z0 + HULL.z1) / 2;
    const parts: Part[] = [
      kit.box([1.94, BASE_H, 1.94], [0, BASE_H / 2, 0], 'sand'),
      kit.box([HULL.w, HULL.h, hullLen], [0, BASE_H + HULL.h / 2, hullMid], 'wood'),
      kit.box([HULL.w + 0.02, 0.12, hullLen + 0.02], [0, BASE_H + 0.2, hullMid], 'red'), // red band
      // pointed bow: a triangle prism lying flat, tip towards +z
      kit.wedge([HULL.w, 0.4, HULL.h], [0, BASE_H + HULL.h / 2, HULL.z1 + 0.2], 'wood', { rotate: [Math.PI / 2, 0, 0] }),
      kit.wedge([HULL.w + 0.02, 0.4, 0.12], [0, BASE_H + 0.2, HULL.z1 + 0.2], 'red', { rotate: [Math.PI / 2, 0, 0] }),
      kit.sphere(0.1, [0, DECK + 0.07, HULL.z1 + 0.3], 'sunYellow', { detail: 0 }),
      // raised stern
      kit.box([HULL.w + 0.1, 0.3, 0.16], [0, DECK + 0.15, HULL.z0 - 0.02], 'woodDark'),
      // deck planks and a little chest
      kit.box([HULL.w - 0.1, 0.02, hullLen - 0.1], [0, DECK + 0.01, hullMid], 'sand'),
      kit.box([0.22, 0.14, 0.16], [-0.15, DECK + 0.09, -0.45], 'woodDark'),
      kit.box([0.23, 0.03, 0.17], [-0.15, DECK + 0.17, -0.45], 'brass'),
      // mast, crow's nest ring and top knob
      kit.cylinder(MAST.r, MAST.r + 0.01, MAST.top - DECK, [MAST.x, (MAST.top + DECK) / 2, 0.1], 'woodDark', { segments: 8 }),
      kit.cylinder(0.15, 0.12, 0.1, [MAST.x, 1.2, 0.1], 'wood', { segments: 8 }),
      kit.sphere(0.05, [MAST.x, MAST.top + 0.04, 0.1], 'sunYellow', { detail: 0 }),
      // helm
      kit.cylinder(0.03, 0.03, 0.18, [0.0, DECK + 0.09, -0.58], 'woodDark', { segments: 6 }),
      kit.torus(0.08, 0.02, [0.0, DECK + 0.24, -0.58], 'brass', { rotate: [0, Math.PI / 2, 0] }),
      // slide down the +x side (high end on the hull) with white side rails
      kit.wedge([0.55, DECK - BASE_H, 0.34], [HULL.w / 2 + 0.275, (DECK + BASE_H) / 2, 0.05], 'blue', { apex: -0.5 }),
      kit.wedge([0.55, DECK - BASE_H, 0.04], [HULL.w / 2 + 0.275, (DECK + BASE_H) / 2, 0.24], 'white', { apex: -0.5 }),
      kit.wedge([0.55, DECK - BASE_H, 0.04], [HULL.w / 2 + 0.275, (DECK + BASE_H) / 2, -0.14], 'white', { apex: -0.5 }),
    ];
    // rails along the hull edges (the slide gap is left open on +x)
    parts.push(kit.box([0.04, 0.1, hullLen], [-HULL.w / 2 + 0.02, DECK + 0.05, hullMid], 'sunYellow'));
    parts.push(kit.box([0.04, 0.1, 0.55], [HULL.w / 2 - 0.02, DECK + 0.05, -0.47], 'sunYellow'));
    parts.push(kit.box([0.04, 0.1, 0.25], [HULL.w / 2 - 0.02, DECK + 0.05, 0.43], 'sunYellow'));
    // portholes on both long sides
    for (const sx of [-1, 1]) for (const z of [-0.5, -0.1, 0.3]) parts.push(kit.sphere(0.06, [sx * (HULL.w / 2 + 0.005), BASE_H + 0.33, z], 'skyBlue', { detail: 0, scale: [0.3, 1, 1] }));
    // flag: horizontal stripes, each cut into vertical strips that ripple about the same point on the mast
    const strip = FLAG.w / FLAG.strips;
    const x0 = MAST.x + MAST.r;
    let y = FLAG.top;
    for (const [color, n] of STRIPES) {
      const h = FLAG.stripe * n;
      y -= h / 2;
      for (let k = 0; k < FLAG.strips; k++) parts.push(kit.box([strip, h, 0.02], [x0 + strip * (k + 0.5), y, 0.1], color, { motion: { ...WAVE, pivot: [x0, FLAG.top, 0.1] } }));
      y -= h / 2;
    }
    return kit.finish(parts);
  },
};
