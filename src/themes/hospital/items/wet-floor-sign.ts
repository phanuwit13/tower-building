import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A yellow A-frame sign (ridge along z) with a blue water-drop picture on both faces. No text, no people.
const H = 0.78;
const W = 0.5;
const T = 0.03;
const TILT = 0.2;

/** ป้ายพื้นเปียก: yellow A-frame sign with a water-drop picture. */
export const item: ItemModel = {
  id: 'wet-floor-sign',
  name: 'ป้ายพื้นเปียก',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [];
    const s = Math.sin(TILT);
    const c = Math.cos(TILT);
    const lift = (H / 2) * c + (T / 2) * s; // each panel's lowest corner sits on y = 0
    for (const side of [1, -1]) {
      const a = side * TILT;
      const base = [side * (H / 2) * s, lift];
      // a point on the panel: n out of its face, u up along it (rotated about z by the tilt)
      const place = (n: number, u: number): [number, number, number] => {
        const nn = n * side;
        return [base[0] + nn * Math.cos(a) - u * Math.sin(a), base[1] + nn * Math.sin(a) + u * Math.cos(a), 0];
      };
      parts.push(
        kit.box([T, H, W], [base[0], base[1], 0], 'sunYellow', { rotate: [0, 0, a] }),
        kit.box([0.015, 0.4, 0.34], place(T / 2 + 0.008, 0.0), 'white', { rotate: [0, 0, a] }),
        // the drop: a cone point up on a ball, a pale glint
        kit.cone(0.1, 0.16, place(T / 2 + 0.025, 0.03), 'blue', { segments: 8, rotate: [0, 0, a], scale: [0.25, 1, 1] }),
        kit.sphere(0.095, place(T / 2 + 0.025, -0.05), 'blue', { detail: 1, rotate: [0, 0, a], scale: [0.25, 1, 1] }),
        kit.box([0.01, 0.05, 0.05], place(T / 2 + 0.045, -0.04), 'skyBlue', { rotate: [0, 0, a] }),
      );
    }
    parts.push(kit.box([0.07, 0.04, W], [0, H * c + 0.01, 0], 'orange'));
    return kit.finish(parts);
  },
};
