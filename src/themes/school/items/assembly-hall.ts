import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { door, glassWindow, wallPanel, type Facing } from '../../../models/parts';

// A wide hall under a tall curved (barrel) roof. The barrel runs along x, so the front (+x) is the
// wide arched end: a porch of four columns at the bottom, a big stage window with red curtains above it.
const WALL = { x0: -0.86, x1: 0.48, half: 1.32 }; // back wall at x0, front wall at x1, side walls at z = ±half
const PLINTH = { h: 0.08, lip: 0.06 };
const WALL_TOP = 0.9;
const CORNICE = { h: 0.07, lip: 0.07 }; // wide enough to hide where the arch springs from the wall tops
// The roof's cross-section is half an ellipse, `a` across z and `b` tall, centred `b·sin(t0)` below the wall
// tops so it springs at a slant rather than straight up. It is made of `n` flat slabs `thick` thick
// (faceted, like the kit's cylinders), each `overlap` wider than its chord to close the joints.
const ARCH = { a: 1.42, b: 0.9, t0: 0.22, n: 8, thick: 0.07, overlap: 0.03 };
const ROOF_OVER = { front: 0.05, back: 0.1 }; // roof overhang past the front and back walls (short at the front, to show the stage window)
const ARCH_Y = WALL_TOP - ARCH.b * Math.sin(ARCH.t0); // the ellipse centre
const SIDE_WIN = { w: 0.22, h: 0.42, y: PLINTH.h + 0.38 };
const SIDE_X = [-0.62, -0.18, 0.26]; // windows along both side walls

// front porch: a stone floor, four white columns and a flat white roof, in front of three doors. It is
// shallow and low so the stage window above it stays in view from the camera.
const PORCH = { x1: 0.9, floor: 0.1, top: 0.72, half: 0.86, colX: 0.78, colR: 0.055 };
const COLUMN_Z = [-0.66, -0.22, 0.22, 0.66];
const ENTABLATURE = { h: 0.08, x1: 0.86 };
const DOOR = { w: 0.24, h: 0.48 };
const DOOR_Z = [-0.44, 0, 0.44];
// the stage window: gold frame, red curtains drawn to the sides under a dark red pelmet
const STAGE = { y: 1.2, w: 1.0, h: 0.44 };
const CURTAIN = { w: 0.24, tied: 0.12, drape: 0.26 }; // `drape`: height of the full-width top part; below it the curtain is tied back to `tied`

