import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { glassWindow } from '../../../models/parts';

// A boxy classic taxi (nobody driving): yellow, a checker band, a glowing roof lamp (just a lit box, no text).
const R = 0.1;
const LOW = { w: 0.64, h: 0.17, y0: 0.1, len: 1.5 };
const CAB = { w: 0.56, h: 0.16, y0: LOW.y0 + LOW.h, z0: -0.5, z1: 0.3 };
const CAB_TOP = CAB.y0 + CAB.h;

/** แท็กซี่: a boxy classic taxi with a roof lamp (no text). */
export const item: ItemModel = {
  id: 'taxi',
  name: 'แท็กซี่',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const czc = (CAB.z0 + CAB.z1) / 2;
    const parts: Part[] = [
      kit.box([LOW.w, LOW.h, LOW.len], [0, LOW.y0 + LOW.h / 2, 0], 'sunYellow'),
      kit.box([CAB.w, CAB.h, CAB.z1 - CAB.z0], [0, CAB.y0 + CAB.h / 2, czc], 'sunYellow'),
      kit.box([CAB.w + 0.04, 0.03, CAB.z1 - CAB.z0 + 0.04], [0, CAB_TOP + 0.015, czc], 'orange'),
      kit.box([LOW.w + 0.02, 0.03, LOW.len + 0.1], [0, 0.12, 0], 'charcoal'),
      // roof lamp
      kit.box([0.22, 0.07, 0.12], [0, CAB_TOP + 0.065, czc], 'white', { glow: 'lampWarm', light: 'steady' }),
      kit.box([0.24, 0.02, 0.14], [0, CAB_TOP + 0.04, czc], 'charcoal'),
      // headlights and tail lights
      kit.sphere(0.04, [-0.22, 0.22, LOW.len / 2 + 0.03], 'lampWarm', { detail: 0, glow: true }),
      kit.sphere(0.04, [0.22, 0.22, LOW.len / 2 + 0.03], 'lampWarm', { detail: 0, glow: true }),
      kit.box([0.1, 0.05, 0.03], [-0.22, 0.22, -LOW.len / 2 - 0.015], 'red', { glow: 'red' }),
      kit.box([0.1, 0.05, 0.03], [0.22, 0.22, -LOW.len / 2 - 0.015], 'red', { glow: 'red' }),
      ...glassWindow(kit, { at: [CAB.w / 2, CAB.y0 + 0.08, czc], facing: 'x+', w: 0.7, h: 0.08, panes: 3 }),
      ...glassWindow(kit, { at: [-CAB.w / 2, CAB.y0 + 0.08, czc], facing: 'x-', w: 0.7, h: 0.08, panes: 3 }),
      ...glassWindow(kit, { at: [0, CAB.y0 + 0.08, CAB.z1], facing: 'z+', w: 0.44, h: 0.08, panes: 2 }),
      ...glassWindow(kit, { at: [0, CAB.y0 + 0.08, CAB.z0], facing: 'z-', w: 0.44, h: 0.08, panes: 2 }),
    ];
    // checker band along both sides
    for (let i = 0; i < 12; i++) {
      const z = -0.75 + 0.0625 + i * 0.125;
      parts.push(kit.box([LOW.w + 0.02, 0.04, 0.125], [0, 0.205, z], i % 2 === 0 ? 'charcoal' : 'white'));
    }
    for (const x of [-0.34, 0.34]) {
      for (const z of [-0.48, 0.5]) {
        parts.push(kit.cylinder(R, R, 0.1, [x, R, z], 'charcoal', { segments: 12, rotate: [0, 0, Math.PI / 2] }));
        parts.push(kit.cylinder(0.05, 0.05, 0.12, [x * 1.03, R, z], 'stone', { segments: 6, rotate: [0, 0, Math.PI / 2] }));
      }
    }
    return kit.finish(parts);
  },
};
