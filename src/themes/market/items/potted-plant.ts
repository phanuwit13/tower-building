import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

// A big street pot with a round shrub. The shrub sways about the soil line; the pot stays.
const SOIL_Y = 0.46;
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, SOIL_Y, 0], amount: 0.07 };

/** กระถางต้นไม้: a big street pot with a round shrub. */
export const item: ItemModel = {
  id: 'potted-plant',
  name: 'กระถางต้นไม้',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.3, 0.3, 0.03, [0, 0.015, 0], 'stone', { segments: 10 }),
      kit.cylinder(0.27, 0.19, 0.38, [0, 0.03 + 0.19, 0], 'terracotta', { segments: 10 }),
      kit.cylinder(0.3, 0.3, 0.06, [0, 0.43, 0], 'redDark', { segments: 10 }),
      kit.cylinder(0.26, 0.26, 0.02, [0, 0.45, 0], 'bark', { segments: 10 }),
      kit.cylinder(0.3, 0.2, 0.03, [0, 0.22, 0], 'sunYellow', { segments: 10, scale: [1.01, 1, 1.01] }),
      // the shrub
      kit.sphere(0.28, [-0.1, 0.74, -0.06], 'leafDark', { motion: SWAY }),
      kit.sphere(0.34, [0.04, 0.83, 0.02], 'leaf', { motion: SWAY }),
      kit.sphere(0.22, [0.12, 0.7, 0.14], 'lime', { motion: SWAY }),
      kit.sphere(0.2, [-0.02, 1.05, 0.0], 'leaf', { motion: SWAY }),
      kit.sphere(0.04, [0.25, 0.97, 0.12], 'pink', { detail: 0, motion: SWAY }),
      kit.sphere(0.04, [-0.12, 1.1, 0.12], 'sunYellow', { detail: 0, motion: SWAY }),
    ];
    // fairy lights wound round the shrub: small glowing bulbs in three colours, swaying with it
    const FAIRY = ['sunYellow', 'pink', 'lime'] as const;
    for (let i = 0; i < 10; i++) {
      const a = i * 2.4;
      const y = 0.62 + i * 0.05;
      const r = 0.36 - Math.abs(y - 0.8) * 0.45;
      parts.push(kit.sphere(0.035, [r * Math.cos(a), y, r * Math.sin(a)], FAIRY[i % 3], { detail: 0, glow: true, light: 'breathe', motion: SWAY }));
    }
    return kit.finish(parts);
  },
};
