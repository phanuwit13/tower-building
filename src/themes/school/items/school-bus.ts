import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { glassWindow, wallPanel, type Facing } from '../../../models/parts';

// A chunky yellow school bus parked along z with its nose (engine hood) at +z and its door on the
// +x side, next to a stone boarding kerb with a bus-stop sign. The kerb fills the rest of the footprint.
const BX = -0.24; // the bus's centre line (x)
const BW = 1.04; // body width (x)
const SIDE = BX + BW / 2; // the +x (door) side of the body
const BODY = { z0: -1.36, z1: 0.84, y0: 0.24, y1: 0.92 }; // passenger box: back at z0, windscreen at z1
const HOOD = { z1: 1.34, y1: 0.58, inset: 0.04 }; // engine hood in front of the windscreen, a little narrower than the body
const ROOF_RISE = 0.17; // the rounded roof bulges this much above BODY.y1
const CHASSIS = { y0: 0.12, inset: 0.1 }; // dark underbody between the wheels
const WHEEL = { r: 0.19, w: 0.14, hub: 0.09, z: [-0.84, 0.98], out: 0.04 }; // rear and front axles; tyres stick `out` past the body sides
const WIN = { w: 0.24, h: 0.22, y: 0.73 };
const DOOR_SIDE_Z = [-1.14, -0.8, -0.46, -0.12, 0.22]; // windows on the door side, behind the door
const DRIVER_SIDE_Z = [-1.14, -0.8, -0.46, -0.12, 0.22, 0.56]; // windows on the other side
const DOOR = { z: 0.62, w: 0.22, h: 0.52, y: 0.57 }; // a tall glazed folding door
const STRIPES = [{ y: 0.52, h: 0.05 }, { y: 0.34, h: 0.04 }]; // the black stripe under the windows and a rub rail lower down
const BUMPER = { h: 0.08, d: 0.07, y: 0.27 };
const LIGHT = { r: 0.06, y: 0.45, dx: 0.33 }; // headlights on the hood front
const MIRROR = { y: 0.74, z: 0.88, out: 0.07 };
const MARKER = { dx: 0.34, s: 0.06 }; // orange marker lights on the roof corners

const KERB = { x0: 0.42, x1: 0.94, h: 0.08, len: 2.9 }; // boarding kerb on the door side
const SIGN = { x: 0.74, z: 1.12, pole: 1.0, size: 0.3 }; // bus-stop sign on the kerb, facing +x

