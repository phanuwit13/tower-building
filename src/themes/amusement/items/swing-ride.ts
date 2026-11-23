import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';
import { aim } from '../../../models/parts';

const BASE = { r: 0.95, h: 0.05 }; // round stone pad
const TOWER = { rTop: 0.11, rBottom: 0.17, top: 1.6 }; // central column (does not spin)
const DISC = { r: 0.85, h: 0.07 }; // the spinning top disc, its underside at TOWER.top
const CANOPY = { r: 0.55, h: 0.3 };
const SEATS = 8;
const CHAIN = { rTop: 0.7, rSeat: 0.8, seatY: 0.62, r: 0.012, gap: 0.07 }; // two chains per seat, hanging a little outwards
const SEAT = { len: 0.2, t: 0.04, w: 0.22, back: 0.13 };
const SEAT_COLORS: PaletteColor[] = ['red', 'sunYellow', 'blue', 'pink'];

// Disc, canopy, chains and seats turn together about the tower.
const SPIN: MotionOpts = { kind: 'spin', pivot: [0, 0, 0], speed: 0.4 };

/** ชิงช้าโซ่หมุน: a tower with a striped top disc; seats on chains hang from it and the whole top turns slowly. */
export const item: ItemModel = {
  id: 'swing-ride',
  name: 'ชิงช้าโซ่หมุน',
  category: 'ride',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const discTop = TOWER.top + DISC.h;
    const parts: Part[] = [
      kit.cylinder(BASE.r, BASE.r, BASE.h, [0, BASE.h / 2, 0], 'stone', { segments: 16 }),
      kit.cylinder(TOWER.rTop, TOWER.rBottom, TOWER.top - BASE.h, [0, BASE.h + (TOWER.top - BASE.h) / 2, 0], 'white', { segments: 12 }),
      kit.cylinder(0.2, 0.2, 0.08, [0, 0.12, 0], 'blue', { segments: 12 }),
      kit.cylinder(DISC.r, DISC.r, DISC.h, [0, TOWER.top + DISC.h / 2, 0], 'red', { segments: 16, motion: SPIN }),
      // striped canopy: two six-sided cones turned half a facet apart
      kit.cone(CANOPY.r, CANOPY.h, [0, discTop + CANOPY.h / 2, 0], 'sunYellow', { segments: 6, motion: SPIN }),
      kit.cone(CANOPY.r, CANOPY.h, [0, discTop + CANOPY.h / 2, 0], 'white', { segments: 6, rotate: [0, Math.PI / 6, 0], motion: SPIN }),
      kit.sphere(0.06, [0, discTop + CANOPY.h + 0.04, 0], 'sunYellow', { detail: 0, motion: SPIN }),
    ];
    for (let k = 0; k < SEATS; k++) {
      const a = (k / SEATS) * Math.PI * 2;
      // a point at radius r, height y and sideways offset t (tangent) round the ride
      const at = (r: number, y: number, t: number): Vec3 => [r * Math.cos(a) - t * Math.sin(a), y, -r * Math.sin(a) - t * Math.cos(a)];
      const color = SEAT_COLORS[k % SEAT_COLORS.length];
      for (const s of [-1, 1]) {
        const top = at(CHAIN.rTop, TOWER.top, s * CHAIN.gap);
        const low = at(CHAIN.rSeat, CHAIN.seatY + SEAT.t / 2, s * CHAIN.gap);
        const dir: Vec3 = [low[0] - top[0], low[1] - top[1], low[2] - top[2]];
        const mid: Vec3 = [(top[0] + low[0]) / 2, (top[1] + low[1]) / 2, (top[2] + low[2]) / 2];
        // a chain is a rod that turns with the seat (the kit's `rod` helper cannot carry a motion)
        parts.push(kit.cylinder(CHAIN.r, CHAIN.r, Math.hypot(...dir), mid, 'stoneDark', { segments: 4, rotate: aim(dir), motion: SPIN }));
      }
      const rotate: Vec3 = [0, a, 0];
      parts.push(
        kit.box([SEAT.len, SEAT.t, SEAT.w], at(CHAIN.rSeat, CHAIN.seatY, 0), color, { rotate, motion: SPIN }),
        kit.box([0.03, SEAT.back, SEAT.w], at(CHAIN.rSeat + SEAT.len / 2 - 0.015, CHAIN.seatY + SEAT.back / 2, 0), color, { rotate, motion: SPIN }),
      );
    }
    return kit.finish(parts);
  },
};
