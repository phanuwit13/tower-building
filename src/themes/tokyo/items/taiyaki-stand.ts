import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A small teal stand with a red roof and a tray of fish-shaped cakes; a neon fish glows on the roof.
const TOP = 0.62;

/** A cartoon fish lying along z (head towards +z), centred at `at`. */
function fish(kit: StyleKit, at: [number, number, number], len: number, color: PaletteColor, glow = false): Part[] {
  const [x, y, z] = at;
  const g = glow ? { glow: true as const } : {};
  return [
    kit.sphere(len * 0.5, [x, y, z], color, { detail: 0, scale: [0.5, 0.45, 1], ...g }),
    kit.cone(len * 0.22, len * 0.3, [x, y, z - len * 0.62], color, { segments: 4, rotate: [Math.PI / 2, 0, 0], scale: [0.4, 1, 1.6], ...g }),
    kit.sphere(len * 0.06, [x + len * 0.2, y + len * 0.05, z + len * 0.28], 'charcoal', { detail: 0 }),
  ];
}

/** ร้านไทยากิ: a little stand with fish-shaped cakes on a tray. */
export const item: ItemModel = {
  id: 'taiyaki-stand',
  name: 'ร้านไทยากิ',
  category: 'food',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.78, TOP - 0.04, 0.8], [0.02, (TOP - 0.04) / 2, 0], 'terracotta'),
      kit.box([0.84, 0.04, 0.9], [0.02, TOP - 0.02, 0], 'wood'),
      kit.box([0.06, 0.52, 0.86], [-0.4, TOP + 0.26, 0], 'teal'),
      kit.box([0.9, 0.06, 0.96], [0.02, 1.18, 0], 'red'),
      kit.box([0.5, 0.03, 0.56], [0.12, TOP + 0.015, 0], 'stoneDark'),
    ];
    for (const z of [-0.38, 0.38]) parts.push(kit.cylinder(0.03, 0.03, 0.54, [0.4, TOP + 0.27, z], 'woodDark', { segments: 6 }));
    // two rows of three taiyaki on the tray
    for (const x of [0.02, 0.24]) {
      for (const z of [-0.18, 0, 0.18]) parts.push(...fish(kit, [x, TOP + 0.06, z * 1.05], 0.2, 'orange'));
    }
    // neon fish lying on the roof
    parts.push(...fish(kit, [0, 1.31, 0], 0.5, 'skyBlue', true));
    return kit.finish(parts);
  },
};
