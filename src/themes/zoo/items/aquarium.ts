import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { door, glassWindow, wallPanel } from '../../../models/parts';

// Long side along z. A blue hall at the back (-x) with a curved glass front (+x) made of six glass
// facets round an ellipse, fish painted on the glass, and a roof of four domes that rises and falls like a wave.
const BASE = { w: 1.9, d: 2.9, h: 0.04 };
const HALL = { x0: -0.9, x1: 0.25, z: 1.3, h: 0.58 }; // wall box from x0 to x1, z +-z, height above the base
const FRONT = { cx: 0.25, a: 0.62, b: 1.3, facets: 6 }; // ellipse centre x, x and z radii
const GLASS = { t: 0.05, h: 0.46, bottom: BASE.h + 0.02 };
const ROOF_Y = BASE.h + HALL.h;
const ROOF = { r: 0.325, sx: 2.7, cx: -0.015, zs: [-0.975, -0.325, 0.325, 0.975], ys: [1.2, 0.75, 1.2, 0.75] };
const FISH_COLORS = ['orange', 'pink', 'sunYellow', 'orange', 'pink', 'sunYellow'] as const;

/** อควาเรียม: blue hall, curved glass front with fish, wave roof. */
export const item: ItemModel = {
  id: 'aquarium',
  name: 'อควาเรียม',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const hallW = HALL.x1 - HALL.x0;
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'stone'),
      kit.box([hallW, HALL.h, HALL.z * 2], [(HALL.x0 + HALL.x1) / 2, BASE.h + HALL.h / 2, 0], 'blue'),
      kit.box([hallW + 0.04, 0.04, HALL.z * 2 + 0.04], [(HALL.x0 + HALL.x1) / 2, ROOF_Y - 0.02, 0], 'white'), // cornice
    ];
    // curved glass front
    const pt = (th: number): [number, number] => [FRONT.cx + FRONT.a * Math.cos(th), FRONT.b * Math.sin(th)];
    for (let i = 0; i < FRONT.facets; i++) {
      const [x0, z0] = pt(-Math.PI / 2 + (i / FRONT.facets) * Math.PI);
      const [x1, z1] = pt(-Math.PI / 2 + ((i + 1) / FRONT.facets) * Math.PI);
      const len = Math.hypot(x1 - x0, z1 - z0);
      const nx = (z1 - z0) / len; // outward normal
      const nz = -(x1 - x0) / len;
      const yaw = Math.atan2(-nz, nx);
      const mx = (x0 + x1) / 2;
      const mz = (z0 + z1) / 2;
      parts.push(
        kit.box([GLASS.t, GLASS.h, len * 0.96], [mx, GLASS.bottom + GLASS.h / 2, mz], 'skyBlue', { rotate: [0, yaw, 0], glow: 'windowWarm', light: 'window' }),
        kit.box([GLASS.t + 0.03, 0.06, len + 0.02], [mx, BASE.h + 0.03, mz], 'white', { rotate: [0, yaw, 0] }), // plinth
        kit.box([GLASS.t + 0.03, 0.06, len + 0.02], [mx, GLASS.bottom + GLASS.h + 0.03, mz], 'white', { rotate: [0, yaw, 0] }), // lintel
        kit.cylinder(0.03, 0.03, GLASS.h + 0.1, [x0, BASE.h + (GLASS.h + 0.1) / 2 + 0.01, z0], 'white', { segments: 6 }), // mullion
      );
      // a fish painted on the glass: body + tail, pointing along the facet
      const out = GLASS.t / 2 + 0.02;
      const tx = -nz;
      const tz = nx;
      const dir = i % 2 === 0 ? 1 : -1;
      const fy = GLASS.bottom + GLASS.h * (0.4 + (i % 3) * 0.12);
      const fp = (s: number): Vec3 => [mx + nx * out + tx * s, fy, mz + nz * out + tz * s];
      const c = FISH_COLORS[i];
      const e = fp(dir * 0.05);
      const eye: Vec3 = [e[0] + nx * 0.012, fy + 0.015, e[2] + nz * 0.012];
      parts.push(
        kit.sphere(1, fp(0), c, { detail: 0, scale: [0.016, 0.05, 0.085], rotate: [0, yaw, 0] }),
        kit.sphere(1, fp(-dir * 0.095), c, { detail: 0, scale: [0.016, 0.045, 0.035], rotate: [0, yaw, 0] }),
        kit.box([0.02, 0.02, 0.02], eye, 'charcoal', { rotate: [0, yaw, 0] }),
      );
    }
    // wave roof
    ROOF.zs.forEach((z, i) => {
      parts.push(kit.dome(ROOF.r, [ROOF.cx, ROOF_Y, z], i % 2 === 0 ? 'glassBlue' : 'white', { segments: 8, scale: [ROOF.sx, ROOF.ys[i], 1] }));
    });
    // entrance on the +z end and a window on the back
    parts.push(
      ...door(kit, { at: [-0.4, BASE.h + 0.22, HALL.z], facing: 'z+', w: 0.34, h: 0.44, color: 'sunYellow', knob: 'woodDark' }),
      ...wallPanel(kit, { at: [-0.4, BASE.h + 0.5, HALL.z], facing: 'z+', w: 0.5, h: 0.1, depth: 0.02, color: 'white' }),
      ...glassWindow(kit, { at: [HALL.x0, 0.3, 0], facing: 'x-', w: 1.2, h: 0.3, panes: 4 }),
      ...glassWindow(kit, { at: [-0.4, 0.3, -HALL.z], facing: 'z-', w: 0.6, h: 0.3 }),
    );
    return kit.finish(parts);
  },
};
