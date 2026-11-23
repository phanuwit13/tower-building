import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A long clay trough of glowing embers with a row of bamboo tubes of sticky rice lying across it.
// The embers are orange and red glow dots that breathe; there are no flames.
const TROUGH = { w: 0.5, h: 0.3, d: 1.7 };
const TUBE_Y = 0.4;
const TUBES = 8;
const BREATHE = { glow: true, light: 'breathe' } as const;

/** ข้าวหลามเผา: a long grill of bamboo tubes over glowing embers. */
export const item: ItemModel = {
  id: 'bamboo-rice-grill',
  name: 'ข้าวหลามเผา',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([TROUGH.w, TROUGH.h, TROUGH.d], [0, TROUGH.h / 2, 0], 'terracotta'),
      // dark ash bed inside the trough
      kit.box([TROUGH.w - 0.1, 0.02, TROUGH.d - 0.1], [0, TROUGH.h + 0.01, 0], 'charcoal'),
      // wooden legs' skirt and a rail along each side to rest the tubes on
      kit.box([0.04, 0.06, TROUGH.d], [-0.2, TUBE_Y - 0.07, 0], 'woodDark'),
      kit.box([0.04, 0.06, TROUGH.d], [0.2, TUBE_Y - 0.07, 0], 'woodDark'),
    ];
    for (const z of [-0.85, 0.85]) {
      for (const x of [-0.2, 0.2]) parts.push(kit.box([0.04, TUBE_Y - 0.04, 0.04], [x, (TUBE_Y - 0.04) / 2 + 0.3, z], 'woodDark'));
    }
    // bamboo tubes lying across (along x), rice-filled open ends facing +x
    const pitch = 1.5 / (TUBES - 1);
    for (let i = 0; i < TUBES; i++) {
      const z = -0.75 + i * pitch;
      parts.push(
        kit.cylinder(0.055, 0.055, 0.7, [0, TUBE_Y + 0.03, z], 'lime', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
        kit.cylinder(0.06, 0.06, 0.03, [-0.1, TUBE_Y + 0.03, z], 'leafDark', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
        kit.cylinder(0.04, 0.04, 0.03, [0.352, TUBE_Y + 0.03, z], 'cream', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      );
    }
    // embers: dots glowing in the gaps between the tubes and along the trough's open ends
    for (let i = 0; i < TUBES + 1; i++) {
      const z = -0.75 - pitch / 2 + i * pitch;
      const clamp = Math.max(-0.8, Math.min(0.8, z));
      parts.push(
        kit.sphere(0.045, [-0.1, TROUGH.h + 0.045, clamp], i % 2 ? 'orange' : 'red', { detail: 0, ...BREATHE }),
        kit.sphere(0.045, [0.1, TROUGH.h + 0.045, clamp], i % 2 ? 'red' : 'orange', { detail: 0, ...BREATHE }),
        kit.sphere(0.04, [0.2 - 0.02, TUBE_Y - 0.03, clamp], 'orange', { detail: 0, ...BREATHE }),
      );
    }
    return kit.finish(parts);
  },
};
