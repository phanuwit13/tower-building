import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { aim } from '../../../models/parts';

// A water channel along z: a flat top run (-z end), a slope, and a splash pool at the +z end. A log boat sits on the slope.
const TOP_Y = 0.95; // floor of the top run
const TOP_Z = [-1.45, -0.85] as const;
const SLOPE = { z0: -0.85, y0: TOP_Y, z1: 0.35, y1: 0.2 }; // floor line of the slope (high to low)
const TROUGH_W = 0.62;
const FLOOR_T = 0.06;
const RAIL = { w: 0.07, h: 0.16, x: 0.34 };
const POOL = { z0: 0.3, z1: 1.45, wall: 0.1, wallH: 0.22, floor: 0.06, waterTop: 0.16 };
const WATER: MotionOpts = { kind: 'water', water: 'pool' };

/** รางน้ำซุง: a flume with a flat start, a slope, a log boat and a big splash pool. */
export const item: ItemModel = {
  id: 'log-flume',
  name: 'รางน้ำซุง',
  category: 'ride',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [];
    const topLen = TOP_Z[1] - TOP_Z[0];
    const topMid = (TOP_Z[0] + TOP_Z[1]) / 2;
    // top run: wooden floor, rails and a little flat water
    parts.push(
      kit.box([TROUGH_W, FLOOR_T, topLen], [0, TOP_Y, topMid], 'woodDark'),
      kit.box([TROUGH_W - 0.1, 0.03, topLen - 0.04], [0, TOP_Y + FLOOR_T / 2 + 0.015, topMid], 'skyBlue', { motion: WATER }),
    );
    for (const s of [-1, 1]) parts.push(kit.box([RAIL.w, RAIL.h, topLen], [s * RAIL.x, TOP_Y + RAIL.h / 2 - 0.03, topMid], 'wood'));
    // the slope, tilted about x so +z goes downhill
    const dz = SLOPE.z1 - SLOPE.z0;
    const dy = SLOPE.y0 - SLOPE.y1;
    const alpha = Math.atan2(dy, dz);
    const len = Math.hypot(dz, dy);
    const mid: [number, number] = [(SLOPE.z0 + SLOPE.z1) / 2, (SLOPE.y0 + SLOPE.y1) / 2];
    parts.push(kit.box([TROUGH_W, FLOOR_T, len + 0.1], [0, mid[1], mid[0]], 'blue', { rotate: [alpha, 0, 0] }));
    const up: [number, number] = [Math.cos(alpha), Math.sin(alpha)]; // normal (y, z) of the slope
    for (const s of [-1, 1]) {
      parts.push(kit.box([RAIL.w, RAIL.h, len + 0.1], [s * RAIL.x, mid[1] + up[0] * (RAIL.h / 2 - 0.03), mid[0] + up[1] * (RAIL.h / 2 - 0.03)], 'wood', { rotate: [alpha, 0, 0] }));
    }
    // supports under the slope and the top run
    const floorY = (z: number): number => SLOPE.y0 - ((z - SLOPE.z0) / dz) * dy;
    for (const z of [-1.4, -0.9, -0.45, 0, 0.3]) {
      const top = z < SLOPE.z0 ? TOP_Y - FLOOR_T / 2 : floorY(z) - 0.06;
      for (const s of [-1, 1]) parts.push(kit.box([0.1, top, 0.1], [s * RAIL.x, top / 2, z], 'woodDark'));
    }
    // log boat on the slope
    const t = 0.3; // how far down the slope the boat sits
    const bz = SLOPE.z0 + dz * t;
    const by = floorY(bz) + FLOOR_T / 2 + 0.15;
    const along = aim([0, -Math.sin(alpha), Math.cos(alpha)]);
    parts.push(
      kit.cylinder(0.17, 0.17, 0.72, [0, by, bz], 'wood', { rotate: along, segments: 10 }),
      kit.box([0.24, 0.05, 0.5], [0, by + 0.17 * Math.cos(alpha), bz + 0.17 * Math.sin(alpha)], 'bark', { rotate: [alpha, 0, 0] }),
      kit.sphere(0.09, [0, by + 0.27, bz + 0.02], 'pink', { detail: 0 }),
    );
    for (const s of [-1, 1]) {
      parts.push(kit.cylinder(0.175, 0.175, 0.02, [0, by + s * 0.36 * -Math.sin(alpha), bz + s * 0.36 * Math.cos(alpha)], 'woodDark', { rotate: along, segments: 10 }));
    }
    // splash pool
    const pd = POOL.z1 - POOL.z0;
    const pz = (POOL.z0 + POOL.z1) / 2;
    parts.push(
      kit.box([1.8, POOL.floor, pd], [0, POOL.floor / 2, pz], 'blue'),
      kit.box([1.7, POOL.waterTop - POOL.floor, pd - 0.1], [0, (POOL.waterTop + POOL.floor) / 2, pz], 'skyBlue', { motion: WATER }),
    );
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([POOL.wall, POOL.wallH, pd], [s * (0.9 - POOL.wall / 2), POOL.wallH / 2, pz], 'red'),
        kit.box([1.8, POOL.wallH, POOL.wall], [0, POOL.wallH / 2, s > 0 ? POOL.z1 - POOL.wall / 2 : POOL.z0 + POOL.wall / 2], 'red'),
      );
    }
    // spray
    for (const [x, z, r] of [[-0.2, 0.52, 0.08], [0.15, 0.6, 0.1], [0.0, 0.78, 0.07], [0.3, 0.8, 0.06]] as const) {
      parts.push(kit.sphere(r, [x, POOL.waterTop + r * 0.8, z], 'white', { detail: 0 }));
    }
    return kit.finish(parts);
  },
};
