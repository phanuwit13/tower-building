import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

const MAT = { s: 1.96, h: 0.04 }; // blue mat round the castle
const T = 0.7; // towers and walls stand at x, z = ±T
const TOWER = { r: 0.24, lower: 0.62, upper: 0.35, roofR: 0.27, roofH: 0.4 };
const WALL = { thick: 0.24, h: 0.55 };
const FLAG = { len: 0.24, h: 0.2, strips: 3, poleH: 0.42 };
const FLAG_COLORS: PaletteColor[] = ['sunYellow', 'blue', 'lime', 'orange'];

/** ปราสาทเป่าลม: a puffy inflatable castle with four round towers, a bouncy floor and little waving flags. */
export const item: ItemModel = {
  id: 'bouncy-castle',
  name: 'ปราสาทเป่าลม',
  category: 'play',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([MAT.s, MAT.h, MAT.s], [0, MAT.h / 2, 0], 'skyBlue'),
      kit.box([1.5, 0.12, 1.5], [0, MAT.h + 0.06, 0], 'pink'),
    ];
    const wallY = MAT.h + WALL.h / 2;
    const span = T * 2 - TOWER.r * 2 + 0.1; // wall length between two towers
    parts.push(
      kit.box([WALL.thick, WALL.h, span], [-T, wallY, 0], 'sunYellow'),
      kit.box([span, WALL.h, WALL.thick], [0, wallY, -T], 'sunYellow'),
      kit.box([span, WALL.h, WALL.thick], [0, wallY, T], 'sunYellow'),
    );
    // front wall (+x) with a round arched doorway
    for (const s of [-1, 1]) parts.push(kit.box([WALL.thick, WALL.h, 0.2], [T, wallY, s * 0.4], 'sunYellow'));
    parts.push(kit.torus(0.3, 0.1, [T, MAT.h, 0], 'orange', { arc: Math.PI, rotate: [0, Math.PI / 2, 0], tubularSegments: 8 }));
    // puffy tops along the walls
    const topY = MAT.h + WALL.h + 0.05;
    for (const k of [-0.3, 0, 0.3]) {
      parts.push(
        kit.sphere(0.09, [-T, topY, k], 'orange', { detail: 0, scale: [1.2, 0.8, 1.2] }),
        kit.sphere(0.09, [k, topY, -T], 'orange', { detail: 0, scale: [1.2, 0.8, 1.2] }),
        kit.sphere(0.09, [k, topY, T], 'orange', { detail: 0, scale: [1.2, 0.8, 1.2] }),
      );
    }
    for (const s of [-1, 1]) parts.push(kit.sphere(0.09, [T, topY, s * 0.4], 'orange', { detail: 0, scale: [1.2, 0.8, 1.2] }));
    // four towers: pink body, purple puff, red cone roof, a pole and a flag
    let n = 0;
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const x = sx * T;
        const z = sz * T;
        const y0 = MAT.h;
        const roofBase = y0 + TOWER.lower + TOWER.upper;
        const tip = roofBase + TOWER.roofH;
        parts.push(
          kit.cylinder(TOWER.r, TOWER.r, TOWER.lower, [x, y0 + TOWER.lower / 2, z], 'pink'),
          kit.cylinder(TOWER.r, TOWER.r, TOWER.upper, [x, y0 + TOWER.lower + TOWER.upper / 2, z], 'purple'),
          kit.cone(TOWER.roofR, TOWER.roofH, [x, roofBase + TOWER.roofH / 2, z], 'red'),
          kit.cylinder(0.02, 0.02, FLAG.poleH, [x, tip + FLAG.poleH / 2 - 0.02, z], 'white', { segments: 6 }),
        );
        const wave: MotionOpts = { kind: 'wave', pivot: [x + 0.02, tip + FLAG.poleH - FLAG.h / 2 - 0.02, z], axis: [1, 0, 0] };
        const w = FLAG.len / FLAG.strips;
        for (let k = 0; k < FLAG.strips; k++) {
          parts.push(kit.box([w, FLAG.h, 0.02], [x + 0.02 + w * (k + 0.5), tip + FLAG.poleH - FLAG.h / 2 - 0.02, z], FLAG_COLORS[n], { motion: wave }));
        }
        n++;
      }
    }
    return kit.finish(parts);
  },
};
