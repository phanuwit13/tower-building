import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A small round landing pad (2x2) with a little egg-shaped shuttle and four blinking corner beacons.
const PAD = { r: 0.95, h: 0.05 };
const RING = { r: 0.8, h: 0.065 };
const INNER = { r: 0.72, h: 0.07 };
const BEACON_AT = 0.62; // x and z of each corner beacon

export const item: ItemModel = {
  id: 'landing-pad-small',
  name: 'ลานจอดยานเล็ก',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const y = INNER.h;
    const parts: Part[] = [
      kit.cylinder(PAD.r, PAD.r, PAD.h, [0, PAD.h / 2, 0], 'stone', { segments: 16 }),
      kit.cylinder(RING.r, RING.r, RING.h, [0, RING.h / 2, 0], 'sunYellow', { segments: 16 }),
      kit.cylinder(INNER.r, INNER.r, INNER.h, [0, INNER.h / 2, 0], 'charcoal', { segments: 16 }),
      // a cross mark in the middle
      kit.box([0.9, 0.012, 0.08], [0, INNER.h + 0.006, 0.0], 'white'),
      // shuttle: egg body, cone nose, fins on legs
      kit.sphere(0.27, [0, y + 0.42, 0], 'white', { scale: [1, 1.35, 1] }),
      kit.cone(0.2, 0.3, [0, y + 0.91, 0], 'red'),
      kit.cylinder(0.275, 0.275, 0.08, [0, y + 0.3, 0], 'blue', { segments: 12 }),
      kit.sphere(0.09, [0.22, y + 0.5, 0], 'skyBlue', { glow: 'windowWarm', light: 'window', scale: [0.6, 1, 1] }),
      kit.sphere(0.09, [0, y + 0.5, 0.22], 'skyBlue', { glow: 'windowWarm', light: 'window', scale: [1, 1, 0.6] }),
    ];
    // three little legs with foot pads
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
      const lx = Math.cos(a) * 0.27;
      const lz = Math.sin(a) * 0.27;
      parts.push(
        kit.box([0.1, 0.22, 0.04], [lx * 0.8, y + 0.11 + 0.04, lz * 0.8], 'orange', { rotate: [0, -a, 0] }),
        kit.cylinder(0.07, 0.07, 0.03, [lx, y + 0.015, lz], 'orange', { segments: 8 }),
      );
    }
    // four corner beacons
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const bx = sx * BEACON_AT;
        const bz = sz * BEACON_AT;
        parts.push(
          kit.cylinder(0.05, 0.07, 0.12, [bx, PAD.h + 0.06, bz], 'stoneDark', { segments: 8 }),
          kit.sphere(0.07, [bx, PAD.h + 0.16, bz], 'red', { detail: 0, glow: true, light: 'blink' }),
        );
      }
    }
    return kit.finish(parts);
  },
};
