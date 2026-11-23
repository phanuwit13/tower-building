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
 *
 * A painted shop front: a teal base outside (cream inside) with a white sill, white window frames
 * and mullions round see-through glass, a thick teal cap all round (the room's outline from above)
 * with a string of warm bulbs on it, flower boxes under the front windows, and an open glass door
 * in a red frame with a round coffee-cup sign over it.
 */
export const ROOM = {
  /** Wall thickness: the outer face is this far outside the grid. */
  thick: 0.2,
  /** The walls stand on the pavement. */
  bottom: SURROUND_FADE.y,
  /** The painted base and the white sill on it: low, so the default camera sees the edge cells over it. */
  baseTop: 0.39,
  trimTop: 0.45,
  /** Windows from the sill up to the cap's underside; the cap's top. */
  railBottom: 1.2,
  top: 1.34,
  /** Window posts stand every `postEvery` tiles along a wall, a mullion halves each window. */
  postEvery: 2,
  /** The two-leaf glass door on the +x wall, from z to z, standing open. */
  door: { from: 9, to: 11, swing: 1.35 },
} as const;

/** How far the room's walls reach outside the grid on every side (their outer faces): rain falls only past it. */
export const ROOM_REACH = ROOM.thick;

type Range = readonly [number, number];

/** Outwards from the inner face: the sill and the cap overhang the base outside (never inside). */
const SILL_O: Range = [0, 0.28];
const CAP_O: Range = [0, 0.32];
/** Window posts and door jambs: set back a hair from the inner face (so the base's and the sill's inner faces cover them without flicker), proud of the base outside. */
const POST_O: Range = [0.005, 0.25];
const POST = 0.1;
/** Mullions: slim bars in the glass plane. */
const MULLION = { width: 0.05, o: [0.07, 0.13] as Range } as const;
/** The base is two skins: the café colour outside, cream inside. */
const BASE_SPLIT = 0.1;
const CORNER = 0.34;

const COLORS = {
  baseOut: 'teal', baseIn: 'cream', cap: 'teal', corner: 'teal', frame: 'white', sill: 'white', door: 'red',
} as const satisfies Record<string, PaletteColor>;

/**
 * The glass: see-through with a clear sky-blue tint, lit like the rest but never glowing. Coloured
 * per vertex: the panes `tint`, the glints on them `glint`.
 */
const GLASS = { tint: 'skyBlue', glint: 'white', opacity: 0.32, roughness: 0.3 } as const satisfies Record<string, PaletteColor | number>;

/** A string of warm bulbs along the middle of the cap; big warm globes on the corner posts. */
const BULBS = { every: 0.5, r: 0.055, o: 0.16 } as const;
const GLOBE = { r: 0.12, capR: 0.07, capH: 0.06 } as const;

/** Flower boxes under the windows of the walls the default camera looks across (+x and +z). */
const FLOWER_BOX = { o: [ROOM.thick, 0.46] as Range, y: [0.12, 0.35] as Range, inset: 0.1 } as const;
const FLOWER_COLORS: readonly PaletteColor[] = ['red', 'pink', 'sunYellow', 'purple', 'orange', 'white'];

/** The open door's leaves (swung out ROOM.door.swing radians from shut): glass in frames, push bars on both faces. */
const LEAF = { frame: 0.06, rail: 0.08, thick: 0.06, bottom: -0.1, top: 1.1 } as const;
const HEADER: Range = [1.1, ROOM.railBottom];

/**
 * The round sign by the door: a blade on an arm, facing +z, its face tilted back towards the camera.
 * It hangs over the door's -z jamb (`u`): the default camera's sight lines to the open leaves climb
 * towards +z, so a sign there never stands in front of them.
 */
const SIGN = { u: ROOM.door.from - 0.32, o: 0.62, y: 1.74, r: 0.3, tilt: 0.6, rim: 0.035 } as const;

/** Where along the front the sign's arm runs (z): under the bottom of its tilted disc. */
function signZ(): number {
  return SIGN.u + (SIGN.r + SIGN.rim) * Math.sin(SIGN.tilt);
}

/**
 * One wall: `normal` the axis it faces along, `inner` its inner face's coordinate on that axis,
 * `out` which way is outside. Along a wall, `u` runs on the other axis from 0 to GRID_SIZE and `o`
 * is the distance outwards from the inner face.
 */
interface Side { normal: 'x' | 'z'; inner: number; out: 1 | -1; flowers: boolean }
const FRONT: Side = { normal: 'x', inner: GRID_SIZE, out: 1, flowers: true };
const SIDES: readonly Side[] = [
  FRONT,
  { normal: 'x', inner: 0, out: -1, flowers: false },
  { normal: 'z', inner: GRID_SIZE, out: 1, flowers: true },
  { normal: 'z', inner: 0, out: -1, flowers: false },
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

/** A flat glass quad through four corners (any order round it), every vertex the palette colour `c` (linear, as the kit's). */
function quad(corners: readonly Vec3[], c: PaletteColor): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(corners.flat(), 3));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  g.computeVertexNormals();
  const { r, g: gr, b } = new THREE.Color(PALETTE[c]);
  g.setAttribute('color', new THREE.Float32BufferAttribute(corners.flatMap(() => [r, gr, b]), 3));
  return g;
}

