import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A fair-ground carousel: a round platform with a striped cone roof, six horses on poles around a
// middle column, chase bulbs on the roof edge. Platform, column, horses, roof and bulbs spin together.
const BASE = { r: 0.96, h: 0.06 }; // still stone footing
const DECK = { r: 0.9, h: 0.08 };
const PAINT = { r: 0.84, h: 0.02 };
const DECK_TOP = BASE.h + DECK.h + PAINT.h;
const ROOF_Y = 1.55; // underside of the roof
const SKIRT = { r: 0.94, h: 0.08 };
const ROOF = { r: 0.94, h: 0.5 };
const COLUMN_R = 0.13;
const HORSE_RAD = 0.7;
const HORSE_COLORS: PaletteColor[] = ['white', 'pink', 'sunYellow', 'mint', 'orange', 'lime'];
const BULBS = 12;
const SPIN: MotionOpts = { kind: 'spin', pivot: [0, 0, 0], axis: [0, 1, 0], speed: 0.4 };

/** ม้าหมุน: a carousel with horses, a striped roof and chasing bulbs. */
export const item: ItemModel = {
  id: 'carousel',
  name: 'ม้าหมุน',
  category: 'ride',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(BASE.r, BASE.r, BASE.h, [0, BASE.h / 2, 0], 'stone', { segments: 20 }),
      kit.cylinder(DECK.r, DECK.r, DECK.h, [0, BASE.h + DECK.h / 2, 0], 'red', { segments: 20, motion: SPIN }),
      kit.cylinder(PAINT.r, PAINT.r, PAINT.h, [0, BASE.h + DECK.h + PAINT.h / 2, 0], 'sunYellow', { segments: 20, motion: SPIN }),
      kit.cylinder(COLUMN_R, COLUMN_R, ROOF_Y - DECK_TOP, [0, (DECK_TOP + ROOF_Y) / 2, 0], 'sunYellow', { segments: 8, motion: SPIN }),
      kit.cylinder(SKIRT.r, SKIRT.r, SKIRT.h, [0, ROOF_Y + SKIRT.h / 2, 0], 'sunYellow', { segments: 12, motion: SPIN }),
      // striped roof: two six-sided cones, half a segment apart
      kit.cone(ROOF.r, ROOF.h, [0, ROOF_Y + SKIRT.h + ROOF.h / 2, 0], 'red', { segments: 6, motion: SPIN }),
      kit.cone(ROOF.r, ROOF.h, [0, ROOF_Y + SKIRT.h + ROOF.h / 2, 0], 'white', { segments: 6, rotate: [0, Math.PI / 6, 0], motion: SPIN }),
      kit.sphere(0.07, [0, ROOF_Y + SKIRT.h + ROOF.h + 0.04, 0], 'sunYellow', { detail: 0, motion: SPIN }),
    ];
    for (let index = 0; index < BULBS; index++) {
      const a = (index / BULBS) * Math.PI * 2;
      parts.push(kit.sphere(0.045, [0.94 * Math.cos(a), ROOF_Y + SKIRT.h / 2, -0.94 * Math.sin(a)], 'lampWarm',
        { detail: 0, glow: true, light: 'chase', chase: { index, count: BULBS }, motion: SPIN }));
    }
    HORSE_COLORS.forEach((color, i) => {
      const a = (i / HORSE_COLORS.length) * Math.PI * 2;
      const px = HORSE_RAD * Math.cos(a);
      const pz = HORSE_RAD * Math.sin(a);
      const yaw = Math.atan2(-Math.cos(a), -Math.sin(a)); // local +x runs along the circle
      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      const turn: [number, number, number] = [0, yaw, 0];
      const at = (lx: number, ly: number, lz: number): [number, number, number] => [px + lx * cy + lz * sy, ly, pz - lx * sy + lz * cy];
      const bodyY = 0.62 + (i % 2) * 0.12; // neighbours ride at two heights
      parts.push(
        kit.cylinder(0.025, 0.025, ROOF_Y - DECK_TOP, [px, (DECK_TOP + ROOF_Y) / 2, pz], 'brass', { segments: 4, motion: SPIN }),
        kit.sphere(0.12, at(0, bodyY, 0), color, { detail: 0, scale: [1.6, 0.9, 0.7], rotate: turn, motion: SPIN }),
        kit.sphere(0.09, at(0.21, bodyY + 0.14, 0), color, { detail: 0, scale: [1.3, 1, 0.8], rotate: turn, motion: SPIN }),
        kit.box([0.07, 0.1, 0.08], at(0.1, bodyY + 0.1, 0), color, { rotate: turn, motion: SPIN }),
        kit.box([0.04, 0.12, 0.05], at(-0.2, bodyY - 0.02, 0), 'brass', { rotate: turn, motion: SPIN }),
        kit.box([0.16, 0.04, 0.12], at(0, bodyY + 0.09, 0), 'red', { rotate: turn, motion: SPIN }),
        kit.box([0.05, 0.14, 0.12], at(0.12, bodyY - 0.14, 0), color, { rotate: turn, motion: SPIN }),
        kit.box([0.05, 0.14, 0.12], at(-0.12, bodyY - 0.14, 0), color, { rotate: turn, motion: SPIN }),
        kit.box([0.04, 0.04, 0.04], at(0.3, bodyY + 0.1, 0), 'charcoal', { rotate: turn, motion: SPIN }),
      );
    });
    return kit.finish(parts);
  },
};
