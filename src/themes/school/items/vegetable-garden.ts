import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Raised bed, long side along z. Cabbages in the back row (-x), carrots in the front row (+x).
const BED = { w: 0.84, d: 1.84, h: 0.17, plank: 0.06 }; // outer size of the wooden frame
const POST = { s: 0.08, h: 0.21 }; // corner posts stand a little proud of the planks
const SOIL_TOP = BED.h - 0.03;
const RIDGE = { w: 0.22, h: 0.035 }; // a soil ridge under each row
const CABBAGE = { x: -0.17, z: [-0.62, -0.21, 0.21, 0.62], r: 0.11 };
const CARROT = { x: 0.18, z: [-0.68, -0.34, 0, 0.34, 0.68], r: 0.062, h: 0.2, show: 0.07 }; // `show` = how far it sticks up out of the soil
const TOP_LEAF = { r: 0.032, h: 0.18, spread: 0.42 }; // carrot tops: three thin cones fanning out

/** แปลงผัก: a raised vegetable bed in a wooden frame, a row of cabbages and a row of carrots. */
export const item: ItemModel = {
  id: 'vegetable-garden',
  name: 'แปลงผัก',
  category: 'nature',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const hx = (BED.w - BED.plank) / 2;
    const hz = (BED.d - BED.plank) / 2;
    const parts: Part[] = [
      kit.box([BED.w - 2 * BED.plank, SOIL_TOP, BED.d - 2 * BED.plank], [0, SOIL_TOP / 2, 0], 'bark'),
    ];
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([BED.plank, BED.h, BED.d], [s * hx, BED.h / 2, 0], 'wood'),
        kit.box([BED.w - 2 * BED.plank, BED.h, BED.plank], [0, BED.h / 2, s * hz], 'wood'),
      );
      for (const t of [-1, 1]) parts.push(kit.box([POST.s, POST.h, POST.s], [s * (BED.w - POST.s) / 2, POST.h / 2, t * (BED.d - POST.s) / 2], 'woodDark'));
    }
    for (const x of [CABBAGE.x, CARROT.x]) {
      parts.push(kit.box([RIDGE.w, RIDGE.h, BED.d - 2 * BED.plank - 0.06], [x, SOIL_TOP + RIDGE.h / 2, 0], 'bark'));
    }
    const ground = SOIL_TOP + RIDGE.h;
    for (const z of CABBAGE.z) {
      parts.push(
        kit.sphere(1, [CABBAGE.x, ground + 0.03, z], 'leaf', { detail: 0, scale: [CABBAGE.r * 1.45, 0.06, CABBAGE.r * 1.45] }), // open outer leaves
        kit.sphere(CABBAGE.r, [CABBAGE.x, ground + CABBAGE.r * 0.85, z], 'lime'), // the round head
      );
    }
    for (const z of CARROT.z) {
      const top = ground + CARROT.show;
      parts.push(kit.cone(CARROT.r, CARROT.h, [CARROT.x, top - CARROT.h / 2, z], 'orange', { segments: 8, rotate: [Math.PI, 0, 0] }));
      for (const a of [-1, 0, 1]) {
        // fan the tops across the row (z) so all three show from the front
        parts.push(kit.cone(TOP_LEAF.r, TOP_LEAF.h, [CARROT.x, top + TOP_LEAF.h / 2 - 0.01, z + a * 0.03], a === 0 ? 'leaf' : 'leafDark',
          { segments: 4, rotate: [a * TOP_LEAF.spread, 0, 0] }));
      }
    }
    return kit.finish(parts);
  },
};
