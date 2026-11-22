import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../models/kit';
import { school } from '../themes/school';
import { GRID_SIZE, type Placement, type Rotation } from '../game/types';
import { CHUNK_TILES, CHUNKS_PER_SIDE, chunkOf, createBatch, mergeItems, placementMatrix, planBatch, type BatchItem } from './batch';
import { placementTransform } from './city';

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

  it('keeps the kit attributes: body = position/normal/color, glow adds glowColor; normals turn with the item', () => {
    expect(Object.keys(merged.body!.attributes).sort()).toEqual(['color', 'normal', 'position']);
    expect(Object.keys(merged.glow!.attributes).sort()).toEqual(['color', 'glowColor', 'normal', 'position']);
    const n = merged.body!.attributes.normal;
    for (let i = 0; i < n.count; i += 97) expect(Math.hypot(n.getX(i), n.getY(i), n.getZ(i))).toBeCloseTo(1, 5);
  });

  it('appends to an earlier merge without touching it', () => {
    const first = mergeItems(items.slice(0, 1), materials);
    const both = mergeItems(items.slice(1), materials, first);
    expect(Array.from(both.body!.attributes.position.array)).toEqual(Array.from(merged.body!.attributes.position.array));
    expect(first.body!.attributes.position.count).toBeLessThan(both.body!.attributes.position.count);
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
