import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A hand-gel stand (1×1) facing +x: round foot, a pole topped by a big white pump bottle with an orange
// pump head, and a bold hand picture (palm, four fingers, thumb) on a plate tilted towards the camera.
const TILT = 0.5; // radians the plate leans back
const PLATE: [number, number] = [0.1, 0.5]; // x, y of the plate centre
const NORMAL: [number, number] = [Math.cos(TILT), Math.sin(TILT)];
const UP: [number, number] = [-Math.sin(TILT), Math.cos(TILT)];
const POLE_X = -0.1;
const POLE_TOP = 0.75;

/** เจลล้างมือ: hand-gel stand with a pump bottle and a hand picture. */
export const item: ItemModel = {
  id: 'sanitizer-stand',
  name: 'เจลล้างมือ',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit: StyleKit) => {
    // a thin box on the tilted plate: u up the plate, z along it, n out of it
    const flat = (u: number, z: number, n: number, sz: number, sh: number, th: number, color: PaletteColor): Part => {
      const at: Vec3 = [PLATE[0] + UP[0] * u + NORMAL[0] * n, PLATE[1] + UP[1] * u + NORMAL[1] * n, z];
      return kit.box([th, sh, sz], at, color, { rotate: [0, 0, TILT] });
    };
    const parts: Part[] = [
      kit.cylinder(0.3, 0.34, 0.05, [0, 0.025, 0], 'charcoal', { segments: 12 }),
      kit.cylinder(0.05, 0.06, POLE_TOP - 0.05, [POLE_X, 0.05 + (POLE_TOP - 0.05) / 2, 0], 'teal', { segments: 10 }),
      // tilted plate and the hand picture
      flat(0, 0, 0, 0.5, 0.36, 0.05, 'teal'),
      flat(0, 0, 0.035, 0.44, 0.3, 0.02, 'sunYellow'),
      flat(-0.06, 0, 0.055, 0.16, 0.13, 0.02, 'pink'),
      flat(0.04, -0.06, 0.055, 0.035, 0.1, 0.02, 'pink'),
      flat(0.06, -0.02, 0.055, 0.035, 0.12, 0.02, 'pink'),
      flat(0.06, 0.02, 0.055, 0.035, 0.12, 0.02, 'pink'),
      flat(0.04, 0.06, 0.055, 0.035, 0.1, 0.02, 'pink'),
      flat(-0.04, 0.13, 0.055, 0.1, 0.035, 0.02, 'pink'),
      flat(-0.12, -0.17, 0.055, 0.05, 0.05, 0.02, 'skyBlue'),
      flat(0.1, 0.17, 0.055, 0.05, 0.05, 0.02, 'white'),
      // big white pump bottle on the pole, orange pump head
      kit.cylinder(0.16, 0.16, 0.04, [POLE_X, POLE_TOP + 0.02, 0], 'charcoal', { segments: 12 }),
      kit.cylinder(0.12, 0.13, 0.34, [POLE_X, POLE_TOP + 0.21, 0], 'white', { segments: 12 }),
      kit.cylinder(0.12, 0.12, 0.05, [POLE_X, POLE_TOP + 0.3, 0], 'mint', { segments: 12 }), // label band
      kit.cylinder(0.06, 0.12, 0.05, [POLE_X, POLE_TOP + 0.405, 0], 'white', { segments: 12 }),
      kit.cylinder(0.035, 0.035, 0.1, [POLE_X, POLE_TOP + 0.48, 0], 'orange', { segments: 8 }),
      kit.box([0.17, 0.04, 0.06], [POLE_X + 0.06, POLE_TOP + 0.55, 0], 'orange'),
      kit.box([0.04, 0.06, 0.05], [POLE_X + 0.13, POLE_TOP + 0.52, 0], 'orange'),
    ];
    return kit.finish(parts);
  },
};
