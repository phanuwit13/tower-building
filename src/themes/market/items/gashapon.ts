import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A capsule-toy machine (1×1, front +x): a red base with a coin knob and flap, a lit dome of coloured capsules (a glowing cage of rings keeps them visible).
const BASE = { w: 0.62, d: 0.62, y0: 0.03, h: 0.46 };
const DOME_Y = BASE.y0 + BASE.h + 0.04;
const R = 0.3;
const CAPSULES: [Vec3, PaletteColor][] = [
  [[0.05, 0.13, 0.12], 'pink'],
  [[0.08, 0.12, -0.14], 'sunYellow'],
  [[-0.12, 0.12, 0.0], 'skyBlue'],
  [[-0.1, 0.13, -0.17], 'orange'],
  [[-0.1, 0.13, 0.18], 'lime'],
  [[0.17, 0.13, 0.0], 'purple'],
  [[0.0, 0.31, 0.0], 'red'],
  [[-0.06, 0.32, 0.1], 'sunYellow'],
  [[0.08, 0.3, -0.06], 'blue'],
  [[0.0, 0.46, 0.0], 'pink'],
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
      // the dome: three glowing rings and a cap
      kit.torus(R, 0.02, [0, DOME_Y, 0], 'skyBlue', { arc: Math.PI, radialSegments: 4, tubularSegments: 12, glow: true, light: 'window' }),
      kit.torus(R, 0.02, [0, DOME_Y, 0], 'skyBlue', { arc: Math.PI, radialSegments: 4, tubularSegments: 12, glow: true, light: 'window', rotate: [0, Math.PI / 2, 0] }),
      kit.torus(R, 0.02, [0, DOME_Y, 0], 'skyBlue', { radialSegments: 4, tubularSegments: 16, glow: true, light: 'window', rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.08, 0.1, 0.07, [0, DOME_Y + R + 0.02, 0], 'sunYellow', { segments: 8 }),
      // a warm lamp inside, hidden among the capsules
      kit.sphere(0.07, [0, DOME_Y + 0.2, 0], 'lampWarm', { detail: 0, glow: true, light: 'breathe' }),
    ];
    CAPSULES.forEach(([p, c], i) => {
      parts.push(kit.sphere(0.1, [p[0], DOME_Y + p[1] * 0.9 + 0.02, p[2]], c, { detail: i < 4 ? 1 : 0 }));
    });
    return kit.finish(parts);
  },
};
