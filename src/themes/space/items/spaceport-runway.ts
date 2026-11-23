import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { glassWindow } from '../../../models/parts';

// A landing strip (2x3) with a winged space plane and two rows of running edge lights (the bulbs stay still).
const APRON = { w: 1.9, d: 2.9, h: 0.04 };
const STRIP = { x: -0.15, w: 0.9, d: 2.8, top: 0.07 };
const LIGHT_X = 0.55; // from the strip centre
const BULBS = 8;
const PLANE_Z = -0.1;
const FUSE_R = 0.14;
const FUSE_Y = 0.36;

export const item: ItemModel = {
  id: 'spaceport-runway',
  name: 'ลานจอดยานอวกาศ',
  category: 'facility',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([APRON.w, APRON.h, APRON.d], [0, APRON.h / 2, 0], 'stone'),
      kit.box([STRIP.w, STRIP.top - APRON.h, STRIP.d], [STRIP.x, (STRIP.top + APRON.h) / 2, 0], 'charcoal'),
    ];
    // centre dashes (yellow) and end bars (white)
    for (let i = 0; i < 6; i++) {
      parts.push(kit.box([0.06, 0.012, 0.28], [STRIP.x, STRIP.top + 0.006, -1.2 + i * 0.48], 'sunYellow'));
    }
    parts.push(
      kit.box([0.7, 0.012, 0.08], [STRIP.x, STRIP.top + 0.006, 1.3], 'white'),
      kit.box([0.7, 0.012, 0.08], [STRIP.x, STRIP.top + 0.006, -1.3], 'white'),
    );
    // running lights: two runs of bulbs, one down each edge, both running towards +z
    for (const side of [-1, 1]) {
      for (let index = 0; index < BULBS; index++) {
        const z = -1.4 + 0.2 + index * (2.4 / (BULBS - 1));
        parts.push(
          kit.cylinder(0.014, 0.014, 0.05, [STRIP.x + side * LIGHT_X, APRON.h + 0.025, z], 'stoneDark', { segments: 4 }),
          kit.sphere(0.04, [STRIP.x + side * LIGHT_X, APRON.h + 0.075, z], 'lampWarm', {
            detail: 0,
            glow: true,
            light: 'chase',
            chase: { index, count: BULBS },
          }),
        );
      }
    }
    // space plane, nose towards +z
    const px = STRIP.x;
    parts.push(
      kit.cylinder(FUSE_R, FUSE_R, 0.7, [px, FUSE_Y, PLANE_Z], 'white', { rotate: [Math.PI / 2, 0, 0] }),
      kit.cone(FUSE_R, 0.36, [px, FUSE_Y, PLANE_Z + 0.53], 'red', { rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(FUSE_R - 0.03, FUSE_R, 0.1, [px, FUSE_Y, PLANE_Z - 0.4], 'charcoal', { rotate: [Math.PI / 2, 0, 0] }),
      // cockpit glass
      kit.sphere(0.09, [px, FUSE_Y + 0.1, PLANE_Z + 0.3], 'skyBlue', { glow: 'windowWarm', light: 'window', scale: [1, 0.7, 1.4] }),
      // wings (swept: wide at the body, tipped orange)
      kit.box([1.1, 0.04, 0.34], [px, FUSE_Y - 0.06, PLANE_Z - 0.1], 'blue'),
      kit.box([0.12, 0.045, 0.3], [px + 0.55 - 0.06, FUSE_Y - 0.06, PLANE_Z - 0.1], 'orange'),
      kit.box([0.12, 0.045, 0.3], [px - 0.55 + 0.06, FUSE_Y - 0.06, PLANE_Z - 0.1], 'orange'),
      // tail fin and stabilisers
      kit.box([0.04, 0.3, 0.2], [px, FUSE_Y + 0.22, PLANE_Z - 0.3], 'red'),
      kit.box([0.5, 0.03, 0.14], [px, FUSE_Y + 0.02, PLANE_Z - 0.32], 'blue'),
      // landing gear
      kit.cylinder(0.02, 0.02, FUSE_Y - 0.19, [px, 0.07 + (FUSE_Y - 0.19) / 2 - 0.0, PLANE_Z + 0.3], 'stoneDark', { segments: 6 }),
      kit.cylinder(0.02, 0.02, FUSE_Y - 0.19, [px - 0.22, 0.07 + (FUSE_Y - 0.19) / 2, PLANE_Z - 0.2], 'stoneDark', { segments: 6 }),
      kit.cylinder(0.02, 0.02, FUSE_Y - 0.19, [px + 0.22, 0.07 + (FUSE_Y - 0.19) / 2, PLANE_Z - 0.2], 'stoneDark', { segments: 6 }),
    );
    for (const [wx, wz] of [[px, PLANE_Z + 0.3], [px - 0.22, PLANE_Z - 0.2], [px + 0.22, PLANE_Z - 0.2]] as const) {
      parts.push(kit.cylinder(0.05, 0.05, 0.05, [wx, 0.07 + 0.05, wz], 'charcoal', { segments: 8, rotate: [0, 0, Math.PI / 2] }));
    }
    // little control hut on the apron
    parts.push(
      kit.box([0.34, 0.4, 0.5], [0.72, APRON.h + 0.2, 0.85], 'white'),
      kit.box([0.4, 0.06, 0.56], [0.72, APRON.h + 0.43, 0.85], 'teal'),
      ...glassWindow(kit, { at: [0.72 + 0.17, 0.26, 0.85], facing: 'x+', w: 0.3, h: 0.14, panes: 2 }),
    );
    return kit.finish(parts);
  },
};
