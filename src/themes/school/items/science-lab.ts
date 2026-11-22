import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { door, glassWindow, wallPanel, type Facing } from '../../../models/parts';

// A mint block with a flat roof and big three-pane windows. On the roof's front edge stand the
// signs: a giant flask of green potion and an atom (three tilted rings round a red nucleus).
const W = 1.44; // wall width (x)
const L = 2.64; // wall length (z)
const PLINTH = { h: 0.08, lip: 0.07 };
const WALL_TOP = 1.0; // one tall storey
const BAND = { y: 0.9, h: 0.08, lip: 0.015 }; // purple stripe round the top of the walls
const ROOF = { h: 0.08, lip: 0.05 }; // flat roof slab
const ROOF_TOP = WALL_TOP + ROOF.h;
const PARAPET = { h: 0.1, t: 0.06 }; // low white wall round the roof edge
const WIN = { w: 0.52, h: 0.42, y: 0.5 }; // big windows, three panes each
const FRONT_Z = [-0.8, 0.8]; // +x wall, either side of the door
const BACK_Z = [-0.86, 0, 0.86]; // -x wall
const DOOR = { w: 0.2, h: 0.5 }; // a double door: two leaves side by side
const CANOPY = { d: 0.2, w: 0.6, t: 0.04 }; // flat canopy over the door
const STEP = { w: 0.56, h: 0.04, d: 0.06 };

// the flask: a cone in two parts (green potion below, blue glass above), a neck, a white lip and three bubbles
const FLASK = { x: 0.3, z: -0.5, r0: 0.28, r1: 0.08, h: 0.5, potion: 0.24, neck: 0.22, lip: 0.05, plinth: 0.06 }; // stands on a low purple plinth
const BUBBLES: Array<[number, number, number, PaletteColor]> = [[0, 0.07, 0.065, 'lime'], [0.035, 0.15, 0.05, 'mint'], [0, 0.21, 0.038, 'lime']]; // [dz, up from the lip, r, colour]
// The atom: three rings round a red nucleus. Seen along its axis they are the atom sign's three thin
// ellipses, 60° apart. The axis leans from straight up towards the front (+x) by `lean`, so it faces the
// camera; each ring is tipped `tilt` from facing along the axis.
const ATOM = { x: 0.3, z: 0.5, y: 0.44, r: 0.32, tube: 0.026, lean: 0.44, tilt: 1.22, nucleus: 0.085, electron: 0.035 }; // `y` above the roof
const VENT = { x: -0.4, z: [-0.75, 0.75], r: 0.07, h: 0.22 }; // two fume vents at the back of the roof

