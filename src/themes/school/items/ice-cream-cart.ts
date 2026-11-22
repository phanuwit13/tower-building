import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { wheel } from '../../../models/parts';

// A Thai ice-cream tricycle. The freezer box rides up front (+x) between two wheels; the rider's
// saddle, the handlebar and the single back wheel are behind it (-x). The umbrella pole goes
// through the back of the lid, so the shade covers the rider and stays inside the 1x1 footprint,
// and the big cone on the front of the box stays in view from the high 3/4 camera.
const WHEEL = { r: 0.11, tube: 0.035 }; // tyre ring: radius to the middle of the tube, tube radius
const AXLE_Y = WHEEL.r + WHEEL.tube; // wheel centres: the tyres just touch the ground
const AXLE_R = 0.025;
const BOX = { x: 0.1, w: 0.4, d: 0.46, y0: AXLE_Y + AXLE_R, h: 0.34 }; // freezer box sits on the front axle
const BOX_BACK = BOX.x - BOX.w / 2;
const BOX_TOP = BOX.y0 + BOX.h;
const LID = { h: 0.05, lip: 0.02 };
const LID_TOP = BOX_TOP + LID.h;
const HATCH = { x: 0.13, z: 0.11, r: 0.075, h: 0.02 }; // two round freezer hatches on the lid, at z = ±HATCH.z
const BAND = { h: 0.06, y: BOX.y0 + 0.24, lip: 0.01 }; // white band round the pink box
const FRONT_Z = BOX.d / 2 + 0.07; // front wheels at z = ±FRONT_Z, just clear of the box
const BACK_X = -0.35; // the back wheel
const STAY_Z = 0.055; // the two frame stays pass either side of the back wheel
const SEAT = { x: -0.18, y: 0.47 }; // saddle; its post stands clear of the back tyre
const BAR = { x: BOX_BACK - 0.02, y: 0.66, z: 0.17 }; // handlebar behind the box: posts at z = ±BAR.z
const POLE = { x: -0.05, r: 0.018, top: 1.42 }; // umbrella pole, through the back of the lid
// Umbrella: two six-sided cones, pink and white, turned 30° apart, so their faces alternate in
// 12 stripes and the rim is gently scalloped.
const SHADE = { r: 0.38, h: 0.24 };
// The big wafer cone on the front (+x) of the box, tip down and half sunk into it, its scoop above the lid.
const CONE = { x: BOX.x + BOX.w / 2 + 0.05, r: 0.085, h: 0.27, tip: BOX.y0 + 0.07 };
const SCOOP_R = 0.095;
const FRAME = 'teal';

