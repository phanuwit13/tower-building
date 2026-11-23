import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { GRID_SIZE } from '../game/types';
import { getStyleKit } from '../models/kit';
import { PALETTE, type PaletteColor } from '../models/palette';
import type { RoomLook } from '../themes/types';
import { SURROUND_FADE } from './ground';
import { createRoom, HOSPITAL_SIGN, ROOM } from './room';
import { CAMERA, type Stage } from './stage';

const kit = getStyleKit();
const LOOKS: readonly RoomLook[] = ['cafe', 'hospital'];

function setup() {
  const invalidateShadows = vi.fn();
  const stage = { scene: new THREE.Scene(), invalidateShadows } as unknown as Stage;
  return { stage, invalidateShadows, room: createRoom(stage, kit) };
}

/** The room's looks in the scene, by name. */
const looksIn = (scene: THREE.Scene) => scene.children.filter((c) => c.name.startsWith('room-'));

/** A look shown once: its root and its meshes (body, glow, glass). */
function shownRoom(look: RoomLook = 'cafe') {
  const { stage, room } = setup();
  room.setShown(look);
  const root = stage.scene.getObjectByName(`room-${look}`)!;
  root.updateMatrixWorld(true);
  const meshes: THREE.Mesh[] = [];
  root.traverse((o) => { if (o instanceof THREE.Mesh) meshes.push(o); });
  const glass = meshes.find((m) => (m.material as THREE.Material).transparent)!;
  const body = meshes.find((m) => m.material === kit.materials.body)!;
  const glow = meshes.find((m) => m.material === kit.materials.glow)!;
  return { stage, root, meshes, glass, body, glow };
}

/** Whether a ray from `from` along `dir` meets `mesh` within `far`. */
function hits(mesh: THREE.Mesh, from: THREE.Vector3, dir: THREE.Vector3, far: number): boolean {
  const ray = new THREE.Raycaster(from, dir.clone().normalize(), 0, far);
  return ray.intersectObject(mesh, false).length > 0;
}

/**
 * Sample points across each wall, looking out from just inside the room: `u` along the wall, the ray
 * starts 0.5 inside the inner face and ends at the wall's outer face (posts and handles stand proud
 * of it, so they are not met). Mid-pane: halfway between two posts.
 */
const WALLS = [
  { name: '+x', at: (u: number, y: number) => new THREE.Vector3(GRID_SIZE - 0.5, y, u), dir: new THREE.Vector3(1, 0, 0) },
  { name: '-x', at: (u: number, y: number) => new THREE.Vector3(0.5, y, u), dir: new THREE.Vector3(-1, 0, 0) },
  { name: '+z', at: (u: number, y: number) => new THREE.Vector3(u, y, GRID_SIZE - 0.5), dir: new THREE.Vector3(0, 0, 1) },
  { name: '-z', at: (u: number, y: number) => new THREE.Vector3(u, y, 0.5), dir: new THREE.Vector3(0, 0, -1) },
];
const REACH = 0.5 + ROOM.thick;
/** Mid-pane: clear of the posts (even u) and the café's mullions (odd u), and of the doorway (z 9-11 on +x). */
const MID_PANES = [0.5, 1.5, 2.5, 3.5, 5.5, 6.5, 13.5, 14.5, 16.5, 18.5, 19.5];

/** The stage's default camera (stage.ts CAMERA): where kids first see the room from. */
const EYE = new THREE.Vector3(GRID_SIZE / 2, 0, GRID_SIZE / 2).addScaledVector(CAMERA.direction, CAMERA.distance);
/** Whether `target` is hidden from the default camera by any of `meshes` (a hit nearer than it by more than `slack`). */
function hiddenFromEye(meshes: THREE.Mesh[], target: THREE.Vector3, slack = 0.01): boolean {
  return firstSeen(meshes, target, slack) !== undefined;
}
/** What the default camera meets first on its way to `target` (stopping `slack` short of it), if anything. */
function firstSeen(meshes: THREE.Mesh[], target: THREE.Vector3, slack = 0.01): THREE.Intersection | undefined {
  const toTarget = target.clone().sub(EYE);
  const ray = new THREE.Raycaster(EYE, toTarget.clone().normalize(), 0, toTarget.length() - slack);
  ray.params.Mesh = {};
  for (const m of meshes) (m.material as THREE.Material).side = THREE.DoubleSide; // any face counts as cover
  return ray.intersectObjects(meshes, false)[0];
}

