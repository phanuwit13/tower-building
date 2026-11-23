import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { glassWindow, type Facing } from '../../../models/parts';

// A big road junction: zebra stripes on all four mouths plus two diagonal "scramble" bands,
// and three corner towers carrying giant screens of colour blocks (no text). The +x,+z corner is
// left open with signal poles so the junction reads from the default camera.
const PAD = 0.03;
const CORNER_TOP = 0.07; // kerb height of the corner blocks
const ROAD_HALF = 0.45; // half width of both roads
const STRIPE_Y = PAD + 0.006;
const STRIPE_H = 0.012;

/** A giant screen on a wall: charcoal frame and 2x2 glowing colour blocks. `at` is on the wall surface. */
function screen(kit: StyleKit, facing: Facing, at: [number, number, number], w: number, h: number, colors: PaletteColor[]): Part[] {
  const alongX = facing === 'x+' || facing === 'x-';
  const sign = facing === 'x+' || facing === 'z+' ? 1 : -1;
  const size = (width: number, height: number, depth: number): [number, number, number] => (alongX ? [depth, height, width] : [width, height, depth]);
  const pos = (u: number, v: number, depth: number): [number, number, number] =>
    alongX ? [at[0] + sign * depth, at[1] + v, at[2] + u] : [at[0] + u, at[1] + v, at[2] + sign * depth];
  const parts: Part[] = [kit.box(size(w + 0.06, h + 0.06, 0.05), pos(0, 0, 0.025), 'charcoal')];
  const bw = w / 2 - 0.015;
  const bh = h / 2 - 0.015;
  colors.forEach((c, i) => {
    const u = (i % 2 === 0 ? -1 : 1) * (w / 4);
    const v = (i < 2 ? 1 : -1) * (h / 4);
    parts.push(kit.box(size(bw, bh, 0.03), pos(u, v, 0.06), c, { glow: c }));
  });
  return parts;
}

/** A corner tower on a kerb block: body, roof cap, two giant screens (to the crossing) and a few windows. */
function tower(kit: StyleKit, sx: 1 | -1, sz: 1 | -1, height: number, body: PaletteColor, colorsX: PaletteColor[], colorsZ: PaletteColor[]): Part[] {
  const cx = sx * 0.68;
  const cz = sz * 0.98;
  const W = 0.42;
  const D = 0.9;
  const base = CORNER_TOP;
  const top = base + height;
  const xFace = cx - sx * (W / 2); // face looking at road B (the z road)
  const zFace = cz - sz * (D / 2); // face looking at road A (the x road)
  const parts: Part[] = [
    kit.box([W, height, D], [cx, base + height / 2, cz], body),
    kit.box([W + 0.06, 0.06, D + 0.06], [cx, top + 0.03, cz], 'charcoal'),
    kit.box([0.12, 0.2, 0.12], [cx + sx * 0.1, top + 0.16, cz + sz * 0.2], 'stoneDark'), // roof unit
  ];
  const sy = base + height * 0.62;
  parts.push(...screen(kit, sx > 0 ? 'x-' : 'x+', [xFace, sy, cz], 0.7, 0.46, colorsX));
  parts.push(...screen(kit, sz > 0 ? 'z-' : 'z+', [cx, sy - 0.04, zFace], 0.36, 0.4, colorsZ));
  // a lit shop row at street level and a window row below the screens
  parts.push(...glassWindow(kit, { at: [xFace, base + 0.22, cz], facing: sx > 0 ? 'x-' : 'x+', w: 0.6, h: 0.2, panes: 3 }));
  parts.push(...glassWindow(kit, { at: [cx + sx * (W / 2), base + 0.22, cz], facing: sx > 0 ? 'x+' : 'x-', w: 0.5, h: 0.2, panes: 2 }));
  return parts;
}

/** A traffic signal on a post at a corner. */
function signal(kit: StyleKit, x: number, z: number): Part[] {
  return [
    kit.cylinder(0.025, 0.03, 0.62, [x, CORNER_TOP + 0.31, z], 'stoneDark', { segments: 6 }),
    kit.box([0.1, 0.2, 0.1], [x, CORNER_TOP + 0.66, z], 'charcoal'),
    kit.sphere(0.03, [x + 0.05, CORNER_TOP + 0.71, z], 'red', { detail: 0, glow: true }),
    kit.sphere(0.03, [x + 0.05, CORNER_TOP + 0.61, z], 'lime', { detail: 0, glow: true }),
  ];
}

/** สี่แยกทางม้าลาย: a big crossing with zebra stripes every way and corner towers with giant screens. */
export const item: ItemModel = {
  id: 'scramble-crossing',
  name: 'สี่แยกทางม้าลาย',
  category: 'facility',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1.96, PAD, 2.96], [0, PAD / 2, 0], 'charcoal')];
    // four kerb blocks in the corners
    for (const sx of [1, -1]) for (const sz of [1, -1]) parts.push(kit.box([0.55, CORNER_TOP, 1.05], [sx * 0.725, CORNER_TOP / 2, sz * 0.975], 'stone'));
    const stripe = (len: number, wid: number, x: number, z: number, yaw = 0, lift = 0): Part =>
      kit.box([wid, STRIPE_H, len], [x, STRIPE_Y + lift, z], 'white', { rotate: [0, yaw, 0] });
    for (let i = 0; i < 6; i++) {
      const o = -0.375 + i * 0.15;
      for (const s of [1, -1]) {
        parts.push(stripe(0.08, 0.3, s * 0.62, o)); // across road A (stripes run along x)
        parts.push(stripe(0.3, 0.08, o, s * 0.62)); // across road B (stripes run along z)
      }
    }
    // the two diagonal "scramble" bands through the middle
    for (const off of [-0.18, -0.06, 0.06, 0.18]) {
      const k = off * Math.SQRT1_2;
      parts.push(stripe(0.8, 0.07, k, -k, Math.PI / 4)); // runs towards (+x,+z); offset is perpendicular
      parts.push(stripe(0.8, 0.07, k, k, -Math.PI / 4, 0.003));
    }
    parts.push(
      ...tower(kit, -1, -1, 1.8, 'stoneDark', ['pink', 'skyBlue', 'sunYellow', 'lime'], ['orange', 'purple', 'teal', 'pink']),
      ...tower(kit, -1, 1, 1.4, 'blue', ['sunYellow', 'purple', 'lime', 'orange'], ['pink', 'teal', 'skyBlue', 'sunYellow']),
      ...tower(kit, 1, -1, 1.1, 'sand', ['teal', 'pink', 'orange', 'skyBlue'], ['lime', 'purple', 'sunYellow', 'orange']),
    );
    // the free corner of the tower on +x gets its own screen on the outside wall
    parts.push(...screen(kit, 'x+', [0.89, CORNER_TOP + 0.68, -0.98], 0.7, 0.4, ['lime', 'pink', 'skyBlue', 'orange']));
    parts.push(...signal(kit, 0.55, 0.55), ...signal(kit, -0.52, 0.52));
    // a street lamp on the open corner
    parts.push(
      kit.cylinder(0.025, 0.03, 0.9, [0.85, CORNER_TOP + 0.45, 1.2], 'charcoal', { segments: 6 }),
      kit.sphere(0.07, [0.85, CORNER_TOP + 0.95, 1.2], 'lampWarm', { glow: true, light: 'breathe' }),
    );
    return kit.finish(parts);
  },
};
