import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { aim, along, heading } from '../../../models/parts';

// 2x2. A round-cornered pond with big round lotus leaves and pink (and one white) lotus flowers.
const WATER_TOP = 0.05;
const POND = { w: 1.5, d: 1.5 };
/** [x, z, radius]: big round leaves lying on the water. */
const LEAVES: Array<[number, number, number]> = [
  [-0.35, 0.3, 0.26], [0.1, 0.5, 0.2], [0.35, -0.2, 0.25], [-0.2, -0.35, 0.2], [0.05, 0.0, 0.17], [-0.55, -0.1, 0.14], [0.5, 0.42, 0.14],
];
/** [x, z, height above the water, petal colour]. */
const FLOWERS: Array<[number, number, number, 'pink' | 'white']> = [
  [-0.25, 0.05, 0.3, 'pink'], [0.3, 0.2, 0.26, 'pink'], [0.0, -0.4, 0.34, 'white'], [0.42, -0.5, 0.22, 'pink'],
];

function lotus(kit: Parameters<ItemModel['build']>[0], x: number, z: number, h: number, petal: 'pink' | 'white'): Part[] {
  const top: Vec3 = [x, WATER_TOP + h, z];
  const parts: Part[] = [
    kit.cylinder(0.014, 0.018, h, [x, WATER_TOP + h / 2, z], 'leaf', { segments: 4 }),
    kit.sphere(0.045, [x, top[1] + 0.02, z], 'sunYellow', { detail: 0 }),
  ];
  for (let k = 0; k < 6; k++) {
    const dir = heading((k / 6) * Math.PI * 2, 1.0);
    parts.push(kit.cone(0.055, 0.17, along([x, top[1], z], dir, 0.08), petal, { segments: 6, rotate: aim(dir), scale: [1, 1, 0.55] }));
  }
  return parts;
}

/** บ่อบัว: a pond with pink lotus flowers and big round leaves. */
export const item: ItemModel = {
  id: 'lotus-pond',
  name: 'บ่อบัว',
  category: 'nature',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.98, 0.03, 1.98], [0, 0.015, 0], 'lime'),
      kit.box([POND.w + 0.3, 0.04, POND.d + 0.3], [0, 0.02, 0], 'sand'), // muddy rim
      kit.box([POND.w, WATER_TOP, POND.d], [0, WATER_TOP / 2, 0], 'navy', { motion: { kind: 'water', water: 'pond' } }),
    ];
    LEAVES.forEach(([x, z, r], i) => {
      parts.push(kit.cylinder(r, r, 0.025, [x, WATER_TOP + 0.0125, z], i % 2 === 0 ? 'leaf' : 'lime', { segments: 10 }));
      parts.push(kit.cylinder(r * 0.12, r * 0.12, 0.03, [x, WATER_TOP + 0.03, z], 'leafDark', { segments: 6 })); // leaf centre
    });
    for (const [x, z, h, c] of FLOWERS) parts.push(...lotus(kit, x, z, h, c));
    // a couple of buds
    for (const [x, z] of [[-0.1, 0.6], [0.6, -0.05]] as Array<[number, number]>) {
      parts.push(
        kit.cylinder(0.012, 0.016, 0.28, [x, WATER_TOP + 0.14, z], 'leaf', { segments: 4 }),
        kit.cone(0.05, 0.12, [x, WATER_TOP + 0.34, z], 'pink', { segments: 6 }),
      );
    }
    // reeds and stones round the bank
    const reeds: Array<[number, number, number]> = [[-0.88, 0.8, 0.5], [-0.8, 0.9, 0.4], [0.88, -0.85, 0.46], [0.78, -0.92, 0.38], [-0.9, -0.85, 0.42]];
    for (const [x, z, h] of reeds) {
      parts.push(
        kit.cylinder(0.014, 0.022, h, [x, 0.04 + h / 2, z], 'leaf', { segments: 4 }),
        kit.cylinder(0.026, 0.026, 0.09, [x, 0.04 + h + 0.015, z], 'bark', { segments: 6 }),
      );
    }
    parts.push(
      kit.sphere(0.12, [0.85, 0.1, 0.8], 'stoneDark', { detail: 0, scale: [1.2, 0.7, 1] }),
      kit.sphere(0.07, [0.72, 0.07, 0.9], 'stone', { detail: 0, scale: [1.2, 0.7, 1] }),
      kit.sphere(0.15, [-0.8, 0.16, -0.1], 'leaf', { detail: 0, scale: [1.2, 0.8, 1] }),
      kit.sphere(0.11, [-0.72, 0.14, 0.05], 'leafDark', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
