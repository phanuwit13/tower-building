// @vitest-environment happy-dom
import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import type { AppState } from '../app/controller';
import { demoFullGame } from '../game/demo';
import { newGame, placeCurrent } from '../game/game';
import { buildOccupancy, canPlace } from '../game/grid';
import type { GameState } from '../game/types';
import { getStyleKit } from '../models/kit';
import { getCatalog, getTheme } from '../themes/registry';
import { CHUNKS_PER_SIDE } from './batch';
import { createCityView } from './city';
import type { Stage } from './stage';

const kit = getStyleKit();
const catalog = getCatalog('school')!;
const settings = { weather: 'sunny', time: 'day', ground: 'grass' } as const;

function setup() {
  const scene = new THREE.Scene();
  const stage = { scene } as unknown as Stage;
  const view = createCityView(stage, kit, getTheme);
  const root = scene.getObjectByName('city')!;
  /** The merged item meshes (the ghost and its marker are separate children). */
  const chunkMeshes = () => root.children.filter((c): c is THREE.Mesh => c instanceof THREE.Mesh && c.name.startsWith('city-'));
  return { view, root, chunkMeshes };
}

const state = (game: GameState | null, ghost: AppState['ghost'] = null): AppState => ({
  screen: game ? (game.status === 'finished' ? 'finished' : 'playing') : 'theme-select',
  game, ghost, quality: 'smooth', saveFailed: false,
});

/** Place the current item at the first spot it fits. */
function placeAnywhere(game: GameState): GameState {
  const occ = buildOccupancy(game.placements, catalog);
  const fp = catalog.items[game.current].footprint;
  for (const r of [0, 1] as const) {
    for (let z = 0; z < 20; z++) for (let x = 0; x < 20; x++) if (canPlace(occ, fp, r, x, z)) return placeCurrent(game, catalog, x, z, r)!;
  }
  throw new Error('no spot');
}

const vertices = (meshes: THREE.Mesh[]) => meshes.reduce((n, m) => n + m.geometry.attributes.position.count, 0);

describe('city view batching', () => {
  const full = demoFullGame(catalog, settings, 1);

  it('draws a full map (143 items) in at most one body and one glow mesh per chunk, every vertex kept', () => {
    const { view, chunkMeshes } = setup();
    view.sync(state(full));
    const meshes = chunkMeshes();
    expect(meshes.length).toBeLessThanOrEqual(2 * CHUNKS_PER_SIDE ** 2);
    expect(meshes.length).toBeGreaterThanOrEqual(CHUNKS_PER_SIDE ** 2); // every chunk has items
    let expected = 0;
    for (const p of full.placements) {
      getTheme('school')!.items.find((i) => i.id === p.itemId)!.build(kit)
        .traverse((o) => { if (o instanceof THREE.Mesh) expected += o.geometry.attributes.position.count; });
    }
    expect(vertices(meshes)).toBe(expected);
  });

  it('a placement re-merges only its own chunk', () => {
    const { view, chunkMeshes } = setup();
    view.sync(state(full));
    const before = new Map(chunkMeshes().map((m) => [m.name, m.geometry]));
    view.sync(state(placeAnywhere(full)));
    const changed = chunkMeshes().filter((m) => before.get(m.name) !== m.geometry);
    expect(changed.length).toBeGreaterThanOrEqual(1);
    expect(new Set(changed.map((m) => m.name.split('-')[1])).size).toBe(1); // one chunk (its body and maybe glow)
    expect(view.lastBuildMs()).toBeGreaterThanOrEqual(0);
  });

  it('moving the ghost or changing the weather does not re-merge', () => {
    const { view, chunkMeshes } = setup();
    view.sync(state(full));
    const geometries = chunkMeshes().map((m) => m.geometry);
    view.sync(state(full, { x: 3, z: 3, rotation: 0, valid: false }));
    view.sync(state(full, { x: 4, z: 3, rotation: 1, valid: false }));
    view.sync(state({ ...full, settings: { ...settings, weather: 'rain', time: 'night' } }));
    expect(chunkMeshes().map((m) => m.geometry)).toEqual(geometries);
  });

  it('restart and clear remove every merged mesh and dispose their geometry', () => {
    const { view, chunkMeshes } = setup();
    view.sync(state(full));
    let disposed = 0;
    for (const m of chunkMeshes()) m.geometry.addEventListener('dispose', () => disposed++);
    const count = chunkMeshes().length;
    view.sync(state(newGame(catalog, settings, 5))); // restart: same theme, no placements
    expect(chunkMeshes()).toHaveLength(0);
    expect(disposed).toBe(count);

    view.sync(state(placeAnywhere(newGame(catalog, settings, 5))));
    expect(chunkMeshes().length).toBeGreaterThan(0);
    view.sync(state(null)); // clear
    expect(chunkMeshes()).toHaveLength(0);
  });

  it('a reloaded save showing the same city keeps the batch', () => {
    const { view, chunkMeshes } = setup();
    view.sync(state(full));
    const geometries = chunkMeshes().map((m) => m.geometry);
    view.sync(state(JSON.parse(JSON.stringify(full)) as GameState));
    expect(chunkMeshes().map((m) => m.geometry)).toEqual(geometries);
  });

  it('the ghost still shows the current item, built from its own prototype', () => {
    const { view, root } = setup();
    view.sync(state(full, { x: 0, z: 0, rotation: 0, valid: false }));
    const ghost = root.getObjectByName('ghost')!;
    expect(ghost.visible).toBe(true);
    expect(view.ghostBox()).not.toBeNull();
    let ghostMeshes = 0;
    ghost.traverse((o) => { if (o instanceof THREE.Mesh && o.material !== kit.materials.body && o.material !== kit.materials.glow) ghostMeshes++; });
    expect(ghostMeshes).toBeGreaterThan(1); // footprint fill + the item model in ghost material
  });
});
