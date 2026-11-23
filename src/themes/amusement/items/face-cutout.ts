import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod, wallPanel } from '../../../models/parts';

// A painted board standing on two rails: a cartoon astronaut in space with a hole for your face.
// The board faces +x. It is built from four navy pieces around the hole and a white helmet ring.
const T = 0.06; // board thickness
const FACE = T / 2; // x of the painted surface
const W = 0.84;
const Y0 = 0.04;
const Y1 = 1.6;
const HOLE = { y0: 0.98, y1: 1.3, hw: 0.15 }; // half width along z
const HELMET = { r: 0.24, tube: 0.06 };
const HOLE_Y = (HOLE.y0 + HOLE.y1) / 2;

/** ป้ายเจาะหน้าถ่ายรูป: a painted astronaut board with a face hole. */
export const item: ItemModel = {
  id: 'face-cutout',
  name: 'ป้ายเจาะหน้าถ่ายรูป',
  category: 'play',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const side = (W / 2 - HOLE.hw) / 2;
    const paint = (z: number, y: number, w: number, h: number, depth: number, color: Parameters<typeof wallPanel>[1]['color']) =>
      wallPanel(kit, { at: [FACE, y, z], facing: 'x+', w, h, depth, color });
    const parts: Part[] = [
      kit.box([0.9, 0.04, 0.08], [0, 0.02, -0.3], 'woodDark'),
      kit.box([0.9, 0.04, 0.08], [0, 0.02, 0.3], 'woodDark'),
      // the board, around the hole
      kit.box([T, HOLE.y0 - Y0, W], [0, (Y0 + HOLE.y0) / 2, 0], 'navy'),
      kit.box([T, Y1 - HOLE.y1, W], [0, (HOLE.y1 + Y1) / 2, 0], 'navy'),
      kit.box([T, HOLE.y1 - HOLE.y0, 2 * side], [0, HOLE_Y, W / 4 + HOLE.hw / 2], 'navy'),
      kit.box([T, HOLE.y1 - HOLE.y0, 2 * side], [0, HOLE_Y, -(W / 4 + HOLE.hw / 2)], 'navy'),
      kit.torus(HELMET.r, HELMET.tube, [0, HOLE_Y, 0], 'white', { rotate: [0, Math.PI / 2, 0], tubularSegments: 16 }),
      // suit: body, arms, belt, boots, chest panel
      ...paint(0, 0.52, 0.6, 0.8, 0.02, 'white'),
      ...paint(-0.36, 0.62, 0.1, 0.5, 0.02, 'white'),
      ...paint(0.36, 0.62, 0.1, 0.5, 0.02, 'white'),
      ...paint(0, 0.4, 0.6, 0.06, 0.03, 'red'),
      ...paint(-0.15, 0.17, 0.2, 0.1, 0.03, 'charcoal'),
      ...paint(0.15, 0.17, 0.2, 0.1, 0.03, 'charcoal'),
      ...paint(0, 0.72, 0.26, 0.16, 0.03, 'orange'),
      ...paint(-0.06, 0.72, 0.06, 0.06, 0.04, 'blue'),
      ...paint(0.06, 0.72, 0.06, 0.06, 0.04, 'sunYellow'),
      // space: planet and stars
      kit.sphere(0.07, [FACE, 1.5, -0.3], 'orange', { scale: [0.35, 1, 1] }),
      ...paint(0.3, 1.5, 0.06, 0.06, 0.025, 'sunYellow'),
      ...paint(0.37, 1.2, 0.05, 0.05, 0.025, 'sunYellow'),
      ...paint(-0.37, 1.22, 0.05, 0.05, 0.025, 'sunYellow'),
      ...paint(0.1, 1.53, 0.05, 0.05, 0.025, 'sunYellow'),
      // back legs
      rod(kit, [-FACE, 1.2, -0.3], [-0.43, 0.04, -0.3], 0.03, 'woodDark', { segments: 4 }),
      rod(kit, [-FACE, 1.2, 0.3], [-0.43, 0.04, 0.3], 0.03, 'woodDark', { segments: 4 }),
    ];
    return kit.finish(parts);
  },
};
