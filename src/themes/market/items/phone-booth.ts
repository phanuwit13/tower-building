import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { glassWindow } from '../../../models/parts';

// Two glass phone booths side by side along z (1×2, open to +x): a red one and a blue one, each
// with a lit phone inside and a handset neon on the roof (pink and lime).
const X = 0.36; // booth half-depth
const BOOTH_H = 0.95;
const BOOTHS: { z: number; frame: 'red' | 'blue'; neon: 'pink' | 'lime' }[] = [
  { z: -0.5, frame: 'red', neon: 'pink' },
  { z: 0.5, frame: 'blue', neon: 'lime' },
];

/** ตู้โทรศัพท์: two glass phone booths side by side, lit inside at night. */
export const item: ItemModel = {
  id: 'phone-booth',
  name: 'ตู้โทรศัพท์',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.9, 0.04, 1.9], [0, 0.02, 0], 'stone')];
    for (const b of BOOTHS) {
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        parts.push(kit.box([0.07, BOOTH_H - 0.04, 0.07], [sx * X, 0.04 + (BOOTH_H - 0.04) / 2, b.z + sz * 0.45], b.frame));
      }
      parts.push(
        // roof and the sign cap
        kit.box([0.84, 0.07, 0.98], [0, BOOTH_H + 0.035, b.z], b.frame),
        kit.box([0.7, 0.05, 0.8], [0, BOOTH_H + 0.095, b.z], 'white'),
        // the rear wall (solid) with the phone and its lit screen
        kit.box([0.04, BOOTH_H - 0.04, 0.76], [-X, 0.04 + (BOOTH_H - 0.04) / 2, b.z], 'charcoal'),
        kit.box([0.1, 0.24, 0.18], [-X + 0.07, 0.56, b.z], b.frame),
        kit.box([0.02, 0.08, 0.1], [-X + 0.125, 0.6, b.z], 'lime', { glow: true }),
        kit.box([0.12, 0.03, 0.3], [-X + 0.08, 0.36, b.z], 'wood'),
        // glass: the door side (+x) and the outer side
        ...glassWindow(kit, { at: [X, 0.5, b.z], facing: 'x+', w: 0.62, h: 0.76, panes: 2 }),
        // handset neon on the roof: two cups and a bar (a phone icon), tilted towards the camera
        kit.box([0.04, 0.06, 0.34], [0.12, BOOTH_H + 0.2, b.z], b.neon, { glow: true }),
        kit.box([0.04, 0.12, 0.09], [0.12, BOOTH_H + 0.16, b.z - 0.17], b.neon, { glow: true }),
        kit.box([0.04, 0.12, 0.09], [0.12, BOOTH_H + 0.16, b.z + 0.17], b.neon, { glow: true }),
      );
    }
    // the outer glass at both ends and a shared middle post
    parts.push(
      ...glassWindow(kit, { at: [0, 0.5, -0.5 - 0.45], facing: 'z-', w: 0.58, h: 0.76, panes: 2 }),
      ...glassWindow(kit, { at: [0, 0.5, 0.5 + 0.45], facing: 'z+', w: 0.58, h: 0.76, panes: 2 }),
      kit.box([0.72, BOOTH_H - 0.04, 0.05], [0, 0.04 + (BOOTH_H - 0.04) / 2, 0], 'charcoal'),
    );
    return kit.finish(parts);
  },
};
