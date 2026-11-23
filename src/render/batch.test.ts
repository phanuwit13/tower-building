import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../models/kit';
import { school } from '../themes/school';
import { GRID_SIZE, type Placement, type Rotation } from '../game/types';
import { CHUNK_TILES, CHUNKS_PER_SIDE, chunkOf, createBatch, mergeItems, placementMatrix, planBatch, type BatchItem } from './batch';
import { placementTransform } from './city';
import { ANIM_STEP, CULL_MARGIN, LIGHT_STRIDE, MOTION_ATTRIBUTES, MOTION_CODE, MOTION_LIMITS, readMotion } from '../models/motion';
import type { ItemModel } from '../models/contract';
import type { Vec3 } from '../models/kit';

const kit = getStyleKit();
const { materials } = kit;
const item = (id: string) => school.items.find((i) => i.id === id)!;
const pl = (uid: number, itemId = 'tree', x = 0, z = 0, rotation: Rotation = 0): Placement => ({ uid, itemId, x, z, rotation });

describe('chunkOf', () => {
  it('splits the map into square chunks of CHUNK_TILES tiles, indexed row by row', () => {
    expect(CHUNKS_PER_SIDE * CHUNK_TILES).toBe(GRID_SIZE);
    expect(chunkOf({ w: 1, d: 1 }, 0, 0, 0)).toBe(0);
    expect(chunkOf({ w: 1, d: 1 }, CHUNK_TILES, 0, 0)).toBe(1);
    expect(chunkOf({ w: 1, d: 1 }, 0, CHUNK_TILES, 0)).toBe(CHUNKS_PER_SIDE);
    expect(chunkOf({ w: 1, d: 1 }, GRID_SIZE - 1, GRID_SIZE - 1, 0)).toBe(CHUNKS_PER_SIDE ** 2 - 1);
  });

  it('puts an item that straddles a chunk edge in the chunk under its footprint centre', () => {
    const edge = CHUNK_TILES;
    expect(chunkOf({ w: 2, d: 2 }, edge - 1, 0, 0)).toBe(1); // centre exactly on the edge: the next chunk
    expect(chunkOf({ w: 2, d: 3 }, edge - 1, 0, 0)).toBe(1);
    expect(chunkOf({ w: 1, d: 2 }, edge - 1, 0, 0)).toBe(0); // centre half a tile before the edge
    // the same item turned a quarter covers 3 x 2 tiles: its centre moves along x
    expect(chunkOf({ w: 2, d: 3 }, edge - 2, 0, 1)).toBe(0);
    expect(chunkOf({ w: 2, d: 3 }, edge - 1, 0, 1)).toBe(1);
  });
});

describe('planBatch', () => {
  const a = [pl(1), pl(2, 'bench', 3, 4, 1)];
  it('keeps the batch when nothing changed, by reference or by value (a reloaded save)', () => {
    expect(planBatch(a, a)).toEqual({ kind: 'same' });
    expect(planBatch(a, a.map((p) => ({ ...p })))).toEqual({ kind: 'same' });
  });
  it('appends new placements when the shown ones are an unchanged prefix', () => {
    const b = [...a, pl(3, 'slide', 8, 8, 2)];
    expect(planBatch(a, b)).toEqual({ kind: 'append', added: [b[2]] });
    expect(planBatch([], a)).toEqual({ kind: 'append', added: a });
  });
  it('rebuilds after a restart, a clear or any other change', () => {
    expect(planBatch(a, [])).toEqual({ kind: 'rebuild' });
    expect(planBatch(a, [pl(1)])).toEqual({ kind: 'rebuild' });
    expect(planBatch(a, [pl(1), pl(2, 'bench', 3, 4, 3)])).toEqual({ kind: 'rebuild' });
    expect(planBatch(a, [pl(1, 'bench'), a[1], pl(3)])).toEqual({ kind: 'rebuild' }); // restart re-uses uid 1
  });
});

/** World-space positions of every mesh using `material` in an object, in traversal order (what the old clones drew). */
function worldPositions(o: THREE.Object3D, material: THREE.Material): number[] {
  o.updateMatrixWorld(true);
  const out: number[] = [];
  o.traverse((m) => {
    if (!(m instanceof THREE.Mesh) || m.material !== material) return;
    const g = (m.geometry as THREE.BufferGeometry).clone().applyMatrix4(m.matrixWorld);
    out.push(...g.attributes.position.array);
  });
  return out;
}

