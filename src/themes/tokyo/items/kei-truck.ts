import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { glassWindow } from '../../../models/parts';

// A tiny white pickup (nobody driving): cab at +z, a flat bed with two crates of vegetables.
const R = 0.11;
const W = 0.62;
const CAB = { z0: 0.42, z1: 0.9, y0: 0.2, h: 0.2 };

/** รถกระบะเล็ก: a tiny white pickup with crates of vegetables. */
export const item: ItemModel = {
  id: 'kei-truck',
  name: 'รถกระบะเล็ก',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const cz = (CAB.z0 + CAB.z1) / 2;
    const parts: Part[] = [
      kit.box([W - 0.04, 0.08, 1.8], [0, 0.18, 0], 'charcoal'),
      kit.box([W, CAB.h, CAB.z1 - CAB.z0], [0, CAB.y0 + CAB.h / 2, cz], 'white'),
    ];
    parts.push(
      kit.box([W + 0.02, 0.05, CAB.z1 - CAB.z0 + 0.02], [0, 0.225, cz], 'teal'),
      kit.box([W + 0.02, 0.04, 0.5], [0, CAB.y0 + CAB.h + 0.02, cz], 'stone'),
      // flat bed with low sides
      kit.box([W, 0.05, 1.3], [0, 0.275, -0.25], 'stone'),
      kit.box([0.04, 0.12, 1.3], [-W / 2 + 0.02, 0.36, -0.25], 'white'),
      kit.box([0.04, 0.12, 1.3], [W / 2 - 0.02, 0.36, -0.25], 'white'),
      kit.box([W, 0.12, 0.04], [0, 0.36, -0.88], 'white'),
      // lights and glass
      kit.sphere(0.04, [-0.2, 0.28, CAB.z1 + 0.025], 'lampWarm', { detail: 0, glow: true }),
      kit.sphere(0.04, [0.2, 0.28, CAB.z1 + 0.025], 'lampWarm', { detail: 0, glow: true }),
      kit.box([0.1, 0.05, 0.03], [0, 0.26, -0.905], 'red', { glow: 'red' }),
      ...glassWindow(kit, { at: [0, 0.32, CAB.z1], facing: 'z+', w: 0.44, h: 0.08, panes: 2 }),
      ...glassWindow(kit, { at: [W / 2, 0.32, cz], facing: 'x+', w: 0.3, h: 0.08, panes: 1 }),
      ...glassWindow(kit, { at: [-W / 2, 0.32, cz], facing: 'x-', w: 0.3, h: 0.08, panes: 1 }),
    );
    // crates of vegetables
    const crate = (z: number, veg: 'orange' | 'leaf' | 'red') => {
      parts.push(kit.box([0.44, 0.14, 0.42], [0, 0.375, z], 'wood'));
      parts.push(kit.box([0.46, 0.03, 0.44], [0, 0.46, z], 'woodDark'));
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        parts.push(kit.sphere(0.05, [0.11 * Math.cos(a) * (i % 2 ? 1 : 0.6), 0.495, z + 0.1 * Math.sin(a) * (i % 2 ? 1 : 0.6)], veg, { detail: 0 }));
      }
    };
    crate(-0.05, 'orange');
    crate(-0.55, 'leaf');
    for (const x of [-W / 2, W / 2]) {
      for (const z of [-0.5, 0.65]) {
        parts.push(kit.cylinder(R, R, 0.1, [x, R, z], 'charcoal', { segments: 12, rotate: [0, 0, Math.PI / 2] }));
        parts.push(kit.cylinder(0.05, 0.05, 0.12, [x * 1.04, R, z], 'stone', { segments: 6, rotate: [0, 0, Math.PI / 2] }));
      }
    }
    return kit.finish(parts);
  },
};
