/**
 * Shared building parts: windows, doors, wall signs, gable and barrel roofs, rods and wheels, plus
 * the direction maths behind them, built only from kit primitives. Each returns `Part[]` to spread into an item's parts list before `kit.finish`.
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

/** A detail-0 icosphere's lowest point sits this share of its radius below its centre (rest one on y = ground + r * ICO_LOW). */
export const ICO_LOW = 0.851;

/**
 * Euler XYZ rotation (for a part's `rotate`) that turns the part's own +y onto the direction `dir`
 * (any length; not zero). Two ways to get there, with a different twist about `dir`:
 * - `'x'` (default): tilt in the x-y plane, then about x. The twist rods use.
 * - `'y'`: tilt away from +y, then swing round y. For things placed around a vertical axis
 *   (a globe's land patches, pins on a pole): the part's local z stays level.
 */
export function aim(dir: Vec3, turn: 'x' | 'y' = 'x'): Vec3 {
  const len = Math.hypot(...dir);
  if (turn === 'x') return [Math.atan2(dir[2], dir[1]), 0, -Math.asin(Math.max(-1, Math.min(1, dir[0] / len)))];
  const c = Math.acos(Math.max(-1, Math.min(1, dir[1] / len)));
  return [0, Math.abs(Math.sin(c)) < 1e-6 ? 0 : Math.atan2(dir[2], -dir[0]), c];
}

/** Unit direction for a yaw about y (0 = +x, positive turns towards -z) and a pitch (positive = up). A part rotated `[0, yaw, pitch]` has its +x along it. */
export function heading(yaw: number, pitch: number): Vec3 {
  return [Math.cos(pitch) * Math.cos(yaw), Math.sin(pitch), -Math.cos(pitch) * Math.sin(yaw)];
}

/** The point `s` from `p` along `d`. */
export function along(p: Vec3, d: Vec3, s: number): Vec3 {
  return [p[0] + d[0] * s, p[1] + d[1] * s, p[2] + d[2] * s];
}

/**
 * A round rod (cylinder, same radius both ends) from point `a` to point `b`: struts, bars,
 * net strands, slanted frame members. Default 6 `segments`. `a` and `b` may not be the same point.
 */
export function rod(kit: StyleKit, a: Vec3, b: Vec3, radius: number, color: PaletteColor, opts?: { segments?: number; glow?: PartOpts['glow'] }): Part {
  const d: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const mid: Vec3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  return kit.cylinder(radius, radius, Math.hypot(...d), mid, color, { segments: opts?.segments ?? 6, rotate: aim(d), ...(opts?.glow ? { glow: opts.glow } : {}) });
}

/**
 * A barrel (half-ellipse) roof: faceted slabs over an arch, plus an optional fan of wedges that
 * closes both ends under the arch.
 * - `at`: the centre of the ellipse (middle of the roof along the barrel, centred across it); the
 *   crown is `rise` above `at[1]`.
 * - `width`: across the barrel (full ellipse width); `length`: roof length along it.
 * - `along`: barrel direction, 'x' (default) or 'z'. `segments`: slabs, default 8; `thickness`
 *   default 0.07; `overlap`: each slab is this much longer than its chord to close the joints, default 0.03.
 * - `spring`: angle in radians where the arch starts above the horizontal, default 0.2 (the roof
 *   meets the wall tops at a slant, so `at[1]` sits `rise * sin(spring)` above the wall tops).
 * - `endWall`: wedges in `color`, `length` long along the barrel and centred at `center` (default the
 *   roof's middle), to shut the arch ends; pull them in a little from the wall faces.
 * Triangles: 12 per slab, plus 8 per end-wall wedge.
 */
