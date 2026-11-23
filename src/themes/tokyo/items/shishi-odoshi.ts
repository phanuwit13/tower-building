import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { aim, along } from '../../../models/parts';

// 1x1. A bamboo water knocker over a stone basin. The bamboo tips about one axle (swing, axis z).
const PIVOT = [0, 0.66, 0] as const;
const REST = 0.25; // rest tilt of the bamboo, front end down
const HALF = 0.36; // half the bamboo length
const SWING: MotionOpts = { kind: 'swing', pivot: [PIVOT[0], PIVOT[1], PIVOT[2]], axis: [0, 0, 1], amount: 0.25, speed: 1 };

/** กระบอกไม้ไผ่กระดก: a bamboo tube that tips over a stone basin. */
export const item: ItemModel = {
  id: 'shishi-odoshi',
  name: 'กระบอกไม้ไผ่กระดก',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const dir: [number, number, number] = [Math.cos(REST), -Math.sin(REST), 0];
    const centre: [number, number, number] = [PIVOT[0], PIVOT[1], PIVOT[2]];
    const parts: Part[] = [
      kit.box([0.98, 0.03, 0.98], [0, 0.015, 0], 'sand'),
      kit.cylinder(0.34, 0.37, 0.22, [0, 0.11, 0], 'stoneDark', { segments: 12 }),
      kit.cylinder(0.27, 0.27, 0.23, [0, 0.115, 0], 'navy', { segments: 12, motion: { kind: 'water', water: 'pond' } }),
      // frame: two posts either side of the basin and the axle
      kit.cylinder(0.035, 0.04, 0.82, [0, 0.41, 0.42], 'woodDark', { segments: 6 }),
      kit.cylinder(0.035, 0.04, 0.82, [0, 0.41, -0.42], 'woodDark', { segments: 6 }),
      kit.cylinder(0.025, 0.025, 0.84, [0, PIVOT[1], 0], 'wood', { segments: 6, rotate: [Math.PI / 2, 0, 0] }),
      // bamboo tube (moves) with nodes and a darker open mouth
      kit.cylinder(0.06, 0.06, 2 * HALF, centre, 'leaf', { segments: 8, rotate: aim(dir), motion: SWING }),
      kit.cylinder(0.068, 0.068, 0.035, along(centre, dir, -0.2), 'lime', { segments: 8, rotate: aim(dir), motion: SWING }),
      kit.cylinder(0.068, 0.068, 0.035, along(centre, dir, 0.2), 'lime', { segments: 8, rotate: aim(dir), motion: SWING }),
      kit.cylinder(0.05, 0.05, 0.03, along(centre, dir, HALF - 0.005), 'leafDark', { segments: 8, rotate: aim(dir), motion: SWING }),
    ];
    // a tiny bamboo clump and pebbles in the back corner
    for (const [x, z, h] of [[-0.38, 0.3, 0.7], [-0.32, 0.38, 0.55], [-0.4, 0.4, 0.62]] as Array<[number, number, number]>) {
      parts.push(kit.cylinder(0.025, 0.03, h, [x, 0.03 + h / 2, z], 'leaf', { segments: 6 }), kit.cylinder(0.032, 0.032, 0.02, [x, 0.03 + h * 0.5, z], 'lime', { segments: 6 }));
    }
    parts.push(kit.sphere(0.06, [0.38, 0.06, -0.38], 'stone', { detail: 0, scale: [1.2, 0.7, 1] }), kit.sphere(0.05, [0.32, 0.05, -0.42], 'stoneDark', { detail: 0 }));
    return kit.finish(parts);
  },
};
