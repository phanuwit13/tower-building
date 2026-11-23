import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import type { MotionOpts } from '../../../models/motion';
import { aim, heading } from '../../../models/parts';

const TRUNK_TOP = 1.4;
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, TRUNK_TOP, 0], amount: 0.07 };
const FANS = 8;
const FAN = { r: 0.25, reach: 0.17, tilt: 0.35 }; // a round fan leaf, its centre `reach` out and tilted up at the edge
const FAN_COLOURS: PaletteColor[] = ['lime', 'leaf', 'leafDark', 'leaf'];

/** ต้นปาล์มพัด: a palm with big round fan leaves. */
export const item: ItemModel = {
  id: 'fan-palm',
  name: 'ต้นปาล์มพัด',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.07, 0.11, TRUNK_TOP, [0, TRUNK_TOP / 2, 0], 'wood', { segments: 7 }),
    ];
    for (const y of [0.25, 0.5, 0.75, 1.0, 1.25]) parts.push(kit.cylinder(0.085 - y * 0.02, 0.09 - y * 0.02, 0.04, [0, y, 0], 'woodDark', { segments: 7 }));
    parts.push(kit.sphere(0.1, [0, TRUNK_TOP + 0.02, 0], 'bark', { detail: 0, motion: SWAY }));
    for (let i = 0; i < FANS; i++) {
      const yaw = (i / FANS) * Math.PI * 2 + 0.2;
      const d = heading(yaw, 0);
      // normal leans back towards the trunk, so the outer edge of the disc is the high one
      const n: [number, number, number] = [-d[0] * Math.sin(FAN.tilt), Math.cos(FAN.tilt), -d[2] * Math.sin(FAN.tilt)];
      const lift = i % 2 === 0 ? 0.05 : 0.12;
      const c: [number, number, number] = [d[0] * FAN.reach, TRUNK_TOP + lift + Math.sin(FAN.tilt) * FAN.reach * 0.5, d[2] * FAN.reach];
      parts.push(
        kit.cylinder(FAN.r, FAN.r, 0.03, c, FAN_COLOURS[i % FAN_COLOURS.length], { segments: 10, rotate: aim(n, 'y'), motion: SWAY }),
      );
    }
    // a bunch of little fruits under the fans
    for (const [x, z] of [[0.08, 0.06], [-0.07, 0.08], [0.02, -0.09]] as const) {
      parts.push(kit.sphere(0.035, [x, TRUNK_TOP - 0.06, z], 'orange', { detail: 0, motion: SWAY }));
    }
    return kit.finish(parts);
  },
};
