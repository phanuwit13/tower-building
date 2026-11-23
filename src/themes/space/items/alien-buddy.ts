import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A small round green alien (1×1) facing +x, about 0.4 tall with antennae: big eyes, a little smile, two antennae
// with blinking tips, standing on a little round rock. Built at full size, then every part is scaled by K.
const K = 0.55;
const BASE_H = 0.07;
const FOOT_R = 0.06;
const BODY_R = 0.15;
const BODY_Y = 2 * FOOT_R * 0.6 + BODY_R * 0.9;
const HEAD_R = 0.2;
const HEAD_Y = 0.2;

/** เพื่อนต่างดาว: a cute round green alien with big eyes and blinking antennae. */
export const item: ItemModel = {
  id: 'alien-buddy',
  name: 'เพื่อนต่างดาว',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const headC = BODY_Y + HEAD_Y;
    const p = (x: number, y: number, z: number): Vec3 => [x * K, BASE_H + y * K, z * K];
    const parts: Part[] = [
      kit.cylinder(0.22, 0.28, BASE_H, [0, BASE_H / 2, 0], 'stoneDark', { segments: 8 }),
      kit.sphere(0.07, [0.0, BASE_H * 0.9, 0.1], 'stone', { detail: 0, scale: [1.2, 0.8, 1] }),
      // feet
      kit.sphere(FOOT_R * K, p(0.02, FOOT_R * 0.5, 0.1), 'leafDark', { detail: 0, scale: [1.3, 0.6, 1] }),
      kit.sphere(FOOT_R * K, p(0.02, FOOT_R * 0.5, -0.1), 'leafDark', { detail: 0, scale: [1.3, 0.6, 1] }),
      // body and tummy
      kit.sphere(BODY_R * K, p(0, BODY_Y, 0), 'leaf', { scale: [1, 0.9, 1] }),
      kit.sphere(0.09 * K, p(0.1, BODY_Y - 0.01, 0), 'lime', { detail: 0, scale: [0.6, 0.9, 1] }),
      // arms
      kit.sphere(0.055 * K, p(0.02, BODY_Y + 0.02, 0.17), 'lime', { detail: 0, scale: [1, 1.3, 0.8] }),
      kit.sphere(0.055 * K, p(0.02, BODY_Y + 0.02, -0.17), 'lime', { detail: 0, scale: [1, 1.3, 0.8] }),
      // big head (a bit bigger than natural so the face reads)
      kit.sphere(HEAD_R * K * 1.1, p(0, headC, 0), 'lime', { scale: [1, 0.9, 1.05] }),
      // eyes, extra big
      kit.sphere(0.085 * K, p(0.15, headC + 0.02, 0.09), 'white', { detail: 0 }),
      kit.sphere(0.085 * K, p(0.15, headC + 0.02, -0.09), 'white', { detail: 0 }),
      kit.sphere(0.048 * K, p(0.225, headC + 0.02, 0.09), 'navy', { detail: 0 }),
      kit.sphere(0.048 * K, p(0.225, headC + 0.02, -0.09), 'navy', { detail: 0 }),
      // smile
      kit.box([0.012, 0.02, 0.06], p(0.215, headC - 0.095, 0), 'redDark'),
    ];
    for (const s of [-1, 1]) {
      const a = p(0, headC + 0.16, s * 0.07);
      const b = p(-0.02, headC + 0.34, s * 0.14);
      parts.push(rod(kit, a, b, 0.012, 'leafDark', { segments: 4 }));
      parts.push(kit.sphere(0.055 * K, [b[0], b[1] + 0.02, b[2]], s > 0 ? 'sunYellow' : 'pink', { detail: 0, glow: true, light: 'blink' }));
    }
    return kit.finish(parts);
  },
};
