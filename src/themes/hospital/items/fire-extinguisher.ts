import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A red extinguisher standing on a stand (floor plate, backboard and strap) with a picture sign above it:
// a flame and a little extinguisher, colour blocks only, no text.
const BOARD_X = -0.38;

/** ถังดับเพลิง: red extinguisher on a stand with a sign picture. */
export const item: ItemModel = {
  id: 'fire-extinguisher',
  name: 'ถังดับเพลิง',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.7, 0.04, 0.7], [-0.02, 0.02, 0], 'stoneDark'),
      kit.box([0.06, 0.9, 0.5], [BOARD_X, 0.49, 0], 'charcoal'),
      kit.box([0.08, 0.03, 0.54], [BOARD_X, 0.95, 0], 'stoneDark'),
    ];
    // extinguisher: red cylinder, dome top, black valve, nozzle and hose, yellow label band
    const x = -0.12;
    parts.push(
      kit.cylinder(0.14, 0.14, 0.5, [x, 0.3, 0], 'red', { segments: 12 }),
      kit.dome(0.14, [x, 0.55, 0], 'red', { segments: 12 }),
      kit.cylinder(0.145, 0.145, 0.1, [x, 0.3, 0], 'sunYellow', { segments: 12 }),
      kit.cylinder(0.05, 0.05, 0.08, [x, 0.7, 0], 'charcoal', { segments: 8 }),
      kit.box([0.16, 0.03, 0.04], [x + 0.03, 0.76, 0], 'charcoal'),
      kit.box([0.12, 0.03, 0.04], [x - 0.04, 0.73, 0], 'charcoal', { rotate: [0, 0, -0.5] }),
      kit.torus(0.1, 0.015, [x + 0.1, 0.4, 0], 'charcoal', { rotate: [0, Math.PI / 2, 0], radialSegments: 4, tubularSegments: 12, arc: Math.PI }),
      kit.box([0.04, 0.03, 0.08], [x + 0.2, 0.3, 0], 'charcoal'),
    );
    // strap holding it to the board
    parts.push(kit.box([0.12, 0.04, 0.32], [BOARD_X + 0.08, 0.45, 0], 'orange'));
    // sign on the board: a red square with a flame (orange + yellow cones), small extinguisher pictogram in white
    const sx = BOARD_X + 0.04;
    parts.push(
      kit.box([0.02, 0.36, 0.36], [sx, 1.15, 0], 'red'),
      kit.cone(0.1, 0.24, [sx + 0.02, 1.07, 0.07], 'orange', { segments: 8, scale: [0.25, 1, 1] }),
      kit.cone(0.06, 0.14, [sx + 0.035, 1.07, 0.07], 'sunYellow', { segments: 8, scale: [0.25, 1, 1] }),
      kit.cylinder(0.04, 0.04, 0.14, [sx + 0.02, 1.1, -0.09], 'white', { segments: 8 }),
      kit.box([0.015, 0.03, 0.06], [sx + 0.02, 1.2, -0.06], 'white'),
    );
    return kit.finish(parts);
  },
};
