import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import type { MotionOpts } from '../../../models/motion';
import { aim, along, heading } from '../../../models/parts';

const TRUNK_TOP = 1.45;
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, TRUNK_TOP, 0], amount: 0.07 };
const FANS = 5;
const FAN = { reach: 0.1, rise: 0.12, blade: 0.28, width: 0.1, thick: 0.025, pitch: 0.12 };
const SPREAD = [-0.52, -0.26, 0, 0.26, 0.52]; // blade turns about the fan hub: a half-round fan
const FAN_COLOURS: PaletteColor[] = ['lime', 'leaf', 'leafDark', 'leaf', 'lime'];

/** ต้นปาล์มพัด: a tall bare trunk with a few big flat fan leaves spread round the top. */
export const item: ItemModel = {
  id: 'fan-palm',
  name: 'ต้นปาล์มพัด',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [kit.cylinder(0.065, 0.1, TRUNK_TOP, [0, TRUNK_TOP / 2, 0], 'wood', { segments: 7 })];
    for (const y of [0.25, 0.5, 0.75, 1.0, 1.25]) parts.push(kit.cylinder(0.08 - y * 0.015, 0.085 - y * 0.015, 0.04, [0, y, 0], 'woodDark', { segments: 7 }));
    parts.push(kit.sphere(0.09, [0, TRUNK_TOP + 0.02, 0], 'bark', { detail: 0, motion: SWAY }));
    for (let i = 0; i < FANS; i++) {
      const yaw = (i / FANS) * Math.PI * 2 + 0.3;
      const d = heading(yaw, 0);
      const hub: [number, number, number] = [d[0] * FAN.reach, TRUNK_TOP + FAN.rise + (i % 2) * 0.05, d[2] * FAN.reach];
      // stalk from the crown to the hub of the fan
      const from: [number, number, number] = [0, TRUNK_TOP, 0];
      const mid: [number, number, number] = [(hub[0] + from[0]) / 2, (hub[1] + from[1]) / 2, (hub[2] + from[2]) / 2];
      parts.push(kit.cylinder(0.02, 0.02, Math.hypot(hub[0], hub[1] - from[1], hub[2]), mid, 'leafDark', {
        segments: 5, rotate: aim([hub[0] - from[0], hub[1] - from[1], hub[2] - from[2]]), motion: SWAY,
      }));
      SPREAD.forEach((s, k) => {
        const dir = heading(yaw + s, FAN.pitch);
        parts.push(kit.box([FAN.blade, FAN.thick, FAN.width], along(hub, dir, FAN.blade / 2), FAN_COLOURS[(i + k) % FAN_COLOURS.length], {
          rotate: [0, yaw + s, FAN.pitch], motion: SWAY,
        }));
      });
    }
    for (const [x, z] of [[0.07, 0.05], [-0.06, 0.07], [0.02, -0.08]] as const) {
      parts.push(kit.sphere(0.035, [x, TRUNK_TOP - 0.07, z], 'orange', { detail: 0, motion: SWAY }));
    }
    return kit.finish(parts);
  },
};
