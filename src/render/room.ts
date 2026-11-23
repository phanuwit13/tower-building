import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { GRID_SIZE } from '../game/types';
import type { Part, PartOpts, StyleKit, Vec3 } from '../models/kit';
import { PALETTE, type PaletteColor } from '../models/palette';
import { SURROUND_FADE } from './ground';
import type { Stage } from './stage';

/**
 * The room round an indoor theme's map (ThemeDef.indoor, the café), in world units: 1 tile = 1,
 * the floor's top is y = 0, the pavement outside is y = SURROUND_FADE.y. Every wall's inner face is
 * on the grid's edge (x or z = 0 or GRID_SIZE) and everything else lies outside it, so the room
 * never takes a cell or covers one.
 */
export const ROOM = {
  /** Wall thickness: the outer face is this far outside the grid. */
  thick: 0.2,
  /** Posts, trim and top rail stand this far proud of the outer face (outwards, never into the room). */
  proud: 0.04,
  /** The walls stand on the pavement. */
  bottom: SURROUND_FADE.y,
  /** The solid base (knee high) and the wooden trim on it: low, so the default camera sees the edge cells over it. */
  baseTop: 0.4,
  trimTop: 0.45,
  /** Glass panes from the trim up to the top rail. */
  railBottom: 1.2,
  top: 1.3,
  /** Posts stand every `postEvery` tiles along a wall; lamps on the rail over every `lampEvery` and on the corners. */
  postEvery: 2,
  lampEvery: 4,
  /** The two-leaf glass door on the +x wall (the side the default camera looks from), from z to z. */
  door: { from: 9, to: 11 },
} as const;

/** How far the room reaches outside the grid on every side (the walls' outer faces): rain falls only past it. */
export const ROOM_REACH = ROOM.thick;

/**
 * The glass: mostly see-through (a pale sky-blue tint over what is behind it), lit like the rest but
 * never glowing. Coloured per vertex: the panes `tint`, the glints on them `glint`.
 */
const GLASS = { tint: 'skyBlue', glint: 'white', opacity: 0.2, roughness: 0.3 } as const satisfies Record<string, PaletteColor | number>;

type Range = readonly [number, number];

const POST = 0.1;
/**
 * A post's depth, outwards from the inner face: set back a hair from the inner face (the base's and
 * the trim's inner faces cover it below the panes, rather than flickering against it) and a hair
 * proud of the trim and the rail outside.
 */
const POST_O: Range = [0.005, ROOM.thick + ROOM.proud + 0.01];
const CORNER = ROOM.thick + ROOM.proud + 0.02;
const CORNER_CAP = 0.04;
const LAMP = { capR: 0.05, capH: 0.05, globeR: 0.085 } as const;
const LEAF = { frame: 0.06, rail: 0.07, o0: 0.06, o1: 0.14 } as const;
const AWNING = { from: 8.6, stripes: 7, stripe: 0.4, depth: 0.72, tilt: 0.32, thick: 0.035, y: ROOM.top + 0.06, valance: 0.12 } as const;
const AWNING_COLORS: readonly PaletteColor[] = ['red', 'white'];

/**
 * One wall: `normal` the axis it faces along, `inner` its inner face's coordinate on that axis,
 * `out` which way is outside. Along a wall, `u` runs on the other axis from 0 to GRID_SIZE and `o`
 * is the distance outwards from the inner face.
 */
interface Side { normal: 'x' | 'z'; inner: number; out: 1 | -1 }
const FRONT: Side = { normal: 'x', inner: GRID_SIZE, out: 1 };
const SIDES: readonly Side[] = [
  FRONT,
  { normal: 'x', inner: 0, out: -1 },
  { normal: 'z', inner: GRID_SIZE, out: 1 },
  { normal: 'z', inner: 0, out: -1 },
];

/** World point `o` out from a wall's inner face, `u` along it, at height `y`. */
function wallPoint(side: Side, u: number, o: number, y: number): Vec3 {
  const n = side.inner + side.out * o;
  return side.normal === 'x' ? [n, y, u] : [u, y, n];
}

/** A box along a wall over u, o (outwards from the inner face) and y. */
function wallBox(kit: StyleKit, side: Side, u: Range, o: Range, y: Range, color: PaletteColor, opts?: PartOpts): Part {
  const a = side.inner + side.out * o[0];
  const b = side.inner + side.out * o[1];
  const n: Range = [Math.min(a, b), Math.max(a, b)];
  const across = (r: Range) => r[1] - r[0];
  const mid = (r: Range) => (r[0] + r[1]) / 2;
  const size: Vec3 = side.normal === 'x' ? [across(n), across(y), across(u)] : [across(u), across(y), across(n)];
  const at: Vec3 = side.normal === 'x' ? [mid(n), mid(y), mid(u)] : [mid(u), mid(y), mid(n)];
  return kit.box(size, at, color, opts);
}

