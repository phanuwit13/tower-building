import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, glassWindow, wallPanel } from '../../../models/parts';

// Cartoon-spooky only: a crooked purple house with a tilted roof, a smiling sheet ghost on the porch, pumpkins
// and bats as flat shapes. No skulls, blood or gore. Front faces +x.
const BASE = { w: 1.94, h: 0.05, d: 2.94 };
const BODY = { x: -0.2, z: -0.25, w: 1.2, d: 2.2, h: 0.9 };
const WALL_TOP = BASE.h + BODY.h;
const FRONT = BODY.x + BODY.w / 2; // the +x wall
const ROOF = { w: 1.5, h: 0.55, d: 2.3, tilt: 0.07 }; // crooked: turned a little about z
const TURRET = { x: -0.5, z: -1.1, r: 0.3, h: 1.5 };
const GHOST = { x: 0.68, z: 0.5 };

const pumpkin = (kit: Parameters<ItemModel['build']>[0], x: number, z: number, r: number): Part[] => [
  kit.sphere(r, [x, BASE.h + r * 0.75, z], 'orange', { scale: [1, 0.78, 1] }),
  kit.cylinder(0.02, 0.025, 0.07, [x, BASE.h + r * 1.5 + 0.02, z], 'leafDark', { segments: 6 }),
];

/** A flat cartoon bat on a wall facing +x: round body, two pointed wings. */
const bat = (kit: Parameters<ItemModel['build']>[0], y: number, z: number): Part[] => [
  kit.sphere(0.07, [FRONT + 0.04, y, z], 'charcoal', { detail: 0 }),
  kit.wedge([0.16, 0.08, 0.2], [FRONT + 0.04, y, z - 0.16], 'charcoal', { rotate: [0, Math.PI, 0] }),
  kit.wedge([0.16, 0.08, 0.2], [FRONT + 0.04, y, z + 0.16], 'charcoal'),
  kit.sphere(0.02, [FRONT + 0.1, y + 0.01, z - 0.025], 'sunYellow', { detail: 0 }), // eyes
  kit.sphere(0.02, [FRONT + 0.1, y + 0.01, z + 0.025], 'sunYellow', { detail: 0 }),
];

/** บ้านผีสิง: a crooked purple house with a friendly sheet ghost. */
export const item: ItemModel = {
  id: 'haunted-house',
  name: 'บ้านผีสิง',
  category: 'ride',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'leafDark'),
      kit.box([BODY.w, BODY.h, BODY.d], [BODY.x, BASE.h + BODY.h / 2, BODY.z], 'purple'),
      kit.box([BODY.w + 0.04, 0.06, BODY.d + 0.04], [BODY.x, BASE.h + 0.03, BODY.z], 'navy'), // dark foot
      // crooked roof, a crooked chimney and a round turret with a tilted cone cap
      kit.wedge([ROOF.w, ROOF.h, ROOF.d], [BODY.x, WALL_TOP + ROOF.h / 2, BODY.z - 0.05], 'navy', { rotate: [0, 0, ROOF.tilt] }),
      kit.box([0.16, 0.34, 0.16], [BODY.x + 0.25, WALL_TOP + 0.5, BODY.z + 0.5], 'stoneDark', { rotate: [0.1, 0, -0.14] }),
      kit.cylinder(TURRET.r, TURRET.r, TURRET.h - BASE.h, [TURRET.x, BASE.h + (TURRET.h - BASE.h) / 2, TURRET.z], 'purple', { segments: 8 }),
      kit.cone(TURRET.r + 0.05, 0.5, [TURRET.x, TURRET.h + 0.2, TURRET.z], 'redDark', { segments: 8, rotate: [0.1, 0, 0.12] }),
      // porch step and door
      kit.box([0.3, 0.03, 0.7], [FRONT + 0.15, BASE.h + 0.015, -0.25], 'woodDark'),
      ...door(kit, { at: [FRONT, BASE.h + 0.27, -0.25], facing: 'x+', w: 0.34, h: 0.5, color: 'woodDark', knob: 'sunYellow' }),
      ...wallPanel(kit, { at: [FRONT, WALL_TOP - 0.1, -0.25], facing: 'x+', w: 0.46, h: 0.1, depth: 0.03, color: 'orange' }),
    ];
    // windows: steady panes plus two small ones that flicker
    parts.push(
      ...glassWindow(kit, { at: [FRONT, 0.6, -0.9], facing: 'x+', w: 0.24, h: 0.3, frame: 'navy' }),
      ...glassWindow(kit, { at: [FRONT, 0.6, -1.15], facing: 'x+', w: 0.1, h: 0.3, frame: 'navy', panes: 1 }),
      kit.box([0.03, 0.26, 0.2], [FRONT + 0.015, 0.6, 0.45], 'windowWarm', { glow: true, light: 'blink' }),
    );
    for (const x of [-0.6, -0.1]) {
      parts.push(
        ...glassWindow(kit, { at: [x, 0.6, BODY.z + BODY.d / 2], facing: 'z+', w: 0.24, h: 0.3, frame: 'navy' }),
        ...glassWindow(kit, { at: [x, 0.6, BODY.z - BODY.d / 2], facing: 'z-', w: 0.24, h: 0.3, frame: 'navy' }),
      );
    }
    parts.push(
      ...glassWindow(kit, { at: [BODY.x + 0.2, 0.6, BODY.z + BODY.d / 2], facing: 'z+', w: 0.2, h: 0.3, frame: 'navy', panes: 1 }),
      kit.box([0.03, 0.2, 0.16], [BODY.x - BODY.w / 2 - 0.015, 0.6, 0.1], 'windowWarm', { glow: true, light: 'blink' }),
    );
    // sheet ghost (big and friendly): a tapering white sheet, round head, two eyes and a big smile
    const G = 1.5;
    const gy = BASE.h;
    parts.push(
      kit.cylinder(0.13 * G, 0.2 * G, 0.3 * G, [GHOST.x, gy + 0.15 * G, GHOST.z], 'white', { segments: 8 }),
      kit.sphere(0.15 * G, [GHOST.x, gy + 0.4 * G, GHOST.z], 'white', { detail: 1 }),
      kit.sphere(0.03 * G, [GHOST.x + 0.13 * G, gy + 0.44 * G, GHOST.z - 0.06 * G], 'charcoal', { detail: 0 }),
      kit.sphere(0.03 * G, [GHOST.x + 0.13 * G, gy + 0.44 * G, GHOST.z + 0.06 * G], 'charcoal', { detail: 0 }),
      kit.sphere(0.04 * G, [GHOST.x + 0.13 * G, gy + 0.35 * G, GHOST.z], 'charcoal', { detail: 0, scale: [0.4, 0.5, 1.4] }),
      kit.sphere(0.045 * G, [GHOST.x, gy + 0.22 * G, GHOST.z - 0.2 * G], 'white', { detail: 0 }), // little hands
      kit.sphere(0.045 * G, [GHOST.x, gy + 0.22 * G, GHOST.z + 0.2 * G], 'white', { detail: 0 }),
    );
    parts.push(...pumpkin(kit, 0.72, -0.85, 0.18), ...pumpkin(kit, 0.62, 1.2, 0.15), ...pumpkin(kit, -0.6, 1.2, 0.2));
    parts.push(...bat(kit, 0.8, -0.8), ...bat(kit, 0.75, 0.3));
    return kit.finish(parts);
  },
};