/** ห้องวิทยาศาสตร์: the science lab, a mint building with big windows and a giant flask and atom on its roof. */
export const item: ItemModel = {
  id: 'science-lab',
  name: 'ห้องวิทยาศาสตร์',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const rw = W + 2 * ROOF.lip;
    const rl = L + 2 * ROOF.lip;
    const parts: Part[] = [
      kit.box([W + 2 * PLINTH.lip, PLINTH.h, L + 2 * PLINTH.lip], [0, PLINTH.h / 2, 0], 'stone'),
      kit.box([W, WALL_TOP - PLINTH.h, L], [0, (PLINTH.h + WALL_TOP) / 2, 0], 'mint'),
      kit.box([W + 2 * BAND.lip, BAND.h, L + 2 * BAND.lip], [0, BAND.y, 0], 'purple'),
      kit.box([rw, ROOF.h, rl], [0, WALL_TOP + ROOF.h / 2, 0], 'stone'), // flat roof (grey deck inside the white parapet)
    ];
    // parapet: four low walls on the roof edge
    for (const s of [1, -1]) {
      parts.push(
        kit.box([PARAPET.t, PARAPET.h, rl], [s * (rw - PARAPET.t) / 2, ROOF_TOP + PARAPET.h / 2, 0], 'white'),
        kit.box([rw - 2 * PARAPET.t, PARAPET.h, PARAPET.t], [0, ROOF_TOP + PARAPET.h / 2, s * (rl - PARAPET.t) / 2], 'white'),
      );
    }

    // big windows (white frames) all round, a purple double door with a canopy on the front
    const win = (at: Vec3, facing: Facing, w = WIN.w) => glassWindow(kit, { at, facing, w, h: WIN.h, frame: 'white', panes: 3 });
    for (const z of FRONT_Z) parts.push(...win([W / 2, WIN.y, z], 'x+'));
    for (const z of BACK_Z) parts.push(...win([-W / 2, WIN.y, z], 'x-'));
    parts.push(...win([0, WIN.y, L / 2], 'z+', 0.7), ...win([0, WIN.y, -L / 2], 'z-', 0.7));
    for (const s of [1, -1]) {
      parts.push(...door(kit, { at: [W / 2, PLINTH.h + DOOR.h / 2, s * (DOOR.w / 2 + 0.005)], facing: 'x+', ...DOOR, color: 'purple', knob: s > 0 ? undefined : 'sunYellow' }));
    }
    parts.push(
      ...wallPanel(kit, { at: [W / 2, PLINTH.h + DOOR.h + 0.08, 0], facing: 'x+', w: CANOPY.w, h: CANOPY.t, depth: CANOPY.d, color: 'white' }),
      ...wallPanel(kit, { at: [W / 2, STEP.h / 2, 0], facing: 'x+', w: STEP.w, h: STEP.h, depth: STEP.d + PLINTH.lip, color: 'stone' }),
    );

    // the giant flask
    const potionR = FLASK.r0 - (FLASK.r0 - FLASK.r1) * (FLASK.potion / FLASK.h); // radius where the potion ends
    const glassH = FLASK.h - FLASK.potion;
    const fy = ROOF_TOP + FLASK.plinth; // the flask's foot
    const lipY = fy + FLASK.h + FLASK.neck;
    parts.push(
      kit.box([2 * FLASK.r0 + 0.08, FLASK.plinth, 2 * FLASK.r0 + 0.08], [FLASK.x, ROOF_TOP + FLASK.plinth / 2, FLASK.z], 'purple'),
      kit.cylinder(potionR, FLASK.r0, FLASK.potion, [FLASK.x, fy + FLASK.potion / 2, FLASK.z], 'lime'),
      kit.cylinder(FLASK.r1, potionR, glassH, [FLASK.x, fy + FLASK.potion + glassH / 2, FLASK.z], 'skyBlue'),
      kit.cylinder(FLASK.r1, FLASK.r1, FLASK.neck, [FLASK.x, fy + FLASK.h + FLASK.neck / 2, FLASK.z], 'skyBlue', { segments: 10 }),
      kit.cylinder(FLASK.r1 * 1.3, FLASK.r1 * 1.3, FLASK.lip, [FLASK.x, lipY, FLASK.z], 'white', { segments: 10 }),
    );
    for (const [dz, up, r, color] of BUBBLES) parts.push(kit.sphere(r, [FLASK.x, lipY + up, FLASK.z + dz], color, { detail: 0 }));

    // the atom on a short post
    const ay = ROOF_TOP + ATOM.y;
    parts.push(
      kit.cylinder(0.035, 0.045, ATOM.y, [ATOM.x, ROOF_TOP + ATOM.y / 2, ATOM.z], 'white', { segments: 8 }),
      kit.sphere(ATOM.nucleus, [ATOM.x, ay, ATOM.z], 'red'),
    );
    // A = the axis; B and C are square to it (B in the x-y plane, C = z)
    const A: Vec3 = [Math.sin(ATOM.lean), Math.cos(ATOM.lean), 0];
    const B: Vec3 = [Math.cos(ATOM.lean), -Math.sin(ATOM.lean), 0];
    const C: Vec3 = [0, 0, 1];
    const mix = (a: number, p: Vec3, b: number, q: Vec3, c = 0, r: Vec3 = C): Vec3 =>
      [a * p[0] + b * q[0] + c * r[0], a * p[1] + b * q[1] + c * r[1], a * p[2] + b * q[2] + c * r[2]];
    for (let k = 0; k < 3; k++) {
      const phi = Math.PI / 2 + (k * Math.PI) / 3;
      // the ring's normal n, tipped `tilt` from A towards the direction phi round it
      const n = mix(Math.cos(ATOM.tilt), A, Math.sin(ATOM.tilt) * Math.cos(phi), B, Math.sin(ATOM.tilt) * Math.sin(phi));
      // a torus faces local z; Euler [a, b, 0] turns z to (sin b, -cos b·sin a, cos b·cos a), so solve for n
      parts.push(kit.torus(ATOM.r, ATOM.tube, [ATOM.x, ay, ATOM.z], 'blue',
        { rotate: [Math.atan2(-n[1], n[2]), Math.asin(n[0]), 0], radialSegments: 4, tubularSegments: 16 }));
      // an electron at one end of the ring's long axis (seen along A): ±r along u, square to both A and n
      const u = mix(-Math.sin(phi), B, Math.cos(phi), C);
      const e = (k === 1 ? -1 : 1) * ATOM.r;
      parts.push(kit.sphere(ATOM.electron, [ATOM.x + e * u[0], ay + e * u[1], ATOM.z + e * u[2]], 'sunYellow', { detail: 0 }));
    }

    // two fume vents at the back of the roof
    for (const z of VENT.z) {
      parts.push(
        kit.cylinder(VENT.r, VENT.r, VENT.h, [VENT.x, ROOF_TOP + VENT.h / 2, z], 'stoneDark', { segments: 8 }),
        kit.cylinder(VENT.r + 0.04, VENT.r + 0.03, 0.05, [VENT.x, ROOF_TOP + VENT.h + 0.025, z], 'charcoal', { segments: 8 }), // cap
      );
    }
    return kit.finish(parts);
  },
};

