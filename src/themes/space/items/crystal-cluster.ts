import type { ItemModel } from '../../../models/contract';
import { aim, along } from '../../../models/parts';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// Six-sided glowing crystals (a prism body + a pointed tip) on a small rock base. Colours alternate purple and cyan.
type Crystal = { x: number; z: number; h: number; r: number; tx: number; tz: number; color: PaletteColor };
const CRYSTALS: Crystal[] = [
  { x: 0, z: 0, h: 0.62, r: 0.1, tx: 0, tz: 0, color: 'purple' },
  { x: 0.2, z: 0.12, h: 0.42, r: 0.08, tx: 0.25, tz: 0.15, color: 'skyBlue' },
  { x: -0.2, z: 0.1, h: 0.46, r: 0.08, tx: -0.3, tz: 0.15, color: 'skyBlue' },
  { x: 0.02, z: -0.22, h: 0.4, r: 0.075, tx: 0.05, tz: -0.3, color: 'purple' },
  { x: -0.02, z: 0.3, h: 0.28, r: 0.06, tx: 0.05, tz: 0.35, color: 'teal' },
  { x: 0.32, z: -0.15, h: 0.26, r: 0.055, tx: 0.4, tz: -0.2, color: 'purple' },
  { x: -0.32, z: -0.12, h: 0.24, r: 0.05, tx: -0.4, tz: -0.2, color: 'teal' },
];
const BASE_TOP = 0.06;

/** ผลึกเรืองแสง: a cluster of glowing purple and cyan crystals. */
export const item: ItemModel = {
  id: 'crystal-cluster',
  name: 'ผลึกเรืองแสง',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [kit.cylinder(0.4, 0.45, BASE_TOP, [0, BASE_TOP / 2, 0], 'stoneDark', { segments: 8 })];
    for (const c of CRYSTALS) {
      const len = Math.hypot(c.tx, 1, c.tz);
      const dir: [number, number, number] = [c.tx / len, 1 / len, c.tz / len];
      const bodyH = c.h * 0.65;
      const tipH = c.h * 0.35;
      // the body's bottom rim is lowest: bury it a hair into the base so it never floats
      const base: [number, number, number] = [c.x, BASE_TOP - 0.005, c.z];
      const rotate = aim(dir);
      const glow = { glow: true as const, light: 'breathe' as const, rotate, segments: 6 };
      parts.push(kit.cylinder(c.r, c.r * 1.1, bodyH, along(base, dir, bodyH / 2), c.color, glow));
      parts.push(kit.cone(c.r, tipH, along(base, dir, bodyH + tipH / 2), c.color, glow));
    }
    return kit.finish(parts);
  },
};
