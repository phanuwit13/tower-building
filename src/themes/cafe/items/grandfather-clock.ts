import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

// A tall wooden clock: base, hollow trunk with a window, a round face on the head and a swinging pendulum.
const BASE_H = 0.25;
const TRUNK = { x: 0.34, z: 0.34, top: 1.1, wall: 0.04 };
const HEAD = { w: 0.48, h: 0.5, top: 1.6 };
const FACE_Y = 1.35;
const FACE_X = HEAD.w / 2;
const FACE_Z = 0.23; // head half-depth
const PIVOT_Y = 1.0;
const ROD = 0.42;
// bob radius 0.05, swing 0.12 rad: 0.46 * sin(0.12) + 0.05 = 0.105 < the 0.13 inner half-width (0.025 spare)
const SWING: MotionOpts = { kind: 'swing', pivot: [0, PIVOT_Y, 0], axis: [1, 0, 0], amount: 0.12, speed: 1.6 };

/** นาฬิกาตั้งพื้น: a tall wooden grandfather clock; the pendulum swings. */
export const item: ItemModel = {
  id: 'grandfather-clock',
  name: 'นาฬิกาตั้งพื้น',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const trunkH = TRUNK.top - BASE_H;
    const midY = BASE_H + trunkH / 2;
    const half = TRUNK.x / 2;
    const parts: Part[] = [
      kit.box([0.5, BASE_H, 0.5], [0, BASE_H / 2, 0], 'woodDark'),
      kit.box([0.54, 0.04, 0.54], [0, BASE_H + 0.02, 0], 'wood'),
      // hollow trunk: back, two sides, front frame around the window
      kit.box([TRUNK.wall, trunkH, TRUNK.z], [-half + TRUNK.wall / 2, midY, 0], 'bark'),
      kit.box([TRUNK.x, trunkH, TRUNK.wall], [0, midY, -TRUNK.z / 2 + TRUNK.wall / 2], 'wood'),
      kit.box([TRUNK.x, trunkH, TRUNK.wall], [0, midY, TRUNK.z / 2 - TRUNK.wall / 2], 'wood'),
      kit.box([TRUNK.wall, trunkH, 0.07], [half - TRUNK.wall / 2, midY, -0.135], 'woodDark'),
      kit.box([TRUNK.wall, trunkH, 0.07], [half - TRUNK.wall / 2, midY, 0.135], 'woodDark'),
      kit.box([TRUNK.wall, 0.12, 0.2], [half - TRUNK.wall / 2, BASE_H + 0.06 + 0.1, 0], 'woodDark'),
      kit.box([TRUNK.wall, 0.1, 0.2], [half - TRUNK.wall / 2, TRUNK.top - 0.05, 0], 'woodDark'),
      kit.box([TRUNK.x - 0.08, 0.02, TRUNK.z - 0.08], [0.0, BASE_H + 0.05, 0], 'bark'),
      kit.box([0.02, trunkH - 0.2, TRUNK.z - 0.1], [-half + TRUNK.wall + 0.01, midY, 0], 'sand'), // pale backing so the brass pendulum shows
      // head, cornice and crown
      kit.box([HEAD.w, HEAD.h, 0.46], [0, TRUNK.top + HEAD.h / 2, 0], 'wood'),
      kit.box([0.54, 0.05, 0.52], [0, TRUNK.top + 0.025, 0], 'woodDark'),
      kit.box([0.52, 0.05, 0.5], [0, HEAD.top + 0.025, 0], 'woodDark'),
      kit.wedge([0.48, 0.18, 0.46], [0, HEAD.top + 0.14, 0], 'wood', { rotate: [0, Math.PI / 2, 0] }),
      kit.sphere(0.05, [0, HEAD.top + 0.28, 0], 'brass', { detail: 0 }),
      // faces on +x and +z: brass rim, cream dial, navy hands
      kit.cylinder(0.23, 0.23, 0.03, [FACE_X + 0.005, FACE_Y, 0], 'brass', { segments: 16, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.2, 0.2, 0.03, [FACE_X + 0.02, FACE_Y, 0], 'cream', { segments: 16, rotate: [0, 0, Math.PI / 2] }),
      kit.box([0.02, 0.16, 0.04], [FACE_X + 0.04, FACE_Y + 0.08, 0], 'navy'),
      kit.box([0.02, 0.04, 0.12], [FACE_X + 0.04, FACE_Y, 0.06], 'navy'),
      kit.sphere(0.035, [FACE_X + 0.045, FACE_Y, 0], 'brass', { detail: 0 }),
      kit.cylinder(0.23, 0.23, 0.03, [0, FACE_Y, FACE_Z + 0.005], 'brass', { segments: 16, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.2, 0.2, 0.03, [0, FACE_Y, FACE_Z + 0.02], 'cream', { segments: 16, rotate: [Math.PI / 2, 0, 0] }),
      kit.box([0.04, 0.16, 0.02], [0, FACE_Y + 0.08, FACE_Z + 0.04], 'navy'),
      kit.box([0.12, 0.04, 0.02], [0.06, FACE_Y, FACE_Z + 0.04], 'navy'),
      kit.sphere(0.035, [0, FACE_Y, FACE_Z + 0.045], 'brass', { detail: 0 }),
    ];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const big = i % 3 === 0;
      const rad = big ? 0.032 : 0.022;
      const c = big ? 'redDark' : 'navy';
      parts.push(kit.sphere(rad, [FACE_X + 0.04, FACE_Y + 0.16 * Math.cos(a), 0.16 * Math.sin(a)], c, { detail: 0 }));
      parts.push(kit.sphere(rad, [0.16 * Math.sin(a), FACE_Y + 0.16 * Math.cos(a), FACE_Z + 0.04], c, { detail: 0 }));
    }
    // pendulum: rod and bob share one pivot at the top of the case
    parts.push(
      kit.box([0.02, ROD, 0.02], [0, PIVOT_Y - ROD / 2, 0], 'brass', { motion: SWING }),
      kit.cylinder(0.05, 0.05, 0.03, [0, PIVOT_Y - ROD - 0.01, 0], 'sunYellow', { segments: 10, rotate: [0, 0, Math.PI / 2], motion: SWING }),
    );
    return kit.finish(parts);
  },
};
