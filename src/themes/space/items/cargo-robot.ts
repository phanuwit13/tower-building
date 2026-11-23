import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const TRACK = { x: 0.31, w: 0.18, h: 0.2, len: 1.3 }; // two caterpillar tracks along z
const BED_Y = 0.3; // top of the orange chassis

/** หุ่นยนต์ขนของ: a tracked robot with a friendly face, carrying a stack of crates. */
export const item: ItemModel = {
  id: 'cargo-robot',
  name: 'หุ่นยนต์ขนของ',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const r = TRACK.h / 2;
    const parts: Part[] = [kit.box([0.64, 0.16, 1.4], [0, BED_Y - 0.08 + 0.0, -0.05], 'orange')];
    for (const s of [-1, 1]) {
      const x = s * TRACK.x;
      parts.push(
        kit.box([TRACK.w, TRACK.h, TRACK.len], [x, r, 0], 'charcoal'),
        kit.cylinder(r, r, TRACK.w, [x, r, TRACK.len / 2], 'charcoal', { rotate: [0, 0, Math.PI / 2] }),
        kit.cylinder(r, r, TRACK.w, [x, r, -TRACK.len / 2], 'charcoal', { rotate: [0, 0, Math.PI / 2] }),
        kit.cylinder(0.07, 0.07, TRACK.w + 0.02, [x, r, 0.4], 'sunYellow', { rotate: [0, 0, Math.PI / 2], segments: 8 }),
        kit.cylinder(0.07, 0.07, TRACK.w + 0.02, [x, r, -0.4], 'sunYellow', { rotate: [0, 0, Math.PI / 2], segments: 8 }),
      );
    }
    // the robot's head at the front (+z): a white box with a visor, two eyes and an antenna
    const hz = 0.62;
    parts.push(
      kit.box([0.4, 0.26, 0.26], [0, BED_Y + 0.13, hz], 'white'),
      kit.box([0.34, 0.12, 0.03], [0, BED_Y + 0.15, hz + 0.135], 'navy'),
      kit.sphere(0.035, [0.08, BED_Y + 0.15, hz + 0.155], 'sunYellow', { detail: 0 }),
      kit.sphere(0.035, [-0.08, BED_Y + 0.15, hz + 0.155], 'sunYellow', { detail: 0 }),
      kit.cylinder(0.015, 0.015, 0.14, [0.12, BED_Y + 0.33, hz], 'stoneDark', { segments: 4 }),
      kit.sphere(0.04, [0.12, BED_Y + 0.42, hz], 'red', { detail: 0 }),
    );
    // the cargo: two crates side by side on the bed, a third on top
    parts.push(
      kit.box([0.28, 0.26, 0.5], [0.15, BED_Y + 0.13, -0.3], 'wood'),
      kit.box([0.28, 0.26, 0.5], [-0.15, BED_Y + 0.13, -0.3], 'sunYellow'),
      kit.box([0.34, 0.24, 0.4], [0, BED_Y + 0.38, -0.3], 'teal'),
      kit.box([0.36, 0.03, 0.06], [0, BED_Y + 0.5, -0.3], 'red'), // strap
      kit.box([0.29, 0.03, 0.51], [0.15, BED_Y + 0.265, -0.3], 'woodDark'),
      kit.box([0.29, 0.03, 0.51], [-0.15, BED_Y + 0.265, -0.3], 'brass'),
    );
    return kit.finish(parts);
  },
};
