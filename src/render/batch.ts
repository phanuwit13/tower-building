import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { rotatedFootprint } from '../game/grid';
import { GRID_SIZE, type Footprint, type Placement, type Rotation } from '../game/types';
import { CULL_MARGIN } from '../models/motion';

/**
 * Static batching of placed items. Placed items never move, so each square chunk of the map
 * draws all of its items as one merged body mesh and one merged glow mesh (the two kit
 * materials, shared): a full map is at most 2 x CHUNKS_PER_SIDE² draw calls however many items
 * it holds. A placement re-merges only its own chunk.
 *
 * 10 x 10-tile chunks (4 on the 20 x 20 map): at most 8 city draw calls, and the slowest
 * re-merge (the last item into a full chunk) stays a few ms (see the Task 17 report).
 */
export const CHUNK_TILES = 10;
export const CHUNKS_PER_SIDE = Math.ceil(GRID_SIZE / CHUNK_TILES);

/** The chunk under the centre of a placement's rotated footprint; chunks are numbered row by row (z, then x). */
export function chunkOf(fp: Footprint, x: number, z: number, r: Rotation): number {
  const { w, d } = rotatedFootprint(fp, r);
  const cell = (v: number) => Math.min(CHUNKS_PER_SIDE - 1, Math.max(0, Math.floor(v / CHUNK_TILES)));
  return cell(z + d / 2) * CHUNKS_PER_SIDE + cell(x + w / 2);
}

export type BatchPlan = { kind: 'same' } | { kind: 'append'; added: readonly Placement[] } | { kind: 'rebuild' };

const samePlacement = (a: Placement, b: Placement): boolean =>
  a === b || (a.uid === b.uid && a.itemId === b.itemId && a.x === b.x && a.z === b.z && a.rotation === b.rotation);

/**
 * How to get from the placements the batch shows to the game's: nothing, merge the new ones in
 * (a placement: the shown list is an unchanged prefix), or start over (restart, clear, load).
 */
export function planBatch(shown: readonly Placement[], next: readonly Placement[]): BatchPlan {
  if (next === shown) return { kind: 'same' };
  if (next.length < shown.length || !shown.every((p, i) => samePlacement(p, next[i]))) return { kind: 'rebuild' };
  return next.length === shown.length ? { kind: 'same' } : { kind: 'append', added: next.slice(shown.length) };
}

/** World transform of an item whose rotated footprint's min-corner tile is (x, z). Models are centred on the footprint. */
export function placementTransform(fp: Footprint, x: number, z: number, r: Rotation): { x: number; y: number; z: number; rotY: number } {
  const { w, d } = rotatedFootprint(fp, r);
  return { x: x + w / 2, y: 0, z: z + d / 2, rotY: -r * (Math.PI / 2) };
}

/** World matrix of a placed item, the same transform a placed clone used to get (see placementTransform). */
export function placementMatrix(fp: Footprint, x: number, z: number, r: Rotation): THREE.Matrix4 {
  const t = placementTransform(fp, x, z, r);
  return new THREE.Matrix4().makeRotationY(t.rotY).setPosition(t.x, t.y, t.z);
}

/** An item to batch: its built model (a shared prototype, only read) and where it stands. */
export interface BatchItem { model: THREE.Object3D; matrix: THREE.Matrix4 }
export interface Merged { body: THREE.BufferGeometry | null; glow: THREE.BufferGeometry | null }
export interface KitMaterials { body: THREE.Material; glow: THREE.Material }

/**
 * Merge items into world-space body and glow geometries, after `base` (an earlier merge, left
 * as it is) when given. Each mesh's geometry is cloned and moved into place, normals included,
 * and so are the motion attributes: `pivot` moves like a position, `axis` turns like a direction
 * (kept unit length). The prototypes' own geometry is never changed or disposed. Body and glow
 * stay apart: they have different attributes (glow adds glowColor) and materials.
 */
export function mergeItems(items: readonly BatchItem[], materials: KitMaterials, base?: Merged): Merged {
  const parts: Record<keyof Merged, THREE.BufferGeometry[]> = { body: [], glow: [] };
  const world = new THREE.Matrix4();
  for (const { model, matrix } of items) {
    model.updateMatrixWorld(true);
    model.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      const kind = o.material === materials.body ? 'body' : o.material === materials.glow ? 'glow' : null;
      if (!kind) throw new Error(`city batch: mesh "${o.name}" does not use a kit material`);
      const g = (o.geometry as THREE.BufferGeometry).clone().applyMatrix4(world.multiplyMatrices(matrix, o.matrixWorld));
      g.attributes.pivot?.applyMatrix4(world);
      g.attributes.axis?.transformDirection(world);
      parts[kind].push(g);
    });
  }
  const merge = (kind: keyof Merged): THREE.BufferGeometry | null => {
    const prev = base?.[kind] ?? null;
    const list = parts[kind];
    if (list.length === 0) return prev;
    const merged = mergeGeometries(prev ? [prev, ...list] : list, false);
    for (const g of list) g.dispose();
    if (!merged) throw new Error(`city batch: merging the ${kind} geometry failed`);
    // For frustum culling (view and sun), once per merge; padded so a sway near an edge never pops.
    merged.computeBoundingSphere();
    merged.boundingSphere!.radius += CULL_MARGIN;
    return merged;
  };
  return { body: merge('body'), glow: merge('glow') };
}

export interface Batch {
  /** Merge items into a chunk's meshes; only that chunk is re-merged. */
  add(chunk: number, items: readonly BatchItem[]): void;
  /** Remove every merged mesh and free its geometry. */
  clear(): void;
}

/**
 * The merged meshes under `parent`, one body and one glow mesh per chunk that has any. A
 * geometry that a re-merge replaces is disposed at once (frees its GPU buffers); the kit
 * materials are shared and never disposed here.
 */
export function createBatch(parent: THREE.Object3D, materials: KitMaterials): Batch {
  const chunks = new Map<number, { body: THREE.Mesh | null; glow: THREE.Mesh | null }>();

  const place = (chunk: number, kind: keyof Merged, geometry: THREE.BufferGeometry | null, mesh: THREE.Mesh | null): THREE.Mesh | null => {
    if (!geometry) return mesh;
    if (mesh) {
      if (mesh.geometry !== geometry) mesh.geometry.dispose();
      mesh.geometry = geometry;
      return mesh;
    }
    const m = new THREE.Mesh(geometry, materials[kind]);
    m.name = `city-${chunk}-${kind}`;
    m.castShadow = true;
    m.receiveShadow = true;
    m.matrixAutoUpdate = false; // never moves: the vertices are already in world space
    parent.add(m);
    return m;
  };

  return {
    add(chunk, items) {
      const shown = chunks.get(chunk) ?? { body: null, glow: null };
      const merged = mergeItems(items, materials, {
        body: shown.body?.geometry ?? null, glow: shown.glow?.geometry ?? null,
      });
      chunks.set(chunk, {
        body: place(chunk, 'body', merged.body, shown.body),
        glow: place(chunk, 'glow', merged.glow, shown.glow),
      });
    },
    clear() {
      for (const meshes of chunks.values()) {
        for (const m of [meshes.body, meshes.glow]) {
          if (!m) continue;
          parent.remove(m);
          m.geometry.dispose();
        }
      }
      chunks.clear();
    },
  };
}
