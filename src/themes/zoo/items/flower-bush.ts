import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';
import { aim } from '../../../models/parts';

// A round green bush covered in bright flat flowers. The whole bush sways a little about the soil line; the soil ring stays.
const SOIL = { r: 0.45, h: 0.04 };
const BUSH = { r: 0.37, y: 0.34, squash: 0.85 };
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, SOIL.h, 0], amount: 0.12 };
const PETALS: PaletteColor[] = ['pink', 'sunYellow', 'red', 'purple', 'orange', 'white'];
const FLOWERS = 12;
const GOLDEN = 2.399963; // golden angle: spreads the flowers evenly over the bush

/** พุ่มดอกไม้: a round bush covered in bright flowers. */
export const item: ItemModel = {
  id: 'flower-bush',
  name: 'พุ่มดอกไม้',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(SOIL.r, SOIL.r, SOIL.h, [0, SOIL.h / 2, 0], 'bark', { segments: 12 }),
      kit.sphere(BUSH.r, [0, BUSH.y, 0], 'leaf', { scale: [1, BUSH.squash, 1], motion: SWAY }),
      kit.sphere(0.24, [0.12, BUSH.y - 0.08, 0.12], 'leafDark', { detail: 0, scale: [1.2, 0.8, 1.2], motion: SWAY }),
    ];
    for (let k = 0; k < FLOWERS; k++) {
      // the upper hemisphere, from the top down to just above the equator
      const t = (k + 0.5) / FLOWERS;
      const elev = Math.asin(0.95 - t * 0.85);
      const az = k * GOLDEN;
      const n: [number, number, number] = [Math.cos(elev) * Math.cos(az), Math.sin(elev), Math.cos(elev) * Math.sin(az)];
      const surface: [number, number, number] = [n[0] * BUSH.r, BUSH.y + n[1] * BUSH.r * BUSH.squash, n[2] * BUSH.r];
      // flowers stand out of the leaves along the surface normal (an ellipsoid's normal is the gradient)
      const normal: [number, number, number] = [n[0], n[1] / BUSH.squash, n[2]];
      const len = Math.hypot(...normal);
      const dir: [number, number, number] = [normal[0] / len, normal[1] / len, normal[2] / len];
      const at = (d: number): [number, number, number] => [surface[0] + dir[0] * d, surface[1] + dir[1] * d, surface[2] + dir[2] * d];
      parts.push(
        kit.cylinder(0.068, 0.068, 0.03, at(0.01), PETALS[k % PETALS.length], { segments: 6, rotate: aim(dir), motion: SWAY }),
        kit.sphere(0.03, at(0.035), PETALS[k % PETALS.length] === 'sunYellow' ? 'orange' : 'sunYellow', { detail: 0, motion: SWAY }),
      );
    }
    return kit.finish(parts);
  },
};
