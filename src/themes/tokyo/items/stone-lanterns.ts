import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';

// 1x2. Two stone garden lanterns on gravel; the lit windows glow at night (they breathe).
/** [z, scale]: one a little taller than the other. */
const LANTERNS: Array<[number, number]> = [[0.5, 1], [-0.5, 0.88]];

function lantern(kit: StyleKit, z: number, s: number): Part[] {
  const base = 0.03;
  const y1 = base + 0.06 * s; // top of the foot
  const y2 = y1 + 0.3 * s; // top of the stem
  const fire = 0.2 * s; // fire box height
  const half = 0.1 * s;
  const y3 = y2 + 0.04 * s + fire; // top of the fire box
  const parts: Part[] = [
    kit.cylinder(0.12 * s, 0.14 * s, 0.06 * s + 0.01, [0, base + (0.06 * s) / 2, z], 'stoneDark', { segments: 8 }),
    kit.cylinder(0.045 * s, 0.055 * s, 0.3 * s, [0, y1 + 0.15 * s, z], 'stone', { segments: 8 }),
    kit.box([0.28 * s, 0.04 * s, 0.28 * s], [0, y2 + 0.02 * s, z], 'stoneDark'),
    kit.box([2 * half - 0.03, fire - 0.02, 2 * half - 0.03], [0, y2 + 0.04 * s + fire / 2, z], 'lampWarm', { glow: true, light: 'breathe' }),
    kit.box([0.3 * s, 0.03 * s, 0.3 * s], [0, y3 + 0.015 * s, z], 'stoneDark'),
    kit.cone(0.3 * s, 0.17 * s, [0, y3 + 0.03 * s + 0.085 * s, z], 'stone', { segments: 4, rotate: [0, Math.PI / 4, 0] }),
    kit.sphere(0.045 * s, [0, y3 + 0.2 * s, z], 'sunYellow', { detail: 0 }),
  ];
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) parts.push(kit.box([0.04 * s, fire, 0.04 * s], [sx * half, y2 + 0.04 * s + fire / 2, z + sz * half], 'stone'));
  }
  return parts;
}

/** ตะเกียงหินคู่: a pair of stone lanterns. */
export const item: ItemModel = {
  id: 'stone-lanterns',
  name: 'ตะเกียงหินคู่',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.98, 0.03, 1.98], [0, 0.015, 0], 'sand')];
    for (const z of [-0.8, -0.2, 0.2, 0.8]) parts.push(kit.box([0.84, 0.012, 0.025], [0, 0.036, z], 'stone')); // raked lines
    for (const [z, s] of LANTERNS) parts.push(...lantern(kit, z, s));
    parts.push(kit.sphere(0.09, [0.3, 0.07, 0.05], 'stoneDark', { detail: 0, scale: [1.2, 0.7, 1] }), kit.sphere(0.07, [-0.32, 0.06, -0.05], 'stone', { detail: 0, scale: [1.2, 0.7, 1] }));
    return kit.finish(parts);
  },
};
