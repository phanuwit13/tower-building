import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// 2x2. Three shrubs trimmed into an elephant, a rabbit and a bird, each on a stone plinth. All face +x.
const BASE = 0.04;
const PL = 0.07; // plinth height
const TOP = BASE + PL; // where the animals stand

/** สวนไม้ดัดรูปสัตว์: shrubs trimmed into an elephant, a rabbit and a bird. */
export const item: ItemModel = {
  id: 'topiary-garden',
  name: 'สวนไม้ดัดรูปสัตว์',
  category: 'nature',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1.96, BASE, 1.96], [0, BASE / 2, 0], 'lime')];
    const plinth = (x: number, z: number, w: number, d: number) =>
      parts.push(kit.box([w, PL, d], [x, BASE + PL / 2, z], 'stone'));

    // elephant (back left, bigger)
    {
      const x = -0.15, z = -0.5;
      plinth(x, z, 1.1, 0.7);
      for (const dx of [-0.2, 0.18]) for (const dz of [-0.13, 0.13]) {
        parts.push(kit.cylinder(0.07, 0.07, 0.2, [x + dx, TOP + 0.1, z + dz], 'leafDark', { segments: 8 }));
      }
      parts.push(
        kit.sphere(0.25, [x - 0.02, TOP + 0.34, z], 'leaf', { scale: [1.3, 0.95, 0.9] }),
        kit.sphere(0.17, [x + 0.34, TOP + 0.45, z], 'leaf'),
        rod(kit, [x + 0.46, TOP + 0.43, z], [x + 0.55, TOP + 0.1, z], 0.05, 'leaf', { segments: 6 }),
        kit.sphere(0.1, [x + 0.24, TOP + 0.5, z - 0.19], 'leafDark', { detail: 0, scale: [0.4, 1.1, 1] }),
        kit.sphere(0.1, [x + 0.24, TOP + 0.5, z + 0.19], 'leafDark', { detail: 0, scale: [0.4, 1.1, 1] }),
        kit.sphere(0.03, [x + 0.46, TOP + 0.5, z - 0.1], 'charcoal', { detail: 0 }),
        kit.sphere(0.03, [x + 0.46, TOP + 0.5, z + 0.1], 'charcoal', { detail: 0 }),
        kit.sphere(0.05, [x - 0.33, TOP + 0.32, z], 'lime', { detail: 0 }),
      );
    }
    // rabbit (front right)
    {
      const x = 0.5, z = 0.45;
      plinth(x, z, 0.6, 0.6);
      parts.push(
        kit.sphere(0.2, [x - 0.04, TOP + 0.24, z], 'leaf', { scale: [1.05, 1, 0.95] }),
        kit.sphere(0.13, [x + 0.13, TOP + 0.5, z], 'leaf'),
        kit.sphere(0.055, [x + 0.08, TOP + 0.74, z - 0.055], 'leafDark', { detail: 0, scale: [0.6, 2.6, 0.5] }),
        kit.sphere(0.055, [x + 0.08, TOP + 0.74, z + 0.055], 'leafDark', { detail: 0, scale: [0.6, 2.6, 0.5] }),
        kit.sphere(0.06, [x - 0.26, TOP + 0.2, z], 'lime', { detail: 0 }),
        kit.sphere(0.025, [x + 0.24, TOP + 0.52, z - 0.05], 'charcoal', { detail: 0 }),
        kit.sphere(0.025, [x + 0.24, TOP + 0.52, z + 0.05], 'charcoal', { detail: 0 }),
        kit.sphere(0.04, [x + 0.14, TOP + 0.1, z - 0.12], 'leafDark', { detail: 0 }),
        kit.sphere(0.04, [x + 0.14, TOP + 0.1, z + 0.12], 'leafDark', { detail: 0 }),
      );
    }
    // bird (front left)
    {
      const x = -0.5, z = 0.45;
      plinth(x, z, 0.6, 0.6);
      parts.push(
        kit.sphere(0.19, [x - 0.02, TOP + 0.26, z], 'leaf', { scale: [1.2, 1, 0.9] }),
        kit.sphere(0.11, [x + 0.17, TOP + 0.48, z], 'leaf'),
        kit.cone(0.045, 0.14, [x + 0.34, TOP + 0.47, z], 'orange', { segments: 6, rotate: [0, 0, -Math.PI / 2] }),
        kit.cone(0.08, 0.26, [x - 0.3, TOP + 0.3, z], 'leafDark', { segments: 6, rotate: [0, 0, Math.PI / 2 + 0.3] }),
        kit.sphere(0.12, [x - 0.02, TOP + 0.3, z - 0.15], 'leafDark', { detail: 0, scale: [1.2, 0.6, 0.4] }),
        kit.sphere(0.12, [x - 0.02, TOP + 0.3, z + 0.15], 'leafDark', { detail: 0, scale: [1.2, 0.6, 0.4] }),
        kit.sphere(0.025, [x + 0.25, TOP + 0.52, z - 0.07], 'charcoal', { detail: 0 }),
        kit.sphere(0.025, [x + 0.25, TOP + 0.52, z + 0.07], 'charcoal', { detail: 0 }),
        kit.cylinder(0.02, 0.02, 0.07, [x + 0.02, TOP + 0.035, z - 0.06], 'orange', { segments: 4 }),
        kit.cylinder(0.02, 0.02, 0.07, [x + 0.02, TOP + 0.035, z + 0.06], 'orange', { segments: 4 }),
      );
    }
    // a few flowers in the free corner (back right)
    for (const [fx, fz, c] of [[0.5, -0.5, 'pink'], [0.7, -0.35, 'sunYellow'], [0.35, -0.7, 'red'], [0.7, -0.7, 'purple'], [0.55, -0.2, 'orange']] as const) {
      parts.push(
        kit.sphere(0.07, [fx, BASE + 0.05, fz], 'leaf', { detail: 0 }),
        kit.sphere(0.055, [fx, BASE + 0.12, fz], c, { detail: 0 }),
      );
    }
    return kit.finish(parts);
  },
};
