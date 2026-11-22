import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Seen from the front (+x) it is a side view: ladder at the -z end, platform, then the ramp down to +z.
const DECK = { top: 0.72, t: 0.05, w: 0.46, z0: -0.8, z1: -0.38 }; // platform: deck top height, z from the back (z0) to the slide (z1)
const POST_R = 0.035;
const RAIL_TOP = DECK.top + 0.26; // posts and guard rails reach up to here
const PANEL = { h: 0.15, t: 0.03 }; // solid side guard on each side of the platform
const LADDER = { footZ: -0.97, w: 0.3, rail: 0.045, rungs: [0.18, 0.36, 0.54], rungR: 0.022 };
const RAMP = { w: 0.32, t: 0.04, wall: 0.035, lip: 0.08, endZ: 0.92, endY: 0.07, segments: 6 };

/** สไลเดอร์: a short playground slide, blue ladder and small platform at the back, red curved ramp to the ground. */
export const item: ItemModel = {
  id: 'slide',
  name: 'สไลเดอร์',
  category: 'play',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    const deckLen = DECK.z1 - DECK.z0;
    const deckZ = (DECK.z0 + DECK.z1) / 2;
    const px = DECK.w / 2 - POST_R; // posts sit just inside the deck corners
    // platform: four posts, a yellow deck, solid yellow sides and a red top rail on each side
    for (const x of [-px, px]) {
      for (const z of [DECK.z0 + POST_R, DECK.z1 - POST_R]) {
        parts.push(kit.cylinder(POST_R, POST_R, RAIL_TOP, [x, RAIL_TOP / 2, z], 'blue', { segments: 8 }));
      }
      parts.push(
        kit.box([PANEL.t, PANEL.h, deckLen - 2 * POST_R], [x, DECK.top + PANEL.h / 2, deckZ], 'sunYellow'),
        kit.box([0.05, 0.05, deckLen + 0.02], [x, RAIL_TOP - 0.025, deckZ], 'red'),
      );
    }
    parts.push(kit.box([DECK.w, DECK.t, deckLen], [0, DECK.top - DECK.t / 2, deckZ], 'sunYellow'));

    // ladder: two blue rails from the ground up past the deck (they double as hand rails), yellow rungs
    const rise = RAIL_TOP;
    const run = DECK.z0 - LADDER.footZ;
    const lean = Math.atan2(run, rise); // tilt from vertical, towards +z
    const railLen = Math.hypot(run, rise);
    const lift = (LADDER.rail / 2) * Math.sin(lean); // keep the tilted rails' bottom edge on the ground
    const zAt = (y: number) => LADDER.footZ + (y / rise) * run; // ladder line at height y
    for (const x of [-LADDER.w / 2, LADDER.w / 2]) {
      parts.push(kit.box([LADDER.rail, railLen, LADDER.rail], [x, rise / 2 + lift, (LADDER.footZ + DECK.z0) / 2], 'blue', { rotate: [lean, 0, 0] }));
    }
    for (const y of LADDER.rungs) {
      parts.push(kit.cylinder(LADDER.rungR, LADDER.rungR, LADDER.w, [0, y, zAt(y)], 'sunYellow', { rotate: [0, 0, Math.PI / 2], segments: 6 }));
    }

    // ramp: an S-curve (flat at the top lip, steep in the middle, flat run-out) made of straight pieces
    const startY = DECK.top - RAMP.t / 2; // bed centre line: its top meets the deck top
    const pt = (u: number): [number, number] => [
      DECK.z1 - 0.02 + u * (RAMP.endZ - (DECK.z1 - 0.02)),
      RAMP.endY + (startY - RAMP.endY) * (1 + Math.cos(Math.PI * u)) / 2,
    ];
    for (let i = 0; i < RAMP.segments; i++) {
      const [z0, y0] = pt(i / RAMP.segments);
      const [z1, y1] = pt((i + 1) / RAMP.segments);
      const len = Math.hypot(z1 - z0, y1 - y0) + 0.02; // overlap the joints a little
      const a = Math.atan2(y0 - y1, z1 - z0); // downhill towards +z
      const z = (z0 + z1) / 2;
      const y = (y0 + y1) / 2;
      parts.push(kit.box([RAMP.w, RAMP.t, len], [0, y, z], 'red', { rotate: [a, 0, 0] }));
      // side walls, their bottom flush with the bed's bottom: shift up along the piece's own y axis
      const up = (RAMP.lip - RAMP.t) / 2;
      for (const s of [-1, 1]) {
        parts.push(kit.box([RAMP.wall, RAMP.lip, len], [s * (RAMP.w + RAMP.wall) / 2, y + up * Math.cos(a), z + up * Math.sin(a)], 'redDark', { rotate: [a, 0, 0] }));
      }
    }
    // the run-out rests on a small blue foot; a blue leg holds up the middle of the ramp
    const footTop = RAMP.endY - RAMP.t / 2;
    parts.push(kit.box([RAMP.w - 0.04, footTop, 0.1], [0, footTop / 2, RAMP.endZ - 0.12], 'blue'));
    const [legZ, legY] = pt(0.5);
    const legTop = legY - RAMP.t / 2 - 0.01;
    for (const x of [-0.1, 0.1]) {
      parts.push(kit.cylinder(0.03, 0.03, legTop, [x, legTop / 2, legZ], 'blue', { segments: 8 }));
    }
    return kit.finish(parts);
  },
};
