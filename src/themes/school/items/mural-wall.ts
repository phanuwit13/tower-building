import type { ItemModel } from '../../../models/contract';
import type { Part, PartOpts } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { wallPanel } from '../../../models/parts';

const WALL = { t: 0.16, len: 1.8, top: 0.86 }; // cream wall: thickness (x), length (z), top
const PLINTH = { h: 0.06, lip: 0.03 }; // stone foot
const COPING = { h: 0.06, lip: 0.04 }; // stone cap
const FACE = WALL.t / 2; // the painted (+x) face
const MURAL = { y0: 0.12, y1: 0.8, half: 0.82 }; // the painted area: bottom, top, half-length (z); cream shows around it
const LAWN_TOP = 0.32; // top of the painted lawn strip
/**
 * How far each paint layer stands out from the wall (its front face). Every layer starts on the
 * wall, and layers that overlap are at least 0.01 apart, so nothing flickers.
 */
const OUT = { sky: 0.01, rays: 0.02, rainbow: 0.02, sun: 0.03, hills: 0.03, cloud: 0.03, lawn: 0.04, kids: 0.05, hair: 0.05, face: 0.06 };
const SUN = { z: -0.56, y: 0.62, r: 0.1, ray: 0.17 }; // `ray`: side of the two squares that make the star behind the disc
const RAINBOW = { z: 0.12, r: 0.44, band: 0.055, colors: ['red', 'orange', 'sunYellow', 'leaf', 'blue'] as PaletteColor[] };
/** Hills, ovals half hidden by the lawn: z, half-width, height above their centre, colour. */
const HILLS: Array<[number, number, number, PaletteColor]> = [[-0.42, 0.38, 0.18, 'leaf'], [0.46, 0.34, 0.15, 'leafDark']];
const HILL_Y = LAWN_TOP - 0.02;
const CLOUD: Array<[number, number, number]> = [[0.5, 0.68, 0.06], [0.58, 0.7, 0.075], [0.67, 0.67, 0.055]]; // z, y, r
/** Two children waving in front of the rainbow: z, clothes colour, wears a dress (a triangle) instead of a shirt. */
const CHILDREN: Array<[number, PaletteColor, boolean]> = [[0.0, 'purple', true], [0.25, 'red', false]];
const FEET_Y = 0.19;
const BACK = { y: 0.48, h: 0.3, diamond: 0.16 }; // the simpler back: a mint band with diamonds on it
const BACK_DIAMONDS: Array<[number, PaletteColor]> = [[-0.6, 'pink'], [-0.2, 'sunYellow'], [0.2, 'blue'], [0.6, 'orange']];

