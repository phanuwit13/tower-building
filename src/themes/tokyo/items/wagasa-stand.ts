import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A stand of open paper umbrellas (1×1): a wooden platform with three poles carrying red, blue and red-white parasols.
const PLATFORM = { w: 0.94, h: 0.05 };
interface Umbrella {
  x: number;
  z: number;
  poleTop: number; // where the canopy base starts
  radius: number;
  a: PaletteColor;
  b: PaletteColor;
}
const UMBRELLAS: readonly Umbrella[] = [
  { x: 0.2, z: 0.2, poleTop: 0.85, radius: 0.28, a: 'red', b: 'white' },
  { x: -0.22, z: 0.05, poleTop: 1.05, radius: 0.27, a: 'blue', b: 'skyBlue' },
  { x: 0.18, z: -0.24, poleTop: 0.7, radius: 0.25, a: 'pink', b: 'redDark' },
];
const RISE = 0.15;

/** ร่มกระดาษ: open paper umbrellas on a stand. */
export const item: ItemModel = {
  id: 'wagasa-stand',
  name: 'ร่มกระดาษ',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([PLATFORM.w, PLATFORM.h, PLATFORM.w], [0, PLATFORM.h / 2, 0], 'wood'),
      kit.box([PLATFORM.w - 0.1, 0.02, 0.05], [0, PLATFORM.h + 0.01, 0.3], 'woodDark'),
      kit.box([PLATFORM.w - 0.1, 0.02, 0.05], [0, PLATFORM.h + 0.01, -0.3], 'woodDark'),
    ];
    for (const u of UMBRELLAS) {
      const base = PLATFORM.h;
      parts.push(kit.cylinder(0.12, 0.14, 0.06, [u.x, base + 0.03, u.z], 'charcoal', { segments: 8 })); // stand foot
      parts.push(kit.cylinder(0.02, 0.025, u.poleTop - base, [u.x, base + (u.poleTop - base) / 2, u.z], 'woodDark', { segments: 6 }));
      // open canopy: two six-sided cones turned half a facet so the faces alternate in stripes
      const cy = u.poleTop + RISE / 2;
      parts.push(kit.cone(u.radius, RISE, [u.x, cy, u.z], u.a, { segments: 6 }));
      parts.push(kit.cone(u.radius * 1.02, RISE * 1.02, [u.x, cy + 0.0015, u.z], u.b, { segments: 6, rotate: [0, Math.PI / 6, 0], scale: [0.99, 1, 0.99] }));
      parts.push(kit.sphere(0.035, [u.x, u.poleTop + RISE + 0.02, u.z], 'sunYellow', { detail: 0 }));
    }
    return kit.finish(parts);
  },
};
