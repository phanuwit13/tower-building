import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';
import { along, heading } from '../../../models/parts';

// Five banana plants in a 2×3 grove. Each plant sways from the top of its pale stem (the stem stays); the big
// arching leaves leave a gap on the camera side (+x+z) so the hanging bunch of bananas shows.
const STEM_H = 0.72;
const STEM_R = { top: 0.065, bottom: 0.085 };
const LEAF_T = 0.02;
/** Each leaf: two flat diamonds, rising then drooping: [length, width, pitch]. */
const LEAF_PIECES: Array<[number, number, number]> = [[0.24, 0.2, 0.35], [0.22, 0.2, -0.65]];
const LEAVES = 5;
const CAMERA_YAW = -Math.PI / 4; // the direction (+x+z) the default camera looks from; yaw 0 = +x, turning towards -z
const GAP = 1.1; // half-width of the leafless gap (radians) round the camera side
/** Plant centres (x, z) and the bunch's yaw offset, so the plants are not identical. */
const PLANTS: Array<[number, number, number]> = [[0.38, -1.0, 0.25], [-0.4, -0.5, -0.2], [0.4, 0.05, 0.15], [-0.4, 0.55, -0.25], [0.38, 1.02, 0.2]];

function leafPiece(kit: StyleKit, start: Vec3, yaw: number, [len, width, pitch]: [number, number, number], color: PaletteColor, motion: MotionOpts): [Part, Vec3] {
  const d = heading(yaw, pitch);
  const part = kit.cylinder(1, 1, LEAF_T, along(start, d, len / 2), color, { segments: 4, scale: [len / 2, 1, width / 2], rotate: [0, yaw, pitch], motion });
  return [part, along(start, d, len * 0.85)];
}

/** สวนกล้วย: banana plants with big arching leaves and hanging bunches. */
export const item: ItemModel = {
  id: 'banana-grove',
  name: 'สวนกล้วย',
  category: 'nature',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [];
    PLANTS.forEach(([x, z, bunchTurn], i) => {
      const sway: MotionOpts = { kind: 'sway', pivot: [x, STEM_H, z], amount: 0.3, phase: i * 0.9 };
      parts.push(
        kit.cylinder(STEM_R.top, STEM_R.bottom, STEM_H, [x, STEM_H / 2, z], 'lime', { segments: 8 }),
        kit.cylinder(STEM_R.bottom + 0.015, STEM_R.bottom + 0.02, 0.05, [x, 0.025, z], 'woodDark', { segments: 8 }),
      );
      for (let k = 0; k < LEAVES; k++) {
        const yaw = CAMERA_YAW + GAP + (k + 0.3 * (i % 2)) * ((2 * Math.PI - 2 * GAP) / LEAVES) + 0.1;
        const color: PaletteColor = (k + i) % 2 === 0 ? 'leaf' : 'leafDark';
        let p = along([x, STEM_H + 0.01, z], heading(yaw, 0), 0.03);
        for (const piece of LEAF_PIECES) {
          const [part, next] = leafPiece(kit, p, yaw, piece, color, sway);
          parts.push(part);
          p = next;
        }
      }
      // The bunch hangs on the camera side from a short stalk: a ring of curved bananas and a purple flower bud.
      const by = CAMERA_YAW + bunchTurn;
      const [bx, , bz] = along([x, 0, z], heading(by, 0), 0.14);
      parts.push(
        kit.cylinder(0.018, 0.018, 0.18, [bx, STEM_H - 0.07, bz], 'leafDark', { segments: 4 }),
        kit.sphere(0.055, [bx, 0.38, bz], 'purple', { detail: 0, scale: [1, 1.5, 1] }),
      );
      for (let b = 0; b < 6; b++) {
        const a = (b / 6) * Math.PI * 2 + i;
        parts.push(kit.sphere(0.045, [bx + Math.cos(a) * 0.055, 0.5, bz - Math.sin(a) * 0.055], b % 3 === 0 ? 'lime' : 'sunYellow', { detail: 0, scale: [1, 2.1, 1], rotate: [Math.sin(a) * 0.35, 0, Math.cos(a) * 0.35] }));
      }
    });
    return kit.finish(parts);
  },
};
