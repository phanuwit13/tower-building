import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { aim } from '../../../models/parts';

/** A round window (porthole) at `c`, facing the unit direction `n`: a frame ring and a glass disc that glows at night. */
function porthole(kit: StyleKit, c: Vec3, n: Vec3, r: number, frame: PaletteColor, glow: PaletteColor): Part[] {
  const len = Math.hypot(n[0], n[1], n[2]);
  const u: Vec3 = [n[0] / len, n[1] / len, n[2] / len];
  const rotate = aim(u);
  const at = (d: number): Vec3 => [c[0] + u[0] * d, c[1] + u[1] * d, c[2] + u[2] * d];
  return [
    kit.cylinder(r + 0.03, r + 0.03, 0.03, at(0), frame, { segments: 10, rotate }),
    kit.cylinder(r, r, 0.03, at(0.012), 'skyBlue', { segments: 10, rotate, glow, light: 'window' }),
  ];
}

// A straight tube corridor (1×2, runs along z so several link end to end). A white tube on two cradles,
// orange end flanges so neighbours join cleanly, a teal belt, and round windows on both long sides.
const R = 0.38;
const CY = 0.44; // tube axis height
const HALF = 0.95; // the tube runs z ∈ [−HALF, HALF]
const SEG = 16;
const WALL = R * Math.cos(Math.PI / SEG);

/** ทางเดินอุโมงค์: a straight tube corridor with round windows. */
export const item: ItemModel = {
  id: 'tube-corridor',
  name: 'ทางเดินอุโมงค์',
  category: 'building',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const ALONG_Z: Vec3 = [Math.PI / 2, 0, 0];
    const parts: Part[] = [
      kit.cylinder(R, R, HALF * 2, [0, CY, 0], 'white', { segments: SEG, rotate: ALONG_Z }),
      // end flanges (orange rings round the tube ends)
      kit.cylinder(R + 0.05, R + 0.05, 0.1, [0, CY, HALF - 0.05], 'orange', { segments: SEG, rotate: ALONG_Z }),
      kit.cylinder(R + 0.05, R + 0.05, 0.1, [0, CY, -HALF + 0.05], 'orange', { segments: SEG, rotate: ALONG_Z }),
      kit.cylinder(R + 0.025, R + 0.025, 0.16, [0, CY, 0], 'teal', { segments: SEG, rotate: ALONG_Z }),
      // cradles under the tube
      kit.box([0.72, 0.1, 0.22], [0, 0.05, 0.62], 'stoneDark'),
      kit.box([0.72, 0.1, 0.22], [0, 0.05, -0.62], 'stoneDark'),
      kit.box([0.2, 0.12, 0.2], [0, 0.1, 0.62], 'charcoal'),
      kit.box([0.2, 0.12, 0.2], [0, 0.1, -0.62], 'charcoal'),
      // a hatch on top
      kit.cylinder(0.1, 0.1, 0.05, [0, CY + R, 0.4], 'orange', { segments: 10 }),
    ];
    // round windows, tilted a little up so the +x side and the top read from the camera
    const tilt = 0.5;
    for (const side of [1, -1]) {
      for (const z of [-0.62, -0.25, 0.25, 0.62]) {
        const n: Vec3 = [side * Math.cos(tilt), Math.sin(tilt), 0];
        const reach = WALL * 0.99;
        parts.push(...porthole(kit, [n[0] * reach, CY + n[1] * reach, z], n, 0.1, 'orange', Math.abs(z) < 0.5 ? 'teal' : 'windowWarm'));
      }
    }
    return kit.finish(parts);
  },
};
