import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { glassWindow, wallPanel } from '../../../models/parts';

// A teal truck with a lit serving hatch on +x (chase bulbs round it, striped awning), a menu board of
// food pictures and a roof sign: a neon burger (orange, lime, red).
const R = 0.17;
const BODY = { w: 0.78, x: 0, y0: 0.22, h: 0.78, z0: -0.95, z1: 0.43 };
const TOP = BODY.y0 + BODY.h; // 1.0
const FACE = BODY.w / 2;
const HATCH = { z: -0.1, y: 0.7, y0: 0.5, y1: 0.92, z0: -0.42, z1: 0.22 };

/** ฟู้ดทรัค: a food truck with a lit hatch ringed by chase bulbs, a food-picture menu and a neon burger. */
export const item: ItemModel = {
  id: 'food-truck',
  name: 'ฟู้ดทรัค',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.7, 0.1, 1.9], [0, 0.2, 0], 'charcoal'),
      kit.box([BODY.w, BODY.h, BODY.z1 - BODY.z0], [0, BODY.y0 + BODY.h / 2, (BODY.z0 + BODY.z1) / 2], 'teal'),
      kit.box([BODY.w + 0.02, 0.1, BODY.z1 - BODY.z0 + 0.02], [0, 0.34, (BODY.z0 + BODY.z1) / 2], 'white'),
      kit.box([BODY.w + 0.02, 0.05, BODY.z1 - BODY.z0 + 0.02], [0, TOP + 0.025, (BODY.z0 + BODY.z1) / 2], 'white'),
      // cab
      kit.box([0.76, 0.5, 0.5], [0, 0.47, 0.68], 'teal'),
      kit.box([0.78, 0.05, 0.52], [0, 0.745, 0.68], 'white'),
      kit.box([0.76, 0.08, 0.06], [0, 0.27, 0.96], 'charcoal'),
      kit.sphere(0.045, [-0.25, 0.38, 0.945], 'lampWarm', { detail: 0, glow: true }),
      kit.sphere(0.045, [0.25, 0.38, 0.945], 'lampWarm', { detail: 0, glow: true }),
      ...glassWindow(kit, { at: [0, 0.55, 0.93], facing: 'z+', w: 0.5, h: 0.2 }),
      ...glassWindow(kit, { at: [FACE - 0.01, 0.55, 0.68], facing: 'x+', w: 0.3, h: 0.2, panes: 1 }),
      ...glassWindow(kit, { at: [-FACE + 0.01, 0.55, 0.68], facing: 'x-', w: 0.3, h: 0.2, panes: 1 }),
      ...glassWindow(kit, { at: [0, 0.62, BODY.z0], facing: 'z-', w: 0.4, h: 0.26 }),
      ...glassWindow(kit, { at: [-FACE, 0.7, -0.1], facing: 'x-', w: 0.5, h: 0.28, panes: 2 }),
    ];
    for (const x of [-0.37, 0.37]) {
      for (const z of [-0.55, 0.6]) {
        parts.push(kit.cylinder(R, R, 0.1, [x, R, z], 'charcoal', { segments: 12, rotate: [0, 0, Math.PI / 2] }));
        parts.push(kit.cylinder(0.06, 0.06, 0.12, [x * 1.04, R, z], 'stone', { segments: 6, rotate: [0, 0, Math.PI / 2] }));
      }
    }
    // serving hatch: dark opening, lit glass, shelf, awning
    parts.push(
      ...wallPanel(kit, { at: [FACE, HATCH.y, HATCH.z], facing: 'x+', w: 0.6, h: 0.34, depth: 0.02, color: 'charcoal' }),
      ...glassWindow(kit, { at: [FACE, HATCH.y, HATCH.z], facing: 'x+', w: 0.5, h: 0.28, panes: 1 }),
      kit.box([0.1, 0.04, 0.66], [0.44, 0.46, HATCH.z], 'wood'),
    );
    for (let i = 0; i < 5; i++) {
      parts.push(kit.box([0.18, 0.03, 0.14], [0.4, 1.0, -0.45 + 0.14 * i + 0.07], i % 2 === 0 ? 'red' : 'white', { rotate: [0, 0, -0.4] }));
    }
    // chase bulbs round the hatch
    const nz = 4;
    const ny = 3;
    const ring: [number, number][] = [];
    for (let i = 0; i <= nz; i++) ring.push([HATCH.y0, HATCH.z0 + ((HATCH.z1 - HATCH.z0) * i) / nz]);
    for (let j = 1; j < ny; j++) ring.push([HATCH.y0 + ((HATCH.y1 - HATCH.y0) * j) / ny, HATCH.z1]);
    for (let i = nz; i >= 0; i--) ring.push([HATCH.y1, HATCH.z0 + ((HATCH.z1 - HATCH.z0) * i) / nz]);
    for (let j = ny - 1; j >= 1; j--) ring.push([HATCH.y0 + ((HATCH.y1 - HATCH.y0) * j) / ny, HATCH.z0]);
    ring.forEach(([y, z], index) => {
      parts.push(kit.sphere(0.03, [FACE + 0.04, y, z], 'lampWarm', { detail: 0, glow: true, light: 'chase', chase: { index, count: ring.length } }));
    });
    // menu board: a burger, fries and a drink
    const MZ = -0.72;
    parts.push(
      ...wallPanel(kit, { at: [FACE, 0.66, MZ], facing: 'x+', w: 0.34, h: 0.44, depth: 0.02, color: 'charcoal' }),
      ...wallPanel(kit, { at: [FACE, 0.8, MZ], facing: 'x+', w: 0.2, h: 0.05, depth: 0.03, color: 'orange' }),
      ...wallPanel(kit, { at: [FACE, 0.75, MZ], facing: 'x+', w: 0.22, h: 0.03, depth: 0.03, color: 'lime' }),
      ...wallPanel(kit, { at: [FACE, 0.71, MZ], facing: 'x+', w: 0.2, h: 0.04, depth: 0.03, color: 'bark' }),
      ...wallPanel(kit, { at: [FACE, 0.67, MZ], facing: 'x+', w: 0.2, h: 0.04, depth: 0.03, color: 'orange' }),
      ...wallPanel(kit, { at: [FACE, 0.54, MZ - 0.07], facing: 'x+', w: 0.05, h: 0.14, depth: 0.03, color: 'sunYellow' }),
      ...wallPanel(kit, { at: [FACE, 0.54, MZ], facing: 'x+', w: 0.05, h: 0.16, depth: 0.03, color: 'sunYellow' }),
      ...wallPanel(kit, { at: [FACE, 0.54, MZ + 0.07], facing: 'x+', w: 0.05, h: 0.12, depth: 0.03, color: 'sunYellow' }),
    );
    // roof sign: neon burger on both faces
    const SZ = -0.3;
    parts.push(kit.box([0.05, 0.42, 0.7], [0, TOP + 0.05 + 0.21, SZ], 'charcoal'));
    for (const x of [0.045, -0.045]) {
      parts.push(
        kit.box([0.035, 0.08, 0.34], [x, TOP + 0.4, SZ], 'orange', { glow: 'orange' }),
        kit.box([0.035, 0.04, 0.4], [x, TOP + 0.33, SZ], 'lime', { glow: 'lime' }),
        kit.box([0.035, 0.06, 0.36], [x, TOP + 0.27, SZ], 'red', { glow: 'red' }),
        kit.box([0.035, 0.06, 0.34], [x, TOP + 0.2, SZ], 'orange', { glow: 'orange' }),
      );
    }
    return kit.finish(parts);
  },
};
