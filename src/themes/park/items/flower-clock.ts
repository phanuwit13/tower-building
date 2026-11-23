import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A flower clock (2x2): a grassy slope (a ramp: tall at -x, falling to the front, +x) with a big round clock
// face lying in it, planted with flowers. A yellow rim, twelve dots of colour for the hours (no numbers), and
// two hands that turn slowly from ONE pivot at the centre, about the face's normal.
const SLOPE = { w: 1.96, h: 0.7, d: 1.96 }; // ramp: x from -w/2 (high) down to +w/2 (0)
const TILT = Math.atan2(SLOPE.h, SLOPE.w); // how much the slope leans
const T: [number, number, number] = [Math.cos(TILT), -Math.sin(TILT), 0]; // down the slope (towards +x)
const N: [number, number, number] = [Math.sin(TILT), Math.cos(TILT), 0]; // the face's normal (up and towards +x)
const Z: [number, number, number] = [0, 0, 1];
const ROT: [number, number, number] = [0, 0, -TILT]; // lays a box/cylinder in the slope plane (local y = normal)
const slopeY = (x: number): number => (SLOPE.h * (SLOPE.w / 2 - x)) / SLOPE.w;
const C: [number, number, number] = [0.02, slopeY(0.02), 0]; // face centre on the slope surface
const R = { rim: 0.86, face: 0.79, dots: 0.62 };
const BED = 0.09; // height of the planted bed's top above the slope surface
const HANDS = 0.25; // pivot height above the face's surface, along the normal
const SPIN: MotionOpts = { kind: 'spin', pivot: [C[0] + N[0] * HANDS, C[1] + N[1] * HANDS, C[2] + N[2] * HANDS], axis: N, speed: 0.4 };

/** A point on the face: u across the slope (z), v along it (t: positive = down the slope), h above the surface along the normal. */
const at = (u: number, v: number, h: number): [number, number, number] =>
  [C[0] + Z[0] * u + T[0] * v + N[0] * h, C[1] + Z[1] * u + T[1] * v + N[1] * h, C[2] + Z[2] * u + T[2] * v + N[2] * h];

/** นาฬิกาดอกไม้: a flower-planted clock face on a slope, with two slowly turning hands. */
export const item: ItemModel = {
  id: 'flower-clock',
  name: 'นาฬิกาดอกไม้',
  category: 'decoration',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.wedge([SLOPE.w, SLOPE.h, SLOPE.d], [0, SLOPE.h / 2, 0], 'leaf', { apex: -0.5 }),
      // rim and face, lying in the slope plane
      kit.cylinder(R.rim, R.rim, 0.09, at(0, 0, 0.035), 'sunYellow', { segments: 24, rotate: ROT }),
      kit.cylinder(R.face, R.face, 0.1, at(0, 0, BED - 0.05), 'leaf', { segments: 24, rotate: ROT }),
      kit.cylinder(0.04, 0.04, HANDS, at(0, 0, HANDS / 2), 'navy', { segments: 8, rotate: ROT }), // the pin the hands turn on
    ];
    // twelve hour dots: bigger and warmer on 12, 3, 6, 9
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const big = i % 3 === 0;
      parts.push(kit.sphere(big ? 0.08 : 0.06, at(R.dots * Math.sin(a), -R.dots * Math.cos(a), BED + 0.01), big ? 'red' : 'blue', { detail: 0 }));
    }
    // flowers planted in three rings: round the edge, between the dots and the middle, and in the middle
    const FLOWER: PaletteColor[] = ['pink', 'white', 'purple', 'orange', 'sunYellow'];
    for (const [radius, count, turn] of [[0.73, 18, 0.5], [0.46, 12, 0.2], [0.26, 6, 0.0]] as Array<[number, number, number]>) {
      for (let i = 0; i < count; i++) {
        const a = ((i + turn) / count) * Math.PI * 2;
        parts.push(kit.sphere(0.045, at(radius * Math.sin(a), -radius * Math.cos(a), BED + 0.01), FLOWER[(i + count) % FLOWER.length], { detail: 0 }));
      }
    }
    // bushes and flowers in the slope's four corners, outside the round rim
    for (const [u, v, color] of [[0.84, 0.8, 'leafDark'], [-0.84, 0.8, 'leafDark'], [0.84, -0.8, 'leafDark'], [-0.84, -0.8, 'leafDark']] as Array<[number, number, PaletteColor]>) {
      parts.push(kit.sphere(0.13, at(u, v, 0.03), color, { scale: [1, 0.7, 1] }));
      parts.push(kit.sphere(0.045, at(u * 0.98, v * 0.9, 0.15), u > 0 ? 'pink' : 'sunYellow', { detail: 0 }));
    }
    // the hands: both pivot at the face centre; the hour hand is short and sits under the long minute hand
    parts.push(
      kit.box([0.1, 0.03, 0.36], at(0.18, 0, 0.19), 'navy', { rotate: ROT, motion: { ...SPIN, speed: 0.12 } }),
      kit.box([0.6, 0.03, 0.06], at(0, -0.3, 0.22), 'red', { rotate: ROT, motion: SPIN }),
      kit.sphere(0.07, at(0, 0, HANDS), 'sunYellow', { detail: 0, motion: SPIN }),
    );
    return kit.finish(parts);
  },
};
