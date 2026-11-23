import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A capsule-toy machine (1×1, front +x): a red base with a coin knob and flap, a lit dome of coloured capsules (a glowing cage of rings keeps them visible).
const BASE = { w: 0.62, d: 0.62, y0: 0.03, h: 0.46 };
const DOME_Y = BASE.y0 + BASE.h + 0.04;
const R = 0.3;
// capsules on the dome surface (x, height above the dome base, z), poking out of the glass
const CAPSULES: [Vec3, PaletteColor][] = [
  [[0.21, 0.1, 0.0], 'pink'],
  [[0.105, 0.1, 0.18], 'sunYellow'],
  [[-0.105, 0.1, 0.18], 'skyBlue'],
  [[-0.21, 0.1, 0.0], 'orange'],
  [[-0.105, 0.1, -0.18], 'lime'],
  [[0.105, 0.1, -0.18], 'purple'],
  [[0.1, 0.21, 0.07], 'red'],
  [[-0.1, 0.21, 0.07], 'blue'],
  [[0.0, 0.21, -0.12], 'sunYellow'],
  [[0.0, 0.26, 0.0], 'pink'],
];

/** ตู้กาชาปอง: a capsule-toy machine with a lit dome. */
export const item: ItemModel = {
  id: 'gashapon',
  name: 'ตู้กาชาปอง',
  category: 'play',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const f = BASE.w / 2;
    const parts: Part[] = [
      kit.box([BASE.w + 0.1, BASE.y0, BASE.d + 0.1], [0, BASE.y0 / 2, 0], 'stone'),
      kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.y0 + BASE.h / 2, 0], 'red'),
      kit.box([BASE.w + 0.06, 0.06, BASE.d + 0.06], [0, BASE.y0 + BASE.h + 0.01, 0], 'white'),
      kit.box([0.02, 0.1, BASE.d], [f + 0.01, BASE.y0 + 0.37, 0], 'redDark'),
      // coin knob and delivery flap on the front
      kit.cylinder(0.08, 0.08, 0.04, [f + 0.02, 0.3, 0.14], 'sunYellow', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.box([0.03, 0.04, 0.12], [f + 0.04, 0.3, 0.14], 'charcoal'),
      kit.box([0.03, 0.14, 0.26], [f + 0.015, 0.16, -0.12], 'charcoal'),
      kit.box([0.02, 0.07, 0.2], [f + 0.04, 0.16, -0.12], 'woodDark'),
      // the dome: a solid pale glass shell, lit by a glowing ring at its base; the capsules poke out through it
      kit.dome(R, [0, DOME_Y, 0], 'glassBlue', { segments: 12 }),
      kit.cylinder(0.08, 0.1, 0.07, [0, DOME_Y + R + 0.03, 0], 'sunYellow', { segments: 8 }),
      kit.torus(0.31, 0.03, [0, DOME_Y, 0], 'pink', { rotate: [Math.PI / 2, 0, 0], radialSegments: 4, tubularSegments: 16, glow: true, light: 'breathe' }),
    ];
    CAPSULES.forEach(([p, c], i) => {
      parts.push(kit.sphere(0.1, [p[0], DOME_Y + p[1], p[2]], c, { detail: i < 6 ? 1 : 0 }));
    });
    return kit.finish(parts);
  },
};
