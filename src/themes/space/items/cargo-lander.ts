import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

const BODY = { x: 1.0, y0: 0.32, y1: 0.8, z: 1.1 }; // the boxy cargo hold
const FOOT = { x: 0.78, z: 0.8, r: 0.16, h: 0.05 }; // landing feet positions and size
const RAMP = { w: 0.56, x0: 0.5, x1: 0.97, y0: 0.32, y1: 0.03 }; // ramp from the hold floor to the ground (+x)

/** ยานขนส่งลงจอด: a boxy cargo lander with its ramp down and blinking lights. */
export const item: ItemModel = {
  id: 'cargo-lander',
  name: 'ยานขนส่งลงจอด',
  category: 'vehicle',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const midY = (BODY.y0 + BODY.y1) / 2;
    const rampLen = Math.hypot(RAMP.x1 - RAMP.x0, RAMP.y0 - RAMP.y1);
    const rampAng = Math.atan2(RAMP.y0 - RAMP.y1, RAMP.x1 - RAMP.x0);
    const parts: Part[] = [
      kit.box([BODY.x, BODY.y1 - BODY.y0, BODY.z], [0, midY, 0], 'white'),
      // blue belt and orange nose block
      kit.box([BODY.x + 0.04, 0.12, BODY.z + 0.04], [0, 0.45, 0], 'blue'),
      kit.box([0.5, 0.1, 0.8], [-0.1, BODY.y1 + 0.05, 0], 'orange'),
      // cargo boxes on top
      kit.box([0.3, 0.22, 0.3], [-0.12, BODY.y1 + 0.21, 0.2], 'teal'),
      kit.box([0.26, 0.18, 0.26], [-0.12, BODY.y1 + 0.19, -0.22], 'sunYellow'),
      // open door / dark bay on the +x face, with the ramp running out of it
      kit.box([0.02, 0.34, 0.6], [BODY.x / 2 + 0.01, 0.52, 0], 'charcoal'),
      kit.box([rampLen, 0.05, RAMP.w], [(RAMP.x0 + RAMP.x1) / 2, (RAMP.y0 + RAMP.y1) / 2 + 0.02, 0], 'orange', { rotate: [0, 0, -rampAng] }),
    ];
    // cockpit window on the front (+z) end, glowing at night
    parts.push(kit.box([0.5, 0.2, 0.03], [0.0, 0.6, BODY.z / 2 + 0.015], 'skyBlue', { glow: 'windowWarm', light: 'window' }));
    // landing legs and round orange feet
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        parts.push(
          rod(kit, [sx * 0.42, 0.4, sz * 0.46], [sx * FOOT.x, 0.06, sz * FOOT.z], 0.05, 'charcoal', { segments: 6 }),
          kit.cylinder(FOOT.r, FOOT.r, FOOT.h, [sx * FOOT.x, FOOT.h / 2, sz * FOOT.z], 'orange', { segments: 8 }),
        );
      }
    }
    // three blinking beacons
    for (const [x, z, c] of [[0.42, 0.5, 'red'], [0.42, -0.5, 'red'], [-0.45, 0, 'sunYellow']] as const) {
      parts.push(kit.sphere(0.06, [x, BODY.y1 + 0.03, z], c, { detail: 0, glow: true, light: 'blink' }));
    }
    return kit.finish(parts);
  },
};
