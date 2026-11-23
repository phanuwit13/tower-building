import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A bamboo laundry line (1×2) along z with a shirt, trousers, a striped sarong and a towel. Each garment waves
// from its own pivot on the line; it is cut into strips so the ripple runs across the cloth.
const POLE_Z = 0.88;
const POLE_H = 1.32;
const LINE_Y = 1.2;
const CLOTH_T = 0.02;
const WAVE = 0.25;

/** A garment is a row of strips along z, hanging from the line; they all wave about the garment's own pivot. */
function hang(kit: StyleKit, z0: number, strips: Array<{ w: number; h: number; color: PaletteColor; top?: number }>, speed: number): Part[] {
  const wave: MotionOpts = { kind: 'wave', pivot: [0, LINE_Y, z0], axis: [0, 0, 1], amount: WAVE, speed };
  const parts: Part[] = [];
  let z = z0;
  for (const s of strips) {
    const top = s.top ?? LINE_Y - 0.03;
    parts.push(kit.box([CLOTH_T, s.h, s.w], [0, top - s.h / 2, z + s.w / 2], s.color, { motion: wave }));
    z += s.w;
  }
  return parts;
}

/** ราวตากผ้า: a bamboo laundry line with colourful clothes and a sarong. */
export const item: ItemModel = {
  id: 'laundry-line',
  name: 'ราวตากผ้า',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const z of [-POLE_Z, POLE_Z]) {
      parts.push(
        kit.cylinder(0.04, 0.05, POLE_H, [0, POLE_H / 2, z], 'sand', { segments: 6 }),
        kit.cylinder(0.055, 0.055, 0.04, [0, 0.45, z], 'wood', { segments: 6 }),
        kit.cylinder(0.055, 0.055, 0.04, [0, 0.9, z], 'wood', { segments: 6 }),
        kit.sphere(0.05, [0, POLE_H + 0.02, z], 'sunYellow', { detail: 0 }),
        kit.box([0.5, 0.05, 0.05], [0, 0.025, z], 'woodDark'),
      );
    }
    parts.push(kit.cylinder(0.015, 0.015, POLE_Z * 2, [0, LINE_Y, 0], 'white', { segments: 4, rotate: [Math.PI / 2, 0, 0] }));
    // A pink shirt with orange sleeves.
    parts.push(
      ...hang(kit, -0.78, [
        { w: 0.07, h: 0.12, color: 'orange', top: LINE_Y - 0.03 },
        { w: 0.09, h: 0.36, color: 'pink' },
        { w: 0.09, h: 0.36, color: 'pink' },
        { w: 0.07, h: 0.12, color: 'orange', top: LINE_Y - 0.03 },
      ], 5),
    );
    // Blue trousers: two legs with a gap.
    parts.push(
      ...hang(kit, -0.42, [
        { w: 0.1, h: 0.46, color: 'blue' },
        { w: 0.1, h: 0.46, color: 'blue' },
        { w: 0.03, h: 0.12, color: 'navy' },
        { w: 0.1, h: 0.46, color: 'blue' },
        { w: 0.1, h: 0.46, color: 'blue' },
      ], 5.6),
    );
    // A long striped sarong in purple, sun yellow and red.
    const stripe: PaletteColor[] = ['purple', 'sunYellow', 'red', 'sunYellow', 'purple', 'orange'];
    parts.push(...hang(kit, 0.03, stripe.map((color) => ({ w: 0.085, h: 0.6, color })), 6.3));
    // A small green towel and a yellow cloth.
    parts.push(
      ...hang(kit, 0.55, [
        { w: 0.09, h: 0.32, color: 'lime' },
        { w: 0.09, h: 0.32, color: 'leaf' },
        { w: 0.09, h: 0.32, color: 'lime' },
      ], 5.2),
    );
    return kit.finish(parts);
  },
};
