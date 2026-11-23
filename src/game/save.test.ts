import { emptyFloors } from './floors';
import { describe, expect, it } from 'vitest';
import { newGame, placeCurrent } from './game';
import {
  clearGame, loadGame, loadQuality, QUALITY_KEY, SAVE_KEY, SAVE_VERSION, saveGame, saveQuality,
  type KeyValueStore,
} from './save';
import { GRID_SIZE, type Catalog, type GameState, type SceneSettings } from './types';

const settings: SceneSettings = { weather: 'sunny', time: 'day', ground: 'grass' };
const catalog: Catalog = {
  themeId: 't',
  order: ['a', 'b', 'c', 'd'],
  items: {
    a: { id: 'a', footprint: { w: 1, d: 1 } },
    b: { id: 'b', footprint: { w: 1, d: 2 } },
    c: { id: 'c', footprint: { w: 2, d: 2 } },
    d: { id: 'd', footprint: { w: 2, d: 3 } },
  },
};
const getCatalog = (id: string) => (id === 't' ? catalog : undefined);

function memStore(): KeyValueStore & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}
const boom = () => { throw new Error('blocked'); };
const throwingGet: KeyValueStore = { getItem: boom, setItem: boom, removeItem: boom };
const throwingSet: KeyValueStore = { getItem: () => null, setItem: boom, removeItem: boom };

function playingState(): GameState {
  let s = newGame(catalog, settings, 7);
  for (let i = 0; i < 3; i++) s = placeCurrent(s, catalog, 0, i * 3, 0)!;
  return s;
}

function loadWith(mutate: (s: any) => void): GameState | null {
  const store = memStore();
  const s: any = JSON.parse(JSON.stringify(playingState()));
  mutate(s);
  store.setItem(SAVE_KEY, JSON.stringify({ v: SAVE_VERSION, state: s }));
  return loadGame(store, getCatalog);
}

describe('round trip', () => {
  it('restores a playing state exactly', () => {
    const store = memStore();
    const s = playingState();
    expect(saveGame(store, s)).toBe(true);
    expect(loadGame(store, getCatalog)).toEqual(s);
  });
  it('keeps a finished state finished', () => {
    const store = memStore();
    const s: GameState = { ...playingState(), status: 'finished' };
    saveGame(store, s);
    expect(loadGame(store, getCatalog)?.status).toBe('finished');
  });
  it('stores the versioned shape', () => {
    const store = memStore();
    saveGame(store, playingState());
    expect(JSON.parse(store.map.get(SAVE_KEY)!).v).toBe(2);
  });
});

describe('loadGame returns null', () => {
  it('when missing', () => expect(loadGame(memStore(), getCatalog)).toBeNull());
  it('when getItem throws', () => expect(loadGame(throwingGet, getCatalog)).toBeNull());
  it('when unparsable', () => {
    const store = memStore();
    store.setItem(SAVE_KEY, '{nope');
    expect(loadGame(store, getCatalog)).toBeNull();
  });
  it('when not an object / null / missing state', () => {
    for (const raw of ['null', '5', '[]', '{"v":1}', '{"v":1,"state":null}']) {
      const store = memStore();
      store.setItem(SAVE_KEY, raw);
      expect(loadGame(store, getCatalog)).toBeNull();
    }
  });
  it('on a different version', () => {
    const store = memStore();
    store.setItem(SAVE_KEY, JSON.stringify({ v: 3, state: playingState() }));
    expect(loadGame(store, getCatalog)).toBeNull();
  });
  it('on unknown theme', () => expect(loadWith((s) => { s.themeId = 'zzz'; })).toBeNull());
  it('when catalog themeId differs from saved', () => {
    const store = memStore();
    saveGame(store, playingState());
    expect(loadGame(store, () => ({ ...catalog, themeId: 'other' }))).toBeNull();
  });
  it('on unknown placement item', () => expect(loadWith((s) => { s.placements[0].itemId = 'zz'; })).toBeNull());
  it('on inherited item id like constructor', () => expect(loadWith((s) => { s.current = 'constructor'; })).toBeNull());
  it('on unknown bag item', () => expect(loadWith((s) => { s.bag.push('zz'); })).toBeNull());
  it('on unknown current', () => expect(loadWith((s) => { s.current = 'zz'; })).toBeNull());
  it('on unknown next', () => expect(loadWith((s) => { s.next = 'zz'; })).toBeNull());
  it('on bag not array of strings', () => {
    expect(loadWith((s) => { s.bag = 'abc'; })).toBeNull();
    expect(loadWith((s) => { s.bag = [1, 2]; })).toBeNull();
  });
  it('on bad weather/time/ground', () => {
    expect(loadWith((s) => { s.settings.weather = 'snowstorm'; })).toBeNull();
    expect(loadWith((s) => { s.settings.time = 'noon'; })).toBeNull();
    expect(loadWith((s) => { s.settings.ground = 'lava'; })).toBeNull();
    expect(loadWith((s) => { s.settings = null; })).toBeNull();
  });
  it('on out-of-bounds placement', () => {
    expect(loadWith((s) => { s.placements[0].x = GRID_SIZE; })).toBeNull();
    expect(loadWith((s) => { s.placements[0].z = GRID_SIZE - 1; s.placements[0].itemId = 'd'; })).toBeNull();
    expect(loadWith((s) => { s.placements[0].x = -1; })).toBeNull();
  });
  it('on overlapping placements', () => {
    expect(loadWith((s) => { s.placements[1].x = s.placements[0].x; s.placements[1].z = s.placements[0].z; })).toBeNull();
  });
  it('on bad rotation, non-integer coords or wrong field types', () => {
    expect(loadWith((s) => { s.placements[0].rotation = 4; })).toBeNull();
    expect(loadWith((s) => { s.placements[0].rotation = '0'; })).toBeNull();
    expect(loadWith((s) => { s.placements[0].x = 1.5; })).toBeNull();
    expect(loadWith((s) => { s.placements[0].z = '1'; })).toBeNull();
    expect(loadWith((s) => { s.placements = 'x'; })).toBeNull();
    expect(loadWith((s) => { s.placements[0] = null; })).toBeNull();
  });
  it('on duplicate uids', () => expect(loadWith((s) => { s.placements[1].uid = s.placements[0].uid; })).toBeNull());
  it('on bad status', () => expect(loadWith((s) => { s.status = 'over'; })).toBeNull());
  it('on non-uint32 rng', () => {
    for (const bad of [-1, 1.5, 2 ** 32, 'x', null]) expect(loadWith((s) => { s.rng = bad; })).toBeNull();
  });
  it('when nextUid <= largest uid', () => {
    expect(loadWith((s) => { s.nextUid = 3; })).toBeNull();
    expect(loadWith((s) => { s.nextUid = 'x'; })).toBeNull();
  });
});

