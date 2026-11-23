// @vitest-environment happy-dom
import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import type { AppState } from '../app/controller';
import { emptyFloors } from '../game/floors';
import { GRID_SIZE } from '../game/types';
import { getFloorTile } from '../floors';
import { getStyleKit } from '../models/kit';
import { CHUNKS_PER_SIDE } from './batch';
import { cellVariant, changedFloorChunks, createFloorLayer, floorChunkOf } from './floors';
import type { Stage } from './stage';

const kit = getStyleKit();
const cell = (x: number, z: number) => z * GRID_SIZE + x;

describe('floorChunkOf', () => {
  it('numbers chunks row by row', () => {
    expect(floorChunkOf(cell(0, 0))).toBe(0);
    expect(floorChunkOf(cell(GRID_SIZE - 1, 0))).toBe(CHUNKS_PER_SIDE - 1);
    expect(floorChunkOf(cell(0, GRID_SIZE - 1))).toBe(CHUNKS_PER_SIDE * (CHUNKS_PER_SIDE - 1));
    expect(floorChunkOf(cell(GRID_SIZE - 1, GRID_SIZE - 1))).toBe(CHUNKS_PER_SIDE * CHUNKS_PER_SIDE - 1);
  });
});

describe('cellVariant', () => {
  it('is 0 for a tile with one look; otherwise in range, and always the same for a cell', () => {
    expect(cellVariant(3, 4, 1)).toBe(0);
    expect(cellVariant(3, 4, undefined)).toBe(0);
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const v = cellVariant(i % GRID_SIZE, Math.floor(i / GRID_SIZE), 5);
      expect(Number.isInteger(v) && v >= 0 && v < 5).toBe(true);
      expect(cellVariant(i % GRID_SIZE, Math.floor(i / GRID_SIZE), 5)).toBe(v);
    }
  });
  it('spreads the looks over the map: each shows, most neighbours differ, and no row or column repeats', () => {
    const n = 5;
    const v = (x: number, z: number) => cellVariant(x, z, n);
    const counts = new Array<number>(n).fill(0);
    let pairs = 0;
    let same = 0;
    for (let z = 0; z < GRID_SIZE; z++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        counts[v(x, z)]++;
        if (x > 0) { pairs++; if (v(x, z) === v(x - 1, z)) same++; }
        if (z > 0) { pairs++; if (v(x, z) === v(x, z - 1)) same++; }
      }
    }
    for (const c of counts) expect(c).toBeGreaterThan((GRID_SIZE * GRID_SIZE) / n / 2);
    expect(same / pairs).toBeLessThan(0.3);
    const row = (z: number) => Array.from({ length: GRID_SIZE }, (_, x) => v(x, z)).join();
    const col = (x: number) => Array.from({ length: GRID_SIZE }, (_, z) => v(x, z)).join();
    expect(new Set(Array.from({ length: GRID_SIZE }, (_, z) => row(z))).size).toBe(GRID_SIZE);
    expect(new Set(Array.from({ length: GRID_SIZE }, (_, x) => col(x))).size).toBe(GRID_SIZE);
  });
});

describe('changedFloorChunks', () => {
  it('is empty for the same or an equal array', () => {
    const a = emptyFloors();
    expect(changedFloorChunks(a, a)).toEqual([]);
    expect(changedFloorChunks(a, [...a])).toEqual([]);
  });
  it('lists only the chunks whose cells changed', () => {
    const a = emptyFloors();
    const b = [...a];
    b[cell(1, 1)] = 'lawn';
    b[cell(2, 3)] = 'lawn';
    expect(changedFloorChunks(a, b)).toEqual([0]);
    b[cell(GRID_SIZE - 1, GRID_SIZE - 1)] = 'brick-red';
    expect(changedFloorChunks(a, b)).toEqual([0, CHUNKS_PER_SIDE * CHUNKS_PER_SIDE - 1]);
  });
  it('counts a swapped tile as a change', () => {
    const a = emptyFloors();
    a[cell(5, 5)] = 'lawn';
    const b = [...a];
    b[cell(5, 5)] = 'brick-red';
    expect(changedFloorChunks(a, b)).toEqual([0]);
  });
});

