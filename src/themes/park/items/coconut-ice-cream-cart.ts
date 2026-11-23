import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod, wheel } from '../../../models/parts';

// A push cart: the handle is at the -z end, the big wheels are under the front (+z) of the box.
const WHEEL = { r: 0.2, tube: 0.035, x: 0.3, z: 0.22 };
const AXLE_Y = WHEEL.r + WHEEL.tube;
const BOX = { w: 0.46, d: 0.9, y0: 0.3, h: 0.3, z: 0.05 }; // body, counter lid on top at 0.62
const LID_TOP = 0.62;
const POLE = { z: -0.15, top: 1.5 };
const SHADE = { r: 0.48, h: 0.22 };

/** รถไอติมกะทิ: a push cart with a coconut-ice-cream tub, a striped umbrella and coconut halves on the side. */
export const item: ItemModel = {
  id: 'coconut-ice-cream-cart',
  name: 'รถไอติมกะทิ',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BOX.w, BOX.h, BOX.d], [0, BOX.y0 + BOX.h / 2 - 0.01, BOX.z], 'cream'),
      kit.box([BOX.w + 0.04, 0.07, BOX.d + 0.04], [0, 0.4, BOX.z], 'teal'), // teal band
      kit.box([BOX.w + 0.04, 0.04, BOX.d + 0.04], [0, LID_TOP - 0.02, BOX.z], 'white'), // lid
      // axle and the two big wheels (they stand in the z-y plane, outside the box)
      kit.cylinder(0.025, 0.025, 2 * WHEEL.x, [0, AXLE_Y, WHEEL.z], 'stoneDark', { rotate: [0, 0, Math.PI / 2], segments: 4 }),
      ...[-1, 1].flatMap((s) => wheel(kit, { at: [s * WHEEL.x, AXLE_Y, WHEEL.z], radius: WHEEL.r, tube: WHEEL.tube, axis: 'x', color: 'charcoal', hubColor: 'stone', spokeColor: 'stone' })),
    ];
    // two prop legs and the push handle at the back
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([0.04, BOX.y0, 0.05], [s * 0.19, BOX.y0 / 2, -0.5], 'charcoal'),
        rod(kit, [s * 0.19, 0.52, -0.38], [s * 0.19, 0.66, -0.92], 0.022, 'charcoal'),
      );
    }
    parts.push(kit.box([0.5, 0.045, 0.05], [0, 0.66, -0.92], 'brass'));
    // a tub of coconut ice cream on the lid: a white tub, round scoops, a green leaf and a red cherry
    const tubY = LID_TOP;
    parts.push(
      kit.cylinder(0.17, 0.15, 0.12, [0, tubY + 0.06, 0.28], 'white', { segments: 10 }),
      kit.sphere(0.14, [0, tubY + 0.13, 0.28], 'white', { scale: [1, 0.55, 1] }),
      kit.sphere(0.07, [-0.04, tubY + 0.19, 0.3], 'cream', { detail: 0 }),
      kit.sphere(0.03, [0.05, tubY + 0.2 + 0.0, 0.25], 'red', { detail: 0 }),
      // a cone for a customer
      kit.cone(0.045, 0.14, [0.0, tubY + 0.07, -0.05], 'sand', { rotate: [Math.PI, 0, 0], segments: 8 }),
      kit.sphere(0.05, [0.0, tubY + 0.16, -0.05], 'white', { detail: 0 }),
    );
    // coconut halves (brown domes) on the side of the box
    for (const z of [-0.2, 0.15]) parts.push(kit.sphere(0.07, [BOX.w / 2 + 0.01, 0.48 - 0.0, z + BOX.z], 'woodDark', { detail: 0, scale: [0.5, 1, 1] }));
    // umbrella: pole through the lid and two striped cones turned half a face apart
    const shadeY = POLE.top - SHADE.h / 2;
    parts.push(
      kit.cylinder(0.02, 0.02, POLE.top - LID_TOP, [0, (POLE.top + LID_TOP) / 2, POLE.z], 'white', { segments: 6 }),
      kit.cone(SHADE.r, SHADE.h, [0, shadeY, POLE.z], 'leaf', { segments: 6 }),
      kit.cone(SHADE.r - 0.005, SHADE.h - 0.006, [0, shadeY + 0.003, POLE.z], 'white', { segments: 6, rotate: [0, Math.PI / 6, 0] }),
      kit.sphere(0.04, [0, POLE.top + 0.02, POLE.z], 'sunYellow', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
