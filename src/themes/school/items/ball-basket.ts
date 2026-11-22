import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';

const PAD = { w: 0.84, h: 0.06 }; // stone pad the crate stands on
const CRATE = { w: 0.62, h: 0.36 }; // square wooden crate, outer size
const POST = 0.075; // corner posts (darker wood)
const SLAT = { h: 0.135, t: 0.05, inset: 0.012 }; // slat bands: height, wall thickness; `inset` behind the posts' faces
const GAP = { y0: 0.135, y1: 0.215, depth: 0.02 }; // the dark gap between the two slat bands, set back `depth`
const RIM = 0.35; // top of the upper slats (posts reach CRATE.h)
const FILL_TOP = 0.3; // the balls sink to about here
const BALL_R = 0.17;
const BASE = PAD.h; // crate bottom
const BALL_Y = BASE + FILL_TOP + BALL_R * 0.55; // ball centres: sunk a little into the pile
const FOOTBALL: Vec3 = [0.1, BALL_Y, 0.1];
const BASKETBALL: Vec3 = [-0.1, BALL_Y + 0.03, 0.06];
const VOLLEYBALL: Vec3 = [0.06, BALL_Y + 0.015, -0.12];
/** Black football patches: directions from the ball centre (normalised in the code), on the sides kids see. */
const PATCHES: Vec3[] = [[0.15, 1, 0.1], [1, 0.35, 0.25], [0.25, 0.35, 1]];

/** ตะกร้าลูกบอล: a slatted wooden crate on a stone pad, full of balls (football, basketball, volleyball). */
export const item: ItemModel = {
  id: 'ball-basket',
  name: 'ตะกร้าลูกบอล',
  category: 'play',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const half = CRATE.w / 2;
    const parts: Part[] = [kit.box([PAD.w, PAD.h, PAD.w], [0, PAD.h / 2, 0], 'stone')];
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        parts.push(kit.box([POST, CRATE.h, POST], [sx * (half - POST / 2), BASE + CRATE.h / 2, sz * (half - POST / 2)], 'woodDark'));
      }
    }
    // Two bands of slats round the four sides, a dark set-back gap between them and a dark inside
    // just proud of the rim (the balls hide most of it). Solid boxes: from outside it looks the same
    // as separate slats, for a third of the triangles.
    const side = CRATE.w - 2 * SLAT.inset;
    const inner = side - 2 * SLAT.t;
    const gapSide = side - 2 * GAP.depth;
    parts.push(
      kit.box([side, SLAT.h, side], [0, BASE + SLAT.h / 2, 0], 'wood'),
      kit.box([gapSide, GAP.y1 - GAP.y0 + 0.01, gapSide], [0, BASE + (GAP.y0 + GAP.y1) / 2, 0], 'bark'),
      kit.box([side, RIM - GAP.y1, side], [0, BASE + (GAP.y1 + RIM) / 2, 0], 'wood'),
      kit.box([inner, 0.012, inner], [0, BASE + RIM - 0.004, 0], 'bark'),
    );

    // football: white with black patches poking out of its surface
    parts.push(kit.sphere(BALL_R, FOOTBALL, 'white'));
    for (const p of PATCHES) {
      const n = Math.hypot(...p);
      const d = BALL_R * 0.86;
      parts.push(kit.sphere(0.05, [FOOTBALL[0] + (p[0] / n) * d, FOOTBALL[1] + (p[1] / n) * d, FOOTBALL[2] + (p[2] / n) * d], 'charcoal', { detail: 0 }));
    }
    // basketball: orange with two crossing black seams
    const seam = { radialSegments: 3, tubularSegments: 10 };
    parts.push(
      kit.sphere(BALL_R, BASKETBALL, 'orange'),
      kit.torus(BALL_R, 0.016, BASKETBALL, 'charcoal', { ...seam, rotate: [0, 0.6, 0] }),
      kit.torus(BALL_R, 0.016, BASKETBALL, 'charcoal', { ...seam, rotate: [0, 0.6 + Math.PI / 2, 0] }),
    );
    // volleyball: yellow with a wide blue band
    parts.push(
      kit.sphere(BALL_R, VOLLEYBALL, 'sunYellow'),
      kit.torus(BALL_R * 0.93, 0.045, VOLLEYBALL, 'blue', { radialSegments: 4, tubularSegments: 10, rotate: [0.5, 0.9, 0.2] }),
    );
    return kit.finish(parts);
  },
};
