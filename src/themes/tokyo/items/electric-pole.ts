import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import { aim } from '../../../models/parts';

// A concrete utility pole (1×1): two crossarms with white insulators, a tangle of thin wires and a grey
// transformer can strapped to the pole. Still.
const H = 2.3;
const WIRE = 0.017;

function wire(kit: StyleKit, a: [number, number, number], b: [number, number, number]): Part {
  const d: [number, number, number] = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const mid: [number, number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  return kit.cylinder(WIRE, WIRE, Math.hypot(...d), mid, 'charcoal', { segments: 4, rotate: aim(d) });
}

/** เสาไฟฟ้า: a utility pole with wires and a transformer. */
export const item: ItemModel = {
  id: 'electric-pole',
  name: 'เสาไฟฟ้า',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.3, 0.32, 0.04, [0, 0.02, 0], 'stone', { segments: 8 }),
      kit.cylinder(0.055, 0.08, H, [0, 0.04 + H / 2, 0], 'stone', { segments: 8 }),
      kit.cylinder(0.065, 0.065, 0.04, [0, 0.4, 0], 'stoneDark', { segments: 8 }),
      // crossarms along z
      kit.box([0.07, 0.07, 0.9], [0, 2.22, 0], 'woodDark'),
      kit.box([0.07, 0.07, 0.7], [0, 1.9, 0], 'woodDark'),
      // transformer can with a cap and two bushings, on the +x side
      kit.cylinder(0.12, 0.12, 0.34, [0.17, 1.5, 0], 'stoneDark', { segments: 8 }),
      kit.cylinder(0.125, 0.0, 0.07, [0.17, 1.705, 0], 'charcoal', { segments: 8 }),
      kit.cylinder(0.02, 0.02, 0.06, [0.17, 1.76, 0.05], 'white', { segments: 6 }),
      kit.cylinder(0.02, 0.02, 0.06, [0.17, 1.76, -0.05], 'white', { segments: 6 }),
      kit.box([0.04, 0.04, 0.2], [0.09, 1.66, 0], 'charcoal'),
    ];
    // white insulators on the arms
    const top: [number, number, number][] = [-0.4, -0.15, 0.15, 0.4].map((z) => [0, 2.3, z]);
    const low: [number, number, number][] = [-0.3, 0, 0.3].map((z) => [0, 1.98, z]);
    for (const p of [...top, ...low]) parts.push(kit.cylinder(0.025, 0.03, 0.08, [p[0], p[1] - 0.01, p[2]], 'white', { segments: 6 }));
    // wires: neat parallel runs, each sagging in the middle; four from the top arm out to +x, three from the
    // lower arm out to -x, and two drops from the transformer bushings to the lower arm
    type V = [number, number, number];
    const sag = (a: V, b: V, drop: number) => {
      const m: V = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - drop, (a[2] + b[2]) / 2];
      parts.push(wire(kit, a, m), wire(kit, m, b));
    };
    for (const z of [-0.4, -0.15, 0.15, 0.4]) sag([0, 2.32, z], [0.46, 2.2, z], 0.06);
    for (const z of [-0.3, 0, 0.3]) sag([0, 2.0, z], [-0.46, 1.9, z], 0.06);
    sag([0.17, 1.8, 0.05], [0, 2.0, 0.3], 0.05);
    sag([0.17, 1.8, -0.05], [0, 2.0, -0.3], 0.05);
    return kit.finish(parts);
  },
};
