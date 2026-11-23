import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A folding screen of four pastel panels zig-zagging along z, with a simple picture on each face.
const PANEL = { w: 0.5, h: 0.95, t: 0.04, foot: 0.1 };
const ANGLE = 0.55; // yaw of each panel, alternating
const PITCH = 0.42; // step along z between panel centres
const COLS = ['mint', 'pink', 'glassBlue', 'lime'] as const;
const PICS = ['sunYellow', 'orange', 'purple', 'white'] as const;

/** ฉากกั้น: a folding screen with pastel panels. */
export const item: ItemModel = {
  id: 'screen-divider',
  name: 'ฉากกั้น',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    for (let i = 0; i < 4; i++) {
      const sgn = i % 2 ? 1 : -1;
      const yaw = sgn * ANGLE;
      const z = (i - 1.5) * PITCH;
      const x = sgn * 0.12;
      parts.push(
        kit.box([PANEL.t, PANEL.h, PANEL.w], [x, PANEL.foot + PANEL.h / 2, z], COLS[i], { rotate: [0, yaw, 0] }),
        kit.box([PANEL.t + 0.03, 0.05, PANEL.w + 0.02], [x, PANEL.foot + PANEL.h + 0.025, z], 'white', { rotate: [0, yaw, 0] }),
        kit.box([PANEL.t + 0.03, PANEL.foot, PANEL.w + 0.02], [x, PANEL.foot / 2, z], 'white', { rotate: [0, yaw, 0] }),
      );
      // a round "sun" and a little leaf block, on both faces (the face normals are +-x turned by the yaw)
      for (const side of [1, -1]) {
        const off = (PANEL.t / 2 + 0.01) * side;
        const px = x + off * Math.cos(yaw);
        const pz = z - off * Math.sin(yaw);
        parts.push(
          kit.cylinder(0.1, 0.1, 0.012, [px, 0.62, pz], PICS[i], { segments: 8, rotate: [0, yaw, Math.PI / 2] }),
          kit.box([0.012, 0.1, 0.3], [px, 0.36, pz], PICS[(i + 1) % 4], { rotate: [0, yaw, 0] }),
        );
      }
    }
    return kit.finish(parts);
  },
};
