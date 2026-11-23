// @vitest-environment happy-dom
import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import type { AppState } from '../app/controller';
import { emptyFloors } from '../game/floors';
import { GRID_SIZE } from '../game/types';
import { getStyleKit } from '../models/kit';
import { CHUNKS_PER_SIDE } from './batch';
import { changedFloorChunks, createFloorLayer, floorChunkOf } from './floors';
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
