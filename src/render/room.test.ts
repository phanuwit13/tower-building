import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { GRID_SIZE } from '../game/types';
import { getStyleKit } from '../models/kit';
import { SURROUND_FADE } from './ground';
import { createRoom, ROOM } from './room';
import { CAMERA, type Stage } from './stage';

const kit = getStyleKit();

function setup() {
  const invalidateShadows = vi.fn();
  const stage = { scene: new THREE.Scene(), invalidateShadows } as unknown as Stage;
  return { stage, invalidateShadows, room: createRoom(stage, kit) };
}

/** The room shown once: its root and its meshes (body, glow, glass). */
function shownRoom() {
  const { stage, room } = setup();
  room.setShown(true);
  const root = stage.scene.getObjectByName('room')!;
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
/** Mid-pane: clear of the posts (even u) and the mullions (odd u), and of the doorway (z 9-11 on +x). */
const MID_PANES = [0.5, 1.5, 2.5, 3.5, 5.5, 6.5, 13.5, 14.5, 16.5, 18.5, 19.5];

/** The stage's default camera (stage.ts CAMERA): where kids first see the room from. */
const EYE = new THREE.Vector3(GRID_SIZE / 2, 0, GRID_SIZE / 2).addScaledVector(CAMERA.direction, CAMERA.distance);
/** Whether `target` is hidden from the default camera by any of `meshes` (a hit nearer than it by more than `slack`). */
function hiddenFromEye(meshes: THREE.Mesh[], target: THREE.Vector3, slack = 0.01): boolean {
  const toTarget = target.clone().sub(EYE);
  const ray = new THREE.Raycaster(EYE, toTarget.clone().normalize(), 0, toTarget.length() - slack);
  ray.params.Mesh = {};
  for (const m of meshes) (m.material as THREE.Material).side = THREE.DoubleSide; // any face counts as cover
  return ray.intersectObjects(meshes, false).length > 0;
}

describe('createRoom', () => {
  it('is hidden until shown: nothing is added to the scene before the first setShown(true)', () => {
    const { stage, room } = setup();
    expect(stage.scene.getObjectByName('room')).toBeUndefined();
    room.setShown(false);
    expect(stage.scene.getObjectByName('room')).toBeUndefined();
    room.setShown(true);
    expect(stage.scene.getObjectByName('room')?.visible).toBe(true);
    room.setShown(false);
    expect(stage.scene.getObjectByName('room')?.visible).toBe(false);
    room.setShown(true);
    expect(stage.scene.children.filter((c) => c.name === 'room')).toHaveLength(1); // built once
  });

  it('asks for a shadow update when it shows or hides, and only then', () => {
    const { room, invalidateShadows } = setup();
    room.setShown(false); // already hidden
    expect(invalidateShadows).not.toHaveBeenCalled();
    room.setShown(true);
    expect(invalidateShadows).toHaveBeenCalledTimes(1);
    room.setShown(true);
    expect(invalidateShadows).toHaveBeenCalledTimes(1);
    room.setShown(false);
    expect(invalidateShadows).toHaveBeenCalledTimes(2);
  });

  it('is at most 3 meshes: the kit body, the kit glow (the lamps) and one glass mesh', () => {
    const { meshes, body, glow, glass } = shownRoom();
    expect(meshes.length).toBeLessThanOrEqual(3);
    expect(body).toBeDefined();
    expect(glow).toBeDefined();
    expect(glass).toBeDefined();
    expect(new Set([body, glow, glass]).size).toBe(3);
  });

  it('never takes a cell: every vertex of every mesh is outside the open square of the map', () => {
    const { meshes } = shownRoom();
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
    const { body } = shownRoom();
    const box = new THREE.Box3().setFromObject(body);
    expect(box.min.y).toBeCloseTo(SURROUND_FADE.y, 6);
    expect(ROOM.top).toBeGreaterThanOrEqual(1.2);
    expect(ROOM.top).toBeLessThanOrEqual(1.35);
    expect(box.max.y).toBeLessThan(2.2); // the sign
    // the walls themselves: nothing over 1.6 except near the sign by the door (z 8-9.5 on +x)
    const pos = body.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      if (pos.getY(i) <= 1.6) continue;
      expect(pos.getX(i) > GRID_SIZE && pos.getZ(i) > 8 && pos.getZ(i) < 9.5, `high vertex at ${pos.getX(i)}, ${pos.getZ(i)}`).toBe(true);
    }
  });

  it('has a solid base up to at most 0.45 on every wall, and only see-through glass above it up to the top rail', () => {
    const { body, glass } = shownRoom();
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
    const { body, glass } = shownRoom();
    const front = WALLS[0];
    expect(ROOM.door).toMatchObject({ from: 9, to: 11 });
    for (const u of [9.25, 9.5, 9.75, 10, 10.25, 10.5, 10.75]) {
      for (const y of [0.12, 0.2, 0.3, 0.38, 0.6, 0.9]) {
        expect(hits(body, front.at(u, y), front.dir, REACH), `doorway at ${u}, ${y}`).toBe(false);
        expect(hits(glass, front.at(u, y), front.dir, REACH), `doorway glass at ${u}, ${y}`).toBe(false);
      }
    }
  });

  it('shows the open door from the default camera: both glass leaves and their brass push bars', () => {
    const { body, glow } = shownRoom();
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

  it('never hides the near edge cells from the default camera: at most a thin strip of each is covered', () => {
    const { body, glow } = shownRoom();
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
    const { glass } = shownRoom();
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
    const [r, g, b] = [color.getX(hit.face!.a), color.getY(hit.face!.a), color.getZ(hit.face!.a)];
    expect(b).toBeGreaterThan(r);
    expect(b).toBeGreaterThan(g);
    for (let i = 0; i < color.count; i++) {
      expect(color.getX(i) + color.getY(i) + color.getZ(i)).toBeGreaterThanOrEqual(r + g + b - 1e-6); // nothing darker than the panes
    }
  });

  it('leaves the glass out of override passes (the pretty tier\'s AO normals), like the moon', () => {
    const { stage, glass } = shownRoom();
    const beforeRender = () => (stage.scene.onBeforeRender as (...a: unknown[]) => void)(null, stage.scene, null, null);
    stage.scene.overrideMaterial = new THREE.MeshNormalMaterial();
    beforeRender();
    expect(glass.visible).toBe(false);
    stage.scene.overrideMaterial = null;
    beforeRender();
    expect(glass.visible).toBe(true);
  });

  it('has lamps (the glow mesh) on top of the walls, never over the floor', () => {
    const { glow } = shownRoom();
    const box = new THREE.Box3().setFromObject(glow);
    expect(box.min.y).toBeGreaterThanOrEqual(ROOM.top - 0.02); // sitting on the cap (or the sign over it)
    expect(glow.geometry.attributes.glowColor).toBeDefined();
  });

  it('keeps triangles modest', () => {
    const { meshes } = shownRoom();
    const tris = meshes.reduce((n, m) => n + (m.geometry.index?.count ?? m.geometry.attributes.position.count) / 3, 0);
    expect(tris).toBeLessThan(12000);
  });
});
