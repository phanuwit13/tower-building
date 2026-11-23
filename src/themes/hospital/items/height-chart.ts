import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A giraffe-shaped board standing on a grassy base, seen side-on from +x (flat, thin along x), with a
// ruler strip at the back carrying rainbow colour marks (no numbers).
const T = 0.1; // board thickness along x
const BASE_H = 0.04;
const MARKS: readonly PaletteColor[] = ['red', 'orange', 'sunYellow', 'lime', 'teal', 'blue', 'purple'];

/** แผ่นวัดส่วนสูงยีราฟ: a giraffe height board with colour marks. */
export const item: ItemModel = {
  id: 'height-chart',
  name: 'แผ่นวัดส่วนสูงยีราฟ',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const y = BASE_H;
    const parts: Part[] = [
      kit.box([0.6, BASE_H, 1.0], [0, BASE_H / 2, 0], 'leaf'),
      // body, four legs, tail, neck, head
      kit.box([T, 0.4, 0.5], [0, y + 0.55, -0.1], 'sunYellow'),
      kit.box([T, 0.4, 0.08], [0, y + 0.2, 0.1 - 0.01], 'sunYellow'),
      kit.box([T, 0.4, 0.08], [0, y + 0.2, 0.02], 'sunYellow'),
      kit.box([T, 0.4, 0.08], [0, y + 0.2, -0.3], 'sunYellow'),
      kit.box([T, 0.4, 0.08], [0, y + 0.2, -0.22], 'sunYellow'),
      kit.box([T, 0.07, 0.15], [0, y + 0.45, -0.38], 'orange', { rotate: [0.5, 0, 0] }), // tail tuft base
      kit.box([T, 0.85, 0.2], [0, y + 0.925, 0.2], 'sunYellow'),
      kit.box([T, 0.22, 0.3], [0, y + 1.4, 0.3], 'sunYellow'),
      kit.box([T, 0.09, 0.12], [0, y + 1.36, 0.41], 'orange'), // muzzle
      // ears and horns
      kit.box([T, 0.07, 0.1], [0, y + 1.5, 0.14], 'orange', { rotate: [0.6, 0, 0] }),
    ];
    // spots (slightly proud of the board on both sides)
    const spots: readonly (readonly [number, number, number])[] = [[0.55, -0.25, 0.1], [0.62, -0.05, 0.09], [0.5, 0.05, 0.08], [0.9, 0.2, 0.09], [1.12, 0.2, 0.08], [1.38, 0.27, 0.07], [0.72, 0.22, 0.07]];
    for (const [sy, sz, s] of spots) parts.push(kit.box([T + 0.02, s, s], [0, y + sy, sz], 'terracotta'));
    for (const sx of [-1, 1]) parts.push(kit.sphere(0.025, [sx * (T / 2 + 0.005), y + 1.42, 0.37], 'navy', { detail: 0 })); // eyes
    // the colour ruler: a pale strip with coloured marks every step
    parts.push(kit.box([0.08, 1.5, 0.1], [0, y + 0.75, -0.45], 'cream'));
    MARKS.forEach((c, i) => parts.push(kit.box([0.12, 0.07, 0.1], [0, y + 0.2 + i * 0.2, -0.45], c)));
    return kit.finish(parts);
  },
};
