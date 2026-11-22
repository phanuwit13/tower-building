import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { gableRoof } from '../../../models/parts';

// An open-sided hall, long side along z: a tall red roof on white posts, open at the gable ends, with
// a raised vent roof on the ridge. Two long tables with stools fill the front; the serving counter
// stands at the back (-x). The posts are tall and the eaves short so the camera sees in under the roof.
const FLOOR = { w: 1.78, d: 2.84, h: 0.06 }; // stone floor slab
const POST = { r: 0.05, x: 0.74, top: 1.08 }; // posts at x = ±POST.x
const POST_Z = [-1.3, -0.44, 0.44, 1.3];
const BEAM = 0.08; // square beams along the post tops (and tie beams across)
const BEAM_TOP = POST.top + BEAM;
const ROOF_W = 2 * POST.x + BEAM; // the roof sits on the outer edges of the beams
const PITCH = 0.7; // steep (~40°): a tall roof
const RISE = (ROOF_W / 2) * Math.tan(PITCH);
const EAVE = 0.08;
const ROOF_LEN = 2.9;
const BEAM_LEN = 2.7;
const TRUSS_Z = [-1.3, 1.3]; // a king post from the tie beam to the ridge at each open gable end
// raised vent roof on the ridge: a dark open band (the vent) under a small red roof
const VENT = { w: 0.34, h: 0.24, len: 2.0, sink: 0.07, eave: 0.05, over: 0.07 }; // `sink` = how far the band sits down into the main roof
const VENT_TOP = BEAM_TOP + RISE - VENT.sink + VENT.h;
const VENT_RISE = (VENT.w / 2) * Math.tan(PITCH);

const TABLE = { w: 0.24, len: 1.96, top: 0.3, t: 0.04 }; // `top` = height of the table top above the floor
const TABLE_X = [-0.04, 0.48];
const TRESTLE_Z = [-0.8, 0.8];
const STOOL = { r: 0.07, h: 0.17, dx: 0.2 }; // stools `dx` either side of a table
const STOOL_Z = [-0.72, -0.24, 0.24, 0.72];
const STOOL_COLORS: PaletteColor[] = ['orange', 'blue', 'sunYellow', 'red'];

const COUNTER = { x: -0.58, w: 0.26, h: 0.32, len: 2.2, lip: 0.02 };
const TRAYS: Array<[number, PaletteColor]> = [[-0.66, 'orange'], [-0.22, 'leaf'], [0.22, 'sunYellow'], [0.66, 'red']]; // curry, greens, egg, chilli
const POT = { r: 0.1, h: 0.13, z: 0.98 }; // a rice pot at each end of the counter
const BACK_WALL = { x: -0.8, t: 0.06, h: 0.62, len: 2.5 }; // half-height kitchen wall behind the counter
// the food emblem on each roof slope: `at` = horizontal distance of its centre from the ridge
const EMBLEM = { at: 0.48, r: 0.27, plate: 0.13 };
const UTENSIL = { dw: 0.175, len: 0.2, w: 0.036 }; // fork and spoon `dw` either side of the plate, along z
const ROOF_T = 0.08; // gableRoof's default slab thickness
const LAMP = { x: 0, z: [-0.66, 0.66], y: 0.86 }; // lamps hanging from the ridge over the back table; `y` = bulb height