/** Give every vertex of `g` the palette colour `c` (linear, as the kit's vertex colours). */
function paint(g: THREE.BufferGeometry, c: PaletteColor): THREE.BufferGeometry {
  const { r, g: gr, b } = new THREE.Color(PALETTE[c]);
  const n = g.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) arr.set([r, gr, b], i * 3);
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return g;
}

/** A flat pane of glass along a wall, in the middle of its thickness, over u and y. */
function pane(side: Side, u: Range, y: Range): THREE.BufferGeometry {
  const g = new THREE.PlaneGeometry(u[1] - u[0], y[1] - y[0]);
  g.deleteAttribute('uv');
  if (side.normal === 'x') g.rotateY(Math.PI / 2);
  g.translate(...wallPoint(side, (u[0] + u[1]) / 2, ROOM.thick / 2, (y[0] + y[1]) / 2));
  return paint(g, GLASS.tint);
}

/**
 * Glints: the cartoon sign for glass, two slanted light streaks on each pane. Each is a strip of
 * white glass laid over the pane (in the glass mesh: no extra draw call), so it reads lighter where
 * the layers add up (the wide one three layers, the thin one two). `at` and `width` are shares of
 * the pane's width from its left end; GLINT_LEAN is how far a streak's top is right of its foot.
 * Each door leaf gets one streak, `DOOR_GLINT` (tiles from the leaf's left edge).
 */
const GLINTS = [{ at: 0.14, width: 0.1, layers: 3 }, { at: 0.28, width: 0.045, layers: 2 }] as const;
const GLINT_LEAN = 0.4;
const DOOR_GLINT = { from: 0.14, to: 0.24, layers: 2 } as const;
/** Panes narrower than this (beside the door) get none. */
const GLINT_MIN_PANE = 1.5;

/** A slanted strip on a pane, from u at its foot to u + lean at its top. */
function glint(side: Side, u: Range, y: Range, lean: number): THREE.BufferGeometry {
  const o = ROOM.thick / 2;
  const corners = [wallPoint(side, u[0], o, y[0]), wallPoint(side, u[1], o, y[0]), wallPoint(side, u[1] + lean, o, y[1]), wallPoint(side, u[0] + lean, o, y[1])];
  const normal = side.normal === 'x' ? [side.out, 0, 0] : [0, 0, side.out];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(corners.flat(), 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute([...normal, ...normal, ...normal, ...normal], 3));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  return paint(g, GLASS.glint);
}

/** The glints of a pane spanning u (between two posts) and y. */
function glints(side: Side, u: Range, y: Range): THREE.BufferGeometry[] {
  const w = u[1] - u[0];
  if (w < GLINT_MIN_PANE) return [];
  const out: THREE.BufferGeometry[] = [];
  for (const g of GLINTS) {
    const foot: Range = [u[0] + g.at * w, u[0] + (g.at + g.width) * w];
    for (let i = 0; i < g.layers; i++) out.push(glint(side, foot, y, GLINT_LEAN));
  }
  return out;
}

/** The clear stretches of a wall between its posts (and corners), minus the door: where the panes show. */
function panesOf(side: Side): Range[] {
  const ends = [0, ...postsOf(side), GRID_SIZE];
  const out: Range[] = [];
  for (let i = 0; i + 1 < ends.length; i++) {
    if (side === FRONT && ends[i] === ROOM.door.from) continue; // the door
    out.push([ends[i] + (i === 0 ? 0 : POST / 2), ends[i + 1] - (i + 1 === ends.length - 1 ? 0 : POST / 2)]);
  }
  return out;
}

/** Wall stretches along u, minus the door on the front: the base, trim and panes run across them. */
function stretches(side: Side): Range[] {
  return side === FRONT ? [[0, ROOM.door.from], [ROOM.door.to, GRID_SIZE]] : [[0, GRID_SIZE]];
}

/** Where the posts stand along a wall (the corners have their own): every 2 tiles, the front's door jambs instead of its middle post. */
function postsOf(side: Side): number[] {
  const out: number[] = [];
  for (let u = ROOM.postEvery; u < GRID_SIZE; u += ROOM.postEvery) {
    if (side === FRONT && u > ROOM.door.from && u < ROOM.door.to) continue;
    out.push(u);
  }
  if (side === FRONT) out.push(ROOM.door.from, ROOM.door.to);
  return out.sort((a, b) => a - b);
}

