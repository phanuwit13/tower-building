import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { ICO_LOW, rod } from '../../../models/parts';

// A small round green alien (1×1) facing +x: big eyes, a little smile, two antennae with blinking tips.
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
    const parts: Part[] = [
      // feet rest on the ground
      kit.sphere(FOOT_R, [0.02, FOOT_R * ICO_LOW * 0.6, 0.1], 'leafDark', { detail: 0, scale: [1.3, 0.6, 1] }),
      kit.sphere(FOOT_R, [0.02, FOOT_R * ICO_LOW * 0.6, -0.1], 'leafDark', { detail: 0, scale: [1.3, 0.6, 1] }),
      // round body and tummy
      kit.sphere(BODY_R, [0, BODY_Y, 0], 'leaf', { scale: [1, 0.9, 1] }),
      kit.sphere(0.09, [0.1, BODY_Y - 0.01, 0], 'lime', { detail: 0, scale: [0.6, 0.9, 1] }),
      // arms
      kit.sphere(0.055, [0.02, BODY_Y + 0.02, 0.17], 'lime', { detail: 0, scale: [1, 1.3, 0.8] }),
      kit.sphere(0.055, [0.02, BODY_Y + 0.02, -0.17], 'lime', { detail: 0, scale: [1, 1.3, 0.8] }),
      // big head
      kit.sphere(HEAD_R, [0, headC, 0], 'lime', { scale: [1, 0.9, 1.05] }),
      // eyes: white with navy pupils, looking at the camera side
      kit.sphere(0.075, [0.14, headC + 0.02, 0.085], 'white', { detail: 0 }),
      kit.sphere(0.075, [0.14, headC + 0.02, -0.085], 'white', { detail: 0 }),
      kit.sphere(0.04, [0.205, headC + 0.02, 0.085], 'navy', { detail: 0 }),
      kit.sphere(0.04, [0.205, headC + 0.02, -0.085], 'navy', { detail: 0 }),
      // smile
      kit.box([0.02, 0.025, 0.1], [0.195, headC - 0.095, 0], 'redDark'),
      kit.box([0.02, 0.04, 0.025], [0.19, headC - 0.075, 0.06], 'redDark'),
      kit.box([0.02, 0.04, 0.025], [0.19, headC - 0.075, -0.06], 'redDark'),
    ];
    // antennae with blinking tips
    for (const s of [-1, 1]) {
      const a: [number, number, number] = [0, headC + 0.15, s * 0.07];
      const b: [number, number, number] = [-0.02, headC + 0.34, s * 0.14];
      parts.push(rod(kit, a, b, 0.012, 'leafDark', { segments: 4 }));
      parts.push(kit.sphere(0.05, [b[0], b[1] + 0.03, b[2]], s > 0 ? 'sunYellow' : 'pink', { detail: 0, glow: true, light: 'blink' }));
    }
    return kit.finish(parts);
  },
};
