import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

// A fish market: a long back stall under a blue-and-white awning, two low ice tables in front. Cartoon fish lie on beds
// of ice (glassBlue), with a big blue tuna and red crabs. A neon fish (thin blue strokes on a dark board) stands on top of the awning.
const TOP = 0.62;

/** A cartoon fish; head towards +x (yaw 0) or turned by `yaw` about y. */
function fish(kit: StyleKit, at: [number, number, number], len: number, color: PaletteColor, yaw = 0, glow = false): Part[] {
  const [x, y, z] = at;
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const o = (lx: number, ly: number, lz = 0): [number, number, number] => [x + lx * c + lz * s, y + ly, z - lx * s + lz * c];
  const g = glow ? { glow: true as const } : {};
  return [
    kit.sphere(len * 0.5, o(0, 0), color, { detail: 0, scale: [1, 0.45, 0.4], rotate: [0, yaw, 0], ...g }),
    kit.cone(len * 0.22, len * 0.3, o(-len * 0.62, 0), color, { segments: 4, rotate: [0, yaw, -Math.PI / 2], scale: [1, 1, 0.4], ...g }),
    kit.sphere(len * 0.055, o(len * 0.3, len * 0.07, len * 0.12), 'charcoal', { detail: 0 }),
  ];
}

function crab(kit: StyleKit, x: number, z: number): Part[] {
  return [
    kit.sphere(0.07, [x, TOP + 0.08, z], 'red', { detail: 0, scale: [1, 0.55, 1.3] }),
    kit.sphere(0.03, [x + 0.07, TOP + 0.09, z - 0.09], 'redDark', { detail: 0 }),
    kit.sphere(0.03, [x + 0.07, TOP + 0.09, z + 0.09], 'redDark', { detail: 0 }),
  ];
}

/** ตลาดปลา: market stalls of fish on ice, crabs and tuna. */
export const item: ItemModel = {
  id: 'fish-market',
  name: 'ตลาดปลา',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      // back stall: counter with an ice bed
      kit.box([0.5, TOP - 0.06, 1.84], [-0.65, (TOP - 0.06) / 2, 0], 'wood'),
      kit.box([0.56, 0.04, 1.9], [-0.65, TOP - 0.08, 0], 'woodDark'),
      kit.box([0.44, 0.06, 1.7], [-0.65, TOP - 0.03, 0], 'glassBlue'),
    ];
    // awning on four posts, higher at the back, sloping to the front
    for (const z of [-0.9, 0.9]) {
      parts.push(
        kit.cylinder(0.025, 0.025, 1.25 - TOP, [-0.28, (TOP + 1.25) / 2, z], 'woodDark', { segments: 6 }),
        kit.cylinder(0.025, 0.025, 1.45 - TOP, [-0.92, (TOP + 1.45) / 2, z], 'woodDark', { segments: 6 }),
      );
    }
    for (let i = 0; i < 6; i++) {
      parts.push(kit.box([0.74, 0.04, 0.31], [-0.6, 1.36, -0.78 + i * 0.311], i % 2 ? 'white' : 'blue', { rotate: [0, 0, -0.27] }));
    }
    // two lamps under the awning (steady, warm)
    for (const z of [-0.45, 0.45]) parts.push(kit.sphere(0.05, [-0.45, 1.16, z], 'lampWarm', { detail: 0, glow: true }));
    // neon fish on top of the awning
    const nx = -0.68;
    const sline = (z1: number, y1: number, z2: number, y2: number) => rod(kit, [nx, y1, z1], [nx, y2, z2], 0.014, 'blue', { segments: 4, glow: true });
    parts.push(kit.box([0.04, 0.42, 0.8], [nx - 0.025, 1.6, 0], 'charcoal'));
    for (let a = 0; a < 8; a++) {
      const t1 = (a * Math.PI) / 4;
      const t2 = t1 + Math.PI / 4;
      parts.push(sline(0.05 + 0.2 * Math.cos(t1), 1.6 + 0.1 * Math.sin(t1), 0.05 + 0.2 * Math.cos(t2), 1.6 + 0.1 * Math.sin(t2)));
    }
    parts.push(
      sline(-0.15, 1.6, -0.3, 1.7), sline(-0.15, 1.6, -0.3, 1.5), sline(-0.3, 1.7, -0.3, 1.5),
      kit.sphere(0.025, [nx, 1.64, 0.15], 'blue', { detail: 0, glow: true }),
    );
    // fish on the back ice
    const row: [number, PaletteColor][] = [[-0.75, 'orange'], [-0.4, 'pink'], [-0.05, 'chrome'], [0.3, 'sunYellow'], [0.7, 'teal']];
    for (const [z, c] of row) {
      parts.push(...fish(kit, [-0.7, TOP + 0.06, z], 0.26, c, Math.PI / 2));
      parts.push(...fish(kit, [-0.55, TOP + 0.06, z + 0.1], 0.2, c === 'chrome' ? 'blue' : 'chrome', Math.PI / 2));
    }
    // front ice tables: a tuna on one, crabs and small fish on the other
    for (const z of [-0.5, 0.5]) {
      parts.push(
        kit.box([0.7, TOP - 0.06, 0.8], [0.4, (TOP - 0.06) / 2, z], 'wood'),
        kit.box([0.76, 0.04, 0.86], [0.4, TOP - 0.08, z], 'woodDark'),
        kit.box([0.64, 0.06, 0.74], [0.4, TOP - 0.03, z], 'glassBlue'),
      );
    }
    parts.push(
      ...fish(kit, [0.4, TOP + 0.1, -0.5], 0.62, 'blue', Math.PI / 2),
      kit.sphere(0.12, [0.46, TOP + 0.06, -0.5], 'white', { detail: 0, scale: [0.6, 0.4, 1.1] }),
      ...crab(kit, 0.25, 0.3),
      ...crab(kit, 0.5, 0.45),
      ...crab(kit, 0.3, 0.68),
      ...fish(kit, [0.58, TOP + 0.06, 0.25], 0.2, 'orange', Math.PI / 2),
      ...fish(kit, [0.62, TOP + 0.06, 0.72], 0.2, 'pink', Math.PI / 2),
    );
    return kit.finish(parts);
  },
};
