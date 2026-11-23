import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// 2x3 (long side along z). A farm fish pond with a wooden feeding deck at the +z end, friendly fish at
// the surface, lily pads and reeds. The water is the pond motion.
const RIM_H = 0.04;
const WATER_TOP = 0.05;
const POND = { x: 0, z: -0.3, w: 1.62, d: 2.1 }; // water centre and size
const DECK_Y = 0.24; // top of the deck boards

/** A cartoon fish at the surface: only its back, eyes and tail show. */
function fish(kit: StyleKit, x: number, z: number, yaw: number, color: PaletteColor): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const pt = (lx: number, ly: number, lz: number): Vec3 => [x + lx * c + lz * s, WATER_TOP + ly, z - lx * s + lz * c];
  return [
    kit.sphere(0.09, pt(0, 0.015, 0), color, { scale: [1.6, 0.6, 0.8], rotate: [0, yaw, 0] }),
    kit.cone(0.055, 0.1, pt(-0.2, 0.02, 0), color, { segments: 6, rotate: [0, yaw, -Math.PI / 2], scale: [1, 1, 0.35] }),
    kit.sphere(0.02, pt(0.1, 0.06, 0.05), 'white', { detail: 0 }),
    kit.sphere(0.02, pt(0.1, 0.06, -0.05), 'white', { detail: 0 }),
    kit.sphere(0.011, pt(0.115, 0.065, 0.05), 'charcoal', { detail: 0 }),
    kit.sphere(0.011, pt(0.115, 0.065, -0.05), 'charcoal', { detail: 0 }),
  ];
}

/** บ่อปลา: a farm fish pond with a wooden feeding deck, fish at the surface and water plants. */
export const item: ItemModel = {
  id: 'fish-pond',
  name: 'บ่อปลา',
  category: 'animal',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.98, 0.03, 2.98], [0, 0.015, 0], 'lime'),
      kit.box([POND.w + 0.28, RIM_H, POND.d + 0.28], [POND.x, RIM_H / 2, POND.z], 'sand'), // muddy rim
      kit.box([POND.w, WATER_TOP, POND.d], [POND.x, WATER_TOP / 2, POND.z], 'navy', { motion: { kind: 'water', water: 'pond' } }),
    ];
    // feeding deck on the +z bank, reaching out over the water, on posts
    const dz = 1.05;
    parts.push(
      kit.box([1.0, 0.05, 0.62], [0, DECK_Y - 0.025, dz], 'wood'),
      kit.box([1.0, 0.012, 0.025], [0, DECK_Y + 0.0035, dz - 0.1], 'woodDark'),
      kit.box([1.0, 0.012, 0.025], [0, DECK_Y + 0.0035, dz + 0.1], 'woodDark'),
      kit.box([0.025, 0.012, 0.62], [-0.25, DECK_Y + 0.0035, dz], 'woodDark'),
      kit.box([0.025, 0.012, 0.62], [0.25, DECK_Y + 0.0035, dz], 'woodDark'),
    );
    for (const px of [-0.44, 0.44]) for (const pz of [dz - 0.25, dz + 0.25]) {
      parts.push(kit.cylinder(0.04, 0.045, DECK_Y - 0.05, [px, (DECK_Y - 0.05) / 2, pz], 'woodDark', { segments: 6 }));
    }
    // a rail post on each front corner and a bucket of feed
    for (const px of [-0.44, 0.44]) {
      parts.push(kit.cylinder(0.03, 0.03, 0.22, [px, DECK_Y + 0.11, dz - 0.27], 'wood', { segments: 6 }));
    }
    parts.push(
      kit.box([0.95, 0.03, 0.03], [0, DECK_Y + 0.2, dz - 0.27], 'wood'),
      kit.cylinder(0.1, 0.08, 0.15, [0.25, DECK_Y + 0.075, dz + 0.08], 'orange', { segments: 10 }),
      kit.cylinder(0.085, 0.085, 0.012, [0.25, DECK_Y + 0.152, dz + 0.08], 'sunYellow', { segments: 10 }), // feed pellets
      kit.cylinder(0.07, 0.07, 0.06, [-0.28, DECK_Y + 0.03, dz + 0.05], 'terracotta', { segments: 8 }), // little basket
    );
    // fish
    parts.push(
      ...fish(kit, -0.3, 0.35, 0.5, 'orange'),
      ...fish(kit, 0.3, -0.1, 3.6, 'sunYellow'),
      ...fish(kit, -0.1, -0.8, 1.9, 'white'),
      ...fish(kit, 0.35, -1.0, 5.0, 'orange'),
      ...fish(kit, -0.4, -1.2, 0.2, 'orange'),
    );
    // lily pads with a flower, water plants and reeds
    const pads: Array<[number, number, number]> = [[0.5, 0.45, 0.13], [-0.55, -0.3, 0.15], [0.55, -0.55, 0.12], [0.0, -1.35, 0.13]];
    for (const [x, z, r] of pads) parts.push(kit.cylinder(r, r, 0.02, [x, WATER_TOP + 0.01, z], 'leaf', { segments: 8 }));
    parts.push(
      kit.sphere(0.04, [0.5, WATER_TOP + 0.045, 0.45], 'pink', { detail: 0 }),
      kit.sphere(0.04, [-0.55, WATER_TOP + 0.045, -0.3], 'white', { detail: 0 }),
    );
    const reeds: Array<[number, number, number]> = [
      [-0.85, -1.3, 0.55], [-0.75, -1.38, 0.42], [0.85, -1.32, 0.5], [0.76, -1.4, 0.4], [-0.88, 0.2, 0.46], [0.88, 0.1, 0.5], [0.0, -1.42, 0.38],
    ];
    for (const [x, z, h] of reeds) {
      parts.push(
        kit.cylinder(0.014, 0.022, h, [x, RIM_H + h / 2, z], 'leaf', { segments: 4 }),
        kit.cylinder(0.026, 0.026, 0.1, [x, RIM_H + h + 0.02, z], 'bark', { segments: 6 }),
      );
    }
    // a bush and rocks on the bank
    parts.push(
      kit.sphere(0.2, [0.78, 0.19, 1.2], 'leaf', { detail: 0, scale: [1.2, 0.8, 1] }),
      kit.sphere(0.13, [0.65, 0.15, 1.3], 'leafDark', { detail: 0 }),
      kit.sphere(0.12, [-0.8, 0.12, 1.2], 'stoneDark', { detail: 0, scale: [1.2, 0.7, 1] }),
    );
    return kit.finish(parts);
  },
};
