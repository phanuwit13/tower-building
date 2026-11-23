import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod, wallPanel } from '../../../models/parts';

// Two claw machines side by side along z (1x2), joystick side facing +x. Each has a coloured base with a
// control deck, an open "glass" frame full of plush toys, a claw hanging from a rail and a marquee on top
// with three bulbs that blink.
const CAB = { d: 0.84, x0: -0.48, x1: 0.32, zc: 0.5 }; // each cabinet: depth along z, x range, centre |z|
const BASE_H = 0.42;
const FRAME_H = 0.66; // height of the glass frame above the base
const POST = 0.05;
const DECK = { x0: 0.32, x1: 0.5 }; // control deck in front of the cabinet
const MARQUEE = { h: 0.22, t: 0.12 };
const COLORS: readonly { base: PaletteColor; top: PaletteColor; toys: readonly PaletteColor[] }[] = [
  { base: 'pink', top: 'purple', toys: ['sunYellow', 'lime', 'orange', 'white', 'sunYellow', 'lime'] },
  { base: 'teal', top: 'blue', toys: ['pink', 'orange', 'purple', 'white', 'pink', 'orange'] },
];
// toy positions inside one cabinet (x, z offset from the cabinet centre, size)
const TOYS = [[-0.28, -0.24, 0.1], [-0.28, 0.2, 0.09], [-0.05, -0.28, 0.09], [-0.02, 0.0, 0.11], [0.14, 0.26, 0.09], [0.16, -0.18, 0.1]] as const;

/** ตู้คีบตุ๊กตา: two glass cabinets full of plush toys with claws on top, blinking marquee. */
export const item: ItemModel = {
  id: 'claw-machines',
  name: 'ตู้คีบตุ๊กตา',
  category: 'play',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    const cx = (CAB.x0 + CAB.x1) / 2;
    const cw = CAB.x1 - CAB.x0;
    const top = BASE_H + FRAME_H;
    COLORS.forEach((c, i) => {
      const zc = (i === 0 ? 1 : -1) * CAB.zc;
      parts.push(
        kit.box([cw, BASE_H, CAB.d], [cx, BASE_H / 2, zc], c.base),
        kit.box([DECK.x1 - DECK.x0, BASE_H - 0.1, CAB.d - 0.06], [(DECK.x0 + DECK.x1) / 2, (BASE_H - 0.1) / 2, zc], c.base),
        kit.box([DECK.x1 - DECK.x0, 0.04, CAB.d - 0.06], [(DECK.x0 + DECK.x1) / 2, BASE_H - 0.1 + 0.02, zc], 'charcoal'),
        // prize hatch on the +x face
        ...wallPanel(kit, { at: [DECK.x1 - 0.02, 0.14, zc], facing: 'x+', w: 0.3, h: 0.14, depth: 0.02, color: 'charcoal' }),
        // joystick and buttons
        kit.cylinder(0.014, 0.018, 0.08, [0.4, BASE_H - 0.02, zc - 0.15], 'chrome', { segments: 6 }),
        kit.sphere(0.04, [0.4, BASE_H + 0.05, zc - 0.15], 'red', { detail: 0 }),
        kit.cylinder(0.035, 0.035, 0.03, [0.42, BASE_H - 0.06 + 0.025, zc + 0.12], 'sunYellow', { segments: 8 }),
        kit.cylinder(0.035, 0.035, 0.03, [0.42, BASE_H - 0.06 + 0.025, zc + 0.24], 'lime', { segments: 8 }),
        // floor of toys and the frame: four corner posts and a top
        kit.box([cw - 0.04, 0.04, CAB.d - 0.04], [cx, BASE_H + 0.02, zc], 'woodDark'),
        kit.box([cw, 0.06, CAB.d], [cx, top - 0.03, zc], c.top),
      );
      for (const sx of [CAB.x0 + POST / 2, CAB.x1 - POST / 2]) {
        for (const sz of [-1, 1]) parts.push(kit.box([POST, FRAME_H, POST], [sx, BASE_H + FRAME_H / 2, zc + sz * (CAB.d / 2 - POST / 2)], c.top));
      }
      // a pale pane on the back so the toys read against it
      parts.push(kit.box([0.02, FRAME_H - 0.1, CAB.d - 0.1], [CAB.x0 + 0.02, BASE_H + FRAME_H / 2 - 0.03, zc], 'glassBlue'));
      // plush toys: a ball body with two ears
      TOYS.forEach(([dx, dz, r], k) => {
        const col = c.toys[k];
        const y = BASE_H + 0.04 + r * 0.85;
        parts.push(
          kit.sphere(r, [cx + dx, y, zc + dz], col, { detail: 0 }),
        );
        if (k % 2 === 0) {
          parts.push(
            kit.sphere(r * 0.38, [cx + dx - r * 0.15, y + r * 0.95, zc + dz - r * 0.55], col, { detail: 0 }),
            kit.sphere(r * 0.38, [cx + dx - r * 0.15, y + r * 0.95, zc + dz + r * 0.55], col, { detail: 0 }),
          );
        }
      });
      // the claw: a carriage on the top rail, a rod and three curved prongs
      const clawX = cx + 0.02;
      const clawZ = zc + 0.1;
      parts.push(
        kit.box([0.16, 0.06, 0.12], [clawX, top - 0.09, clawZ], 'charcoal'),
        kit.cylinder(0.012, 0.012, 0.12, [clawX, top - 0.18, clawZ], 'stoneDark', { segments: 4 }),
        kit.sphere(0.04, [clawX, top - 0.25, clawZ], 'chrome', { detail: 0 }),
      );
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2;
        parts.push(rod(kit, [clawX + Math.cos(a) * 0.02, top - 0.26, clawZ + Math.sin(a) * 0.02], [clawX + Math.cos(a) * 0.075, top - 0.37, clawZ + Math.sin(a) * 0.075], 0.012, 'chrome', { segments: 4 }));
      }
      // marquee on top, bulbs that blink
      parts.push(
        kit.box([MARQUEE.t, MARQUEE.h, CAB.d - 0.04], [cx + 0.1, top + MARQUEE.h / 2, zc], c.base),
        ...wallPanel(kit, { at: [cx + 0.1 + MARQUEE.t / 2, top + MARQUEE.h / 2, zc], facing: 'x+', w: CAB.d - 0.2, h: MARQUEE.h - 0.08, depth: 0.02, color: 'sunYellow' }),
      );
      [-0.26, 0, 0.26].forEach((dz) =>
        parts.push(kit.sphere(0.05, [cx + 0.1 + MARQUEE.t / 2 + 0.04, top + MARQUEE.h / 2, zc + dz], 'red', { detail: 0, glow: true, light: 'blink' })),
      );
    });
    return kit.finish(parts);
  },
};