/** รถเข็นไอศกรีม: an ice-cream tricycle with a pink freezer box, a striped umbrella and a big cone. */
export const item: ItemModel = {
  id: 'ice-cream-cart',
  name: 'รถเข็นไอศกรีม',
  category: 'food',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    // a bicycle wheel standing in the x-y plane; 8 tubular segments keep a vertex at the bottom: y = 0 exactly
    const spoked = (at: Vec3) => wheel(kit, {
      at, radius: WHEEL.r, tube: WHEEL.tube, axis: 'z', color: 'charcoal', radialSegments: 3, tubularSegments: 8, spokeWidth: 0.022, spokeThick: 0.02, spokeStep: -Math.PI / 2, // spokes at +45 and -45 degrees
    });
    const parts: Part[] = [
      // freezer box: pink with a white band and a white lid
      kit.box([BOX.w, BOX.h, BOX.d], [BOX.x, BOX.y0 + BOX.h / 2, 0], 'pink'),
      kit.box([BOX.w + 2 * BAND.lip, BAND.h, BOX.d + 2 * BAND.lip], [BOX.x, BAND.y, 0], 'white'),
      kit.box([BOX.w + 2 * LID.lip, LID.h, BOX.d + 2 * LID.lip], [BOX.x, BOX_TOP + LID.h / 2, 0], 'white'),
      kit.cylinder(HATCH.r, HATCH.r, HATCH.h, [HATCH.x, LID_TOP + HATCH.h / 2, HATCH.z], 'pink', { segments: 6 }),
      kit.cylinder(HATCH.r, HATCH.r, HATCH.h, [HATCH.x, LID_TOP + HATCH.h / 2, -HATCH.z], 'pink', { segments: 6 }),
      // front wheels on one axle under the box, back wheel on a short hub
      ...spoked([BOX.x, AXLE_Y, FRONT_Z]),
      ...spoked([BOX.x, AXLE_Y, -FRONT_Z]),
      kit.cylinder(AXLE_R, AXLE_R, 2 * FRONT_Z, [BOX.x, AXLE_Y, 0], 'stoneDark', { rotate: [Math.PI / 2, 0, 0], segments: 4 }),
      ...spoked([BACK_X, AXLE_Y, 0]),
      kit.cylinder(AXLE_R, AXLE_R, 2 * STAY_Z + 0.03, [BACK_X, AXLE_Y, 0], 'stoneDark', { rotate: [Math.PI / 2, 0, 0], segments: 4 }),
    ];
    // frame: two low stays from the back hub to the box, the pedal crank between them, the saddle post and a top bar
    const stayLen = BOX_BACK - BACK_X;
    for (const z of [-STAY_Z, STAY_Z]) parts.push(kit.box([stayLen, 0.035, 0.03], [BACK_X + stayLen / 2, AXLE_Y, z], FRAME));
    parts.push(
      kit.cylinder(0.035, 0.035, 2 * STAY_Z + 0.03, [SEAT.x, AXLE_Y, 0], 'stoneDark', { rotate: [Math.PI / 2, 0, 0], segments: 4 }),
      kit.box([0.04, SEAT.y - AXLE_Y, 0.04], [SEAT.x, (SEAT.y + AXLE_Y) / 2, 0], FRAME),
      kit.box([BOX_BACK - SEAT.x, 0.035, 0.035], [(BOX_BACK + SEAT.x) / 2, SEAT.y - 0.08, 0], FRAME),
      kit.box([0.16, 0.045, 0.11], [SEAT.x - 0.02, SEAT.y + 0.02, 0], 'charcoal'), // saddle
    );
    // handlebar: two posts on the back of the box and a crossbar
    for (const z of [-BAR.z, BAR.z]) parts.push(kit.box([0.035, BAR.y - BAND.y, 0.035], [BAR.x, (BAR.y + BAND.y) / 2, z], FRAME));
    parts.push(
      kit.box([0.04, 0.04, 2 * BAR.z + 0.12], [BAR.x, BAR.y, 0], FRAME),
    );
    // umbrella: pole, two turned cones (12 stripes) and a yellow knob on top
    const shadeY = POLE.top - SHADE.h / 2;
    parts.push(
      kit.cylinder(POLE.r, POLE.r, POLE.top - LID_TOP, [POLE.x, (POLE.top + LID_TOP) / 2, 0], 'white', { segments: 6 }),
      kit.cone(SHADE.r, SHADE.h, [POLE.x, shadeY, 0], 'pink', { segments: 6 }),
      kit.cone(SHADE.r, SHADE.h - 0.006, [POLE.x, shadeY + 0.003, 0], 'white', { segments: 6, rotate: [0, Math.PI / 6, 0] }),
      kit.sphere(0.04, [POLE.x, POLE.top + 0.02, 0], 'sunYellow', { detail: 0 }),
    );
    // the big ice-cream cone on the front: wafer tip down, a mint scoop and a cherry
    const mouthY = CONE.tip + CONE.h;
    parts.push(
      kit.cone(CONE.r, CONE.h, [CONE.x, CONE.tip + CONE.h / 2, 0], 'sand', { rotate: [Math.PI, 0, 0], segments: 8 }),
      kit.sphere(SCOOP_R, [CONE.x, mouthY + SCOOP_R * 0.4, 0], 'mint'),
      kit.sphere(0.032, [CONE.x, mouthY + SCOOP_R * 1.35, 0], 'red', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
