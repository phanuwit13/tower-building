import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

// A big sandcastle (2×2) on a sandy mound with a water moat round it: a keep, four round towers and a little flag.
const BASE = { s: 1.92, h: 0.05 };
const MOAT = { inner: 0.62, outer: 0.84, h: 0.03 }; // moat ring between these half-widths, sitting on the base
const KEEP = { w: 0.72, h: 0.55 };
const TOWER = { off: 0.42, r: 0.17, h: 0.78 };
const CRENEL = 0.07;
const FLAG = { poleH: 0.42, w: 0.32, h: 0.17, strips: 4 };
const WAVE: MotionOpts = { kind: 'wave', pivot: [0, 0, 0], axis: [1, 0, 0] }; // pivot set below

/** ปราสาททราย: a sandcastle with towers, a moat and a flag on top. */
export const item: ItemModel = {
  id: 'sandcastle',
  name: 'ปราสาททราย',
  category: 'play',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const y0 = BASE.h;
    const parts: Part[] = [kit.box([BASE.s, BASE.h, BASE.s], [0, BASE.h / 2, 0], 'sand')];
    // moat: four strips round a square
    const mw = MOAT.outer - MOAT.inner;
    const mid = (MOAT.outer + MOAT.inner) / 2;
    const water = { kind: 'water', water: 'pond' } as const;
    parts.push(
      kit.box([mw, MOAT.h, 2 * MOAT.outer], [mid, y0 + MOAT.h / 2, 0], 'navy', { motion: water }),
      kit.box([mw, MOAT.h, 2 * MOAT.outer], [-mid, y0 + MOAT.h / 2, 0], 'navy', { motion: water }),
      kit.box([2 * MOAT.inner, MOAT.h, mw], [0, y0 + MOAT.h / 2, mid], 'navy', { motion: water }),
      kit.box([2 * MOAT.inner, MOAT.h, mw], [0, y0 + MOAT.h / 2, -mid], 'navy', { motion: water }),
      // plank bridge over the moat on the front (+x)
      kit.box([mw + 0.14, 0.03, 0.26], [mid, y0 + MOAT.h + 0.015, 0], 'wood'),
    );
    // keep with a gate and battlements
    const ky = y0 + KEEP.h / 2;
    parts.push(kit.box([KEEP.w, KEEP.h, KEEP.w], [0, ky, 0], 'cream'));
    parts.push(kit.box([0.03, 0.26, 0.2], [KEEP.w / 2 + 0.005, y0 + 0.13, 0], 'woodDark'));
    parts.push(kit.wedge([0.2, 0.08, 0.03], [KEEP.w / 2 + 0.01, y0 + 0.3, 0], 'woodDark', { rotate: [0, Math.PI / 2, 0] }));
    const top = y0 + KEEP.h;
    for (const [x, z] of [[-0.27, -0.27], [0.27, -0.27], [-0.27, 0.27], [0.27, 0.27], [0, -0.3], [0, 0.3], [-0.3, 0], [0.3, 0]] as Array<[number, number]>) {
      parts.push(kit.box([CRENEL, 0.07, CRENEL], [x, top + 0.035, z], 'cream'));
    }
    // four round towers with cone caps
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const x = sx * (KEEP.w / 2 + 0.05);
        const z = sz * (KEEP.w / 2 + 0.05);
        parts.push(kit.cylinder(TOWER.r * 0.9, TOWER.r, TOWER.h, [x, y0 + TOWER.h / 2, z], 'sand', { segments: 8 }));
        parts.push(kit.cone(TOWER.r * 1.2, 0.22, [x, y0 + TOWER.h + 0.11, z], 'red', { segments: 8 }));
        parts.push(kit.box([0.05, 0.08, 0.05], [x + 0.17 * 0.0, y0 + 0.44, z + sz * TOWER.r * 0.9], 'woodDark')); // arrow slit
      }
    }
    // flag on the keep: pole plus a cloth cut into strips, rippling about the pole
    const px = 0;
    const pz = 0;
    parts.push(kit.cylinder(0.018, 0.018, FLAG.poleH, [px, top + FLAG.poleH / 2, pz], 'white', { segments: 6 }));
    parts.push(kit.sphere(0.03, [px, top + FLAG.poleH + 0.02, pz], 'sunYellow', { detail: 0 }));
    const fy = top + FLAG.poleH - FLAG.h / 2 - 0.02;
    const wave: MotionOpts = { ...WAVE, pivot: [px + 0.02, top + FLAG.poleH, pz] };
    const strip = FLAG.w / FLAG.strips;
    for (let k = 0; k < FLAG.strips; k++) {
      parts.push(kit.box([strip, FLAG.h, 0.02], [px + 0.02 + strip * (k + 0.5), fy, pz], 'red', { motion: wave }));
    }
    return kit.finish(parts);
  },
};
