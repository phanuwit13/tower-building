import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { wheel } from '../../../models/parts';

// A little open tram car (1x2, long side along z, sides face +x): a low red body on four wheels, two wooden
// bench rows inside, four posts under a red-and-white striped pitched roof, a lamp at each end.
const BODY = { w: 0.64, l: 1.8, y0: 0.14, h: 0.06 }; // the floor slab
const SIDE = { h: 0.22, t: 0.05 }; // low side walls above the floor
const FLOOR_TOP = BODY.y0 + BODY.h; // 0.2
const POST = { x: 0.28, z: 0.78, top: 0.9 };
const ROOF = { y: POST.top, w: 0.72, strip: 0.26, rise: 0.12, n: 7 };

/** รถรางชมสวน: an open tram car with a striped roof. */
export const item: ItemModel = {
  id: 'park-tram',
  name: 'รถรางชมสวน',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BODY.w, BODY.h, BODY.l], [0, BODY.y0 + BODY.h / 2, 0], 'red'),
      kit.box([BODY.w + 0.04, 0.03, BODY.l + 0.04], [0, BODY.y0 + 0.015, 0], 'redDark'), // skirt band
      kit.box([BODY.w - 0.1, 0.02, BODY.l - 0.1], [0, FLOOR_TOP + 0.01, 0], 'woodDark'), // floorboards
    ];
    for (const s of [-1, 1]) {
      // low side wall, both sides, with a yellow top rail
      parts.push(
        kit.box([SIDE.t, SIDE.h, BODY.l - 0.04], [s * (BODY.w / 2 - SIDE.t / 2), FLOOR_TOP + SIDE.h / 2, 0], 'red'),
        kit.box([SIDE.t + 0.02, 0.03, BODY.l - 0.04], [s * (BODY.w / 2 - SIDE.t / 2), FLOOR_TOP + SIDE.h + 0.015, 0], 'sunYellow'),
      );
    }
    // two bench rows facing the front, with low backs
    for (const z of [-0.38, 0.38]) {
      parts.push(
        kit.box([0.46, 0.04, 0.24], [0, 0.34, z], 'wood'),
        kit.box([0.46, 0.2, 0.04], [0, 0.44, z - 0.12 * Math.sign(z)], 'woodDark'),
        kit.box([0.04, 0.14, 0.2], [0.18, 0.27, z], 'woodDark'),
        kit.box([0.04, 0.14, 0.2], [-0.18, 0.27, z], 'woodDark'),
      );
    }
    // wheels: two each side, rolling along z
    for (const x of [-0.31, 0.31]) {
      for (const z of [-0.6, 0.6]) parts.push(...wheel(kit, { at: [x, 0.12, z], radius: 0.08, tube: 0.04, axis: 'x', color: 'charcoal', hubColor: 'chrome', hubRadius: 0.035, hubLength: 0.04 }));
    }
    // posts and the striped pitched roof (each strip a wedge, ridge along z, alternating red and white)
    for (const x of [-POST.x, POST.x]) {
      for (const z of [-POST.z, POST.z]) parts.push(kit.cylinder(0.03, 0.03, POST.top - FLOOR_TOP, [x, (POST.top + FLOOR_TOP) / 2, z], 'white', { segments: 8 }));
    }
    for (let i = 0; i < ROOF.n; i++) {
      const z = (i - (ROOF.n - 1) / 2) * ROOF.strip;
      parts.push(kit.wedge([ROOF.w, ROOF.rise, ROOF.strip], [0, ROOF.y + ROOF.rise / 2, z], i % 2 === 0 ? 'red' : 'white'));
    }
    parts.push(kit.box([ROOF.w, 0.03, ROOF.strip * ROOF.n], [0, ROOF.y - 0.015, 0], 'stone'));
    // a lamp at each end, and a coupling bar
    for (const s of [-1, 1]) {
      parts.push(
        kit.sphere(0.07, [0, 0.3, s * (BODY.l / 2 + 0.03)], 'lampWarm', { detail: 0, glow: true, light: 'breathe' }),
        kit.box([0.08, 0.03, 0.06], [0, 0.17, s * (BODY.l / 2 + 0.02)], 'charcoal'),
      );
    }
    return kit.finish(parts);
  },
};
