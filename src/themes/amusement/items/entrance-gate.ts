import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { glassWindow, rod, wallPanel } from '../../../models/parts';

// A big blue arch across the entrance (the walkway runs along x, the arch spans z) between two yellow
// towers with red cone roofs and flags. Chase lights run round the arch on both faces.
const BASE = 0.04; // paved plaza
const TOWER = { z: 1.1, w: 0.7, d: 0.65, y0: 0.14, top: 1.94 };
const ARCH = { r: 0.95, tube: 0.14, depth: 2.15, y: 1.3 }; // depth = stretch of the tube along x
const ARCH_FRONT = ARCH.tube * ARCH.depth; // 0.3: how far the arch reaches in x
const BULBS = 13;
const ROOF = { r: 0.38, h: 0.55, cornice: 0.07 };
const POLE_TOP = 3.0;
const FLAG = { x0: 0.02, len: 0.36, top: 2.95, h: 0.12, strips: 4 };

/** ประตูทางเข้าสวนสนุก: a big arch gate with two flag towers and lights round the arch. */
export const item: ItemModel = {
  id: 'entrance-gate',
  name: 'ประตูทางเข้าสวนสนุก',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.94, BASE, 2.94], [0, BASE / 2, 0], 'stone'),
      kit.box([1.7, 0.02, 1.5], [0, BASE + 0.01, 0], 'red'),
      kit.torus(ARCH.r, ARCH.tube, [0, ARCH.y, 0], 'blue', { arc: Math.PI, scale: [1, 1, ARCH.depth], rotate: [0, Math.PI / 2, 0], tubularSegments: 16 }),
      // sign on top of the arch
      kit.box([0.3, 0.34, 0.7], [0, 2.47, 0], 'sunYellow'),
    ];
    for (const s of [1, -1]) {
      const f = s > 0 ? 'x+' : 'x-';
      parts.push(
        ...wallPanel(kit, { at: [s * 0.15, 2.47, 0], facing: f, w: 0.5, h: 0.18, depth: 0.02, color: 'red' }),
        ...wallPanel(kit, { at: [s * 0.15, 2.47, 0], facing: f, w: 0.3, h: 0.06, depth: 0.03, color: 'white' }),
      );
      // chase lights round the arch face
      for (let index = 0; index < BULBS; index++) {
        const a = (Math.PI * (index + 0.5)) / BULBS;
        parts.push(kit.sphere(0.035, [s * (ARCH_FRONT + 0.03), ARCH.y + ARCH.r * Math.sin(a), ARCH.r * Math.cos(a)], 'lampWarm',
          { detail: 0, glow: true, light: 'chase', chase: { index, count: BULBS } }));
      }
    }
    for (const side of [-1, 1]) {
      const z = side * TOWER.z;
      const h = TOWER.top - TOWER.y0;
      const wave: MotionOpts = { kind: 'wave', pivot: [FLAG.x0, FLAG.top, z], axis: [1, 0, 0] };
      parts.push(
        kit.box([TOWER.w + 0.08, 0.1, TOWER.d + 0.07], [0, BASE + 0.05, z], 'stoneDark'),
        kit.box([TOWER.w, h, TOWER.d], [0, TOWER.y0 + h / 2, z], 'sunYellow'),
        kit.box([TOWER.w + 0.02, 0.08, TOWER.d + 0.02], [0, 0.7, z], 'red'),
        kit.box([TOWER.w + 0.02, 0.08, TOWER.d + 0.02], [0, 1.5, z], 'red'),
        kit.box([TOWER.w + 0.12, ROOF.cornice, TOWER.d + 0.11], [0, TOWER.top + ROOF.cornice / 2, z], 'white'),
        kit.cone(ROOF.r, ROOF.h, [0, TOWER.top + ROOF.cornice + ROOF.h / 2, z], 'red', { segments: 8 }),
        rod(kit, [0, TOWER.top + ROOF.cornice + ROOF.h - 0.03, z], [0, POLE_TOP, z], 0.02, 'stone', { segments: 6 }),
        kit.sphere(0.05, [0, POLE_TOP + 0.03, z], 'sunYellow', { detail: 0 }),
        ...glassWindow(kit, { at: [TOWER.w / 2, 1.1, z], facing: 'x+', w: 0.22, h: 0.36 }),
        ...glassWindow(kit, { at: [-TOWER.w / 2, 1.1, z], facing: 'x-', w: 0.22, h: 0.36 }),
      );
      // flag: two stripes, cut into strips so the ripple runs along the cloth
      const strip = FLAG.len / FLAG.strips;
      (['blue', 'white'] as const).forEach((color, row) => {
        for (let k = 0; k < FLAG.strips; k++) {
          parts.push(kit.box([strip, FLAG.h, 0.02], [FLAG.x0 + strip * (k + 0.5), FLAG.top - FLAG.h * (row + 0.5), z], color, { motion: wave }));
        }
      });
    }
    return kit.finish(parts);
  },
};
