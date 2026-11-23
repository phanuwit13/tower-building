import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, gableRoof, glassWindow } from '../../../models/parts';

// A tiny neighbourhood police box: cream walls, a blue gable roof, a lit window and a round red lamp
// over the door that breathes. No text anywhere.
const PAD = 0.03;
const W = 0.72;
const WALL_TOP = 0.85;
const FRONT = W / 2;

/** ป้อมตำรวจ: a tiny police box with a round red lamp. */
export const item: ItemModel = {
  id: 'police-box',
  name: 'ป้อมตำรวจ',
  category: 'building',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.94, PAD, 0.94], [0, PAD / 2, 0], 'stone'),
      kit.box([W, WALL_TOP - PAD, W], [0, (PAD + WALL_TOP) / 2, 0], 'cream'),
      kit.box([W + 0.04, 0.08, W + 0.04], [0, PAD + 0.04, 0], 'stoneDark'), // plinth
      kit.box([W + 0.04, 0.05, W + 0.04], [0, WALL_TOP - 0.03, 0], 'blue'), // band under the eave
      ...gableRoof(kit, { at: [0, WALL_TOP, 0], length: W + 0.14, width: W, rise: 0.3, eave: 0.08, color: 'blue' }),
      kit.wedge([W, 0.3, W - 0.02], [0, WALL_TOP + 0.15, 0], 'cream', { rotate: [0, Math.PI / 2, 0] }),
      kit.box([0.1, 0.18, 0.1], [-0.15, WALL_TOP + 0.3, -0.12], 'stoneDark'), // chimney
    ];
    // front: door, window, and the lamp on a short bracket above the door
    parts.push(
      ...door(kit, { at: [FRONT, PAD + 0.26, 0.14], facing: 'x+', w: 0.24, h: 0.44, color: 'navy', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [FRONT, 0.5, -0.17], facing: 'x+', w: 0.2, h: 0.24, panes: 1 }),
      kit.box([0.1, 0.05, 0.06], [FRONT + 0.04, 0.74, 0.14], 'charcoal'),
      kit.sphere(0.075, [FRONT + 0.06, 0.8, 0.14], 'red', { glow: true, light: 'breathe' }),
    );
    // sides
    parts.push(
      ...glassWindow(kit, { at: [0, 0.5, FRONT], facing: 'z+', w: 0.3, h: 0.24, panes: 2 }),
      ...glassWindow(kit, { at: [0, 0.5, -FRONT], facing: 'z-', w: 0.3, h: 0.24, panes: 2 }),
    );
    // little step and a plain white post lamp at the corner
    parts.push(kit.box([0.14, 0.04, 0.3], [FRONT + 0.07, PAD + 0.02, 0.14], 'stoneDark'));
    return kit.finish(parts);
  },
};
