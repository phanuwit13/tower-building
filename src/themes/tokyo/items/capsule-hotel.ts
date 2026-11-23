import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import { door, glassWindow } from '../../../models/parts';

// A stack of sleeping capsules (2×2): the front is a grid of round lit windows on teal strips, with a
// neon crescent moon on the roof (a glowing disc with a navy bite taken out of it).
const W = 1.5;
const BASE_H = 0.05;
const TOP = 2.75;
const ROWS = [0.8, 1.22, 1.64, 2.06, 2.48];
const STRIP_H = 0.32;
const R = 0.1; // capsule window radius

/** A round window: a glowing glass cylinder whose axis points out of the wall. */
function capsule(kit: StyleKit, at: [number, number, number], axis: 'x' | 'z'): Part {
  return kit.cylinder(R, R, 0.03, at, 'skyBlue', {
    segments: 8, glow: 'windowWarm', light: 'window', rotate: axis === 'x' ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0],
  });
}

/** ตึกโรงแรมแคปซูล: narrow-looking tower with round windows. */
export const item: ItemModel = {
  id: 'capsule-hotel',
  name: 'โรงแรมแคปซูล',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([W + 0.1, BASE_H, W + 0.1], [0, BASE_H / 2, 0], 'stone'),
      kit.box([W, TOP - BASE_H, W], [0, (TOP + BASE_H) / 2, 0], 'white'),
      kit.box([W + 0.08, 0.1, W + 0.08], [0, TOP + 0.05, 0], 'charcoal'),
      // lobby on the ground floor
      ...door(kit, { at: [W / 2, BASE_H + 0.21, -0.35], facing: 'x+', w: 0.42, h: 0.42, color: 'teal', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [W / 2, 0.32, 0.3], facing: 'x+', w: 0.7, h: 0.3, panes: 3 }),
      ...glassWindow(kit, { at: [0, 0.32, W / 2], facing: 'z+', w: 0.9, h: 0.3, panes: 3 }),
      ...glassWindow(kit, { at: [0, 0.32, -W / 2], facing: 'z-', w: 0.9, h: 0.3, panes: 3 }),
      ...glassWindow(kit, { at: [-W / 2, 0.32, 0], facing: 'x-', w: 0.9, h: 0.3, panes: 3 }),
    ];
    for (const y of ROWS) {
      // +x: four capsules a row; +z: three; the back and the left side get wide windows
      parts.push(kit.box([0.04, STRIP_H, W - 0.1], [W / 2, y, 0], 'teal'));
      for (const z of [-0.525, -0.175, 0.175, 0.525]) parts.push(capsule(kit, [W / 2 + 0.025, y, z], 'x'));
      parts.push(kit.box([W - 0.1, STRIP_H, 0.04], [0, y, W / 2], 'teal'));
      for (const x of [-0.4, 0, 0.4]) parts.push(capsule(kit, [x, y, W / 2 + 0.025], 'z'));
      parts.push(kit.box([0.03, 0.26, 1.1], [-W / 2 - 0.01, y, 0], 'skyBlue', { glow: 'windowWarm', light: 'window' }));
      parts.push(kit.box([1.1, 0.26, 0.03], [0, y, -W / 2 - 0.01], 'skyBlue', { glow: 'windowWarm', light: 'window' }));
    }
    // rooftop: a water tank, and a sign board on two legs carrying the neon moon
    const BX = 0.45;
    const BY = 3.15;
    parts.push(
      kit.cylinder(0.16, 0.16, 0.22, [-0.4, TOP + 0.21, -0.35], 'stoneDark', { segments: 8 }),
      kit.cone(0.18, 0.12, [-0.4, TOP + 0.38, -0.35], 'charcoal', { segments: 8 }),
      kit.box([0.05, 0.4, 0.05], [BX, TOP + 0.3, -0.4], 'charcoal'),
      kit.box([0.05, 0.4, 0.05], [BX, TOP + 0.3, 0.4], 'charcoal'),
      kit.box([0.06, 0.62, 1.0], [BX, BY, 0], 'navy'),
      // crescent: a blue disc, and a navy disc over it, shifted up and back
      kit.sphere(0.22, [BX + 0.04, BY, -0.1], 'blue', { scale: [0.12, 1, 1], glow: 'blue' }),
      kit.sphere(0.19, [BX + 0.065, BY + 0.05, -0.02], 'navy', { scale: [0.12, 1, 1] }),
      kit.sphere(0.05, [BX + 0.04, BY + 0.15, 0.28], 'sunYellow', { detail: 0, scale: [0.4, 1, 1], glow: 'sunYellow' }),
      kit.sphere(0.035, [BX + 0.04, BY - 0.12, 0.3], 'sunYellow', { detail: 0, scale: [0.4, 1, 1], glow: 'sunYellow' }),
      kit.sphere(0.035, [BX + 0.04, BY + 0.02, 0.4], 'sunYellow', { detail: 0, scale: [0.4, 1, 1], glow: 'sunYellow' }),
    );
    return kit.finish(parts);
  },
};
