import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { door, gableRoof, glassWindow, wallPanel, type Facing } from '../../../models/parts';

// One tall storey, long side along z, under a blue gable roof. A flat-topped entrance block stands
// out on +x (the front), a little taller than the walls, and a giant open book leans on a stand on its roof.
const W = 1.4; // wall width (x)
const L = 2.6; // wall length (z)
const PLINTH = { h: 0.08, lip: 0.07 }; // stone base; `lip` = how far it sticks out past the walls
const WALL_TOP = 0.92; // one tall storey (a classroom storey is 0.62): room for tall reading-room windows
const CORNICE = { h: 0.07, lip: 0.04 }; // white band at the top of the walls
const PITCH = 0.6; // roof slope, radians (~34°)
const RISE = (W / 2) * Math.tan(PITCH);
const EAVE = 0.1; // roof overhang past the long walls: the entrance front (ENTRY.x1) must stay in front of it
const ROOF_END = 0.12; // roof overhang past the end walls
const WIN = { w: 0.24, h: 0.5, y: PLINTH.h + 0.42 }; // tall windows; `y` = their centre
const FRONT_Z = [-1.06, -0.72, 0.72, 1.06]; // +x wall, either side of the entrance
const BACK_Z = [-1.0, -0.5, 0, 0.5, 1.0]; // -x wall
const END_X = [-0.34, 0.34]; // each end wall
const GABLE_WIN = { w: 0.22, h: 0.14, up: 0.17 }; // small window in each gable end, `up` above the wall top

// Entrance block: x0 is buried in the main block, x1 is its front wall. Its flat top is above the
// main roof's eave, so the eave runs into its sides.
const ENTRY = { x0: 0.5, x1: 0.86, d: 0.96, top: 1.1 };
const DOOR = { w: 0.34, h: 0.48 };
const DOOR_SURROUND = 0.05; // white frame round the door
const TRANSOM = { w: 0.3, h: 0.14, y: 0.8 }; // window over the door
const STEP = { w: 0.52, h: 0.04, d: 0.06 };

// The giant open book: two halves opened into a shallow V towards the viewer, leaning back on a
// wooden stand so it faces up at the camera. Red covers, white pages, navy lines of "text".
const BOOK = { x: 0.82, h: 0.44, half: 0.34, open: 0.3, lean: 0.5 }; // x of the spine's foot; `open` and `lean` in radians
const BOOK_LINES = [0.12, 0.05, -0.02, -0.09]; // heights of the text lines along the page, from its middle
const STAND_H = 0.3; // the stand behind the book (a ramp under the spine)

const SHRUB = { r: 0.12, x: 0.82, z: 0.6, squash: 0.85 }; // round shrubs either side of the entrance

/**
 * Euler XYZ angles of "turn `open` about y, then lean back `lean` about z" (Rz(lean)·Ry(open)), and that
 * rotation applied to a point. Euler XYZ alone turns about z first, which would hinge the pages wrongly.
 */
function leanAndOpen(lean: number, open: number): { rotate: Vec3; apply: (p: Vec3) => Vec3 } {
  const cl = Math.cos(lean), sl = Math.sin(lean), co = Math.cos(open), so = Math.sin(open);
  // M = Rz(lean)·Ry(open) = [[cl·co, -sl, cl·so], [sl·co, cl, sl·so], [-so, 0, co]]
  const rotate: Vec3 = [Math.atan2(-sl * so, co), Math.asin(cl * so), Math.atan2(sl, cl * co)];
  const apply = ([x, y, z]: Vec3): Vec3 => [cl * co * x - sl * y + cl * so * z, sl * co * x + cl * y + sl * so * z, -so * x + co * z];
  return { rotate, apply };
}

