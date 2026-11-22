/**
 * Shared building parts: windows, doors, wall signs and gable roofs, built only from kit
 * primitives. Each returns `Part[]` to spread into an item's parts list before `kit.finish`.
 * They hold the facing and roof maths so items never repeat it. Controller-owned: sculptors use
 * these and never edit them (ask the controller for a new helper or option).
 */
import type { Part, PartOpts, StyleKit, Vec3 } from './kit';
import type { PaletteColor } from './palette';

/** The way a wall faces (its outward direction). An item's front faces +x. */
export type Facing = 'x+' | 'x-' | 'z+' | 'z-';

/** Where a wall part goes: `at` is its centre on the wall's outer surface. */
export interface OnWall { at: Vec3; facing: Facing }

/**
 * Depths out from the wall. Each layer's front face is 0.01 in front of the one behind, so no two
 * faces z-fight; backs sit flush on the wall, where they are hidden.
 */
const FRAME_DEPTH = 0.02;
const GLASS_DEPTH = 0.03;
const BAR_DEPTH = 0.04;
const DOOR_DEPTH = 0.03;
const FRAME_BORDER = 0.04; // frame margin around the glass, each side
const BAR_WIDTH = 0.035; // the bars between panes
const KNOB = { r: 0.025, inset: 0.06, height: 0.45 }; // inset from the door's edge; height as a share of the door

/** Size, along x, y, z, of a box `depth` out from a wall, `w` along the wall and `h` tall. */
function wallSize(facing: Facing, w: number, h: number, depth: number): Vec3 {
  return facing[0] === 'x' ? [depth, h, w] : [w, h, depth];
}

/** The point `out` in front of `at` and `side` along the wall (sideways). */
function wallPoint({ at, facing }: OnWall, out: number, side = 0): Vec3 {
  const s = facing[1] === '+' ? 1 : -1;
  return facing[0] === 'x' ? [at[0] + s * out, at[1], at[2] + side] : [at[0] + side, at[1], at[2] + s * out];
}

/**
 * A flat box on a wall (sign, notice board, poster, plaque, shutter): `w` along the wall, `h` tall,
 * `depth` out from the wall, its back flush on the wall at `at`. Stack layers 0.01 apart
 * (e.g. board depth 0.02, letters depth 0.03) so faces never z-fight.
 */
export function wallPanel(kit: StyleKit, o: OnWall & { w: number; h: number; depth: number; color: PaletteColor; glow?: PartOpts['glow'] }): Part[] {
  return [kit.box(wallSize(o.facing, o.w, o.h, o.depth), wallPoint(o, o.depth / 2), o.color, o.glow ? { glow: o.glow } : undefined)];
}

/**
 * A window: a frame (default `teal`) around `skyBlue` glass that glows `windowWarm` at night, with
 * thin bars splitting it into `panes` (default 2). `w` and `h` are the glass size; the frame adds
 * 0.04 each side. The approved classroom look; always use this for windows. 36 triangles (2 panes).
 */
export function glassWindow(kit: StyleKit, o: OnWall & { w: number; h: number; frame?: PaletteColor; panes?: number }): Part[] {
  const frame = o.frame ?? 'teal';
  const panes = o.panes ?? 2;
  const box = (w: number, h: number, depth: number, color: PaletteColor, side = 0, opts?: PartOpts) =>
    kit.box(wallSize(o.facing, w, h, depth), wallPoint(o, depth / 2, side), color, opts);
  const parts = [
    box(o.w + 2 * FRAME_BORDER, o.h + 2 * FRAME_BORDER, FRAME_DEPTH, frame),
    box(o.w, o.h, GLASS_DEPTH, 'skyBlue', 0, { glow: 'windowWarm' }),
  ];
  for (let i = 1; i < panes; i++) parts.push(box(BAR_WIDTH, o.h, BAR_DEPTH, frame, (i / panes - 0.5) * o.w));
  return parts;
}

/** A door: a slab 0.03 out from the wall, `at` its centre (bottom = at[1] - h / 2); optional round knob. 12 triangles. */
export function door(kit: StyleKit, o: OnWall & { w: number; h: number; color: PaletteColor; knob?: PaletteColor }): Part[] {
  const parts = [kit.box(wallSize(o.facing, o.w, o.h, DOOR_DEPTH), wallPoint(o, DOOR_DEPTH / 2), o.color)];
  if (o.knob) {
    const [x, , z] = wallPoint(o, DOOR_DEPTH + KNOB.r, o.w / 2 - KNOB.inset);
    parts.push(kit.sphere(KNOB.r, [x, o.at[1] - o.h / 2 + o.h * KNOB.height, z], o.knob, { detail: 0 }));
  }
  return parts;
}

const SLAB = 0.08; // default roof thickness
const RIDGE_CAP = { r: 0.065, lift: 0.05, overhang: 0.01 }; // for a SLAB-thick roof; scaled with thickness

/**
 * A gable roof: two slabs meeting at a ridge, plus an optional round ridge cap.
 * - `at`: centre of the wall tops the roof sits on.
 * - `width`: the walls' width across the ridge; `length`: the roof's length along it (include any
 *   overhang past the end walls).
 * - `rise`: ridge height above `at`; the slabs' undersides pass over the wall tops at ±width / 2.
 * - `eave`: how far the slabs reach past each side wall, measured flat.
 * - `along`: ridge direction, 'z' (default) or 'x'; `thickness` default 0.08.
 * Close the triangular ends with a wedge in the wall colour:
 * `kit.wedge([width, rise, wallLength], [x, wallTop + rise / 2, z], wall)` (rotate it a quarter
 * about y when `along: 'x'`). 24 triangles, 56 with the ridge cap.
 */
export function gableRoof(kit: StyleKit, o: {
  at: Vec3; length: number; width: number; rise: number; eave: number; color: PaletteColor;
  ridge?: PaletteColor; along?: 'x' | 'z'; thickness?: number;
}): Part[] {
  const t = o.thickness ?? SLAB;
  const alongX = o.along === 'x';
  const pitch = Math.atan2(o.rise, o.width / 2);
  const reach = o.width / 2 + o.eave; // ridge to eave edge, measured flat
  const slabLen = reach / Math.cos(pitch);
  // each slab's centre: half way down the slope, lifted half its thickness off the underside
  const out = reach / 2 + (t / 2) * Math.sin(pitch);
  const y = o.at[1] + o.rise - (reach / 2) * Math.tan(pitch) + (t / 2) * Math.cos(pitch);
  const parts: Part[] = [];
  for (const s of [1, -1]) {
    parts.push(alongX
      ? kit.box([o.length, t, slabLen], [o.at[0], y, o.at[2] + s * out], o.color, { rotate: [s * pitch, 0, 0] })
      : kit.box([slabLen, t, o.length], [o.at[0] + s * out, y, o.at[2]], o.color, { rotate: [0, 0, -s * pitch] }));
  }
  if (o.ridge) {
    const k = t / SLAB;
    parts.push(kit.cylinder(RIDGE_CAP.r * k, RIDGE_CAP.r * k, o.length + 2 * RIDGE_CAP.overhang,
      [o.at[0], o.at[1] + o.rise + RIDGE_CAP.lift * k, o.at[2]], o.ridge,
      { rotate: alongX ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0], segments: 8 }));
  }
  return parts;
}
