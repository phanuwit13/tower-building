import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';

// A Thai tuk-tuk, long side along z with its nose (single front wheel, round headlight) at +z,
// so the open passenger side faces +x. Yellow body, green roof and trim, red seats.
const WHEEL = { r: 0.12, w: 0.08 }; // tyres: cylinders on their side
const REAR = { x: 0.38, z: -0.5 }; // rear wheels at x = ±REAR.x, half out from under the body
const FENDER = { r: 0.155, tube: 0.03, wide: 1.8 }; // green arch over each rear wheel; `wide` stretches the tube across x
const FRONT_Z = 0.66; // the single front wheel, scooter style: in front of the nose under its own fender
const BODY = { w: 0.76, z0: -0.88, z1: -0.14, y0: 0.27, y1: 0.47 }; // rear passenger body
const BAND_H = 0.05; // green stripe round the rear body
const CAB = { w: 0.42, z1: 0.36, y1: 0.36 }; // driver's floor, from BODY.z1 to CAB.z1
const NOSE = { w: 0.32, z0: 0.36, z1: 0.58, y1: 0.48, slope: 0.12 }; // box up to y1, then a ramp falling to the front
const LAMP = { y: 0.44, rim: 0.08, glass: 0.06, out: 0.06 }; // big round headlight sticking out of the nose
const ROOF = { w: 0.84, z0: -0.9, z1: 0.46, y: 0.98, squash: 0.14 }; // rounded canopy: a flattened drum along z
const TRIM = { h: 0.045, out: 0.015 }; // yellow belt round the roof at its widest
// The drum's underside rises towards its edges, so posts, pillars and the back wall reach this far
// above ROOF.y and end hidden inside the roof (no gap at the corners).
const ROOF_GRIP = 0.045;
const SCREEN = { z: 0.4, w: 0.46, tilt: 0.12 }; // windscreen, leaning back
const SEAT = { cushion: 0.08, back: 0.27 };
const POST = 0.04;

/** A wheel on its side, rolling along z: tyre and hub. */
function wheel(kit: StyleKit, at: Vec3): Part[] {
  const side = { rotate: [0, 0, Math.PI / 2] as Vec3 };
  return [
    kit.cylinder(WHEEL.r, WHEEL.r, WHEEL.w, at, 'charcoal', side),
    kit.cylinder(0.055, 0.055, WHEEL.w + 0.02, at, 'stone', { ...side, segments: 6 }),
  ];
}

