import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A big fish tank on a wooden cabinet (2×2, front on +x). The water is a pool-water box whose top shimmers;
// colourful fish lie on it seen from above. Nothing glows: the glass sides are plain (they bloomed in the café).
const CAB = { w: 1.8, h: 0.5 };
const TANK = { half: 0.78, base: 0.54, top: 1.08 };
const WATER_Y = 1.0;
const WATER = { kind: 'water', water: 'pool' } as const;

/** A friendly cartoon fish facing +x at `at`, turned by `yaw`, scaled by `k`. */
function fish(kit: StyleKit, at: Vec3, yaw: number, k: number, body: PaletteColor, fin: PaletteColor): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const pt = (lx: number, ly: number, lz: number): Vec3 => [at[0] + (lx * c + lz * s) * k, at[1] + ly * k, at[2] + (-lx * s + lz * c) * k];
  const rotate: Vec3 = [0, yaw, 0];
  return [
    kit.sphere(0.1 * k, pt(0, 0.03, 0), body, { detail: 0, scale: [1.5, 0.7, 0.8], rotate }),
    kit.wedge([0.1 * k, 0.02 * k, 0.12 * k], pt(-0.2, 0.03, 0), fin, { rotate: [0, yaw + Math.PI / 2, 0], apex: 0 }),
    kit.box([0.08 * k, 0.02 * k, 0.04 * k], pt(0.0, 0.06, 0), fin, { rotate }),
    kit.sphere(0.028 * k, pt(0.11, 0.07, 0.05), 'white', { detail: 0 }),
    kit.sphere(0.028 * k, pt(0.11, 0.07, -0.05), 'white', { detail: 0 }),
  ];
}

/** ตู้ปลา: a fish tank on a cabinet with colourful fish, plants and bubbles. */
export const item: ItemModel = {
  id: 'aquarium-tank',
  name: 'ตู้ปลา',
  category: 'animal',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const h = TANK.half;
    const mid = (TANK.top + TANK.base) / 2;
    const gh = TANK.top - TANK.base;
    const parts: Part[] = [
      // cabinet with a white top plate and two doors with knobs on +x
      kit.box([CAB.w, CAB.h, CAB.w], [0, CAB.h / 2, 0], 'woodDark'),
      kit.box([CAB.w + 0.06, 0.04, CAB.w + 0.06], [0, CAB.h + 0.02, 0], 'white'),
      kit.box([0.03, 0.38, 0.8], [CAB.w / 2 + 0.015, 0.26, 0.44], 'wood'),
      kit.box([0.03, 0.38, 0.8], [CAB.w / 2 + 0.015, 0.26, -0.44], 'wood'),
      kit.sphere(0.04, [CAB.w / 2 + 0.035, 0.3, 0.06], 'sunYellow', { detail: 0 }),
      kit.sphere(0.04, [CAB.w / 2 + 0.035, 0.3, -0.06], 'sunYellow', { detail: 0 }),
      // water, then plain glass sides (no glow) and a charcoal frame on top
      kit.box([h * 2 - 0.04, WATER_Y - TANK.base - 0.02, h * 2 - 0.04], [0, (WATER_Y + TANK.base) / 2 + 0.01, 0], 'skyBlue', { motion: WATER }),
      kit.box([0.03, gh, h * 2], [h, mid, 0], 'skyBlue'),
      kit.box([0.03, gh, h * 2], [-h, mid, 0], 'skyBlue'),
      kit.box([h * 2, gh, 0.03], [0, mid, h], 'skyBlue'),
      kit.box([h * 2, gh, 0.03], [0, mid, -h], 'skyBlue'),
      kit.box([0.08, 0.04, h * 2 + 0.08], [h, TANK.top + 0.02, 0], 'charcoal'),
      kit.box([0.08, 0.04, h * 2 + 0.08], [-h, TANK.top + 0.02, 0], 'charcoal'),
      kit.box([h * 2 - 0.08, 0.04, 0.08], [0, TANK.top + 0.02, h], 'charcoal'),
      kit.box([h * 2 - 0.08, 0.04, 0.08], [0, TANK.top + 0.02, -h], 'charcoal'),
      // seaweed, coral and a rock poking out of the water
      kit.cone(0.06, 0.4, [-0.55, WATER_Y + 0.12, -0.55], 'leaf', { segments: 6 }),
      kit.cone(0.05, 0.3, [-0.45, WATER_Y + 0.08, -0.6], 'leafDark', { segments: 6 }),
      kit.cone(0.06, 0.34, [-0.6, WATER_Y + 0.1, -0.4], 'lime', { segments: 6 }),
      kit.sphere(0.13, [0.5, WATER_Y + 0.02, 0.55], 'pink', { detail: 0, scale: [1, 0.8, 1] }),
      kit.cone(0.07, 0.24, [0.58, WATER_Y + 0.08, 0.42], 'orange', { segments: 6 }),
      kit.sphere(0.15, [-0.35, WATER_Y + 0.01, 0.5], 'stoneDark', { detail: 0, scale: [1.3, 0.7, 1] }),
      kit.cone(0.05, 0.3, [-0.55, WATER_Y + 0.1, 0.6], 'leaf', { segments: 6 }),
      // bubbles
      kit.sphere(0.035, [0.6, WATER_Y + 0.005, -0.5], 'glassBlue', { detail: 0 }),
      kit.sphere(0.045, [0.65, WATER_Y + 0.01, -0.56], 'glassBlue', { detail: 0 }),
      kit.sphere(0.03, [0.56, WATER_Y, -0.6], 'glassBlue', { detail: 0 }),
    ];
    parts.push(...fish(kit, [0.25, WATER_Y, -0.1], 0.3, 1.2, 'orange', 'sunYellow'));
    parts.push(...fish(kit, [-0.1, WATER_Y, 0.2], 3.6, 1.0, 'pink', 'purple'));
    parts.push(...fish(kit, [0.05, WATER_Y, -0.5], 5.6, 0.9, 'sunYellow', 'orange'));
    parts.push(...fish(kit, [-0.35, WATER_Y, -0.1], 2.7, 0.9, 'purple', 'pink'));
    parts.push(...fish(kit, [0.3, WATER_Y, 0.25], 1.0, 0.8, 'red', 'white'));
    parts.push(...fish(kit, [0.0, WATER_Y, 0.6], 4.4, 0.8, 'mint', 'teal'));
    return kit.finish(parts);
  },
};
