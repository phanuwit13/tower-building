import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A round blue tower (2x2) with a red cone roof and a yellow platform at the top. An orange chute winds one and
// a half times round it, going down to a blue landing mat on the +x side. Thin chrome props hold the chute up.
const TOWER = { r: 0.3, h: 1.5 };
const DECK = { r: 0.5, y: 1.42, t: 0.06 }; // the platform at the top of the tower
const SLIDE = { r: 0.7, turns: 1.5, segs: 24, w: 0.34, t: 0.04, top: 1.38, bottom: 0.1 }; // chute centre-line radius, width, top/bottom height
const RIM = { h: 0.07, t: 0.03 }; // the raised outer lip
const MAT = { w: 0.5, d: 0.6, h: 0.03 }; // landing mat on the ground at the foot of the chute
const ROOF = { r: 0.44, h: 0.5 };

/** สไลเดอร์เกลียว: tower with a spiral slide winding round it to a landing mat. */
export const item: ItemModel = {
  id: 'spiral-slide',
  name: 'สไลเดอร์เกลียว',
  category: 'ride',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(TOWER.r + 0.06, TOWER.r + 0.06, 0.06, [0, 0.03, 0], 'stone', { segments: 16 }),
      kit.cylinder(TOWER.r, TOWER.r, TOWER.h, [0, TOWER.h / 2, 0], 'blue', { segments: 16 }),
      kit.cylinder(DECK.r, DECK.r, DECK.t, [0, DECK.y, 0], 'sunYellow', { segments: 16 }),
      kit.cone(ROOF.r, ROOF.h, [0, DECK.y + DECK.t / 2 + 0.28 + ROOF.h / 2, 0], 'red', { segments: 12 }),
      kit.sphere(0.06, [0, DECK.y + DECK.t / 2 + 0.28 + ROOF.h + 0.03, 0], 'sunYellow', { detail: 0 }),
    ];
    // roof posts (on the deck, on the side away from the chute entrance at -x)
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      parts.push(kit.cylinder(0.025, 0.025, 0.28, [Math.cos(a) * 0.42, DECK.y + DECK.t / 2 + 0.14, -Math.sin(a) * 0.42], 'white', { segments: 6 }));
    }
    // the chute: short straight pieces along a helix. theta runs from the top (a whole number of half turns
    // before the +x foot) to 0, which is the foot at +x; the chute's tangent is the way the slider moves.
    const total = SLIDE.turns * Math.PI * 2;
    const step = total / SLIDE.segs;
    const chord = 2 * SLIDE.r * Math.sin(step / 2) + 0.05; // a little overlap
    for (let i = 0; i < SLIDE.segs; i++) {
      const theta = -total + (i + 0.5) * step;
      const f = (i + 0.5) / SLIDE.segs;
      const y = SLIDE.top + (SLIDE.bottom - SLIDE.top) * f;
      const slope = Math.atan((SLIDE.top - SLIDE.bottom) / (SLIDE.r * total));
      const yaw = theta + Math.PI / 2;
      const px = SLIDE.r * Math.cos(theta);
      const pz = -SLIDE.r * Math.sin(theta);
      // the orange bed
      parts.push(kit.box([chord, SLIDE.t, SLIDE.w], [px, y - SLIDE.t / 2, pz], 'orange', { rotate: [0, yaw, -slope] }));
      // the raised lips on both edges (in the chute's own frame: offset across the width, i.e. radially)
      for (const s of [1, -1]) {
        const off = s * (SLIDE.w / 2 - RIM.t / 2);
        const ox = Math.cos(theta) * off;
        const oz = -Math.sin(theta) * off;
        parts.push(kit.box([chord, RIM.h, RIM.t], [px + ox, y + RIM.h / 2 - 0.01, pz + oz], s > 0 ? 'red' : 'sunYellow', { rotate: [0, yaw, -slope] }));
      }
      // a prop under every fourth piece, from the ground to the underside of the chute
      if (i % 4 === 2) {
        const under = y - SLIDE.t - 0.02;
        parts.push(kit.cylinder(0.025, 0.025, under, [px, under / 2, pz], 'chrome', { segments: 6 }));
      }
    }
    // landing mat at the foot (+x), continuing the way the chute runs (towards -z)
    const footZ = 0;
    parts.push(
      kit.box([MAT.w, MAT.h, MAT.d], [SLIDE.r, MAT.h / 2, footZ - MAT.d / 2 + 0.1], 'blue'),
      kit.box([MAT.w - 0.1, 0.008, MAT.d - 0.1], [SLIDE.r, MAT.h + 0.004, footZ - MAT.d / 2 + 0.1], 'sunYellow'),
    );
    return kit.finish(parts);
  },
};