/** กำแพงภาพวาด: a low school wall painted with a sunny scene (sun, hills, rainbow, waving children), stone coping. */
export const item: ItemModel = {
  id: 'mural-wall',
  name: 'กำแพงภาพวาด',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const wallH = WALL.top - PLINTH.h;
    const muralH = MURAL.y1 - MURAL.y0;
    const parts: Part[] = [
      kit.box([WALL.t + 2 * PLINTH.lip, PLINTH.h, WALL.len + 2 * PLINTH.lip], [0, PLINTH.h / 2, 0], 'stone'),
      kit.box([WALL.t, wallH, WALL.len], [0, PLINTH.h + wallH / 2, 0], 'cream'),
      kit.box([WALL.t + 2 * COPING.lip, COPING.h, WALL.len + 2 * COPING.lip], [0, WALL.top + COPING.h / 2, 0], 'stone'),
      ...wallPanel(kit, { at: [FACE, MURAL.y0 + muralH / 2, 0], facing: 'x+', w: 2 * MURAL.half, h: muralH, depth: OUT.sky, color: 'skyBlue' }),
      ...wallPanel(kit, { at: [FACE, (MURAL.y0 + LAWN_TOP) / 2, 0], facing: 'x+', w: 2 * MURAL.half, h: LAWN_TOP - MURAL.y0, depth: OUT.lawn, color: 'lime' }),
    ];

    /** A flat box of paint on the front face: `size` = [height, length along z], from the wall out to `out`. */
    const flat = (size: [number, number], y: number, z: number, out: number, color: PaletteColor, opts?: PartOpts): Part =>
      kit.box([out, size[0], size[1]], [FACE + out / 2, y, z], color, opts);
    /** A flat round of paint on the front face, from the wall out to `out`; `sy` squashes it into an oval. */
    const disc = (r: number, y: number, z: number, out: number, color: PaletteColor, segments = 12, sy = 1): Part =>
      kit.cylinder(r, r, out, [FACE + out / 2, y, z], color, { segments, scale: [sy, 1, 1], rotate: [0, 0, Math.PI / 2] });

    // sun: an orange eight-point star (two squares) behind a yellow disc
    parts.push(
      flat([SUN.ray, SUN.ray], SUN.y, SUN.z, OUT.rays, 'orange'),
      flat([SUN.ray, SUN.ray], SUN.y, SUN.z, OUT.rays, 'orange', { rotate: [Math.PI / 4, 0, 0] }),
      disc(SUN.r, SUN.y, SUN.z, OUT.sun, 'sunYellow', 10),
    );
    // rainbow: flattened half-rings standing on the lawn line (their ends hide behind the lawn)
    const bandT = OUT.rainbow - OUT.sky; // each band fills the layer between the sky and the hills
    RAINBOW.colors.forEach((color, i) => {
      parts.push(kit.torus(RAINBOW.r - i * RAINBOW.band, RAINBOW.band / 2, [FACE + OUT.sky + bandT / 2, LAWN_TOP - 0.03, RAINBOW.z], color, {
        arc: Math.PI, radialSegments: 4, tubularSegments: 8, scale: [1, 1, bandT / RAINBOW.band], rotate: [0, Math.PI / 2, 0],
      }));
    });
    for (const [z, hw, hh, color] of HILLS) parts.push(disc(hw, HILL_Y, z, OUT.hills, color, 10, hh / hw));
    for (const [z, y, r] of CLOUD) {
      parts.push(kit.sphere(r, [FACE + OUT.cloud / 2, y, z], 'white', { detail: 0, scale: [OUT.cloud / (2 * r), 0.8, 1.2] }));
    }

    // children: legs, a shirt or a dress, arms waving up, a round face with dark hair behind it
    for (const [z, clothes, dress] of CHILDREN) {
      for (const s of [-1, 1]) {
        parts.push(
          flat([0.07, 0.026], FEET_Y + 0.035, z + s * 0.025, OUT.kids, 'navy'),
          flat([0.1, 0.024], FEET_Y + 0.175, z + s * 0.065, OUT.kids, clothes, { rotate: [s * 0.55, 0, 0] }),
        );
      }
      parts.push(dress
        ? kit.wedge([0.13, 0.14, OUT.kids], [FACE + OUT.kids / 2, FEET_Y + 0.14, z], clothes, { rotate: [0, Math.PI / 2, 0] })
        : flat([0.1, 0.085], FEET_Y + 0.12, z, OUT.kids, clothes));
      parts.push(
        disc(0.058, FEET_Y + 0.27, z, OUT.hair, 'bark', 8),
        disc(0.048, FEET_Y + 0.255, z, OUT.face, 'sand', 8),
      );
    }

    // back (-x): a plain mint band with a row of painted diamonds
    parts.push(...wallPanel(kit, { at: [-FACE, BACK.y, 0], facing: 'x-', w: 2 * MURAL.half, h: BACK.h, depth: OUT.sky, color: 'mint' }));
    for (const [z, color] of BACK_DIAMONDS) {
      parts.push(kit.box([OUT.rays, BACK.diamond, BACK.diamond], [-FACE - OUT.rays / 2, BACK.y, z], color, { rotate: [Math.PI / 4, 0, 0] }));
    }
    return kit.finish(parts);
  },
};
