import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { wallPanel } from '../../../models/parts';

// A modern bus shelter facing the road (+x): a paved pad with a yellow kerb, slim steel posts, a
// rounded blue canopy, a glass back and -z side, a route-map board on the +z end, an orange bench,
// and a round bus-stop sign on its own pole at the kerb. Nothing like the timber sala: steel,
// glass and a curved canopy. The shelter is shallow so the bench shows under the canopy from the
// steep default camera.
const PAD = { size: 1.94, h: 0.04 };
const KERB = { w: 0.1, h: 0.07 };
const BACK_X = -0.46; // back posts and the glass back panel
const FRONT_X = -0.02; // front posts
const POST_Z = 0.72;
const POST_R = 0.035;
const ROOF = { x: -0.25, y: 1.2, r: 0.36, len: 1.66, squash: 0.24 }; // a squashed drum lying along z: a rounded canopy
const PANEL = { y0: 0.22, y1: 0.92, t: 0.02 }; // glass panels and the map board; rails along both edges
const BENCH = { x: -0.27, y: 0.32, len: 1.2, d: 0.26 };
const MAP = { y: 0.6, h: 0.5 }; // route map board on the +z end, facing out
const SIGN = { x: 0.74, z: 0.74, top: 1.3, r: 0.17, y: 1.2 };

/** ศาลาที่พักผู้โดยสาร: a bus stop shelter with a blue canopy, glass panels, a bench and a round route sign. */
export const item: ItemModel = {
  id: 'bus-stop',
  name: 'ศาลาที่พักผู้โดยสาร',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const rail = (size: Vec3, at: Vec3) => kit.box(size, at, 'stoneDark');
    const panelH = PANEL.y1 - PANEL.y0;
    const panelY = (PANEL.y0 + PANEL.y1) / 2;
    const depth = FRONT_X - BACK_X;
    const midX = (BACK_X + FRONT_X) / 2;
    const parts: Part[] = [
      kit.box([PAD.size, PAD.h, PAD.size], [0, PAD.h / 2, 0], 'stone'),
      kit.box([KERB.w, KERB.h, PAD.size], [PAD.size / 2 - KERB.w / 2, KERB.h / 2, 0], 'sunYellow'),
      kit.cylinder(ROOF.r, ROOF.r, ROOF.len, [ROOF.x, ROOF.y, 0], 'blue',
        { rotate: [Math.PI / 2, 0, 0], scale: [1, 1, ROOF.squash], segments: 16 }),
      // a warm strip light under the front of the canopy (lights up at night)
      kit.box([0.05, 0.02, 1.1], [FRONT_X, ROOF.y - 0.07, 0], 'lampWarm', { glow: true }),
      // glass back, between the back posts, and glass on the -z end
      kit.box([PANEL.t, panelH, 2 * POST_Z], [BACK_X, panelY, 0], 'glassBlue'),
      kit.box([depth, panelH, PANEL.t], [midX, panelY, -POST_Z], 'glassBlue'),
      // route map board on the +z end: white, blue header, red route line with three stops
      kit.box([depth, MAP.h, 0.03], [midX, MAP.y, POST_Z], 'white'),
      ...wallPanel(kit, { at: [midX, MAP.y + MAP.h / 2 - 0.05, POST_Z + 0.015], facing: 'z+', w: depth, h: 0.1, depth: 0.01, color: 'blue' }),
      ...wallPanel(kit, { at: [midX, MAP.y - 0.06, POST_Z + 0.015], facing: 'z+', w: depth - 0.12, h: 0.03, depth: 0.01, color: 'red' }),
      // bench along the back glass
      kit.box([BENCH.d, 0.05, BENCH.len], [BENCH.x, BENCH.y, 0], 'orange'),
    ];
    for (const dx of [-0.12, 0, 0.12]) {
      parts.push(...wallPanel(kit, { at: [midX + dx, MAP.y - 0.06, POST_Z + 0.015], facing: 'z+', w: 0.05, h: 0.05, depth: 0.02, color: 'navy' }));
    }
    for (const y of [PANEL.y0, PANEL.y1]) {
      parts.push(
        rail([0.04, 0.04, 2 * POST_Z], [BACK_X, y, 0]),
        rail([depth, 0.04, 0.04], [midX, y, -POST_Z]),
      );
    }
    for (const s of [-1, 1]) {
      parts.push(kit.box([0.18, BENCH.y - 0.025 - PAD.h, 0.05], [BENCH.x, (PAD.h + BENCH.y - 0.025) / 2, s * 0.45], 'charcoal'));
    }
    for (const x of [BACK_X, FRONT_X]) {
      for (const s of [-1, 1]) {
        parts.push(kit.cylinder(POST_R, POST_R, ROOF.y, [x, ROOF.y / 2, s * POST_Z], 'stoneDark', { segments: 8 }));
      }
    }

    // bus-stop sign: a round blue sign with a white face (lit at night) and a little bus on it, facing the road
    const disc = (r: number, d: number, front: number, color: PaletteColor, glow = false): Part =>
      kit.cylinder(r, r, d, [SIGN.x + front - d / 2, SIGN.y, SIGN.z], color, { rotate: [0, 0, Math.PI / 2], segments: 16, glow });
    const icon = (w: number, h: number, dy: number, dz: number, front: number, color: PaletteColor): Part =>
      kit.box([0.02, h, w], [SIGN.x + front - 0.01, SIGN.y + dy, SIGN.z + dz], color);
    parts.push(
      kit.box([0.14, 0.05, 0.14], [SIGN.x, PAD.h + 0.025, SIGN.z], 'stoneDark'),
      kit.cylinder(0.03, 0.03, SIGN.top - PAD.h, [SIGN.x, (PAD.h + SIGN.top) / 2, SIGN.z], 'stoneDark', { segments: 8 }),
      disc(SIGN.r, 0.03, 0.06, 'blue'),
      disc(SIGN.r - 0.035, 0.03, 0.07, 'white', true), // the sign face lights up at night
      icon(0.17, 0.09, 0.0, 0, 0.08, 'blue'), // bus body
      icon(0.12, 0.03, 0.017, 0, 0.09, 'white'), // windows
      icon(0.035, 0.035, -0.06, -0.05, 0.09, 'charcoal'), // wheels (one layer out, like the windows)
      icon(0.035, 0.035, -0.06, 0.05, 0.09, 'charcoal'),
    );
    return kit.finish(parts);
  },
};