/** The vertex colour (linear, as the kit stores it) of the face a ray met. */
function faceColor(hit: THREE.Intersection, attribute = 'color'): THREE.Color {
  const c = (hit.object as THREE.Mesh).geometry.attributes[attribute];
  return new THREE.Color(c.getX(hit.face!.a), c.getY(hit.face!.a), c.getZ(hit.face!.a));
}
/** A palette colour as the kit stores it. */
const linear = (c: PaletteColor) => new THREE.Color(PALETTE[c]);
/** Every distinct colour in a mesh's colour attribute, as hex. */
function colorsOf(mesh: THREE.Mesh, attribute = 'color'): Set<number> {
  const a = mesh.geometry.attributes[attribute];
  const out = new Set<number>();
  for (let i = 0; i < a.count; i++) out.add(new THREE.Color(a.getX(i), a.getY(i), a.getZ(i)).getHex());
  return out;
}

describe('createRoom', () => {
  it('is hidden until shown: nothing is added to the scene before the first look is shown', () => {
    const { stage, room } = setup();
    expect(looksIn(stage.scene)).toHaveLength(0);
    room.setShown(null);
    expect(looksIn(stage.scene)).toHaveLength(0);
    room.setShown('cafe');
    expect(stage.scene.getObjectByName('room-cafe')?.visible).toBe(true);
    room.setShown(null);
    expect(stage.scene.getObjectByName('room-cafe')?.visible).toBe(false);
    room.setShown('cafe');
    expect(stage.scene.children.filter((c) => c.name === 'room-cafe')).toHaveLength(1); // built once
    expect(looksIn(stage.scene)).toHaveLength(1); // the hospital look is not built until it is shown
  });

  it('shows only the look asked for, building each once: café, hospital, none, café', () => {
    const { stage, room } = setup();
    const visible = () => looksIn(stage.scene).filter((c) => c.visible).map((c) => c.name);
    room.setShown('cafe');
    expect(visible()).toEqual(['room-cafe']);
    room.setShown('hospital');
    expect(visible()).toEqual(['room-hospital']);
    room.setShown(null);
    expect(visible()).toEqual([]);
    room.setShown('cafe');
    expect(visible()).toEqual(['room-cafe']);
    room.setShown('hospital');
    expect(looksIn(stage.scene).map((c) => c.name).sort()).toEqual(['room-cafe', 'room-hospital']); // each built once
  });

  it('asks for a shadow update when it shows, hides or switches the look, and only then', () => {
    const { room, invalidateShadows } = setup();
    room.setShown(null); // already hidden
    expect(invalidateShadows).not.toHaveBeenCalled();
    room.setShown('cafe');
    expect(invalidateShadows).toHaveBeenCalledTimes(1);
    room.setShown('cafe');
    expect(invalidateShadows).toHaveBeenCalledTimes(1);
    room.setShown('hospital');
    expect(invalidateShadows).toHaveBeenCalledTimes(2);
    room.setShown('hospital');
    expect(invalidateShadows).toHaveBeenCalledTimes(2);
    room.setShown(null);
    expect(invalidateShadows).toHaveBeenCalledTimes(3);
    room.setShown('cafe');
    expect(invalidateShadows).toHaveBeenCalledTimes(4);
  });

  it('leaves the glass of every look out of override passes (the pretty tier\'s AO normals), like the moon', () => {
    const { stage, room } = setup();
    room.setShown('cafe');
    room.setShown('hospital');
    const panes: THREE.Object3D[] = [];
    stage.scene.traverse((o) => { if (o.name === 'room-glass') panes.push(o); });
    expect(panes).toHaveLength(2);
    const beforeRender = () => (stage.scene.onBeforeRender as (...a: unknown[]) => void)(null, stage.scene, null, null);
    stage.scene.overrideMaterial = new THREE.MeshNormalMaterial();
    beforeRender();
    expect(panes.map((p) => p.visible)).toEqual([false, false]);
    stage.scene.overrideMaterial = null;
    beforeRender();
    expect(panes.map((p) => p.visible)).toEqual([true, true]);
  });
});

/** Where a look's sign rises over the walls: on the +x side, over this stretch of z. */
const SIGN_Z: Record<RoomLook, [number, number]> = { cafe: [8, 9.5], hospital: [9.4, 10.6] };

