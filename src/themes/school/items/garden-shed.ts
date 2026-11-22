import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { door, gableRoof, glassWindow, wallPanel, type Facing } from '../../../models/parts';

// A small green timber shed at the back of the plot, its gable end and red door facing the front
// (+x). The wheelbarrow stands on the +z side of the door and the watering can on the -z side.
const W = 1.1; // wall length along x (the ridge runs along x)
const L = 0.96; // wall width along z
const CX = -0.32; // centre of the shed
const CZ = -0.3;
const BASE = { h: 0.06, lip: 0.04 }; // stone base
const WALL_TOP = 0.72;
const RISE = 0.34;
const ROOF = { eave: 0.1, end: 0.1 }; // past the side walls (z), past the gable ends (x)
const TRIM = 0.05; // white corner boards
const PLANK = { w: 0.025, depth: 0.01 }; // dark green lines between the boards
const DOOR = { w: 0.32, h: 0.52, ledge: 0.1 }; // ledges sit `ledge` in from the top and bottom
const WIN = { y: 0.44, w: 0.32, h: 0.24 };
const BARROW = { x: 0.42, z: 0.58, tray: 0.24, yaw: 0.45 }; // tray centre height; turned `yaw` so the camera sees it side on
const CAN = { x: 0.44, z: -0.66, r: 0.085, h: 0.15 };
const STONES: Array<[number, number]> = [[0.56, -0.26], [0.76, -0.34]]; // stepping stones from the door step

/** A round rod from a to b. */
function rod(kit: StyleKit, a: Vec3, b: Vec3, r: number, color: PaletteColor, segments = 6): Part {
  const d: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const len = Math.hypot(...d);
  const mid: Vec3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  return kit.cylinder(r, r, len, mid, color, { segments, rotate: [Math.atan2(d[2], d[1]), 0, -Math.asin(d[0] / len)] });
}

