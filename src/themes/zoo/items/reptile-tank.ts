import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A glass tank on a wooden stand (1×2, long side along z). A friendly cartoon snake coils round a branch.
const STAND = { w: 0.74, d: 1.56, h: 0.3 };
const TANK = { w: 0.7, d: 1.5, h: 0.56, t: 0.025 };
const FLOOR = STAND.h + 0.05; // top of the sand bed
const BRANCH_Y = STAND.h + 0.3;
const COIL = { r: 0.095, tube: 0.045 };

/** ตู้กระจกงู: a glass tank on a stand with a branch and a coiled snake. */
export const item: ItemModel = {
  id: 'reptile-tank',
  name: 'ตู้กระจกงู',
  category: 'animal',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const topY = STAND.h + TANK.h;
    const glass = { glow: 'windowWarm' as const, light: 'window' as const };
    const parts: Part[] = [
      // stand with two front doors
      kit.box([STAND.w, STAND.h, STAND.d], [0, STAND.h / 2, 0], 'wood'),
      kit.box([0.02, 0.2, 0.6], [STAND.w / 2 + 0.01, 0.15, 0.35], 'woodDark'),
      kit.box([0.02, 0.2, 0.6], [STAND.w / 2 + 0.01, 0.15, -0.35], 'woodDark'),
      kit.sphere(0.025, [STAND.w / 2 + 0.03, 0.15, 0.06], 'brass', { detail: 0 }),
      kit.sphere(0.025, [STAND.w / 2 + 0.03, 0.15, -0.06], 'brass', { detail: 0 }),
      // tank base, sand bed
      kit.box([TANK.w + 0.04, 0.03, TANK.d + 0.04], [0, STAND.h + 0.015, 0], 'charcoal'),
      kit.box([TANK.w - 0.02, 0.05, TANK.d - 0.02], [0, STAND.h + 0.055, 0], 'sand'),
      // glass: back and both ends, plus a low pane along the front, so the snake stays visible
      kit.box([TANK.t, TANK.h, TANK.d], [-TANK.w / 2 + TANK.t / 2, STAND.h + TANK.h / 2, 0], 'skyBlue', glass),
      kit.box([TANK.w, TANK.h, TANK.t], [0, STAND.h + TANK.h / 2, TANK.d / 2 - TANK.t / 2], 'skyBlue', glass),
      kit.box([TANK.w, TANK.h, TANK.t], [0, STAND.h + TANK.h / 2, -TANK.d / 2 + TANK.t / 2], 'skyBlue', glass),
      kit.box([TANK.t, 0.12, TANK.d], [TANK.w / 2 - TANK.t / 2, STAND.h + 0.09, 0], 'skyBlue', glass),
      // frame: four posts and a top rail
      kit.box([0.05, TANK.h + 0.03, 0.05], [TANK.w / 2, STAND.h + TANK.h / 2 + 0.015, TANK.d / 2], 'charcoal'),
      kit.box([0.05, TANK.h + 0.03, 0.05], [TANK.w / 2, STAND.h + TANK.h / 2 + 0.015, -TANK.d / 2], 'charcoal'),
      kit.box([0.05, TANK.h + 0.03, 0.05], [-TANK.w / 2, STAND.h + TANK.h / 2 + 0.015, TANK.d / 2], 'charcoal'),
      kit.box([0.05, TANK.h + 0.03, 0.05], [-TANK.w / 2, STAND.h + TANK.h / 2 + 0.015, -TANK.d / 2], 'charcoal'),
      kit.box([0.05, 0.04, TANK.d + 0.05], [TANK.w / 2, topY + 0.02, 0], 'charcoal'),
      kit.box([0.05, 0.04, TANK.d + 0.05], [-TANK.w / 2, topY + 0.02, 0], 'charcoal'),
      kit.box([TANK.w, 0.04, 0.05], [0, topY + 0.02, TANK.d / 2], 'charcoal'),
      kit.box([TANK.w, 0.04, 0.05], [0, topY + 0.02, -TANK.d / 2], 'charcoal'),
      // branch across the tank, a twig and leaves
      kit.cylinder(0.05, 0.05, TANK.d - 0.05, [0, BRANCH_Y, 0], 'woodDark', { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.025, 0.03, 0.3, [-0.1, BRANCH_Y + 0.14, -0.5], 'woodDark', { segments: 6, rotate: [0, 0, 0.5] }),
      kit.sphere(0.07, [-0.17, BRANCH_Y + 0.3, -0.5], 'leaf', { detail: 0, scale: [1, 0.6, 1.2] }),
      kit.sphere(0.06, [-0.27, FLOOR + 0.04, 0.5], 'leafDark', { detail: 0, scale: [1.2, 0.8, 1] }),
      kit.sphere(0.05, [0.22, FLOOR + 0.03, -0.55], 'stone', { detail: 0, scale: [1.2, 0.7, 1] }),
    ];
    // the coil: three rings round the branch, spotted
    for (const z of [-0.2, -0.06, 0.08]) {
      parts.push(kit.torus(COIL.r, COIL.tube, [0, BRANCH_Y, z], 'leaf', { radialSegments: 5, tubularSegments: 12 }));
      parts.push(kit.sphere(0.022, [0.0, BRANCH_Y + COIL.r + COIL.tube - 0.012, z], 'sunYellow', { detail: 0 }));
      parts.push(kit.sphere(0.022, [COIL.r + COIL.tube - 0.012, BRANCH_Y + 0.01, z], 'sunYellow', { detail: 0 }));
    }
    parts.push(
      // tail tip and the raised neck and head, facing +x
      kit.cone(0.04, 0.16, [0, BRANCH_Y + 0.02, -0.33], 'leaf', { segments: 6, rotate: [-Math.PI / 2 + 0.2, 0, 0] }),
      kit.sphere(0.05, [0.0, BRANCH_Y + 0.12, 0.17], 'leaf', { detail: 0 }),
      kit.sphere(0.05, [0.02, BRANCH_Y + 0.2, 0.2], 'leaf', { detail: 0 }),
      kit.sphere(0.05, [0.04, BRANCH_Y + 0.26, 0.19], 'leaf', { detail: 0 }),
      kit.sphere(0.085, [0.09, BRANCH_Y + 0.32, 0.17], 'leaf', { scale: [1.2, 0.95, 1.05] }),
      kit.sphere(0.06, [0.15, BRANCH_Y + 0.3, 0.17], 'lime', { detail: 0, scale: [0.9, 0.8, 1.1] }),
      // big eyes, a smile and rosy cheeks
      kit.sphere(0.036, [0.15, BRANCH_Y + 0.37, 0.215], 'white', { detail: 0 }),
      kit.sphere(0.036, [0.15, BRANCH_Y + 0.37, 0.125], 'white', { detail: 0 }),
      kit.sphere(0.02, [0.18, BRANCH_Y + 0.37, 0.215], 'charcoal', { detail: 0 }),
      kit.sphere(0.02, [0.18, BRANCH_Y + 0.37, 0.125], 'charcoal', { detail: 0 }),
      kit.box([0.012, 0.012, 0.075], [0.188, BRANCH_Y + 0.285, 0.17], 'charcoal'),
      kit.sphere(0.022, [0.14, BRANCH_Y + 0.3, 0.245], 'pink', { detail: 0, scale: [0.6, 1, 1] }),
      kit.sphere(0.022, [0.14, BRANCH_Y + 0.3, 0.095], 'pink', { detail: 0, scale: [0.6, 1, 1] }),
    );
    return kit.finish(parts);
  },
};
