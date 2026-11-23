import { expect, it } from 'vitest';
import { newGame, placeCurrent } from './game';
import { nearestFreeSpot, buildOccupancy } from './grid';
import { loadGame, saveGame, type KeyValueStore } from './save';
import { GRID_SIZE, type Catalog, type GameState, type SceneSettings } from './types';

const settings: SceneSettings = { weather: 'sunny', time: 'day', ground: 'grass' };
const catalog: Catalog = {
  themeId: 't',
  order: ['a', 'b', 'c', 'd', 'e', 'f'],
  items: {
    a: { id: 'a', footprint: { w: 1, d: 1 } },
    b: { id: 'b', footprint: { w: 1, d: 2 } },
    c: { id: 'c', footprint: { w: 2, d: 2 } },
    d: { id: 'd', footprint: { w: 2, d: 3 } },
    e: { id: 'e', footprint: { w: 1, d: 1 } },
    f: { id: 'f', footprint: { w: 2, d: 2 } },
  },
};
const getCatalog = (id: string) => (id === 't' ? catalog : undefined);

function memStore(): KeyValueStore {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

function roundTrips(state: GameState): void {
  const store = memStore();
  expect(saveGame(store, state)).toBe(true);
  expect(loadGame(store, getCatalog, () => true)).toEqual(state);
}

for (const seed of [1, 2, 3, 42, 99]) {
  it(`save/load round-trips at every step of a full round (seed ${seed})`, () => {
    let s = newGame(catalog, settings, seed);
    roundTrips(s);
    let steps = 0;
    while (s.status === 'playing') {
      const fp = catalog.items[s.current].footprint;
      const occ = buildOccupancy(s.placements, catalog);
      let r: 0 | 1 = 0;
      let spot = nearestFreeSpot(occ, fp, 0, GRID_SIZE / 2, GRID_SIZE / 2);
      if (!spot) {
        r = 1;
        spot = nearestFreeSpot(occ, fp, 1, GRID_SIZE / 2, GRID_SIZE / 2);
      }
      expect(spot).not.toBeNull();
      const n = placeCurrent(s, catalog, spot!.x, spot!.z, r);
      expect(n).not.toBeNull();
      s = n!;
      roundTrips(s);
      expect(++steps).toBeLessThan(200);
    }
    expect(s.status).toBe('finished');
  });
}