/** รถรับส่งนักเรียน: the yellow school bus, parked at its stop with its door on the kerb side. */
export const item: ItemModel = {
  id: 'school-bus',
  name: 'รถรับส่งนักเรียน',
  category: 'vehicle',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const bodyLen = BODY.z1 - BODY.z0;
    const bodyZ = (BODY.z0 + BODY.z1) / 2;
    const hoodLen = HOOD.z1 - BODY.z1;
    const parts: Part[] = [
      kit.box([BW - 2 * CHASSIS.inset, BODY.y0 - CHASSIS.y0, HOOD.z1 - BODY.z0 - 0.1], [BX, (CHASSIS.y0 + BODY.y0) / 2, (BODY.z0 + HOOD.z1) / 2], 'charcoal'),
      kit.box([BW, BODY.y1 - BODY.y0, bodyLen], [BX, (BODY.y0 + BODY.y1) / 2, bodyZ], 'sunYellow'),
      // rounded roof: a squashed cylinder along z whose lower half hides in the body; 0.01 short of each end
      kit.cylinder(BW / 2, BW / 2, bodyLen - 0.02, [BX, BODY.y1, bodyZ], 'sunYellow', { rotate: [Math.PI / 2, 0, 0], scale: [1, 1, ROOF_RISE / (BW / 2)], segments: 16 }),
      kit.box([BW - 2 * HOOD.inset, HOOD.y1 - BODY.y0, hoodLen], [BX, (BODY.y0 + HOOD.y1) / 2, BODY.z1 + hoodLen / 2], 'sunYellow'),
    ];

    // wheels: dark tyres with grey hubs, axles along x
    for (const z of WHEEL.z) {
      for (const s of [-1, 1]) {
        const x = BX + s * (BW / 2 + WHEEL.out - WHEEL.w / 2);
        parts.push(
          kit.cylinder(WHEEL.r, WHEEL.r, WHEEL.w, [x, WHEEL.r, z], 'charcoal', { rotate: [0, 0, Math.PI / 2] }),
          kit.cylinder(WHEEL.hub, WHEEL.hub, WHEEL.w + 0.02, [x, WHEEL.r, z], 'stone', { rotate: [0, 0, Math.PI / 2], segments: 8 }),
        );
      }
    }

    // windows (dark frames) along both sides, glowing at night; windscreen at the front, rear window at the back
    const win = (at: Vec3, facing: Facing, w = WIN.w, h = WIN.h) => glassWindow(kit, { at, facing, w, h, frame: 'charcoal' });
    for (const z of DOOR_SIDE_Z) parts.push(...win([SIDE, WIN.y, z], 'x+'));
    for (const z of DRIVER_SIDE_Z) parts.push(...win([BX - BW / 2, WIN.y, z], 'x-'));
    parts.push(
      ...win([BX, WIN.y + 0.02, BODY.z1], 'z+', 0.8, 0.2),
      ...win([BX, WIN.y, BODY.z0], 'z-', 0.7, 0.22),
      ...glassWindow(kit, { at: [SIDE, DOOR.y, DOOR.z], facing: 'x+', w: DOOR.w, h: DOOR.h, frame: 'charcoal' }), // the folding door
      kit.box([0.08, 0.04, DOOR.w + 0.08], [SIDE + 0.04, BODY.y0 - 0.02, DOOR.z], 'charcoal'), // door step
    );

    // the black stripes: full length on the driver side, stopping at the door on the door side
    const doorEdge = DOOR.z - DOOR.w / 2 - 0.06;
    for (const { y, h } of STRIPES) {
      parts.push(
        ...wallPanel(kit, { at: [BX - BW / 2, y, bodyZ], facing: 'x-', w: bodyLen, h, depth: 0.02, color: 'charcoal' }),
        ...wallPanel(kit, { at: [SIDE, y, (BODY.z0 + doorEdge) / 2], facing: 'x+', w: doorEdge - BODY.z0, h, depth: 0.02, color: 'charcoal' }),
      );
    }

    // nose: grille, glowing headlights, bumpers front and back, red tail lights, mirrors on stalks
    parts.push(
      ...wallPanel(kit, { at: [BX, (BODY.y0 + HOOD.y1) / 2 + 0.02, HOOD.z1], facing: 'z+', w: 0.4, h: 0.2, depth: 0.02, color: 'charcoal' }),
      kit.box([BW + 0.02, BUMPER.h, BUMPER.d], [BX, BUMPER.y, HOOD.z1 + BUMPER.d / 2 - 0.01], 'charcoal'),
      kit.box([BW + 0.02, BUMPER.h, BUMPER.d], [BX, BUMPER.y, BODY.z0 - BUMPER.d / 2 + 0.01], 'charcoal'),
    );
    // the roof's height above BODY.y1 at the marker lights (an ellipse), so they sit half sunk into it
    const markerY = BODY.y1 + ROOF_RISE * Math.sqrt(1 - (MARKER.dx / (BW / 2)) ** 2);
    for (const s of [-1, 1]) {
      parts.push(
        kit.cylinder(LIGHT.r, LIGHT.r, 0.04, [BX + s * LIGHT.dx, LIGHT.y, HOOD.z1 + 0.01], 'lampWarm', { rotate: [Math.PI / 2, 0, 0], segments: 8, glow: true }),
        // red tail light (a wall panel facing -z: 0.1 x 0.1 x 0.02, back on the body); it blinks slowly at night
        kit.box([0.1, 0.1, 0.02], [BX + s * 0.38, 0.44, BODY.z0 - 0.01], 'red', { glow: true, light: 'blink' }),
        kit.box([MIRROR.out + 0.02, 0.03, 0.03], [BX + s * (BW / 2 + MIRROR.out / 2), MIRROR.y + 0.06, MIRROR.z], 'charcoal'), // stalk
        kit.box([0.03, 0.12, 0.06], [BX + s * (BW / 2 + MIRROR.out), MIRROR.y, MIRROR.z], 'charcoal'),
        kit.box([MARKER.s, MARKER.s, MARKER.s], [BX + s * MARKER.dx, markerY, BODY.z1 - 0.05], 'orange'),
        kit.box([MARKER.s, MARKER.s, MARKER.s], [BX + s * MARKER.dx, markerY, BODY.z0 + 0.05], 'orange'),
      );
    }

    // boarding kerb with a yellow edge line, and the bus-stop sign (blue plate, a little yellow bus on it)
    const kx = (KERB.x0 + KERB.x1) / 2;
    const signY = KERB.h + SIGN.pole - SIGN.size / 2;
    parts.push(
      kit.box([KERB.x1 - KERB.x0, KERB.h, KERB.len], [kx, KERB.h / 2, 0], 'stone'),
      kit.box([0.06, 0.012, KERB.len], [KERB.x0 + 0.05, KERB.h + 0.006, 0], 'sunYellow'),
      kit.cylinder(0.03, 0.03, SIGN.pole, [SIGN.x, KERB.h + SIGN.pole / 2, SIGN.z], 'white', { segments: 8 }),
      // the plate and a little bus on it: yellow body, white window strip, two dark wheels
      ...wallPanel(kit, { at: [SIGN.x + 0.03, signY, SIGN.z], facing: 'x+', w: SIGN.size, h: SIGN.size, depth: 0.03, color: 'blue' }),
      ...wallPanel(kit, { at: [SIGN.x + 0.06, signY + 0.015, SIGN.z], facing: 'x+', w: 0.2, h: 0.1, depth: 0.01, color: 'sunYellow' }),
      ...wallPanel(kit, { at: [SIGN.x + 0.07, signY + 0.035, SIGN.z], facing: 'x+', w: 0.15, h: 0.03, depth: 0.01, color: 'white' }),
      ...wallPanel(kit, { at: [SIGN.x + 0.06, signY - 0.055, SIGN.z - 0.055], facing: 'x+', w: 0.045, h: 0.04, depth: 0.01, color: 'charcoal' }),
      ...wallPanel(kit, { at: [SIGN.x + 0.06, signY - 0.055, SIGN.z + 0.055], facing: 'x+', w: 0.045, h: 0.04, depth: 0.01, color: 'charcoal' }),
    );
    return kit.finish(parts);
  },
};
