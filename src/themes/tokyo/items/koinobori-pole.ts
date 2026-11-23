import type { ItemModel } from '../../../models/contract';
import type { Part, PartOpts } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A carp-streamer pole (1×2): a tall white pole on a stone slab with three carp (red, blue, pink) streaming towards +z.
// Each carp ripples about its own pivot on the pole (same pivot and axis for every part of that carp).
const POLE_Z = -0.85;
const POLE_H = 2.6;
const SLAB = { w: 0.9, h: 0.04, d: 1.9 };

interface Carp {
  y: number; // height of the carp's axis
  length: number;
  radius: number; // at the mouth
  body: PaletteColor;
  tail: PaletteColor;
}
const CARPS: readonly Carp[] = [
  { y: 2.35, length: 1.2, radius: 0.14, body: 'red', tail: 'redDark' },
  { y: 1.95, length: 1.0, radius: 0.12, body: 'blue', tail: 'navy' },
  { y: 1.6, length: 0.8, radius: 0.1, body: 'pink', tail: 'orange' },
];
const SEGMENTS = 3;

/** ธงปลาคาร์ป: carp streamers that wave from the pole top. */
export const item: ItemModel = {
  id: 'koinobori-pole',
  name: 'ธงปลาคาร์ป',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([SLAB.w, SLAB.h, SLAB.d], [0, SLAB.h / 2, 0], 'stone'),
      kit.cylinder(0.12, 0.14, 0.12, [0, SLAB.h + 0.06, POLE_Z], 'stoneDark', { segments: 8 }),
      kit.cylinder(0.035, 0.045, POLE_H, [0, SLAB.h + POLE_H / 2, POLE_Z], 'white', { segments: 8 }),
      kit.sphere(0.07, [0, SLAB.h + POLE_H + 0.04, POLE_Z], 'sunYellow', { glow: true, light: 'breathe' }),
    ];
    for (const c of CARPS) {
      const wave: NonNullable<PartOpts['motion']> = { kind: 'wave', pivot: [0, c.y, POLE_Z], axis: [0, 0, 1], amount: 0.18 };
      const z0 = POLE_Z + 0.05; // the mouth ring sits against the pole
      const seg = c.length / SEGMENTS;
      const radiusAt = (t: number) => c.radius * (1 - 0.65 * t);
      for (let i = 0; i < SEGMENTS; i++) {
        const t0 = i / SEGMENTS;
        const t1 = (i + 1) / SEGMENTS;
        // axis along z: rotate +y onto +z; the top (rTop) end is the +z (tail) end
        parts.push(
          kit.cylinder(radiusAt(t1), radiusAt(t0), seg, [0, c.y, z0 + seg * (i + 0.5)], i % 2 === 0 ? c.body : 'white', {
            segments: 8,
            rotate: [Math.PI / 2, 0, 0],
            motion: wave,
          }),
        );
      }
      // open mouth ring
      parts.push(kit.cylinder(c.radius * 1.02, c.radius * 1.02, 0.03, [0, c.y, z0 - 0.01], 'charcoal', { segments: 8, rotate: [Math.PI / 2, 0, 0], motion: wave }));
      // forked tail: two thin vertical fins
      const tz = z0 + c.length + 0.05;
      parts.push(kit.box([0.025, 0.12, 0.14], [0, c.y + 0.06, tz], c.tail, { motion: wave, rotate: [0.35, 0, 0] }));
      parts.push(kit.box([0.025, 0.12, 0.14], [0, c.y - 0.06, tz], c.tail, { motion: wave, rotate: [-0.35, 0, 0] }));
      // eyes on both sides
      for (const s of [1, -1]) {
        parts.push(kit.sphere(0.035, [s * c.radius * 0.95, c.y + 0.02, z0 + 0.13], 'white', { detail: 0, motion: wave }));
        parts.push(kit.sphere(0.018, [s * (c.radius * 0.95 + 0.03), c.y + 0.02, z0 + 0.14], 'charcoal', { detail: 0, motion: wave }));
      }
    }
    return kit.finish(parts);
  },
};
