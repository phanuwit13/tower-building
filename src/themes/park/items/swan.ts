import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { rod } from '../../../models/parts';

// 1×1. A white swan with an orange beak, gliding on a small round pool.
const POOL = { rim: 0.46, water: 0.4, rimTop: 0.07, top: 0.08 };
const K = 0.36; // swan size (head top about 0.3 above the ground)
const YAW = 0.35;

/** หงส์ขาว: a friendly white swan on a little pool. */
export const item: ItemModel = {
  id: 'swan',
  name: 'หงส์ขาว',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const c = Math.cos(YAW);
    const s = Math.sin(YAW);
    const at = (f: number, side: number, up: number): Vec3 => [(f * c + side * s) * K, POOL.top + up * K, (-f * s + side * c) * K];
    const rotate: Vec3 = [0, YAW, 0];
    const parts: Part[] = [
      kit.box([0.98, 0.03, 0.98], [0, 0.015, 0], 'lime'),
      kit.cylinder(POOL.rim, POOL.rim, POOL.rimTop, [0, POOL.rimTop / 2, 0], 'stone', { segments: 16 }),
      kit.cylinder(POOL.water, POOL.water, POOL.top, [0, POOL.top / 2, 0], 'navy', { segments: 16, motion: { kind: 'water', water: 'pond' } }),
      // body, wings and a pointed tail
      kit.sphere(0.2 * K, at(0, 0, 0.08), 'white', { scale: [1.5, 0.8, 0.95], rotate }),
      kit.sphere(0.15 * K, at(-0.02, 0.1, 0.15), 'cream', { detail: 0, scale: [1.5, 0.6, 0.5], rotate: [0, YAW, 0.12] }),
      kit.sphere(0.15 * K, at(-0.02, -0.1, 0.15), 'cream', { detail: 0, scale: [1.5, 0.6, 0.5], rotate: [0, YAW, -0.12] }),
      kit.cone(0.09 * K, 0.22 * K, at(-0.3, 0, 0.14), 'white', { segments: 6, rotate: [0, YAW, 1.2], scale: [1, 1, 1.6] }),
      // S-curved neck, head, beak with a dark bridge, eyes
      rod(kit, at(0.2, 0, 0.14), at(0.28, 0, 0.3), 0.045 * K * 1.4, 'white', { segments: 6 }),
      rod(kit, at(0.28, 0, 0.3), at(0.25, 0, 0.5), 0.04 * K * 1.4, 'white', { segments: 6 }),
      kit.sphere(0.07 * K, at(0.29, 0, 0.56), 'white', { detail: 0 }),
      kit.cone(0.03 * K, 0.11 * K, at(0.39, 0, 0.545), 'orange', { segments: 6, rotate: [0, YAW, -Math.PI / 2] }),
      kit.sphere(0.014, at(0.31, 0.045, 0.59), 'charcoal', { detail: 0 }),
      kit.sphere(0.014, at(0.31, -0.045, 0.59), 'charcoal', { detail: 0 }),
    ];
    // lily pads and reeds on the rim
    for (const [x, z, r] of [[-0.22, 0.2, 0.08], [0.24, -0.22, 0.07]] as Array<[number, number, number]>) {
      parts.push(kit.cylinder(r, r, 0.02, [x, POOL.top + 0.01, z], 'leaf', { segments: 8 }));
    }
    parts.push(kit.sphere(0.03, [-0.22, POOL.top + 0.04, 0.2], 'pink', { detail: 0 }));
    for (const [x, z, h] of [[-0.42, -0.42, 0.34], [-0.36, -0.46, 0.26]] as Array<[number, number, number]>) {
      parts.push(
        kit.cylinder(0.014, 0.022, h, [x, 0.03 + h / 2, z], 'leaf', { segments: 4 }),
        kit.cylinder(0.026, 0.026, 0.08, [x, 0.03 + h + 0.015, z], 'bark', { segments: 6 }),
      );
    }
    return kit.finish(parts);
  },
};
