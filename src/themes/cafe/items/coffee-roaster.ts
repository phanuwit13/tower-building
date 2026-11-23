import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

// A copper roaster cabinet (drum, hopper, chimney) beside a round cooling tray whose stirring arm spins.
const TRAY = { x: 0.4, z: 0.35, r: 0.55, floorY: 0.47 };
const ARM_Y = 0.6;
const SPIN: MotionOpts = { kind: 'spin', pivot: [TRAY.x, ARM_Y, TRAY.z], speed: 0.4 }; // one pivot: the tray's centre
const CAB = { w: 0.8, h: 0.55, d: 1.4, x: -0.55, z: -0.2 };

/** เครื่องคั่วกาแฟ: a copper drum roaster with a round cooling tray and a turning stirring arm. */
export const item: ItemModel = {
  id: 'coffee-roaster',
  name: 'เครื่องคั่วกาแฟ',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const cabTop = CAB.h;
    const parts: Part[] = [
      kit.box([CAB.w, CAB.h, CAB.d], [CAB.x, CAB.h / 2, CAB.z], 'terracotta'),
      kit.box([CAB.w + 0.04, 0.04, CAB.d + 0.04], [CAB.x, CAB.h + 0.02, CAB.z], 'brass'),
      // drum on the cabinet, door facing +x
      kit.cylinder(0.3, 0.3, 0.55, [CAB.x - 0.02, cabTop + 0.34, CAB.z + 0.1], 'brass', { segments: 12, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.31, 0.31, 0.04, [CAB.x + 0.27, cabTop + 0.34, CAB.z + 0.1], 'terracotta', { segments: 12, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.13, 0.13, 0.03, [CAB.x + 0.3, cabTop + 0.34, CAB.z + 0.1], 'glassBlue', { segments: 10, rotate: [0, 0, Math.PI / 2] }),
      kit.sphere(0.04, [CAB.x + 0.33, cabTop + 0.34, CAB.z + 0.1], 'bark', { detail: 0 }),
      // hopper and chimney
      kit.cylinder(0.22, 0.06, 0.3, [CAB.x - 0.1, cabTop + 0.85, CAB.z + 0.1], 'chrome', { segments: 10 }),
      kit.cylinder(0.07, 0.07, 0.85, [CAB.x - 0.3, cabTop + 0.5, CAB.z - 0.5], 'charcoal', { segments: 8 }),
      kit.cylinder(0.09, 0.09, 0.05, [CAB.x - 0.3, cabTop + 0.95, CAB.z - 0.5], 'stoneDark', { segments: 8 }),
      // control panel and dials on the front
      kit.box([0.04, 0.22, 0.6], [CAB.x + CAB.w / 2 + 0.02, 0.3, CAB.z - 0.35], 'charcoal'),
      kit.cylinder(0.05, 0.05, 0.03, [CAB.x + CAB.w / 2 + 0.055, 0.34, CAB.z - 0.5], 'sunYellow', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.05, 0.05, 0.03, [CAB.x + CAB.w / 2 + 0.055, 0.34, CAB.z - 0.35], 'red', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.05, 0.05, 0.03, [CAB.x + CAB.w / 2 + 0.055, 0.34, CAB.z - 0.2], 'lime', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      // cooling tray on a pedestal: floor, bean bed, rim
      kit.cylinder(0.3, 0.3, 0.05, [TRAY.x, 0.025, TRAY.z], 'charcoal', { segments: 12 }),
      kit.cylinder(0.12, 0.12, 0.42, [TRAY.x, 0.25, TRAY.z], 'charcoal', { segments: 8 }),
      kit.cylinder(TRAY.r, TRAY.r, 0.04, [TRAY.x, TRAY.floorY, TRAY.z], 'chrome', { segments: 16 }),
      kit.cylinder(TRAY.r - 0.04, TRAY.r - 0.04, 0.05, [TRAY.x, TRAY.floorY + 0.03, TRAY.z], 'bark', { segments: 16 }),
      kit.torus(TRAY.r - 0.01, 0.03, [TRAY.x, TRAY.floorY + 0.035, TRAY.z], 'stoneDark', { radialSegments: 4, tubularSegments: 16, rotate: [Math.PI / 2, 0, 0] }),
      // stirring arm: spans +-0.45, inside the rim's inner radius (0.52); all parts share SPIN
      kit.box([0.9, 0.03, 0.06], [TRAY.x, ARM_Y, TRAY.z], 'brass', { motion: SPIN }),
      kit.box([0.05, 0.05, 0.12], [TRAY.x + 0.4, ARM_Y - 0.03, TRAY.z], 'sunYellow', { motion: SPIN }),
      kit.box([0.05, 0.05, 0.12], [TRAY.x - 0.4, ARM_Y - 0.03, TRAY.z], 'sunYellow', { motion: SPIN }),
      kit.cylinder(0.05, 0.05, 0.1, [TRAY.x, ARM_Y + 0.03, TRAY.z], 'chrome', { segments: 8, motion: SPIN }),
    ];
    // bean sacks on the floor
    for (const [x, z, c] of [[0.1, -0.7, 'sand'], [0.42, -0.65, 'wood']] as const) {
      parts.push(
        kit.cylinder(0.15, 0.17, 0.3, [x, 0.15, z], c, { segments: 8 }),
        kit.sphere(0.06, [x, 0.31, z], 'terracotta', { detail: 0 }),
      );
    }
    return kit.finish(parts);
  },
};
