import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// An ornate city lamp: fluted navy pole on a stepped base, brass fittings and two curled arms, with a
// warm main globe on top and two small side globes. All globes breathe.
const BREATHE = { glow: true, light: 'breathe' } as const;

/** เสาไฟถนน: an ornate city street lamp with a warm globe. */
export const item: ItemModel = {
  id: 'street-lamp',
  name: 'เสาไฟถนน',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.2, 0.24, 0.1, [0, 0.05, 0], 'charcoal', { segments: 8 }),
      kit.cylinder(0.1, 0.16, 0.16, [0, 0.18, 0], 'navy', { segments: 8 }),
      kit.cylinder(0.12, 0.12, 0.04, [0, 0.28, 0], 'brass', { segments: 8 }),
      kit.cylinder(0.05, 0.05, 1.0, [0, 0.8, 0], 'navy', { segments: 8 }),
      kit.cylinder(0.08, 0.08, 0.05, [0, 0.55, 0], 'brass', { segments: 8 }),
      kit.cylinder(0.08, 0.08, 0.05, [0, 1.05, 0], 'brass', { segments: 8 }),
      // crossbar with two curled arms
      kit.box([0.04, 0.04, 0.56], [0, 1.1, 0], 'navy'),
      kit.torus(0.08, 0.02, [0, 1.0, 0.1], 'brass', { radialSegments: 4, tubularSegments: 8, rotate: [0, Math.PI / 2, 0] }),
      kit.torus(0.08, 0.02, [0, 1.0, -0.1], 'brass', { radialSegments: 4, tubularSegments: 8, rotate: [0, Math.PI / 2, 0] }),
      kit.cylinder(0.04, 0.05, 0.05, [0, 1.2, 0.28], 'brass', { segments: 8 }),
      kit.cylinder(0.04, 0.05, 0.05, [0, 1.2, -0.28], 'brass', { segments: 8 }),
      kit.sphere(0.1, [0, 1.3, 0.28], 'lampWarm', { ...BREATHE }),
      kit.sphere(0.1, [0, 1.3, -0.28], 'lampWarm', { ...BREATHE }),
      // main globe, cap and finial
      kit.cylinder(0.13, 0.07, 0.08, [0, 1.19, 0], 'navy', { segments: 8 }),
      kit.sphere(0.17, [0, 1.36, 0], 'lampWarm', { ...BREATHE }),
      kit.cylinder(0.02, 0.15, 0.1, [0, 1.58, 0], 'navy', { segments: 8 }),
      kit.sphere(0.04, [0, 1.65, 0], 'brass', { detail: 0 }),
    ];
    return kit.finish(parts);
  },
};
