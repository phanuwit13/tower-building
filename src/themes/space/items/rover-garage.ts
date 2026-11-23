import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { barrelRoof, glassWindow } from '../../../models/parts';

// A curved hangar: the arch runs along x, its open doorway faces +x and a rover waits inside.
const PAD = { x: 1.96, z: 2.96, h: 0.03 }; // stone apron under everything
const HALL = { x0: -0.9, x1: 0.2, halfW: 1.22 }; // hangar length (x) and half width (z)
const WALL_TOP = 0.5;
const RISE = 0.78;
const SPRING = 0.25;

/** โรงจอดยานสำรวจ: a curved hangar with a rover inside and a lit doorway. */
export const item: ItemModel = {
  id: 'rover-garage',
  name: 'โรงจอดยานสำรวจ',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const len = HALL.x1 - HALL.x0;
    const cx = (HALL.x0 + HALL.x1) / 2;
    const arcY = WALL_TOP - RISE * Math.sin(SPRING);
    const parts: Part[] = [
      kit.box([PAD.x, PAD.h, PAD.z], [0, PAD.h / 2, 0], 'stone'),
      // low side walls and the back wall
      kit.box([len, WALL_TOP - PAD.h, 0.1], [cx, (WALL_TOP + PAD.h) / 2, HALL.halfW], 'white'),
      kit.box([len, WALL_TOP - PAD.h, 0.1], [cx, (WALL_TOP + PAD.h) / 2, -HALL.halfW], 'white'),
      ...barrelRoof(kit, {
        at: [cx, arcY, 0], length: len, width: 2 * HALL.halfW + 0.1, rise: RISE, color: 'blue', spring: SPRING, thickness: 0.08,
        endWall: { color: 'white', length: 0.1, center: HALL.x0 + 0.05 },
      }),
      // the lit back wall seen through the doorway, and a glowing ceiling strip
      kit.box([0.04, 0.5, 1.9], [HALL.x0 + 0.12, 0.3, 0], 'skyBlue', { glow: 'sunYellow', light: 'window' }),
      kit.box([0.8, 0.03, 0.12], [cx, 0.5 + RISE * 0.55, 0], 'sunYellow', { glow: true }),
      // a warm lit floor just inside the doorway
      kit.box([1.1, 0.012, 0.8], [0.3, PAD.h + 0.006, 0], 'sunYellow', { glow: true }),
      // orange doorway arch frame
      kit.torus(1, 0.07, [HALL.x1 + 0.04, arcY, 0], 'orange', { glow: 'sunYellow', arc: Math.PI, rotate: [0, Math.PI / 2, 0], scale: [(HALL.halfW + 0.08) / 1, RISE / 1, 1], radialSegments: 4, tubularSegments: 12 }),
      kit.box([0.14, WALL_TOP, 0.14], [HALL.x1 + 0.04, WALL_TOP / 2, HALL.halfW + 0.02], 'orange'),
      kit.box([0.14, WALL_TOP, 0.14], [HALL.x1 + 0.04, WALL_TOP / 2, -HALL.halfW - 0.02], 'orange'),
    ];
    // side windows (lit)
    for (const x of [-0.6, -0.25, 0.1]) {
      parts.push(
        ...glassWindow(kit, { at: [x, 0.3, HALL.halfW + 0.05], facing: 'z+', w: 0.3, h: 0.16, frame: 'orange', panes: 1 }),
        ...glassWindow(kit, { at: [x, 0.3, -HALL.halfW - 0.05], facing: 'z-', w: 0.3, h: 0.16, frame: 'orange', panes: 1 }),
      );
    }
    // the little rover parked half out of the doorway, along x, on the lit apron
    const RX = 0.35;
    parts.push(
      kit.box([0.9, 0.14, 0.4], [RX, 0.22, 0], 'white'),
      kit.box([0.5, 0.1, 0.3], [RX - 0.1, 0.34, 0], 'orange'),
      kit.box([0.14, 0.16, 0.14], [RX + 0.3, 0.38, 0], 'teal'),
      kit.sphere(0.04, [RX + 0.38, 0.4, 0.05], 'skyBlue', { detail: 0 }),
      kit.sphere(0.04, [RX + 0.38, 0.4, -0.05], 'skyBlue', { detail: 0 }),
    );
    for (const x of [-0.3, 0, 0.3]) {
      for (const s of [-1, 1]) {
        parts.push(kit.cylinder(0.1, 0.1, 0.1, [RX + x, 0.1 + PAD.h, s * 0.26], 'charcoal', { rotate: [Math.PI / 2, 0, 0], segments: 8 }));
      }
    }
    return kit.finish(parts);
  },
};
