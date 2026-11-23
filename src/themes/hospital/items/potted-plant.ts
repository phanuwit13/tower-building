import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { aim } from '../../../models/parts';

// A leafy plant in a white pot: leaf cones fanned out from the middle, a few bright ones on top.
const POT = { rTop: 0.22, rBot: 0.15, h: 0.3 };

/** ต้นไม้กระถาง: a leafy plant in a white pot. */
export const item: ItemModel = {
  id: 'potted-plant',
  name: 'ต้นไม้กระถาง',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(POT.rTop, POT.rBot, POT.h, [0, POT.h / 2, 0], 'white', { segments: 12 }),
      kit.cylinder(POT.rTop + 0.015, POT.rTop + 0.015, 0.04, [0, POT.h - 0.02, 0], 'teal', { segments: 12 }), // rim band
      kit.cylinder(POT.rTop - 0.02, POT.rTop - 0.02, 0.02, [0, POT.h - 0.005, 0], 'bark', { segments: 12 }), // soil
    ];
    const leaf = (a: number, tilt: number, len: number, w: number, c: 'leaf' | 'leafDark' | 'lime', r0: number): void => {
      const dir: Vec3 = [Math.cos(a) * Math.sin(tilt), Math.cos(tilt), Math.sin(a) * Math.sin(tilt)];
      const base: Vec3 = [Math.cos(a) * r0, POT.h, Math.sin(a) * r0];
      const mid: Vec3 = [base[0] + (dir[0] * len) / 2, base[1] + (dir[1] * len) / 2, base[2] + (dir[2] * len) / 2];
      parts.push(kit.sphere(1, mid, c, { detail: 0, rotate: aim(dir), scale: [w, len / 2, w * 0.45] }));
    };
    const cols = ['leaf', 'leafDark', 'lime'] as const;
    for (let i = 0; i < 8; i++) leaf((i / 8) * Math.PI * 2, 0.85, 0.46, 0.09, cols[i % 3], 0.07);
    for (let i = 0; i < 6; i++) leaf((i / 6) * Math.PI * 2 + 0.3, 0.5, 0.6, 0.09, cols[(i + 1) % 3], 0.04);
    for (let i = 0; i < 3; i++) leaf((i / 3) * Math.PI * 2, 0.15, 0.62, 0.08, 'lime', 0.01);
    return kit.finish(parts);
  },
};
