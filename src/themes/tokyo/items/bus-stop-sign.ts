import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A round bus-stop sign on a pole: red rim, white face with a glowing blue bus picture (no text), and a
// small wooden bench beside it, on a stone pad.
const POLE_Z = 0.24;
const SIGN = { y: 1.2, r: 0.2, x: 0.03 };

/** ป้ายรถเมล์: a round bus-stop sign on a pole with a small bench. */
export const item: ItemModel = {
  id: 'bus-stop-sign',
  name: 'ป้ายรถเมล์',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const flat: [number, number, number] = [0, 0, Math.PI / 2];
    const parts: Part[] = [
      kit.box([0.94, 0.04, 0.94], [0, 0.02, 0], 'stone'),
      kit.cylinder(0.1, 0.12, 0.06, [0, 0.07, POLE_Z], 'stoneDark', { segments: 8 }),
      kit.cylinder(0.025, 0.025, 1.2, [0, 0.64, POLE_Z], 'chrome', { segments: 8 }),
      kit.cylinder(SIGN.r + 0.025, SIGN.r + 0.025, 0.03, [SIGN.x, SIGN.y, POLE_Z], 'red', { segments: 16, rotate: flat }),
      kit.cylinder(SIGN.r - 0.025, SIGN.r - 0.025, 0.05, [SIGN.x, SIGN.y, POLE_Z], 'white', { segments: 16, rotate: flat }),
      // the bus picture: body, two lit windows, wheels
      kit.box([0.02, 0.14, 0.28], [SIGN.x + 0.035, SIGN.y + 0.01, POLE_Z], 'blue', { glow: 'blue' }),
      kit.box([0.02, 0.05, 0.07], [SIGN.x + 0.05, SIGN.y + 0.03, POLE_Z - 0.08], 'windowWarm', { glow: 'windowWarm' }),
      kit.box([0.02, 0.05, 0.07], [SIGN.x + 0.05, SIGN.y + 0.03, POLE_Z + 0.0], 'windowWarm', { glow: 'windowWarm' }),
      kit.box([0.02, 0.05, 0.07], [SIGN.x + 0.05, SIGN.y + 0.03, POLE_Z + 0.08], 'windowWarm', { glow: 'windowWarm' }),
      kit.sphere(0.03, [SIGN.x + 0.04, SIGN.y - 0.08, POLE_Z - 0.08], 'charcoal', { detail: 0 }),
      kit.sphere(0.03, [SIGN.x + 0.04, SIGN.y - 0.08, POLE_Z + 0.08], 'charcoal', { detail: 0 }),
      // bench: seat, back, legs
      kit.box([0.26, 0.04, 0.56], [-0.12, 0.29, -0.2], 'wood'),
      kit.box([0.04, 0.22, 0.56], [-0.24, 0.42, -0.2], 'wood'),
    ];
    for (const z of [-0.43, 0.03]) parts.push(kit.box([0.22, 0.22, 0.04], [-0.12, 0.15, z], 'charcoal'));
    return kit.finish(parts);
  },
};
