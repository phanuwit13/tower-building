import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A monitor on a wheeled stand, face to +x: a heart picture and a simple line that blink (small lit parts only).
const FACE_X = 0.06;
const SCR_Y = 1.0;
const BLINK = { glow: true, light: 'blink' } as const;

/** จอวัดชีพจร: a monitor on a stand with a heart picture and a blinking line. */
export const item: ItemModel = {
  id: 'heart-monitor',
  name: 'จอวัดชีพจร',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      // wheeled star base, pole, a small tray basket
      kit.cylinder(0.05, 0.06, 0.04, [0, 0.07, 0], 'stoneDark', { segments: 8 }),
      kit.cylinder(0.03, 0.03, 0.62, [0, 0.4, 0], 'chrome', { segments: 8 }),
      kit.box([0.42, 0.03, 0.06], [0, 0.06, 0], 'white'),
      kit.box([0.06, 0.03, 0.42], [0, 0.06, 0], 'white'),
      kit.box([0.26, 0.12, 0.3], [0.04, 0.5, 0], 'mint'),
      kit.box([0.02, 0.05, 0.2], [0.18, 0.5, 0], 'teal'),
      kit.box([0.22, 0.03, 0.26], [0.04, 0.575, 0], 'white'),
      // the monitor: back, frame, dark face
      kit.box([0.1, 0.26, 0.4], [0, SCR_Y, 0], 'white'),
      kit.box([0.04, 0.22, 0.36], [FACE_X - 0.01, SCR_Y, 0], 'teal'),
      kit.box([0.02, 0.18, 0.32], [FACE_X + 0.01, SCR_Y, 0], 'navy'),
      kit.box([0.04, 0.1, 0.12], [0, SCR_Y - 0.18, 0], 'chrome'),
    ];
    for (const z of [-0.18, 0.18]) {
      for (const x of [-0.18, 0.18]) {
        parts.push(kit.cylinder(0.045, 0.045, 0.03, [x, 0.045, z + (x > 0 ? 0 : 0)], 'charcoal', { segments: 8, rotate: [Math.PI / 2, 0, 0] }));
      }
    }
    // heart picture (left of the screen): two lobes and a point, lit pink
    const hz = -0.1;
    const hy = SCR_Y + 0.025;
    const hx = FACE_X + 0.03;
    parts.push(
      kit.cylinder(0.034, 0.034, 0.012, [hx, hy + 0.02, hz - 0.028], 'pink', { segments: 8, rotate: [0, 0, Math.PI / 2], ...BLINK }),
      kit.cylinder(0.034, 0.034, 0.012, [hx, hy + 0.02, hz + 0.028], 'pink', { segments: 8, rotate: [0, 0, Math.PI / 2], ...BLINK }),
      kit.box([0.012, 0.05, 0.05], [hx, hy - 0.006, hz], 'pink', { rotate: [Math.PI / 4, 0, 0], ...BLINK }),
    );
    // simple pulse line along the bottom: flat, up, down, flat (lime, lit)
    const ly = SCR_Y - 0.045;
    const seg = (z0: number, y0: number, z1: number, y1: number) => {
      const dz = z1 - z0;
      const dy = y1 - y0;
      const len = Math.hypot(dz, dy);
      return kit.box([0.012, 0.014, len + 0.008], [hx, (y0 + y1) / 2, (z0 + z1) / 2], 'lime', { rotate: [-Math.atan2(dy, dz), 0, 0], ...BLINK });
    };
    parts.push(
      seg(-0.14, ly, -0.05, ly),
      seg(-0.05, ly, -0.01, ly + 0.07),
      seg(-0.01, ly + 0.07, 0.03, ly - 0.03),
      seg(0.03, ly - 0.03, 0.06, ly),
      seg(0.06, ly, 0.14, ly),
    );
    // little coloured buttons under the line (not lit)
    parts.push(
      kit.box([0.012, 0.022, 0.03], [hx - 0.01, SCR_Y - 0.075, -0.12], 'sunYellow'),
      kit.box([0.012, 0.022, 0.03], [hx - 0.01, SCR_Y - 0.075, -0.07], 'white'),
      kit.box([0.012, 0.05, 0.1], [hx - 0.01, SCR_Y + 0.06, 0.09], 'blue'),
    );
    return kit.finish(parts);
  },
};
