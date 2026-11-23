import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// Three round fuel tanks (2x2) joined by pipes, each with a ladder and a coloured band.
const BASE = { w: 1.9, d: 1.9, h: 0.05 };
const TANKS: readonly { x: number; z: number; r: number; h: number; color: PaletteColor; band: PaletteColor }[] = [
  { x: 0.42, z: 0.45, r: 0.4, h: 0.85, color: 'white', band: 'red' },
  { x: -0.45, z: 0.4, r: 0.36, h: 0.7, color: 'mint', band: 'blue' },
  { x: -0.05, z: -0.5, r: 0.38, h: 0.78, color: 'sunYellow', band: 'orange' },
];

export const item: ItemModel = {
  id: 'fuel-tanks',
  name: 'ถังเชื้อเพลิง',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const y0 = BASE.h;
    const parts: Part[] = [kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'stoneDark')];
    for (const t of TANKS) {
      parts.push(
        kit.cylinder(t.r, t.r, t.h, [t.x, y0 + t.h / 2, t.z], t.color),
        kit.cylinder(t.r + 0.012, t.r + 0.012, 0.12, [t.x, y0 + t.h * 0.5, t.z], t.band),
        kit.dome(t.r, [t.x, y0 + t.h, t.z], t.color, { scale: [1, 0.55, 1] }),
        kit.cylinder(0.05, 0.05, 0.1, [t.x, y0 + t.h + t.r * 0.55, t.z], 'chrome', { segments: 8 }),
        // ladder on the +x side: two rails and rungs
        kit.box([0.025, t.h, 0.025], [t.x + t.r + 0.02, y0 + t.h / 2, t.z - 0.07], 'chrome'),
        kit.box([0.025, t.h, 0.025], [t.x + t.r + 0.02, y0 + t.h / 2, t.z + 0.07], 'chrome'),
      );
      for (let i = 1; i <= 5; i++) {
        parts.push(kit.box([0.025, 0.025, 0.14], [t.x + t.r + 0.02, y0 + (t.h * i) / 6, t.z], 'chrome'));
      }
    }
    // pipes at y 0.18: one along x from the small tank to the big one, one along z back to the third tank;
    // their ends sit inside the tanks. A red valve wheel marks the junction.
    const [a, b, c] = TANKS;
    const PIPE_Z = 0.12;
    parts.push(
      kit.cylinder(0.04, 0.04, a.x - b.x, [(a.x + b.x) / 2, 0.18, PIPE_Z], 'orange', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.04, 0.04, PIPE_Z - c.z, [c.x, 0.18, (PIPE_Z + c.z) / 2], 'orange', { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
      kit.sphere(0.06, [c.x, 0.18, PIPE_Z], 'orange', { detail: 0 }),
    );
    parts.push(
      kit.cylinder(0.07, 0.07, 0.03, [c.x, 0.3, PIPE_Z], 'red', { segments: 8, rotate: [0, 0, 0] }),
      kit.cylinder(0.025, 0.025, 0.1, [c.x, 0.24, PIPE_Z], 'redDark', { segments: 6 }),
    );
    return kit.finish(parts);
  },
};
