import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A short conveyor along z: an orange hopper feeds a dark belt that carries glittering ore.
const BELT_Y = 0.35; // top of the belt
const ORE: { z: number; x: number; r: number; color: PaletteColor }[] = [
  { z: -0.3, x: 0.04, r: 0.08, color: 'purple' },
  { z: -0.08, x: -0.05, r: 0.07, color: 'sunYellow' },
  { z: 0.12, x: 0.05, r: 0.09, color: 'pink' },
  { z: 0.33, x: -0.04, r: 0.07, color: 'skyBlue' },
  { z: 0.52, x: 0.03, r: 0.085, color: 'lime' },
  { z: 0.74, x: -0.02, r: 0.08, color: 'orange' },
];
const ICO = 0.851; // ICO_LOW: how far a detail-0 sphere hangs below its centre, per radius

/** สายพานลำเลียงแร่: a short conveyor carrying chunks of glittering ore. */
export const item: ItemModel = {
  id: 'ore-conveyor',
  name: 'สายพานลำเลียงแร่',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.05, 0.12, 1.88], [-0.17, 0.3, 0], 'charcoal'),
      kit.box([0.05, 0.12, 1.88], [0.17, 0.3, 0], 'charcoal'),
      kit.box([0.3, 0.03, 1.8], [0, BELT_Y - 0.015, 0], 'stoneDark'),
      kit.cylinder(0.07, 0.07, 0.4, [0, 0.29, -0.93], 'chrome', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.07, 0.07, 0.4, [0, 0.29, 0.93], 'chrome', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
    ];
    for (let i = 0; i < 7; i++) parts.push(kit.box([0.28, 0.015, 0.04], [0, BELT_Y + 0.0075, -0.78 + i * 0.26], 'charcoal'));
    for (const z of [-0.6, 0.6]) for (const x of [-0.17, 0.17]) parts.push(kit.box([0.06, 0.24, 0.06], [x, 0.12, z], 'orange'));
    for (const o of ORE) {
      parts.push(
        kit.sphere(o.r, [o.x, BELT_Y + o.r * ICO, o.z], o.color, { detail: 0 }),
        kit.box([0.03, 0.03, 0.03], [o.x + 0.03, BELT_Y + o.r * 1.5, o.z + 0.02], 'white', { rotate: [0.6, 0.6, 0] }),
      );
    }
    // hopper over the start of the belt
    parts.push(
      kit.cylinder(0.3, 0.2, 0.3, [0, 0.57, -0.6], 'orange', { segments: 8 }),
      kit.cylinder(0.31, 0.31, 0.04, [0, 0.74, -0.6], 'sunYellow', { segments: 8 }),
      kit.cylinder(0.24, 0.24, 0.01, [0, 0.765, -0.6], 'charcoal', { segments: 8 }),
    );
    for (const [x, z] of [[0.235, -0.6], [-0.235, -0.6]]) parts.push(kit.box([0.05, 0.22, 0.05], [x, 0.46, z], 'charcoal'));
    return kit.finish(parts);
  },
};