export function barrelRoof(kit: StyleKit, o: {
  at: Vec3; length: number; width: number; rise: number; color: PaletteColor;
  segments?: number; along?: 'x' | 'z'; thickness?: number; overlap?: number; spring?: number;
  endWall?: { color: PaletteColor; length: number; center?: number };
}): Part[] {
  const n = o.segments ?? 8;
  const thick = o.thickness ?? 0.07;
  const overlap = o.overlap ?? 0.03;
  const t0 = o.spring ?? 0.2;
  const alongZ = o.along === 'z';
  const a = o.width / 2, b = o.rise;
  const cy = o.at[1];
  const cu = alongZ ? o.at[0] : o.at[2]; // across-the-barrel centre
  const mid = alongZ ? o.at[2] : o.at[0]; // along-the-barrel centre
  // points on the half ellipse, in (y, u) with u across the barrel, from +u over the top to -u
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= n; i++) {
    const t = t0 + (i / n) * (Math.PI - 2 * t0);
    pts.push([cy + b * Math.sin(t), a * Math.cos(t)]);
  }
  const parts: Part[] = [];
  for (let i = 0; i < n; i++) {
    const [y0, u0] = pts[i];
    const [y1, u1] = pts[i + 1];
    const c = Math.hypot(y1 - y0, u1 - u0);
    const dy = (y1 - y0) / c, du = (u1 - u0) / c;
    // F: the foot of the perpendicular from the ellipse centre to this chord; v: unit vector from the chord towards the centre
    const k = (cy - y0) * dy + (0 - u0) * du;
    const fy = y0 + dy * k, fu = u0 + du * k;
    const h = Math.hypot(cy - fy, -fu);
    const vy = (cy - fy) / h, vu = -fu / h;
    const my = (y0 + y1) / 2, mu = (u0 + u1) / 2;
    // turn a part's local x onto the chord, its local y onto v and its local z onto the barrel's axis
    const rotate: Vec3 = alongZ ? [0, 0, Math.atan2(-vu, vy)] : [Math.atan2(vu, vy), Math.PI / 2, 0];
    const chord = alongZ ? [-vu, vy] : [vu, -vy]; // chord direction in (y, u)
    const apex = ((fy - my) * chord[0] + (fu - mu) * chord[1]) / c; // where the centre sits along the chord, from its middle
    const place = (axisPos: number, y: number, u: number): Vec3 => (alongZ ? [cu + u, y, axisPos] : [axisPos, y, cu + u]);
    const sizeFor = (w: number, hh: number, len: number): Vec3 => [w, hh, len];
    parts.push(kit.box(sizeFor(c + overlap, thick, o.length), place(mid, my - vy * thick / 2, mu - vu * thick / 2), o.color, { rotate }));
    if (o.endWall) {
      parts.push(kit.wedge(sizeFor(c, h, o.endWall.length), place(o.endWall.center ?? mid, my + vy * h / 2, mu + vu * h / 2), o.endWall.color, { rotate, apex }));
    }
  }
  return parts;
}

/**
 * A spoked wheel standing upright: a torus tyre, an optional hub and `spokes` flat bars across it.
 * - `at`: the wheel's centre; `radius`: to the middle of the tyre's tube; `tube`: the tube's radius.
 * - `axis`: 'z' rolls along x (its axle along z), 'x' rolls along z (its axle along x).
 * - `hubColor` adds a 6-sided hub (radius `hubRadius`, default radius / 4; `hubLength` along the axle, default 4 * tube).
 * - `spokes`: full-diameter bars through the hub (default 2, so four spokes), `spokeWidth` across and
 *   `spokeThick` along the axle (defaults tube * 0.6 and tube * 0.5), in `spokeColor` (default 'white'),
 *   the first at 45 degrees, each next one `spokeStep` further round (default half a turn / `spokes`).
 * - `tubularSegments` (default 12; keep a multiple of 4 so a vertex sits at the bottom) and `radialSegments` (default 4).
 */
export function wheel(kit: StyleKit, o: {
  at: Vec3; radius: number; tube: number; axis: 'x' | 'z'; color: PaletteColor;
  hubColor?: PaletteColor; hubRadius?: number; hubLength?: number;
  spokes?: number; spokeColor?: PaletteColor; spokeWidth?: number; spokeThick?: number; spokeStep?: number;
  tubularSegments?: number; radialSegments?: number;
}): Part[] {
  const axisZ = o.axis === 'z';
  const parts: Part[] = [
    kit.torus(o.radius, o.tube, o.at, o.color, {
      radialSegments: o.radialSegments ?? 4, tubularSegments: o.tubularSegments ?? 12,
      ...(axisZ ? {} : { rotate: [0, Math.PI / 2, 0] as Vec3 }),
    }),
  ];
  if (o.hubColor) {
    const r = o.hubRadius ?? o.radius / 4;
    parts.push(kit.cylinder(r, r, o.hubLength ?? 4 * o.tube, o.at, o.hubColor, { segments: 6, rotate: axisZ ? [Math.PI / 2, 0, 0] : [0, 0, Math.PI / 2] }));
  }
  const spokes = o.spokes ?? 2;
  const w = o.spokeWidth ?? o.tube * 0.6;
  const th = o.spokeThick ?? o.tube * 0.5;
  for (let i = 0; i < spokes; i++) {
    const ang = Math.PI / 4 + i * (o.spokeStep ?? Math.PI / spokes);
    parts.push(kit.box(axisZ ? [w, 2 * o.radius, th] : [th, 2 * o.radius, w], o.at, o.spokeColor ?? 'white',
      { rotate: axisZ ? [0, 0, ang] : [ang, 0, 0] }));
  }
  return parts;
}