function placedClone(id: string, x: number, z: number, r: Rotation): THREE.Object3D {
  const it = item(id);
  const o = it.build(kit);
  const t = placementTransform(it.footprint, x, z, r);
  o.position.set(t.x, t.y, t.z);
  o.rotation.y = t.rotY;
  return o;
}

describe('mergeItems', () => {
  const spots: Array<[string, number, number, Rotation]> = [['classroom', 0, 0, 1], ['street-lamp', 5, 2, 0], ['bench', 7, 7, 3]];
  const items: BatchItem[] = spots.map(([id, x, z, r]) => ({ model: item(id).build(kit), matrix: placementMatrix(item(id).footprint, x, z, r) }));
  const merged = mergeItems(items, materials);

  it('draws exactly what the placed clones drew: same world positions, body and glow apart', () => {
    for (const [mat, geo] of [[materials.body, merged.body], [materials.glow, merged.glow]] as const) {
      const expected = spots.flatMap(([id, x, z, r]) => worldPositions(placedClone(id, x, z, r), mat));
      expect(geo).not.toBeNull();
      const got = Array.from(geo!.attributes.position.array);
      expect(got).toHaveLength(expected.length);
      got.forEach((v, i) => expect(v).toBeCloseTo(expected[i], 4));
    }
  });

  it('keeps the kit attributes: body = position/normal/color/anim/pivot/axis, glow adds glowColor; normals turn with the item', () => {
    expect(Object.keys(merged.body!.attributes).sort()).toEqual(['anim', 'axis', 'color', 'normal', 'pivot', 'position']);
    expect(Object.keys(merged.glow!.attributes).sort()).toEqual(['anim', 'axis', 'color', 'glowColor', 'normal', 'pivot', 'position']);
    const n = merged.body!.attributes.normal;
    for (let i = 0; i < n.count; i += 97) expect(Math.hypot(n.getX(i), n.getY(i), n.getZ(i))).toBeCloseTo(1, 5);
  });

  it('appends to an earlier merge without touching it', () => {
    const first = mergeItems(items.slice(0, 1), materials);
    const both = mergeItems(items.slice(1), materials, first);
    expect(Array.from(both.body!.attributes.position.array)).toEqual(Array.from(merged.body!.attributes.position.array));
    expect(first.body!.attributes.position.count).toBeLessThan(both.body!.attributes.position.count);
  });

  it('pads each merged bounding sphere by the culling margin, so swaying edges never pop', () => {
    for (const geo of [merged.body!, merged.glow!]) {
      const exact = new THREE.BufferGeometry().setAttribute('position', geo.attributes.position);
      exact.computeBoundingSphere();
      expect(geo.boundingSphere!.center.distanceTo(exact.boundingSphere!.center)).toBeCloseTo(0, 6);
      expect(geo.boundingSphere!.radius).toBeCloseTo(exact.boundingSphere!.radius + CULL_MARGIN, 6);
    }
  });

  it('never disposes the prototype geometry it reads', () => {
    const model = item('tree').build(kit);
    let disposed = 0;
    model.traverse((m) => { if (m instanceof THREE.Mesh) m.geometry.addEventListener('dispose', () => disposed++); });
    mergeItems([{ model, matrix: new THREE.Matrix4() }], materials);
    expect(disposed).toBe(0);
  });
});

describe('createBatch', () => {
  const model = (id: string) => item(id).build(kit);
  const at = (id: string, x: number, z: number): BatchItem => ({ model: model(id), matrix: placementMatrix(item(id).footprint, x, z, 0) });

  it('draws N items as one body and at most one glow mesh per chunk', () => {
    const parent = new THREE.Group();
    const batch = createBatch(parent, materials);
    batch.add(0, [at('tree', 0, 0), at('street-lamp', 2, 0), at('classroom', 4, 4), at('bench', 1, 6)]);
    batch.add(3, [at('tree', 15, 15), at('tree', 17, 12)]); // trees: body only
    const meshes = parent.children.filter((c): c is THREE.Mesh => c instanceof THREE.Mesh);
    expect(meshes).toHaveLength(3);
    expect(meshes.filter((m) => m.material === materials.glow)).toHaveLength(1);
    for (const m of meshes) {
      expect(m.castShadow && m.receiveShadow).toBe(true);
      expect(m.geometry.boundingSphere).not.toBeNull();
    }
  });

  it('a later add re-merges only its own chunk and disposes the geometry it replaces; clear disposes the rest', () => {
    const parent = new THREE.Group();
    const batch = createBatch(parent, materials);
    batch.add(0, [at('tree', 0, 0)]);
    batch.add(1, [at('tree', 12, 0)]);
    const [chunk0, chunk1] = parent.children as THREE.Mesh[];
    const old0 = chunk0.geometry;
    const old1 = chunk1.geometry;
    let disposed0 = 0;
    let disposed1 = 0;
    old0.addEventListener('dispose', () => disposed0++);
    old1.addEventListener('dispose', () => disposed1++);
    batch.add(0, [at('bench', 3, 3)]);
    expect(disposed0).toBe(1);
    expect(disposed1).toBe(0);
    expect(chunk1.geometry).toBe(old1);
    expect(chunk0.geometry.attributes.position.count).toBeGreaterThan(old0.attributes.position.count);
    batch.clear();
    expect(disposed1).toBe(1);
    expect(parent.children).toHaveLength(0);
  });
});

