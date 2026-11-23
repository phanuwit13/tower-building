import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { gableRoof, glassWindow } from '../../../models/parts';

// 2x3 (x by z). A temple hall with a big sweeping roof, a red roofed gate in front of it (+x) holding a giant paper lantern, a path.
const HALL = { x: -0.3, plinth: 0.16, wallH: 0.82, w: 0.8, len: 1.9, rise: 0.85, eave: 0.16 };
const HALL_TOP = HALL.plinth + HALL.wallH;
const GATE = { x: 0.6, plinth: 0.1, postH: 1.0, d: 0.5, len: 1.7 };
const GATE_TOP = GATE.plinth + GATE.postH;

/** วัดญี่ปุ่น: a temple hall, a red gate and a giant paper lantern. */
export const item: ItemModel = {
  id: 'japanese-temple',
  name: 'วัดญี่ปุ่น',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.98, 0.03, 2.98], [0, 0.015, 0], 'stone'),
      kit.box([0.95, 0.05, 0.5], [0.52, 0.025, 0], 'sand'), // stone path to the hall
    ];
    // hall: plinth, cream walls, red posts, gable ends, sweeping roof
    parts.push(
      kit.box([1.0, HALL.plinth, 2.2], [HALL.x + 0.05, HALL.plinth / 2, 0], 'stoneDark'),
      kit.box([0.12, 0.08, 0.7], [0.27, 0.04, 0], 'stone'), // steps
      kit.box([HALL.w, HALL.wallH, HALL.len], [HALL.x, HALL.plinth + HALL.wallH / 2, 0], 'cream'),
      kit.wedge([HALL.w, HALL.rise, HALL.len - 0.01], [HALL.x, HALL_TOP + HALL.rise / 2, 0], 'cream'),
    );
    const postX = HALL.x + HALL.w / 2;
    for (let k = 0; k < 6; k++) {
      const z = -0.9 + k * 0.36;
      parts.push(kit.cylinder(0.045, 0.045, HALL.wallH, [postX + 0.02, HALL.plinth + HALL.wallH / 2, z], 'red', { segments: 8 }));
      parts.push(kit.cylinder(0.045, 0.045, HALL.wallH, [HALL.x - HALL.w / 2 - 0.02, HALL.plinth + HALL.wallH / 2, z], 'red', { segments: 8 }));
    }
    parts.push(kit.box([0.06, 0.07, HALL.len + 0.04], [postX + 0.02, HALL_TOP - 0.04, 0], 'redDark')); // beam
    for (const z of [-0.54, 0.54]) parts.push(...glassWindow(kit, { at: [postX, HALL.plinth + 0.45, z], facing: 'x+', w: 0.22, h: 0.36, frame: 'redDark', panes: 2 }));
    parts.push(
      kit.box([0.03, 0.55, 0.36], [postX + 0.005, HALL.plinth + 0.3, 0], 'woodDark'), // door
      ...gableRoof(kit, { at: [HALL.x, HALL_TOP, 0], length: 2.3, width: HALL.w, rise: HALL.rise, eave: HALL.eave, color: 'charcoal', ridge: 'redDark' }),
      kit.cone(0.07, 0.2, [HALL.x, HALL_TOP + HALL.rise + 0.17, 1.12], 'brass', { segments: 6 }), // upswept ridge ends
      kit.cone(0.07, 0.2, [HALL.x, HALL_TOP + HALL.rise + 0.17, -1.12], 'brass', { segments: 6 }),
    );
    // gate: plinth, side walls, four red posts, beam, roof
    const gx = GATE.x;
    parts.push(
      kit.box([GATE.d + 0.06, GATE.plinth, GATE.len], [gx, GATE.plinth / 2, 0], 'stoneDark'),
      kit.box([GATE.d - 0.1, GATE.postH - 0.1, 0.4], [gx, GATE.plinth + (GATE.postH - 0.1) / 2, 0.55], 'redDark'),
      kit.box([GATE.d - 0.1, GATE.postH - 0.1, 0.4], [gx, GATE.plinth + (GATE.postH - 0.1) / 2, -0.55], 'redDark'),
      kit.box([GATE.d + 0.04, 0.12, GATE.len - 0.1], [gx, GATE_TOP + 0.02, 0], 'red'),
    );
    for (const sz of [-1, 1]) {
      for (const sx of [-1, 1]) parts.push(kit.cylinder(0.065, 0.065, GATE.postH, [gx + sx * 0.2, GATE.plinth + GATE.postH / 2, sz * 0.36], 'red', { segments: 8 }));
      parts.push(kit.cylinder(0.065, 0.065, GATE.postH, [gx, GATE.plinth + GATE.postH / 2, sz * 0.75], 'red', { segments: 8 }));
    }
    parts.push(...gableRoof(kit, { at: [gx, GATE_TOP + 0.08, 0], length: 1.9, width: 0.34, rise: 0.3, eave: 0.1, color: 'charcoal', ridge: 'redDark' }));
    // the giant paper lantern hangs in the opening: red glowing body, dark caps, bands and a tassel
    const LY = 0.62;
    const lx = gx + 0.16;
    parts.push(
      kit.sphere(0.22, [lx, LY, 0], 'orange', { detail: 1, scale: [1, 1.25, 1], glow: true, light: 'breathe' }),
      kit.cylinder(0.12, 0.12, 0.05, [lx, LY + 0.3, 0], 'charcoal', { segments: 8 }),
      kit.cylinder(0.12, 0.12, 0.05, [lx, LY - 0.3, 0], 'charcoal', { segments: 8 }),
      kit.cylinder(0.012, 0.012, GATE_TOP - (LY + 0.32), [lx, (GATE_TOP + LY + 0.32) / 2, 0], 'stoneDark', { segments: 4 }),
      kit.cylinder(0.012, 0.012, 0.1, [lx, LY - 0.38, 0], 'sunYellow', { segments: 4 }),
      kit.sphere(0.03, [lx, LY - 0.46, 0], 'sunYellow', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
