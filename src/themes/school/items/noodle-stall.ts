import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { wallPanel } from '../../../models/parts';

// A canteen noodle stall, long side along z, serving side (+x) to the front. The striped awning
// slopes down towards the front but stops over the middle of the counter, so the pot and the
// bowls on the front half stay in view from the high 3/4 camera.
const COUNTER = { x0: -0.2, x1: 0.38, len: 1.62, h: 0.4 }; // wooden body (x from x0 to x1)
const TOP = { h: 0.04, lip: 0.02 }; // dark wooden counter top
const TOP_Y = COUNTER.h + TOP.h; // counter top surface
const FRONT_X = COUNTER.x1;
const SIGN = { w: 0.86, h: 0.18, y: 0.24 }; // red sign on the front: a white bowl with chopsticks
// Awning: N stripes across z, each a slab sloping from the back edge (x0, y0) down to the front (x1, y1).
const AWN = { x0: -0.46, y0: 1.42, x1: 0.12, y1: 1.18, len: 1.72, t: 0.04, n: 7 };
const VALANCE_H = 0.12; // the pointed flaps hanging from the front edge
const POST = 0.05;
const POST_Z = 0.78;
const BACK_POST_X = -0.42;
const FRONT_POST_X = AWN.x1 - 0.05; // the front posts stand on the counter top
const POT = { x: 0.17, z: 0.44, r: 0.15, h: 0.2 };
const BOWL = { x: 0.19, z: -0.04, rTop: 0.075, rBottom: 0.048, h: 0.05, step: 0.032, n: 5 };
const CADDY = { x: 0.19, z: -0.44 }; // condiment set: chilli, sugar, fish sauce, pickled chilli
const JARS: PaletteColor[] = ['red', 'white', 'orange', 'lime'];

/** ร้านก๋วยเตี๋ยว: a canteen noodle stall with a red-striped awning, a steaming pot and a stack of bowls. */
export const item: ItemModel = {
  id: 'noodle-stall',
  name: 'ร้านก๋วยเตี๋ยว',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const cw = COUNTER.x1 - COUNTER.x0;
    const cx = (COUNTER.x0 + COUNTER.x1) / 2;
    const parts: Part[] = [
      kit.box([cw, COUNTER.h, COUNTER.len], [cx, COUNTER.h / 2, 0], 'wood'),
      kit.box([cw + 2 * TOP.lip, TOP.h, COUNTER.len + 2 * TOP.lip], [cx, COUNTER.h + TOP.h / 2, 0], 'woodDark'),
      ...wallPanel(kit, { at: [FRONT_X, SIGN.y, 0], facing: 'x+', w: SIGN.w, h: SIGN.h, depth: 0.02, color: 'red' }),
      // bowl: a half lens, flat side up, standing out from the sign; two chopsticks behind it
      kit.dome(0.1, [FRONT_X + 0.03, SIGN.y + 0.035, 0], 'white', { segments: 8, scale: [0.2, 0.9, 1], rotate: [Math.PI, 0, 0] }),
      kit.box([0.02, 0.16, 0.025], [FRONT_X + 0.025, SIGN.y + 0.07, 0.04], 'sunYellow', { rotate: [0.4, 0, 0] }),
      kit.box([0.02, 0.16, 0.025], [FRONT_X + 0.025, SIGN.y + 0.07, 0.08], 'sunYellow', { rotate: [0.4, 0, 0] }),
    ];

    // awning: alternating red and white stripes, each ending in a pointed flap at the front
    const run = AWN.x1 - AWN.x0;
    const drop = AWN.y0 - AWN.y1;
    const pitch = Math.atan2(drop, run);
    const slab = Math.hypot(run, drop);
    const sw = AWN.len / AWN.n;
    /** Underside of the awning at x (posts end here). */
    const under = (x: number) => AWN.y0 - ((x - AWN.x0) / run) * drop - AWN.t / 2 / Math.cos(pitch);
    for (let i = 0; i < AWN.n; i++) {
      const z = -AWN.len / 2 + (i + 0.5) * sw;
      const color: PaletteColor = i % 2 === 0 ? 'red' : 'white';
      parts.push(
        kit.box([slab, AWN.t, sw], [(AWN.x0 + AWN.x1) / 2, (AWN.y0 + AWN.y1) / 2, z], color, { rotate: [0, 0, -pitch] }),
        kit.wedge([sw, VALANCE_H, 0.02], [AWN.x1 - 0.005, under(AWN.x1) - VALANCE_H / 2 + 0.01, z], color,
          { scale: [1, -1, 1], rotate: [0, Math.PI / 2, 0] }),
      );
    }
    // posts: the back pair from the ground, the front pair from the counter top
    for (const z of [-POST_Z, POST_Z]) {
      const backTop = under(BACK_POST_X) + 0.01;
      const frontTop = under(FRONT_POST_X) + 0.01;
      parts.push(
        kit.box([POST, backTop, POST], [BACK_POST_X, backTop / 2, z], 'woodDark'),
        kit.box([POST, frontTop - TOP_Y, POST], [FRONT_POST_X, (frontTop + TOP_Y) / 2, z], 'woodDark'),
      );
    }

    // the soup pot: steel body, a rim, broth and three puffs of steam
    const potTop = TOP_Y + POT.h;
    parts.push(
      kit.cylinder(POT.r, POT.r * 0.92, POT.h, [POT.x, TOP_Y + POT.h / 2, POT.z], 'stone'),
      kit.cylinder(POT.r - 0.025, POT.r - 0.025, 0.012, [POT.x, potTop + 0.004, POT.z], 'sand', { segments: 8 }),
      kit.torus(POT.r - 0.01, 0.02, [POT.x, potTop, POT.z], 'stoneDark', { radialSegments: 3, rotate: [Math.PI / 2, 0, 0] }),
      kit.sphere(0.075, [POT.x - 0.01, potTop + 0.075, POT.z], 'white', { scale: [1, 0.8, 1] }),
      kit.sphere(0.06, [POT.x + 0.02, potTop + 0.17, POT.z - 0.03], 'white', { detail: 0 }),
      kit.sphere(0.042, [POT.x - 0.01, potTop + 0.245, POT.z + 0.01], 'white', { detail: 0 }),
    );
    // a stack of white bowls
    for (let k = 0; k < BOWL.n; k++) {
      parts.push(kit.cylinder(BOWL.rTop, BOWL.rBottom, BOWL.h, [BOWL.x, TOP_Y + BOWL.h / 2 + k * BOWL.step, BOWL.z], 'white', { segments: 6 }));
    }
    // condiment set: four jars on a little tray
    parts.push(kit.box([0.15, 0.02, 0.15], [CADDY.x, TOP_Y + 0.01, CADDY.z], 'stoneDark'));
    JARS.forEach((color, k) => {
      const dx = (k % 2 === 0 ? -1 : 1) * 0.035;
      const dz = (k < 2 ? -1 : 1) * 0.035;
      parts.push(kit.cylinder(0.03, 0.03, 0.07, [CADDY.x + dx, TOP_Y + 0.02 + 0.035, CADDY.z + dz], color, { segments: 6 }));
    });
    return kit.finish(parts);
  },
};
