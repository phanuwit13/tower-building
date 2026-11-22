import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { door, gableRoof, glassWindow, wallPanel, type Facing } from '../../../models/parts';

// Main block, long side along z. The entrance tower with the clock is on the +x side (the front).
const W = 1.5; // wall width (x)
const L = 2.7; // wall length (z)
const PLINTH = { h: 0.08, lip: 0.08 }; // stone base; `lip` = how far it sticks out past the walls
const STOREY = 0.62;
const WALL_TOP = PLINTH.h + 2 * STOREY;
const BAND = { h: 0.06, lip: 0.03 }; // white band between the floors
const CORNICE = { h: 0.07, lip: 0.04 }; // white band at the top of the walls
const PITCH = 0.62; // roof slope, radians (~35°)
const RISE = (W / 2) * Math.tan(PITCH);
const EAVE = 0.16; // roof overhang past the long walls
const ROOF_END = 0.12; // roof overhang past the end walls
const WIN = { w: 0.3, h: 0.32, lift: 0.02 }; // window centres sit `lift` above the middle of their storey
const ROWS = [PLINTH.h + STOREY / 2 + WIN.lift, PLINTH.h + STOREY * 1.5 + WIN.lift];
const SIDE_Z = [-1.05, -0.6, 0.6, 1.05]; // windows on both long walls; the back (-x) one also has one at z = 0
const END_X = [-0.36, 0.36]; // windows on each end wall
const TOWER = { x0: 0.5, x1: 0.94, d: 0.72, top: 1.98, lip: 0.02 }; // x1 = its front wall
const TOWER_ROOF = { h: 0.34, eave: 0.06, overhang: 0.04 }; // solid wedge, ridge along x: `eave` past the sides (z), `overhang` past front and back
const DOOR = { w: 0.3, h: 0.44 };
const STEP = { w: 0.44, h: 0.04, d: 0.05 };
const CLOCK = { y: 1.68, rim: 0.17, face: 0.14 };

/** อาคารเรียน: a two-storey Thai school building with a clock tower; its windows light up at night. */
export const item: ItemModel = {
  id: 'classroom',
  name: 'อาคารเรียน',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([W + 2 * PLINTH.lip, PLINTH.h, L + 2 * PLINTH.lip], [0, PLINTH.h / 2, 0], 'stone'),
      kit.box([W, 2 * STOREY, L], [0, PLINTH.h + STOREY, 0], 'cream'),
      kit.box([W + 2 * BAND.lip, BAND.h, L + 2 * BAND.lip], [0, PLINTH.h + STOREY, 0], 'white'),
      kit.box([W + 2 * CORNICE.lip, CORNICE.h, L + 2 * CORNICE.lip], [0, WALL_TOP, 0], 'white'),
      kit.wedge([W, RISE, L], [0, WALL_TOP + RISE / 2, 0], 'cream'), // gable ends under the roof
      ...gableRoof(kit, { at: [0, WALL_TOP, 0], length: L + 2 * ROOF_END, width: W, rise: RISE, eave: EAVE, color: 'red', ridge: 'redDark' }),
    ];
    // windows on both floors: five along the back (-x), four on the front (the tower takes the middle), two per end
    const win = (at: Vec3, facing: Facing) => glassWindow(kit, { at, facing, w: WIN.w, h: WIN.h });
    for (const y of ROWS) {
      for (const z of SIDE_Z) parts.push(...win([W / 2, y, z], 'x+'), ...win([-W / 2, y, z], 'x-'));
      parts.push(...win([-W / 2, y, 0], 'x-'));
      for (const x of END_X) parts.push(...win([x, y, L / 2], 'z+'), ...win([x, y, -L / 2], 'z-'));
    }
    // entrance tower: door and step, a window above, a clock near the top and its own little roof
    const tw = TOWER.x1 - TOWER.x0;
    const tx = (TOWER.x0 + TOWER.x1) / 2;
    /** A clock disc facing +x, centred `out` in front of the tower's front wall. */
    const disc = (r: number, depth: number, out: number, color: PaletteColor): Part =>
      kit.cylinder(r, r, depth, [TOWER.x1 + out, CLOCK.y, 0], color, { rotate: [0, 0, Math.PI / 2], segments: 16 });
    parts.push(
      kit.box([tw, TOWER.top, TOWER.d], [tx, TOWER.top / 2, 0], 'cream'),
      kit.box([tw + 2 * TOWER.lip, BAND.h, TOWER.d + 2 * TOWER.lip], [tx, PLINTH.h + STOREY, 0], 'white'),
      kit.box([tw + 2 * TOWER.lip, CORNICE.h, TOWER.d + 2 * TOWER.lip], [tx, TOWER.top, 0], 'white'),
      kit.wedge([TOWER.d + 2 * TOWER_ROOF.eave, TOWER_ROOF.h, tw + 2 * TOWER_ROOF.overhang],
        [tx, TOWER.top + CORNICE.h / 2 + TOWER_ROOF.h / 2, 0], 'red', { rotate: [0, Math.PI / 2, 0] }),
      ...door(kit, { at: [TOWER.x1, PLINTH.h + DOOR.h / 2, 0], facing: 'x+', ...DOOR, color: 'woodDark' }),
      ...wallPanel(kit, { at: [TOWER.x1, STEP.h / 2, 0], facing: 'x+', w: STEP.w, h: STEP.h, depth: STEP.d, color: 'stone' }),
      ...win([TOWER.x1, ROWS[1], 0], 'x+'),
      disc(CLOCK.rim, 0.03, 0.015, 'sunYellow'),
      disc(CLOCK.face, 0.02, 0.035, 'white'),
      kit.box([0.015, 0.1, 0.025], [TOWER.x1 + 0.05, CLOCK.y + 0.04, 0], 'navy'), // hour hand, pointing up
      kit.box([0.015, 0.025, 0.08], [TOWER.x1 + 0.05, CLOCK.y, 0.035], 'navy'), // minute hand, pointing sideways
    );
    return kit.finish(parts);
  },
};
