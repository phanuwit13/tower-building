import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// 1x1. Raked sand with rocks, pebbles and small succulents.
function succulent(kit: Parameters<ItemModel['build']>[0], x: number, z: number, big: number): Part[] {
  const parts: Part[] = [kit.sphere(0.035 * big, [x, 0.08, z], 'sunYellow', { detail: 0 })];
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    const r = 0.045 * big;
    parts.push(kit.cone(0.03 * big, 0.12 * big, [x + Math.cos(a) * r, 0.085, z + Math.sin(a) * r], k % 2 ? 'mint' : 'leaf', {
      segments: 4,
      rotate: [Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7],
    }));
  }
  return parts;
}

/** สวนหิน: rocks, pebbles and small succulents on raked sand. */
export const item: ItemModel = {
  id: 'rock-garden',
  name: 'สวนหิน',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.98, 0.04, 0.98], [0, 0.02, 0], 'sand'),
      // raked lines
      ...[-0.3, -0.18, 0.18, 0.3].map((z) => kit.box([0.5, 0.012, 0.025], [0.2, 0.044, z], 'cream')),
      // big rocks
      kit.sphere(0.21, [-0.18, 0.19, -0.1], 'stoneDark', { detail: 1, scale: [1.2, 0.85, 1] }),
      kit.sphere(0.14, [-0.1, 0.13, 0.12], 'stone', { detail: 1, scale: [1.1, 0.8, 1] }),
      kit.sphere(0.12, [-0.34, 0.12, 0.14], 'stone', { detail: 0, scale: [1, 0.8, 1] }),
      kit.sphere(0.1, [0.02, 0.1, -0.34], 'stoneDark', { detail: 0, scale: [1.1, 0.7, 1] }),
    ];
    // pebbles
    for (const [x, z] of [[0.3, 0.1], [0.38, 0.22], [0.25, 0.32], [0.4, -0.3], [0.1, 0.4], [-0.4, -0.38]] as const) {
      parts.push(kit.sphere(0.04, [x, 0.06, z], (x + z) % 0.2 > 0.1 ? 'stone' : 'white', { detail: 0, scale: [1.2, 0.7, 1] }));
    }
    parts.push(...succulent(kit, 0.22, -0.18, 1.1), ...succulent(kit, -0.28, 0.36, 0.9), ...succulent(kit, 0.3, 0.38, 0.8));
    return kit.finish(parts);
  },
};
