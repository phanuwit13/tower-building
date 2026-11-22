import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// The bike is drawn in its own side plane (x forward, y up, z sideways) and then leaned a little
// about x (towards -z) onto its kick stand. The lean turns about the ground line under the wheels,
// so the tyres still touch y = 0.
const LEAN = -0.1; // radians about x
const WHEEL = { r: 0.125, tube: 0.034 }; // ring radius, tyre thickness
const AXLE_Y = WHEEL.r + WHEEL.tube;
const REAR_X = -0.24;
const FRONT_X = 0.24;
const TUBE = 0.022; // frame tube radius
// frame joints in the side plane
const BB: Vec3 = [-0.02, 0.17, 0]; // bottom bracket (where the pedals turn)
const SEAT_JOINT: Vec3 = [-0.1, 0.38, 0]; // seat tube, top tube and seat stay meet here
const HEAD_TOP: Vec3 = [0.165, 0.41, 0];
const HEAD_BOT: Vec3 = [0.185, 0.31, 0];
const REAR_AXLE: Vec3 = [REAR_X, AXLE_Y, 0];
const FRONT_AXLE: Vec3 = [FRONT_X, AXLE_Y, 0];
const SADDLE: Vec3 = [-0.12, 0.45, 0];
const BAR = { at: [0.15, 0.48, 0] as Vec3, half: 0.13 }; // handlebar across z
const BASKET = { at: [0.29, 0.44, 0] as Vec3, size: [0.16, 0.12, 0.22] as Vec3 };
const STAND_FOOT: Vec3 = [-0.13, 0.028, -0.16]; // chosen so the leaned foot lands just above the ground (see build)

const cos = Math.cos(LEAN);
const sin = Math.sin(LEAN);
/** A point in the bike's side plane after the lean. */
const lean = ([x, y, z]: Vec3): Vec3 => [x, y * cos - z * sin, y * sin + z * cos];
const mid = (a: Vec3, b: Vec3): Vec3 => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];

/** จักรยาน: a child's bicycle on its kick stand, red frame, black tyres, handlebars and a basket in front. */
export const item: ItemModel = {
  id: 'bicycle',
  name: 'จักรยาน',
  category: 'vehicle',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const leaned: Vec3 = [LEAN, 0, 0];
    /** A round tube from a to b (side-plane points): its y axis turned onto the a-b direction, then leaned. */
    const rod = (a: Vec3, b: Vec3, r: number, color: PaletteColor, segments = 5): Part => {
      const d: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      const len = Math.hypot(...d);
      // Euler XYZ [α, 0, γ] = Rx(α)·Rz(γ) takes +y to (dx, dy, dz); the lean adds to α
      return kit.cylinder(r, r, len, lean(mid(a, b)), color,
        { segments, rotate: [Math.atan2(d[2], d[1]) + LEAN, 0, -Math.asin(d[0] / len)] });
    };
    const parts: Part[] = [];

    // wheels: black tyres, two white crossed spokes, grey hubs
    for (const x of [REAR_X, FRONT_X]) {
      const c = lean([x, AXLE_Y, 0]);
      parts.push(kit.torus(WHEEL.r, WHEEL.tube, c, 'charcoal', { radialSegments: 4, tubularSegments: 12, rotate: leaned }));
      for (const a of [0, Math.PI / 2]) {
        parts.push(kit.box([2 * WHEEL.r, 0.022, 0.02], c, 'white', { rotate: [LEAN, 0, a + 0.4] }));
      }
      parts.push(kit.sphere(0.035, c, 'stone', { detail: 0, scale: [1, 1, 1.4], rotate: leaned }));
    }

    // red frame
    parts.push(
      rod(SEAT_JOINT, HEAD_TOP, TUBE, 'red'), // top tube
      rod(BB, HEAD_BOT, TUBE * 1.15, 'red'), // down tube
      rod(BB, SEAT_JOINT, TUBE, 'red'), // seat tube
      rod(SEAT_JOINT, REAR_AXLE, TUBE * 0.8, 'red'), // seat stay
      rod(BB, REAR_AXLE, TUBE * 0.8, 'red'), // chain stay
      rod(HEAD_BOT, HEAD_TOP, TUBE * 1.4, 'red'), // head tube
      rod(HEAD_BOT, FRONT_AXLE, TUBE * 0.9, 'red'), // fork
    );
    // seat post and saddle, stem, handlebar with grips and a little yellow bell
    parts.push(
      rod(SEAT_JOINT, [SADDLE[0] + 0.005, SADDLE[1] - 0.02, 0], 0.014, 'stoneDark', 5),
      kit.sphere(0.06, lean(SADDLE), 'charcoal', { detail: 0, scale: [1.4, 0.45, 0.8], rotate: leaned }),
      rod(HEAD_TOP, BAR.at, 0.016, 'stoneDark', 5),
      kit.cylinder(0.014, 0.014, 2 * BAR.half, lean(BAR.at), 'stoneDark', { segments: 5, rotate: [Math.PI / 2 + LEAN, 0, 0] }),
      kit.sphere(0.022, lean([BAR.at[0] + 0.01, BAR.at[1] + 0.025, -0.06]), 'sunYellow', { detail: 0 }),
    );
    for (const s of [-1, 1]) {
      parts.push(kit.box([0.04, 0.04, 0.065], lean([BAR.at[0], BAR.at[1], s * (BAR.half - 0.02)]), 'charcoal', { rotate: leaned })); // grip
    }
    // front basket: light wicker, dark inside on top, bolted to the handlebar
    const [bx, by, bz] = BASKET.at;
    const [sx, sy, sz] = BASKET.size;
    parts.push(
      kit.box(BASKET.size, lean(BASKET.at), 'sand', { rotate: leaned }),
      kit.box([sx - 0.03, 0.01, sz - 0.03], lean([bx, by + sy / 2, bz]), 'woodDark', { rotate: leaned }),
      kit.box([sx + 0.012, 0.025, sz + 0.012], lean([bx, by + sy / 2 - 0.025, bz]), 'wood', { rotate: leaned }), // rim band
    );
    // chain wheel and a pedal on the near (+z) side
    parts.push(
      kit.cylinder(0.05, 0.05, 0.016, lean([BB[0], BB[1], 0.035]), 'stoneDark', { segments: 7, rotate: [Math.PI / 2 + LEAN, 0, 0] }),
      kit.box([0.07, 0.02, 0.05], lean([BB[0] + 0.05, BB[1] - 0.05, 0.075]), 'charcoal', { rotate: leaned }),
    );
    // kick stand on the -z side, down to a small foot that sits flat on the ground
    const foot = lean(STAND_FOOT);
    parts.push(
      rod([BB[0] - 0.03, BB[1] - 0.01, -0.03], STAND_FOOT, 0.012, 'stoneDark', 4),
      kit.box([0.06, 0.02, 0.05], [foot[0], 0.01, foot[2]], 'stoneDark'),
    );
    return kit.finish(parts);
  },
};
