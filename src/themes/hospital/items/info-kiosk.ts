import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A wide touch-screen kiosk (1×2, long side along z, screen towards +x) tilted back, showing a picture
// map: sky-blue ground, green garden blocks, a cream road, coloured room blocks and map pins. Lit at night.
const TILT = 0.32; // radians the screen leans back
const BODY = { w: 0.46, d: 1.5, h: 0.85 };
const PIVOT: [number, number] = [0.02, 0.95]; // x, y of the screen centre
const NORMAL: [number, number] = [Math.cos(TILT), Math.sin(TILT)];
const UP: [number, number] = [-Math.sin(TILT), Math.cos(TILT)];

/** ตู้ข้อมูล: a touch-screen kiosk showing a picture map. */
export const item: ItemModel = {
  id: 'info-kiosk',
  name: 'ตู้ข้อมูล',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit: StyleKit) => {
    // a thin box lying on the tilted screen plane: u up the screen, z along it, n out of it
    const flat = (u: number, z: number, n: number, sz: number, sh: number, th: number, color: PaletteColor, glow?: PaletteColor): Part => {
      const at: Vec3 = [PIVOT[0] + UP[0] * u + NORMAL[0] * n, PIVOT[1] + UP[1] * u + NORMAL[1] * n, z];
      return kit.box([th, sh, sz], at, color, { rotate: [0, 0, TILT], ...(glow ? { glow, light: 'window' as const } : {}) });
    };
    const parts: Part[] = [
      kit.box([BODY.w + 0.08, 0.05, BODY.d + 0.08], [0, 0.025, 0], 'charcoal'),
      kit.box([BODY.w, BODY.h - 0.05, BODY.d], [-0.03, 0.05 + (BODY.h - 0.05) / 2, 0], 'teal'),
      kit.box([0.04, 0.4, BODY.d - 0.2], [BODY.w / 2 - 0.03, 0.3, 0], 'mint'),
      // screen housing and the glowing map
      flat(0, 0, 0, 1.4, 0.64, 0.08, 'charcoal'),
      flat(0, 0, 0.05, 1.3, 0.54, 0.02, 'skyBlue', 'skyBlue'),
      flat(-0.17, -0.3, 0.07, 0.6, 0.16, 0.02, 'lime'),
      flat(0.12, 0.35, 0.07, 0.5, 0.2, 0.02, 'leaf'),
      flat(0.0, 0.0, 0.07, 1.2, 0.05, 0.02, 'cream'),
      flat(0.0, -0.1, 0.07, 0.05, 0.5, 0.02, 'cream'),
      flat(0.14, -0.45, 0.07, 0.24, 0.16, 0.02, 'orange'),
      flat(-0.12, 0.45, 0.07, 0.22, 0.16, 0.02, 'pink'),
      flat(0.12, -0.0, 0.07, 0.18, 0.14, 0.02, 'purple'),
    ];
    // pins (round map marks) and a sun icon on the glass
    const pin = (u: number, z: number, c: PaletteColor): void => {
      parts.push(kit.sphere(0.05, [PIVOT[0] + UP[0] * u + NORMAL[0] * 0.09, PIVOT[1] + UP[1] * u + NORMAL[1] * 0.09, z], c, { detail: 0, scale: [0.5, 1, 1] }));
    };
    pin(0.2, -0.45, 'red');
    pin(-0.06, 0.45, 'sunYellow');
    pin(0.05, 0.0, 'blue');
    // top lamp strip and a small foot step
    parts.push(
      flat(0.34, 0, 0, 1.4, 0.04, 0.1, 'sunYellow', 'lampWarm'),
      kit.box([0.14, 0.03, BODY.d - 0.3], [0.32, 0.015 + 0.02, 0], 'stoneDark'),
    );
    return kit.finish(parts);
  },
};
