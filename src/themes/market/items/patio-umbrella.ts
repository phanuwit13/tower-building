import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

// A café umbrella over a small table and two chairs. Only the canopy (with its tip and rim bulbs) sways, about one shared pivot on the pole.
const CANOPY_Y = 1.0;
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, 0.7, 0], amount: 0.11 };

/** ร่มสนาม: a café umbrella over a small table and two chairs. */
export const item: ItemModel = {
  id: 'patio-umbrella',
  name: 'ร่มสนาม',
  category: 'seating',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.14, 0.16, 0.04, [0, 0.02, 0], 'stoneDark', { segments: 8 }),
      kit.cylinder(0.025, 0.025, CANOPY_Y - 0.04, [0, (CANOPY_Y + 0.04) / 2 - 0.02, 0], 'white', { segments: 6 }),
      // the table
      kit.cylinder(0.2, 0.2, 0.035, [0, 0.31, 0], 'wood', { segments: 10 }),
      kit.cylinder(0.04, 0.05, 0.26, [0, 0.17, 0], 'charcoal', { segments: 6, scale: [1, 1, 1] }),
      // striped canopy: two six-sided cones turned half a segment, tip with a ball
      kit.cone(0.42, 0.22, [0, CANOPY_Y + 0.07, 0], 'red', { segments: 6, motion: SWAY }),
      kit.cone(0.42, 0.22, [0, CANOPY_Y + 0.07, 0], 'white', { segments: 6, rotate: [0, Math.PI / 6, 0], scale: [0.99, 1.01, 0.99], motion: SWAY }),
      kit.sphere(0.035, [0, CANOPY_Y + 0.2, 0], 'sunYellow', { detail: 0, motion: SWAY }),
    ];
    // fairy bulbs round the canopy rim, swaying with it
    const RIM = ['sunYellow', 'pink', 'lime', 'orange'] as const;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      parts.push(kit.sphere(0.035, [0.41 * Math.cos(a), CANOPY_Y - 0.02, 0.41 * Math.sin(a)], RIM[i % 4], { detail: 0, glow: true, light: 'breathe', motion: SWAY }));
    }
    for (const s of [-1, 1]) {
      const z = s * 0.33;
      parts.push(
        kit.box([0.12, 0.2, 0.12], [0, 0.1, z], 'charcoal'),
        kit.box([0.17, 0.03, 0.17], [0, 0.21, z], s > 0 ? 'teal' : 'orange'),
        kit.box([0.17, 0.14, 0.03], [0, 0.3, z + s * 0.07], s > 0 ? 'teal' : 'orange'),
      );
    }
    return kit.finish(parts);
  },
};
