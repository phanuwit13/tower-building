import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { bird } from './hen-and-chicks';

const FLOOR_H = 0.03;
const E = 0.93; // fence line
const FENCE_H = 0.4;
const HOUSE = { x0: -0.93, x1: -0.25, hz: 0.45, wall: 0.5, rise: 0.25 };

/** เล้าไก่: a wooden coop with a wire run, a hen, a rooster (an ordinary farm bird) and chicks. */
export const item: ItemModel = {
  id: 'chicken-coop',
  name: 'เล้าไก่',
  category: 'animal',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1.98, FLOOR_H, 1.98], [0, FLOOR_H / 2, 0], 'sand')];
    // the coop house against the back (-x): walls, a red gable roof, a door with a step and a nesting box
    const hx = (HOUSE.x0 + HOUSE.x1) / 2;
    const hw = HOUSE.x1 - HOUSE.x0;
    parts.push(
      kit.box([hw, HOUSE.wall, HOUSE.hz * 2], [hx, FLOOR_H + HOUSE.wall / 2, 0], 'wood'),
      kit.wedge([HOUSE.hz * 2 + 0.16, HOUSE.rise, hw + 0.04], [hx, FLOOR_H + HOUSE.wall + HOUSE.rise / 2, 0], 'red', { rotate: [0, Math.PI / 2, 0] }),
      kit.box([0.03, 0.3, 0.26], [HOUSE.x1 + 0.005, FLOOR_H + 0.2, 0], 'woodDark'),
      kit.box([0.14, 0.04, 0.3], [HOUSE.x1 + 0.07, FLOOR_H + 0.02, 0], 'wood'),
      kit.box([0.04, 0.12, 0.7], [hx, FLOOR_H + 0.44, 0.0], 'woodDark', { scale: [1, 0.0001 + 1, 1] }),
      kit.box([0.3, 0.2, 0.2], [hx, FLOOR_H + 0.15, HOUSE.hz + 0.1], 'woodDark'),
      kit.box([0.34, 0.03, 0.24], [hx, FLOOR_H + 0.265, HOUSE.hz + 0.1], 'redDark'),
    );
    // wire run: posts, top and bottom rails, thin vertical wires
    const post = (x: number, z: number): Part => kit.box([0.06, FENCE_H + 0.04, 0.06], [x, FLOOR_H + (FENCE_H + 0.04) / 2, z], 'woodDark');
    for (const p of [-E, -0.31, 0.31, E]) {
      for (const q of [-E, E]) parts.push(post(p, q), ...(Math.abs(p) < E ? [post(q, p)] : []));
    }
    for (const q of [-E, E]) {
      parts.push(
        kit.box([2 * E, 0.035, 0.035], [0, FLOOR_H + FENCE_H, q], 'wood'),
        kit.box([0.035, 0.035, 2 * E], [q, FLOOR_H + FENCE_H, 0], 'wood'),
        kit.box([2 * E, 0.03, 0.03], [0, FLOOR_H + 0.05, q], 'wood'),
        kit.box([0.03, 0.03, 2 * E], [q, FLOOR_H + 0.05, 0], 'wood'),
      );
    }
    for (let i = -4; i <= 4; i++) {
      const w = i * 0.2 + 0.1 * (i > 0 ? -1 : 1) * 0; // evenly spaced wires
      for (const q of [-E, E]) {
        parts.push(kit.box([0.02, FENCE_H - 0.05, 0.02], [w, FLOOR_H + 0.05 + (FENCE_H - 0.05) / 2, q], 'chrome'));
        if (q === E || Math.abs(w) > 0.05) parts.push(kit.box([0.02, FENCE_H - 0.05, 0.02], [q, FLOOR_H + 0.05 + (FENCE_H - 0.05) / 2, w], 'chrome'));
      }
    }
    // feeder and water dish
    parts.push(
      kit.cylinder(0.1, 0.12, 0.06, [0.1, FLOOR_H + 0.03, -0.6], 'orange', { segments: 10 }),
      kit.cylinder(0.08, 0.08, 0.02, [0.1, FLOOR_H + 0.06, -0.6], 'sunYellow', { segments: 10 }),
      kit.cylinder(0.08, 0.09, 0.05, [0.4, FLOOR_H + 0.025, 0.7], 'blue', { segments: 10 }),
    );
    parts.push(
      ...bird(kit, FLOOR_H, { x: 0.2, z: 0.3, yaw: -0.5, k: 0.75, kind: 'hen', body: 'white', wing: 'sand', tail: ['sand'] }),
      ...bird(kit, FLOOR_H, { x: 0.35, z: -0.25, yaw: 0.2, k: 0.8, kind: 'rooster', body: 'orange', wing: 'terracotta', tail: ['redDark', 'leafDark', 'teal'] }),
      ...bird(kit, FLOOR_H, { x: 0.6, z: 0.5, yaw: -1.0, k: 0.5, kind: 'chick', body: 'sunYellow', wing: 'orange', peck: true }),
      ...bird(kit, FLOOR_H, { x: -0.1, z: 0.7, yaw: -0.2, k: 0.5, kind: 'chick', body: 'sunYellow', wing: 'orange', peck: true }),
      ...bird(kit, FLOOR_H, { x: 0.05, z: -0.1, yaw: 1.0, k: 0.5, kind: 'chick', body: 'sunYellow', wing: 'orange' }),
    );
    return kit.finish(parts);
  },
};
