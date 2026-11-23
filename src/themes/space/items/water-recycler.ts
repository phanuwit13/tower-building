import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { glassWindow } from '../../../models/parts';

// Three tanks and chrome pipes round a white control module with lit windows.
const PAD = 0.05;
const MOD = { x: 0.15, z: 0.25, w: 0.8, h: 0.6, d: 0.8 };

/** โรงรีไซเคิลน้ำ: tanks and pipes around a lit control module. */
export const item: ItemModel = {
  id: 'water-recycler',
  name: 'โรงรีไซเคิลน้ำ',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const top = PAD + MOD.h;
    const parts: Part[] = [
      kit.box([1.9, PAD, 1.9], [0, PAD / 2, 0], 'stone'),
      // module with an orange roof and a water-drop
      kit.box([MOD.w, MOD.h, MOD.d], [MOD.x, PAD + MOD.h / 2, MOD.z], 'white'),
      kit.box([MOD.w + 0.1, 0.08, MOD.d + 0.1], [MOD.x, top + 0.04, MOD.z], 'orange'),
      kit.sphere(0.09, [MOD.x, top + 0.17, MOD.z], 'skyBlue', { detail: 1 }),
      kit.cone(0.075, 0.16, [MOD.x, top + 0.28, MOD.z], 'skyBlue', { segments: 8 }),
      ...glassWindow(kit, { at: [MOD.x + MOD.w / 2, 0.38, MOD.z], facing: 'x+', w: 0.34, h: 0.26, frame: 'teal', panes: 2 }),
      ...glassWindow(kit, { at: [MOD.x, 0.45, MOD.z + MOD.d / 2], facing: 'z+', w: 0.34, h: 0.26, frame: 'teal', panes: 2 }),
      ...glassWindow(kit, { at: [MOD.x, 0.45, MOD.z - MOD.d / 2], facing: 'z-', w: 0.34, h: 0.26, frame: 'teal', panes: 2 }),
      // tanks: a tall teal one, a blue one, a sky-blue one, each with a white cap and band
      kit.cylinder(0.3, 0.3, 0.6, [-0.62, PAD + 0.3, -0.62], 'teal', { segments: 12 }),
      kit.dome(0.3, [-0.62, PAD + 0.6, -0.62], 'white'),
      kit.cylinder(0.31, 0.31, 0.06, [-0.62, 0.35, -0.62], 'white', { segments: 12 }),
      kit.cylinder(0.28, 0.28, 0.45, [-0.65, PAD + 0.225, 0.6], 'blue', { segments: 12 }),
      kit.dome(0.28, [-0.65, PAD + 0.45, 0.6], 'white'),
      kit.cylinder(0.29, 0.29, 0.06, [-0.65, 0.28, 0.6], 'sunYellow', { segments: 12 }),
      kit.cylinder(0.26, 0.26, 0.4, [0.65, PAD + 0.2, -0.65], 'skyBlue', { segments: 12 }),
      kit.dome(0.26, [0.65, PAD + 0.4, -0.65], 'white'),
      kit.cylinder(0.27, 0.27, 0.06, [0.65, 0.25, -0.65], 'orange', { segments: 12 }),
      // pipes and valves
      kit.cylinder(0.05, 0.05, 0.75, [0.01, 0.25, -0.65], 'chrome', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.05, 0.05, 0.65, [-0.65, 0.22, 0], 'chrome', { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.05, 0.05, 0.15, [-0.31, 0.22, 0.6], 'chrome', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.05, 0.05, 0.2, [-0.18, 0.22, 0.6], 'chrome', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.sphere(0.07, [-0.01, 0.32, -0.65], 'red', { detail: 0 }),
      kit.sphere(0.07, [-0.65, 0.3, 0.05], 'red', { detail: 0 }),
    ];
    return kit.finish(parts);
  },
};
