import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';

// A sandy mound (1×2, long side along z) with burrow holes; three meerkats stand up on look-out.
const MOUND = { r: 0.46, h: 0.12, stretch: 1.8 };
const HILL = { r: 0.3, h: 0.18, stretchZ: 1.5 }; // the domed top
const hillY = (x: number, z: number) => MOUND.h + HILL.h * Math.sqrt(Math.max(0, 1 - (x / HILL.r) ** 2 - (z / (HILL.r * HILL.stretchZ)) ** 2));

/** A meerkat standing up, looking along `yaw` (0 = +x). `base` is where its feet are. */
function meerkat(kit: StyleKit, base: Vec3, yaw: number): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const pt = (lx: number, ly: number, lz: number): Vec3 => [base[0] + lx * c + lz * s, base[1] + ly, base[2] - lx * s + lz * c];
  const rotate: Vec3 = [0, yaw, 0];
  return [
    kit.sphere(0.09, pt(0, 0.17, 0), 'sand', { detail: 0, scale: [0.85, 1.5, 0.85], rotate }),
    kit.sphere(0.07, pt(0.04, 0.15, 0), 'cream', { detail: 0, scale: [0.6, 1.4, 0.8], rotate }),
    kit.sphere(0.075, pt(0.01, 0.34, 0), 'sand', { rotate }),
    kit.sphere(0.045, pt(0.06, 0.325, 0), 'cream', { detail: 0, scale: [1, 0.8, 0.9], rotate }),
    // dark eye patches, big eyes, nose
    kit.sphere(0.036, pt(0.05, 0.355, 0.04), 'bark', { detail: 0, scale: [0.7, 1, 1], rotate }),
    kit.sphere(0.036, pt(0.05, 0.355, -0.04), 'bark', { detail: 0, scale: [0.7, 1, 1], rotate }),
    kit.sphere(0.026, pt(0.072, 0.358, 0.04), 'white', { detail: 0 }),
    kit.sphere(0.026, pt(0.072, 0.358, -0.04), 'white', { detail: 0 }),
    kit.sphere(0.014, pt(0.094, 0.358, 0.04), 'charcoal', { detail: 0 }),
    kit.sphere(0.014, pt(0.094, 0.358, -0.04), 'charcoal', { detail: 0 }),
    kit.sphere(0.016, pt(0.103, 0.33, 0), 'charcoal', { detail: 0 }),
    kit.sphere(0.026, pt(-0.01, 0.41, 0.06), 'bark', { detail: 0, rotate }),
    kit.sphere(0.026, pt(-0.01, 0.41, -0.06), 'bark', { detail: 0, rotate }),
    // arms folded on the tummy, feet, tail
    kit.sphere(0.03, pt(0.075, 0.2, 0.06), 'sand', { detail: 0, scale: [0.8, 1.3, 0.8], rotate }),
    kit.sphere(0.03, pt(0.075, 0.2, -0.06), 'sand', { detail: 0, scale: [0.8, 1.3, 0.8], rotate }),
    kit.box([0.1, 0.03, 0.05], pt(0.04, 0.012, 0.045), 'woodDark', { rotate }),
    kit.box([0.1, 0.03, 0.05], pt(0.04, 0.012, -0.045), 'woodDark', { rotate }),
    kit.cylinder(0.014, 0.024, 0.22, pt(-0.13, 0.11, 0), 'sand', { segments: 6, rotate: [0, yaw, 0.6] }),
  ];
}

/** เนินเมียร์แคท: a sandy mound with burrow holes and three look-out meerkats. */
export const item: ItemModel = {
  id: 'meerkat-mound',
  name: 'เนินเมียร์แคท',
  category: 'animal',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(MOUND.r - 0.03, MOUND.r, MOUND.h, [0, MOUND.h / 2, 0], 'sand', { segments: 12, scale: [1, 1, MOUND.stretch] }),
      kit.dome(HILL.r, [0, MOUND.h, 0], 'sand', { segments: 12, scale: [1, HILL.h / HILL.r, HILL.stretchZ] }),
      // burrow holes on the flat rim, with a darker lip
      ...([[0.12, -0.7], [-0.14, 0.66], [0.17, 0.58], [-0.12, -0.5]] as Array<[number, number]>).flatMap(([x, z]) => [
        kit.cylinder(0.08, 0.08, 0.016, [x, MOUND.h + 0.008, z], 'bark', { segments: 8 }),
      ]),
      // pebbles and grass tufts
      kit.sphere(0.06, [0.3, MOUND.h + 0.03, -0.15], 'stone', { detail: 0, scale: [1.2, 0.7, 1] }),
      kit.sphere(0.05, [-0.3, MOUND.h + 0.03, 0.3], 'stoneDark', { detail: 0, scale: [1.2, 0.7, 1] }),
      kit.cone(0.04, 0.12, [0.33, MOUND.h + 0.06, 0.4], 'leaf', { segments: 5 }),
      kit.cone(0.04, 0.1, [-0.33, MOUND.h + 0.05, -0.35], 'leaf', { segments: 5 }),
    ];
    const spots: Array<[number, number, number]> = [[0.05, -0.28, 0.5], [-0.07, 0.02, 3.6], [0.04, 0.3, -0.5]];
    for (const [x, z, yaw] of spots) {
      parts.push(...meerkat(kit, [x, hillY(x, z) - 0.012, z], yaw));
    }
    return kit.finish(parts);
  },
};
