import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A small car park: asphalt, painted bays on the +x side, a drive lane on the -x side, two parked
// cars, a breathing light post and a navy entrance sign with a neon arrow.
const SLAB = 0.03; // asphalt height (ground surface, at least 0.02)
const PAINT = 0.008;
const BAY_Z = [-1.4, -0.7, 0, 0.7, 1.4]; // bay lines along x
const BAY_X = { from: -0.2, to: 0.92 };

/** One parked car, nose to +x, centred at (cx, cz). */
function car(kit: StyleKit, cx: number, cz: number, color: 'red' | 'blue'): Part[] {
  const base = SLAB;
  const wheelR = 0.06;
  const parts: Part[] = [
    kit.box([0.66, 0.12, 0.38], [cx, base + 0.1, cz], color),
    kit.box([0.34, 0.11, 0.34], [cx - 0.04, base + 0.215, cz], color),
    // side windows (glass, lit at night)
    kit.box([0.26, 0.07, 0.355], [cx - 0.04, base + 0.22, cz], 'skyBlue', { glow: 'windowWarm', light: 'window' }),
    kit.box([0.08, 0.1, 0.3], [cx + 0.34, base + 0.1, cz], 'white'), // bumper block
    kit.sphere(0.03, [cx + 0.33, base + 0.115, cz - 0.12], 'lampWarm', { detail: 0, glow: true }),
    kit.sphere(0.03, [cx + 0.33, base + 0.115, cz + 0.12], 'lampWarm', { detail: 0, glow: true }),
  ];
  for (const dx of [-0.22, 0.22]) {
    for (const dz of [-0.2, 0.2]) {
      parts.push(kit.cylinder(wheelR, wheelR, 0.06, [cx + dx, base + wheelR, cz + dz], 'charcoal', { segments: 8, rotate: [Math.PI / 2, 0, 0] }));
    }
  }
  return parts;
}

/** ลานจอดรถ: a small car park with painted bays, two parked cars and a light post. */
export const item: ItemModel = {
  id: 'parking-lot',
  name: 'ลานจอดรถ',
  category: 'facility',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1.96, SLAB, 2.96], [0, SLAB / 2, 0], 'charcoal')];
    // bay lines, a stop kerb along the back of the bays and a centre lane stripe
    for (const z of BAY_Z) {
      parts.push(kit.box([BAY_X.to - BAY_X.from, PAINT, 0.04], [(BAY_X.from + BAY_X.to) / 2, SLAB + PAINT / 2, z], 'white'));
    }
    parts.push(kit.box([0.04, PAINT, 2.84], [BAY_X.from, SLAB + PAINT / 2, 0], 'white'));
    for (const z of [-1.2, -0.4, 0.4, 1.2]) parts.push(kit.box([0.04, PAINT, 0.3], [-0.6, SLAB + PAINT / 2, z], 'sunYellow'));
    parts.push(kit.box([0.1, 0.05, 2.8], [0.93, SLAB + 0.025, 0], 'stone')); // kerb at the +x edge
    parts.push(...car(kit, 0.4, -1.05, 'red'), ...car(kit, 0.4, 0.35, 'blue'));

    // light post (breathing lamp) at the back left, and a sign post at the entrance
    parts.push(
      kit.cylinder(0.05, 0.07, 0.06, [-0.8, SLAB + 0.03, 1.2], 'stone', { segments: 8 }),
      kit.cylinder(0.03, 0.03, 1.4, [-0.8, SLAB + 0.7, 1.2], 'navy', { segments: 8 }),
      kit.box([0.28, 0.03, 0.05], [-0.68, SLAB + 1.4, 1.2], 'navy'),
      kit.sphere(0.1, [-0.58, SLAB + 1.4, 1.2], 'lampWarm', { glow: true, light: 'breathe' }),
      kit.cylinder(0.025, 0.025, 0.6, [-0.8, SLAB + 0.3, -1.4], 'navy', { segments: 8 }),
      kit.cylinder(0.025, 0.025, 0.6, [-0.8, SLAB + 0.3, -0.6], 'navy', { segments: 8 }),
      kit.box([0.06, 0.46, 0.9], [-0.8, SLAB + 0.78, -1.0], 'navy'),
    );
    // neon arrow (pointing along the lane) on the blue board
    const A = (dy: number, dz: number): [number, number, number] => [-0.72, SLAB + 0.78 + dy, -1.0 + dz];
    for (const [p, q] of [[A(0, -0.32), A(0, 0.32)], [A(0, 0.32), A(0.14, 0.14)], [A(0, 0.32), A(-0.14, 0.14)]] as const) {
      parts.push(rod(kit, p, q, 0.035, 'teal', { segments: 6, glow: 'teal' }), kit.sphere(0.035, p, 'teal', { detail: 0, glow: 'teal' }));
    }
    return kit.finish(parts);
  },
};
