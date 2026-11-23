import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { glassWindow, door } from '../../../models/parts';

// A low module building (2×3, long side along z) with a glass control room and dishes on the roof.
// White walls with an orange band; windows along +x glow at night; the big dish turns slowly.
const W = 1.7;
const D = 2.8;
const WALL_H = 0.8;
const ROOF = WALL_H + 0.06;
const SPIN: MotionOpts = { kind: 'spin', pivot: [-0.25, ROOF + 0.1, -0.85], speed: 0.4 };

function dish(kit: StyleKit, c: Vec3, r: number, tilt: number, spin: boolean): Part[] {
  const motion = spin ? SPIN : undefined;
  const dir: Vec3 = [Math.sin(tilt), Math.cos(tilt), 0];
  return [
    kit.dome(r, c, 'white', { segments: 12, scale: [1, 0.45, 1], rotate: [0, 0, -tilt], motion }),
    kit.cylinder(0.012, 0.012, r * 0.9, [c[0] + dir[0] * r * 0.45, c[1] + dir[1] * r * 0.45, c[2]], 'stoneDark', { segments: 4, rotate: [0, 0, -tilt], motion }),
    kit.sphere(0.04, [c[0] + dir[0] * r * 0.95, c[1] + dir[1] * r * 0.95, c[2]], 'red', { detail: 0, motion }),
  ];
}

/** ศูนย์ควบคุม: a low module with a glass control room and dishes on the roof. */
export const item: ItemModel = {
  id: 'command-center',
  name: 'ศูนย์ควบคุม',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([W + 0.1, 0.06, D + 0.1], [0, 0.03, 0], 'stoneDark'),
      kit.box([W, WALL_H - 0.06, D], [0, 0.06 + (WALL_H - 0.06) / 2, 0], 'white'),
      kit.box([W + 0.04, 0.12, D + 0.04], [0, 0.55, 0], 'orange'),
      kit.box([W + 0.06, 0.06, D + 0.06], [0, WALL_H + 0.03, 0], 'teal'),
      // glass control room on the roof: lit teal-framed glass box with a blue roof
      kit.box([1.0, 0.52, 1.1], [0.2, ROOF + 0.26, 0.55], 'skyBlue'),
      ...glassWindow(kit, { at: [0.7, ROOF + 0.27, 0.55], facing: 'x+', w: 0.8, h: 0.3, frame: 'teal', panes: 3 }),
      ...glassWindow(kit, { at: [0.2, ROOF + 0.27, 1.1], facing: 'z+', w: 0.7, h: 0.3, frame: 'teal', panes: 3 }),
      kit.box([1.12, 0.06, 1.22], [0.2, ROOF + 0.55, 0.55], 'blue'),
      kit.box([0.06, 0.52, 0.06], [0.7, ROOF + 0.26, 1.1], 'teal'),
      kit.box([0.06, 0.52, 0.06], [0.7, ROOF + 0.26, 0.0], 'teal'),
      kit.box([0.06, 0.52, 0.06], [-0.3, ROOF + 0.26, 1.1], 'teal'),
      kit.box([0.06, 0.52, 0.06], [-0.3, ROOF + 0.26, 0.0], 'teal'),
      // radio mast with a beacon on the control room
      kit.cylinder(0.025, 0.025, 0.4, [0.2, ROOF + 0.78, 0.55], 'stoneDark', { segments: 6 }),
      kit.sphere(0.05, [0.2, ROOF + 1.0, 0.55], 'red', { detail: 0 }),
      // dish stand
      kit.cylinder(0.06, 0.08, 0.1, [-0.25, ROOF + 0.05, -0.85], 'stoneDark', { segments: 8 }),
      // a door on the +x side with steps, and a row of windows
      ...door(kit, { at: [W / 2, 0.3, -0.85], facing: 'x+', w: 0.34, h: 0.5, color: 'orange', knob: 'sunYellow' }),
      kit.box([0.14, 0.06, 0.46], [W / 2 + 0.07, 0.06, -0.85], 'stone'),
      ...glassWindow(kit, { at: [W / 2, 0.45, -0.1], facing: 'x+', w: 0.5, h: 0.3, frame: 'teal', panes: 2 }),
      ...glassWindow(kit, { at: [W / 2, 0.45, 0.55], facing: 'x+', w: 0.5, h: 0.3, frame: 'teal', panes: 2 }),
      ...glassWindow(kit, { at: [W / 2, 0.45, 1.1], facing: 'x+', w: 0.4, h: 0.3, frame: 'teal', panes: 2 }),
      ...glassWindow(kit, { at: [0, 0.45, D / 2], facing: 'z+', w: 0.6, h: 0.3, frame: 'teal', panes: 3 }),
      // small static dish and a solar-style panel strip
      ...dish(kit, [-0.4, ROOF + 0.05, 0.9], 0.22, -0.7, false),
      kit.cylinder(0.04, 0.05, 0.05, [-0.4, ROOF + 0.025, 0.9], 'stoneDark', { segments: 8 }),
    ];
    // the big dish spins about the stand axis
    parts.push(...dish(kit, [-0.25, ROOF + 0.1, -0.85], 0.4, 0.7, true));
    return kit.finish(parts);
  },
};
