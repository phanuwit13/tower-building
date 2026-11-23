import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A reclined dental chair (feet towards +x), a glowing lamp on an arm, a little tray at the +z side and a
// giant smiling tooth poster on a stand at the back (-x), facing +x.
const MAT = 0.03;
const SEAT = { x: 0.25, y: 0.5 };
const TILT = 0.4; // the backrest leans back by this many radians
const BACK_LEN = 0.8;
const POSTER = { x: -0.92, y: 1.0, w: 0.95, h: 0.9 };

/** ห้องทำฟัน: dental chair, lamp, tray of toys and a giant smiling tooth poster. */
export const item: ItemModel = {
  id: 'dental-chair',
  name: 'ห้องทำฟัน',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const bx = SEAT.x - 0.27; // the back edge of the seat
    const parts: Part[] = [
      kit.box([1.9, MAT, 1.9], [0, MAT / 2, 0], 'mint'),
      // chair: foot, column, seat, tilted back, headrest, footrest
      kit.cylinder(0.3, 0.38, 0.08, [SEAT.x, MAT + 0.04, 0], 'stoneDark', { segments: 12 }),
      kit.cylinder(0.09, 0.09, 0.3, [SEAT.x, 0.25, 0], 'chrome', { segments: 8 }),
      kit.box([0.55, 0.14, 0.5], [SEAT.x, SEAT.y - 0.07, 0], 'teal'),
      kit.box([0.5, 0.05, 0.46], [SEAT.x, SEAT.y + 0.025, 0], 'sunYellow'),
      kit.box([0.1, BACK_LEN, 0.5], [bx - 0.5 * BACK_LEN * Math.sin(TILT), SEAT.y + 0.5 * BACK_LEN * Math.cos(TILT), 0], 'teal', { rotate: [0, 0, TILT] }),
      kit.box([0.05, BACK_LEN - 0.1, 0.44], [bx - 0.5 * BACK_LEN * Math.sin(TILT) + 0.07 * Math.cos(TILT), SEAT.y + 0.5 * BACK_LEN * Math.cos(TILT) + 0.07 * Math.sin(TILT), 0], 'sunYellow', { rotate: [0, 0, TILT] }),
      kit.box([0.14, 0.2, 0.3], [bx - (BACK_LEN + 0.08) * Math.sin(TILT), SEAT.y + (BACK_LEN + 0.08) * Math.cos(TILT) - 0.05, 0], 'blue', { rotate: [0, 0, TILT] }),
      kit.box([0.1, 0.34, 0.4], [SEAT.x + 0.4, 0.4, 0], 'teal'),
      kit.box([0.34, 0.06, 0.4], [SEAT.x + 0.55, 0.28, 0], 'blue', { rotate: [0, 0, -0.35] }),
      // lamp: pole, arm over the chair, a glowing head
      kit.cylinder(0.05, 0.07, 1.5, [-0.55, 0.75, -0.8], 'stoneDark', { segments: 8 }),
      kit.cylinder(0.2, 0.2, 0.05, [-0.55, 0.025, -0.8], 'stoneDark', { segments: 8 }),
      kit.box([0.1, 0.08, 0.8], [-0.55, 1.5, -0.42], 'stone'),
      kit.cylinder(0.26, 0.14, 0.16, [-0.55, 1.4, -0.05], 'teal', { segments: 10 }),
      kit.cylinder(0.2, 0.2, 0.03, [-0.55, 1.31, -0.05], 'lampWarm', { segments: 10, glow: true, light: 'window' }),
      // tray on a post at the +z side: cups, a big toothbrush
      kit.cylinder(0.04, 0.04, 0.55, [0.1, 0.29, 0.78], 'chrome', { segments: 8 }),
      kit.cylinder(0.14, 0.18, 0.05, [0.1, MAT + 0.025, 0.78], 'stoneDark', { segments: 8 }),
      kit.box([0.5, 0.04, 0.36], [0.1, 0.58, 0.78], 'teal'),
      kit.cylinder(0.05, 0.04, 0.07, [0.0, 0.635, 0.68], 'pink', { segments: 8 }),
      kit.cylinder(0.05, 0.04, 0.07, [0.0, 0.635, 0.86], 'sunYellow', { segments: 8 }),
      kit.box([0.22, 0.02, 0.05], [0.2, 0.61, 0.72], 'lime'), // toothbrush handle
      kit.box([0.08, 0.025, 0.07], [0.33, 0.615, 0.72], 'white'),
      kit.box([0.1, 0.03, 0.08], [0.22, 0.615, 0.88], 'orange', { rotate: [0, 0.4, 0] }),
    ];
    // poster: two legs, a teal frame, a pale blue board, a smiling tooth
    const { x, y, w, h } = POSTER;
    parts.push(
      kit.box([0.06, y - h / 2 + 0.02, 0.08], [x, (y - h / 2 + 0.02) / 2, -w / 2 + 0.08], 'woodDark'),
      kit.box([0.06, y - h / 2 + 0.02, 0.08], [x, (y - h / 2 + 0.02) / 2, w / 2 - 0.08], 'woodDark'),
      kit.box([0.06, h + 0.1, w + 0.1], [x, y, 0], 'teal'),
      kit.box([0.03, h, w], [x + 0.03, y, 0], 'skyBlue'),
    );
    const tx = x + 0.06;
    const fx = tx + 0.1; // in front of the tooth face
    parts.push(
      kit.sphere(0.3, [tx, y + 0.05, 0], 'white', { scale: [0.3, 0.95, 1.2] }),
      kit.sphere(0.17, [tx, y + 0.28, -0.17], 'white', { scale: [0.3, 1, 1] }),
      kit.sphere(0.17, [tx, y + 0.28, 0.17], 'white', { scale: [0.3, 1, 1] }),
      kit.cone(0.1, 0.25, [tx, y - 0.3, -0.13], 'white', { rotate: [Math.PI, 0, 0], scale: [0.4, 1, 1], segments: 8 }),
      kit.cone(0.1, 0.25, [tx, y - 0.3, 0.13], 'white', { rotate: [Math.PI, 0, 0], scale: [0.4, 1, 1], segments: 8 }),
      kit.torus(0.1, 0.02, [fx, y + 0.03, 0], 'navy', { arc: Math.PI, rotate: [0, Math.PI / 2, Math.PI] }), // smile
      kit.sphere(0.03, [fx, y + 0.18, -0.12], 'navy', { detail: 0 }),
      kit.sphere(0.03, [fx, y + 0.18, 0.12], 'navy', { detail: 0 }),
      kit.sphere(0.04, [fx, y + 0.07, -0.2], 'pink', { detail: 0, scale: [0.4, 1, 1] }),
      kit.sphere(0.04, [fx, y + 0.07, 0.2], 'pink', { detail: 0, scale: [0.4, 1, 1] }),
    );
    return kit.finish(parts);
  },
};
