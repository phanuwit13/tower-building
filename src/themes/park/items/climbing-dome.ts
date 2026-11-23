import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

const G = 0.03;
const R = 0.9; // dome radius: its top is about 0.97 high
const TUBE = 0.035;
const RAINBOW: PaletteColor[] = ['red', 'orange', 'sunYellow', 'leaf', 'blue', 'purple'];
const RING_HEIGHTS = [0.28, 0.55, 0.78]; // flat rings round the dome
const RING_COLORS: PaletteColor[] = ['sunYellow', 'blue', 'red'];

/** โดมปีนป่าย: a rainbow climbing dome of arched bars and rings on a teal rubber floor. */
export const item: ItemModel = {
  id: 'climbing-dome',
  name: 'โดมปีนป่าย',
  category: 'play',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.cylinder(0.97, 0.97, G, [0, G / 2, 0], 'teal', { segments: 24 })];
    // six half-circle arches, 30 degrees apart, each a different rainbow colour: twelve legs on the floor
    RAINBOW.forEach((color, i) => {
      parts.push(kit.torus(R, TUBE, [0, G, 0], color, { arc: Math.PI, radialSegments: 5, tubularSegments: 12, rotate: [0, (i * Math.PI) / 6, 0] }));
    });
    RING_HEIGHTS.forEach((h, i) => {
      parts.push(kit.torus(Math.sqrt(R * R - h * h), TUBE, [0, G + h, 0], RING_COLORS[i], { radialSegments: 4, tubularSegments: 16, rotate: [Math.PI / 2, 0, 0] }));
    });
    parts.push(kit.sphere(0.09, [0, G + R, 0], 'sunYellow', { detail: 0 }));
    return kit.finish(parts);
  },
};
