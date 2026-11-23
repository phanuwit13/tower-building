import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

// A toy market stall (1×2, front on +x): a pegboard back and a slanted striped canopy, a table of
// toys (teddy, balls, blocks, a rocket, a car) with pinwheels, and a row of glowing bulbs.
const TABLE = { x: 0.2, w: 0.34, d: 1.5, h: 0.34 };
const BACK = { x: -0.42, h: 1.0 };
const TOP = TABLE.h + 0.04;
const PIN_COLORS: PaletteColor[] = ['pink', 'sunYellow', 'blue', 'lime'];
const TILT = 0.27;

function pinwheel(kit: Parameters<ItemModel['build']>[0], z: number, y: number, parts: Part[], shift: number): void {
  const x = TABLE.x + 0.1;
  parts.push(rod(kit, [x, TOP, z], [x, y, z], 0.012, 'white', { segments: 4 }), kit.sphere(0.02, [x + 0.02, y, z], 'brass', { detail: 0 }));
  PIN_COLORS.forEach((color, k) => {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    parts.push(kit.box([0.02, 0.08, 0.05], [x, y + Math.cos(a) * 0.05, z + Math.sin(a) * 0.05], PIN_COLORS[(k + shift) % 4], { rotate: [a, 0, 0] }));
  });
}

/** แผงของเล่น: a toy stall with pinwheels, balls and a glowing bulb row. */
export const item: ItemModel = {
  id: 'toy-stall',
  name: 'แผงของเล่น',
  category: 'play',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      // table with a cloth front, and a pegboard back wall
      kit.box([TABLE.w, TABLE.h, TABLE.d], [TABLE.x, TABLE.h / 2, 0], 'blue'),
      kit.box([TABLE.w + 0.04, 0.04, TABLE.d + 0.04], [TABLE.x, TABLE.h + 0.02, 0], 'white'),
      kit.box([0.04, BACK.h, 1.6], [BACK.x, BACK.h / 2, 0], 'woodDark'),
      kit.box([0.3, 0.1, 1.5], [BACK.x + 0.15, 0.05, 0], 'wood'),
    ];
    for (const z of [-0.78, 0.78]) parts.push(kit.box([0.06, 1.1, 0.06], [BACK.x, 0.55, z], 'wood'));
    // slanted striped canopy, high at the back and sloping down towards the front
    const strips = 8;
    const sz = 1.6 / strips;
    for (let i = 0; i < strips; i++) {
      parts.push(kit.box([0.62, 0.04, sz], [-0.17, 1.03, -0.8 + sz * (i + 0.5)], i % 2 ? 'white' : 'orange', { rotate: [0, 0, -TILT] }));
    }
    // toys hung on the pegboard
    ['pink', 'lime', 'sunYellow', 'blue', 'purple', 'orange'].forEach((color, i) => {
      parts.push(kit.sphere(0.07, [BACK.x + 0.07, 0.72 + (i % 2) * 0.15, -0.65 + i * 0.26], color as PaletteColor, { detail: 0 }));
    });
    // toys on the table: a teddy, balls, a block stack, a rocket and a car
    parts.push(
      kit.sphere(0.09, [TABLE.x - 0.05, TOP + 0.09, -0.6], 'wood', { detail: 0 }),
      kit.sphere(0.065, [TABLE.x - 0.05, TOP + 0.22, -0.6], 'wood', { detail: 0 }),
      kit.sphere(0.025, [TABLE.x - 0.05, TOP + 0.27, -0.66], 'sand', { detail: 0 }),
      kit.sphere(0.025, [TABLE.x - 0.05, TOP + 0.27, -0.54], 'sand', { detail: 0 }),
      kit.box([0.1, 0.1, 0.1], [TABLE.x - 0.05, TOP + 0.05, -0.2], 'red'),
      kit.box([0.1, 0.1, 0.1], [TABLE.x - 0.05, TOP + 0.05, -0.08], 'sunYellow'),
      kit.box([0.1, 0.1, 0.1], [TABLE.x - 0.05, TOP + 0.15, -0.14], 'blue'),
      kit.cylinder(0.05, 0.05, 0.2, [TABLE.x - 0.05, TOP + 0.1, 0.3], 'white', { segments: 8 }),
      kit.cone(0.05, 0.1, [TABLE.x - 0.05, TOP + 0.25, 0.3], 'red', { segments: 8 }),
      kit.box([0.14, 0.07, 0.22], [TABLE.x - 0.02, TOP + 0.045, 0.6], 'lime'),
      kit.box([0.1, 0.05, 0.12], [TABLE.x - 0.02, TOP + 0.1, 0.6], 'skyBlue'),
    );
    for (const z of [0.52, 0.68]) for (const x of [TABLE.x - 0.08, TABLE.x + 0.04]) parts.push(kit.cylinder(0.03, 0.03, 0.03, [x, TOP + 0.03, z], 'charcoal', { segments: 8, rotate: [Math.PI / 2, 0, 0] }));
    for (const [i, z] of [-0.1, 0.62].entries()) parts.push(kit.sphere(0.06, [TABLE.x + 0.1, TOP + 0.06, z + 0.3 * i - 0.3], PIN_COLORS[i + 1], { detail: 0 }));
    pinwheel(kit, -0.45, 0.75, parts, 0);
    pinwheel(kit, 0.05, 0.8, parts, 1);
    pinwheel(kit, 0.5, 0.75, parts, 2);
    // a row of glowing bulbs under the front edge of the canopy
    for (let i = 0; i < 7; i++) {
      parts.push(kit.sphere(0.035, [0.12, 0.9, -0.72 + i * 0.24], 'lampWarm', { detail: 0, glow: true, light: 'breathe' }));
    }
    return kit.finish(parts);
  },
};
