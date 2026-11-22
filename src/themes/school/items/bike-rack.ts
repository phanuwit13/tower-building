import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const STRIP = { w: 0.58, h: 0.06, d: 1.88 }; // stone strip the loops are set in
const LOOP = { r: 0.17, tube: 0.028, stretch: 1.35, sink: 0.02 }; // inverted-U hoop, stretched up; feet sunk into the strip
const COUNT = 6;
const FIRST_Z = -0.8; // first loop; then every STEP along z
const STEP = 0.27;
// a small blue parking sign at the +z end with a white bicycle drawn on its +x face
const SIGN = { z: 0.78, x: -0.04, post: 0.03, top: 0.7, board: 0.27, t: 0.03 };
const PICTO = { wheel: 0.044, tube: 0.013, gap: 0.072, line: 0.018 }; // the two little wheels: radius, thickness, half the distance between them

/** ที่จอดจักรยาน: a row of six bare blue steel loops set in a stone strip, with a blue parking sign. */
export const item: ItemModel = {
  id: 'bike-rack',
  name: 'ที่จอดจักรยาน',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([STRIP.w, STRIP.h, STRIP.d], [0, STRIP.h / 2, 0], 'stone')];
    for (let i = 0; i < COUNT; i++) {
      // the loop stands across the strip (in the x-y plane): a bike wheel rolls in between two loops
      parts.push(kit.torus(LOOP.r, LOOP.tube, [0, STRIP.h - LOOP.sink, FIRST_Z + i * STEP], 'blue', {
        arc: Math.PI, radialSegments: 5, tubularSegments: 8, scale: [1, LOOP.stretch, 1],
      }));
    }
    // sign: post, board, and a white bicycle pictogram on the front
    const boardY = SIGN.top - SIGN.board / 2;
    const face = SIGN.x + SIGN.t / 2; // front (+x) face of the board
    parts.push(
      kit.cylinder(SIGN.post, SIGN.post, SIGN.top - 0.02, [SIGN.x - SIGN.t / 2 - SIGN.post, (SIGN.top - 0.02) / 2, SIGN.z], 'stoneDark', { segments: 8 }),
      kit.box([SIGN.t, SIGN.board, SIGN.board], [SIGN.x, boardY, SIGN.z], 'blue'),
    );
    // Drawn on the board in (side, up) coordinates: side runs along z, so the bike points to -z.
    const wy = boardY - 0.04; // wheel centres
    const px = face + 0.006;
    for (const s of [-1, 1]) {
      parts.push(kit.torus(PICTO.wheel, PICTO.tube, [px, wy, SIGN.z + s * PICTO.gap], 'white', {
        radialSegments: 3, tubularSegments: 10, rotate: [0, Math.PI / 2, 0],
      }));
    }
    /** A white stroke on the board from (z0, y0) to (z1, y1). */
    const stroke = (z0: number, y0: number, z1: number, y1: number) => {
      const len = Math.hypot(z1 - z0, y1 - y0);
      parts.push(kit.box([0.012, PICTO.line, len], [px, (y0 + y1) / 2, SIGN.z + (z0 + z1) / 2], 'white',
        { rotate: [-Math.atan2(y1 - y0, z1 - z0), 0, 0] }));
    };
    const seat: [number, number] = [0.03, wy + 0.07];
    const bars: [number, number] = [-0.055, wy + 0.08];
    stroke(PICTO.gap, wy, 0, wy); // chain stay: rear hub to pedals
    stroke(0, wy, seat[0], seat[1]); // seat tube
    stroke(seat[0], seat[1] - 0.01, bars[0], bars[1] - 0.015); // top tube
    stroke(0, wy, bars[0], bars[1] - 0.015); // down tube
    stroke(bars[0], bars[1] + 0.005, -PICTO.gap, wy); // fork
    stroke(seat[0] + 0.022, seat[1] + 0.012, seat[0] - 0.012, seat[1] + 0.012); // saddle
    stroke(bars[0] - 0.012, bars[1] + 0.01, bars[0] + 0.018, bars[1] + 0.01); // handlebar
    return kit.finish(parts);
  },
};
