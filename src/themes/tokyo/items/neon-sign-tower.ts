import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A tall frame (1×2) stacking four dark boards, each with a neon picture in its own colour: a teal cat face,
// a sun-yellow star, a red heart and an orange ramen bowl. Pictures on both faces, no letters. Chase bulbs
// run up the two posts.
const POST_Z = 0.8;
const POST_H = 3.3;
const BOARD = { w: 1.3, h: 0.62, d: 0.08 };
const BOARD_Y = [0.72, 1.44, 2.16, 2.88]; // bottom to top
const BULBS = 6;

type Pt = [number, number]; // [y, z]

function stroke(kit: StyleKit, x: number, a: Pt, b: Pt, color: PaletteColor, t = 0.05): Part {
  const dy = b[0] - a[0];
  const dz = b[1] - a[1];
  return kit.box([t, Math.hypot(dy, dz) + t * 0.6, t], [x, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2], color,
    { rotate: [Math.atan2(dz, dy), 0, 0], glow: color });
}

function path(kit: StyleKit, x: number, pts: Pt[], color: PaletteColor, closed: boolean): Part[] {
  const out: Part[] = [];
  for (let i = 0; i < pts.length - (closed ? 0 : 1); i++) out.push(stroke(kit, x, pts[i], pts[(i + 1) % pts.length], color));
  return out;
}

function circle(cy: number, r: number, n: number): Pt[] {
  return Array.from({ length: n }, (_, i): Pt => [cy + r * Math.sin((i / n) * Math.PI * 2), r * Math.cos((i / n) * Math.PI * 2)]);
}

function heart(cy: number, r: number): Pt[] {
  return Array.from({ length: 10 }, (_, i): Pt => {
    const t = (i / 10) * Math.PI * 2;
    const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return [cy + (hy / 17) * r, -((16 * Math.sin(t) ** 3) / 17) * r];
  });
}

function star(cy: number, r: number): Pt[] {
  const v = (i: number): Pt => [cy + r * Math.sin(Math.PI / 2 + (i * 2 * Math.PI) / 5), r * Math.cos(Math.PI / 2 + (i * 2 * Math.PI) / 5)];
  return [v(0), v(2), v(4), v(1), v(3)];
}

/** The four pictures, drawn on the face at x. */
function pictures(kit: StyleKit, x: number): Part[] {
  const [y0, y1, y2, y3] = BOARD_Y;
  const parts: Part[] = [];
  // ramen bowl: a half-round bowl, a rim, two wisps of steam and two chopsticks
  const bowl: Pt[] = [];
  for (let i = 0; i <= 5; i++) {
    const a = Math.PI + (i / 5) * Math.PI;
    bowl.push([y0 + 0.04 + 0.2 * Math.sin(a), 0.26 * Math.cos(a)]);
  }
  parts.push(...path(kit, x, bowl, 'orange', false));
  parts.push(stroke(kit, x, [y0 + 0.04, -0.28], [y0 + 0.04, 0.28], 'orange'));
  parts.push(stroke(kit, x, [y0 + 0.1, -0.1], [y0 + 0.2, -0.05], 'orange', 0.04), stroke(kit, x, [y0 + 0.1, 0.1], [y0 + 0.2, 0.05], 'orange', 0.04));
  parts.push(stroke(kit, x, [y0 + 0.1, 0.18], [y0 + 0.26, 0.04], 'orange', 0.035), stroke(kit, x, [y0 + 0.1, 0.26], [y0 + 0.26, 0.12], 'orange', 0.035));
  // heart
  parts.push(...path(kit, x, heart(y1, 0.25), 'red', true));
  // star
  parts.push(...path(kit, x, star(y2, 0.27), 'sunYellow', true));
  // cat face: round head, two pointed ears, two eyes
  parts.push(...path(kit, x, circle(y3 - 0.03, 0.2, 8), 'teal', true));
  for (const s of [-1, 1]) {
    parts.push(stroke(kit, x, [y3 + 0.13, s * 0.15], [y3 + 0.3, s * 0.17], 'teal', 0.045), stroke(kit, x, [y3 + 0.3, s * 0.17], [y3 + 0.14, s * 0.02], 'teal', 0.045));
    parts.push(kit.sphere(0.035, [x, y3 - 0.01, s * 0.08], 'teal', { detail: 0, glow: 'teal' }));
  }
  return parts;
}

/** ป้ายไฟนีออน: stacked glowing picture signs. */
export const item: ItemModel = {
  id: 'neon-sign-tower',
  name: 'ป้ายไฟนีออน',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.9, 0.05, 1.9], [0, 0.025, 0], 'stone')];
    for (const z of [-POST_Z, POST_Z]) parts.push(kit.box([0.08, POST_H, 0.08], [0, POST_H / 2 + 0.05, z], 'charcoal'));
    for (const y of BOARD_Y) {
      parts.push(kit.box([BOARD.d, BOARD.h, BOARD.w], [0, y, 0], 'navy'));
      // a short arm from each board to each post
      for (const z of [-POST_Z, POST_Z]) parts.push(kit.box([0.06, 0.06, 0.2], [0, y, z * 0.88], 'charcoal'));
    }
    parts.push(kit.box([0.14, 0.06, 1.7], [0, POST_H + 0.08, 0], 'charcoal'));
    parts.push(...pictures(kit, BOARD.d / 2 + 0.025), ...pictures(kit, -(BOARD.d / 2 + 0.025)));
    // chase bulbs up the +x side of each post; two runs, each counting from 0 at the bottom
    for (const z of [-POST_Z, POST_Z]) {
      for (let i = 0; i < BULBS; i++) {
        parts.push(kit.sphere(0.04, [0.06, 0.5 + (2.7 * i) / (BULBS - 1), z], 'lampWarm', { detail: 0, glow: true, light: 'chase', chase: { index: i, count: BULBS } }));
      }
    }
    return kit.finish(parts);
  },
};