/** โรงเก็บเครื่องมือ: a little green garden shed with a red door, a window box, a wheelbarrow and a watering can. */
export const item: ItemModel = {
  id: 'garden-shed',
  name: 'โรงเก็บเครื่องมือ',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const wallH = WALL_TOP - BASE.h;
    const wallY = BASE.h + wallH / 2;
    const front = CX + W / 2;
    const parts: Part[] = [
      kit.box([W + 2 * BASE.lip, BASE.h, L + 2 * BASE.lip], [CX, BASE.h / 2, CZ], 'stone'),
      kit.box([0.14, 0.04, 0.42], [front + BASE.lip + 0.07, 0.02, CZ], 'stone'), // step
      kit.box([W, wallH, L], [CX, wallY, CZ], 'leaf'),
      kit.wedge([L, RISE, W], [CX, WALL_TOP + RISE / 2, CZ], 'leaf', { rotate: [0, Math.PI / 2, 0] }), // gable ends
      ...gableRoof(kit, { at: [CX, WALL_TOP, CZ], length: W + 2 * ROOF.end, width: L, rise: RISE, eave: ROOF.eave, color: 'woodDark', ridge: 'bark', along: 'x' }),
    ];
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) parts.push(kit.box([TRIM, wallH, TRIM], [CX + (sx * W) / 2, wallY, CZ + (sz * L) / 2], 'white'));
    }
    // board lines on every wall (the door and window sit between them)
    const plank = (at: Vec3, facing: Facing) =>
      parts.push(...wallPanel(kit, { at, facing, w: PLANK.w, h: wallH - 0.02, depth: PLANK.depth, color: 'leafDark' }));
    for (const dz of [-0.32, 0.32]) plank([front, wallY, CZ + dz], 'x+');
    for (const dz of [-0.24, 0, 0.24]) plank([CX - W / 2, wallY, CZ + dz], 'x-');
    for (const dx of [-0.36, 0.36]) plank([CX + dx, wallY, CZ + L / 2], 'z+');
    for (const dx of [-0.28, 0, 0.28]) plank([CX + dx, wallY, CZ - L / 2], 'z-');

    // red ledged door with a diagonal brace and a yellow knob
    const doorY = BASE.h + DOOR.h / 2;
    const ledgeGap = DOOR.h - 2 * DOOR.ledge;
    const braceRun = DOOR.w - 0.08;
    parts.push(
      ...door(kit, { at: [front, doorY, CZ], facing: 'x+', w: DOOR.w, h: DOOR.h, color: 'red', knob: 'sunYellow' }),
      ...wallPanel(kit, { at: [front, doorY - ledgeGap / 2, CZ], facing: 'x+', w: DOOR.w - 0.04, h: 0.045, depth: 0.04, color: 'redDark' }),
      ...wallPanel(kit, { at: [front, doorY + ledgeGap / 2, CZ], facing: 'x+', w: DOOR.w - 0.04, h: 0.045, depth: 0.04, color: 'redDark' }),
      kit.box([0.04, 0.04, Math.hypot(ledgeGap, braceRun)], [front + 0.02, doorY, CZ], 'redDark', { rotate: [-Math.atan2(ledgeGap, braceRun), 0, 0] }),
    );

    // window on the +z side with a flower box under it
    const sideZ = CZ + L / 2;
    parts.push(
      ...glassWindow(kit, { at: [CX, WIN.y, sideZ], facing: 'z+', w: WIN.w, h: WIN.h, frame: 'white' }),
      ...wallPanel(kit, { at: [CX, WIN.y - WIN.h / 2 - 0.075, sideZ], facing: 'z+', w: WIN.w + 0.08, h: 0.07, depth: 0.07, color: 'woodDark' }),
    );
    const flowers: PaletteColor[] = ['pink', 'sunYellow', 'red'];
    flowers.forEach((color, i) => {
      const x = CX + (i - 1) * 0.12;
      const y = WIN.y - WIN.h / 2 - 0.035;
      parts.push(
        kit.sphere(0.05, [x, y, sideZ + 0.035], 'leaf', { detail: 0, scale: [1, 0.6, 1] }),
        kit.sphere(0.04, [x, y + 0.04, sideZ + 0.04], color, { detail: 0 }),
      );
    });

    for (const [x, z] of STONES) parts.push(kit.cylinder(0.08, 0.08, 0.03, [x, 0.015, z], 'stone', { segments: 8, scale: [1, 1, 0.8] }));

    // wheelbarrow, wheel to the front (+x before the yaw): orange tray heaped with soil, wooden
    // handles, two legs. Built in its own frame, then turned by `yaw` about y and moved to (x, z).
    const { tray: ty, yaw } = BARROW;
    const p = (x: number, y: number, z: number): Vec3 =>
      [BARROW.x + x * Math.cos(yaw) + z * Math.sin(yaw), y, BARROW.z - x * Math.sin(yaw) + z * Math.cos(yaw)];
    const wheel = p(0.25, 0.09, 0);
    const axle: Vec3 = [0, yaw + Math.PI / 2, Math.PI / 2]; // cylinder axis across the barrow
    parts.push(
      kit.cylinder(0.2, 0.13, 0.14, p(0, ty, 0), 'orange', { segments: 4, rotate: [0, Math.PI / 4 + yaw, 0] }), // tapered square tray
      kit.sphere(0.13, p(0, ty + 0.07, 0), 'bark', { scale: [1, 0.4, 1] }),
      kit.cylinder(0.09, 0.09, 0.05, wheel, 'charcoal', { rotate: axle, segments: 10 }),
      kit.cylinder(0.035, 0.035, 0.07, wheel, 'stoneDark', { rotate: axle, segments: 6 }), // hub
    );
    for (const s of [-1, 1]) {
      parts.push(
        rod(kit, p(0.06, ty - 0.06, s * 0.04), p(0.25, 0.09, s * 0.04), 0.016, 'stoneDark', 4), // fork
        rod(kit, p(0.1, ty - 0.05, s * 0.09), p(-0.34, ty + 0.06, s * 0.13), 0.02, 'wood'), // handle
        kit.sphere(0.03, p(-0.34, ty + 0.06, s * 0.13), 'charcoal', { detail: 0 }), // grip
        kit.box([0.03, ty - 0.07, 0.03], p(-0.1, (ty - 0.07) / 2, s * 0.09), 'charcoal', { rotate: [0, yaw, 0] }), // leg
      );
    }

    // watering can, spout to the front
    const { x: cx, z: cz } = CAN;
    const tip: Vec3 = [cx + 0.2, CAN.h + 0.06, cz];
    parts.push(
      kit.cylinder(CAN.r, CAN.r, CAN.h, [cx, CAN.h / 2, cz], 'blue', { segments: 10 }),
      rod(kit, [cx + 0.04, 0.05, cz], tip, 0.018, 'blue', 6),
      kit.cylinder(0.035, 0.02, 0.04, tip, 'navy', { segments: 8, rotate: [0, 0, -0.8] }), // sprinkler rose
      kit.torus(0.06, 0.018, [cx - 0.02, CAN.h, cz], 'blue', { arc: Math.PI, tubularSegments: 6, radialSegments: 4 }),
    );
    return kit.finish(parts);
  },
};
