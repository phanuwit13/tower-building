import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A rounded jukebox: arched top, a lit window with a record, a ring of blinking bulbs and a grille.
const W = { x: 0.54, z: 0.64 };
const BODY_H = 0.95;
const FRONT = W.x / 2;
const WIN_Y = 0.98;
const BULBS = ['red', 'sunYellow', 'lime', 'skyBlue', 'pink'] as const;

/** ตู้เพลง: a rounded jukebox with coloured blinking lights. */
export const item: ItemModel = {
  id: 'jukebox',
  name: 'ตู้เพลง',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([W.x + 0.04, 0.06, W.z + 0.04], [0, 0.03, 0], 'charcoal'),
      kit.box([W.x, BODY_H - 0.06, W.z], [0, 0.06 + (BODY_H - 0.06) / 2, 0], 'redDark'),
      kit.cylinder(W.z / 2, W.z / 2, W.x, [0, BODY_H, 0], 'redDark', { segments: 16, rotate: [0, 0, Math.PI / 2] }),
      // lit window with a record
      kit.cylinder(0.24, 0.24, 0.03, [FRONT + 0.015, WIN_Y, 0], 'skyBlue', { segments: 16, rotate: [0, 0, Math.PI / 2], glow: 'windowWarm', light: 'window' }),
      kit.cylinder(0.14, 0.14, 0.02, [FRONT + 0.04, WIN_Y, 0], 'charcoal', { segments: 12, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.05, 0.05, 0.02, [FRONT + 0.05, WIN_Y, 0], 'sunYellow', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      // side light bars, lower grille, coin slot and buttons
      kit.box([0.03, 0.6, 0.05], [FRONT + 0.015, 0.42, -0.27], 'orange', { glow: true }),
      kit.box([0.03, 0.6, 0.05], [FRONT + 0.015, 0.42, 0.27], 'orange', { glow: true }),
      kit.box([0.03, 0.28, 0.4], [FRONT + 0.015, 0.3, 0], 'charcoal'),
      kit.box([0.03, 0.08, 0.1], [FRONT + 0.02, 0.58, 0], 'brass'),
      kit.sphere(0.03, [FRONT + 0.03, 0.66, -0.14], 'lime', { detail: 0 }),
      kit.sphere(0.03, [FRONT + 0.03, 0.66, 0.14], 'sunYellow', { detail: 0 }),
    ];
    for (const z of [-0.14, -0.07, 0, 0.07, 0.14]) {
      parts.push(kit.box([0.02, 0.025, 0.04], [FRONT + 0.03, 0.3, z], 'stoneDark'));
    }
    // blinking bulbs round the window
    BULBS.forEach((c, i) => {
      const a = Math.PI * (0.15 + (0.7 * i) / (BULBS.length - 1));
      parts.push(kit.sphere(0.035, [FRONT + 0.02, WIN_Y + 0.29 * Math.sin(a), 0.29 * Math.cos(a)], c, { detail: 0, glow: true, light: 'blink' }));
    });
    return kit.finish(parts);
  },
};