/** A pane of glass along a wall, in the middle of its thickness, over u and y. */
function pane(side: Side, u: Range, y: Range): THREE.BufferGeometry {
  const o = ROOM.thick / 2;
  return quad([wallPoint(side, u[0], o, y[0]), wallPoint(side, u[1], o, y[0]), wallPoint(side, u[1], o, y[1]), wallPoint(side, u[0], o, y[1])], GLASS.tint);
}

/**
 * Glints: the cartoon sign for glass, two slanted light streaks on each window. Each is a strip of
 * white glass laid over the pane (in the glass mesh: no extra draw call), so it reads lighter where
 * the layers add up (the wide one three layers, the thin one two). `at` and `width` are shares of
 * the window's width from its left end; GLINT_LEAN is how far a streak's top is right of its foot.
 */
const GLINTS = [{ at: 0.14, width: 0.1, layers: 3 }, { at: 0.28, width: 0.045, layers: 2 }] as const;
const GLINT_LEAN = 0.4;
/** Windows narrower than this (beside the door) get none. */
const GLINT_MIN = 1.5;

function glints(side: Side, u: Range, y: Range): THREE.BufferGeometry[] {
  const w = u[1] - u[0];
  if (w < GLINT_MIN) return [];
  const o = ROOM.thick / 2;
  const out: THREE.BufferGeometry[] = [];
  for (const g of GLINTS) {
    const u0 = u[0] + g.at * w;
    const u1 = u[0] + (g.at + g.width) * w;
    const corners = [wallPoint(side, u0, o, y[0]), wallPoint(side, u1, o, y[0]), wallPoint(side, u1 + GLINT_LEAN, o, y[1]), wallPoint(side, u0 + GLINT_LEAN, o, y[1])];
    for (let i = 0; i < g.layers; i++) out.push(quad(corners, GLASS.glint));
  }
  return out;
}

/** Wall stretches along u, minus the doorway on the front: the base, sill and panes run across them. */
function stretches(side: Side): Range[] {
  return side === FRONT ? [[0, ROOM.door.from], [ROOM.door.to, GRID_SIZE]] : [[0, GRID_SIZE]];
}

/** Where the window posts stand along a wall (the corners have their own): every 2 tiles, the doorway's jambs instead of its middle post. */
function postsOf(side: Side): number[] {
  const out: number[] = [];
  for (let u = ROOM.postEvery; u < GRID_SIZE; u += ROOM.postEvery) {
    if (side === FRONT && u > ROOM.door.from && u < ROOM.door.to) continue;
    out.push(u);
  }
  if (side === FRONT) out.push(ROOM.door.from, ROOM.door.to);
  return out.sort((a, b) => a - b);
}

/** The windows of a wall: the clear stretches between its posts (and corners), minus the doorway. */
function windowsOf(side: Side): Range[] {
  const ends = [0, ...postsOf(side), GRID_SIZE];
  const out: Range[] = [];
  for (let i = 0; i + 1 < ends.length; i++) {
    if (side === FRONT && ends[i] === ROOM.door.from) continue; // the doorway
    out.push([ends[i] + (i === 0 ? 0 : POST / 2), ends[i + 1] - (i + 1 === ends.length - 1 ? 0 : POST / 2)]);
  }
  return out;
}