function buildWalls(kit: StyleKit, parts: Part[], glass: THREE.BufferGeometry[]): void {
  const flush: Range = [0, ROOM.thick];
  const proud: Range = [0, ROOM.thick + ROOM.proud];
  for (const side of SIDES) {
    for (const u of stretches(side)) {
      parts.push(wallBox(kit, side, u, flush, [ROOM.bottom, ROOM.baseTop], 'cream'));
      parts.push(wallBox(kit, side, u, proud, [ROOM.baseTop, ROOM.trimTop], 'wood'));
      glass.push(pane(side, u, [ROOM.trimTop - 0.02, ROOM.railBottom + 0.02]));
    }
    for (const u of panesOf(side)) glass.push(...glints(side, u, [ROOM.trimTop + 0.03, ROOM.railBottom - 0.03]));
    parts.push(wallBox(kit, side, [0, GRID_SIZE], proud, [ROOM.railBottom, ROOM.top], 'wood'));
    for (const u of postsOf(side)) {
      parts.push(wallBox(kit, side, [u - POST / 2, u + POST / 2], POST_O, [ROOM.bottom, ROOM.railBottom], 'wood'));
    }
    // lamps on the rail over every other post: a brass cap and a warm globe
    for (let u = ROOM.lampEvery; u < GRID_SIZE; u += ROOM.lampEvery) {
      const [x, , z] = wallPoint(side, u, (ROOM.thick + ROOM.proud) / 2, 0);
      lamp(kit, parts, x, ROOM.top, z);
    }
  }
  // thicker corner posts, a little taller than the rail, each with a lamp
  for (const cx of [0, GRID_SIZE]) for (const cz of [0, GRID_SIZE]) {
    const x = cx === 0 ? -CORNER / 2 : GRID_SIZE + CORNER / 2;
    const z = cz === 0 ? -CORNER / 2 : GRID_SIZE + CORNER / 2;
    const h = ROOM.top + CORNER_CAP - ROOM.bottom;
    parts.push(kit.box([CORNER, h, CORNER], [x, ROOM.bottom + h / 2, z], 'wood'));
    lamp(kit, parts, x, ROOM.top + CORNER_CAP, z);
  }
}

function lamp(kit: StyleKit, parts: Part[], x: number, y: number, z: number): void {
  parts.push(kit.cylinder(LAMP.capR, LAMP.capR * 1.2, LAMP.capH, [x, y + LAMP.capH / 2, z], 'brass', { segments: 8 }));
  parts.push(kit.sphere(LAMP.globeR, [x, y + LAMP.capH + LAMP.globeR * 0.9, z], 'lampWarm', { glow: true }));
}

/** The glass door in the front wall: two framed glass leaves, brass handle bars outside, a sill, a step and a mat. */
function buildDoor(kit: StyleKit, parts: Part[], glass: THREE.BufferGeometry[]): void {
  const { from, to } = ROOM.door;
  const mid = (from + to) / 2;
  const leafO: Range = [LEAF.o0, LEAF.o1];
  const leaves: Range[] = [[from + POST / 2, mid], [mid, to - POST / 2]];
  for (const [u0, u1] of leaves) {
    parts.push(wallBox(kit, FRONT, [u0, u0 + LEAF.frame], leafO, [0, ROOM.railBottom], 'woodDark'));
    parts.push(wallBox(kit, FRONT, [u1 - LEAF.frame, u1], leafO, [0, ROOM.railBottom], 'woodDark'));
    parts.push(wallBox(kit, FRONT, [u0 + LEAF.frame, u1 - LEAF.frame], leafO, [0, LEAF.rail], 'woodDark'));
    parts.push(wallBox(kit, FRONT, [u0 + LEAF.frame, u1 - LEAF.frame], leafO, [ROOM.railBottom - LEAF.rail, ROOM.railBottom], 'woodDark'));
  }
  glass.push(pane(FRONT, [from + POST / 2, to - POST / 2], [LEAF.rail / 2, ROOM.railBottom - LEAF.rail / 2]));
  for (const [u0] of leaves) {
    for (let i = 0; i < DOOR_GLINT.layers; i++) {
      glass.push(glint(FRONT, [u0 + DOOR_GLINT.from, u0 + DOOR_GLINT.to], [LEAF.rail + 0.04, ROOM.railBottom - LEAF.rail - 0.04], GLINT_LEAN));
    }
  }
  // vertical brass handle bars on the outside, one each side of the meeting stiles, on two stand-offs
  const barO = ROOM.thick + 0.08;
  for (const u of [mid - 0.15, mid + 0.15]) {
    parts.push(kit.cylinder(0.02, 0.02, 0.4, wallPoint(FRONT, u, barO, 0.62), 'brass', { segments: 8 }));
    for (const y of [0.48, 0.76]) parts.push(wallBox(kit, FRONT, [u - 0.0125, u + 0.0125], [LEAF.o1, barO], [y - 0.0125, y + 0.0125], 'brass'));
  }
  // the sill is flush with the floor; a step halfway down to the pavement; a mat on the pavement
  parts.push(wallBox(kit, FRONT, [from, to], [0, ROOM.thick], [ROOM.bottom, 0], 'woodDark'));
  parts.push(wallBox(kit, FRONT, [from - 0.3, to + 0.3], [ROOM.thick, ROOM.thick + 0.4], [ROOM.bottom, ROOM.bottom / 2], 'stone'));
  parts.push(wallBox(kit, FRONT, [mid - 0.75, mid + 0.75], [ROOM.thick + 0.48, ROOM.thick + 1.08], [ROOM.bottom, ROOM.bottom + 0.02], 'redDark'));
  parts.push(wallBox(kit, FRONT, [mid - 0.63, mid + 0.63], [ROOM.thick + 0.58, ROOM.thick + 0.98], [ROOM.bottom + 0.02, ROOM.bottom + 0.03], 'red'));
}

