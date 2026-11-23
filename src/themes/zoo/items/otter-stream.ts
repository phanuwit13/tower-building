import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';
import { ICO_LOW, rod } from '../../../models/parts';

// A little stream running along z between two grassy banks edged with rocks. One otter floats on its back in the
// water (holding a pebble on its tummy); the other sits up on a rock on the +x bank, facing the camera.
const BANK = { w: 0.96, d: 1.96, h: 0.03 };
const WATER = { w: 0.46, d: 1.9, top: 0.07 };
const POND: MotionOpts = { kind: 'water', water: 'pond' };
const ROCK_SQUASH = 0.6;
/** Rocks along the two banks: [x, z, size, colour]. */
const ROCKS: Array<[number, number, number, PaletteColor]> = [
  [0.29, 0.8, 0.1, 'stone'], [0.3, 0.2, 0.08, 'stoneDark'], [0.29, -0.85, 0.1, 'stoneDark'],
  [-0.29, 0.82, 0.1, 'stoneDark'], [-0.3, 0.3, 0.09, 'stone'], [-0.3, -0.3, 0.1, 'stone'], [-0.3, -0.85, 0.1, 'stone'],
];
const OTTER_LIE = { z: 0.3 };
const SIT_ROCK = { x: 0.31, z: -0.5, r: 0.14 };
const SIT_TOP = BANK.h - 0.01 + SIT_ROCK.r * ROCK_SQUASH * (ICO_LOW * 2); // the rock's top

