import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';

// A round blue pet bed with a plump rim and a friendly little dog sitting up in it, its head
// turned a little towards +z. Faces +x.
const BED = { r: 0.43, h: 0.12, rim: 0.075 };
const SEAT = BED.h + 0.01;
const HIPS: Vec3 = [-0.05, SEAT + 0.09, 0];
const CHEST: Vec3 = [0.02, SEAT + 0.2, 0];
const HEAD: Vec3 = [0.06, SEAT + 0.37, 0];
const HEAD_R = 0.13;
const LOOK = 0.4;

/** สุนัขบนเบาะ: a round pet bed with a friendly little dog. */
export const item: ItemModel = {
  id: 'dog-bed',
  name: 'สุนัขบนเบาะ',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    /** A point on the head: f forward, u up, s to the dog's left. */
    const onHead = (f: number, u: number, s: number): Vec3 =>
      [HEAD[0] + f * Math.cos(LOOK) - s * Math.sin(LOOK), HEAD[1] + u, HEAD[2] + f * Math.sin(LOOK) + s * Math.cos(LOOK)];
    const look: Vec3 = [0, -LOOK, 0];
    const parts: Part[] = [
      kit.cylinder(BED.r, BED.r, BED.h, [0, BED.h / 2, 0], 'blue', { segments: 10 }),
      kit.torus(BED.r - BED.rim * 0.6, BED.rim, [0, BED.h, 0], 'skyBlue', { rotate: [Math.PI / 2, 0, 0], tubularSegments: 14 }),
      kit.cylinder(BED.r - BED.rim - 0.02, BED.r - BED.rim - 0.02, 0.012, [0, BED.h + 0.0, 0], 'cream', { segments: 10 }),
      // the dog: wide hips, chest with a cream front, a big head
      kit.sphere(1, HIPS, 'wood', { detail: 1, scale: [0.16, 0.12, 0.16] }),
      kit.sphere(1, CHEST, 'wood', { detail: 1, scale: [0.115, 0.14, 0.115] }),
      kit.sphere(1, [CHEST[0] + 0.07, CHEST[1] - 0.02, 0], 'cream', { detail: 0, scale: [0.06, 0.11, 0.08] }),
      kit.sphere(HEAD_R, HEAD, 'wood', { detail: 1, detail: 1, scale: [0.95, 0.9, 1.0], rotate: look }),
      kit.sphere(1, onHead(0.11, -0.035, 0), 'cream', { detail: 1, scale: [0.085, 0.06, 0.075], rotate: look }), // snout
      kit.sphere(0.03, onHead(0.185, -0.012, 0), 'charcoal', { detail: 0 }), // nose
      kit.sphere(1, onHead(0.14, -0.075, 0), 'pink', { detail: 0, scale: [0.03, 0.012, 0.025], rotate: look }), // tongue
      kit.sphere(1, onHead(0.115, 0.04, -0.06), 'charcoal', { detail: 0, scale: [0.02, 0.034, 0.026], rotate: look }),
      kit.sphere(1, onHead(0.115, 0.04, 0.06), 'charcoal', { detail: 0, scale: [0.02, 0.034, 0.026], rotate: look }),
      kit.sphere(1, [0.14, SEAT + 0.03, -0.06], 'cream', { detail: 0, scale: [0.065, 0.04, 0.045] }), // front paws
      kit.sphere(1, [0.14, SEAT + 0.03, 0.06], 'cream', { detail: 0, scale: [0.065, 0.04, 0.045] }),
      kit.sphere(0.05, [-0.2, SEAT + 0.07, 0.1], 'woodDark', { detail: 0 }), // short tail
      kit.sphere(0.04, [-0.24, SEAT + 0.12, 0.13], 'woodDark', { detail: 0 }),
      // a red chew bone? no: a little ball in the bed
      kit.sphere(0.05, [0.2, SEAT + 0.05, -0.2], 'sunYellow', { detail: 1 }),
    ];
    for (const s of [-1, 1]) {
      // floppy ears hang down the sides of the head
      parts.push(kit.sphere(1, onHead(-0.02, -0.05, s * 0.115), 'woodDark', { detail: 1, scale: [0.05, 0.11, 0.07], rotate: [s * 0.25, -LOOK, 0] }));
    }
    return kit.finish(parts);
  },
};
