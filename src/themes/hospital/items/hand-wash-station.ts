import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A long counter (along z, front +x) with two round sinks, a chrome tap and a soap pump for each, and
// a mirror in a teal frame along the back.
const W = 0.6;
const LEN = 1.8;
const TOP = 0.62;
const SINK_Z = [-0.5, 0.5] as const;
const SOAP: readonly { z: number; bottle: 'pink' | 'lime' }[] = [
  { z: -0.8, bottle: 'pink' },
  { z: 0.8, bottle: 'lime' },
];

/** อ่างล้างมือ: two sinks with soap pumps and a mirror. */
export const item: ItemModel = {
  id: 'hand-wash-station',
  name: 'อ่างล้างมือ',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([W, TOP - 0.07, LEN], [0, (TOP - 0.07) / 2, 0], 'mint'),
      kit.box([W + 0.04, 0.07, LEN + 0.04], [0, TOP - 0.035, 0], 'white'),
      kit.box([0.03, 0.4, 0.8], [W / 2 + 0.015, 0.28, -0.45], 'teal'), // two cupboard doors
      kit.box([0.03, 0.4, 0.8], [W / 2 + 0.015, 0.28, 0.45], 'teal'),
      kit.sphere(0.03, [W / 2 + 0.04, 0.3, -0.1], 'sunYellow', { detail: 0 }),
      kit.sphere(0.03, [W / 2 + 0.04, 0.3, 0.1], 'sunYellow', { detail: 0 }),
      // mirror along the back wall side
      kit.box([0.05, 0.62, LEN - 0.04], [-W / 2 + 0.03, TOP + 0.35, 0], 'teal'),
      kit.box([0.03, 0.5, LEN - 0.2], [-W / 2 + 0.06, TOP + 0.35, 0], 'glassBlue'),
      kit.box([0.035, 0.08, 0.5], [-W / 2 + 0.07, TOP + 0.5, -0.45], 'white', { rotate: [0, 0, 0.0] }), // a shine
    ];
    for (const z of SINK_Z) {
      parts.push(
        kit.cylinder(0.22, 0.22, 0.03, [0.02, TOP + 0.015, z], 'stone', { segments: 12 }),
        kit.cylinder(0.18, 0.14, 0.03, [0.02, TOP + 0.045, z], 'skyBlue', { segments: 12 }), // water in the basin
        // tap: post, bent spout
        kit.cylinder(0.025, 0.025, 0.2, [-0.2, TOP + 0.1, z], 'chrome', { segments: 8 }),
        kit.box([0.17, 0.035, 0.035], [-0.12, TOP + 0.2, z], 'chrome'),
        kit.sphere(0.035, [-0.2, TOP + 0.2, z], 'chrome', { detail: 0 }),
      );
    }
    for (const s of SOAP) {
      parts.push(
        kit.cylinder(0.065, 0.065, 0.16, [-0.1, TOP + 0.08, s.z], s.bottle, { segments: 8 }),
        kit.cylinder(0.018, 0.018, 0.06, [-0.1, TOP + 0.19, s.z], 'white', { segments: 8 }),
        kit.box([0.1, 0.025, 0.03], [-0.06, TOP + 0.225, s.z], 'white'),
      );
    }
    return kit.finish(parts);
  },
};
