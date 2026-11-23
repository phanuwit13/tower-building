import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { gableRoof, glassWindow, rod } from '../../../models/parts';

const BASE = 0.03;
const WHEEL = { r: 0.13, tube: 0.02 };
const HUB_Y = WHEEL.r + WHEEL.tube + BASE;
const KIOSK = { x: -0.5, w: 0.56, d: 1.1, h: 0.82 }; // walls centre x, width (x), depth (z), height
const WALL_FRONT = KIOSK.x + KIOSK.w / 2;

/** A small bike along x (front wheel +x) at lane z, offset by ox in x. */
function bike(kit: StyleKit, ox: number, z: number, frame: PaletteColor): Part[] {
  const y = HUB_Y;
  const rx = ox - 0.19;
  const fx = ox + 0.19;
  const p = (x: number, yy: number): [number, number, number] => [ox + x, yy, z];
  return [
    kit.torus(WHEEL.r, WHEEL.tube, [rx, y, z], 'charcoal', { radialSegments: 4, tubularSegments: 8 }),
    kit.torus(WHEEL.r, WHEEL.tube, [fx, y, z], 'charcoal', { radialSegments: 4, tubularSegments: 8 }),
    rod(kit, p(-0.19, y), p(0, y + 0.01), 0.016, frame, { segments: 4 }),
    rod(kit, p(0, y + 0.01), p(-0.07, y + 0.22), 0.016, frame, { segments: 4 }),
    rod(kit, p(-0.07, y + 0.22), p(0.13, y + 0.21), 0.016, frame, { segments: 4 }),
    rod(kit, p(0, y + 0.01), p(0.13, y + 0.21), 0.016, frame, { segments: 4 }),
    rod(kit, p(0.13, y + 0.21), p(0.19, y), 0.016, 'chrome', { segments: 4 }),
    rod(kit, p(-0.07, y + 0.22), p(-0.09, y + 0.28), 0.014, 'chrome', { segments: 4 }),
    kit.box([0.11, 0.03, 0.07], [ox - 0.09, y + 0.3, z], 'charcoal'),
    kit.box([0.03, 0.02, 0.16], [ox + 0.15, y + 0.27, z], 'charcoal'),
  ];
}

/** จุดเช่าจักรยาน: a small kiosk with a counter window and a row of colourful bikes in a rack. */
export const item: ItemModel = {
  id: 'bike-rental',
  name: 'จุดเช่าจักรยาน',
  category: 'vehicle',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.94, BASE, 1.94], [0, BASE / 2, 0], 'stone'),
      // kiosk
      kit.box([KIOSK.w, KIOSK.h, KIOSK.d], [KIOSK.x, BASE + KIOSK.h / 2, 0], 'cream'),
      kit.box([KIOSK.w + 0.04, 0.06, KIOSK.d + 0.04], [KIOSK.x, BASE + 0.03, 0], 'teal'),
      ...gableRoof(kit, { at: [KIOSK.x, BASE + KIOSK.h, 0], length: 1.5, width: KIOSK.w, rise: 0.3, eave: 0.08, color: 'red', ridge: 'redDark' }),
      kit.wedge([KIOSK.w, 0.3, KIOSK.d], [KIOSK.x, BASE + KIOSK.h + 0.15, 0], 'cream'),
      ...glassWindow(kit, { at: [WALL_FRONT, BASE + 0.58, 0], facing: 'x+', w: 0.7, h: 0.26, frame: 'teal', panes: 3 }),
      // counter shelf and a round "bike wheel" picture sign over the window
      kit.box([0.14, 0.04, 0.84], [WALL_FRONT + 0.07, BASE + 0.4, 0], 'wood'),
      kit.torus(0.07, 0.02, [WALL_FRONT + 0.02, BASE + 0.76, -0.38], 'sunYellow', { radialSegments: 4, tubularSegments: 8 }),
      kit.torus(0.07, 0.02, [WALL_FRONT + 0.02, BASE + 0.76, -0.14], 'sunYellow', { radialSegments: 4, tubularSegments: 8 }),
      // rack rail along z with three posts; bikes stand with the front wheel in it
      kit.box([0.06, 0.05, 1.7], [0.72, BASE + 0.025, 0], 'stoneDark'),
    ];
    parts.push(...bike(kit, 0.4, -0.65, 'red'), ...bike(kit, 0.4, 0, 'sunYellow'), ...bike(kit, 0.4, 0.65, 'blue'));
    // chrome loops over the rail
    for (const z of [-0.325, 0.325]) {
      parts.push(
        kit.torus(0.1, 0.02, [0.72, BASE + 0.05, z], 'chrome', {
          radialSegments: 4,
          tubularSegments: 8,
          arc: Math.PI,
          rotate: [0, Math.PI / 2, 0],
        }),
      );
    }
    return kit.finish(parts);
  },
};
