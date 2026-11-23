import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, gableRoof, glassWindow, rod, wallPanel } from '../../../models/parts';

// A small mill: cream walls and a corrugated metal roof, a hopper on a stand and a chute into stacked rice sacks.
const W = 1.05; // wall width (x)
const L = 1.5; // wall length (z)
const CX = -0.325; // wall centre x
const CZ = -0.65; // wall centre z
const BASE = 0.05;
const WALL_TOP = 0.9;
const RISE = 0.35;
const FRONT = CX + W / 2; // +x wall face
const HOPPER = { x: 0.5, z: 0.78, legH: 0.8, top: 0.3, bottom: 0.08, h: 0.4 };
const SACK = { r: 0.1, h: 0.2 };

/** โรงสีข้าว: a corrugated-roof rice mill with a hopper, a chute and rice sacks. */
export const item: ItemModel = {
  id: 'rice-mill',
  name: 'โรงสีข้าว',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([W + 0.06, BASE, L + 0.06], [CX, BASE / 2, CZ], 'stone'),
      kit.box([W, WALL_TOP - BASE, L], [CX, (BASE + WALL_TOP) / 2, CZ], 'cream'),
      kit.wedge([W, RISE, L], [CX, WALL_TOP + RISE / 2, CZ], 'cream'),
      ...gableRoof(kit, { at: [CX, WALL_TOP, CZ], length: L + 0.08, width: W, rise: RISE, eave: 0.08, color: 'chrome', ridge: 'stoneDark' }),
      // corrugation: thin ribs down each roof slope
      ...[-0.6, -0.2, 0.2, 0.6].flatMap((dz) => [
        rod(kit, [CX + 0.0, WALL_TOP + RISE + 0.03, CZ + dz], [CX + W / 2 + 0.06, WALL_TOP - 0.01, CZ + dz], 0.015, 'stoneDark', { segments: 4 }),
        rod(kit, [CX - 0.0, WALL_TOP + RISE + 0.03, CZ + dz], [CX - W / 2 - 0.06, WALL_TOP - 0.01, CZ + dz], 0.015, 'stoneDark', { segments: 4 }),
      ]),
      // vent
      kit.cylinder(0.05, 0.05, 0.22, [CX, WALL_TOP + RISE + 0.12, CZ - 0.5], 'charcoal', { segments: 8 }),
      // front: red sign block above the door, door and windows (both glow at night)
      ...wallPanel(kit, { at: [FRONT, 0.77, CZ + 0.35], facing: 'x+', w: 0.5, h: 0.1, depth: 0.02, color: 'red' }),
      ...door(kit, { at: [FRONT, BASE + 0.22, CZ + 0.35], facing: 'x+', w: 0.3, h: 0.44, color: 'woodDark', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [FRONT, 0.55, CZ - 0.2], facing: 'x+', w: 0.26, h: 0.22 }),
      ...glassWindow(kit, { at: [FRONT, 0.55, CZ - 0.55], facing: 'x+', w: 0.26, h: 0.22 }),
      ...glassWindow(kit, { at: [CX, 0.55, CZ + L / 2], facing: 'z+', w: 0.34, h: 0.24 }),
      ...glassWindow(kit, { at: [CX, 0.55, CZ - L / 2], facing: 'z-', w: 0.34, h: 0.24 }),
      ...glassWindow(kit, { at: [CX - W / 2, 0.55, CZ], facing: 'x-', w: 0.34, h: 0.24 }),
    ];
    // hopper on a four-post stand, fed from the mill by a pipe
    for (const dx of [-0.15, 0.15]) for (const dz of [-0.15, 0.15]) {
      parts.push(kit.box([0.06, HOPPER.legH, 0.06], [HOPPER.x + dx, HOPPER.legH / 2, HOPPER.z + dz], 'wood'));
    }
    parts.push(
      kit.box([0.4, 0.05, 0.4], [HOPPER.x, HOPPER.legH + 0.025, HOPPER.z], 'woodDark'),
      kit.cylinder(HOPPER.top, HOPPER.bottom, HOPPER.h, [HOPPER.x, HOPPER.legH + 0.05 + HOPPER.h / 2, HOPPER.z], 'red', { segments: 8 }),
      kit.cylinder(HOPPER.top + 0.02, HOPPER.top + 0.02, 0.04, [HOPPER.x, HOPPER.legH + 0.05 + HOPPER.h, HOPPER.z], 'redDark', { segments: 8 }),
      rod(kit, [FRONT - 0.02, 0.8, CZ + 0.62], [HOPPER.x - 0.1, 1.02, HOPPER.z - 0.1], 0.04, 'stoneDark'),
      // chute from the hopper foot down and out to the sacks
      rod(kit, [HOPPER.x, HOPPER.legH + 0.02, HOPPER.z], [HOPPER.x + 0.3, 0.42, HOPPER.z + 0.2], 0.055, 'stoneDark'),
    );
    // sacks: three on the ground, two on top, one at the peak
    const sack = (x: number, y: number, z: number, tone: 'sand' | 'cream') => parts.push(
      kit.cylinder(SACK.r, SACK.r + 0.02, SACK.h, [x, y + SACK.h / 2, z], tone, { segments: 8 }),
      kit.cone(SACK.r, 0.08, [x, y + SACK.h + 0.04, z], tone, { segments: 8 }),
    );
    const SX = 0.8;
    sack(SX, 0, 1.0, 'sand'); sack(SX, 0, 1.2, 'cream'); sack(SX, 0, 1.38, 'sand');
    sack(SX, 0.28, 1.1, 'cream'); sack(SX, 0.28, 1.3, 'sand');
    sack(SX, 0.56, 1.2, 'cream');
    return kit.finish(parts);
  },
};
