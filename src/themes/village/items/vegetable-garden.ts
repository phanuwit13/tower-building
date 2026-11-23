import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { rod } from '../../../models/parts';

// Four raised beds in a 2×2: lettuce, chillies, lemongrass and cabbages, with a blue watering can in the gap.
const BED = 0.75;
const BED_AT = 0.5; // bed centres at ±BED_AT
const SOIL_TOP = 0.13;
const RIM = 0.17;
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, SOIL_TOP, 0], amount: 0.15 };

function bed(kit: StyleKit, x: number, z: number): Part[] {
  const t = 0.05;
  return [
    kit.box([BED - 2 * t, SOIL_TOP, BED - 2 * t], [x, SOIL_TOP / 2, z], 'bark'),
    kit.box([BED, RIM, t], [x, RIM / 2, z - (BED - t) / 2], 'wood'),
    kit.box([BED, RIM, t], [x, RIM / 2, z + (BED - t) / 2], 'wood'),
    kit.box([t, RIM, BED - 2 * t], [x - (BED - t) / 2, RIM / 2, z], 'woodDark'),
    kit.box([t, RIM, BED - 2 * t], [x + (BED - t) / 2, RIM / 2, z], 'woodDark'),
  ];
}

/** Each plant sways about its own soil line. */
function swayAt(x: number, z: number, phase: number): MotionOpts {
  return { ...SWAY, pivot: [x, SOIL_TOP, z], phase };
}

/** แปลงผักสวนครัว: raised beds of greens, chillies and lemongrass with a watering can. */
export const item: ItemModel = {
  id: 'vegetable-garden',
  name: 'แปลงผักสวนครัว',
  category: 'nature',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const [x, z] of [[-BED_AT, -BED_AT], [BED_AT, -BED_AT], [-BED_AT, BED_AT], [BED_AT, BED_AT]]) parts.push(...bed(kit, x, z));
    // Lettuce and bok choy, a 3×2 grid in two greens.
    for (let i = 0; i < 6; i++) {
      const x = BED_AT + ((i % 2) - 0.5) * 0.3;
      const z = -BED_AT + (Math.floor(i / 2) - 1) * 0.22;
      parts.push(kit.sphere(0.1, [x, SOIL_TOP + 0.06, z], i % 3 === 0 ? 'lime' : 'leaf', { detail: 0, scale: [1, 0.8, 1], motion: swayAt(x, z, i) }));
    }
    // Chillies: small dark bushes hung with red, orange and green pods.
    [[-0.3, -0.3], [-0.7, -0.3], [-0.5, -0.5], [-0.3, -0.7], [-0.7, -0.7]].forEach(([x, z], i) => {
      parts.push(kit.sphere(0.1, [x, SOIL_TOP + 0.09, z], 'leafDark', { detail: 0, motion: swayAt(x, z, i) }));
      for (let p = 0; p < 2; p++) {
        parts.push(kit.sphere(0.03, [x + 0.09 * (p ? 1 : -0.8), SOIL_TOP + 0.16 - p * 0.05, z + 0.05 * (p ? -1 : 1)], p === 0 ? 'red' : i % 2 ? 'orange' : 'red', { detail: 0, motion: swayAt(x, z, i) }));
      }
    });
    // Lemongrass: tufts of tall thin blades leaning outwards.
    for (const [cx, cz] of [[-BED_AT, BED_AT - 0.17], [-BED_AT + 0.02, BED_AT + 0.17]]) {
      for (let b = 0; b < 5; b++) {
        const a = (b / 5) * Math.PI * 2;
        const lean = 0.22;
        const x = cx + Math.cos(a) * 0.12;
        const z = cz - Math.sin(a) * 0.12;
        parts.push(kit.cone(0.03, 0.42, [x + Math.cos(a) * lean * 0.2, SOIL_TOP + 0.21, z - Math.sin(a) * lean * 0.2], b % 2 ? 'lime' : 'leaf', { segments: 4, rotate: [Math.sin(a) * lean, 0, -Math.cos(a) * lean], motion: swayAt(cx, cz, b) }));
      }
    }
    // Cabbages: round pale heads in a wreath of leaves.
    for (const [x, z] of [[BED_AT - 0.17, BED_AT - 0.14], [BED_AT + 0.19, BED_AT - 0.12], [BED_AT, BED_AT + 0.2]]) {
      parts.push(
        kit.sphere(0.13, [x, SOIL_TOP + 0.07, z], 'leafDark', { detail: 0, scale: [1, 0.6, 1], motion: swayAt(x, z, 1) }),
        kit.sphere(0.1, [x, SOIL_TOP + 0.12, z], 'mint', { detail: 0, motion: swayAt(x, z, 1) }),
      );
    }
    // Watering can: a blue drum with a spout and a handle, standing where the paths cross.
    parts.push(
      kit.cylinder(0.09, 0.1, 0.16, [0, 0.08, 0], 'blue', { segments: 8 }),
      kit.cylinder(0.09, 0.09, 0.02, [0, 0.17, 0], 'navy', { segments: 8 }),
      rod(kit, [0.07, 0.04, 0], [0.22, 0.2, 0], 0.025, 'blue', { segments: 6 }),
      kit.cylinder(0.04, 0.04, 0.03, [0.23, 0.21, 0], 'navy', { segments: 6, rotate: [0, 0, -0.95] }),
      kit.torus(0.06, 0.015, [-0.08, 0.1, 0], 'navy', { radialSegments: 4, tubularSegments: 8, arc: Math.PI, rotate: [0, 0, Math.PI / 2 + 0.1] }),
    );
    return kit.finish(parts);
  },
};
