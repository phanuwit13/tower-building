import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { gableRoof, wheel } from '../../../models/parts';

// A flat wooden fruit handcart, long side along z, the selling side (+x) to the front. Two big
// wooden wheels on one axle, a pair of handles and two prop legs at the -z end, and a green
// canopy on four poles. The canopy is narrower than the bed and the fruit sits on the front half,
// so it shows from the high 3/4 camera.
const BED = { w: 0.6, z0: -0.58, z1: 0.66, top: 0.52, t: 0.05 }; // the flat bed (x width, z range)
const RIM = { h: 0.05, t: 0.03 }; // low boards round the bed
const WHEEL = { r: 0.23, tube: 0.04, x: 0.4, z: 0.2 }; // big wheels at x = ±WHEEL.x
const AXLE_Y = WHEEL.r + WHEEL.tube;
const SPOKES = 2; // bars through the hub (4 spokes)
const HANDLE = { x: 0.22, z1: -0.98, s: 0.045 }; // two handles out to z1, joined by a grip
const LEG = { z: -0.5, x: 0.22, s: 0.05 }; // prop legs under the handle end
const POLE = { x: 0.2, z0: -0.54, z1: 0.62, s: 0.035 }; // canopy poles, set in from the long sides of the bed
const AXLE_BLOCK = { x: 0.22, w: 0.06, d: 0.1 }; // two blocks hang the axle under the bed
const CANOPY = { y: 1.18, rise: 0.12, eave: 0.05, t: 0.04 };
const FRUIT_X = 0.15; // centre line of the front trays
const ORANGE_R = 0.055;
// A watermelon slice lies flat as a round: green rind, a white band, red flesh, each layer a little thicker than the one below
const SLICE = { r: 0.085, rind: 0.03, band: 0.012, flesh: 0.026, seed: 0.014 }; // radius; rind width round the edge; band and flesh layers' extra height

