import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { door } from '../../../models/parts';

// Long side along z. A glowing glass dome on a low stone wall, white ribs, a porch on the +z end,
// flower beds round the base and big butterflies resting on the glass.
const BASE = { w: 1.7, d: 2.7, h: 0.04 };
const WALL = { w: 1.34, d: 2.34, h: 0.18 };
const DOME = { rx: 0.65, ry: 0.75, rz: 1.15, y: BASE.h + WALL.h };
const RIB_ZS = [-0.8, -0.4, 0, 0.4, 0.8];
const PORCH = { w: 0.5, d: 0.3, h: 0.42, z: 1.25 };

/** A big butterfly lying on the glass at `at`; `tilt` is a turn about z (negative leans the +x side down). */
function butterfly(kit: StyleKit, at: Vec3, tilt: number, fore: PaletteColor, hind: PaletteColor): Part[] {
  const c = Math.cos(tilt);
  const s = Math.sin(tilt);
  const p = (x: number, z: number): Vec3 => [at[0] + x * c, at[1] + x * s, at[2] + z];
  const parts: Part[] = [kit.sphere(1, p(0, 0), 'charcoal', { detail: 0, scale: [0.075, 0.02, 0.02], rotate: [0, 0, tilt] })];
  for (const side of [-1, 1]) {
    parts.push(
      kit.sphere(1, p(0.03, side * 0.085), fore, { detail: 0, scale: [0.075, 0.012, 0.085], rotate: [0, 0, tilt] }),
      kit.sphere(1, p(-0.05, side * 0.065), hind, { detail: 0, scale: [0.06, 0.012, 0.065], rotate: [0, 0, tilt] }),
    );
  }
  return parts;
}

/** บ้านผีเสื้อ: a glass-dome greenhouse with big colourful butterflies. */
export const item: ItemModel = {
  id: 'butterfly-house',
  name: 'บ้านผีเสื้อ',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'lime'),
      kit.box([WALL.w, WALL.h, WALL.d], [0, BASE.h + WALL.h / 2, 0], 'stone'),
      kit.dome(1, [0, DOME.y, 0], 'skyBlue', { segments: 16, scale: [DOME.rx, DOME.ry, DOME.rz] }),
    ];
    for (const z of RIB_ZS) {
      const f = Math.sqrt(1 - (z / DOME.rz) ** 2) * 1.015;
      parts.push(kit.torus(1, 0.03, [0, DOME.y, z], 'white', { radialSegments: 4, tubularSegments: 16, arc: Math.PI, scale: [DOME.rx * f, DOME.ry * f, 1] }));
    }
    // lit glass panes: a few small glowing panes on the dome (a whole glowing dome would bloom too much at night)
    for (const [px, pz] of [[0.35, -0.6], [0.4, 0.15], [0.3, 0.8], [-0.35, -0.3], [-0.3, 0.5], [0, -0.95], [0, 0.2]] as const) {
      const py = DOME.y + DOME.ry * Math.sqrt(Math.max(0, 1 - (px / DOME.rx) ** 2 - (pz / DOME.rz) ** 2)) - 0.03;
      parts.push(kit.sphere(1, [px, py, pz], 'skyBlue', { detail: 0, scale: [0.09, 0.05, 0.09], glow: 'windowWarm', light: 'window' }));
    }
    // porch on the +z end
    const pz = PORCH.z;
    parts.push(
      kit.box([PORCH.w, PORCH.h, PORCH.d], [0, BASE.h + PORCH.h / 2, pz], 'white'),
      kit.wedge([PORCH.w + 0.08, 0.14, PORCH.d + 0.06], [0, BASE.h + PORCH.h + 0.07, pz], 'terracotta'),
      ...door(kit, { at: [0, BASE.h + 0.18, pz + PORCH.d / 2], facing: 'z+', w: 0.26, h: 0.36, color: 'woodDark', knob: 'sunYellow' }),
    );
    // flower beds and bushes round the base (outside the stone wall)
    const BEDS: Array<[number, number, PaletteColor]> = [[0.8, -0.7, 'pink'], [0.82, 0, 'sunYellow'], [0.8, 0.7, 'purple'], [-0.8, -0.5, 'orange'], [-0.8, 0.45, 'pink'], [0.75, 1.08, 'sunYellow'], [-0.7, -1.2, 'purple']];
    for (const [x, z, flower] of BEDS) {
      parts.push(
        kit.sphere(0.13, [x, BASE.h + 0.09, z], 'leaf', { detail: 0 }),
        kit.sphere(0.04, [x + 0.05, BASE.h + 0.2, z + 0.04], flower, { detail: 0 }),
        kit.sphere(0.04, [x - 0.05, BASE.h + 0.17, z - 0.05], flower, { detail: 0 }),
      );
    }
    // butterflies on the glass (dome surface points; slightly lifted)
    parts.push(
      ...butterfly(kit, [0, DOME.y + DOME.ry + 0.03, 0.1], 0, 'pink', 'purple'),
      ...butterfly(kit, [0.42, DOME.y + 0.52, -0.25], -0.62, 'orange', 'sunYellow'),
      ...butterfly(kit, [0.5, DOME.y + 0.42, 0.55], -0.8, 'sunYellow', 'orange'),
      ...butterfly(kit, [-0.25, DOME.y + 0.66, -0.7], 0.3, 'purple', 'pink'),
    );
    return kit.finish(parts);
  },
};