/** โรงอาหาร: the school canteen, an open hall under a tall red roof with long tables, stools and a food counter. */
export const item: ItemModel = {
  id: 'canteen',
  name: 'โรงอาหาร',
  category: 'food',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [kit.box([FLOOR.w, FLOOR.h, FLOOR.d], [0, FLOOR.h / 2, 0], 'stone')];
    const postH = POST.top - FLOOR.h;
    for (const sx of [-1, 1]) {
      for (const z of POST_Z) parts.push(kit.cylinder(POST.r, POST.r, postH, [sx * POST.x, FLOOR.h + postH / 2, z], 'white', { segments: 6 }));
      parts.push(kit.box([BEAM, BEAM, BEAM_LEN], [sx * POST.x, POST.top + BEAM / 2, 0], 'woodDark'));
    }
    for (const z of POST_Z) parts.push(kit.box([ROOF_W, BEAM * 0.75, BEAM * 0.75], [0, POST.top + BEAM / 2, z], 'woodDark')); // tie beams

    // tall roof, open at both ends (a king post in each end truss), and the raised vent roof on the ridge
    parts.push(
      ...gableRoof(kit, { at: [0, BEAM_TOP, 0], length: ROOF_LEN, width: ROOF_W, rise: RISE, eave: EAVE, color: 'red', ridge: 'redDark' }),
      kit.box([VENT.w, VENT.h, VENT.len], [0, VENT_TOP - VENT.h / 2, 0], 'woodDark'),
      kit.wedge([VENT.w, VENT_RISE, VENT.len], [0, VENT_TOP + VENT_RISE / 2, 0], 'woodDark'),
      ...gableRoof(kit, { at: [0, VENT_TOP, 0], length: VENT.len + 2 * VENT.over, width: VENT.w, rise: VENT_RISE, eave: VENT.eave, color: 'red', ridge: 'redDark' }),
    );
    const kingH = RISE + BEAM / 2; // from the middle of the tie beam up to the underside of the ridge
    for (const z of TRUSS_Z) parts.push(kit.box([BEAM * 0.75, kingH, BEAM * 0.75], [0, BEAM_TOP - BEAM / 2 + kingH / 2, z], 'woodDark'));

    // long tables (trestles under a plank top) with colourful stools on both sides
    TABLE_X.forEach((tx, ti) => {
      parts.push(kit.box([TABLE.w, TABLE.t, TABLE.len], [tx, FLOOR.h + TABLE.top - TABLE.t / 2, 0], 'wood'));
      for (const z of TRESTLE_Z) parts.push(kit.box([TABLE.w - 0.06, TABLE.top - TABLE.t, 0.04], [tx, FLOOR.h + (TABLE.top - TABLE.t) / 2, z], 'woodDark'));
      for (const side of [-1, 1]) {
        STOOL_Z.forEach((z, si) => {
          const color = STOOL_COLORS[(si + ti * 2 + (side > 0 ? 1 : 0)) % STOOL_COLORS.length];
          parts.push(kit.cylinder(STOOL.r, STOOL.r * 0.85, STOOL.h, [tx + side * STOOL.dx, FLOOR.h + STOOL.h / 2, z], color, { segments: 6 }));
        });
      }
    });

    // serving counter at the back: wooden base, steel top, trays of food, a rice pot at each end; kitchen wall behind
    const counterTop = FLOOR.h + COUNTER.h;
    parts.push(
      kit.box([BACK_WALL.t, BACK_WALL.h, BACK_WALL.len], [BACK_WALL.x, FLOOR.h + BACK_WALL.h / 2, 0], 'cream'),
      kit.box([COUNTER.w, COUNTER.h, COUNTER.len], [COUNTER.x, FLOOR.h + COUNTER.h / 2, 0], 'wood'),
      kit.box([COUNTER.w + 2 * COUNTER.lip, 0.04, COUNTER.len + 2 * COUNTER.lip], [COUNTER.x, counterTop + 0.02, 0], 'stone'),
    );
    for (const [z, color] of TRAYS) parts.push(kit.box([0.17, 0.04, 0.3], [COUNTER.x, counterTop + 0.05, z], color));
    for (const s of [1, -1]) {
      const pz = s * POT.z;
      parts.push(
        kit.cylinder(POT.r, POT.r * 0.9, POT.h, [COUNTER.x, counterTop + 0.04 + POT.h / 2, pz], 'stoneDark', { segments: 8 }),
        kit.cylinder(POT.r * 1.05, POT.r * 1.05, 0.02, [COUNTER.x, counterTop + 0.05 + POT.h, pz], 'stone', { segments: 8 }),
      );
    }

    // The food emblem lying on each roof slope (which faces up at the camera): a yellow disc with a
    // white plate, a fork on one side and a spoon on the other. Parts turned by [0, 0, -s·PITCH] have
    // local x down the slope, local y out of it and local z along the ridge.
    for (const s of [1, -1]) {
      const rotate: Vec3 = [0, 0, -s * PITCH];
      const down: Vec3 = [s * Math.cos(PITCH), -Math.sin(PITCH), 0];
      const out: Vec3 = [s * Math.sin(PITCH), Math.cos(PITCH), 0];
      const surfY = BEAM_TOP + RISE - EMBLEM.at * Math.tan(PITCH) + ROOF_T / Math.cos(PITCH); // top of the roof slab under the emblem's centre
      /** A point `u` down the slope and `w` along z from the emblem's centre, `n` above the roof surface. */
      const at = (u: number, n: number, w: number): Vec3 => [s * EMBLEM.at + down[0] * u + out[0] * n, surfY + down[1] * u + out[1] * n, w * s];
      const disc = (r: number, n0: number, color: PaletteColor) =>
        kit.cylinder(r, r, 0.02, at(0, n0 + 0.01, 0), color, { rotate, segments: 10 });
      const flat = (lu: number, lw: number, u: number, w: number, color: PaletteColor) => kit.box([lu, 0.02, lw], at(u, 0.035, w), color, { rotate });
      const fw = UTENSIL.dw; // the fork sits on +z of the plate for the +x slope (the viewer's left), mirrored on the back
      parts.push(
        disc(EMBLEM.r, 0.005, 'sunYellow'),
        disc(EMBLEM.plate, 0.02, 'white'),
        flat(UTENSIL.len, UTENSIL.w, 0.03, fw, 'white'), // fork handle
        flat(0.02, 0.066, -UTENSIL.len / 2 + 0.035, fw, 'white'), // fork bridge
        flat(0.07, 0.02, -UTENSIL.len / 2 - 0.01, fw - 0.023, 'white'), // tines
        flat(0.07, 0.02, -UTENSIL.len / 2 - 0.01, fw + 0.023, 'white'),
        flat(UTENSIL.len, UTENSIL.w, 0.04, -fw, 'white'), // spoon handle
        kit.sphere(0.05, at(-UTENSIL.len / 2 - 0.02, 0.03, -fw), 'white', { rotate, detail: 0, scale: [1.35, 0.35, 1] }), // spoon bowl
      );
    }

    // two lamps hanging from the ridge (they glow at night)
    const rodTop = BEAM_TOP + RISE - 0.05; // just under the ridge, inside the roof
    const rodBottom = LAMP.y + 0.08;
    for (const z of LAMP.z) {
      parts.push(
        kit.cylinder(0.015, 0.015, rodTop - rodBottom, [LAMP.x, (rodTop + rodBottom) / 2, z], 'charcoal', { segments: 4 }),
        kit.cylinder(0.04, 0.1, 0.07, [LAMP.x, LAMP.y + 0.045, z], 'navy', { segments: 8 }),
        kit.sphere(0.05, [LAMP.x, LAMP.y, z], 'lampWarm', { detail: 0, glow: true }),
      );
    }
    return kit.finish(parts);
  },
};