describe.each(LOOKS)('the %s look', (look) => {
  it('is at most 3 meshes: the kit body, the kit glow (the lamps) and one glass mesh', () => {
    const { meshes, body, glow, glass } = shownRoom(look);
    expect(meshes.length).toBeLessThanOrEqual(3);
    expect(body).toBeDefined();
    expect(glow).toBeDefined();
    expect(glass).toBeDefined();
    expect(new Set([body, glow, glass]).size).toBe(3);
  });

  it('never takes a cell: every vertex of every mesh is outside the open square of the map', () => {
    const { meshes } = shownRoom(look);
    const eps = 1e-6;
    const inside = (v: number) => v > eps && v < GRID_SIZE - eps;
    const p = new THREE.Vector3();
    for (const mesh of meshes) {
      const pos = mesh.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        p.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
        if (inside(p.x) && inside(p.z)) expect.fail(`${mesh.name || 'mesh'} vertex (${p.x}, ${p.y}, ${p.z}) is inside the map`);
      }
    }
  });

  it('stands on the pavement and stays low: from y = -0.25 to about 1.3; only the sign by the door rises higher', () => {
    const { body } = shownRoom(look);
    const box = new THREE.Box3().setFromObject(body);
    expect(box.min.y).toBeCloseTo(SURROUND_FADE.y, 6);
    expect(ROOM.top).toBeGreaterThanOrEqual(1.2);
    expect(ROOM.top).toBeLessThanOrEqual(1.35);
    expect(box.max.y).toBeLessThan(2.2); // the sign
    // the walls themselves: nothing over 1.6 except near the sign by the door (on +x)
    const [z0, z1] = SIGN_Z[look];
    const pos = body.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      if (pos.getY(i) <= 1.6) continue;
      expect(pos.getX(i) > GRID_SIZE && pos.getZ(i) > z0 && pos.getZ(i) < z1, `high vertex at ${pos.getX(i)}, ${pos.getZ(i)}`).toBe(true);
    }
  });

  it('has a solid base up to at most 0.45 on every wall, and only see-through glass above it up to the top rail', () => {
    const { body, glass } = shownRoom(look);
    expect(ROOM.trimTop).toBeLessThanOrEqual(0.45);
    for (const wall of WALLS) for (const u of MID_PANES) {
      for (const y of [0.05, 0.2, 0.35]) expect(hits(body, wall.at(u, y), wall.dir, REACH), `${wall.name} base at ${u}, ${y}`).toBe(true);
      for (const y of [0.47, 0.6, 0.8, 1.0, 1.15]) {
        expect(hits(body, wall.at(u, y), wall.dir, REACH), `${wall.name} pane at ${u}, ${y}`).toBe(false);
        expect(hits(glass, wall.at(u, y), wall.dir, REACH), `${wall.name} glass at ${u}, ${y}`).toBe(true);
      }
      expect(hits(body, wall.at(u, 1.25), wall.dir, REACH), `${wall.name} top rail at ${u}`).toBe(true);
    }
  });

  it('leaves an open doorway on the +x wall: no base and no glass across z 9-11 up to the door head', () => {
    const { body, glass } = shownRoom(look);
    const front = WALLS[0];
    expect(ROOM.door).toMatchObject({ from: 9, to: 11 });
    for (const u of [9.25, 9.5, 9.75, 10, 10.25, 10.5, 10.75]) {
      for (const y of [0.12, 0.2, 0.3, 0.38, 0.6, 0.9]) {
        expect(hits(body, front.at(u, y), front.dir, REACH), `doorway at ${u}, ${y}`).toBe(false);
        expect(hits(glass, front.at(u, y), front.dir, REACH), `doorway glass at ${u}, ${y}`).toBe(false);
      }
    }
  });

  it('never hides the near edge cells from the default camera: at most a thin strip of each is covered', () => {
    const { body, glow } = shownRoom(look);
    const cells: Array<[number, number]> = [];
    for (let i = 0; i < GRID_SIZE; i++) cells.push([GRID_SIZE - 1, i], [i, GRID_SIZE - 1]); // the +x and +z rows
    let worst = 0;
    let corner = 0;
    for (const [cx, cz] of cells) {
      let hidden = 0;
      let all = 0;
      for (const fx of [0.125, 0.375, 0.625, 0.875]) for (const fz of [0.125, 0.375, 0.625, 0.875]) {
        all++;
        if (hiddenFromEye([body, glow], new THREE.Vector3(cx + fx, 0, cz + fz))) hidden++;
      }
      if (cx === cz) corner = hidden / all;
      else worst = Math.max(worst, hidden / all);
    }
    // the cap's inner edge covers the outer strip of a cell (a quarter of it at most); the corner cell has two strips
    expect(worst).toBeLessThanOrEqual(0.25);
    expect(corner).toBeLessThanOrEqual(0.45);
  });

  it('has glass that is see-through, writes no depth, casts no shadow and never glows', () => {
    const { glass } = shownRoom(look);
    const m = glass.material as THREE.MeshStandardMaterial;
    expect(m.transparent).toBe(true);
    expect(m.opacity).toBeGreaterThanOrEqual(0.25); // a tint you can see...
    expect(m.opacity).toBeLessThanOrEqual(0.4); // ...and see through
    expect(m.depthWrite).toBe(false);
    expect(m.side).toBe(THREE.DoubleSide);
    expect(glass.castShadow).toBe(false);
    expect(m.forceSinglePass).toBe(true); // one draw call, not a back pass and a front pass
    expect(m.emissive.getHex()).toBe(0);
    expect(m.emissiveMap).toBeNull();
    // tinted per vertex: the panes sky blue (read where a ray meets a pane clear of its glints), the glints lighter
    expect(m.vertexColors).toBe(true);
    expect(m.color.getHex()).toBe(0xffffff);
    const color = glass.geometry.attributes.color;
    const hit = new THREE.Raycaster(new THREE.Vector3(GRID_SIZE - 0.5, 0.8, 3.6), new THREE.Vector3(1, 0, 0), 0, 1).intersectObject(glass, false)[0];
    const { r, g, b } = faceColor(hit);
    expect(b).toBeGreaterThan(r);
    expect(b).toBeGreaterThan(g);
    for (let i = 0; i < color.count; i++) {
      expect(color.getX(i) + color.getY(i) + color.getZ(i)).toBeGreaterThanOrEqual(r + g + b - 1e-6); // nothing darker than the panes
    }
  });

  it('has lamps (the glow mesh) on top of the walls, never over the floor', () => {
    const { glow } = shownRoom(look);
    const box = new THREE.Box3().setFromObject(glow);
    expect(box.min.y).toBeGreaterThanOrEqual(ROOM.top - 0.02); // sitting on the cap (or the sign over it)
    expect(glow.geometry.attributes.glowColor).toBeDefined();
  });

  it('keeps triangles modest', () => {
    const { meshes } = shownRoom(look);
    const tris = meshes.reduce((n, m) => n + (m.geometry.index?.count ?? m.geometry.attributes.position.count) / 3, 0);
    expect(tris).toBeLessThan(12000);
  });
});

