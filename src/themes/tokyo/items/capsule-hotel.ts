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
function capsule(kit: StyleKit, at: [number, number, number], axis: 'x' | 'z', lit: boolean): Part {
  const rotate: [number, number, number] = axis === 'x' ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0];
  return lit
    ? kit.cylinder(R, R, 0.03, at, 'skyBlue', { segments: 8, glow: 'windowWarm', light: 'window', rotate })
    : kit.cylinder(R, R, 0.03, at, 'blue', { segments: 8, rotate });
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
    ROWS.forEach((y, r) => {
      // +x: four capsules a row; +z: three; the back and the left side get wide windows
      parts.push(kit.box([0.04, STRIP_H, W - 0.1], [W / 2, y, 0], 'teal'));
      [-0.525, -0.175, 0.175, 0.525].forEach((z, i) => parts.push(capsule(kit, [W / 2 + 0.025, y, z], 'x', (i + r) % 2 === 0)));
      parts.push(kit.box([W - 0.1, STRIP_H, 0.04], [0, y, W / 2], 'teal'));
      [-0.4, 0, 0.4].forEach((x, i) => parts.push(capsule(kit, [x, y, W / 2 + 0.025], 'z', (i + r) % 2 === 1)));
      // the other two sides: dark glass slits, a few lit
      for (const k of [-0.3, 0.3]) {
        parts.push(kit.box([0.03, 0.22, 0.45], [-W / 2 - 0.01, y, k * 1.2], r % 2 === (k > 0 ? 0 : 1) ? 'skyBlue' : 'blue', r % 2 === (k > 0 ? 0 : 1) ? { glow: 'windowWarm', light: 'window' } : undefined));
        parts.push(kit.box([0.45, 0.22, 0.03], [k * 1.2, y, -W / 2 - 0.01], r % 2 === (k > 0 ? 1 : 0) ? 'skyBlue' : 'blue', r % 2 === (k > 0 ? 1 : 0) ? { glow: 'windowWarm', light: 'window' } : undefined));
      }
    });
    // rooftop: a water tank, and a sign board on two legs carrying the neon moon
    const BX = 0.45;
    const BY = 3.3;
    parts.push(
      kit.cylinder(0.16, 0.16, 0.22, [-0.4, TOP + 0.21, -0.35], 'stoneDark', { segments: 8 }),
      kit.cone(0.18, 0.12, [-0.4, TOP + 0.38, -0.35], 'charcoal', { segments: 8 }),
      kit.box([0.05, 0.3, 0.05], [BX, TOP + 0.25, -0.5], 'charcoal'),
      kit.box([0.05, 0.3, 0.05], [BX, TOP + 0.25, 0.5], 'charcoal'),
      kit.box([0.06, 0.8, 1.3], [BX, BY, 0], 'navy'),
      // crescent: a big blue disc with a navy disc over it, shifted up and right, leaving a moon on the left
      kit.sphere(0.32, [BX + 0.04, BY, -0.2], 'blue', { scale: [0.12, 1, 1], glow: 'blue' }),
      kit.sphere(0.27, [BX + 0.065, BY + 0.06, -0.08], 'navy', { scale: [0.12, 1, 1] }),
      // three yellow stars to the right of the moon
      kit.sphere(0.06, [BX + 0.04, BY + 0.2, 0.35], 'sunYellow', { detail: 0, scale: [0.4, 1, 1], glow: 'sunYellow' }),
      kit.sphere(0.045, [BX + 0.04, BY - 0.12, 0.45], 'sunYellow', { detail: 0, scale: [0.4, 1, 1], glow: 'sunYellow' }),
      kit.sphere(0.045, [BX + 0.04, BY + 0.02, 0.2], 'sunYellow', { detail: 0, scale: [0.4, 1, 1], glow: 'sunYellow' }),
    );
    return kit.finish(parts);
  },
};