function setup() {
  const scene = new THREE.Scene();
  const frames: Array<() => void> = [];
  const stage = {
    scene, camera: new THREE.PerspectiveCamera(), canvas: document.createElement('canvas'),
    onFrame: (cb: () => void) => frames.push(cb), invalidateShadows: vi.fn(),
  } as unknown as Stage;
  const label = document.createElement('div');
  const layer = createFloorLayer(stage, kit, label);
  const root = scene.getObjectByName('floors')!;
  const chunkMeshes = () => root.children.filter((c): c is THREE.Mesh => c instanceof THREE.Mesh && c.name.startsWith('floor-'));
  return { layer, root, chunkMeshes, label, scene };
}

const state = (floors: (string | null)[] | null, floor: Partial<AppState['floor']> = {}): AppState => ({
  screen: 'playing',
  game: floors ? ({ themeId: 'school', floors } as unknown as AppState['game']) : null,
  ghost: null, rotation: 0, quality: 'smooth', saveFailed: false,
  floor: { open: false, pick: 'eraser', tool: 'paint', preview: null, ...floor }, cities: {},
});

describe('floor layer', () => {
  it('draws one merged mesh per chunk with tiles, receiving but never casting shadows', () => {
    const { layer, chunkMeshes } = setup();
    const f = emptyFloors();
    f[cell(0, 0)] = 'lawn';
    f[cell(1, 0)] = 'brick-red';
    f[cell(15, 15)] = 'wood-light';
    layer.sync(state(f));
    const meshes = chunkMeshes();
    expect(meshes.map((m) => m.name).sort()).toEqual(['floor-0', 'floor-3']);
    for (const m of meshes) {
      expect(m.castShadow).toBe(false);
      expect(m.receiveShadow).toBe(true);
      expect(m.material).toBe(kit.materials.body);
    }
  });
  it('places each tile on its own cell', () => {
    const { layer, chunkMeshes } = setup();
    const f = emptyFloors();
    f[cell(3, 4)] = 'lawn';
    layer.sync(state(f));
    const box = new THREE.Box3().setFromBufferAttribute(chunkMeshes()[0].geometry.attributes.position as THREE.BufferAttribute);
    expect(box.min.x).toBeCloseTo(3);
    expect(box.max.x).toBeCloseTo(4);
    expect(box.min.z).toBeCloseTo(4);
    expect(box.max.z).toBeCloseTo(5);
    expect(box.max.y).toBeLessThanOrEqual(0.05);
  });
  it('re-merges only the chunks that changed', () => {
    const { layer, chunkMeshes } = setup();
    const f = emptyFloors();
    f[cell(0, 0)] = 'lawn';
    f[cell(15, 15)] = 'lawn';
    layer.sync(state(f));
    const before = new Map(chunkMeshes().map((m) => [m.name, m.geometry]));
    const g = [...f];
    g[cell(2, 2)] = 'brick-red';
    layer.sync(state(g));
    const after = new Map(chunkMeshes().map((m) => [m.name, m.geometry]));
    expect(after.get('floor-0')).not.toBe(before.get('floor-0'));
    expect(after.get('floor-3')).toBe(before.get('floor-3'));
  });
  it('removes a chunk mesh when its last tile is erased, and everything when the game goes', () => {
    const { layer, chunkMeshes } = setup();
    const f = emptyFloors();
    f[cell(0, 0)] = 'lawn';
    layer.sync(state(f));
    expect(chunkMeshes()).toHaveLength(1);
    layer.sync(state(emptyFloors()));
    expect(chunkMeshes()).toHaveLength(0);
    layer.sync(state(f));
    layer.sync(state(null));
    expect(chunkMeshes()).toHaveLength(0);
  });
  it('draws a tile with several looks in each cell\'s own look', () => {
    const { layer, chunkMeshes } = setup();
    const n = getFloorTile('sand')!.variants!;
    expect(n).toBeGreaterThan(1);
    // two cells of the first chunk with different looks
    const cells: Array<[number, number]> = [];
    for (let i = 0; i < 25 && cells.length < 2; i++) {
      const x = i % 5, z = Math.floor(i / 5);
      if (cells.every(([cx, cz]) => cellVariant(cx, cz, n) !== cellVariant(x, z, n))) cells.push([x, z]);
    }
    const shape = ([x, z]: [number, number]) => {
      const f = emptyFloors();
      f[cell(x, z)] = 'sand';
      layer.sync(state(f));
      const p = chunkMeshes()[0].geometry.attributes.position;
      const out: string[] = [];
      for (let i = 0; i < p.count; i++) out.push(`${(p.getX(i) - x).toFixed(3)},${p.getY(i).toFixed(3)},${(p.getZ(i) - z).toFixed(3)}`);
      return out.join(' ');
    };
    expect(shape(cells[0])).not.toBe(shape(cells[1]));
    expect(shape(cells[0])).toBe(shape(cells[0])); // a cell keeps its look
  });
  it('skips an unknown tile id', () => {
    const { layer, chunkMeshes } = setup();
    const f = emptyFloors();
    f[cell(0, 0)] = 'no-such-tile';
    layer.sync(state(f));
    expect(chunkMeshes()).toHaveLength(0);
  });
});

