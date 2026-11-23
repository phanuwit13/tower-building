import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { barrelRoof, rod, wheel } from '../../../models/parts';

// A red two-wheeled rickshaw parked on a little pad, nose to +z, with a folding hood over a cream seat,
// two long shafts with a handle bar and a warm lamp on each side.
const PAD = 0.03;
const WR = 0.22; // wheel radius
const TUBE = 0.04;
const WX = 0.36; // wheel offset from the centre line
const AXLE_Z = -0.2;

/** รถลาก: a red two-wheeled rickshaw with a hood. */
export const item: ItemModel = {
  id: 'rickshaw',
  name: 'รถลาก',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const hubY = PAD + WR + TUBE;
    const parts: Part[] = [kit.box([0.9, PAD, 1.94], [0, PAD / 2, 0], 'stone')];
    for (const s of [1, -1]) {
      parts.push(...wheel(kit, { at: [s * WX, hubY, AXLE_Z], radius: WR, tube: TUBE, axis: 'x', color: 'charcoal', hubColor: 'sunYellow', spokes: 2, spokeColor: 'white', radialSegments: 4, tubularSegments: 10 }));
    }
    parts.push(
      kit.cylinder(0.025, 0.025, 2 * WX, [0, hubY, AXLE_Z], 'stoneDark', { segments: 6, rotate: [0, 0, Math.PI / 2] }), // axle
      // tub: floor, sides, back and front dash in red; cream seat and back rest
      kit.box([0.56, 0.06, 0.7], [0, 0.34, -0.2], 'redDark'),
      kit.box([0.06, 0.2, 0.7], [-0.25, 0.46, -0.2], 'red'),
      kit.box([0.06, 0.2, 0.7], [0.25, 0.46, -0.2], 'red'),
      kit.box([0.56, 0.3, 0.06], [0, 0.5, -0.52], 'red'),
      kit.box([0.44, 0.08, 0.4], [0, 0.42, -0.34], 'cream'),
      kit.box([0.44, 0.24, 0.07], [0, 0.56, -0.5], 'cream'),
      kit.box([0.56, 0.16, 0.06], [0, 0.45, 0.17], 'red'), // front dash
      kit.box([0.56, 0.03, 0.08], [0, 0.55, 0.17], 'sunYellow'),
      // folding hood over the seat: ribs of a barrel roof, arch in the z-y plane
      ...barrelRoof(kit, { at: [0, 0.6, -0.33], length: 0.62, width: 0.66, rise: 0.3, color: 'red', along: 'x', segments: 6, spring: 0.1 }),
      kit.box([0.64, 0.03, 0.05], [0, 0.66, -0.33 + 0.33], 'sunYellow'),
    );
    // shafts forward to a handle bar, resting on the ground-ward end
    for (const s of [1, -1]) {
      parts.push(rod(kit, [s * 0.2, 0.36, 0.0], [s * 0.18, 0.2, 0.85], 0.022, 'woodDark', { segments: 6 }));
      parts.push(kit.sphere(0.055, [s * 0.3, 0.52, 0.2], 'lampWarm', { glow: true, detail: 0 }));
    }
    parts.push(kit.box([0.5, 0.04, 0.04], [0, 0.2, 0.85], 'woodDark'));
    // mudguards over the wheels
    for (const s of [1, -1]) parts.push(kit.box([0.04, 0.03, 0.46], [s * (WX + 0.02), hubY + WR + 0.04, AXLE_Z], 'redDark'));
    return kit.finish(parts);
  },
};
