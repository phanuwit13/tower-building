import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { gableRoof } from '../../../models/parts';

// A wooden street cart: red gable roof on four posts, a plain navy noren curtain, two red paper lanterns that breathe
// (no writing), three steaming bowls and a pot on the counter, and a neon bowl (orange) on the ridge.
const TOP = 0.62;
const ROOF_Y = 1.17;

/** แผงราเมน: a wooden street cart with a lantern, a curtain and steaming bowls. */
export const item: ItemModel = {
  id: 'ramen-stall',
  name: 'แผงราเมน',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.7, 0.38, 1.4], [0, 0.39, 0], 'wood'),
      kit.box([0.78, 0.04, 1.5], [0, TOP - 0.02, 0], 'woodDark'),
      kit.box([0.02, 0.26, 1.2], [0.36, 0.39, 0], 'redDark'),
      // handle at the back
      kit.box([0.04, 0.04, 0.3], [-0.2, 0.5, -0.82], 'woodDark'),
      kit.box([0.04, 0.04, 0.3], [0.2, 0.5, -0.82], 'woodDark'),
    ];
    for (const x of [-0.37, 0.37]) {
      for (const z of [-0.5, 0.5]) {
        parts.push(kit.cylinder(0.2, 0.2, 0.06, [x, 0.2, z], 'woodDark', { segments: 12, rotate: [0, 0, Math.PI / 2] }));
        parts.push(kit.cylinder(0.06, 0.06, 0.08, [x * 1.04, 0.2, z], 'stone', { segments: 6, rotate: [0, 0, Math.PI / 2] }));
      }
    }
    for (const x of [-0.33, 0.33]) {
      for (const z of [-0.65, 0.65]) parts.push(kit.cylinder(0.025, 0.025, ROOF_Y - TOP, [x, (TOP + ROOF_Y) / 2, z], 'woodDark', { segments: 6 }));
    }
    parts.push(...gableRoof(kit, { at: [0, ROOF_Y, 0], length: 1.6, width: 0.74, rise: 0.2, eave: 0.05, color: 'red', ridge: 'redDark' }));
    // noren curtain: four plain navy strips hanging from the front eave, with a plain rod
    parts.push(kit.box([0.03, 0.03, 1.0], [0.38, ROOF_Y - 0.02, 0], 'woodDark'));
    for (let i = 0; i < 4; i++) parts.push(kit.box([0.02, 0.28, 0.22], [0.38, ROOF_Y - 0.17, (i - 1.5) * 0.24], 'navy'));
    // lanterns
    for (const z of [-0.72, 0.72]) {
      parts.push(
        kit.cylinder(0.012, 0.012, 0.1, [0.38, ROOF_Y - 0.05, z], 'charcoal', { segments: 4 }),
        kit.sphere(0.1, [0.38, ROOF_Y - 0.2, z], 'red', { detail: 1, scale: [1, 1.2, 1], glow: true, light: 'breathe' }),
      );
    }
    // pot and bowls
    parts.push(
      kit.cylinder(0.16, 0.16, 0.2, [-0.22, TOP + 0.1, -0.1], 'chrome', { segments: 10 }),
      kit.sphere(0.045, [-0.22, TOP + 0.3, -0.1], 'white', { detail: 0 }),
      kit.sphere(0.06, [-0.2, TOP + 0.4, -0.08], 'white', { detail: 0 }),
    );
    for (const z of [-0.42, 0.0, 0.4]) {
      parts.push(
        kit.dome(0.1, [0.16, TOP + 0.08, z], 'white', { segments: 8, scale: [1, -0.8, 1] }),
        kit.cylinder(0.088, 0.088, 0.016, [0.16, TOP + 0.065, z], 'sunYellow', { segments: 8 }),
        kit.sphere(0.03, [0.2, TOP + 0.085, z - 0.03], 'white', { detail: 0, scale: [1, 0.7, 1] }),
        kit.cylinder(0.03, 0.03, 0.012, [0.12, TOP + 0.082, z + 0.03], 'pink', { segments: 8 }),
        kit.sphere(0.02, [0.15, TOP + 0.085, z + 0.06], 'leaf', { detail: 0 }),
        kit.sphere(0.028, [0.16, TOP + 0.24, z], 'white', { detail: 0 }),
        kit.sphere(0.036, [0.15, TOP + 0.32, z], 'white', { detail: 0 }),
      );
    }
    // neon ramen bowl on the ridge, with two chopsticks
    parts.push(
      kit.cylinder(0.02, 0.02, 0.1, [0, 1.42, 0], 'woodDark', { segments: 6 }),
      kit.dome(0.14, [0, 1.52, 0], 'orange', { segments: 8, scale: [1, -0.7, 1], glow: true }),
      kit.box([0.02, 0.02, 0.24], [0.05, 1.56, 0], 'sunYellow', { glow: true, rotate: [0, 0.2, 0.3] }),
      kit.box([0.02, 0.02, 0.24], [-0.03, 1.56, 0], 'sunYellow', { glow: true, rotate: [0, 0.2, 0.3] }),
    );
    return kit.finish(parts);
  },
};
