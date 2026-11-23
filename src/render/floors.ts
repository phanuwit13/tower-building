import * as THREE from 'three';
import type { AppState } from '../app/controller';
import { normaliseRect, rectCells, type FloorRect } from '../game/floors';
import { GRID_SIZE } from '../game/types';
import { getFloorTile } from '../floors';
import type { StyleKit } from '../models/kit';
import { GHOST_INVALID, GHOST_VALID } from './city';
import { CHUNK_TILES, CHUNKS_PER_SIDE, mergeItems, type BatchItem } from './batch';
import { floorCountLabel } from '../ui/strings';
import type { Stage } from './stage';

/** Chunk of a floor cell (index z * GRID_SIZE + x); numbered row by row like the item chunks. */
export function floorChunkOf(index: number): number {
  const x = index % GRID_SIZE;
  const z = Math.floor(index / GRID_SIZE);
  return Math.floor(z / CHUNK_TILES) * CHUNKS_PER_SIDE + Math.floor(x / CHUNK_TILES);
}

/**
 * Pure: which of a tile's `looks` the cell (x, z) shows. A hash of the position, so a cell keeps
 * its look (through a reload too) while neighbours mostly differ and no row or column repeats.
 */
export function cellVariant(x: number, z: number, looks: number | undefined): number {
  if (!looks || looks <= 1) return 0;
  let h = Math.imul(x + 1, 0x27d4eb2d) ^ Math.imul(z + 1, 0x165667b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) % looks;
}

/** Pure: the chunks (ascending) holding a cell that differs between two floor arrays. */
export function changedFloorChunks(prev: readonly (string | null)[], next: readonly (string | null)[]): number[] {
  if (prev === next) return [];
  const out = new Set<number>();
  for (let i = 0; i < next.length; i++) if (prev[i] !== next[i]) out.add(floorChunkOf(i));
  return [...out].sort((a, b) => a - b);
}

// The preview tiles are lifted 0.01, so a copy spans 0.01 to at most 0.025 (a tile is up to 0.015 tall): its translucent
// surface stays clear of the real tile under it (no z-fighting) and it is drawn without depth writes, so items still show through.
const PREVIEW_Y = 0.01;
const PREVIEW_OPACITY = 0.6;
const OUTLINE_Y = 0.025;

export interface FloorLayer {
  /** Bring the merged floor and the rectangle preview in line with the app state. */
  sync(s: AppState): void;
}

/**
 * The floor layer: one merged body mesh per map chunk (a full map is at most 4 draw calls, never
 * one per tile), drawn on the ground under everything. It casts no shadow (it is flat) and
 * receives the items' shadows. A change re-merges only the chunks whose cells changed; tile
 * prototypes (one per look) are built once, and each cell shows its own look (cellVariant). The
 * rectangle preview is one instanced mesh of the picked tile's first look (semi-transparent) plus
 * an outline and a "n ช่อง" count label (`label`, a DOM element the caller places in the page), or
 * an outline only for the eraser.
 */
