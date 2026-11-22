import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';

// Main block, long side along z. The entrance tower with the clock is on the +x side.
const W = 1.5; // wall width (x)
const L = 2.7; // wall length (z)
const PLINTH = 0.08;
const STOREY = 0.62;
const WALL_TOP = PLINTH + 2 * STOREY;
const PITCH = 0.62; // roof slope, radians (~35°)
const RISE = (W / 2) * Math.tan(PITCH);
const RIDGE = WALL_TOP + RISE;
const EAVE = W / 2 + 0.16; // roof reaches this far out from the ridge
const SLAB = 0.08; // roof thickness
const ROOF_L = L + 0.24;
const TOWER = { x0: 0.5, x1: 0.94, d: 0.72, top: 1.98 };
const WIN = { w: 0.3, h: 0.32 };
const ROWS = [PLINTH + STOREY / 2 + 0.02, PLINTH + STOREY * 1.5 + 0.02];

/** A glass-blue window that glows warm at night in a coloured frame on a wall facing +x (side 1) or -x (side -1) at x = ±face. */
function sideWindow(kit: StyleKit, side: 1 | -1, face: number, y: number, z: number): Part[] {
  return [
    kit.box([0.02, WIN.h + 0.08, WIN.w + 0.08], [side * (face + 0.01), y, z], 'teal'),
    kit.box([0.03, WIN.h, WIN.w], [side * (face + 0.015), y, z], 'skyBlue', { glow: 'windowWarm' }),
    kit.box([0.04, WIN.h, 0.035], [side * (face + 0.02), y, z], 'teal'),
  ];
}

/** Same, on a wall facing +z (side 1) or -z (side -1) at z = ±face. */
function endWindow(kit: StyleKit, side: 1 | -1, face: number, y: number, x: number): Part[] {
  return [
    kit.box([WIN.w + 0.08, WIN.h + 0.08, 0.02], [x, y, side * (face + 0.01)], 'teal'),
    kit.box([WIN.w, WIN.h, 0.03], [x, y, side * (face + 0.015)], 'skyBlue', { glow: 'windowWarm' }),
    kit.box([0.035, WIN.h, 0.04], [x, y, side * (face + 0.02)], 'teal'),
  ];
}

/** อาคารเรียน: a two-storey Thai school building with a clock tower; its windows light up at night. */
export const item: ItemModel = {
  id: 'classroom',
  name: 'อาคารเรียน',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const slabLen = EAVE / Math.cos(PITCH);
    const slab = (s: 1 | -1): Part => kit.box(
      [slabLen, SLAB, ROOF_L],
      [s * (EAVE / 2 + (SLAB / 2) * Math.sin(PITCH)), RIDGE - (EAVE / 2) * Math.tan(PITCH) + (SLAB / 2) * Math.cos(PITCH), 0],
      'red',
      { rotate: [0, 0, -s * PITCH] },
    );
    const parts: Part[] = [
      kit.box([W + 0.16, PLINTH, L + 0.16], [0, PLINTH / 2, 0], 'stone'),
      kit.box([W, 2 * STOREY, L], [0, PLINTH + STOREY, 0], 'cream'),
      kit.box([W + 0.06, 0.06, L + 0.06], [0, PLINTH + STOREY, 0], 'white'),
      kit.box([W + 0.08, 0.07, L + 0.08], [0, WALL_TOP, 0], 'white'),
      kit.wedge([W, RISE, L], [0, WALL_TOP + RISE / 2, 0], 'cream'),
      slab(1),
      slab(-1),
      kit.cylinder(0.065, 0.065, ROOF_L + 0.02, [0, RIDGE + 0.05, 0], 'redDark', { rotate: [Math.PI / 2, 0, 0], segments: 8 }), // ridge cap
    ];
    // windows on both floors: five along the -x side, four on the +x side (the tower takes the middle), two per end
    for (const y of ROWS) {
      for (const z of [-1.05, -0.6, 0.6, 1.05]) parts.push(...sideWindow(kit, 1, W / 2, y, z), ...sideWindow(kit, -1, W / 2, y, z));
      parts.push(...sideWindow(kit, -1, W / 2, y, 0));
      for (const x of [-0.36, 0.36]) parts.push(...endWindow(kit, 1, L / 2, y, x), ...endWindow(kit, -1, L / 2, y, x));
    }
    // entrance tower: door, a window above it, a clock near the top and its own little roof
    const tw = TOWER.x1 - TOWER.x0;
    const tx = (TOWER.x0 + TOWER.x1) / 2;
    parts.push(
      kit.box([tw, TOWER.top, TOWER.d], [tx, TOWER.top / 2, 0], 'cream'),
      kit.box([tw + 0.04, 0.06, TOWER.d + 0.04], [tx, PLINTH + STOREY, 0], 'white'),
      kit.box([tw + 0.04, 0.07, TOWER.d + 0.04], [tx, TOWER.top, 0], 'white'),
      kit.wedge([TOWER.d + 0.12, 0.34, tw + 0.08], [tx, TOWER.top + 0.035 + 0.17, 0], 'red', { rotate: [0, Math.PI / 2, 0] }),
      kit.box([0.03, 0.44, 0.3], [TOWER.x1 + 0.015, PLINTH + 0.22, 0], 'woodDark'),
      kit.box([0.05, 0.04, 0.44], [TOWER.x1 + 0.025, 0.02, 0], 'stone'),
      ...sideWindow(kit, 1, TOWER.x1, ROWS[1], 0),
      kit.cylinder(0.17, 0.17, 0.03, [TOWER.x1 + 0.015, 1.68, 0], 'sunYellow', { rotate: [0, 0, Math.PI / 2], segments: 16 }),
      kit.cylinder(0.14, 0.14, 0.02, [TOWER.x1 + 0.035, 1.68, 0], 'white', { rotate: [0, 0, Math.PI / 2], segments: 16 }),
      kit.box([0.015, 0.1, 0.025], [TOWER.x1 + 0.05, 1.72, 0], 'navy'),
      kit.box([0.015, 0.025, 0.08], [TOWER.x1 + 0.05, 1.68, 0.035], 'navy'),
    );
    return kit.finish(parts);
  },
};
