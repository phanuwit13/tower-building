import type { ItemModel } from '../../../models/contract';
import { ICO_LOW } from '../../../models/parts';
import type { Part } from '../../../models/kit';

// A dark meteorite sitting in a small crater, with a faint glowing crack on top.
const R = 0.34;
const TUBE = 0.05;
const FLOOR_TOP = 0.03;
const M_R = 0.24;
const M_Y = FLOOR_TOP + M_R * 0.9 * ICO_LOW;

/** อุกกาบาต: a dark meteorite in a small crater with a faint glowing crack. */
export const item: ItemModel = {
  id: 'meteorite',
  name: 'อุกกาบาต',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.torus(R, TUBE, [0, TUBE, 0], 'stoneDark', { radialSegments: 5, tubularSegments: 12, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(R, R, FLOOR_TOP, [0, FLOOR_TOP / 2, 0], 'stoneDark', { segments: 12 }),
      kit.sphere(M_R, [0, M_Y, 0], 'charcoal', { detail: 0, scale: [1, 0.9, 1], rotate: [0, 0.5, 0] }),
      kit.sphere(0.1, [0.17, FLOOR_TOP + 0.1 * 0.8 * ICO_LOW + 0.05, 0.12], 'charcoal', { detail: 0, scale: [1, 0.8, 1] }),
    ];
    // the crack: three thin zig-zag bars over the top of the rock
    const top = M_Y + M_R * 0.9;
    const bars: { at: [number, number, number]; len: number; yaw: number }[] = [
      { at: [0.0, top - 0.015, 0.0], len: 0.18, yaw: 0.2 },
      { at: [0.07, top - 0.045, 0.1], len: 0.14, yaw: -0.7 },
      { at: [-0.06, top - 0.045, -0.09], len: 0.14, yaw: -0.5 },
    ];
    for (const b of bars) parts.push(kit.box([b.len, 0.045, 0.045], b.at, 'orange', { rotate: [0, b.yaw, 0], glow: true, light: 'breathe' }));
    return kit.finish(parts);
  },
};