export function createFloorLayer(stage: Stage, kit: StyleKit, label: HTMLElement): FloorLayer {
  const root = new THREE.Group();
  root.name = 'floors';
  stage.scene.add(root);

  const prototypes = new Map<string, THREE.Object3D | null>();
  /** Look `look` of tile `id` (the first when left out); null for an unknown id. */
  const prototype = (id: string, look = 0): THREE.Object3D | null => {
    const key = `${id}#${look}`;
    let p = prototypes.get(key);
    if (p === undefined) {
      p = getFloorTile(id)?.build(kit, look) ?? null;
      prototypes.set(key, p);
    }
    return p;
  };
  /** Tile `id` as the cell (x, z) shows it. */
  const cellModel = (id: string, x: number, z: number): THREE.Object3D | null =>
    prototype(id, cellVariant(x, z, getFloorTile(id)?.variants));

  const meshes = new Map<number, THREE.Mesh>();
  let shown: readonly (string | null)[] = EMPTY; // the layer starts empty: the first sync builds only chunks that hold tiles

  const rebuildChunk = (chunk: number, floors: readonly (string | null)[]): void => {
    const items: BatchItem[] = [];
    const cx = (chunk % CHUNKS_PER_SIDE) * CHUNK_TILES;
    const cz = Math.floor(chunk / CHUNKS_PER_SIDE) * CHUNK_TILES;
    for (let z = cz; z < Math.min(GRID_SIZE, cz + CHUNK_TILES); z++) {
      for (let x = cx; x < Math.min(GRID_SIZE, cx + CHUNK_TILES); x++) {
        const id = floors[z * GRID_SIZE + x];
        const model = id ? cellModel(id, x, z) : null;
        if (model) items.push({ model, matrix: new THREE.Matrix4().makeTranslation(x + 0.5, 0, z + 0.5) });
      }
    }
    const geometry = items.length > 0 ? mergeItems(items, kit.materials).body : null;
    const mesh = meshes.get(chunk);
    if (!geometry) {
      if (mesh) { root.remove(mesh); mesh.geometry.dispose(); meshes.delete(chunk); }
      return;
    }
    if (mesh) {
      mesh.geometry.dispose();
      mesh.geometry = geometry;
      return;
    }
    const m = new THREE.Mesh(geometry, kit.materials.body);
    m.name = `floor-${chunk}`;
    m.castShadow = false;
    m.receiveShadow = true;
    m.matrixAutoUpdate = false; // vertices are already in world space
    root.add(m);
    meshes.set(chunk, m);
  };

  // Preview ------------------------------------------------------------------------------------
  const preview = new THREE.Group();
  preview.name = 'floor-preview';
  preview.visible = false;
  root.add(preview);
  const tileMat = new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: PREVIEW_OPACITY, depthWrite: false });
  const tileGeometries = new Map<string, THREE.BufferGeometry | null>(); // merged prototype per tile id
  const previewTiles = new THREE.InstancedMesh(new THREE.BufferGeometry(), tileMat, GRID_SIZE * GRID_SIZE);
  previewTiles.name = 'floor-preview-tiles';
  previewTiles.frustumCulled = false;
  previewTiles.renderOrder = 1;
  previewTiles.visible = false;
  const outlineMat = new THREE.LineBasicMaterial({ color: GHOST_VALID });
  const outline = new THREE.LineSegments(new THREE.BufferGeometry(), outlineMat);
  outline.name = 'floor-preview-outline';
  outline.frustumCulled = false;
  outline.renderOrder = 2;
  preview.add(previewTiles, outline);

  const tileGeometry = (id: string): THREE.BufferGeometry | null => {
    let g = tileGeometries.get(id);
    if (g === undefined) {
      const model = prototype(id);
      g = model ? mergeItems([{ model, matrix: new THREE.Matrix4() }], kit.materials).body : null;
      tileGeometries.set(id, g);
    }
    return g;
  };

  let previewKey = '';
  const setPreview = (rect: FloorRect | null, pick: string): void => {
    if (!rect) {
      preview.visible = false;
      label.hidden = true;
      previewKey = '';
      return;
    }
    const r = normaliseRect(rect);
    const key = `${pick}|${r.x0},${r.z0},${r.x1},${r.z1}`;
    const cells = rectCells(r);
    preview.visible = true;
    label.hidden = false;
    label.textContent = floorCountLabel(cells.length);
    anchor.set((r.x0 + r.x1 + 1) / 2, 0.1, (r.z0 + r.z1 + 1) / 2);
    if (key === previewKey) return;
    previewKey = key;

    const geometry = pick === 'eraser' ? null : tileGeometry(pick);
    previewTiles.visible = geometry !== null;
    if (geometry) {
      previewTiles.geometry = geometry;
      const m = new THREE.Matrix4();
      cells.forEach((c, i) => {
        previewTiles.setMatrixAt(i, m.makeTranslation((c % GRID_SIZE) + 0.5, PREVIEW_Y, Math.floor(c / GRID_SIZE) + 0.5));
      });
      previewTiles.count = cells.length;
      previewTiles.instanceMatrix.needsUpdate = true;
    }
    outlineMat.color.setHex(pick === 'eraser' ? GHOST_INVALID : GHOST_VALID);
    const x0 = r.x0, x1 = r.x1 + 1, z0 = r.z0, z1 = r.z1 + 1, y = OUTLINE_Y;
    outline.geometry.dispose();
    outline.geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x0, y, z0), new THREE.Vector3(x1, y, z0), new THREE.Vector3(x1, y, z0), new THREE.Vector3(x1, y, z1),
      new THREE.Vector3(x1, y, z1), new THREE.Vector3(x0, y, z1), new THREE.Vector3(x0, y, z1), new THREE.Vector3(x0, y, z0),
    ]);
  };

  // The count label rides above the rectangle's centre.
  const anchor = new THREE.Vector3();
  const projected = new THREE.Vector3();
  stage.onFrame(() => {
    if (label.hidden) return;
    const rect = stage.canvas.getBoundingClientRect();
    projected.copy(anchor).project(stage.camera);
    const left = rect.left + ((projected.x + 1) / 2) * rect.width;
    const top = rect.top + ((1 - projected.y) / 2) * rect.height;
    label.style.transform = `translate(${left.toFixed(1)}px, ${top.toFixed(1)}px) translate(-50%, -120%)`;
  });
  label.hidden = true;

  return {
    sync(s) {
      const floors = s.game?.floors ?? EMPTY;
      for (const chunk of changedFloorChunks(shown, floors)) rebuildChunk(chunk, floors);
      shown = floors;
      setPreview(s.floor.open ? s.floor.preview : null, s.floor.pick);
    },
  };
}

const EMPTY: readonly (string | null)[] = new Array<string | null>(GRID_SIZE * GRID_SIZE).fill(null);
