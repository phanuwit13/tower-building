import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, gableRoof, glassWindow, rod } from '../../../models/parts';

// The village's signature house: a wooden cabin on tall posts, a plain steep red gable roof, a veranda and a
// front stair on +x, lit windows, and the open space underneath with a hammock, a bamboo bench and a water jar.
const FLOOR = { x0: -0.9, x1: 0.7, z: 1.3, y: 0.75, h: 0.08 }; // deck: top at FLOOR.y
const CABIN = { cx: -0.275, w: 0.95, d: 2.2, h: 0.8 }; // walls stand on the deck; the veranda is the deck in front (+x)
const WALL_TOP = FLOOR.y + CABIN.h;
const ROOF = { rise: 0.62, eave: 0.18, length: 2.4 };
const POST = { r: 0.06, xs: [-0.8, 0.6], zs: [-1.2, 0, 1.2] };
const WIN = { w: 0.3, h: 0.3, y: FLOOR.y + 0.42 };
const FRONT_X = CABIN.cx + CABIN.w / 2; // the +x wall
const STAIR = { x0: 0.7, run: 0.065, rise: 0.1875, hw: 0.28 };

/** Slung hammock between the two posts at z = 0, along x: cloth in alternating stripes. */
function hammock(kit: Parameters<ItemModel['build']>[0], parts: Part[]): void {
  const x0 = POST.xs[0] + POST.r;
  const x1 = POST.xs[1] - POST.r;
  const endY = 0.58;
  const sag = 0.26;
  const N = 7;
  const pt = (i: number): [number, number, number] => {
    const t = i / N;
    const u = 2 * t - 1;
    return [x0 + (x1 - x0) * t, endY - sag * (1 - u * u), 0];
  };
  for (let i = 0; i < N; i++) {
    const a = pt(i);
    const b = pt(i + 1);
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const mid = (i + 0.5) / N;
    const w = 0.1 + 0.22 * Math.sqrt(1 - (2 * mid - 1) ** 2);
    parts.push(
      kit.box([len * 1.1, 0.03, w], [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0], i % 2 === 0 ? 'orange' : 'cream', {
        rotate: [0, 0, Math.atan2(b[1] - a[1], b[0] - a[0])],
      }),
    );
  }
  parts.push(
    rod(kit, [POST.xs[0] + 0.03, endY + 0.05, 0], pt(0), 0.015, 'stoneDark', { segments: 4 }),
    rod(kit, [POST.xs[1] - 0.03, endY + 0.05, 0], pt(N), 0.015, 'stoneDark', { segments: 4 }),
  );
}

