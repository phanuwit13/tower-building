import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Two striped deck loungers side by side (1×2: they lie along x, one at each end of z) with a small round table between.
const LOUNGER = { len: 0.84, w: 0.5, seatY: 0.2, t: 0.05, x0: -0.34 }; // x0: the head end (the backrest hinge)
const BACK = { len: 0.42, angle: 1.05 }; // backrest length and its angle above the seat (radians)
const STRIPES = 6;
const LEG = { w: 0.05, h: LOUNGER.seatY - LOUNGER.t / 2 };
const ZS = [-0.6, 0.6];
const TABLE = { r: 0.15, h: 0.27 };

/** One lounger centred on z, in a colour pair. */
function lounger(kit: Parameters<ItemModel['build']>[0], z: number, a: 'red' | 'blue', b: 'white' | 'sunYellow'): Part[] {
  const parts: Part[] = [];
  const seatLen = LOUNGER.len - 0.1;
  const step = seatLen / STRIPES;
  for (let i = 0; i < STRIPES; i++) {
    parts.push(kit.box([step, LOUNGER.t, LOUNGER.w], [LOUNGER.x0 + 0.1 + step * (i + 0.5), LOUNGER.seatY, z], i % 2 === 0 ? a : b));
  }
  // backrest: stripes along its length, hinged at the head end and leaning back towards -x
  const dirX = -Math.cos(BACK.angle);
  const dirY = Math.sin(BACK.angle);
  const bstep = BACK.len / 3;
  for (let i = 0; i < 3; i++) {
    const s = bstep * (i + 0.5);
    parts.push(kit.box([bstep, LOUNGER.t, LOUNGER.w], [LOUNGER.x0 + 0.1 + dirX * s, LOUNGER.seatY + dirY * s, z], i % 2 === 0 ? b : a, { rotate: [0, 0, Math.PI - BACK.angle] }));
  }
  // legs and a frame rail along each side
  for (const sx of [LOUNGER.x0 + 0.14, LOUNGER.x0 + LOUNGER.len - 0.05]) {
    for (const sz of [-1, 1]) parts.push(kit.box([LEG.w, LEG.h, LEG.w], [sx, LEG.h / 2, z + sz * (LOUNGER.w / 2 - 0.04)], 'wood'));
  }
  for (const sz of [-1, 1]) parts.push(kit.box([LOUNGER.len - 0.1, 0.03, 0.04], [LOUNGER.x0 + 0.1 + (LOUNGER.len - 0.1) / 2, LOUNGER.seatY - 0.04, z + sz * (LOUNGER.w / 2 - 0.02)], 'woodDark'));
  return parts;
}

/** เก้าอี้ผ้าใบคู่: two striped deck loungers side by side with a small table. */
export const item: ItemModel = {
  id: 'sunloungers',
  name: 'เก้าอี้ผ้าใบคู่',
  category: 'seating',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      ...lounger(kit, ZS[0], 'red', 'white'),
      ...lounger(kit, ZS[1], 'blue', 'sunYellow'),
    ];
    const tx = 0.05;
    parts.push(kit.cylinder(0.035, 0.05, TABLE.h - 0.03, [tx, (TABLE.h - 0.03) / 2, 0], 'woodDark', { segments: 8 }));
    parts.push(kit.cylinder(TABLE.r, TABLE.r, 0.03, [tx, TABLE.h - 0.015, 0], 'sunYellow', { segments: 12 }));
    parts.push(kit.sphere(0.045, [tx + 0.04, TABLE.h + 0.04, 0.02], 'orange', { detail: 0 })); // an orange on the table
    parts.push(kit.sphere(0.03, [tx - 0.05, TABLE.h + 0.025, -0.05], 'leaf', { detail: 0 }));
    return kit.finish(parts);
  },
};
