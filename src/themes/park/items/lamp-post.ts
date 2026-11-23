import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const BREATHE = { glow: 'sunYellow', light: 'breathe' } as const; // warm yellow light, not white
const LANTERN = { y: 1.38, w: 0.32, h: 0.4 }; // the lit glass box on top of the pole

/** เสาไฟสวน: an old-style park lamp post: charcoal fluted pole on a stepped base and a square lantern that glows warm at night. */
export const item: ItemModel = {
  id: 'lamp-post',
  name: 'เสาไฟสวน',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const lanternBottom = LANTERN.y - LANTERN.h / 2;
    const lanternTop = LANTERN.y + LANTERN.h / 2;
    const parts: Part[] = [
      // stepped round base and a swelling foot
      kit.cylinder(0.28, 0.3, 0.06, [0, 0.03, 0], 'stone', { segments: 8 }),
      kit.cylinder(0.14, 0.2, 0.2, [0, 0.16, 0], 'charcoal', { segments: 8 }),
      kit.cylinder(0.14, 0.14, 0.03, [0, 0.275, 0], 'brass', { segments: 8 }),
      // slim pole with a brass ring halfway and a collar under the lantern
      kit.cylinder(0.045, 0.06, 0.8, [0, 0.69, 0], 'charcoal', { segments: 8 }),
      kit.torus(0.07, 0.02, [0, 0.8, 0], 'brass', { radialSegments: 4, tubularSegments: 8, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.15, 0.05, 0.08, [0, lanternBottom - 0.04, 0], 'charcoal', { segments: 8 }),
      // lantern: warm glass with four corner posts, a pyramid cap and a ball on top
      kit.box([LANTERN.w, LANTERN.h, LANTERN.w], [0, LANTERN.y, 0], 'lampWarm', BREATHE),
      kit.cone(0.29, 0.13, [0, lanternTop + 0.065, 0], 'charcoal', { segments: 4, rotate: [0, Math.PI / 4, 0] }),
      kit.sphere(0.14, [0, LANTERN.y, 0], 'lampWarm', BREATHE), // bigger glowing core inside the glass
      kit.sphere(0.035, [0, lanternTop + 0.16, 0], 'brass', { detail: 0 }),
    ];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      parts.push(kit.box([0.03, LANTERN.h + 0.02, 0.03], [sx * (LANTERN.w / 2), LANTERN.y, sz * (LANTERN.w / 2)], 'charcoal'));
    }
    return kit.finish(parts);
  },
};
