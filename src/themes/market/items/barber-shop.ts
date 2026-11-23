import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { aim, door, gableRoof, glassWindow, rod } from '../../../models/parts';

// A one-storey barber shop at the back, a pavement in front and a spinning striped pole by the
// door. The pole's white drum and its red and blue stripes (short slanted rods in a helix) share
// ONE spin pivot on the pole's own axis; the caps stay still. A teal scissors neon sits over the door.
const PAD = 0.03;
const SHOP = { x0: -0.88, x1: 0.25, z: 1.8, wall: 0.78 }; // x range, length along z, wall top
const POLE = { x: 0.62, z: 0.6, r: 0.1, y0: 0.12, y1: 0.74 };
const SPIN: MotionOpts = { kind: 'spin', pivot: [POLE.x, 0, POLE.z], speed: 0.4 };
const SIGN_Y = 0.62;
const DOOR_Z = -0.45;

/** ร้านตัดผม: a barber shop with a spinning striped pole and a scissors neon. */
export const item: ItemModel = {
  id: 'barber-shop',
  name: 'ร้านตัดผม',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const cx = (SHOP.x0 + SHOP.x1) / 2;
    const w = SHOP.x1 - SHOP.x0;
    const parts: Part[] = [
      kit.box([1.96, PAD, 1.96], [0, PAD / 2, 0], 'stone'),
      kit.box([w, SHOP.wall - PAD, SHOP.z], [cx, (PAD + SHOP.wall) / 2, 0], 'cream'),
      kit.wedge([w, 0.3, SHOP.z - 0.02], [cx, SHOP.wall + 0.15, 0], 'cream'),
      ...gableRoof(kit, { at: [cx, SHOP.wall, 0], length: SHOP.z + 0.1, width: w, rise: 0.3, eave: 0.06, color: 'red', ridge: 'redDark' }),
      ...door(kit, { at: [SHOP.x1, PAD + 0.23, DOOR_Z], facing: 'x+', w: 0.28, h: 0.46, color: 'blue', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [SHOP.x1, 0.4, 0.12], facing: 'x+', w: 0.5, h: 0.3 }),
      ...glassWindow(kit, { at: [SHOP.x1, 0.4, 0.68], facing: 'x+', w: 0.3, h: 0.3, panes: 1 }),
      ...glassWindow(kit, { at: [-0.1, 0.4, SHOP.z / 2], facing: 'z+', w: 0.5, h: 0.3 }),
      ...glassWindow(kit, { at: [-0.1, 0.4, -SHOP.z / 2], facing: 'z-', w: 0.5, h: 0.3 }),
      ...glassWindow(kit, { at: [SHOP.x0, 0.4, 0], facing: 'x-', w: 0.7, h: 0.3, panes: 3 }),
      // navy sign board over the door with the scissors neon
      kit.box([0.05, 0.24, 0.62], [SHOP.x1 + 0.025, SIGN_Y, DOOR_Z], 'navy'),
    ];
    // scissors: two crossing blades and two finger rings (diamonds)
    const S = (dy: number, dz: number): [number, number, number] => [SHOP.x1 + 0.06, SIGN_Y + dy, DOOR_Z + dz];
    const stroke = (a: [number, number], b: [number, number]) => parts.push(rod(kit, S(...a), S(...b), 0.016, 'teal', { segments: 4, glow: 'teal' }));
    stroke([-0.06, -0.14], [0.06, 0.1]);
    stroke([0.06, -0.14], [-0.06, 0.1]);
    for (const side of [-1, 1]) {
      const ring: [number, number][] = [[0.0, 0.14 * side], [0.045, 0.19 * side], [0.0, 0.24 * side], [-0.045, 0.19 * side]];
      for (let i = 0; i < 4; i++) stroke(ring[i]!, ring[(i + 1) % 4]!);
    }

    // the pole: still base and caps, spinning drum + helix stripes
    const drumH = POLE.y1 - POLE.y0;
    parts.push(
      kit.cylinder(0.14, 0.15, POLE.y0 - PAD, [POLE.x, (POLE.y0 + PAD) / 2, POLE.z], 'charcoal', { segments: 12 }),
      kit.cylinder(0.14, 0.14, 0.05, [POLE.x, POLE.y1 + 0.025, POLE.z], 'charcoal', { segments: 12 }),
      kit.sphere(0.07, [POLE.x, POLE.y1 + 0.1, POLE.z], 'sunYellow', { detail: 0 }),
      kit.cylinder(POLE.r, POLE.r, drumH, [POLE.x, (POLE.y0 + POLE.y1) / 2, POLE.z], 'white', { segments: 12, motion: SPIN }),
    );
    const STEPS = 10; // chords per stripe, 1.25 turns
    const pitch = drumH / STEPS;
    for (const [offset, color] of [[0, 'red'], [Math.PI, 'blue']] as const) {
      for (let i = 0; i < STEPS; i++) {
        const a0 = offset + (i / STEPS) * Math.PI * 2.5;
        const a1 = offset + ((i + 1) / STEPS) * Math.PI * 2.5;
        const rr = POLE.r + 0.004;
        const p0: [number, number, number] = [POLE.x + rr * Math.cos(a0), POLE.y0 + 0.02 + i * (pitch - 0.004), POLE.z + rr * Math.sin(a0)];
        const p1: [number, number, number] = [POLE.x + rr * Math.cos(a1), POLE.y0 + 0.02 + (i + 1) * (pitch - 0.004), POLE.z + rr * Math.sin(a1)];
        const d: [number, number, number] = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
        parts.push(kit.cylinder(0.025, 0.025, Math.hypot(...d) + 0.02, [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2], color, { segments: 4, rotate: aim(d), motion: SPIN }));
      }
    }
    return kit.finish(parts);
  },
};
