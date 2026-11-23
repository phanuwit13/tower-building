import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A slatted wooden crate heaped with yellow bananas: a layer inside, a second layer on top and one bunch draped
// over the +x edge. A banana is two short rods bent at the middle (the bend points up) with a brown stem end.
const CRATE = { w: 0.8, h: 0.34, t: 0.04 };
const SLAT = { h: 0.095, gap: 0.016 };
const BANANA = { r: 0.055, half: 0.12, bend: 0.035 };

/** One banana lying along direction `yaw` (0 = along +x), centred at (x, y, z). */
function banana(kit: StyleKit, x: number, y: number, z: number, yaw: number, tilt = 0): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const p = (f: number, up: number): Vec3 => [x + f * c, y + up, z - f * s];
  const end = BANANA.half * Math.cos(tilt);
  const lift = BANANA.half * Math.sin(tilt);
  return [
    rod(kit, p(-end * 2 + 0.0, -lift - BANANA.bend * 0.4), p(0, BANANA.bend), BANANA.r, 'sunYellow', { segments: 5 }),
    rod(kit, p(0, BANANA.bend), p(end * 2, lift - BANANA.bend * 0.4), BANANA.r, 'sunYellow', { segments: 5 }),
    kit.box([0.03, 0.03, 0.03], p(end * 2 + 0.01, lift - BANANA.bend * 0.4), 'bark', { rotate: [0, yaw, 0] }),
  ];
}

/** ลังกล้วย: a wooden crate piled with bunches of bananas. */
export const item: ItemModel = {
  id: 'banana-crate',
  name: 'ลังกล้วย',
  category: 'food',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const { w, h, t } = CRATE;
    const parts: Part[] = [kit.box([w, 0.04, w], [0, 0.02, 0], 'woodDark')];
    // four walls of slats (three each), corner posts and a top rim
    for (let k = 0; k < 3; k++) {
      const y = 0.04 + SLAT.h / 2 + k * (SLAT.h + SLAT.gap);
      for (const s of [-1, 1]) {
        parts.push(
          kit.box([t, SLAT.h, w - 0.02], [s * (w - t) / 2, y, 0], 'wood'),
          kit.box([w - 2 * t - 0.02, SLAT.h, t], [0, y, s * (w - t) / 2], 'wood'),
        );
      }
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) parts.push(kit.box([0.06, h, 0.06], [sx * (w / 2 - 0.03), h / 2, sz * (w / 2 - 0.03)], 'woodDark'));
    // bananas: a filler layer hidden inside, then the visible heap
    parts.push(kit.box([w - 0.12, 0.06, w - 0.12], [0, h - 0.03, 0], 'brass'));
    const layer1 = h + 0.0; // first layer lies on the filler, along z
    for (let k = 0; k < 4; k++) parts.push(...banana(kit, -0.2 + k * 0.13, layer1 + 0.03, 0, Math.PI / 2 + (k - 1.5) * 0.05));
    // second layer lies across (along x), slightly higher
    for (let k = 0; k < 3; k++) parts.push(...banana(kit, -0.04, layer1 + 0.1, -0.16 + k * 0.16, (k - 1) * 0.08, 0));
    // a bunch draped over the front (+x) edge, fanning out and drooping
    for (let k = 0; k < 3; k++) {
      const z = -0.14 + k * 0.14;
      parts.push(...banana(kit, 0.17, layer1 + 0.1, z, (k - 1) * 0.2, -0.25));
    }
    parts.push(kit.sphere(0.04, [0.0, layer1 + 0.18, 0], 'bark', { detail: 0, scale: [1.2, 0.8, 1.6] })); // the bunch's stalk
    return kit.finish(parts);
  },
};
