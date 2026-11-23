import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A small consulting room (2×2): desk with a screen and a heart model, a breathing desk lamp, a doctor's chair,
// two patient chairs and a bookshelf of colour-block books. Front faces +x.
const RUG = { s: 1.9, h: 0.03 };
const DESK = { x: -0.4, z: 0.1, w: 0.6, d: 0.95, top: 0.5, t: 0.04 };
const SEAT_Y = 0.31;

/** ห้องหมอ: a doctor's desk with a screen and a heart model, two chairs, a bookshelf and a desk lamp. */
export const item: ItemModel = {
  id: 'doctor-office',
  name: 'ห้องหมอ',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([RUG.s, RUG.h, RUG.s], [0, RUG.h / 2, 0], 'glassBlue')];
    // desk: top, two side panels
    parts.push(kit.box([DESK.w, DESK.t, DESK.d], [DESK.x, DESK.top - DESK.t / 2, DESK.z], 'wood'));
    for (const s of [-1, 1]) parts.push(kit.box([DESK.w - 0.06, DESK.top - DESK.t - RUG.h, 0.05], [DESK.x, (DESK.top - DESK.t + RUG.h) / 2, DESK.z + s * (DESK.d / 2 - 0.05)], 'woodDark'));
    const ty = DESK.top;
    // screen on a stand (about 0.25 x 0.18), facing +x
    parts.push(
      kit.box([0.1, 0.02, 0.12], [DESK.x - 0.12, ty + 0.01, DESK.z - 0.22], 'charcoal'),
      kit.box([0.03, 0.09, 0.03], [DESK.x - 0.12, ty + 0.06, DESK.z - 0.22], 'charcoal'),
      kit.box([0.03, 0.18, 0.25], [DESK.x - 0.12, ty + 0.18, DESK.z - 0.22], 'charcoal'),
      kit.box([0.02, 0.14, 0.2], [DESK.x - 0.1, ty + 0.18, DESK.z - 0.22], 'skyBlue', { glow: 'windowWarm' }),
      kit.box([0.025, 0.04, 0.06], [DESK.x - 0.09, ty + 0.2, DESK.z - 0.22], 'pink'),
      kit.box([0.025, 0.04, 0.06], [DESK.x - 0.09, ty + 0.14, DESK.z - 0.3], 'lime'),
    );
    // heart model: two lobes and a point, on a small white stand
    const hz = DESK.z + 0.22;
    parts.push(
      kit.cylinder(0.07, 0.08, 0.02, [DESK.x + 0.05, ty + 0.01, hz], 'white', { segments: 8 }),
      kit.cylinder(0.015, 0.015, 0.05, [DESK.x + 0.05, ty + 0.045, hz], 'white', { segments: 6 }),
      kit.sphere(0.065, [DESK.x + 0.05, ty + 0.14, hz - 0.05], 'red', { detail: 1 }),
      kit.sphere(0.065, [DESK.x + 0.05, ty + 0.14, hz + 0.05], 'red', { detail: 1 }),
      kit.cone(0.1, 0.12, [DESK.x + 0.05, ty + 0.1, hz], 'red', { segments: 8, rotate: [Math.PI, 0, 0] }),
      kit.sphere(0.02, [DESK.x + 0.12, ty + 0.17, hz - 0.06], 'pink', { detail: 0 }),
    );
    // desk lamp: base, arm, breathing shade
    const lz = DESK.z - 0.38;
    parts.push(
      kit.cylinder(0.05, 0.06, 0.02, [DESK.x + 0.15, ty + 0.01, lz], 'teal', { segments: 8 }),
      kit.cylinder(0.012, 0.012, 0.2, [DESK.x + 0.15, ty + 0.12, lz], 'chrome', { segments: 6 }),
      kit.sphere(0.07, [DESK.x + 0.15, ty + 0.25, lz], 'lampWarm', { detail: 1, glow: true, light: 'breathe' }),
    );
    // doctor's chair (behind the desk, facing +x) and two patient chairs (facing -x)
    const chair = (x: number, z: number, dir: 1 | -1, c: 'teal' | 'blue'): void => {
      parts.push(
        kit.box([0.34, 0.05, 0.34], [x, SEAT_Y - 0.025, z], c),
        kit.box([0.05, 0.31 - 0.05, 0.05], [x - 0.13, (SEAT_Y - 0.05) / 2, z - 0.13], 'chrome'),
        kit.box([0.05, 0.31 - 0.05, 0.05], [x - 0.13, (SEAT_Y - 0.05) / 2, z + 0.13], 'chrome'),
        kit.box([0.05, 0.31 - 0.05, 0.05], [x + 0.13, (SEAT_Y - 0.05) / 2, z - 0.13], 'chrome'),
        kit.box([0.05, 0.31 - 0.05, 0.05], [x + 0.13, (SEAT_Y - 0.05) / 2, z + 0.13], 'chrome'),
        // backrest on the far side from the desk
        kit.box([0.05, 0.3, 0.34], [x - dir * 0.145, SEAT_Y + 0.15, z], c),
      );
    };
    chair(-0.82, DESK.z, 1, 'teal');
    chair(0.3, DESK.z - 0.3, -1, 'blue');
    chair(0.3, DESK.z + 0.35, -1, 'blue');
    // bookshelf along the -z side
    const SX = 0.1, SZ = -0.82, SW = 1.0, SD = 0.22, SH = 1.2;
    parts.push(
      kit.box([SW, SH, 0.04], [SX, SH / 2, SZ - SD / 2 + 0.02], 'woodDark'),
      kit.box([0.04, SH, SD], [SX - SW / 2 + 0.02, SH / 2, SZ], 'wood'),
      kit.box([0.04, SH, SD], [SX + SW / 2 - 0.02, SH / 2, SZ], 'wood'),
    );
    for (const y of [0.02, 0.42, 0.82, SH - 0.02]) parts.push(kit.box([SW, 0.04, SD], [SX, y, SZ], 'wood'));
    const books = ['red', 'blue', 'sunYellow', 'leaf', 'purple', 'orange', 'teal', 'pink'] as const;
    for (const [row, y] of [[0, 0.24], [1, 0.64], [2, 1.04]] as const) {
      for (let i = 0; i < 8; i++) {
        const h = 0.22 + ((i + row) % 3) * 0.04;
        parts.push(kit.box([0.08, h, 0.14], [SX - 0.38 + i * 0.105, y - 0.2 + h / 2 + 0.0, SZ + 0.02], books[(i + row * 3) % books.length]));
      }
    }
    return kit.finish(parts);
  },
};
