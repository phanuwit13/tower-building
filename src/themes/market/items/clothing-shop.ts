import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, glassWindow, wallPanel } from '../../../models/parts';

// A boutique (2×2, front on +x): a big shop window with three dress forms on a display step, and a
// purple shirt neon on a sign board above the roof.
const B = { x0: -0.95, x1: 0.35, z: 0.95, top: 1.1 };
const STEP = { x: 0.47, h: 0.05 };
const FORMS: { z: number; color: 'pink' | 'purple' | 'sunYellow' }[] = [
  { z: -0.55, color: 'pink' },
  { z: -0.2, color: 'purple' },
  { z: 0.15, color: 'sunYellow' },
];

/** ร้านเสื้อผ้า: a boutique with dress forms in the window and a shirt neon. */
export const item: ItemModel = {
  id: 'clothing-shop',
  name: 'ร้านเสื้อผ้า',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const cx = (B.x0 + B.x1) / 2;
    const L = 2 * B.z;
    const parts: Part[] = [
      kit.box([B.x1 - B.x0 + 0.04, 0.05, L + 0.04], [cx, 0.025, 0], 'stone'),
      kit.box([B.x1 - B.x0, B.top - 0.05, L], [cx, (0.05 + B.top) / 2, 0], 'cream'),
      kit.box([B.x1 - B.x0 + 0.1, 0.07, L + 0.1], [cx, B.top + 0.035, 0], 'purple'),
      kit.box([B.x1 - B.x0 + 0.02, 0.05, L + 0.02], [cx, 0.78, 0], 'purple'),
      // pavement in front, and a display step under the window
      kit.box([0.6, 0.03, L], [(B.x1 + 0.95) / 2, 0.015, 0], 'stone'),
      kit.box([0.22, STEP.h, 1.3], [STEP.x, STEP.h / 2 + 0.03, -0.2], 'white'),
      // the big shop window, a door and an upper strip of windows
      ...glassWindow(kit, { at: [B.x1, 0.42, -0.2], facing: 'x+', w: 1.1, h: 0.46, panes: 3 }),
      ...door(kit, { at: [B.x1, 0.3, 0.66], facing: 'x+', w: 0.3, h: 0.5, color: 'woodDark', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [B.x1, 0.94, -0.45], facing: 'x+', w: 0.5, h: 0.2 }),
      ...glassWindow(kit, { at: [B.x1, 0.94, 0.45], facing: 'x+', w: 0.5, h: 0.2 }),
      ...glassWindow(kit, { at: [-0.3, 0.45, B.z], facing: 'z+', w: 0.7, h: 0.4 }),
      ...glassWindow(kit, { at: [-0.3, 0.45, -B.z], facing: 'z-', w: 0.7, h: 0.4 }),
      ...glassWindow(kit, { at: [-0.3, 0.94, B.z], facing: 'z+', w: 0.6, h: 0.2 }),
      ...glassWindow(kit, { at: [-0.3, 0.94, -B.z], facing: 'z-', w: 0.6, h: 0.2 }),
      ...glassWindow(kit, { at: [B.x0, 0.45, 0], facing: 'x-', w: 1.0, h: 0.4, panes: 3 }),
      ...wallPanel(kit, { at: [B.x1, 0.78, 0], facing: 'x+', w: 1.9, h: 0.05, depth: 0.03, color: 'purple' }),
      // sign board on posts above the roof
      kit.box([0.05, 0.5, 0.8], [0.0, B.top + 0.07 + 0.25, 0], 'navy'),
      // the shirt neon (glowing purple): body, two sleeves, a collar notch
      kit.box([0.03, 0.2, 0.2], [0.04, B.top + 0.28, 0], 'purple', { glow: true }),
      kit.box([0.03, 0.07, 0.16], [0.04, B.top + 0.36, 0.16], 'purple', { glow: true, rotate: [-0.7, 0, 0] }),
      kit.box([0.03, 0.07, 0.16], [0.04, B.top + 0.36, -0.16], 'purple', { glow: true, rotate: [0.7, 0, 0] }),
      kit.box([0.03, 0.05, 0.08], [0.04, B.top + 0.4, 0], 'navy'),
      // a little shrub by the door
      kit.cylinder(0.1, 0.08, 0.14, [0.8, 0.1, 0.7], 'terracotta', { segments: 8 }),
      kit.sphere(0.14, [0.8, 0.28, 0.7], 'leaf', { detail: 0 }),
    ];
    // dress forms: a base disc, a pole, a tapered torso and a neck cap (no faces)
    for (const f of FORMS) {
      const y0 = STEP.h + 0.03;
      parts.push(
        kit.cylinder(0.06, 0.07, 0.015, [STEP.x, y0 + 0.008, f.z], 'charcoal', { segments: 8 }),
        kit.cylinder(0.014, 0.014, 0.18, [STEP.x, y0 + 0.1, f.z], 'chrome', { segments: 4 }),
        kit.cylinder(0.075, 0.055, 0.2, [STEP.x, y0 + 0.26, f.z], f.color, { segments: 8 }),
        kit.sphere(0.075, [STEP.x, y0 + 0.37, f.z], f.color, { detail: 0, scale: [0.8, 0.45, 1.1] }),
        kit.cylinder(0.02, 0.03, 0.05, [STEP.x, y0 + 0.42, f.z], 'chrome', { segments: 6 }),
      );
    }
    return kit.finish(parts);
  },
};
