import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A short counter along z with a cash register, a bell and a tip jar, plus a picture menu stand on the
// floor in front (+x): pictures of a cup, a cake and a juice with colour blocks, no text or numbers.
const TOP_Y = 0.62;
const BODY = { x: -0.35, w: 0.8, d: 1.7 };
const SLAB = { x: -0.32, w: 0.9, d: 1.8, t: 0.04 };
const STAND = { x: 0.66, z: 0.5 }; // menu stand centre
const FACE_X = STAND.x + 0.03; // front face of the board

/** เคาน์เตอร์คิดเงิน: a short counter with a register, a bell, a tip jar and a picture menu stand. */
export const item: ItemModel = {
  id: 'cashier-counter',
  name: 'เคาน์เตอร์คิดเงิน',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BODY.w + 0.04, 0.04, BODY.d + 0.04], [BODY.x, 0.02, 0], 'woodDark'),
      kit.box([BODY.w, TOP_Y - SLAB.t - 0.04, BODY.d], [BODY.x, 0.04 + (TOP_Y - SLAB.t - 0.04) / 2, 0], 'wood'),
      kit.box([SLAB.w, SLAB.t, SLAB.d], [SLAB.x, TOP_Y - SLAB.t / 2, 0], 'woodDark'),
    ];
    for (const z of [-0.5, 0.5]) parts.push(kit.box([0.02, 0.3, 0.6], [BODY.x + BODY.w / 2 + 0.01, 0.3, z], 'orange'));

    // cash register: body, tilted screen block, button blocks and an open drawer front
    parts.push(
      kit.box([0.3, 0.16, 0.34], [-0.5, TOP_Y + 0.08, -0.5], 'charcoal'),
      kit.box([0.14, 0.12, 0.3], [-0.55, TOP_Y + 0.22, -0.5], 'chrome'),
      kit.box([0.02, 0.08, 0.22], [-0.475, TOP_Y + 0.22, -0.5], 'mint'),
      kit.box([0.04, 0.03, 0.26], [-0.34, TOP_Y + 0.175, -0.5], 'stone'),
    );
    for (const z of [-0.6, -0.5, -0.4]) {
      parts.push(kit.box([0.05, 0.02, 0.05], [-0.36, TOP_Y + 0.17, z], 'sunYellow'));
      parts.push(kit.box([0.05, 0.02, 0.05], [-0.42, TOP_Y + 0.17, z], 'red'));
    }
    // service bell: brass dome on a small base with a knob
    parts.push(
      kit.cylinder(0.08, 0.09, 0.02, [-0.1, TOP_Y + 0.01, -0.05], 'woodDark', { segments: 10 }),
      kit.dome(0.075, [-0.1, TOP_Y + 0.02, -0.05], 'brass', { segments: 12 }),
      kit.sphere(0.02, [-0.1, TOP_Y + 0.105, -0.05], 'sunYellow', { detail: 0 }),
    );
    // tip jar: plain glass jar with a lid and a few coins
    parts.push(
      kit.cylinder(0.075, 0.075, 0.16, [-0.4, TOP_Y + 0.08, 0.5], 'glassBlue', { segments: 10 }),
      kit.cylinder(0.082, 0.082, 0.02, [-0.4, TOP_Y + 0.17, 0.5], 'stoneDark', { segments: 10 }),
      kit.cylinder(0.035, 0.035, 0.01, [-0.4, TOP_Y + 0.185, 0.5], 'sunYellow', { segments: 8 }),
      kit.cylinder(0.035, 0.035, 0.01, [-0.2, TOP_Y + 0.005, 0.62], 'sunYellow', { segments: 8 }),
      kit.cylinder(0.035, 0.035, 0.01, [-0.15, TOP_Y + 0.005, 0.52], 'brass', { segments: 8 }),
    );

    // picture menu stand: board on two legs, three picture rows
    parts.push(
      kit.box([0.04, 0.62, 0.6], [STAND.x, 0.62 / 2 + 0.2, STAND.z], 'charcoal'),
      kit.box([0.05, 0.04, 0.64], [STAND.x, 0.84, STAND.z], 'woodDark'),
      kit.box([0.06, 0.2, 0.05], [STAND.x, 0.1, STAND.z - 0.22], 'woodDark'),
      kit.box([0.06, 0.2, 0.05], [STAND.x, 0.1, STAND.z + 0.22], 'woodDark'),
      kit.box([0.22, 0.03, 0.62], [STAND.x, 0.015, STAND.z], 'woodDark'),
    );
    const pz = STAND.z - 0.12; // picture column
    const bz = STAND.z + 0.14; // colour-block column
    const rows = [0.72, 0.52, 0.32];
    // row 1: coffee cup (white cup, brown coffee, handle ring, a steam dot)
    parts.push(
      kit.cylinder(0.065, 0.055, 0.02, [FACE_X + 0.01, rows[0], pz], 'white', { segments: 10, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.05, 0.05, 0.01, [FACE_X + 0.025, rows[0], pz], 'bark', { segments: 10, rotate: [0, 0, Math.PI / 2] }),
      kit.torus(0.03, 0.01, [FACE_X + 0.01, rows[0], pz + 0.08], 'white', { radialSegments: 4, tubularSegments: 8 }),
      kit.box([0.01, 0.1, 0.16], [FACE_X + 0.005, rows[0], bz], 'brass'),
    );
    // row 2: cake slice (pink disc, cream top, cherry)
    parts.push(
      kit.cylinder(0.07, 0.07, 0.02, [FACE_X + 0.01, rows[1], pz], 'pink', { segments: 10, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.05, 0.05, 0.01, [FACE_X + 0.025, rows[1], pz], 'cream', { segments: 10, rotate: [0, 0, Math.PI / 2] }),
      kit.sphere(0.025, [FACE_X + 0.03, rows[1], pz], 'red', { detail: 0 }),
      kit.box([0.01, 0.1, 0.16], [FACE_X + 0.005, rows[1], bz], 'pink'),
    );
    // row 3: juice glass (orange) with a straw and a slice
    parts.push(
      kit.box([0.02, 0.12, 0.09], [FACE_X + 0.01, rows[2], pz], 'orange'),
      kit.box([0.02, 0.1, 0.02], [FACE_X + 0.015, rows[2] + 0.08, pz + 0.03], 'red'),
      kit.sphere(0.03, [FACE_X + 0.03, rows[2] - 0.02, pz - 0.05], 'lime', { detail: 0 }),
      kit.box([0.01, 0.1, 0.16], [FACE_X + 0.005, rows[2], bz], 'lime'),
    );
    return kit.finish(parts);
  },
};