/** รถเข็นผลไม้: a wooden fruit handcart with two big wheels, a green canopy, oranges and watermelon. */
export const item: ItemModel = {
  id: 'fruit-cart',
  name: 'รถเข็นผลไม้',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    // a big wooden cartwheel standing in the z-y plane (rolls along z)
    const cartwheel = (at: Vec3) => wheel(kit, {
      at, radius: WHEEL.r, tube: WHEEL.tube, axis: 'x', color: 'woodDark', radialSegments: 3, hubColor: 'woodDark', hubRadius: 0.055, hubLength: 0.1,
      spokes: SPOKES, spokeColor: 'wood', spokeWidth: 0.035, spokeThick: 0.03,
    });
    const bedLen = BED.z1 - BED.z0;
    const bz = (BED.z0 + BED.z1) / 2;
    const bedBottom = BED.top - BED.t;
    const parts: Part[] = [
      kit.box([BED.w, BED.t, bedLen], [0, BED.top - BED.t / 2, bz], 'wood'),
      // low rim boards
      kit.box([BED.w, RIM.h, RIM.t], [0, BED.top + RIM.h / 2, BED.z0 + RIM.t / 2], 'woodDark'),
      kit.box([BED.w, RIM.h, RIM.t], [0, BED.top + RIM.h / 2, BED.z1 - RIM.t / 2], 'woodDark'),
      kit.box([RIM.t, RIM.h, bedLen], [BED.w / 2 - RIM.t / 2, BED.top + RIM.h / 2, bz], 'woodDark'),
      kit.box([RIM.t, RIM.h, bedLen], [-BED.w / 2 + RIM.t / 2, BED.top + RIM.h / 2, bz], 'woodDark'),
      // wheels, axle and two blocks holding the axle under the bed
      ...cartwheel([WHEEL.x, AXLE_Y, WHEEL.z]),
      ...cartwheel([-WHEEL.x, AXLE_Y, WHEEL.z]),
      kit.cylinder(0.03, 0.03, 2 * WHEEL.x, [0, AXLE_Y, WHEEL.z], 'stoneDark', { rotate: [0, 0, Math.PI / 2], segments: 4 }),
    ];
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([AXLE_BLOCK.w, bedBottom - AXLE_Y, AXLE_BLOCK.d], [s * AXLE_BLOCK.x, (bedBottom + AXLE_Y) / 2, WHEEL.z], 'woodDark'),
        // handle and prop leg
        kit.box([HANDLE.s, HANDLE.s, BED.z0 - HANDLE.z1], [s * HANDLE.x, bedBottom + HANDLE.s / 2, (BED.z0 + HANDLE.z1) / 2], 'wood'),
        kit.box([LEG.s, bedBottom, LEG.s], [s * LEG.x, bedBottom / 2, LEG.z], 'woodDark'),
      );
      for (const z of [POLE.z0, POLE.z1]) {
        parts.push(kit.box([POLE.s, CANOPY.y - BED.top, POLE.s], [s * POLE.x, (CANOPY.y + BED.top) / 2, z], 'wood'));
      }
    }
    parts.push(kit.box([2 * HANDLE.x + 0.08, 0.05, 0.05], [0, bedBottom + HANDLE.s / 2, HANDLE.z1 + 0.025], 'woodDark')); // grip
    // green canopy: a low pitched cover along z, with a darker ridge
    const canopyLen = POLE.z1 - POLE.z0 + 0.16;
    parts.push(
      ...gableRoof(kit, {
        at: [0, CANOPY.y, (POLE.z0 + POLE.z1) / 2], length: canopyLen, width: 2 * POLE.x + POLE.s,
        rise: CANOPY.rise, eave: CANOPY.eave, thickness: CANOPY.t, color: 'leaf', ridge: 'leafDark',
      }),
    );

    // front, +z end (in the sun): a tray of oranges, six below and one on top
    const oz = 0.36;
    const trayY = BED.top + 0.015;
    parts.push(kit.box([0.26, 0.03, 0.44], [FRUIT_X, trayY, oz], 'sand'));
    const oy = trayY + 0.015 + ORANGE_R;
    for (const dx of [-0.06, 0.06]) {
      for (const dz of [-0.12, 0, 0.12]) parts.push(kit.sphere(ORANGE_R, [FRUIT_X + dx, oy, oz + dz], 'orange', { detail: 0 }));
    }
    parts.push(kit.sphere(ORANGE_R, [FRUIT_X, oy + ORANGE_R * 1.3, oz], 'orange', { detail: 0 }));
    // front, -z end: round watermelon slices lying on a tray
    const wz = -0.25;
    parts.push(kit.box([0.26, 0.03, 0.54], [FRUIT_X, trayY, wz], 'sand'));
    const sliceY = trayY + 0.015;
    const layers: Array<[number, number, PaletteColor]> = [ // [radius, height, colour], bottom first
      [SLICE.r, 0.03, 'leaf'], [SLICE.r - SLICE.rind / 2, 0.03 + SLICE.band, 'white'], [SLICE.r - SLICE.rind, 0.03 + SLICE.band + SLICE.flesh, 'red'],
    ];
    for (const dz of [-0.17, 0, 0.17]) {
      for (const [r, h, color] of layers) parts.push(kit.cylinder(r, r, h, [FRUIT_X, sliceY + h / 2, wz + dz], color, { segments: 10 }));
      const top = sliceY + 0.03 + SLICE.band + SLICE.flesh;
      for (const sx of [-0.022, 0.022]) parts.push(kit.box([SLICE.seed, 0.004, SLICE.seed * 0.6], [FRUIT_X + sx, top + 0.002, wz + dz + sx * 0.4], 'charcoal'));
    }
    // back row, mostly under the canopy: a whole watermelon behind the slices, two pineapples behind the oranges
    parts.push(kit.sphere(0.12, [-0.14, BED.top + 0.1, -0.2], 'leaf', { detail: 0, scale: [0.9, 0.85, 1.25] }));
    for (const z of [0.38, 0.54]) {
      parts.push(
        kit.sphere(0.06, [-0.15, BED.top + 0.08, z], 'sunYellow', { detail: 0, scale: [1, 1.35, 1] }),
        kit.cone(0.05, 0.1, [-0.15, BED.top + 0.2, z], 'leaf', { segments: 5 }),
      );
    }
    return kit.finish(parts);
  },
};
