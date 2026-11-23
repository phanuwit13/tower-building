import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// Three stalls in a row along z, each under a striped tarp: fruit, vegetables and snacks on the
// counters. A line of string bulbs along the front edge runs (chase) at night; the bulbs stay still.
const COUNTER = { x: 0.4, top: 0.62, w: 0.5, d: 0.9 };
const STALLS: readonly { z: number; tarp: PaletteColor }[] = [
  { z: -1, tarp: 'red' },
  { z: 0, tarp: 'teal' },
  { z: 1, tarp: 'orange' },
];
const FRONT_POST = { x: 0.1, h: 1.36 };
const BACK_POST = { x: -0.9, h: 1.66 };
const TARP = { x: -0.415, y: 1.52, slope: -0.23, length: 1.07 };
const BULBS = 15;

function basket(kit: StyleKit, x: number, z: number, fill: readonly PaletteColor[], r = 0.12): Part[] {
  const y = COUNTER.top;
  const parts: Part[] = [kit.cylinder(r, r * 0.85, 0.08, [x, y + 0.04, z], 'wood', { segments: 8 })];
  fill.forEach((c, i) => {
    const a = (i / fill.length) * Math.PI * 2;
    const rr = i === 0 && fill.length > 3 ? 0 : r * 0.5;
    parts.push(kit.sphere(0.055, [x + rr * Math.cos(a), y + 0.1, z + rr * Math.sin(a)], c, { detail: 0 }));
  });
  return parts;
}

/** ตลาดนัดหมู่บ้าน: a row of three stalls under striped tarps over their back halves with string bulbs. */
export const item: ItemModel = {
  id: 'village-market',
  name: 'ตลาดนัดหมู่บ้าน',
  category: 'food',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const { z, tarp } of STALLS) {
      parts.push(
        kit.box([COUNTER.w, 0.58, COUNTER.d], [COUNTER.x, 0.29, z], 'wood'),
        kit.box([COUNTER.w + 0.06, 0.04, COUNTER.d + 0.04], [COUNTER.x, 0.6, z], 'woodDark'),
        // back board and a crate of goods behind the counter
        kit.box([0.04, 0.9, 0.94], [-0.9, 0.45, z], 'wood'),
        kit.box([0.3, 0.3, 0.7], [-0.55, 0.15, z], 'woodDark'),
      );
      for (let i = 0; i < 3; i++) {
        parts.push(kit.box([TARP.length, 0.04, 0.34], [TARP.x, TARP.y, z + (i - 1) * 0.33], i === 1 ? 'white' : tarp, { rotate: [0, 0, TARP.slope] }));
      }
    }
    // posts between the stalls
    for (const z of [-1.46, -0.5, 0.5, 1.46]) {
      parts.push(
        kit.cylinder(0.03, 0.03, FRONT_POST.h, [FRONT_POST.x, FRONT_POST.h / 2, z], 'woodDark', { segments: 6 }),
        kit.cylinder(0.03, 0.03, BACK_POST.h, [BACK_POST.x, BACK_POST.h / 2, z], 'woodDark', { segments: 6 }),
      );
    }
    const top = COUNTER.top;
    // stall 1: fruit. mangoes, bananas, watermelons, a cut melon
    const f = STALLS[0].z;
    for (const [dx, dz, c] of [[-0.08, -0.32, 'sunYellow'], [0.06, -0.3, 'orange'], [0, -0.2, 'sunYellow']] as const) {
      parts.push(kit.sphere(0.07, [COUNTER.x + dx, top + 0.06, f + dz], c, { detail: 0, scale: [1, 0.8, 0.9] }));
    }
    parts.push(
      kit.sphere(0.12, [COUNTER.x + 0.12, top + 0.1, f - 0.02], 'leafDark', { detail: 0, scale: [1, 0.9, 1.15] }),
      kit.dome(0.1, [COUNTER.x - 0.1, top + 0.02, f + 0.1], 'red', { segments: 8 }),
    );
    for (let i = 0; i < 3; i++) {
      parts.push(kit.box([0.22, 0.045, 0.05], [COUNTER.x, top + 0.04 + i * 0.03, f + 0.3 + (i - 1) * 0.045], 'sunYellow', { rotate: [0, (i - 1) * 0.25, 0.1] }));
    }
    // stall 2: vegetables. cabbages, chillies, limes, tomatoes
    const v = STALLS[1].z;
    parts.push(
      ...basket(kit, COUNTER.x, v - 0.28, ['leaf', 'leaf', 'leafDark']),
      ...basket(kit, COUNTER.x + 0.04, v + 0.02, ['red', 'red', 'redDark', 'red']),
      ...basket(kit, COUNTER.x, v + 0.3, ['lime', 'lime', 'leaf', 'lime']),
    );
    // stall 3: rambutans, a papaya, snacks
    const s = STALLS[2].z;
    parts.push(
      ...basket(kit, COUNTER.x, s - 0.28, ['red', 'red', 'redDark', 'red', 'red']),
      kit.sphere(0.1, [COUNTER.x + 0.05, top + 0.09, s + 0.02], 'orange', { detail: 0, scale: [0.8, 0.8, 1.3] }),
      ...basket(kit, COUNTER.x, s + 0.3, ['pink', 'sunYellow', 'cream', 'pink']),
    );
    // string bulbs along the front edge of the tarps: a still chase run
    const bulbX = 0.1;
    const bulbY = 1.27;
    parts.push(kit.cylinder(0.008, 0.008, 2.9, [bulbX, bulbY + 0.04, 0], 'charcoal', { segments: 4, rotate: [Math.PI / 2, 0, 0] }));
    for (let i = 0; i < BULBS; i++) {
      parts.push(kit.sphere(0.04, [bulbX, bulbY, -1.4 + (2.8 * i) / (BULBS - 1)], 'lampWarm', { detail: 0, glow: true, light: 'chase', chase: { index: i, count: BULBS } }));
    }
    return kit.finish(parts);
  },
};