describe('floor preview', () => {
  const rect = { x0: 2, z0: 1, x1: 4, z1: 2 }; // 3 x 2 = 6 cells
  it('is hidden unless the drawer is open and a rectangle is being dragged', () => {
    const { layer, root, label } = setup();
    layer.sync(state(emptyFloors(), { open: true, pick: 'lawn', preview: null }));
    expect(root.getObjectByName('floor-preview')!.visible).toBe(false);
    layer.sync(state(emptyFloors(), { open: false, pick: 'lawn', preview: rect }));
    expect(root.getObjectByName('floor-preview')!.visible).toBe(false);
    expect(label.hidden).toBe(true);
  });
  it('shows one semi-transparent tile per cell and the count', () => {
    const { layer, root, label } = setup();
    layer.sync(state(emptyFloors(), { open: true, pick: 'lawn', preview: rect }));
    const group = root.getObjectByName('floor-preview')!;
    expect(group.visible).toBe(true);
    const tiles = group.getObjectByName('floor-preview-tiles') as THREE.InstancedMesh;
    expect(tiles.visible).toBe(true);
    expect(tiles.count).toBe(6);
    expect((tiles.material as THREE.Material).transparent).toBe(true);
    expect(label.hidden).toBe(false);
    expect(label.textContent).toBe('6 ช่อง');
  });
  it('shows an outline only for the eraser (no tiles)', () => {
    const { layer, root, label } = setup();
    layer.sync(state(emptyFloors(), { open: true, pick: 'eraser', preview: rect }));
    const group = root.getObjectByName('floor-preview')!;
    expect(group.visible).toBe(true);
    expect(group.getObjectByName('floor-preview-tiles')!.visible).toBe(false);
    expect(label.textContent).toBe('6 ช่อง');
    const line = group.getObjectByName('floor-preview-outline') as THREE.LineSegments;
    expect((line.material as THREE.LineBasicMaterial).color.getHex()).toBe(0xff2a4d);
  });
  it('does not touch the floors when only the preview changes', () => {
    const { layer, chunkMeshes } = setup();
    const f = emptyFloors();
    f[cell(0, 0)] = 'lawn';
    layer.sync(state(f));
    const geo = chunkMeshes()[0].geometry;
    layer.sync(state(f, { open: true, pick: 'lawn', preview: rect }));
    expect(chunkMeshes()[0].geometry).toBe(geo);
  });
});
