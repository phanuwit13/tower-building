import type { ItemModel } from '../../../models/contract';
import type { Part, PartOpts, StyleKit, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { rod } from '../../../models/parts';

// A grassy island in a water moat (2×3, long side along z). A wooden climbing frame stands on it; one monkey
// swings on a rope from the top beam, one sits on the platform and one munches a banana on the lawn.
const RIM = { w: 2, d: 3, t: 0.1, h: 0.12 }; // stone wall round the moat
const WATER_H = 0.06;
const ISLAND = { r: 0.66, h: 0.16, stretch: 1.65 }; // lawn disc, stretched along z
const TOP = ISLAND.h;
const BEAM = { y: TOP + 0.95, half: 0.62 }; // top beam along z, resting on two A-frames
const POST_Z = 0.62;
const ROPE_LEN = 0.5;
const PLATFORM = { y: TOP + 0.5, z: -0.42 };

// The rope and the monkey on it rock together about the beam (the z axis).
const SWING: MotionOpts = { kind: 'swing', pivot: [0, BEAM.y, 0.05], axis: [0, 0, 1], amount: 0.28, speed: 1.4 };

/** A friendly monkey (an original character) facing +x: `base` is the feet, `k` a size factor. */
function monkey(kit: StyleKit, base: Vec3, yaw: number, k: number, motion?: MotionOpts): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const pt = (lx: number, ly: number, lz: number): Vec3 => [base[0] + (lx * c + lz * s) * k, base[1] + ly * k, base[2] + (-lx * s + lz * c) * k];
  const o = (extra: PartOpts & { detail?: number }): PartOpts & { detail?: number } => ({ ...extra, rotate: [0, yaw, 0] as Vec3, ...(motion ? { motion } : {}) });
  return [
    kit.sphere(0.1 * k, pt(0, 0.14, 0), 'wood', o({ detail: 0, scale: [0.9, 1.15, 0.9] })),
    kit.sphere(0.075 * k, pt(0.05, 0.13, 0), 'sand', o({ detail: 0, scale: [0.6, 1, 0.9] })),
    kit.sphere(0.095 * k, pt(0.02, 0.31, 0), 'wood', o({})),
    kit.sphere(0.065 * k, pt(0.075, 0.295, 0), 'sand', o({ detail: 0, scale: [0.7, 0.9, 1.15] })),
    kit.sphere(0.04 * k, pt(0, 0.33, 0.095), 'sand', o({ detail: 0 })),
    kit.sphere(0.04 * k, pt(0, 0.33, -0.095), 'sand', o({ detail: 0 })),
    // big friendly eyes and a smile
    kit.sphere(0.03 * k, pt(0.115, 0.335, 0.04), 'white', o({ detail: 0 })),
    kit.sphere(0.03 * k, pt(0.115, 0.335, -0.04), 'white', o({ detail: 0 })),
    kit.sphere(0.017 * k, pt(0.14, 0.335, 0.04), 'charcoal', o({ detail: 0 })),
    kit.sphere(0.017 * k, pt(0.14, 0.335, -0.04), 'charcoal', o({ detail: 0 })),
    kit.box([0.012 * k, 0.012 * k, 0.05 * k], pt(0.138, 0.275, 0), 'charcoal', o({})),
    // arms, feet, tail
    kit.sphere(0.04 * k, pt(0.03, 0.15, 0.105), 'wood', o({ detail: 0, scale: [0.8, 1.6, 0.8] })),
    kit.sphere(0.04 * k, pt(0.03, 0.15, -0.105), 'wood', o({ detail: 0, scale: [0.8, 1.6, 0.8] })),
    kit.sphere(0.045 * k, pt(0.05, 0.035, 0.065), 'woodDark', o({ detail: 0, scale: [1.3, 0.6, 1] })),
    kit.sphere(0.045 * k, pt(0.05, 0.035, -0.065), 'woodDark', o({ detail: 0, scale: [1.3, 0.6, 1] })),
    kit.cylinder(0.018 * k, 0.026 * k, 0.24 * k, pt(-0.14, 0.2, 0), 'woodDark', {
      segments: 6, rotate: [0, yaw, 0.8], ...(motion ? { motion } : {}),
    }),
  ];
}

