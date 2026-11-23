import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A covered footbridge over a painted road (road along z, bridge walks along x): a narrow walkway on
// pillars with tall blue railings and a light roof, a four-step staircase at each end, warm lamps under
// the roof, and a zebra crossing and lane dashes on the road below.
const DECK_TOP = 0.7;
const HALF_Z = 0.35;
const STEP = { n: 4, d: 0.125, x0: 0.5 };
const RAIL = 0.35;
const ROOF_Y = 1.22;

/** สะพานลอยคนข้าม: a footbridge with stairs at both ends and railings. */
export const item: ItemModel = {
  id: 'pedestrian-bridge',
  name: 'สะพานลอยคนข้าม',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      // road underneath with a zebra crossing at both ends and a dashed centre line
      kit.box([0.76, 0.03, 1.96], [0, 0.015, 0], 'charcoal'),
      // walkway deck
      kit.box([1.0, 0.12, HALF_Z * 2], [0, DECK_TOP - 0.06, 0], 'stone'),
      kit.box([1.04, 0.06, HALF_Z * 2 + 0.04], [0, DECK_TOP - 0.15, 0], 'charcoal'),
      // roof on four posts
      kit.box([1.1, 0.05, HALF_Z * 2 + 0.14], [0, ROOF_Y, 0], 'blue'),
      kit.box([0.9, 0.03, HALF_Z * 2 + 0.04], [0, ROOF_Y + 0.04, 0], 'white'),
    ];
    for (const z of [-0.95, -0.8, -0.65, 0.65, 0.8, 0.95]) parts.push(kit.box([0.66, 0.012, 0.08], [0, 0.03 + 0.006, z], 'white'));
    for (const z of [-0.45, 0.45]) parts.push(kit.box([0.06, 0.012, 0.16], [0, 0.036, z], 'sunYellow'));
    // pillars beside the road
    for (const s of [1, -1]) {
      for (const z of [-0.25, 0.25]) parts.push(kit.box([0.12, DECK_TOP - 0.18, 0.12], [s * 0.43, (DECK_TOP - 0.18) / 2, z], 'stoneDark'));
    }
    // stairs
    for (const s of [1, -1]) {
      for (let i = 0; i < STEP.n; i++) {
        const h = DECK_TOP - 0.14 - i * 0.14;
        parts.push(kit.box([STEP.d, h, HALF_Z * 2], [s * (STEP.x0 + STEP.d * (i + 0.5)), h / 2, 0], i % 2 === 0 ? 'stone' : 'stoneDark'));
      }
    }
    // tall railings on the walkway and down the stairs, both sides
    for (const z of [-HALF_Z + 0.02, HALF_Z - 0.02]) {
      parts.push(kit.box([1.0, 0.04, 0.04], [0, DECK_TOP + RAIL, z], 'blue'));
      parts.push(kit.box([1.0, 0.025, 0.025], [0, DECK_TOP + 0.18, z], 'white'));
      parts.push(kit.box([1.0, 0.025, 0.025], [0, DECK_TOP + 0.06, z], 'white'));
      for (const x of [-0.5, -0.25, 0, 0.25, 0.5]) parts.push(kit.box([0.04, RAIL, 0.04], [x, DECK_TOP + RAIL / 2, z], 'white'));
      parts.push(kit.box([0.05, ROOF_Y - DECK_TOP, 0.05], [-0.5, (ROOF_Y + DECK_TOP) / 2, z], 'charcoal'));
      parts.push(kit.box([0.05, ROOF_Y - DECK_TOP, 0.05], [0.5, (ROOF_Y + DECK_TOP) / 2, z], 'charcoal'));
      for (const s of [1, -1]) {
        parts.push(rod(kit, [s * 0.5, DECK_TOP + RAIL, z], [s * 0.97, 0.52, z], 0.022, 'blue', { segments: 4 }));
        parts.push(kit.box([0.04, 0.38, 0.04], [s * 0.975, 0.33, z], 'white'));
      }
    }
    // warm lamps under the roof
    for (const x of [-0.25, 0.25]) parts.push(kit.sphere(0.05, [x, ROOF_Y - 0.06, 0], 'sunYellow', { detail: 0, glow: true }));
    return kit.finish(parts);
  },
};