/** ตุ๊กตุ๊ก: a yellow and green three-wheeled tuk-tuk with a canopy roof and open sides. */
export const item: ItemModel = {
  id: 'tuk-tuk',
  name: 'ตุ๊กตุ๊ก',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const bodyLen = BODY.z1 - BODY.z0;
    const bodyZ = (BODY.z0 + BODY.z1) / 2;
    const bodyH = BODY.y1 - BODY.y0;
    const parts: Part[] = [
      // running gear: three wheels, the rear axle and a dark chassis under the floor
      ...wheel(kit, [REAR.x, WHEEL.r, REAR.z]),
      ...wheel(kit, [-REAR.x, WHEEL.r, REAR.z]),
      ...wheel(kit, [0, WHEEL.r, FRONT_Z]),
      kit.cylinder(0.03, 0.03, 2 * REAR.x, [0, WHEEL.r, REAR.z], 'stoneDark', { rotate: [0, 0, Math.PI / 2], segments: 6 }),
      // half-ring fenders: a part torus turned into the z-y plane, its open ends level with the axle
      kit.torus(FENDER.r, FENDER.tube, [REAR.x, WHEEL.r, REAR.z], 'leaf',
        { arc: Math.PI, radialSegments: 3, scale: [1, 1, FENDER.wide], rotate: [0, Math.PI / 2, 0] }),
      kit.torus(FENDER.r, FENDER.tube, [-REAR.x, WHEEL.r, REAR.z], 'leaf',
        { arc: Math.PI, radialSegments: 3, scale: [1, 1, FENDER.wide], rotate: [0, Math.PI / 2, 0] }),
      kit.box([0.4, BODY.y0 - 0.14, 0.5], [0, (BODY.y0 + 0.14) / 2, REAR.z], 'charcoal'),
      kit.box([0.14, 0.08, NOSE.z0 + 0.14 - BODY.z1], [0, BODY.y0 - 0.04, (NOSE.z0 + 0.14 + BODY.z1) / 2], 'charcoal'),
      // front fork either side of the tyre, up to the headlight, and a green fender over the wheel
      kit.box([0.03, LAMP.y - WHEEL.r, 0.035], [0.065, (LAMP.y + WHEEL.r) / 2, FRONT_Z - 0.03], 'charcoal'),
      kit.box([0.03, LAMP.y - WHEEL.r, 0.035], [-0.065, (LAMP.y + WHEEL.r) / 2, FRONT_Z - 0.03], 'charcoal'),
      kit.torus(FENDER.r, FENDER.tube, [0, WHEEL.r, FRONT_Z], 'leaf',
        { arc: Math.PI, radialSegments: 3, scale: [1, 1, 1.5], rotate: [0, Math.PI / 2, 0] }),
      // rear passenger body: yellow with a green stripe, red tail lights on the back
      kit.box([BODY.w, bodyH, bodyLen], [0, BODY.y0 + bodyH / 2, bodyZ], 'sunYellow'),
      kit.box([BODY.w + 0.02, BAND_H, bodyLen + 0.02], [0, BODY.y0 + bodyH * 0.55, bodyZ], 'leaf'),
      kit.box([0.1, 0.06, 0.02], [0.26, BODY.y0 + 0.06, BODY.z0 - 0.01], 'red'),
      kit.box([0.1, 0.06, 0.02], [-0.26, BODY.y0 + 0.06, BODY.z0 - 0.01], 'red'),
      // passenger bench and the green back wall up to the roof
      kit.box([BODY.w - 0.08, SEAT.cushion, 0.28], [0, BODY.y1 + SEAT.cushion / 2, BODY.z0 + 0.26], 'red'),
      kit.box([BODY.w - 0.08, SEAT.back, 0.07], [0, BODY.y1 + SEAT.cushion + SEAT.back / 2, BODY.z0 + 0.1], 'red', { rotate: [-0.15, 0, 0] }),
      kit.box([BODY.w, ROOF.y + ROOF_GRIP - BODY.y1, 0.05], [0, (ROOF.y + ROOF_GRIP + BODY.y1) / 2, BODY.z0 + 0.025], 'leaf'),
      // driver's floor and seat
      kit.box([CAB.w, CAB.y1 - BODY.y0, CAB.z1 - BODY.z1], [0, (CAB.y1 + BODY.y0) / 2, (CAB.z1 + BODY.z1) / 2], 'sunYellow'),
      kit.box([0.32, 0.18, 0.18], [0, CAB.y1 + 0.09, BODY.z1 + 0.11], 'sunYellow'),
      kit.box([0.38, SEAT.cushion, 0.2], [0, CAB.y1 + 0.18 + SEAT.cushion / 2, BODY.z1 + 0.11], 'red'),
      // nose: a box with a ramp falling to the front, the big round headlight, handlebar above it
      kit.box([NOSE.w, NOSE.y1 - BODY.y0, NOSE.z1 - NOSE.z0], [0, (NOSE.y1 + BODY.y0) / 2, (NOSE.z0 + NOSE.z1) / 2], 'sunYellow'),
      // apex 0.5 puts the tall side at local +x, which a quarter turn about y sends to -z (the windscreen)
      kit.wedge([NOSE.z1 - NOSE.z0, NOSE.slope, NOSE.w], [0, NOSE.y1 + NOSE.slope / 2, (NOSE.z0 + NOSE.z1) / 2], 'sunYellow',
        { apex: 0.5, rotate: [0, Math.PI / 2, 0] }),
      kit.box([NOSE.w + 0.02, BAND_H, NOSE.z1 - NOSE.z0 + 0.02], [0, BODY.y0 + bodyH * 0.55, (NOSE.z0 + NOSE.z1) / 2], 'leaf'),
      kit.cylinder(LAMP.rim, LAMP.rim, LAMP.out, [0, LAMP.y, NOSE.z1 + LAMP.out / 2], 'leafDark', { rotate: [Math.PI / 2, 0, 0], segments: 10 }),
      kit.cylinder(LAMP.glass, LAMP.glass, 0.02, [0, LAMP.y, NOSE.z1 + LAMP.out], 'lampWarm', { rotate: [Math.PI / 2, 0, 0], segments: 10, glow: true }),
      kit.box([0.04, 0.12, 0.04], [0, NOSE.y1 + NOSE.slope + 0.04, NOSE.z0 + 0.02], 'charcoal'),
      kit.box([0.52, 0.035, 0.035], [0, NOSE.y1 + NOSE.slope + 0.1, NOSE.z0 + 0.02], 'charcoal'),
    ];
    // windscreen: pale glass leaning back between two green pillars, from the top of the nose to the roof
    const noseTop = NOSE.y1 + NOSE.slope;
    const screenH = ROOF.y + ROOF_GRIP - noseTop;
    const screenZ = SCREEN.z - (screenH / 2) * Math.sin(SCREEN.tilt) + 0.02;
    parts.push(kit.box([SCREEN.w, screenH, 0.025], [0, noseTop + screenH / 2, screenZ], 'glassBlue', { rotate: [-SCREEN.tilt, 0, 0] }));
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([POST, screenH + 0.02, POST], [s * (SCREEN.w / 2 + POST / 2), noseTop + screenH / 2, screenZ], 'leaf', { rotate: [-SCREEN.tilt, 0, 0] }),
        // thin roof posts at the front of the passenger seat, and a grab rail along each open side
        kit.box([0.03, ROOF.y + ROOF_GRIP - BODY.y1, 0.03], [s * (BODY.w / 2 - 0.015), (ROOF.y + ROOF_GRIP + BODY.y1) / 2, BODY.z1 - 0.015], 'stoneDark'),
        kit.box([0.03, 0.03, bodyLen - 0.06], [s * (BODY.w / 2 - 0.015), BODY.y1 + 0.24, bodyZ + 0.01], 'stoneDark'),
      );
    }
    // the canopy roof: a flattened green drum with a yellow belt round it at its widest
    const roofLen = ROOF.z1 - ROOF.z0;
    const roofR = ROOF.w / 2;
    const roofAt: Vec3 = [0, ROOF.y + roofR * ROOF.squash, (ROOF.z0 + ROOF.z1) / 2];
    parts.push(
      kit.cylinder(roofR, roofR, roofLen, roofAt, 'leaf', { rotate: [Math.PI / 2, 0, 0], scale: [1, 1, ROOF.squash] }),
      kit.box([ROOF.w + 2 * TRIM.out, TRIM.h, roofLen + 2 * TRIM.out], roofAt, 'sunYellow'),
    );
    return kit.finish(parts);
  },
};
