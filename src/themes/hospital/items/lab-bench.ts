import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A bench along x (front +x) with two microscopes, a rack of bright test tubes and a centrifuge whose lid
// spins on one pivot; a bottle cupboard stands along the back wall.
const TOP_Y = 0.62;
const BENCH = { x: 0.1, z: 0.25, w: 1.6, d: 1.4 };
const CENT = { x: -0.25, z: 0.2 }; // centrifuge centre
const LID_Y = TOP_Y + 0.17; // the rotor turns just above the drum top (0.77)
const SPIN: MotionOpts = { kind: 'spin', pivot: [CENT.x, LID_Y, CENT.z], speed: 0.8 };
const TUBES: PaletteColor[] = ['pink', 'lime', 'orange', 'purple', 'skyBlue'];

/** ห้องแล็บ: bench with microscopes, a rack of colourful test tubes and a spinning centrifuge. */
export const item: ItemModel = {
  id: 'lab-bench',
  name: 'ห้องแล็บ',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BENCH.w, TOP_Y - 0.06, BENCH.d - 0.04], [BENCH.x, 0.03 + (TOP_Y - 0.06) / 2, BENCH.z], 'cream'),
      kit.box([BENCH.w + 0.04, 0.03, BENCH.d - 0.04], [BENCH.x, 0.015, BENCH.z], 'stoneDark'),
      kit.box([BENCH.w + 0.08, 0.04, BENCH.d], [BENCH.x, TOP_Y - 0.02, BENCH.z], 'teal'),
    ];
    for (const z of [-0.1, 0.55]) parts.push(kit.box([0.02, 0.36, 0.5], [BENCH.x + BENCH.w / 2 + 0.01, 0.3, z], 'mint'));

    // microscopes: base, arm, tube tilted, eyepiece, a coloured stage
    for (const z of [0.7, 0.2]) {
      const x = 0.55;
      parts.push(
        kit.box([0.2, 0.03, 0.14], [x, TOP_Y + 0.015, z], 'charcoal'),
        kit.box([0.04, 0.26, 0.05], [x - 0.07, TOP_Y + 0.15, z], 'white'),
        kit.box([0.1, 0.02, 0.1], [x, TOP_Y + 0.12, z], 'sunYellow'),
        kit.cylinder(0.035, 0.035, 0.2, [x - 0.02, TOP_Y + 0.28, z], 'chrome', { segments: 8, rotate: [0, 0, 0.35] }),
        kit.cylinder(0.025, 0.025, 0.05, [x - 0.07, TOP_Y + 0.4, z], 'charcoal', { segments: 8, rotate: [0, 0, 0.35] }),
      );
    }

    // test-tube rack: wooden rack with five bright tubes
    const rx = 0.5;
    const rz = -0.35;
    parts.push(
      kit.box([0.14, 0.04, 0.46], [rx, TOP_Y + 0.02, rz], 'woodDark'),
      kit.box([0.14, 0.02, 0.46], [rx, TOP_Y + 0.14, rz], 'wood'),
    );
    TUBES.forEach((c, i) => {
      const z = rz - 0.18 + i * 0.09;
      parts.push(
        kit.cylinder(0.03, 0.03, 0.2, [rx, TOP_Y + 0.14, z], 'glassBlue', { segments: 8 }),
        kit.cylinder(0.026, 0.026, 0.12, [rx, TOP_Y + 0.1, z], c, { segments: 8 }),
        kit.cylinder(0.03, 0.03, 0.02, [rx, TOP_Y + 0.25, z], 'white', { segments: 8 }),
      );
    });
    // flasks
    parts.push(
      kit.sphere(0.09, [-0.15, TOP_Y + 0.1, -0.35], 'lime', { detail: 1 }),
      kit.cylinder(0.03, 0.03, 0.12, [-0.15, TOP_Y + 0.25, -0.35], 'glassBlue', { segments: 8 }),
      kit.sphere(0.07, [-0.15, TOP_Y + 0.07, 0.75], 'pink', { detail: 1 }),
      kit.cylinder(0.025, 0.025, 0.1, [-0.15, TOP_Y + 0.18, 0.75], 'glassBlue', { segments: 8 }),
    );

    // centrifuge: white drum base with a teal band and a button, the lid spins on one pivot
    parts.push(
      kit.cylinder(0.27, 0.27, 0.15, [CENT.x, TOP_Y + 0.075, CENT.z], 'white', { segments: 12 }),
      kit.cylinder(0.275, 0.275, 0.03, [CENT.x, TOP_Y + 0.1, CENT.z], 'teal', { segments: 12 }),
      kit.box([0.06, 0.05, 0.1], [CENT.x + 0.27, TOP_Y + 0.05, CENT.z], 'orange'),
      kit.cylinder(0.2, 0.2, 0.02, [CENT.x, TOP_Y + 0.155, CENT.z], 'charcoal', { segments: 12 }),
      kit.cylinder(0.17, 0.17, 0.03, [CENT.x, TOP_Y + 0.185, CENT.z], 'stone', { segments: 12, motion: SPIN }),
      kit.cylinder(0.04, 0.04, 0.08, [CENT.x, TOP_Y + 0.24, CENT.z], 'sunYellow', { segments: 8, motion: SPIN }),
    );
    // open rotor: five bright tube holders round the hub, all on the same pivot
    TUBES.forEach((c, i) => {
      const a = (i / 5) * Math.PI * 2;
      parts.push(kit.cylinder(0.035, 0.035, 0.1, [CENT.x + 0.13 * Math.cos(a), TOP_Y + 0.25, CENT.z - 0.13 * Math.sin(a)], c, { segments: 8, motion: SPIN }));
    });

    // back cupboard with bottles on top
    const cx = -0.77; // front face x = -0.57, clear of the centrifuge (x -0.52..0.02)
    parts.push(
      kit.box([0.4, 1.0, 1.7], [cx, 0.5, -0.1], 'cream'),
      kit.box([0.44, 0.04, 1.74], [cx, 1.02, -0.1], 'teal'),
    );
    for (const z of [-0.65, 0.45]) parts.push(kit.box([0.02, 0.8, 0.5], [cx + 0.21, 0.5, z], 'mint'));
    for (let i = 0; i < 6; i++) {
      const z = -0.85 + i * 0.3;
      parts.push(
        kit.cylinder(0.06, 0.06, 0.16, [cx, 1.12, z], TUBES[i % 5], { segments: 8 }),
        kit.cylinder(0.03, 0.03, 0.06, [cx, 1.23, z], 'white', { segments: 8 }),
      );
    }
    return kit.finish(parts);
  },
};