describe('mergeItems with animated items', () => {
  /** A 1 x 1 test item: a still trunk, a swaying crown and a glowing lamp that swings about x from (0.2, 1, 0). */
  const animated: ItemModel = {
    id: 'test-animated', name: 'test', category: 'nature', footprint: { w: 1, d: 1 },
    build: (k) => k.finish([
      k.cylinder(0.05, 0.05, 1, [0, 0.5, 0], 'bark'),
      k.sphere(0.3, [0, 1.2, 0], 'leaf', { motion: { kind: 'sway', pivot: [0, 1, 0] } }),
      k.box([0.1, 0.1, 0.1], [0.2, 0.8, 0], 'lampWarm', { glow: true, motion: { kind: 'swing', pivot: [0.2, 1, 0], axis: [1, 0, 0] } }),
    ]),
  };
  const at = (it: ItemModel, x: number, z: number, r: Rotation): BatchItem => ({ model: it.build(kit), matrix: placementMatrix(it.footprint, x, z, r) });
  /** Distinct [anim kind, pivot, axis] rows of a merged geometry (unpacked, as the shader sees them), rounded. */
  const rows = (g: THREE.BufferGeometry) => {
    const out = new Map<string, { kind: number; pivot: number[]; axis: number[] }>();
    for (let i = 0; i < g.attributes.position.count; i++) {
      const m = readMotion(g, i);
      const r = (v: number) => +v.toFixed(5) + 0; // + 0: no -0
      const row = { kind: m.anim[0], pivot: m.pivot.map(r), axis: m.axis.map(r) };
      out.set(JSON.stringify(row), row);
    }
    return [...out.values()];
  };
  const degrees = (a: readonly number[], b: THREE.Vector3) =>
    new THREE.Vector3(a[0], a[1], a[2]).angleTo(b) * (180 / Math.PI);

  it('merges still and animated items into one chunk without a mismatch', () => {
    const m = mergeItems([at(item('bench'), 0, 0, 0), at(animated, 3, 3, 0), at(item('street-lamp'), 5, 2, 0), at(item('tree'), 7, 7, 3)], materials);
    expect(m.body).not.toBeNull();
    expect(m.glow).not.toBeNull();
    const kinds = new Set(rows(m.body!).map((r) => r.kind));
    expect([...kinds].sort()).toEqual([0, MOTION_CODE.sway]);
    // anim.x also packs the light pattern (street-lamp breathes): the motion kind is the remainder
    expect(new Set(rows(m.glow!).map((r) => r.kind % LIGHT_STRIDE))).toEqual(new Set([0, MOTION_CODE.swing]));
  });

  it('moves the pivot like a position and turns the axis like a direction (normalised) with the placement', () => {
    for (const r of [0, 1, 2, 3] as const) {
      const matrix = placementMatrix(animated.footprint, 4, 6, r);
      const m = mergeItems([{ model: animated.build(kit), matrix }], materials);
      const swing = rows(m.glow!).find((row) => row.kind === MOTION_CODE.swing)!;
      const wantPivot = new THREE.Vector3(0.2, 1, 0).applyMatrix4(matrix);
      const wantAxis = new THREE.Vector3(1, 0, 0).transformDirection(matrix);
      swing.pivot.forEach((v, i) => expect(v).toBeCloseTo(wantPivot.getComponent(i), 4));
      swing.axis.forEach((v, i) => expect(v).toBeCloseTo(wantAxis.getComponent(i), 4)); // a quarter turn keeps x exact
      expect(Math.hypot(...swing.axis)).toBeCloseTo(1, 5);
      const sway = rows(m.body!).find((row) => row.kind === MOTION_CODE.sway)!;
      expect(sway.axis).toEqual([0, 1, 0]); // straight up stays up under a turn about y
      const wantSway = new THREE.Vector3(0, 1, 0).applyMatrix4(matrix);
      sway.pivot.forEach((v, i) => expect(v).toBeCloseTo(wantSway.getComponent(i), 4));
    }
  });

  it('keeps the packed storage through a merge (the merged attributes are what the material reads)', () => {
    const m = mergeItems([at(animated, 4, 6, 1), at(item('street-lamp'), 5, 2, 3)], materials);
    for (const g of [m.body!, m.glow!]) {
      for (const name of ['anim', 'pivot', 'axis'] as const) {
        const a = g.attributes[name] as THREE.BufferAttribute;
        expect(a.array, name).toBeInstanceOf(MOTION_ATTRIBUTES[name].array);
        expect([a.itemSize, a.normalized], name).toEqual([MOTION_ATTRIBUTES[name].itemSize, MOTION_ATTRIBUTES[name].normalized]);
      }
    }
  });

  it('a pivot anywhere on the map lands within 1 mm, and a slanted axis within 1° of exact, in every turn', () => {
    const slanted: Vec3 = [0.3, 0.8, -0.52]; // not along any axis: the packed direction is not exact
    const reach: ItemModel = {
      id: 'test-reach', name: 'reach', category: 'nature', footprint: { w: 1, d: 1 },
      build: (k) => k.finish([k.box([0.1, 0.1, 0.1], [0.45, 4.9, -0.45], 'red', {
        motion: { kind: 'swing', pivot: [0.5, 5, -0.5], axis: slanted, amount: MOTION_LIMITS.amount, speed: -MOTION_LIMITS.speed, phase: MOTION_LIMITS.phase },
      })]),
    };
    for (const [x, z] of [[0, 0], [GRID_SIZE - 1, GRID_SIZE - 1], [0, GRID_SIZE - 1], [GRID_SIZE - 1, 0]]) {
      for (const r of [0, 1, 2, 3] as const) {
        const matrix = placementMatrix(reach.footprint, x, z, r);
        const g = mergeItems([{ model: reach.build(kit), matrix }], materials).body!;
        const m = readMotion(g, 0);
        const wantPivot = new THREE.Vector3(0.5, 5, -0.5).applyMatrix4(matrix);
        expect(new THREE.Vector3(...m.pivot).distanceTo(wantPivot), `${x},${z} r${r}`).toBeLessThan(0.001);
        expect(degrees(m.axis, new THREE.Vector3(...slanted).normalize().transformDirection(matrix)), `${x},${z} r${r}`).toBeLessThan(1);
        expect(m.anim[0]).toBe(MOTION_CODE.swing);
        expect(Math.abs(m.anim[1] - MOTION_LIMITS.amount)).toBeLessThanOrEqual(ANIM_STEP[1] / 2);
        expect(Math.abs(m.anim[2] + MOTION_LIMITS.speed)).toBeLessThanOrEqual(ANIM_STEP[2] / 2);
        expect(Math.abs(m.anim[3] - MOTION_LIMITS.phase)).toBeLessThanOrEqual(ANIM_STEP[3] / 2);
      }
    }
  });

  it('a quarter turn really turns the swing axis: x becomes -z or z', () => {
    const m = mergeItems([at(animated, 4, 6, 1)], materials);
    const axis = rows(m.glow!).find((row) => row.kind === MOTION_CODE.swing)!.axis;
    expect(Math.abs(axis[0])).toBeCloseTo(0, 5);
    expect(Math.abs(axis[2])).toBeCloseTo(1, 5);
  });

  it('still parts stay still: kind 0 and a zero axis; their pivot (the item origin) lands on the item in the world', () => {
    const matrix = placementMatrix(item('bench').footprint, 8, 8, 1);
    const m = mergeItems([{ model: item('bench').build(kit), matrix }], materials);
    const origin = new THREE.Vector3().applyMatrix4(matrix);
    expect(rows(m.body!)).toEqual([{ kind: 0, pivot: origin.toArray().map((v) => +v.toFixed(5) + 0), axis: [0, 0, 0] }]);
  });
});