/** บ้านไม้ใต้ถุนสูง: a wooden stilt house with a steep roof, a front stair and a veranda; hammock and bench below. */
export const item: ItemModel = {
  id: 'stilt-house',
  name: 'บ้านไม้ใต้ถุนสูง',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [];
    // posts under the deck
    for (const x of POST.xs) {
      for (const z of POST.zs) {
        parts.push(kit.cylinder(POST.r, POST.r, FLOOR.y - FLOOR.h / 2, [x, (FLOOR.y - FLOOR.h / 2) / 2, z], 'woodDark', { segments: 8 }));
      }
    }
    parts.push(
      kit.box([FLOOR.x1 - FLOOR.x0, FLOOR.h, 2 * FLOOR.z], [(FLOOR.x0 + FLOOR.x1) / 2, FLOOR.y - FLOOR.h / 2, 0], 'woodDark'),
      // the cabin
      kit.box([CABIN.w, CABIN.h, CABIN.d], [CABIN.cx, FLOOR.y + CABIN.h / 2, 0], 'wood'),
      kit.wedge([CABIN.w, ROOF.rise, CABIN.d], [CABIN.cx, WALL_TOP + ROOF.rise / 2, 0], 'cream'),
      ...gableRoof(kit, { at: [CABIN.cx, WALL_TOP, 0], length: ROOF.length, width: CABIN.w, rise: ROOF.rise, eave: ROOF.eave, color: 'red', ridge: 'redDark' }),
    );
    // windows (lit at night) and the front door
    const winY = WIN.y;
    for (const z of [-0.65, 0.65]) {
      parts.push(...glassWindow(kit, { at: [FRONT_X, winY, z], facing: 'x+', w: WIN.w, h: WIN.h, frame: 'teal' }));
    }
    for (const z of [-0.6, 0.6]) {
      parts.push(...glassWindow(kit, { at: [CABIN.cx - CABIN.w / 2, winY, z], facing: 'x-', w: WIN.w, h: WIN.h, frame: 'teal' }));
    }
    parts.push(
      ...glassWindow(kit, { at: [CABIN.cx, winY, CABIN.d / 2], facing: 'z+', w: WIN.w, h: WIN.h, frame: 'teal' }),
      ...glassWindow(kit, { at: [CABIN.cx, winY, -CABIN.d / 2], facing: 'z-', w: WIN.w, h: WIN.h, frame: 'teal' }),
      ...door(kit, { at: [FRONT_X, FLOOR.y + 0.35, 0], facing: 'x+', w: 0.36, h: 0.7, color: 'woodDark', knob: 'sunYellow' }),
    );
    // veranda railing along the front edge (gap at the stair) and the two ends
    const railX = FLOOR.x1 - 0.03;
    const railY = FLOOR.y + 0.36;
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([0.04, 0.04, 0.95], [railX, railY, s * 0.775], 'wood'),
        kit.box([FLOOR.x1 - FRONT_X, 0.04, 0.04], [(FLOOR.x1 + FRONT_X) / 2, railY, s * (FLOOR.z - 0.03)], 'wood'),
      );
      for (const z of [0.3, 0.775, 1.25]) parts.push(kit.box([0.04, 0.36, 0.04], [railX, FLOOR.y + 0.18, s * z], 'wood'));
      parts.push(kit.box([0.04, 0.36, 0.04], [FRONT_X + 0.05, FLOOR.y + 0.18, s * (FLOOR.z - 0.03)], 'wood'));
    }
    // front stair with two stringers
    for (let i = 1; i <= 3; i++) {
      const top = FLOOR.y - STAIR.rise * i;
      parts.push(kit.box([STAIR.run, 0.04, 2 * STAIR.hw - 0.04], [STAIR.x0 + STAIR.run * (i - 0.5), top - 0.02, 0], 'sand'));
    }
    for (const s of [-1, 1]) {
      parts.push(rod(kit, [STAIR.x0, FLOOR.y - 0.03, s * STAIR.hw], [STAIR.x0 + 4 * STAIR.run, 0.03, s * STAIR.hw], 0.03, 'woodDark', { segments: 6 }));
    }
    // flower pots on the veranda
    for (const z of [-1.0, 1.0]) {
      parts.push(
        kit.cylinder(0.07, 0.05, 0.1, [FRONT_X + 0.12, FLOOR.y + 0.05, z], 'terracotta', { segments: 8 }),
        kit.sphere(0.08, [FRONT_X + 0.12, FLOOR.y + 0.15, z], z < 0 ? 'pink' : 'sunYellow', { detail: 0 }),
      );
    }
    // under the house: hammock between the middle posts, a bamboo bench and a water jar
    hammock(kit, parts);
    const benchZ = -0.75;
    for (let i = 0; i < 4; i++) parts.push(kit.box([1.0, 0.035, 0.07], [-0.1, 0.33, benchZ - 0.15 + 0.1 * i], 'sand'));
    for (const x of [-0.5, 0.3]) {
      for (const z of [benchZ - 0.15, benchZ + 0.15]) parts.push(kit.box([0.05, 0.315, 0.05], [x, 0.1575, z], 'wood'));
    }
    parts.push(
      kit.cylinder(0.16, 0.12, 0.32, [-0.45, 0.16, 0.8], 'terracotta', { segments: 8 }),
      kit.cylinder(0.17, 0.17, 0.03, [-0.45, 0.335, 0.8], 'redDark', { segments: 8 }),
      kit.cylinder(0.14, 0.12, 0.2, [0.2, 0.1, 0.85], 'sand', { segments: 8 }), // rice basket
    );
    return kit.finish(parts);
  },
};