describe('failing storage', () => {
  it('saveGame returns false when setItem throws', () => {
    expect(saveGame(throwingSet, playingState())).toBe(false);
  });
});

describe('clearGame and quality', () => {
  it('clearGame removes the save only', () => {
    const store = memStore();
    saveGame(store, playingState());
    saveQuality(store, 'smooth');
    clearGame(store);
    expect(store.map.has(SAVE_KEY)).toBe(false);
    expect(store.map.get(QUALITY_KEY)).toBe('smooth');
  });
  it('clearGame swallows errors', () => {
    expect(() => clearGame(throwingGet)).not.toThrow();
  });
  it('quality round trips and rejects junk', () => {
    const store = memStore();
    expect(loadQuality(store)).toBeNull();
    expect(saveQuality(store, 'pretty')).toBe(true);
    expect(loadQuality(store)).toBe('pretty');
    store.setItem(QUALITY_KEY, 'ultra');
    expect(loadQuality(store)).toBeNull();
  });
  it('quality functions survive throwing stores', () => {
    expect(saveQuality(throwingSet, 'smooth')).toBe(false);
    expect(loadQuality(throwingGet)).toBeNull();
  });
});

describe('loadGame with a map-size change', () => {
  it('a game saved on the old 10 x 10 map (items in its corner) still loads, unchanged', () => {
    const placements = [
      { uid: 1, itemId: 'd', x: 8, z: 7, rotation: 0 as const }, // flush with the old far edge
      { uid: 2, itemId: 'a', x: 7, z: 9, rotation: 0 as const },
    ];
    const state: GameState = {
      themeId: 't', settings, placements, bag: ['b'], rng: 5,
      current: 'c', next: 'a', status: 'playing', nextUid: 3,
      floors: emptyFloors(),
    };
    const store = memStore();
    saveGame(store, state);
    expect(loadGame(store, getCatalog)).toEqual(state);
  });
});

describe('loadGame status re-check', () => {
  it('marks a saved playing round finished when the current item fits nowhere', () => {
    const placements = [];
    let uid = 1;
    for (let z = 0; z < GRID_SIZE; z++) for (let x = 0; x < GRID_SIZE; x++) {
      if (z >= GRID_SIZE - 2 && x < 2) continue;
      placements.push({ uid: uid++, itemId: 'a', x, z, rotation: 0 as const });
    }
    const state: GameState = {
      themeId: 't', settings, placements, bag: ['b'], rng: 5,
      current: 'd', next: 'a', status: 'playing', nextUid: uid,
      floors: emptyFloors(),
    };
    const store = memStore();
    saveGame(store, state);
    expect(loadGame(store, getCatalog)).toEqual({ ...state, status: 'finished' });
  });
});

describe('floors in saves', () => {
  const isTile = (id: string) => id === 'tile';
  const withFloors = (mutate: (s: any) => void, v = 2): GameState | null => {
    const store = memStore();
    const s: any = JSON.parse(JSON.stringify(playingState()));
    mutate(s);
    store.setItem(SAVE_KEY, JSON.stringify({ v, state: s }));
    return loadGame(store, getCatalog, isTile);
  };
  it('v1 save loads with all floors null', () => {
    const g = withFloors((s) => { delete s.floors; }, 1);
    expect(g).not.toBeNull();
    expect(g!.floors).toEqual(emptyFloors());
  });
  it('v2 round-trips floors', () => {
    const store = memStore();
    const s = playingState();
    s.floors[7] = 'tile';
    saveGame(store, s);
    expect(loadGame(store, getCatalog, isTile)).toEqual(s);
  });
  it('unknown tile id nulls only that cell', () => {
    const g = withFloors((s) => { s.floors[3] = 'tile'; s.floors[4] = 'nope'; s.floors[5] = 42; });
    expect(g!.floors[3]).toBe('tile');
    expect(g!.floors[4]).toBeNull();
    expect(g!.floors[5]).toBeNull();
    expect(g!.placements).toHaveLength(3);
  });
  it('wrong-length or wrong-type floors reset to empty, city kept', () => {
    for (const bad of [['tile'], 'x', {}, null]) {
      const g = withFloors((s) => { s.floors = bad; });
      expect(g).not.toBeNull();
      expect(g!.floors).toEqual(emptyFloors());
      expect(g!.placements).toHaveLength(3);
    }
  });
});
