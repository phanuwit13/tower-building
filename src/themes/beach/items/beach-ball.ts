import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

const SAND = { r: 0.48, h: 0.03 }; // a sand dimple the ball rests in
const R = 0.4; // ball radius
const CENTER_Y = SAND.h + R - 0.02;
const TILT = 0.5; // the ball's axis leans, so the stripes run at an angle
/** Bands from the top pole to the bottom pole (equal angles). */
const BANDS: PaletteColor[] = ['red', 'white', 'sunYellow', 'blue', 'white', 'orange'];

/** ลูกบอลชายหาด: a big striped beach ball resting on the sand (a stack of coloured bands, tilted). */
export const item: ItemModel = {
  id: 'beach-ball',
  name: 'ลูกบอลชายหาด',
  category: 'play',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [kit.cylinder(SAND.r, SAND.r, SAND.h, [0, SAND.h / 2, 0], 'sand', { segments: 12 })];
    const sx = Math.sin(TILT);
    const cx = Math.cos(TILT);
    const rotate: [number, number, number] = [0, 0, TILT]; // +y turns towards -x, then the ball is moved up
    BANDS.forEach((color, i) => {
      const t0 = (i / BANDS.length) * Math.PI;
      const t1 = ((i + 1) / BANDS.length) * Math.PI;
      const y0 = R * Math.cos(t0);
      const y1 = R * Math.cos(t1);
      const mid = (y0 + y1) / 2; // along the ball's own axis
      // the band's centre on the ball's tilted axis (axis direction = (-sin, cos) in x-y)
      parts.push(kit.cylinder(R * Math.sin(t0), R * Math.sin(t1), y0 - y1, [-mid * sx, CENTER_Y + mid * cx, 0], color, { segments: 14, rotate }));
    });
    parts.push(kit.cylinder(0.025, 0.025, 0.04, [-(R + 0.01) * sx, CENTER_Y + (R + 0.01) * cx, 0], 'white', { segments: 6, rotate })); // the valve
    return kit.finish(parts);
  },
};