describe('the café look', () => {
  it('shows the open door from the default camera: both glass leaves and their brass push bars', () => {
    const { body, glow } = shownRoom('cafe');
    const { from, to, swing } = ROOM.door;
    const width = (to - from) / 2 - 0.05;
    for (const [hinge, dir] of [[from + 0.05, 1], [to - 0.05, -1]] as const) {
      const along = new THREE.Vector3(Math.sin(swing), 0, dir * Math.cos(swing));
      const across = new THREE.Vector3(-along.z, 0, along.x);
      const at = (a: number, y: number, n = 0) => new THREE.Vector3(GRID_SIZE + ROOM.thick, y, hinge).addScaledVector(along, a).addScaledVector(across, n);
      const glassPoints = [0.25, 0.45, 0.65].flatMap((a) => [0.15, 0.45, 0.75].map((y) => at(a, y)));
      const seen = glassPoints.filter((p) => !hiddenFromEye([body, glow], p)).length;
      expect(seen / glassPoints.length, `leaf at ${hinge}`).toBeGreaterThanOrEqual(0.7);
      // a push bar on each face: the one on the camera's side is in plain view
      const bars = [1, -1].map((side) => at(width - 0.16, 0.5, side * (0.03 + 0.06 + 0.028)));
      expect(bars.some((p) => !hiddenFromEye([body, glow], p, 0.03)), `push bar at ${hinge}`).toBe(true);
    }
  });

  it('is exactly the café room it was: the same vertices, colours and bounds in every mesh', () => {
    const { body, glow, glass } = shownRoom('cafe');
    /** Plain and position-weighted sums of an attribute: any vertex moved, added, dropped or recoloured changes them. */
    const sums = (m: THREE.Mesh, name: string) => {
      const a = m.geometry.attributes[name].array;
      let s = 0;
      let w = 0;
      for (let i = 0; i < a.length; i++) { s += a[i]; w += a[i] * ((i % 97) + 1); }
      return [s, w];
    };
    const bounds = (m: THREE.Mesh) => {
      const b = new THREE.Box3().setFromBufferAttribute(m.geometry.attributes.position as THREE.BufferAttribute);
      return [...b.min.toArray(), ...b.max.toArray()];
    };
    const near = (got: number[], want: number[], digits: number) => got.forEach((v, i) => expect(v).toBeCloseTo(want[i], digits));
    expect(body.geometry.attributes.position.count).toBe(17028);
    expect(glow.geometry.attributes.position.count).toBe(10788);
    expect(glass.geometry.attributes.position.count).toBe(804);
    expect(glass.geometry.index?.count).toBe(1206);
    near(bounds(body), [-0.34, -0.25, -0.34, 21.28, 2.0221, 20.4693], 3);
    near(bounds(glow), [-0.29, 1.3372, -0.29, 20.7325, 1.9168, 20.29], 3);
    near(bounds(glass), [-0.1, -0.06, -0.1, 21.0977, 1.22, 20.1], 3);
    near(sums(body, 'position'), [486059.148, 23810305.19], 1);
    near(sums(body, 'color'), [23169.465, 1136118.74], 1);
    near(sums(glow, 'position'), [233116.349, 11421748.9], 1);
    near(sums(glow, 'color'), [23906.133, 1170573.77], 1);
    near(sums(glow, 'glowColor'), [23777.958, 1164320.06], 1);
    near(sums(glass, 'position'), [16392.78, 799028.38], 1);
    near(sums(glass, 'color'), [2101.35, 102823.14], 1);
  });
});

