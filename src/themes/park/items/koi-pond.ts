import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// 2×2. A rock-edged round pond with orange, white and gold koi and lily pads.
const WATER = { r: 0.72, top: 0.06 };
const RING = 0.83;
/** Koi: [x, z, yaw, body colour, patch colour]. */
const KOI: Array<[number, number, number, PaletteColor, PaletteColor]> = [
  [0.2, 0.3, 0.5, 'orange', 'white'], [-0.3, 0.15, 2.6, 'white', 'orange'], [0.0, -0.35, 4.1, 'sunYellow', 'white'],
  [-0.2, -0.3, 5.3, 'orange', 'orange'], [0.35, -0.1, 3.2, 'white', 'red'], [-0.1, 0.5, 1.2, 'sunYellow', 'orange'],
];
/** Lily pads: [x, z, radius, flower?]. */
const PADS: Array<[number, number, number, boolean]> = [[-0.45, 0.35, 0.13, true], [0.4, 0.45, 0.1, false], [0.45, -0.4, 0.12, true], [-0.4, -0.5, 0.09, false], [0.05, 0.05, 0.08, false]];
/** Rim rocks in order round the pond: [size, colour]. */
const ROCKS: Array<[number, PaletteColor]> = [
  [0.14, 'stone'], [0.11, 'stoneDark'], [0.15, 'stone'], [0.12, 'stone'], [0.11, 'stoneDark'], [0.14, 'stone'],
  [0.13, 'stone'], [0.12, 'stoneDark'], [0.15, 'stone'], [0.11, 'stone'], [0.13, 'stoneDark'], [0.12, 'stone'],
];

/** A koi swimming at the water surface, facing `yaw` (0 = +x). */
function koi(kit: StyleKit, x: number, z: number, yaw: number, body: PaletteColor, patch: PaletteColor): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const at = (f: number, side: number, up: number): Vec3 => [x + f * c + side * s, WATER.top + up, z - f * s + side * c];
  const rotate: Vec3 = [0, yaw, 0];
  return [
    kit.sphere(0.1, at(0, 0, 0.03), body, { detail: 0, scale: [1.7, 0.55, 0.8], rotate }),
    kit.sphere(0.06, at(0.02, 0.01, 0.07), patch, { detail: 0, scale: [1.5, 0.4, 0.8], rotate }),
    kit.cone(0.07, 0.14, at(-0.2, 0, 0.025), body, { segments: 4, rotate: [0, yaw, Math.PI / 2], scale: [1, 1, 0.3] }), // tail fin
    kit.box([0.08, 0.012, 0.05], at(0.04, 0.1, 0.02), body, { rotate: [0, yaw + 0.5, 0] }), // side fins
    kit.box([0.08, 0.012, 0.05], at(0.04, -0.1, 0.02), body, { rotate: [0, yaw - 0.5, 0] }),
  ];
}

/** บ่อปลาคาร์ป: a round pond ringed with rocks, koi and lily pads. */
export const item: ItemModel = {
  id: 'koi-pond',
  name: 'บ่อปลาคาร์ป',
  category: 'animal',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.98, 0.03, 1.98], [0, 0.015, 0], 'lime'),
      kit.cylinder(WATER.r + 0.1, WATER.r + 0.1, 0.045, [0, 0.0225, 0], 'sand', { segments: 20 }),
      kit.cylinder(WATER.r, WATER.r, WATER.top, [0, WATER.top / 2, 0], 'navy', { segments: 20, motion: { kind: 'water', water: 'pond' } }),
    ];
    ROCKS.forEach(([size, colour], i) => {
      const a = (i / ROCKS.length) * Math.PI * 2;
      parts.push(kit.sphere(size, [RING * Math.cos(a), size * 0.6, -RING * Math.sin(a)], colour, { detail: 0, scale: [1.2, 0.7, 1], rotate: [0, a, 0] }));
    });
    for (const [x, z, yaw, body, patch] of KOI) parts.push(...koi(kit, x, z, yaw, body, patch));
    for (const [x, z, r, flower] of PADS) {
      parts.push(kit.cylinder(r, r, 0.02, [x, WATER.top + 0.01 + 0.004, z], 'leaf', { segments: 8 }));
      if (flower) parts.push(kit.sphere(0.045, [x, WATER.top + 0.05, z], 'pink', { detail: 0 }));
    }
    // reeds and a leafy bush on the bank
    for (const [x, z, h] of [[-0.88, 0.78, 0.46], [-0.78, 0.9, 0.38], [0.88, -0.85, 0.42], [0.8, -0.92, 0.34]] as Array<[number, number, number]>) {
      parts.push(
        kit.cylinder(0.014, 0.022, h, [x, 0.03 + h / 2, z], 'leaf', { segments: 4 }),
        kit.cylinder(0.026, 0.026, 0.09, [x, 0.03 + h + 0.015, z], 'bark', { segments: 6 }),
      );
    }
    parts.push(
      kit.sphere(0.18, [0.8, 0.17, 0.78], 'leaf', { detail: 0, scale: [1.2, 0.8, 1] }),
      kit.sphere(0.12, [0.7, 0.13, 0.88], 'leafDark', { detail: 0 }),
      kit.sphere(0.07, [-0.85, 0.2, -0.78], 'pink', { detail: 0 }),
      kit.sphere(0.07, [-0.76, 0.2, -0.86], 'sunYellow', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
