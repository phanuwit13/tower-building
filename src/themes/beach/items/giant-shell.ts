import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { aim } from '../../../models/parts';

const HINGE: [number, number, number] = [0.02, 0.13, 0];
const RIBS = 7;
const SPAN = 0.84; // half the fan's opening angle in radians (about 48 degrees)
const RIB = { len: 0.55, half: 0.105, thick: 0.4 }; // length from the hinge, half-width at the rim, x squash
const LEAN = 0.22; // the shell leans back a little (towards -x)

/** เปลือกหอยยักษ์: a giant pink scallop shell standing up in a sand mound, like a photo spot. */
export const item: ItemModel = {
  id: 'giant-shell',
  name: 'เปลือกหอยยักษ์',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.dome(0.47, [0, 0, 0], 'sand', { segments: 12, scale: [1, 0.3, 1] }),
      kit.cylinder(0.47, 0.47, 0.03, [0, 0.015, 0], 'sand', { segments: 12 }),
      // the hinge "ears" and a pearl in front
      kit.box([0.1, 0.07, 0.26], [HINGE[0] - 0.01, HINGE[1] - 0.02, 0], 'redDark'),
      kit.sphere(0.06, [HINGE[0] + 0.13, 0.09, 0.0], 'white', { detail: 1 }),
    ];
    for (let i = 0; i < RIBS; i++) {
      const phi = -SPAN + (2 * SPAN * i) / (RIBS - 1);
      const dir: [number, number, number] = [-Math.sin(LEAN) * Math.cos(phi), Math.cos(LEAN) * Math.cos(phi), Math.sin(phi)];
      const mid: [number, number, number] = [HINGE[0] + (dir[0] * RIB.len) / 2, HINGE[1] + (dir[1] * RIB.len) / 2, (dir[2] * RIB.len) / 2];
      // a four-sided cone, apex at the hinge, flat rim at the far end; squashed along x so it is a flat rib
      parts.push(kit.cylinder(RIB.half, 0.01, RIB.len, mid, i % 2 ? 'pink' : 'white', { segments: 4, scale: [RIB.thick, 1, 1], rotate: aim(dir) }));
    }
    return kit.finish(parts);
  },
};
