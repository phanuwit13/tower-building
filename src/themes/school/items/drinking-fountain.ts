import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { wallPanel } from '../../../models/parts';

// A square stone pillar with a round basin on top, 0.9 tall to the basin rim. The basin is a white
// bowl with a thick round rim and water sitting just below it. Front (+x): a white tile with a blue
// water drop, and a little step for small kids.
const PLINTH = { w: 0.44, h: 0.05 };
const PILLAR = { w: 0.24, top: 0.72 };
const CAP = { w: 0.3, h: 0.04 }; // blue band under the basin
const BOWL = { rTop: 0.25, rBottom: 0.14, h: 0.09 }; // its top is the water level
const WATER_Y = PILLAR.top + CAP.h + BOWL.h; // 0.85
const WATER = { r: 0.22, h: 0.01 };
const RIM = { r: 0.235, tube: 0.033, y: WATER_Y + 0.017 }; // flat ring; its top is ~0.9
const STEP = { d: 0.12, h: 0.08, w: 0.32 };
const TILE = { w: 0.17, h: 0.22, y: 0.48 };
const DROP = { r: 0.055, y: 0.46 }; // water drop on the tile: a ball with a cone on top
/** Spouts: chrome nozzles near the front of the basin, each with an arc of water falling back in. */
const SPOUT = { x: 0.12, z: 0.1, r: 0.026, h: 0.07 }; // h = how far the nozzle stands out of the water
const ARC = { r: 0.075, tube: 0.017, sweep: 1.25 * Math.PI }; // from the nozzle tip up, over and down to the water

/** ตู้น้ำดื่ม: a stone drinking fountain with a round basin and two spouts arcing water. */
export const item: ItemModel = {
  id: 'drinking-fountain',
  name: 'ตู้น้ำดื่ม',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const waterTop = WATER_Y + WATER.h;
    const tipY = waterTop + SPOUT.h;
    const face = PILLAR.w / 2; // the pillar's front face (x)
    const parts: Part[] = [
      kit.box([PLINTH.w, PLINTH.h, PLINTH.w], [0, PLINTH.h / 2, 0], 'stone'),
      kit.box([PILLAR.w, PILLAR.top - PLINTH.h, PILLAR.w], [0, (PLINTH.h + PILLAR.top) / 2, 0], 'stone'),
      kit.box([CAP.w, CAP.h, CAP.w], [0, PILLAR.top + CAP.h / 2, 0], 'blue'),
      kit.cylinder(BOWL.rTop, BOWL.rBottom, BOWL.h, [0, WATER_Y - BOWL.h / 2, 0], 'white', { segments: 12 }),
      kit.cylinder(WATER.r, WATER.r, WATER.h, [0, WATER_Y + WATER.h / 2, 0], 'skyBlue', { segments: 12 }),
      kit.torus(RIM.r, RIM.tube, [0, RIM.y, 0], 'white', { rotate: [Math.PI / 2, 0, 0], radialSegments: 6, tubularSegments: 12 }),
      kit.box([STEP.d, STEP.h, STEP.w], [PLINTH.w / 2 + STEP.d / 2, STEP.h / 2, 0], 'stoneDark'),
      ...wallPanel(kit, { at: [face, TILE.y, 0], facing: 'x+', w: TILE.w, h: TILE.h, depth: 0.012, color: 'white' }),
      kit.sphere(DROP.r, [face + 0.02, DROP.y, 0], 'blue', { detail: 0, scale: [0.35, 1, 1] }),
      kit.cone(DROP.r * 0.82, DROP.r * 1.3, [face + 0.02, DROP.y + DROP.r * 1.15, 0], 'blue', { segments: 8, scale: [0.35, 1, 1] }),
    ];
    for (const s of [-1, 1]) {
      const z = s * SPOUT.z;
      parts.push(
        kit.cylinder(SPOUT.r * 0.8, SPOUT.r, SPOUT.h, [SPOUT.x, waterTop + SPOUT.h / 2, z], 'stone', { segments: 8 }),
        // the ring starts at angle 0 (its +x end) on the nozzle tip and sweeps up, back and down to the water
        kit.torus(ARC.r, ARC.tube, [SPOUT.x - ARC.r, tipY, z], 'skyBlue', { arc: ARC.sweep, radialSegments: 4, tubularSegments: 8 }),
      );
    }
    return kit.finish(parts);
  },
};