/** Deterministic 0..1 hash of a window's place, so every flower box gets its own mix of colours. */
function hash(a: number, b: number): number {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function buildWalls(kit: StyleKit, parts: Part[], glass: THREE.BufferGeometry[]): void {
  for (const side of SIDES) {
    for (const u of stretches(side)) {
      parts.push(wallBox(kit, side, u, [0, BASE_SPLIT], [ROOM.bottom, ROOM.baseTop], COLORS.baseIn));
      parts.push(wallBox(kit, side, u, [BASE_SPLIT, ROOM.thick], [ROOM.bottom, ROOM.baseTop], COLORS.baseOut));
      parts.push(wallBox(kit, side, u, SILL_O, [ROOM.baseTop, ROOM.trimTop], COLORS.sill));
      glass.push(pane(side, u, [ROOM.trimTop - 0.02, ROOM.railBottom + 0.02]));
    }
    parts.push(wallBox(kit, side, [0, GRID_SIZE], CAP_O, [ROOM.railBottom, ROOM.top], COLORS.cap));
    for (const u of postsOf(side)) {
      const jamb = side === FRONT && (u === ROOM.door.from || u === ROOM.door.to);
      parts.push(wallBox(kit, side, [u - POST / 2, u + POST / 2], POST_O, [ROOM.bottom, ROOM.railBottom], jamb ? COLORS.door : COLORS.frame));
    }
    for (const w of windowsOf(side)) {
      glass.push(...glints(side, w, [ROOM.trimTop + 0.03, ROOM.railBottom - 0.03]));
      if (w[1] - w[0] >= GLINT_MIN) {
        const m = (w[0] + w[1]) / 2;
        parts.push(wallBox(kit, side, [m - MULLION.width / 2, m + MULLION.width / 2], MULLION.o, [ROOM.trimTop, ROOM.railBottom], COLORS.frame));
      }
      if (side.flowers) flowerBox(kit, parts, side, w);
    }
    // a string of warm bulbs along the cap (on the front, not where the sign's arm runs)
    for (let u = BULBS.every / 2; u < GRID_SIZE; u += BULBS.every) {
      if (side === FRONT && Math.abs(u - signZ()) < BULBS.every / 2) continue;
      parts.push(kit.sphere(BULBS.r, wallPoint(side, u, BULBS.o, ROOM.top + BULBS.r * 0.8), 'lampWarm', { glow: true, detail: 0 }));
    }
  }
  // thick corner posts, a little taller than the cap, each with a big warm globe
  for (const cx of [0, GRID_SIZE]) for (const cz of [0, GRID_SIZE]) {
    const x = cx === 0 ? -CORNER / 2 : GRID_SIZE + CORNER / 2;
    const z = cz === 0 ? -CORNER / 2 : GRID_SIZE + CORNER / 2;
    const top = ROOM.top + 0.04;
    parts.push(kit.box([CORNER, top - ROOM.bottom, CORNER], [x, (top + ROOM.bottom) / 2, z], COLORS.corner));
    parts.push(kit.cylinder(GLOBE.capR, GLOBE.capR * 1.2, GLOBE.capH, [x, top + GLOBE.capH / 2, z], 'brass', { segments: 8 }));
    parts.push(kit.sphere(GLOBE.r, [x, top + GLOBE.capH + GLOBE.r * 0.9, z], 'lampWarm', { glow: true }));
  }
}

/** A planter under a window, outside: soil, leaves and flowers in a mix of bright colours. */
function flowerBox(kit: StyleKit, parts: Part[], side: Side, w: Range): void {
  const u: Range = [w[0] + FLOWER_BOX.inset, w[1] - FLOWER_BOX.inset];
  const o = FLOWER_BOX.o;
  parts.push(wallBox(kit, side, u, o, FLOWER_BOX.y, 'woodDark'));
  parts.push(wallBox(kit, side, [u[0] + 0.04, u[1] - 0.04], [o[0] + 0.03, o[1] - 0.04], [FLOWER_BOX.y[1], FLOWER_BOX.y[1] + 0.02], 'bark'));
  const len = u[1] - u[0];
  const n = Math.max(2, Math.round(len / 0.3));
  const mid = (o[0] + o[1]) / 2;
  const seed = hash(side.inner + (side.normal === 'x' ? 0 : 7), w[0]);
  for (let i = 0; i < n; i++) {
    const at = u[0] + (len * (i + 0.5)) / n;
    const wobble = (hash(at, seed) - 0.5) * 0.08;
    const y = FLOWER_BOX.y[1] + 0.1 + hash(seed, at) * 0.07;
    if (i % 2 === 0) parts.push(kit.sphere(0.09, wallPoint(side, at + 0.1, mid + wobble, FLOWER_BOX.y[1] + 0.06), 'leaf', { detail: 0, scale: [1.6, 0.7, 1.3] }));
    const color = FLOWER_COLORS[(Math.floor(seed * FLOWER_COLORS.length) + i * 5) % FLOWER_COLORS.length]; // 5 and 6 share no factor: every colour comes round
    parts.push(kit.sphere(0.065, wallPoint(side, at + 0.05, mid - wobble, y), color, { detail: 0 }));
  }
}

/** A leaf of the open door: hinged on the outer face at `hingeU`, its shut position running towards `dir` (+1/-1 in u). */
function leaf(kit: StyleKit, parts: Part[], glass: THREE.BufferGeometry[], hingeU: number, dir: 1 | -1): void {
  const width = (ROOM.door.to - ROOM.door.from) / 2 - POST / 2;
  // along the leaf from its hinge, swung out of the wall; across it (its face normal)
  const along = { x: Math.sin(ROOM.door.swing), z: dir * Math.cos(ROOM.door.swing) };
  const across = { x: -along.z, z: along.x };
  const hinge = { x: GRID_SIZE + ROOM.thick, z: hingeU };
  const at = (a: number, y: number, n = 0): Vec3 => [hinge.x + along.x * a + across.x * n, y, hinge.z + along.z * a + across.z * n];
  const turn: Vec3 = [0, Math.atan2(-along.z, along.x), 0];
  const bar = (a0: number, a1: number, y0: number, y1: number) =>
    parts.push(kit.box([a1 - a0, y1 - y0, LEAF.thick], at((a0 + a1) / 2, (y0 + y1) / 2), COLORS.door, { rotate: turn }));
  const f = LEAF.frame;
  bar(0, f, LEAF.bottom, LEAF.top);
  bar(width - f, width, LEAF.bottom, LEAF.top);
  bar(f, width - f, LEAF.bottom, LEAF.bottom + LEAF.rail);
  bar(f, width - f, LEAF.top - LEAF.rail, LEAF.top);
  const g0 = LEAF.bottom + LEAF.rail / 2;
  const g1 = LEAF.top - LEAF.rail / 2;
  glass.push(quad([at(f / 2, g0), at(width - f / 2, g0), at(width - f / 2, g1), at(f / 2, g1)], GLASS.tint));
  for (let i = 0; i < 2; i++) glass.push(quad([at(0.16, g0 + 0.1), at(0.26, g0 + 0.1), at(0.5, g1 - 0.1), at(0.4, g1 - 0.1)], GLASS.glint));
  // brass push bars on both faces, near the free edge
  const a = width - 0.16;
  for (const side of [1, -1]) {
    const n = side * (LEAF.thick / 2 + 0.06);
    parts.push(kit.cylinder(0.028, 0.028, 0.48, at(a, 0.5, n), 'brass', { segments: 8 }));
    for (const y of [0.33, 0.67]) {
      parts.push(kit.box([0.025, 0.025, 0.06], at(a, y, side * (LEAF.thick / 2 + 0.03)), 'brass', { rotate: turn }));
    }
  }
}

/** The doorway in the front wall: a red frame, the two glass leaves standing open, a sill, a step and a mat. */
function buildDoor(kit: StyleKit, parts: Part[], glass: THREE.BufferGeometry[]): void {
  const { from, to } = ROOM.door;
  const mid = (from + to) / 2;
  parts.push(wallBox(kit, FRONT, [from, to], POST_O, HEADER, COLORS.door));
  leaf(kit, parts, glass, from + POST / 2, 1);
  leaf(kit, parts, glass, to - POST / 2, -1);
  // the sill is flush with the floor; a step halfway down to the pavement; a mat on the pavement between the leaves
  parts.push(wallBox(kit, FRONT, [from, to], [0, ROOM.thick], [ROOM.bottom, 0], 'woodDark'));
  parts.push(wallBox(kit, FRONT, [from - 0.3, to + 0.3], [ROOM.thick, ROOM.thick + 0.4], [ROOM.bottom, ROOM.bottom / 2], 'stone'));
  parts.push(wallBox(kit, FRONT, [mid - 0.6, mid + 0.6], [ROOM.thick + 0.48, ROOM.thick + 1.08], [ROOM.bottom, ROOM.bottom + 0.02], 'redDark'));
  parts.push(wallBox(kit, FRONT, [mid - 0.5, mid + 0.5], [ROOM.thick + 0.58, ROOM.thick + 0.98], [ROOM.bottom + 0.02, ROOM.bottom + 0.03], 'red'));
}

/**
 * A round blade sign by the door, on a brass arm off the cap: a red disc in a white rim with a
 * white coffee cup (steam, saucer, handle) that glows warm at night. It faces +z, the way the
 * default camera looks across the front, its face tilted back towards the camera.
 */
function buildSign(kit: StyleKit, parts: Part[]): void {
  const z = SIGN.u;
  const x = GRID_SIZE + SIGN.o;
  const cos = Math.cos(SIGN.tilt);
  const sin = Math.sin(SIGN.tilt);
  // disc-local: u across (+x), v up the face, w out of the face
  const at = (u: number, v: number, w: number): Vec3 => [x + u, SIGN.y + v * cos + w * sin, z - v * sin + w * cos];
  const flat: Vec3 = [-SIGN.tilt, 0, 0]; // a box lying in the face
  const disc: Vec3 = [Math.PI / 2 - SIGN.tilt, 0, 0]; // a cylinder's axis out of the face
  // the arm along the top of the cap and out under the sign, and a stem up to it
  const bottom = at(0, -SIGN.r - SIGN.rim, 0);
  parts.push(kit.box([SIGN.o + 0.05, 0.05, 0.05], [GRID_SIZE + (SIGN.o + 0.05) / 2, ROOM.top + 0.025, signZ()], 'brass'));
  parts.push(kit.box([0.05, bottom[1] - ROOM.top, 0.05], [x, (bottom[1] + ROOM.top) / 2, bottom[2]], 'brass'));
  parts.push(kit.cylinder(SIGN.r + SIGN.rim, SIGN.r + SIGN.rim, 0.04, at(0, 0, -0.01), 'white', { rotate: disc, segments: 16 }));
  parts.push(kit.cylinder(SIGN.r, SIGN.r, 0.04, at(0, 0, 0.012), COLORS.door, { rotate: disc, segments: 16 }));
  const icon = { glow: 'lampWarm' as const };
  const w = 0.04;
  parts.push(kit.box([0.17, 0.15, 0.02], at(-0.03, -0.02, w), 'white', { rotate: flat, ...icon })); // the cup
  parts.push(kit.box([0.26, 0.025, 0.02], at(-0.02, -0.11, w), 'white', { rotate: flat, ...icon })); // the saucer
  parts.push(kit.box([0.025, 0.08, 0.02], at(0.1, -0.015, w), 'white', { rotate: flat, ...icon })); // the handle
  parts.push(kit.box([0.04, 0.02, 0.02], at(0.075, 0.015, w), 'white', { rotate: flat, ...icon }));
  parts.push(kit.box([0.04, 0.02, 0.02], at(0.075, -0.045, w), 'white', { rotate: flat, ...icon }));
  for (const [u, v] of [[-0.08, 0.1], [-0.03, 0.13], [0.02, 0.1]]) {
    parts.push(kit.box([0.025, 0.06, 0.02], at(u, v + 0.02, w), 'white', { rotate: flat, ...icon })); // steam
  }
}

/**
 * The room round an indoor theme's map: a café shop front just outside the grid. Built once, the
 * first time it is shown, with the style kit in world coordinates (lit, coloured and shaded like
 * the items): a body mesh, a glow mesh (the bulbs, the globes and the sign's cup) and one
 * see-through glass mesh, so 3 draw calls. Showing or hiding it redraws the shadows. Tile picking
 * is plane maths, so the walls never block a tap.
 */
export function createRoom(stage: Stage, kit: StyleKit): { setShown(on: boolean): void } {
  let root: THREE.Group | null = null;
  let shown = false;

  const build = (): THREE.Group => {
    const parts: Part[] = [];
    const panes: THREE.BufferGeometry[] = [];
    buildWalls(kit, parts, panes);
    buildDoor(kit, parts, panes);
    buildSign(kit, parts);
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
