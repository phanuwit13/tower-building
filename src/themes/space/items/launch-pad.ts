import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A big striped rocket on a launch pad (2x3), beside an orange gantry tower with two blinking lights.
const PAD = { w: 1.9, d: 2.9, h: 0.1 };
const ROCKET = { x: 0.3, z: 0.1, r: 0.3, bottom: 0.5 };
const TOWER = { x: -0.62, z: 0.1, half: 0.2, h: 2.5 };

export const item: ItemModel = {
  id: 'launch-pad',
  name: 'ฐานปล่อยจรวด',
  category: 'facility',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const { x, z, r, bottom } = ROCKET;
    const parts: Part[] = [
      kit.box([PAD.w, PAD.h, PAD.d], [0, PAD.h / 2, 0], 'stone'),
      kit.box([1.5, 0.03, 2.5], [0, PAD.h + 0.015, 0], 'stoneDark'),
      // hazard stripes on the pad edge (front, +x side)
      kit.box([0.1, 0.03, 0.5], [0.85, PAD.h + 0.015, 1.0], 'sunYellow'),
      kit.box([0.1, 0.03, 0.5], [0.85, PAD.h + 0.015, -0.8], 'sunYellow'),
      // launch stand under the rocket
      kit.cylinder(0.4, 0.46, 0.14, [x, PAD.h + 0.07, z], 'charcoal', { segments: 12 }),
      kit.cylinder(0.12, 0.22, 0.2, [x, PAD.h + 0.24, z], 'stoneDark', { segments: 8 }),
      // rocket body
      kit.cylinder(r, r, 0.5, [x, bottom + 0.25, z], 'white'),
      kit.cylinder(r + 0.01, r + 0.01, 0.2, [x, bottom + 0.6, z], 'red'),
      kit.cylinder(r, r, 0.55, [x, bottom + 0.975, z], 'white'),
      kit.cylinder(r + 0.01, r + 0.01, 0.18, [x, bottom + 1.34, z], 'blue'),
      kit.cylinder(r, r, 0.25, [x, bottom + 1.555, z], 'white'),
      kit.cone(r, 1.0, [x, bottom + 2.18, z], 'red'),
      kit.sphere(0.05, [x, bottom + 2.7, z], 'sunYellow', { detail: 0 }),
      // engine nozzle
      kit.cylinder(0.12, 0.2, 0.18, [x, bottom - 0.09, z], 'charcoal', { segments: 8 }),
      // porthole
      kit.sphere(0.1, [x + r - 0.01, bottom + 1.0, z], 'skyBlue', { glow: 'windowWarm', light: 'window', scale: [0.5, 1, 1] }),
    ];
    // four fins: wide at the bottom, sloping up to the body
    const finY = bottom + 0.3;
    parts.push(
      kit.wedge([0.4, 0.6, 0.07], [x + r + 0.2 - 0.02, finY, z], 'orange', { apex: -0.5, scale: [-1, 1, 1] }),
      kit.wedge([0.4, 0.6, 0.07], [x - r - 0.2 + 0.02, finY, z], 'orange', { apex: -0.5 }),
      kit.wedge([0.4, 0.6, 0.07], [x, finY, z + r + 0.2 - 0.02], 'orange', { apex: -0.5, rotate: [0, Math.PI / 2, 0] }),
      kit.wedge([0.4, 0.6, 0.07], [x, finY, z - r - 0.2 + 0.02], 'orange', { apex: -0.5, rotate: [0, -Math.PI / 2, 0] }),
    );
    // gantry tower: four posts, braces and two arms to the rocket
    const { x: tx, z: tz, half, h } = TOWER;
    const ARM = x - r - (tx + half); // from the tower post to the rocket body
    const armX = tx + half + ARM / 2;
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        parts.push(kit.box([0.06, h - PAD.h, 0.06], [tx + sx * half, PAD.h + (h - PAD.h) / 2, tz + sz * half], 'orange'));
      }
    }
    for (const y of [0.6, 1.1, 1.6, 2.1]) {
      parts.push(
        kit.box([half * 2 + 0.06, 0.05, 0.05], [tx, y, tz - half], 'white'),
        kit.box([half * 2 + 0.06, 0.05, 0.05], [tx, y, tz + half], 'white'),
        kit.box([0.05, 0.05, half * 2], [tx - half, y, tz], 'white'),
        kit.box([0.05, 0.05, half * 2], [tx + half, y, tz], 'white'),
      );
    }
    for (const [y0, y1] of [[PAD.h, 0.6], [0.6, 1.1], [1.1, 1.6], [1.6, 2.1]] as const) {
      parts.push(rod(kit, [tx + half, y0, tz + half], [tx + half, y1, tz - half], 0.018, 'white', { segments: 4 }));
    }
    parts.push(
      // arms reach from the tower to the rocket body
      kit.box([ARM, 0.07, 0.12], [armX, 1.6, tz], 'sunYellow'),
      kit.box([ARM, 0.07, 0.12], [armX, 2.1, tz], 'sunYellow'),
      kit.box([0.5, 0.06, 0.5], [tx, h + 0.03, tz], 'red'),
      kit.cylinder(0.02, 0.02, 0.3, [tx, h + 0.18, tz], 'chrome', { segments: 6 }),
      // blinking lights: one on top of the tower, one on the upper arm, one on the nose
      kit.sphere(0.09, [tx, h + 0.37, tz], 'red', { glow: true, light: 'blink' }),
      kit.sphere(0.05, [armX, 2.18, tz], 'sunYellow', { detail: 0, glow: true, light: 'blink' }),
      kit.sphere(0.05, [armX, 1.68, tz], 'sunYellow', { detail: 0, glow: true, light: 'blink' }),
    );
    return kit.finish(parts);
  },
};