/** A striped awning over the door, sloping down away from the wall, with a striped valance along its edge. */
function buildAwning(kit: StyleKit, parts: Part[]): void {
  const o0 = ROOM.thick + ROOM.proud;
  const cos = Math.cos(AWNING.tilt);
  const sin = Math.sin(AWNING.tilt);
  const edgeO = o0 + AWNING.depth * cos;
  const edgeY = AWNING.y - AWNING.depth * sin;
  for (let i = 0; i < AWNING.stripes; i++) {
    const u = AWNING.from + AWNING.stripe * (i + 0.5);
    const color = AWNING_COLORS[i % AWNING_COLORS.length];
    const [x, , z] = wallPoint(FRONT, u, o0 + (AWNING.depth / 2) * cos, 0);
    parts.push(kit.box([AWNING.depth, AWNING.thick, AWNING.stripe], [x, AWNING.y - (AWNING.depth / 2) * sin, z], color, { rotate: [0, 0, -AWNING.tilt] }));
    parts.push(wallBox(kit, FRONT, [u - AWNING.stripe / 2, u + AWNING.stripe / 2], [edgeO - 0.03, edgeO], [edgeY - AWNING.valance, edgeY], color));
  }
}

/**
 * The room round an indoor theme's map: low walls just outside the grid (a cream base with a wood
 * trim, glass panes in wooden posts, a top rail with small warm lamps that glow at dusk and night)
 * and a two-leaf glass door in the +x wall with a striped awning, a step and a mat outside.
 *
 * Built once, the first time it is shown, with the style kit in world coordinates (lit, coloured
 * and shaded like the items): a body mesh, a glow mesh and one see-through glass mesh, so 3 draw
 * calls. Showing or hiding it redraws the shadows. Tile picking is plane maths, so the walls never
 * block a tap.
 */
export function createRoom(stage: Stage, kit: StyleKit): { setShown(on: boolean): void } {
  let root: THREE.Group | null = null;
  let shown = false;

  const build = (): THREE.Group => {
    const parts: Part[] = [];
    const panes: THREE.BufferGeometry[] = [];
    buildWalls(kit, parts, panes);
    buildDoor(kit, parts, panes);
    buildAwning(kit, parts);
    const group = kit.finish(parts);
    group.name = 'room';

    const merged = mergeGeometries(panes, false);
    for (const g of panes) g.dispose();
    if (!merged) throw new Error('room: merging the glass failed');
    const glass = new THREE.Mesh(merged, new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: GLASS.roughness, metalness: 0,
      transparent: true, opacity: GLASS.opacity, depthWrite: false, side: THREE.DoubleSide,
      // one draw call: three draws a see-through two-sided material back faces first, then front faces,
      // unless told not to; the glass is pale and faint, so the order of its layers never shows
      forceSinglePass: true,
    }));
    glass.name = 'room-glass';
    group.add(glass);

    // The pretty tier's AO pass re-renders the scene with an override material: the glass is see-through,
    // so leave it out (no AO from a pane over the floor behind it, and one draw call fewer).
    const scene = stage.scene;
    const sceneBeforeRender = scene.onBeforeRender.bind(scene);
    scene.onBeforeRender = (...args) => {
      sceneBeforeRender(...args);
      glass.visible = scene.overrideMaterial === null;
    };
    return group;
  };

  return {
    setShown(on) {
      if (on === shown) return;
      shown = on;
      if (on && !root) {
        root = build();
        stage.scene.add(root);
      }
      if (root) root.visible = on;
      stage.invalidateShadows();
    },
  };
}
