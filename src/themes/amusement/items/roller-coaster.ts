import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

// A closed oval track on posts, long side along z. The height rises to a hump at the +z end and sinks to a dip at the -z end.
const BASE = { w: 1.92, h: 0.04, d: 2.92 }; // stone pad
const OVAL = { rx: 0.78, rz: 1.28 }; // track radii (x, z)
const HEIGHT = { mid: 0.66, amp: 0.44 }; // track centre height: mid + amp * sin(a): hump 1.1 at +z, dip 0.22 at -z
const POINTS = 24; // joints round the loop
const RAIL_R = 0.055;
const POST = 0.07; // square post section
const BULB_R = 0.032;
const BULB_OUT = 0.085; // bulbs sit beside the rail, on its outer side
const CAR = { l: 0.3, h: 0.12, w: 0.2 };
const CAR_ANGLES = [-0.69, -0.23, 0.23, 0.69]; // round the crest at the +z end (radians from the top)
const CAR_COLORS: PaletteColor[] = ['blue', 'sunYellow', 'blue', 'sunYellow'];

/** Track centre at angle `a` (0 = +x, rising towards +z). */
const point = (a: number): Vec3 => [OVAL.rx * Math.cos(a), HEIGHT.mid + HEIGHT.amp * Math.sin(a), OVAL.rz * Math.sin(a)];
/** Direction of travel at `a` (not normalised). */
const tangent = (a: number): Vec3 => [-OVAL.rx * Math.sin(a), HEIGHT.amp * Math.cos(a), OVAL.rz * Math.cos(a)];

/** รถไฟเหาะ: a red track on white posts with a hump and a dip, a short train of cars and chase lights along the rail. */
export const item: ItemModel = {
  id: 'roller-coaster',
  name: 'รถไฟเหาะ',
  category: 'ride',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'stone')];
    const angle = (i: number) => (i / POINTS) * Math.PI * 2;
    for (let i = 0; i < POINTS; i++) {
      const p = point(angle(i));
      const q = point(angle(i + 1));
      parts.push(rod(kit, p, q, RAIL_R, 'red', { segments: 4 }));
      if (i % 2 === 0) {
        const h = p[1] - RAIL_R - 0.02 - BASE.h;
        parts.push(kit.box([POST, h, POST], [p[0], BASE.h + h / 2, p[2]], 'white'));
      }
      // chase bulb on the outer side of the rail
      const a = angle(i);
      const nx = Math.cos(a) / OVAL.rx;
      const nz = Math.sin(a) / OVAL.rz;
      const n = Math.hypot(nx, nz);
      parts.push(kit.sphere(BULB_R, [p[0] + (nx / n) * BULB_OUT, p[1], p[2] + (nz / n) * BULB_OUT], 'lampWarm',
        { detail: 0, glow: true, light: 'chase', chase: { index: i, count: POINTS } }));
    }
    CAR_ANGLES.forEach((da, k) => {
      const a = Math.PI / 2 + da;
      const [x, y, z] = point(a);
      const [tx, ty, tz] = tangent(a);
      const rotate: Vec3 = [0, Math.atan2(-tz, tx), Math.atan2(ty, Math.hypot(tx, tz))];
      const top = y + RAIL_R + CAR.h / 2;
      parts.push(
        kit.box([CAR.l, CAR.h, CAR.w], [x, top, z], CAR_COLORS[k], { rotate }),
        kit.box([0.04, 0.1, CAR.w], [x, top + 0.08, z], CAR_COLORS[k], { rotate }),
        kit.sphere(0.055, [x, top + 0.1, z], 'pink', { detail: 0 }),
      );
    });
    return kit.finish(parts);
  },
};