/** เกาะลิง: a lawn island in a moat with a climbing frame, ropes and three monkeys. */
export const item: ItemModel = {
  id: 'monkey-island',
  name: 'เกาะลิง',
  category: 'animal',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const iw = RIM.w - 2 * RIM.t;
    const id = RIM.d - 2 * RIM.t;
    const parts: Part[] = [
      kit.box([iw, WATER_H, id], [0, WATER_H / 2, 0], 'navy', { motion: { kind: 'water', water: 'pond' } }),
      kit.box([RIM.t, RIM.h, RIM.d], [(RIM.w - RIM.t) / 2, RIM.h / 2, 0], 'stone'),
      kit.box([RIM.t, RIM.h, RIM.d], [-(RIM.w - RIM.t) / 2, RIM.h / 2, 0], 'stone'),
      kit.box([iw, RIM.h, RIM.t], [0, RIM.h / 2, (RIM.d - RIM.t) / 2], 'stone'),
      kit.box([iw, RIM.h, RIM.t], [0, RIM.h / 2, -(RIM.d - RIM.t) / 2], 'stone'),
      // stone caps
      kit.box([RIM.t, 0.03, RIM.d * 0.96], [(RIM.w - RIM.t) / 2, RIM.h + 0.015, 0], 'white'),
      kit.box([RIM.t, 0.03, RIM.d * 0.96], [-(RIM.w - RIM.t) / 2, RIM.h + 0.015, 0], 'white'),
      // the island: a bank of sand under a lawn
      kit.cylinder(ISLAND.r + 0.05, ISLAND.r + 0.1, 0.07, [0, 0.035, 0], 'sand', { segments: 12, scale: [1, 1, ISLAND.stretch] }),
      kit.cylinder(ISLAND.r, ISLAND.r + 0.04, ISLAND.h - 0.07, [0, 0.07 + (ISLAND.h - 0.07) / 2, 0], 'lime', { segments: 12, scale: [1, 1, ISLAND.stretch] }),
    ];
    // climbing frame: two A-frames joined by a top beam
    for (const z of [-POST_Z, POST_Z]) {
      for (const s of [-1, 1]) {
        parts.push(rod(kit, [s * 0.34, TOP, z], [s * 0.04, BEAM.y, z], 0.035, 'wood', { segments: 6 }));
      }
      parts.push(kit.box([0.5, 0.04, 0.05], [0, TOP + 0.3, z], 'woodDark'));
    }
    parts.push(
      kit.cylinder(0.04, 0.04, BEAM.half * 2 + 0.12, [0, BEAM.y + 0.02, 0], 'woodDark', { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
      // platform on the -z side with a little rail
      kit.box([0.6, 0.05, 0.55], [0, PLATFORM.y, PLATFORM.z], 'wood'),
      kit.box([0.05, 0.4, 0.05], [0.26, PLATFORM.y - 0.225, PLATFORM.z + 0.2], 'woodDark'),
      kit.box([0.05, 0.4, 0.05], [-0.26, PLATFORM.y - 0.225, PLATFORM.z + 0.2], 'woodDark'),
      kit.box([0.05, 0.4, 0.05], [0.26, PLATFORM.y - 0.225, PLATFORM.z - 0.2], 'woodDark'),
      kit.box([0.05, 0.4, 0.05], [-0.26, PLATFORM.y - 0.225, PLATFORM.z - 0.2], 'woodDark'),
      kit.box([0.04, 0.1, 0.55], [-0.28, PLATFORM.y + 0.075, PLATFORM.z], 'woodDark'),
      // a climbing rope from the platform edge down to the lawn
      rod(kit, [0.3, PLATFORM.y, PLATFORM.z + 0.1], [0.5, TOP + 0.03, 0.1], 0.02, 'stoneDark', { segments: 4 }),
      // the swinging rope and its seat knot
      kit.cylinder(0.02, 0.02, ROPE_LEN, [0, BEAM.y - ROPE_LEN / 2, 0.05], 'sand', { segments: 4, motion: SWING }),
      kit.sphere(0.04, [0, BEAM.y - ROPE_LEN, 0.05], 'sand', { detail: 0, motion: SWING }),
      // banana on the lawn
      kit.box([0.14, 0.04, 0.04], [0.38, TOP + 0.03, 0.62], 'sunYellow', { rotate: [0, 0.6, 0.2] }),
      // a bush behind
      kit.sphere(0.17, [-0.28, TOP + 0.1, 1.0], 'leaf', { detail: 0, scale: [1.2, 0.8, 1] }),
      kit.sphere(0.12, [-0.15, TOP + 0.08, 0.92], 'leafDark', { detail: 0 }),
    );
    // the swinging monkey hangs by its hands from the rope knot
    parts.push(...monkey(kit, [0, BEAM.y - ROPE_LEN - 0.22, 0.05], 0, 1, SWING));
    parts.push(...monkey(kit, [0.02, PLATFORM.y + 0.025, PLATFORM.z], 0.5, 1));
    parts.push(...monkey(kit, [0.25, TOP, 0.75], -0.6, 0.9));
    return kit.finish(parts);
  },
};