/** ลำธารนาก: a small stream with two otters, one floating on its back and one sitting on a rock. */
export const item: ItemModel = {
  id: 'otter-stream',
  name: 'ลำธารนาก',
  category: 'animal',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BANK.w, BANK.h, BANK.d], [0, BANK.h / 2, 0], 'lime'),
      kit.box([WATER.w, WATER.top - BANK.h + 0.02, WATER.d], [0, (WATER.top + BANK.h - 0.02) / 2, 0], 'navy', { motion: POND }),
    ];
    for (const [x, z, s, color] of ROCKS) {
      parts.push(kit.sphere(s, [x, s * ROCK_SQUASH * ICO_LOW + BANK.h - 0.01, z], color, { detail: 0, scale: [1.2, ROCK_SQUASH, 1.1], rotate: [0, x * z * 9, 0] }));
    }
    // a few reeds and tufts on the -x bank
    for (const [x, z, h] of [[-0.43, 0.1, 0.34], [-0.44, -0.6, 0.3]] as Array<[number, number, number]>) {
      parts.push(kit.cylinder(0.014, 0.02, h, [x, BANK.h + h / 2 - 0.01, z], 'leaf', { segments: 4 }), kit.sphere(0.03, [x, BANK.h + h, z], 'bark', { detail: 0, scale: [1, 1.8, 1] }));
    }

    // --- otter 1: floating on its back (belly up), head towards +z so the camera sees the face ---
    const wy = WATER.top;
    const lz = OTTER_LIE.z;
    parts.push(
      kit.sphere(0.12, [0, wy + 0.02, lz], 'woodDark', { detail: 0, scale: [0.85, 0.55, 1.5] }), // body
      kit.sphere(0.1, [0, wy + 0.06, lz], 'sand', { detail: 0, scale: [0.8, 0.45, 1.3] }), // pale belly up
      kit.sphere(0.095, [0, wy + 0.06, lz + 0.22], 'woodDark', { detail: 0, scale: [1, 0.9, 0.95] }), // head
      kit.sphere(0.055, [0, wy + 0.04, lz + 0.31], 'sand', { detail: 0, scale: [1, 0.8, 1] }), // muzzle
      kit.sphere(0.022, [0, wy + 0.075, lz + 0.355], 'charcoal', { detail: 0 }), // nose
      kit.sphere(0.03, [0.045, wy + 0.145, lz + 0.23], 'white', { detail: 0 }),
      kit.sphere(0.03, [-0.045, wy + 0.145, lz + 0.23], 'white', { detail: 0 }),
      kit.sphere(0.016, [0.045, wy + 0.165, lz + 0.24], 'charcoal', { detail: 0 }),
      kit.sphere(0.016, [-0.045, wy + 0.165, lz + 0.24], 'charcoal', { detail: 0 }),
      kit.sphere(0.035, [0.08, wy + 0.1, lz + 0.17], 'woodDark', { detail: 0 }), // ears
      kit.sphere(0.035, [-0.08, wy + 0.1, lz + 0.17], 'woodDark', { detail: 0 }),
      kit.sphere(0.04, [0.07, wy + 0.1, lz + 0.08], 'woodDark', { detail: 0 }), // paws holding a pebble on the tummy
      kit.sphere(0.04, [-0.07, wy + 0.1, lz + 0.08], 'woodDark', { detail: 0 }),
      kit.sphere(0.045, [0, wy + 0.13, lz + 0.08], 'stoneDark', { detail: 0 }),
      kit.sphere(0.05, [0.07, wy + 0.04, lz - 0.2], 'woodDark', { detail: 0, scale: [0.8, 0.6, 1.3] }), // hind feet
      kit.sphere(0.05, [-0.07, wy + 0.04, lz - 0.2], 'woodDark', { detail: 0, scale: [0.8, 0.6, 1.3] }),
      rod(kit, [0, wy + 0.03, lz - 0.2], [0, wy + 0.03, lz - 0.62], 0.04, 'woodDark', { segments: 6 }), // tail
    );

    // --- otter 2: sitting up on a rock on the bank, facing +x ---
    const { x, z } = SIT_ROCK;
    const ry = SIT_TOP;
    const face = (dx: number, dy: number, dz = 0): Vec3 => [x + dx - 0.04, ry + dy, z + dz]; // the otter sits a little back on the rock
    parts.push(
      kit.sphere(SIT_ROCK.r, [x, SIT_ROCK.r * ROCK_SQUASH * ICO_LOW + BANK.h - 0.01, z], 'stone', { detail: 0, scale: [1.2, ROCK_SQUASH, 1.1] }),
      kit.sphere(0.12, face(-0.02, 0.15), 'wood', { scale: [0.95, 1.25, 0.95] }), // body
      kit.sphere(0.085, face(0.04, 0.14), 'sand', { detail: 0, scale: [0.7, 1.1, 0.9] }), // tummy
      kit.sphere(0.1, face(0.0, 0.37), 'wood'), // head
      kit.sphere(0.06, face(0.09, 0.34), 'sand', { detail: 0, scale: [1, 0.8, 1.1] }), // muzzle
      kit.sphere(0.024, face(0.15, 0.355), 'charcoal', { detail: 0 }),
      kit.sphere(0.03, face(0.08, 0.41, 0.055), 'white', { detail: 0 }),
      kit.sphere(0.03, face(0.08, 0.41, -0.055), 'white', { detail: 0 }),
      kit.sphere(0.017, face(0.105, 0.41, 0.055), 'charcoal', { detail: 0 }),
      kit.sphere(0.017, face(0.105, 0.41, -0.055), 'charcoal', { detail: 0 }),
      kit.sphere(0.035, face(-0.02, 0.46, 0.085), 'woodDark', { detail: 0 }),
      kit.sphere(0.035, face(-0.02, 0.46, -0.085), 'woodDark', { detail: 0 }),
      kit.sphere(0.045, face(0.09, 0.2, 0.1), 'wood', { detail: 0, scale: [1, 1.2, 0.8] }), // little arms up
      kit.sphere(0.045, face(0.09, 0.2, -0.1), 'wood', { detail: 0, scale: [1, 1.2, 0.8] }),
      kit.sphere(0.055, face(0.05, 0.02, 0.08), 'woodDark', { detail: 0, scale: [1.3, 0.5, 0.8] }), // feet
      kit.sphere(0.055, face(0.05, 0.02, -0.08), 'woodDark', { detail: 0, scale: [1.3, 0.5, 0.8] }),
      rod(kit, face(-0.1, 0.05), face(-0.28, 0.03, -0.1), 0.04, 'woodDark', { segments: 6 }), // tail
    );
    return kit.finish(parts);
  },
};
