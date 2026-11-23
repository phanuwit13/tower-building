import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

// A tall water slide: a stair up the -x side of a roofed tower at the -z end, a tube that winds down in
// an S past the tower and ends in a splash pool at the +z end (the water shimmers).
const TOWER = { x: 0, z: -1.15, half: 0.32, deck: 1.68, post: 0.27, top: 2.3 }; // platform top = deck
const STEPS = { n: 6, w: 0.1, x0: -0.87, rise: 0.28, half: 0.15 }; // step i is centred at x0 + w * i, top at rise * (i + 1)
const TUBE_R = 0.09;
/** Centre line of the slide tube, from the tower platform down to the pool. */
const PATH: Vec3[] = [[0.15, 1.82, -1.15], [0.72, 1.55, -0.95], [0.78, 1.25, -0.45], [0.1, 1.0, -0.05], [-0.62, 0.78, 0.3], [-0.15, 0.55, 0.62], [0.3, 0.22, 0.85]];
const TUBE_COLORS: PaletteColor[] = ['red', 'orange', 'sunYellow', 'pink', 'red', 'orange'];
const POOL = { w: 1.9, z0: 0.6, z1: 1.48, rim: 0.12, rimH: 0.16, waterTop: 0.12 };

/** สไลเดอร์น้ำ: a tall twisting water slide ending in a splash pool. */
export const item: ItemModel = {
  id: 'water-slide',
  name: 'สไลเดอร์น้ำ',
  category: 'ride',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [];
    // tower: four posts, a deck, side rails and a cone roof
    for (const sx of [1, -1]) {
      for (const sz of [1, -1]) {
        parts.push(kit.box([0.08, TOWER.top, 0.08], [TOWER.x + sx * TOWER.post, TOWER.top / 2, TOWER.z + sz * TOWER.post], 'teal'));
      }
    }
    parts.push(kit.box([TOWER.half * 2, 0.06, TOWER.half * 2], [TOWER.x, TOWER.deck - 0.03, TOWER.z], 'wood'));
    for (const sz of [1, -1]) {
      parts.push(kit.box([TOWER.post * 2, 0.03, 0.03], [TOWER.x, TOWER.deck + 0.3, TOWER.z + sz * TOWER.post], 'white'));
    }
    parts.push(kit.cone(0.34, 0.34, [TOWER.x, TOWER.top + 0.17, TOWER.z], 'sunYellow', { segments: 8 }));

    // stairs (solid blocks) and two hand rails
    for (let i = 0; i < STEPS.n; i++) {
      const h = STEPS.rise * (i + 1);
      parts.push(kit.box([STEPS.w, h, STEPS.half * 2], [STEPS.x0 + STEPS.w * i, h / 2, TOWER.z], i % 2 === 0 ? 'stone' : 'white'));
    }
    for (const sz of [1, -1]) {
      const z = TOWER.z + sz * STEPS.half;
      parts.push(rod(kit, [STEPS.x0 - 0.04, 0.4, z], [-0.32, 1.98, z], 0.02, 'white', { segments: 4 }));
    }

    // the tube: a rod per stretch, a ball at each bend, and a post under every bend that is not over the pool
    PATH.forEach((p, i) => {
      if (i > 0) parts.push(rod(kit, PATH[i - 1], p, TUBE_R, TUBE_COLORS[i - 1], { segments: 8 }));
      parts.push(kit.sphere(TUBE_R, p, TUBE_COLORS[Math.min(i, TUBE_COLORS.length - 1)], { detail: 0 }));
      if (i > 0 && p[2] < POOL.z0 - 0.1) parts.push(kit.cylinder(0.035, 0.035, p[1] - TUBE_R, [p[0], (p[1] - TUBE_R) / 2, p[2]], 'white', { segments: 6 }));
    });

    // splash pool
    const zc = (POOL.z0 + POOL.z1) / 2;
    const d = POOL.z1 - POOL.z0;
    const inner = POOL.w - 2 * POOL.rim;
    parts.push(kit.box([inner, POOL.waterTop, d - 2 * POOL.rim], [0, POOL.waterTop / 2, zc], 'skyBlue', { motion: { kind: 'water', water: 'pool' } }));
    for (const s of [1, -1]) {
      parts.push(
        kit.box([POOL.rim, POOL.rimH, d], [s * (POOL.w - POOL.rim) / 2, POOL.rimH / 2, zc], 'white'),
        kit.box([inner, POOL.rimH, POOL.rim], [0, POOL.rimH / 2, zc + s * (d - POOL.rim) / 2], 'white'),
      );
    }
    return kit.finish(parts);
  },
};
