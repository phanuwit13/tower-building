import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A monitor on a wheeled stand, face tilted up towards the camera: a big pixel heart and a simple pulse line that blink.
const SCR_Y = 1.0;
const TILT = 0.3; // the face turns up about z
const CELL = 0.03;
const BLINK = { glow: true, light: 'blink' } as const;

/** จอวัดชีพจร: a monitor on a stand with a heart picture and a blinking line. */
export const item: ItemModel = {
  id: 'heart-monitor',
  name: 'จอวัดชีพจร',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const c = Math.cos(TILT);
    const s = Math.sin(TILT);
    // monitor-local (dx out of the face, dy up the face, dz across) to world
    const at = (dx: number, dy: number, dz: number): [number, number, number] => [dx * c - dy * s, SCR_Y + dx * s + dy * c, dz];
    const mon = (size: [number, number, number], dx: number, dy: number, dz: number, color: Parameters<typeof kit.box>[2], lit = false): Part =>
      kit.box(size, at(dx, dy, dz), color, { rotate: [0, 0, TILT], ...(lit ? BLINK : {}) });

    const parts: Part[] = [
      // wheeled star base, pole, a small tray basket
      kit.cylinder(0.05, 0.06, 0.04, [0, 0.07, 0], 'stoneDark', { segments: 8 }),
      kit.cylinder(0.03, 0.03, 0.62, [0, 0.4, 0], 'chrome', { segments: 8 }),
      kit.box([0.42, 0.03, 0.06], [0, 0.06, 0], 'white'),
      kit.box([0.06, 0.03, 0.42], [0, 0.06, 0], 'white'),
      kit.box([0.26, 0.12, 0.3], [0.04, 0.5, 0], 'mint'),
      kit.box([0.02, 0.05, 0.2], [0.18, 0.5, 0], 'teal'),
      kit.box([0.22, 0.03, 0.26], [0.04, 0.575, 0], 'white'),
      kit.box([0.04, 0.1, 0.12], [0, SCR_Y - 0.19, 0], 'chrome'),
      // the monitor: back, frame, dark face
      mon([0.1, 0.26, 0.4], 0, 0, 0, 'white'),
      mon([0.04, 0.22, 0.36], 0.05, 0, 0, 'teal'),
      mon([0.02, 0.18, 0.32], 0.07, 0, 0, 'navy'),
    ];
    for (const z of [-0.18, 0.18]) {
      for (const x of [-0.18, 0.18]) {
        parts.push(kit.cylinder(0.045, 0.045, 0.03, [x, 0.045, z], 'charcoal', { segments: 8, rotate: [Math.PI / 2, 0, 0] }));
      }
    }
    // pixel heart on the left half (rows from the top), lit pink
    const fx = 0.09;
    const hz = -0.08;
    const hy0 = 0.045;
    const rows: [number, number][][] = [
      [[-2, -1], [1, 2]],
      [[-2, 2]],
      [[-1, 1]],
      [[0, 0]],
    ];
    rows.forEach((row, r) => {
      for (const [a, b] of row) {
        const n = b - a + 1;
        parts.push(mon([0.012, CELL, CELL * n], fx, hy0 - r * CELL, hz + ((a + b) / 2) * CELL, 'pink', true));
      }
    });
    // pulse line on the right half, built from straight blocks: flat, up, down, flat (lime, lit)
    const lz = 0.0;
    parts.push(
      mon([0.012, 0.014, 0.05], fx, -0.01, lz + 0.025, 'lime', true),
      mon([0.012, 0.07, 0.014], fx, 0.02, lz + 0.057, 'lime', true),
      mon([0.012, 0.014, 0.03], fx, 0.055, lz + 0.074, 'lime', true),
      mon([0.012, 0.09, 0.014], fx, 0.01, lz + 0.091, 'lime', true),
      mon([0.012, 0.014, 0.06], fx, -0.035, lz + 0.115, 'lime', true),
    );
    // little coloured buttons under the picture (not lit)
    parts.push(mon([0.012, 0.022, 0.03], fx - 0.01, -0.075, -0.12, 'sunYellow'), mon([0.012, 0.022, 0.03], fx - 0.01, -0.075, -0.07, 'white'));
    return kit.finish(parts);
  },
};
