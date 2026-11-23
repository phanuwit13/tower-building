import type { ItemModel } from '../../../models/contract';
import { ICO_LOW } from '../../../models/parts';
import type { Part } from '../../../models/kit';

// A cluster of grey and lilac boulders; detail-0 balls squashed a little, resting on the ground.
type Rock = { x: number; z: number; r: number; sy: number; color: 'stone' | 'stoneDark' | 'purple' | 'charcoal'; yaw: number };
const ROCKS: Rock[] = [
  { x: 0.05, z: 0.0, r: 0.42, sy: 0.9, color: 'stoneDark', yaw: 0.3 },
  { x: 0.55, z: 0.45, r: 0.3, sy: 0.85, color: 'purple', yaw: 1.1 },
  { x: -0.5, z: 0.4, r: 0.28, sy: 1.0, color: 'stone', yaw: 2.0 },
  { x: -0.1, z: -0.6, r: 0.3, sy: 0.8, color: 'purple', yaw: 0.7 },
  { x: 0.6, z: -0.45, r: 0.22, sy: 0.9, color: 'stone', yaw: 1.7 },
  { x: -0.7, z: -0.4, r: 0.17, sy: 0.9, color: 'charcoal', yaw: 0.2 },
  { x: 0.25, z: 0.85, r: 0.13, sy: 0.9, color: 'stoneDark', yaw: 0.9 },
  { x: -0.4, z: 0.85, r: 0.1, sy: 0.9, color: 'stone', yaw: 0.4 },
];

/** กองหินดวงจันทร์: a cluster of grey and lilac boulders. */
export const item: ItemModel = {
  id: 'moon-rocks',
  name: 'กองหินดวงจันทร์',
  category: 'nature',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = ROCKS.map((k) =>
      kit.sphere(k.r, [k.x, k.r * k.sy * ICO_LOW, k.z], k.color, { detail: 0, scale: [1, k.sy, 1], rotate: [0, k.yaw, 0] }),
    );
    return kit.finish(parts);
  },
};