describe('the hospital look', () => {
  it('is never the café: no red anywhere (no red cross), no warm bulbs, no brass; white walls with mint and teal', () => {
    const { body, glow } = shownRoom('hospital');
    const hexes = (cs: PaletteColor[]) => cs.map((c) => linear(c).getHex());
    const seen = new Set([...colorsOf(body), ...colorsOf(glow), ...colorsOf(glow, 'glowColor')]);
    for (const c of hexes(['red', 'redDark', 'lampWarm', 'windowWarm', 'brass', 'orange', 'pink', 'purple'])) expect(seen.has(c), `0x${c.toString(16)}`).toBe(false);
    for (const c of hexes(['white', 'mint', 'teal'])) expect(colorsOf(body).has(c) || colorsOf(glow).has(c), `0x${c.toString(16)}`).toBe(true);
  });

  it('has white walls with a mint band and a mint cap, seen from outside', () => {
    const { body } = shownRoom('hospital');
    const meet = (from: THREE.Vector3, dir: THREE.Vector3) => new THREE.Raycaster(from, dir, 0, 5).intersectObject(body, false)[0];
    // the +z wall from outside, mid-window between its hedges: the base is white above its band, mint low down
    const out = new THREE.Vector3(0, 0, -1);
    expect(faceColor(meet(new THREE.Vector3(9.5, 0.3, GRID_SIZE + 2), out)).getHex()).toBe(linear('white').getHex());
    expect(faceColor(meet(new THREE.Vector3(9.5, 0.05, GRID_SIZE + 2), out)).getHex()).toBe(linear('mint').getHex());
    // inside, the far walls the default camera looks at: the same band
    expect(faceColor(meet(new THREE.Vector3(5, 0.3, 5), new THREE.Vector3(0, 0, -1))).getHex()).toBe(linear('white').getHex());
    expect(faceColor(meet(new THREE.Vector3(5, 0.05, 5), new THREE.Vector3(-1, 0, 0))).getHex()).toBe(linear('mint').getHex());
    // the cap from above (between its lamps)
    expect(faceColor(meet(new THREE.Vector3(4, 3, GRID_SIZE + 0.05), new THREE.Vector3(0, -1, 0))).getHex()).toBe(linear('mint').getHex());
  });

  it('has its sliding glass doors standing open: slid aside onto the pavement side of the doorway, in plain view', () => {
    const { body, glow, glass } = shownRoom('hospital');
    const { from, to } = ROOM.door;
    for (const z of [from - 0.5, to + 0.5]) {
      // looking in from the pavement, the first glass met is the slid pane, outside the wall's outer face
      const hit = new THREE.Raycaster(new THREE.Vector3(GRID_SIZE + 3, 0.6, z), new THREE.Vector3(-1, 0, 0), 0, 5).intersectObject(glass, false)[0];
      expect(hit.point.x, `pane at ${z}`).toBeGreaterThan(GRID_SIZE + ROOM.thick);
      expect(hit.point.x, `pane at ${z}`).toBeLessThan(GRID_SIZE + 0.5);
      // and the default camera sees most of it
      const points = [-0.3, 0, 0.3].flatMap((dz) => [0.2, 0.5, 0.8].map((y) => new THREE.Vector3(hit.point.x, y, z + dz)));
      const seen = points.filter((p) => !hiddenFromEye([body, glow], p)).length;
      expect(seen / points.length, `pane at ${z}`).toBeGreaterThanOrEqual(0.7);
    }
  });

  it('has a heart-and-plus sign over the doors facing the default camera: a teal heart with a white plus on a white disc in a teal rim', () => {
    const { body, glow } = shownRoom('hospital');
    const { u, o, y, r, tilt } = HOSPITAL_SIGN;
    expect(u).toBeGreaterThan(ROOM.door.from);
    expect(u).toBeLessThan(ROOM.door.to);
    // a point on the sign's face, `v` up it and `s` across it from its centre (as room.ts lays it out)
    const face = (s: number, v: number) => new THREE.Vector3(GRID_SIZE + o + s, y + v * Math.cos(tilt) + 0.07 * Math.sin(tilt), u - v * Math.sin(tilt) + 0.07 * Math.cos(tilt));
    const seenAt = (s: number, v: number) => firstSeen([body, glow], face(s, v), -0.2)!;
    const seen = (s: number, v: number) => ({ mesh: seenAt(s, v).object === glow ? 'glow' : 'body', color: faceColor(seenAt(s, v)).getHex() });
    // the plus in the middle of the heart glows at night; the heart round it and the disc stay unlit (a crisp teal shape on white)
    expect(seen(0, 0.01)).toEqual({ mesh: 'glow', color: linear('white').getHex() });
    for (const [s, v] of [[0.09, 0.07], [-0.09, 0.07], [0, -0.1]]) expect(seen(s, v), `heart at ${s}, ${v}`).toEqual({ mesh: 'body', color: linear('teal').getHex() });
    expect(seen(0, -r + 0.06)).toEqual({ mesh: 'body', color: linear('white').getHex() });
    // the rim round the disc glows teal: a thin lit ring (seen at its sides; its stem stands under it)
    for (const s of [-1, 1]) expect(seen(s * (r + HOSPITAL_SIGN.rim / 2), 0)).toEqual({ mesh: 'glow', color: linear('teal').getHex() });
  });

  it('has a step and a grey mat outside the doors, and a blue line on the pavement leading to them', () => {
    const { body } = shownRoom('hospital');
    const down = new THREE.Vector3(0, -1, 0);
    const top = (x: number, z: number) => new THREE.Raycaster(new THREE.Vector3(x, 3, z), down, 0, 5).intersectObject(body, false)[0];
    const mid = (ROOM.door.from + ROOM.door.to) / 2;
    const mat = top(GRID_SIZE + 1.3, mid);
    expect(mat.point.y).toBeLessThan(SURROUND_FADE.y + 0.05);
    expect(['stone', 'stoneDark', 'charcoal'].map((c) => linear(c as PaletteColor).getHex())).toContain(faceColor(mat).getHex());
    const line = top(GRID_SIZE + 3, mid);
    expect(line.point.y).toBeLessThan(SURROUND_FADE.y + 0.03);
    expect(faceColor(line).getHex()).toBe(linear('blue').getHex());
  });

  it('has small round cool lamps on the cap, never warm bulbs', () => {
    const { glow } = shownRoom('hospital');
    const cool = new Set([linear('glassBlue').getHex(), linear('white').getHex(), linear('teal').getHex()]);
    for (const c of colorsOf(glow, 'glowColor')) expect(cool.has(c), `0x${c.toString(16)}`).toBe(true);
    // a lamp on the cap of every wall
    const down = new THREE.Vector3(0, -1, 0);
    const lampOn = (x: number, z: number) => new THREE.Raycaster(new THREE.Vector3(x, 3, z), down, 0, 3).intersectObject(glow, false).length > 0;
    const c = ROOM.thick * 0.8;
    expect(lampOn(GRID_SIZE + c, 3)).toBe(true);
    expect(lampOn(-c, 3)).toBe(true);
    expect(lampOn(3, GRID_SIZE + c)).toBe(true);
    expect(lampOn(3, -c)).toBe(true);
  });
});