/** ห้องสมุด: the school library, a long single-storey hall with tall windows and a giant open book over its door. */
export const item: ItemModel = {
  id: 'library',
  name: 'ห้องสมุด',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([W + 2 * PLINTH.lip, PLINTH.h, L + 2 * PLINTH.lip], [0, PLINTH.h / 2, 0], 'stone'),
      kit.box([W, WALL_TOP - PLINTH.h, L], [0, (PLINTH.h + WALL_TOP) / 2, 0], 'cream'),
      kit.box([W + 2 * CORNICE.lip, CORNICE.h, L + 2 * CORNICE.lip], [0, WALL_TOP, 0], 'white'),
      kit.wedge([W, RISE, L], [0, WALL_TOP + RISE / 2, 0], 'cream'), // gable ends under the roof
      ...gableRoof(kit, { at: [0, WALL_TOP, 0], length: L + 2 * ROOF_END, width: W, rise: RISE, eave: EAVE, color: 'blue', ridge: 'navy' }),
    ];

    // tall windows all round, frames in the roof's blue
    const win = (at: Vec3, facing: Facing, w = WIN.w, h = WIN.h) => glassWindow(kit, { at, facing, w, h, frame: 'blue' });
    for (const z of FRONT_Z) parts.push(...win([W / 2, WIN.y, z], 'x+'));
    for (const z of BACK_Z) parts.push(...win([-W / 2, WIN.y, z], 'x-'));
    for (const x of END_X) parts.push(...win([x, WIN.y, L / 2], 'z+'), ...win([x, WIN.y, -L / 2], 'z-'));
    for (const s of [1, -1]) parts.push(...win([0, WALL_TOP + GABLE_WIN.up, s * L / 2], s > 0 ? 'z+' : 'z-', GABLE_WIN.w, GABLE_WIN.h));

    // the entrance block: cream walls, flat white top, a framed door with a window over it
    const ew = ENTRY.x1 - ENTRY.x0;
    const ex = (ENTRY.x0 + ENTRY.x1) / 2;
    parts.push(
      kit.box([ew + PLINTH.lip, PLINTH.h, ENTRY.d + 2 * PLINTH.lip], [ex + PLINTH.lip / 2, PLINTH.h / 2, 0], 'stone'),
      kit.box([ew, ENTRY.top - PLINTH.h, ENTRY.d], [ex, (PLINTH.h + ENTRY.top) / 2, 0], 'cream'),
      kit.box([ew + CORNICE.lip, CORNICE.h, ENTRY.d + 2 * CORNICE.lip], [ex + CORNICE.lip / 2, ENTRY.top, 0], 'white'),
      ...wallPanel(kit, { at: [ENTRY.x1, PLINTH.h + (DOOR.h + DOOR_SURROUND) / 2, 0], facing: 'x+', w: DOOR.w + 2 * DOOR_SURROUND, h: DOOR.h + DOOR_SURROUND, depth: 0.02, color: 'white' }),
      ...door(kit, { at: [ENTRY.x1 + 0.01, PLINTH.h + DOOR.h / 2, 0], facing: 'x+', ...DOOR, color: 'woodDark', knob: 'sunYellow' }),
      ...win([ENTRY.x1, TRANSOM.y, 0], 'x+', TRANSOM.w, TRANSOM.h),
      ...wallPanel(kit, { at: [ENTRY.x1, STEP.h / 2, 0], facing: 'x+', w: STEP.w, h: STEP.h, depth: STEP.d + PLINTH.lip, color: 'stone' }),
    );
    // round shrubs either side of the entrance
    for (const s of [1, -1]) parts.push(kit.sphere(SHRUB.r, [SHRUB.x, SHRUB.r * SHRUB.squash, s * SHRUB.z], 'leaf', { scale: [1, SHRUB.squash, 1] }));

    // The giant book on the entrance roof. Each half is built facing +x (pages along ±z, up = y), opened
    // `open` about the spine, then leaned back `lean`. `foot` is the bottom of the spine.
    const baseY = ENTRY.top + CORNICE.h / 2;
    const foot: Vec3 = [BOOK.x, baseY, 0];
    const standBase = STAND_H * Math.tan(BOOK.lean); // the stand's slope matches the book's lean
    parts.push(kit.wedge([standBase, STAND_H, 0.3], [BOOK.x - standBase / 2, baseY + STAND_H / 2, 0], 'woodDark', { apex: -0.5 }));
    for (const s of [1, -1]) {
      const { rotate, apply } = leanAndOpen(BOOK.lean, s * BOOK.open);
      /** A layer of this half: `u` out from the spine, `n` out of the page, `v` up from the book's middle. */
      const layer = (size: Vec3, u: number, n: number, v: number, color: PaletteColor) => {
        const p = apply([n, BOOK.h / 2 + v, s * u]);
        return kit.box(size, [foot[0] + p[0], foot[1] + p[1], foot[2] + p[2]], color, { rotate });
      };
      parts.push(
        layer([0.03, BOOK.h, BOOK.half + 0.02], (BOOK.half + 0.02) / 2, 0.015, 0, 'red'), // cover
        layer([0.035, BOOK.h - 0.05, BOOK.half - 0.03], BOOK.half / 2, 0.04, 0, 'white'), // pages
      );
      BOOK_LINES.forEach((v, i) => {
        const len = i === BOOK_LINES.length - 1 ? 0.13 : 0.21; // the last line of a paragraph is short
        parts.push(layer([0.012, 0.025, len], 0.05 + len / 2, 0.061, v, 'navy'));
      });
    }
    // the spine, leaning with the book
    const mid = leanAndOpen(BOOK.lean, 0).apply([0, BOOK.h / 2, 0]);
    parts.push(kit.cylinder(0.024, 0.024, BOOK.h, [foot[0] + mid[0], foot[1] + mid[1], 0], 'redDark', { rotate: [0, 0, BOOK.lean], segments: 6 }));
    return kit.finish(parts);
  },
};
