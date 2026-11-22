import { describe, expect, it } from 'vitest';
import { getCatalog } from '../themes/registry';
import { school } from '../themes/school';
import { demoFullGame } from './demo';
import { buildOccupancy, canPlace, fillStats, nearestFreeSpot } from './grid';
import { placeCurrent } from './game';
import { loadGame, saveGame, type KeyValueStore } from './save';
import { GRID_SIZE, type SceneSettings } from './types';

const catalog = getCatalog('school')!;
const settings: SceneSettings = { weather: 'sunny', time: 'day', ground: 'grass' };

function memStore(): KeyValueStore {
  const map = new Map<string, string>();
  return { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v), removeItem: (k) => void map.delete(k) };
}

describe('demoFullGame', () => {
  const game = demoFullGame(catalog, settings, 1234);

  it('is a valid save: loadGame accepts it unchanged, still playing', () => {
    const store = memStore();
    expect(saveGame(store, game)).toBe(true);
    const loaded = loadGame(store, getCatalog);
    expect(loaded).toEqual(game);
    expect(loaded?.status).toBe('playing');
  });

  it('uses every school item type', () => {
    const used = new Set([...game.placements.map((p) => p.itemId), game.current]);
    expect([...used].sort()).toEqual(school.items.map((i) => i.id).sort());
  });

  it('fills the map except one hole that the current item fits exactly', () => {
    const { w, d } = catalog.items[game.current].footprint;
    expect(fillStats(game.placements, catalog).tilesUsed).toBe(GRID_SIZE * GRID_SIZE - w * d);
    const occ = buildOccupancy(game.placements, catalog);
    const spot = nearestFreeSpot(occ, catalog.items[game.current].footprint, 0, GRID_SIZE / 2, GRID_SIZE / 2)
      ?? nearestFreeSpot(occ, catalog.items[game.current].footprint, 1, GRID_SIZE / 2, GRID_SIZE / 2);
    expect(spot).not.toBeNull();
  });

  it('placing the current item fills the map and finishes the round', () => {
    const occ = buildOccupancy(game.placements, catalog);
    const fp = catalog.items[game.current].footprint;
    let done = null;
    for (const r of [0, 1] as const) {
      for (let z = 0; z < GRID_SIZE && !done; z++) {
        for (let x = 0; x < GRID_SIZE && !done; x++) {
          if (canPlace(occ, fp, r, x, z)) done = placeCurrent(game, catalog, x, z, r);
        }
      }
    }
    expect(done?.status).toBe('finished');
    expect(fillStats(done!.placements, catalog).percent).toBe(100);
  });

  it('places about as many items as a full round (140-200) and every rotation shows up', () => {
    expect(game.placements.length).toBeGreaterThanOrEqual(140);
    expect(game.placements.length).toBeLessThanOrEqual(200);
    expect(new Set(game.placements.map((p) => p.rotation)).size).toBe(4);
  });

  it('is deterministic per seed and differs between seeds', () => {
    expect(demoFullGame(catalog, settings, 1234)).toEqual(game);
    expect(demoFullGame(catalog, settings, 99).placements).not.toEqual(game.placements);
  });
});
