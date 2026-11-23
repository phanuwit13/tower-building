import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A friendly classic flying saucer, landed on three legs (2×2). Chrome disc, teal bands, a sky-blue cockpit
// dome with and four rim lights that blink. No beams.
const BODY_Y = 0.55; // centre of the disc
const RIM_R = 0.95; // on the outer face of the teal band
const LEGS = [0.4, 0.4 + (Math.PI * 2) / 3, 0.4 + (Math.PI * 4) / 3];

/** จานบินมาเยือน: a friendly saucer on legs with blinking rim lights. */
export const item: ItemModel = {
  id: 'ufo-visitor',
  name: 'จานบินมาเยือน',
  category: 'vehicle',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      // hull: lower belly, wide rim band, upper skirt
      kit.cylinder(0.5, 0.3, 0.14, [0, BODY_Y - 0.14, 0], 'stoneDark', { segments: 16 }),
      kit.cylinder(0.92, 0.92, 0.1, [0, BODY_Y - 0.02, 0], 'teal', { segments: 16 }),
      kit.cylinder(0.5, 0.92, 0.16, [0, BODY_Y + 0.11, 0], 'chrome', { segments: 16 }),
      // cockpit
      kit.dome(0.4, [0, BODY_Y + 0.19, 0], 'skyBlue', { segments: 12, scale: [1, 0.9, 1] }),
      // little roof antenna with an orange ball
      rod(kit, [0, BODY_Y + 0.55, 0], [0, BODY_Y + 0.72, 0], 0.015, 'stoneDark', { segments: 4 }),
      kit.sphere(0.04, [0, BODY_Y + 0.74, 0], 'orange', { detail: 0 }),
    ];
    // rim lights
    const cols = ['sunYellow', 'pink', 'sunYellow', 'pink'] as const;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      parts.push(kit.sphere(0.075, [Math.cos(a) * RIM_R, BODY_Y - 0.02, -Math.sin(a) * RIM_R], cols[i], { detail: 0, glow: true, light: 'blink' }));
    }
    // three landing legs with foot pads
    for (const a of LEGS) {
      const top: Vec3 = [Math.cos(a) * 0.45, BODY_Y - 0.12, -Math.sin(a) * 0.45];
      const foot: Vec3 = [Math.cos(a) * 0.68, 0.03, -Math.sin(a) * 0.68];
      parts.push(rod(kit, top, foot, 0.04, 'stone', { segments: 6 }));
      parts.push(kit.cylinder(0.1, 0.12, 0.03, [foot[0], 0.015, foot[2]], 'orange', { segments: 8 }));
    }
    return kit.finish(parts);
  },
};
