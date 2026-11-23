import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';

// A wooden cart on four wheels with a striped umbrella, an espresso machine, a glowing cup lamp that
// breathes and bulbs round the umbrella rim. A neon cup (teal) is on the front panel.
const R = 0.17; // wheel radius
const BODY = { w: 0.7, h: 0.46, d: 1.3, y: R + 0.01 };
const COUNTER_Y = BODY.y + BODY.h + 0.025;
const UMB = { z: 0.3, y: 1.4 };
const BULB = ['pink', 'sunYellow', 'lime'] as const;
const BREATHE = { glow: true, light: 'breathe' } as const;

function stroke(kit: StyleKit, x: number, a: [number, number], b: [number, number], t = 0.05): Part {
  const dy = b[0] - a[0];
  const dz = b[1] - a[1];
  return kit.box([t, Math.hypot(dy, dz) + t * 0.6, t], [x, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2], 'teal',
    { rotate: [Math.atan2(dz, dy), 0, 0], glow: 'teal' });
}

/** รถเข็นกาแฟ: a wooden coffee cart with an umbrella, a machine and a glowing cup lamp. */
export const item: ItemModel = {
  id: 'coffee-cart',
  name: 'รถเข็นกาแฟ',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BODY.w, BODY.h, BODY.d], [0, BODY.y + BODY.h / 2, 0], 'wood'),
      kit.box([0.82, 0.05, 1.4], [0, COUNTER_Y, 0], 'woodDark'),
      // handle at the back
      kit.box([0.04, 0.04, 0.3], [-0.22, 0.62, -0.82], 'woodDark'),
      kit.box([0.04, 0.04, 0.3], [0.22, 0.62, -0.82], 'woodDark'),
      kit.box([0.48, 0.04, 0.04], [0, 0.62, -0.96], 'woodDark'),
    ];
    for (const x of [-0.38, 0.38]) {
      for (const z of [-0.4, 0.4]) {
        parts.push(kit.cylinder(R, R, 0.08, [x, R, z], 'charcoal', { segments: 12, rotate: [0, 0, Math.PI / 2] }));
        parts.push(kit.cylinder(0.05, 0.05, 0.1, [x * 1.06, R, z], 'stone', { segments: 6, rotate: [0, 0, Math.PI / 2] }));
      }
    }
    // front panel with a neon cup
    parts.push(kit.box([0.03, 0.3, 0.6], [BODY.w / 2 + 0.015, 0.4, 0], 'charcoal'));
    const x = BODY.w / 2 + 0.04;
    parts.push(
      stroke(kit, x, [0.5, -0.12], [0.5, 0.12]),
      stroke(kit, x, [0.5, -0.12], [0.3, -0.08]),
      stroke(kit, x, [0.5, 0.12], [0.3, 0.08]),
      stroke(kit, x, [0.3, -0.08], [0.3, 0.08]),
      stroke(kit, x, [0.46, 0.12], [0.46, 0.2]),
      stroke(kit, x, [0.46, 0.2], [0.34, 0.2]),
      stroke(kit, x, [0.34, 0.2], [0.34, 0.09]),
    );
    // espresso machine, cup lamp, cups
    parts.push(
      kit.box([0.3, 0.3, 0.4], [-0.1, COUNTER_Y + 0.025 + 0.15, -0.5], 'charcoal'),
      kit.box([0.33, 0.04, 0.43], [-0.1, COUNTER_Y + 0.345, -0.5], 'chrome'),
      kit.cylinder(0.025, 0.025, 0.12, [0.07, COUNTER_Y + 0.17, -0.5], 'chrome', { segments: 6 }),
      kit.cylinder(0.1, 0.07, 0.16, [0.22, COUNTER_Y + 0.105, -0.5], 'sunYellow', { segments: 10, ...BREATHE }),
      kit.torus(0.05, 0.02, [0.22, COUNTER_Y + 0.105, -0.37], 'sunYellow', { radialSegments: 4, tubularSegments: 8, rotate: [0, Math.PI / 2, 0], ...BREATHE }),
      kit.cylinder(0.05, 0.04, 0.08, [0.2, COUNTER_Y + 0.065, 0.1], 'white', { segments: 8 }),
      kit.cylinder(0.05, 0.04, 0.08, [0.2, COUNTER_Y + 0.065, 0.28], 'white', { segments: 8 }),
    );
    // umbrella: pole, two striped cones, knob and a ring of breathing bulbs
    parts.push(
      kit.cylinder(0.025, 0.025, UMB.y - COUNTER_Y + 0.28, [0, (COUNTER_Y + UMB.y + 0.28) / 2, UMB.z], 'woodDark', { segments: 6 }),
      kit.cone(0.49, 0.28, [0, UMB.y + 0.14, UMB.z], 'red', { segments: 6 }),
      kit.cone(0.49, 0.28, [0, UMB.y + 0.14, UMB.z], 'white', { segments: 6, rotate: [0, Math.PI / 6, 0], scale: [0.98, 0.98, 0.98] }),
      kit.sphere(0.04, [0, UMB.y + 0.3, UMB.z], 'sunYellow', { detail: 0 }),
    );
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      parts.push(kit.sphere(0.045, [0.45 * Math.cos(a), UMB.y - 0.02, UMB.z + 0.45 * Math.sin(a)], BULB[i % 3], { detail: 0, ...BREATHE }));
    }
    return kit.finish(parts);
  },
};
