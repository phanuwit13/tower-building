import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { gableRoof, rod } from '../../../models/parts';

// A tall wooden lifeguard hut (2×2) on stilts, a ramp down the front (+x) and a red-yellow flag on the roof.
const DECK = { x: -0.25, z: 0, w: 0.85, d: 0.95, y: 0.85, t: 0.06 };
const DECK_TOP = DECK.y + DECK.t / 2;
const HUT = { h: 0.5, wall: 0.04 };
const ROOF = { rise: 0.22, eave: 0.06 };
const RAMP = { len: 1.0, w: 0.4, t: 0.06 };
const FLAG = { w: 0.34, h: 0.18, strips: 4 };

/** หอไลฟ์การ์ด: a lifeguard chair-hut on stilts with a ramp and a red-yellow flag. */
export const item: ItemModel = {
  id: 'lifeguard-tower',
  name: 'หอไลฟ์การ์ด',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    // a sandy patch under the hut and ramp
    const parts: Part[] = [kit.box([1.9, 0.03, 1.5], [0, 0.015, 0], 'sand')];
    // stilts, braced with two cross rods
    const sx = DECK.w / 2 - 0.06;
    const sz = DECK.d / 2 - 0.06;
    for (const a of [-1, 1]) {
      for (const b of [-1, 1]) {
        parts.push(kit.box([0.08, DECK.y - DECK.t / 2, 0.08], [DECK.x + a * sx, (DECK.y - DECK.t / 2) / 2, b * sz], 'woodDark'));
      }
      parts.push(rod(kit, [DECK.x + a * sx, 0.1, -sz], [DECK.x + a * sx, DECK.y - 0.2, sz], 0.022, 'wood', { segments: 4 }));
      parts.push(rod(kit, [DECK.x + a * sx, 0.1, sz], [DECK.x + a * sx, DECK.y - 0.2, -sz], 0.022, 'wood', { segments: 4 }));
    }
    parts.push(kit.box([DECK.w, DECK.t, DECK.d], [DECK.x, DECK.y, DECK.z], 'wood'));
    // hut: back and side walls, open at the front (+x) with a low rail
    const wy = DECK_TOP + HUT.h / 2;
    parts.push(kit.box([HUT.wall, HUT.h, DECK.d - 0.1], [DECK.x - DECK.w / 2 + 0.07, wy, 0], 'white'));
    for (const s of [-1, 1]) parts.push(kit.box([DECK.w - 0.14, HUT.h, HUT.wall], [DECK.x, wy, s * (DECK.d / 2 - 0.07)], 'white'));
    parts.push(kit.box([HUT.wall + 0.01, 0.16, 0.34], [DECK.x - DECK.w / 2 + 0.095, wy + 0.06, 0], 'skyBlue')); // back window
    // a red stripe band round the hut
    parts.push(kit.box([DECK.w - 0.1, 0.07, 0.01 + HUT.wall + 0.02], [DECK.x, DECK_TOP + 0.12, DECK.d / 2 - 0.07], 'red'));
    parts.push(kit.box([DECK.w - 0.1, 0.07, 0.01 + HUT.wall + 0.02], [DECK.x, DECK_TOP + 0.12, -DECK.d / 2 + 0.07], 'red'));
    // front rail
    parts.push(kit.box([0.04, 0.04, DECK.d - 0.1], [DECK.x + DECK.w / 2 - 0.05, DECK_TOP + 0.2, 0], 'woodDark'));
    // roof
    const wallTop = DECK_TOP + HUT.h;
    parts.push(...gableRoof(kit, { at: [DECK.x, wallTop, 0], length: DECK.d + 0.1, width: DECK.w - 0.1, rise: ROOF.rise, eave: ROOF.eave, color: 'red', ridge: 'redDark' }));
    // ramp: a tilted plank from the deck's front edge down to the sand
    const ex = DECK.x + DECK.w / 2;
    const run = 0.6;
    const rise = DECK_TOP - 0.01;
    const L = Math.hypot(run, rise);
    const th = Math.atan2(run, rise);
    const cx = ex + run / 2 + 0.0;
    const cy = (L / 2) * Math.cos(th) + (RAMP.t / 2) * Math.sin(th);
    parts.push(kit.box([RAMP.t, L, RAMP.w], [cx - 0.02, cy, 0], 'wood', { rotate: [0, 0, th] }));
    for (let i = 1; i <= 5; i++) {
      const f = i / 6;
      parts.push(kit.box([0.04, 0.03, RAMP.w + 0.02], [ex + run * f - 0.02 + 0.03, rise * (1 - f) + 0.03, 0], 'woodDark', { rotate: [0, 0, th] }));
    }
    // flag on a pole at the back-right corner of the roof, streaming towards +x
    const px = DECK.x - 0.1;
    const pz = 0.3;
    const ptop = wallTop + ROOF.rise + 0.5;
    parts.push(kit.cylinder(0.018, 0.018, 0.55, [px, wallTop + ROOF.rise + 0.225, pz], 'white', { segments: 6 }));
    const wave: MotionOpts = { kind: 'wave', pivot: [px + 0.02, ptop - 0.05, pz], axis: [1, 0, 0] };
    const strip = FLAG.w / FLAG.strips;
    for (let k = 0; k < FLAG.strips; k++) {
      const x = px + 0.02 + strip * (k + 0.5);
      parts.push(kit.box([strip, FLAG.h / 2, 0.02], [x, ptop - 0.05 - FLAG.h / 4, pz], 'red', { motion: wave }));
      parts.push(kit.box([strip, FLAG.h / 2, 0.02], [x, ptop - 0.05 - FLAG.h * 0.75, pz], 'sunYellow', { motion: wave }));
    }
    return kit.finish(parts);
  },
};