/** หอประชุม: the school assembly hall, with a tall curved roof, a columned porch and a stage window. */
export const item: ItemModel = {
  id: 'assembly-hall',
  name: 'หอประชุม',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const len = WALL.x1 - WALL.x0;
    const cx = (WALL.x0 + WALL.x1) / 2;
    const parts: Part[] = [
      kit.box([len + 2 * PLINTH.lip, PLINTH.h, 2 * (WALL.half + PLINTH.lip)], [cx, PLINTH.h / 2, 0], 'stone'),
      kit.box([len, WALL_TOP - PLINTH.h, 2 * WALL.half], [cx, (PLINTH.h + WALL_TOP) / 2, 0], 'cream'),
      kit.box([len + 2 * CORNICE.lip, CORNICE.h, 2 * (WALL.half + CORNICE.lip)], [cx, WALL_TOP, 0], 'white'),
    ];

    // The curved roof. Points on the half ellipse, in (y, z), from +z over the top to -z.
    const roofLen = len + ROOF_OVER.front + ROOF_OVER.back;
    const roofX = cx + (ROOF_OVER.front - ROOF_OVER.back) / 2;
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= ARCH.n; i++) {
      const t = ARCH.t0 + (i / ARCH.n) * (Math.PI - 2 * ARCH.t0);
      pts.push([ARCH_Y + ARCH.b * Math.sin(t), ARCH.a * Math.cos(t)]);
    }
    for (let i = 0; i < ARCH.n; i++) {
      const [y0, z0] = pts[i];
      const [y1, z1] = pts[i + 1];
      const c = Math.hypot(y1 - y0, z1 - z0);
      const dy = (y1 - y0) / c, dz = (z1 - z0) / c;
      // F: the foot of the perpendicular from the ellipse centre O to this chord; v: unit vector from the chord towards O
      const k = (ARCH_Y - y0) * dy + (0 - z0) * dz;
      const fy = y0 + dy * k, fz = z0 + dz * k;
      const h = Math.hypot(ARCH_Y - fy, -fz);
      const vy = (ARCH_Y - fy) / h, vz = -fz / h;
      const my = (y0 + y1) / 2, mz = (z0 + z1) / 2;
      // [phi, PI/2, 0] turns a part's local x onto the chord (direction (vz, -vy) in y, z), its local y onto v
      // and its local z onto world x (the barrel's axis).
      const rotate: Vec3 = [Math.atan2(vz, vy), Math.PI / 2, 0];
      const apex = ((fy - my) * vz + (fz - mz) * -vy) / c; // where O sits along the chord, from its middle
      parts.push(
        kit.box([c + ARCH.overlap, ARCH.thick, roofLen], [roofX, my - vy * ARCH.thick / 2, mz - vz * ARCH.thick / 2], 'teal', { rotate }),
        // the end walls under the arch: a fan of wedges from O to each chord, 0.005 short of each wall face
        kit.wedge([c, h, len - 0.01], [cx, my + vy * h / 2, mz + vz * h / 2], 'cream', { rotate, apex }),
      );
    }

    // windows: three tall ones along each side, two and a door at the back, a wide one in the back arch
    const win = (at: Vec3, facing: Facing, w = SIDE_WIN.w, h = SIDE_WIN.h) => glassWindow(kit, { at, facing, w, h });
    for (const x of SIDE_X) parts.push(...win([x, SIDE_WIN.y, WALL.half], 'z+'), ...win([x, SIDE_WIN.y, -WALL.half], 'z-'));
    for (const z of [-0.6, 0.6]) parts.push(...win([WALL.x0, SIDE_WIN.y, z], 'x-'));
    parts.push(
      ...win([WALL.x0, STAGE.y, 0], 'x-', 0.5, 0.24),
      ...door(kit, { at: [WALL.x0, PLINTH.h + DOOR.h / 2, 0], facing: 'x-', ...DOOR, color: 'woodDark' }),
    );

    // the front porch
    const porchLen = PORCH.x1 - WALL.x1;
    const colH = PORCH.top - PORCH.floor;
    parts.push(
      kit.box([porchLen, PORCH.floor, 2 * PORCH.half], [WALL.x1 + porchLen / 2, PORCH.floor / 2, 0], 'stone'),
      kit.box([0.04, PORCH.floor / 2, 2 * PORCH.half - 0.3], [PORCH.x1 + 0.02, PORCH.floor / 4, 0], 'stone'), // the bottom step
      kit.box([ENTABLATURE.x1 - WALL.x1, ENTABLATURE.h, 2 * PORCH.half - 0.04], [(WALL.x1 + ENTABLATURE.x1) / 2, PORCH.top + ENTABLATURE.h / 2, 0], 'white'),
      kit.box([ENTABLATURE.x1 - WALL.x1 + 0.04, 0.04, 2 * PORCH.half], [(WALL.x1 + ENTABLATURE.x1) / 2 + 0.02, PORCH.top + ENTABLATURE.h + 0.02, 0], 'white'),
      ...wallPanel(kit, { at: [ENTABLATURE.x1, PORCH.top + ENTABLATURE.h / 2, 0], facing: 'x+', w: 2 * PORCH.half - 0.1, h: 0.03, depth: 0.01, color: 'teal' }), // a teal line along the front
    );
    for (const z of COLUMN_Z) {
      parts.push(
        kit.cylinder(PORCH.colR, PORCH.colR, colH, [PORCH.colX, PORCH.floor + colH / 2, z], 'white'),
        kit.box([0.14, 0.04, 0.14], [PORCH.colX, PORCH.floor + 0.02, z], 'white'), // base
        kit.box([0.14, 0.04, 0.14], [PORCH.colX, PORCH.top - 0.02, z], 'white'), // capital
      );
    }
    for (const z of DOOR_Z) parts.push(...door(kit, { at: [WALL.x1, PORCH.floor + DOOR.h / 2, z], facing: 'x+', ...DOOR, color: 'woodDark', knob: 'sunYellow' }));

    // the stage window above the porch
    const topY = STAGE.y + STAGE.h / 2;
    const tiedH = STAGE.h - CURTAIN.drape;
    parts.push(...glassWindow(kit, { at: [WALL.x1, STAGE.y, 0], facing: 'x+', w: STAGE.w, h: STAGE.h, frame: 'sunYellow', panes: 1 }));
    for (const s of [1, -1]) {
      const edge = s * STAGE.w / 2; // the outer edge of the glass on this side
      parts.push(
        ...wallPanel(kit, { at: [WALL.x1, topY - CURTAIN.drape / 2, edge - s * CURTAIN.w / 2], facing: 'x+', w: CURTAIN.w, h: CURTAIN.drape, depth: 0.05, color: 'red' }),
        ...wallPanel(kit, { at: [WALL.x1, STAGE.y - STAGE.h / 2 + tiedH / 2, edge - s * CURTAIN.tied / 2], facing: 'x+', w: CURTAIN.tied, h: tiedH, depth: 0.05, color: 'red' }),
      );
    }
    parts.push(...wallPanel(kit, { at: [WALL.x1, topY - 0.035, 0], facing: 'x+', w: STAGE.w, h: 0.07, depth: 0.06, color: 'redDark' })); // pelmet
    return kit.finish(parts);
  },
};
