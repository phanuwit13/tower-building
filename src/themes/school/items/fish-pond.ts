import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';
import { ICO_LOW } from '../../../models/parts';

// An oval pond (longer along z) ringed by low boulders; reeds at the back (-x, -z) so they never hide the water.
const POND = { rx: 0.68, rz: 0.76 }; // water radii
const WATER_H = 0.05;
// The water is `navy`, not `skyBlue`: night light is blue, so a pale blue surface keeps its blue channel
// while the green ground goes dark, and glows at night. Navy stays clearly water by day.
const ROCK_RING = { rx: 0.77, rz: 0.85 };
/** Boulders around the edge, in order round the oval: [size, colour]. */
const ROCKS: Array<[number, PaletteColor]> = [
  [0.12, 'stone'], [0.09, 'stoneDark'], [0.11, 'stone'], [0.12, 'stone'], [0.08, 'stoneDark'], [0.11, 'stone'], [0.1, 'stone'],
  [0.12, 'stoneDark'], [0.11, 'stone'], [0.09, 'stone'], [0.12, 'stoneDark'], [0.1, 'stone'], [0.11, 'stone'], [0.09, 'stoneDark'],
  [0.12, 'stone'], [0.1, 'stone'], [0.11, 'stoneDark'], [0.12, 'stone'], [0.09, 'stone'], [0.11, 'stoneDark'],
];
const ROCK_SQUASH = 0.55;
const PAD = { r: 0.12, h: 0.02, lift: 0.005, notch: 0.55 }; // pads float just above the water; `notch` = the cut's angle (radians)
/** Lily pads: [x, z, size, colour, notch direction (radians)]. */
const PADS: Array<[number, number, number, PaletteColor, number]> = [
  [0.3, 0.24, 1, 'leaf', 0.6], [0.04, 0.46, 0.85, 'lime', 2.2], [-0.2, -0.03, 1.1, 'leaf', 4.0],
  [0.34, -0.3, 0.85, 'lime', 5.2], [-0.04, -0.42, 0.95, 'leaf', 1.2], [0.1, 0.02, 0.7, 'lime', 3.0],
];
/** Water lilies sit on some pads: [pad index, petal colour]. */
const LILIES: Array<[number, PaletteColor]> = [[0, 'white'], [2, 'pink'], [3, 'pink'], [4, 'white']];
const LILY = { r: 0.075, h: 0.05 };
/** Reeds at the back edge: [x, z, height, lean (radians, towards +x)]; each a thin stem with a brown head. */
const REEDS: Array<[number, number, number, number]> = [[-0.44, -0.44, 0.5, 0.05], [-0.33, -0.53, 0.42, 0.12], [-0.52, -0.32, 0.38, -0.08], [-0.24, -0.6, 0.33, 0.15]];
/** Reed leaves: [x, z, height, lean about x, lean about z]. */
const REED_LEAVES: Array<[number, number, number, number, number]> = [[-0.4, -0.5, 0.3, 0.3, 0.25], [-0.47, -0.38, 0.26, -0.25, 0.3], [-0.3, -0.58, 0.24, 0.35, -0.2]];

const WATER: MotionOpts = { kind: 'water', water: 'pond' }; // the surface and the lily-pad notches (water-coloured) shimmer together

/** บ่อบัว: a small stone-rimmed pond with lily pads and a few white and pink water lilies. */
export const item: ItemModel = {
  id: 'fish-pond',
  name: 'บ่อบัว',
  category: 'nature',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(1, 1, WATER_H, [0, WATER_H / 2, 0], 'navy', { segments: 16, scale: [POND.rx, 1, POND.rz], motion: WATER }),
    ];
    ROCKS.forEach(([s, color], k) => {
      const a = (k / ROCKS.length) * Math.PI * 2;
      parts.push(kit.sphere(s, [ROCK_RING.rx * Math.cos(a), s * ROCK_SQUASH * ICO_LOW, ROCK_RING.rz * Math.sin(a)], color,
        { detail: 0, scale: [1.3, ROCK_SQUASH, 1.15], rotate: [0, -a + 0.5 * (k % 3), 0] }));
    });
    const padTop = WATER_H + PAD.lift + PAD.h;
    for (const [x, z, s, color, notch] of PADS) {
      const r = PAD.r * s;
      parts.push(
        kit.cylinder(r, r, PAD.h, [x, padTop - PAD.h / 2, z], color, { segments: 8 }),
        // the lily-pad notch: a flat water-coloured triangle laid on the pad, from the middle to the edge
        kit.wedge([r * 2 * Math.tan(PAD.notch / 2), r * 1.02, 0.006], [x + (r / 2) * Math.cos(notch), padTop + 0.004, z - (r / 2) * Math.sin(notch)], 'navy',
          { rotate: [-Math.PI / 2, 0, Math.PI / 2 + notch], motion: WATER }),
      );
    }
    for (const [i, color] of LILIES) {
      const [x, z] = PADS[i];
      // Upside-down four-sided cones show a flat four-pointed star on top. Two turned 45° apart make
      // eight petals; a smaller, higher pair turned in between makes the inner petals.
      const star = (r: number, top: number, turns: number[]) => {
        for (const turn of turns) parts.push(kit.cone(r, LILY.h, [x, top - LILY.h / 2, z], color, { segments: 4, rotate: [Math.PI, turn, 0] }));
      };
      star(LILY.r, padTop + LILY.h * 0.7, [0, Math.PI / 4]);
      star(LILY.r * 0.62, padTop + LILY.h * 0.7 + 0.02, [Math.PI / 8, (3 * Math.PI) / 8]);
      parts.push(kit.sphere(0.024, [x, padTop + LILY.h * 0.7 + 0.025, z], 'sunYellow', { detail: 0 }));
    }
    for (const [x, z, h, lean] of REEDS) {
      const lift = 0.02 * Math.sin(Math.abs(lean)); // a leaning stem's foot dips: keep it out of the ground
      const tx = (h / 2) * Math.sin(lean);
      parts.push(
        kit.cylinder(0.016, 0.02, h, [x + tx, h / 2 * Math.cos(lean) + lift, z], 'leaf', { segments: 4, rotate: [0, 0, -lean] }),
        kit.cylinder(0.032, 0.032, 0.1, [x + 2 * tx * 0.94, h * Math.cos(lean) - 0.03, z], 'woodDark', { segments: 6, rotate: [0, 0, -lean] }),
      );
    }
    for (const [x, z, h, lx, lz] of REED_LEAVES) {
      parts.push(kit.cone(0.03, h, [x, h / 2 + 0.01, z], 'leafDark', { segments: 4, rotate: [lx, 0, lz] }));
    }
    return kit.finish(parts);
  },
};
