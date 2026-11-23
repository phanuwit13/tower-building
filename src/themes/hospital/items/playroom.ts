import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

// A playroom (2×3): soft foam mats, a little slide with steps, a toy shelf and toy box, a tower of blocks, and a string of
// lights between two poles along the front (+x). The bulbs stay still; the light running along the string is the chase.
const MAT = { s: 0.96, h: 0.03 };
const MATS: PaletteColor[] = ['sunYellow', 'skyBlue', 'lime', 'pink', 'orange', 'mint']; // row by row: x -, x +
const LIGHT = { x: 0.9, z: 1.4, top: 1.35, sag: 0.14, bulbs: 14 };
const BULB_COLOURS: PaletteColor[] = ['lampWarm', 'pink', 'sunYellow', 'skyBlue', 'lime'];
const SHELF = { x: -0.8, zc: -0.8, d: 0.3, len: 1.3, h: 0.8, t: 0.04 };

/** ห้องเด็กเล่น: soft mats, a little slide, building blocks, toy shelves and string lights. */
export const item: ItemModel = {
  id: 'playroom',
  name: 'ห้องเด็กเล่น',
  category: 'play',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [];
    const m = MAT.h;
    // mats: 2 columns x 3 rows
    MATS.forEach((c, i) => parts.push(kit.box([MAT.s, m, MAT.s], [i % 2 === 0 ? -0.5 : 0.5, m / 2, (Math.floor(i / 2) - 1) * 1.0], c)));

    // toy shelf along the -x side (back), toys in two bays
    const inner = SHELF.len - 2 * SHELF.t;
    parts.push(
      kit.box([0.03, SHELF.h, SHELF.len], [SHELF.x - SHELF.d / 2 + 0.015, SHELF.h / 2 + m, SHELF.zc], 'blue'),
      kit.box([SHELF.d, SHELF.h, SHELF.t], [SHELF.x, SHELF.h / 2 + m, SHELF.zc + SHELF.len / 2 - SHELF.t / 2], 'blue'),
      kit.box([SHELF.d, SHELF.h, SHELF.t], [SHELF.x, SHELF.h / 2 + m, SHELF.zc - SHELF.len / 2 + SHELF.t / 2], 'blue'),
      kit.box([SHELF.d, SHELF.t, inner], [SHELF.x, m + SHELF.t / 2, SHELF.zc], 'blue'),
      kit.box([SHELF.d, SHELF.t, inner], [SHELF.x, m + 0.4, SHELF.zc], 'blue'),
      kit.box([SHELF.d + 0.02, SHELF.t, SHELF.len], [SHELF.x + 0.01, m + SHELF.h - SHELF.t / 2, SHELF.zc], 'sunYellow'),
    );
    const toys: Array<[number, number, number, PaletteColor, 'cube' | 'ball']> = [
      // level (0 bottom, 1 middle), z offset, size, colour, kind
      [0, -0.5, 0.14, 'red', 'cube'], [0, -0.3, 0.12, 'sunYellow', 'ball'], [0, -0.12, 0.16, 'lime', 'cube'], [0, 0.1, 0.13, 'pink', 'ball'], [0, 0.32, 0.15, 'orange', 'cube'], [0, 0.52, 0.12, 'purple', 'ball'],
      [1, -0.5, 0.12, 'skyBlue', 'ball'], [1, -0.3, 0.15, 'orange', 'cube'], [1, -0.1, 0.13, 'red', 'ball'], [1, 0.12, 0.16, 'leaf', 'cube'], [1, 0.34, 0.12, 'sunYellow', 'cube'], [1, 0.53, 0.14, 'pink', 'cube'],
    ];
    for (const [level, dz, s, c, kind] of toys) {
      const y = level === 0 ? m + SHELF.t : m + 0.4 + SHELF.t / 2;
      const at: Vec3 = [SHELF.x + 0.02, y + s / 2, SHELF.zc + dz];
      parts.push(kind === 'cube' ? kit.box([s, s, s], at, c, { rotate: [0, dz * 2, 0] }) : kit.sphere(s / 2, at, c, { detail: 0 }));
    }

    // toy box at the -x side by the shelf, with toys heaped in it
    const BX = -0.78;
    const BZ = 0.12;
    parts.push(
      kit.box([0.42, 0.28, 0.5], [BX, m + 0.14, BZ], 'orange'),
      kit.box([0.34, 0.02, 0.42], [BX, m + 0.285, BZ], 'sunYellow'),
      kit.sphere(0.07, [BX, m + 0.35, BZ - 0.1], 'red', { detail: 0 }),
      kit.sphere(0.07, [BX + 0.02, m + 0.35, BZ + 0.1], 'skyBlue', { detail: 0 }),
      kit.box([0.1, 0.1, 0.1], [BX - 0.04, m + 0.34, BZ], 'lime', { rotate: [0, 0.6, 0] }),
    );

    // slide: a tower with steps up the +z side, a ramp running down towards +x
    const SZ = 0.95;
    const TXC = -0.55;
    const TOP = 0.44;
    const dx = 0.92;
    const dy = TOP - 0.09;
    const ang = Math.atan2(dy, dx);
    const len = Math.hypot(dx, dy);
    const rx = TXC + 0.25 + dx / 2 - 0.08;
    const ry = (TOP + 0.09) / 2;
    parts.push(
      kit.box([0.5, TOP - m, 0.5], [TXC, m + (TOP - m) / 2, SZ], 'orange'),
      kit.box([0.54, 0.04, 0.54], [TXC, TOP + 0.02, SZ], 'sunYellow'),
      kit.box([0.4, 0.2, 0.1], [TXC, m + 0.1, SZ + 0.25 + 0.05], 'red'), // steps up the +z side
      kit.box([0.4, 0.1, 0.1], [TXC, m + 0.05, SZ + 0.25 + 0.15], 'red'),
      kit.box([len, 0.03, 0.34], [rx, ry, SZ], 'blue', { rotate: [0, 0, -ang] }),
      kit.box([len, 0.07, 0.03], [rx, ry + 0.035, SZ - 0.185], 'skyBlue', { rotate: [0, 0, -ang] }),
      kit.box([len, 0.07, 0.03], [rx, ry + 0.035, SZ + 0.185], 'skyBlue', { rotate: [0, 0, -ang] }),
      // a post at each corner of the platform and a little canopy ring: just two rails so it reads as a play tower
      kit.box([0.04, 0.22, 0.04], [TXC - 0.24, TOP + 0.15, SZ - 0.24], 'teal'),
      kit.box([0.04, 0.22, 0.04], [TXC - 0.24, TOP + 0.15, SZ + 0.24], 'teal'),
      kit.box([0.04, 0.04, 0.52], [TXC - 0.24, TOP + 0.26, SZ], 'teal'),
    );

    // building blocks: a tower and a few scattered, on the mats in the middle
    parts.push(
      kit.box([0.26, 0.26, 0.26], [0.3, m + 0.13, -0.15], 'red'),
      kit.box([0.26, 0.26, 0.26], [0.3, m + 0.13, 0.15], 'sunYellow'),
      kit.box([0.26, 0.26, 0.26], [0.3, m + 0.39, 0], 'blue', { rotate: [0, 0.3, 0] }),
      kit.cone(0.15, 0.2, [0.3, m + 0.62, 0], 'lime', { segments: 4, rotate: [0, 0.3, 0] }),
      kit.box([0.2, 0.2, 0.2], [0.5, m + 0.1, 0.45], 'pink', { rotate: [0, 0.5, 0] }),
      kit.box([0.2, 0.2, 0.2], [-0.05, m + 0.1, -0.35], 'orange', { rotate: [0, 0.2, 0] }),
      kit.cylinder(0.1, 0.1, 0.2, [0.55, m + 0.1, -0.55], 'purple', { segments: 8 }),
    );

    // string lights along the front: two poles and a sagging string; bulbs light in turn from -z to +z, but never move
    for (const s of [-1, 1]) {
      parts.push(
        kit.cylinder(0.03, 0.03, LIGHT.top, [LIGHT.x, LIGHT.top / 2, s * LIGHT.z], 'teal', { segments: 8 }),
        kit.sphere(0.05, [LIGHT.x, LIGHT.top, s * LIGHT.z], 'orange', { detail: 0 }),
      );
    }
    const pts: Vec3[] = [];
    for (let i = 0; i < LIGHT.bulbs; i++) {
      const t = i / (LIGHT.bulbs - 1);
      const sag = 4 * t * (1 - t) * LIGHT.sag; // a parabola: nothing at the poles, most in the middle
      pts.push([LIGHT.x, LIGHT.top - 0.02 - sag, (t * 2 - 1) * (LIGHT.z - 0.03)]);
    }
    for (let i = 0; i < pts.length - 1; i++) parts.push(rod(kit, pts[i], pts[i + 1], 0.012, 'charcoal', { segments: 4 }));
    pts.forEach((p, index) => {
      parts.push(kit.sphere(0.04, [p[0], p[1] - 0.04, p[2]], BULB_COLOURS[index % BULB_COLOURS.length], { detail: 0, glow: true, light: 'chase', chase: { index, count: LIGHT.bulbs } }));
    });
    return kit.finish(parts);
  },
};
