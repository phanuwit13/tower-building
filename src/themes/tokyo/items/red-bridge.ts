import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { rod } from '../../../models/parts';

// 1x2. A red arched footbridge (along z) over a strip of canal (running along x).
const BANK_TOP = 0.12;
const WATER_TOP = 0.06;
const CANAL = 0.8; // canal width along z
const ARCH = { half: 0.46, rise: 0.3, width: 0.46, n: 6 };

/** สะพานแดงข้ามคลอง: a red footbridge over a canal. */
export const item: ItemModel = {
  id: 'red-bridge',
  name: 'สะพานแดงข้ามคลอง',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const bankZ = (CANAL / 2 + 1 - CANAL / 2) / 2 + CANAL / 2 - 0.5; // centre of each bank block
    const bankLen = 1 - CANAL / 2;
    const parts: Part[] = [
      kit.box([0.98, 0.03, 1.98], [0, 0.015, 0], 'stoneDark'),
      kit.box([0.98, WATER_TOP, CANAL], [0, WATER_TOP / 2, 0], 'navy', { motion: { kind: 'water', water: 'pond' } }),
    ];
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([0.98, BANK_TOP, bankLen - 0.01], [0, BANK_TOP / 2, s * (CANAL / 2 + bankLen / 2)], 'stone'),
        kit.box([0.98, 0.04, 0.05], [0, BANK_TOP + 0.02, s * (CANAL / 2 + 0.025)], 'stoneDark'), // coping
        kit.box([0.5, 0.03, 0.4], [0, BANK_TOP + 0.015, s * (CANAL / 2 + 0.3)], 'sand'), // path
      );
    }
    void bankZ;
    const y = (t: number): number => BANK_TOP + 0.02 + ARCH.rise * Math.sin(t);
    const z = (t: number): number => ARCH.half * Math.cos(t);
    for (let i = 0; i < ARCH.n; i++) {
      const t0 = Math.PI - (i / ARCH.n) * Math.PI;
      const t1 = Math.PI - ((i + 1) / ARCH.n) * Math.PI;
      const dz = z(t1) - z(t0);
      const dy = y(t1) - y(t0);
      parts.push(kit.box([ARCH.width, 0.05, Math.hypot(dz, dy) + 0.03], [0, (y(t0) + y(t1)) / 2 + 0.025, (z(t0) + z(t1)) / 2], 'red', { rotate: [-Math.atan2(dy, dz), 0, 0] }));
    }
    // under-arch beam
    parts.push(kit.box([0.3, 0.04, 0.6], [0, y(Math.PI / 2) - 0.02, 0], 'redDark'));
    // rails with gold post caps
    for (const sx of [-1, 1]) {
      const rx = sx * (ARCH.width / 2 - 0.02);
      const tops: Vec3[] = [];
      for (let i = 0; i <= ARCH.n; i += 2) {
        const t = Math.PI - (i / ARCH.n) * Math.PI;
        const top: Vec3 = [rx, y(t) + 0.3, z(t)];
        tops.push(top);
        parts.push(kit.cylinder(0.028, 0.028, 0.27, [rx, y(t) + 0.045 + 0.135, z(t)], 'red', { segments: 6 }), kit.sphere(0.04, [rx, top[1] + 0.02, z(t)], 'lampWarm', { detail: 0, glow: true }));
      }
      for (let k = 0; k < tops.length - 1; k++) parts.push(rod(kit, [tops[k][0], tops[k][1] - 0.04, tops[k][2]], [tops[k + 1][0], tops[k + 1][1] - 0.04, tops[k + 1][2]], 0.022, 'redDark', { segments: 4 }));
    }
    // steps down onto the banks
    for (const s of [-1, 1]) parts.push(kit.box([0.5, 0.06, 0.14], [0, BANK_TOP + 0.03, s * (CANAL / 2 + 0.07)], 'red'));
    // a little bank bush
    parts.push(kit.sphere(0.12, [0.36, BANK_TOP + 0.08, 0.78], 'leaf', { detail: 0, scale: [1, 0.8, 1] }), kit.sphere(0.1, [-0.36, BANK_TOP + 0.07, -0.78], 'leafDark', { detail: 0 }));
    return kit.finish(parts);
  },
};
