import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, glassWindow, rod } from '../../../models/parts';

// A white module workshop with an orange stripe and a flat teal roof (2×2), facing +x. Beside the door stands
// a robot arm on a pad; spare parts (gears, a robot head, crates) lie around.
const BX = -0.3; // building centre x
const B = { w: 1.1, d: 1.7, h: 0.8 };
const BASE = 0.06;

/** โรงซ่อมหุ่นยนต์: workshop module with a robot arm and spare parts. */
export const item: ItemModel = {
  id: 'robot-workshop',
  name: 'โรงซ่อมหุ่นยนต์',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const front = BX + B.w / 2;
    const parts: Part[] = [
      kit.box([B.w + 0.1, BASE, B.d + 0.1], [BX, BASE / 2, 0], 'stone'),
      kit.box([B.w, B.h - BASE, B.d], [BX, (BASE + B.h) / 2, 0], 'white'),
      kit.box([B.w + 0.02, 0.12, B.d + 0.02], [BX, 0.32, 0], 'orange'), // stripe
      // flat roof: teal slab, a chimney vent, a roof skylight that glows
      kit.box([B.w + 0.14, 0.07, B.d + 0.14], [BX, B.h + 0.035, 0], 'teal'),
      kit.cylinder(0.08, 0.1, 0.18, [BX - 0.3, B.h + 0.16, -0.5], 'stoneDark', { segments: 8 }),
      kit.box([0.3, 0.04, 0.36], [BX + 0.1, B.h + 0.09, 0.3], 'teal', { glow: 'teal', light: 'window' }),
      kit.box([0.46, 0.03, 0.04], [BX + 0.1, B.h + 0.075, 0.57], 'chrome'),
      ...glassWindow(kit, { at: [front, 0.55, -0.5], facing: 'x+', w: 0.3, h: 0.22 }),
      ...door(kit, { at: [front, BASE + 0.25, 0.4], facing: 'x+', w: 0.34, h: 0.5, color: 'red', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [BX, 0.55, B.d / 2], facing: 'z+', w: 0.5, h: 0.22 }),
      ...glassWindow(kit, { at: [BX, 0.55, -B.d / 2], facing: 'z-', w: 0.5, h: 0.22 }),
      ...glassWindow(kit, { at: [BX - B.w / 2, 0.55, 0], facing: 'x-', w: 0.6, h: 0.22 }),
      // robot arm on a pad in front: base, upright, elbow, forearm and a claw
      kit.cylinder(0.3, 0.32, 0.05, [0.66, 0.025, -0.45], 'stone', { segments: 10 }),
      kit.cylinder(0.14, 0.17, 0.14, [0.66, 0.12, -0.45], 'orange', { segments: 10 }),
      rod(kit, [0.66, 0.18, -0.45], [0.7, 0.62, -0.45], 0.05, 'chrome', { segments: 8 }),
      kit.sphere(0.07, [0.7, 0.64, -0.45], 'sunYellow', { detail: 0 }),
      rod(kit, [0.7, 0.64, -0.45], [0.74, 0.5, -0.1], 0.04, 'chrome', { segments: 8 }),
      kit.box([0.05, 0.12, 0.05], [0.74, 0.44, -0.1], 'stoneDark'),
      kit.box([0.03, 0.1, 0.03], [0.74, 0.37, -0.15], 'red'),
      kit.box([0.03, 0.1, 0.03], [0.74, 0.37, -0.05], 'red'),
      // spare parts: a gear, a robot head on the ground, a stack of crates
      kit.cylinder(0.12, 0.12, 0.05, [0.7, 0.045, 0.5], 'stoneDark', { segments: 8 }),
      kit.cylinder(0.05, 0.05, 0.07, [0.7, 0.085, 0.5], 'sunYellow', { segments: 8 }),
      kit.box([0.22, 0.2, 0.22], [0.6, 0.1, 0.8], 'blue'),
      kit.sphere(0.03, [0.72, 0.18, 0.72], 'sunYellow', { detail: 0, glow: true, light: 'window' }),
      kit.sphere(0.03, [0.72, 0.18, 0.88], 'sunYellow', { detail: 0, glow: true, light: 'window' }),
      kit.box([0.3, 0.14, 0.3], [0.15, 0.07, 0.85 + 0.0], 'orange'),
    ];
    return kit.finish(parts);
  },
};
