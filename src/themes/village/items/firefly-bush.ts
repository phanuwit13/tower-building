import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';

// 1x1. A round bush by the water with a few tiny glowing dots that blink at night.
const R = 0.34;
const CY = 0.34; // main ball centre height
/** Fireflies: [yaw, pitch] on the main ball's surface, and their colour. A few small lights only. */
const FLIES: Array<[number, number, 'sunYellow' | 'lime']> = [
  [0.2, 0.25, 'sunYellow'], [1.5, 0.7, 'lime'], [2.6, 0.1, 'sunYellow'], [3.9, 0.55, 'sunYellow'], [5.0, 0.2, 'lime'], [0.9, -0.1, 'lime'],
];

/** พุ่มไม้หิ่งห้อย: a round bush; tiny fireflies blink in it at night. */
export const item: ItemModel = {
  id: 'firefly-bush',
  name: 'พุ่มไม้หิ่งห้อย',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.98, 0.03, 0.98], [0, 0.015, 0], 'lime'),
      kit.sphere(R, [0, CY, 0], 'leaf', { scale: [1.15, 0.95, 1.15] }),
      kit.sphere(0.24, [0.24, 0.26, 0.2], 'leafDark', { scale: [1, 0.9, 1] }),
      kit.sphere(0.22, [-0.25, 0.25, -0.15], 'leafDark', { scale: [1, 0.9, 1] }),
      kit.sphere(0.2, [-0.1, 0.55, 0.12], 'lime', { scale: [1, 0.8, 1] }),
      kit.sphere(0.16, [0.12, 0.58, -0.1], 'leaf', { detail: 0 }),
      // reeds and a pebble: it grows by the water
      kit.cylinder(0.012, 0.02, 0.45, [0.42, 0.255, -0.32], 'leaf', { segments: 4 }),
      kit.cylinder(0.025, 0.025, 0.09, [0.42, 0.5, -0.32], 'bark', { segments: 6 }),
      kit.cylinder(0.012, 0.02, 0.36, [0.36, 0.21, -0.4], 'leaf', { segments: 4 }),
      kit.sphere(0.07, [-0.4, 0.07, 0.38], 'stoneDark', { detail: 0, scale: [1.2, 0.7, 1] }),
    ];
    for (const [yaw, pitch, color] of FLIES) {
      const p: Vec3 = [
        Math.cos(pitch) * Math.cos(yaw) * (R * 1.15 + 0.01),
        CY + 0.1 + Math.sin(pitch) * R * 0.95,
        -Math.cos(pitch) * Math.sin(yaw) * (R * 1.15 + 0.01),
      ];
      parts.push(kit.sphere(0.024, p, color, { detail: 0, glow: true, light: 'blink' }));
    }
    return kit.finish(parts);
  },
};
