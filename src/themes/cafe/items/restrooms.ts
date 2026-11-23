import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// Two small cubicles side by side. The camera sees the +x and +z faces, so one door is on each: a
// teal door on +x, an orange door on +z, each under a big picture sign that leans back towards the
// camera. The walls are low and the roof is open beams, so the white toilets show from above.
const SIZE = 1.8;
const FLOOR_H = 0.04;
const WALL = { t: 0.06, h: 0.9 };
const DOOR = { w: 0.6, h: 0.72, t: 0.04 };
const SIGN = { s: 0.42, tilt: 0.55 }; // leans back by `tilt` radians, sitting on top of the wall

/** ห้องน้ำ: a small block with two coloured doors, each with a picture sign (no text). */
export const item: ItemModel = {
  id: 'restrooms',
  name: 'ห้องน้ำ',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const half = SIZE / 2;
    const face = half - 0.05; // outer face of the front (+x) and side (+z) walls
    const wallY = FLOOR_H + WALL.h / 2;
    const top = FLOOR_H + WALL.h;
    const parts: Part[] = [
      kit.box([SIZE, FLOOR_H, SIZE], [0, FLOOR_H / 2, 0], 'mint'),
      kit.box([WALL.t, WALL.h, SIZE - 0.1], [-face + WALL.t / 2, wallY, 0], 'cream'), // back
      kit.box([WALL.t, WALL.h, SIZE - 0.1], [face - WALL.t / 2, wallY, 0], 'cream'), // front (+x)
      kit.box([SIZE - 0.2, WALL.h, WALL.t], [0, wallY, -face + WALL.t / 2], 'cream'),
      kit.box([SIZE - 0.2, WALL.h, WALL.t], [0, wallY, face - WALL.t / 2], 'cream'), // side (+z)
      kit.box([SIZE - 0.2, WALL.h, WALL.t], [0, wallY, 0], 'skyBlue'), // divider
    ];
    // open roof: two beams across
    for (const x of [-0.75, -0.1]) parts.push(kit.box([0.1, 0.06, SIZE - 0.1], [x, top + 0.03, 0], 'woodDark'));

    /** A door and a leaning sign on the +x face (`on` = 'x', at lateral z = `c`) or the +z face (`on` = 'z', at x = `c`). */
    const entrance = (on: 'x' | 'z', c: number, color: PaletteColor, skirt: boolean) => {
      const a = SIGN.tilt;
      const sa = Math.sin(a);
      const ca = Math.cos(a);
      // a point on the sign: v up its face, w across it, o out of it; the sign stands on the wall top
      const sp = (v: number, w: number, o: number): Vec3 => {
        const u = SIGN.s / 2 + v;
        const up = u * ca + o * sa;
        const out = -u * sa + o * ca;
        return on === 'x' ? [face + out, top + up, c + w] : [c + w, top + up, face + out];
      };
      const rot: Vec3 = on === 'x' ? [0, 0, a] : [-a, 0, 0];
      const dims = (d: number, h: number, w: number): Vec3 => (on === 'x' ? [d, h, w] : [w, h, d]);
      const doorAt: Vec3 = on === 'x' ? [face + DOOR.t / 2, FLOOR_H + DOOR.h / 2, c] : [c, FLOOR_H + DOOR.h / 2, face + DOOR.t / 2];
      const knob: Vec3 = on === 'x' ? [face + DOOR.t + 0.01, FLOOR_H + 0.38, c + 0.2] : [c + 0.2, FLOOR_H + 0.38, face + DOOR.t + 0.01];
      parts.push(
        kit.box(dims(DOOR.t, DOOR.h, DOOR.w), doorAt, color),
        kit.sphere(0.035, knob, 'brass', { detail: 0 }),
        kit.box(dims(0.03, SIGN.s, SIGN.s), sp(0, 0, 0.015), color, { rotate: rot }),
        kit.box(dims(0.015, SIGN.s - 0.06, SIGN.s - 0.06), sp(0, 0, 0.035), 'white', { rotate: rot }),
        // pictogram on the white face: round head, body, and trousers or a dress, in the door colour
        kit.sphere(0.045, sp(0.1, 0, 0.06), color, { detail: 0 }),
        kit.box(dims(0.02, 0.1, 0.1), sp(0.0, 0, 0.05), color, { rotate: rot }),
      );
      if (skirt) {
        parts.push(kit.box(dims(0.02, 0.09, 0.17), sp(-0.09, 0, 0.05), color, { rotate: rot }));
      } else {
        for (const s of [-1, 1]) parts.push(kit.box(dims(0.02, 0.1, 0.035), sp(-0.1, s * 0.03, 0.05), color, { rotate: rot }));
      }
    };
    entrance('x', -0.45, 'teal', false);
    entrance('z', 0.35, 'orange', true);

    // inside each cubicle: a white toilet (tank, bowl, lid) by the back wall
    for (const z of [-0.45, 0.45]) {
      const bx = -face + WALL.t + 0.2;
      parts.push(
        kit.box([0.16, 0.4, 0.34], [bx - 0.05, FLOOR_H + 0.2, z], 'white'),
        kit.cylinder(0.19, 0.13, 0.22, [bx + 0.2, FLOOR_H + 0.11, z], 'white', { segments: 8 }),
        kit.cylinder(0.15, 0.15, 0.02, [bx + 0.2, FLOOR_H + 0.23, z], 'skyBlue', { segments: 8 }),
        kit.box([0.05, 0.03, 0.12], [bx - 0.05, FLOOR_H + 0.42, z], 'chrome'), // flush button
      );
    }
    // a small plant in the open corner of the +z cubicle
    parts.push(
      kit.cylinder(0.06, 0.05, 0.08, [0.5, FLOOR_H + 0.04, 0.55], 'terracotta', { segments: 8 }),
      kit.sphere(0.08, [0.5, FLOOR_H + 0.14, 0.55], 'leaf', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
