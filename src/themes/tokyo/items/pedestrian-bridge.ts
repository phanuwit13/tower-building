import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A footbridge over a little road (along z): a wide deck on pillars, a four-step staircase at each end
// (-x and +x), blue railings and warm lamp posts.
const DECK_TOP = 0.7;
const HALF_Z = 0.75;
const STEP = { n: 4, d: 0.125, x0: 0.5 };

/** สะพานลอยคนข้าม: a footbridge with stairs at both ends and railings. */
export const item: ItemModel = {
  id: 'pedestrian-bridge',
  name: 'สะพานลอยคนข้าม',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      // road underneath, with dashes
      kit.box([0.5, 0.03, 1.96], [0, 0.015, 0], 'charcoal'),
      // deck
      kit.box([1.0, 0.12, HALF_Z * 2], [0, DECK_TOP - 0.06, 0], 'stone'),
      kit.box([1.04, 0.05, HALF_Z * 2 + 0.04], [0, DECK_TOP - 0.145, 0], 'charcoal'),
      kit.box([0.6, 0.012, 0.1], [0, DECK_TOP + 0.006, 0], 'sunYellow'),
    ];
    for (let i = 0; i < 5; i++) parts.push(kit.box([0.06, 0.012, 0.2], [0, 0.03 + 0.006, -0.8 + i * 0.4], 'white'));
    for (const s of [1, -1]) {
      for (const z of [-0.55, 0.55]) parts.push(kit.box([0.12, DECK_TOP - 0.17, 0.12], [s * 0.4, (DECK_TOP - 0.17) / 2, z], 'stoneDark'));
    }
    // stairs
    for (const s of [1, -1]) {
      for (let i = 0; i < STEP.n; i++) {
        const h = DECK_TOP - 0.14 - i * 0.14;
        parts.push(kit.box([STEP.d, h, HALF_Z * 2], [s * (STEP.x0 + STEP.d * (i + 0.5)), h / 2, 0], i % 2 === 0 ? 'stone' : 'stoneDark'));
      }
    }
    // railings: along the deck and down the stairs, each side in z
    const RAIL = 0.22;
    for (const z of [-HALF_Z + 0.03, HALF_Z - 0.03]) {
      parts.push(kit.box([1.0, 0.04, 0.04], [0, DECK_TOP + RAIL, z], 'blue'));
      parts.push(kit.box([1.0, 0.025, 0.025], [0, DECK_TOP + 0.1, z], 'white'));
      for (const x of [-0.5, 0, 0.5]) parts.push(kit.box([0.04, RAIL, 0.04], [x, DECK_TOP + RAIL / 2, z], 'white'));
      for (const s of [1, -1]) {
        parts.push(rod(kit, [s * 0.5, DECK_TOP + RAIL, z], [s * 0.97, 0.39, z], 0.022, 'blue', { segments: 4 }));
        parts.push(kit.box([0.04, 0.2, 0.04], [s * 0.975, 0.1 + 0.1, z], 'white'));
      }
      // lamp posts at the deck corners
      for (const s of [1, -1]) parts.push(kit.sphere(0.05, [s * 0.5, DECK_TOP + RAIL + 0.07, z], 'lampWarm', { detail: 0, glow: true }));
    }
    return kit.finish(parts);
  },
};
