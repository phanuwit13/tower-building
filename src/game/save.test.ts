import { emptyFloors } from './floors';
import { describe, expect, it } from 'vitest';
import { newGame, placeCurrent } from './game';
import {
  clearCities, encodeSave, loadCities, loadQuality, QUALITY_KEY, SAVE_KEY, SAVE_VERSION, saveCities, saveQuality,
  type KeyValueStore, type SavedCities,
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
/** A second theme, so a save can hold more than one city. */
const catalogU: Catalog = { ...catalog, themeId: 'u' };
const getCatalog = (id: string) => (id === 't' ? catalog : id === 'u' ? catalogU : undefined);

function memStore(): KeyValueStore & { map: Map<string, string>; writes: number } {
  const map = new Map<string, string>();
  const s = {
    map,
    writes: 0,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => { s.writes++; map.set(k, v); },
    removeItem: (k: string) => void map.delete(k),
  };
  return s;
}
const boom = () => { throw new Error('blocked'); };
const throwingGet: KeyValueStore = { getItem: boom, setItem: boom, removeItem: boom };
const throwingSet: KeyValueStore = { getItem: () => null, setItem: boom, removeItem: boom };
const anyTile = () => true;

function playingState(cat: Catalog = catalog): GameState {
  let s = newGame(cat, settings, 7);
  for (let i = 0; i < 3; i++) s = placeCurrent(s, cat, 0, i * 3, 0)!;
  return s;
}
/** A save holding just this city, being played. */
const one = (s: GameState): SavedCities => ({ current: s.themeId, cities: { [s.themeId]: s } });
const load = (store: KeyValueStore, isTile: (id: string) => boolean = anyTile) => loadCities(store, getCatalog, isTile);
const NONE: SavedCities = { current: null, cities: {} };

/** Theme t's city after a v3 save whose t city was changed by `mutate`; null when the city was dropped. */
function loadWith(mutate: (s: any) => void): GameState | null {
  const store = memStore();
  const s: any = JSON.parse(JSON.stringify(playingState()));
  mutate(s);
  store.setItem(SAVE_KEY, JSON.stringify({ v: SAVE_VERSION, current: 't', cities: { t: s } }));
  return load(store).cities.t ?? null;
}

describe('round trip', () => {
  it('restores a playing city exactly', () => {
    const store = memStore();
    const s = playingState();
    expect(saveCities(store, one(s))).toBe(true);
    expect(load(store)).toEqual(one(s));
  });
  it('keeps a finished city finished', () => {
    const store = memStore();
    const s: GameState = { ...playingState(), status: 'finished' };
    saveCities(store, one(s));
    expect(load(store).cities.t?.status).toBe('finished');
  });
  it('keeps every theme\'s city and which one is being played', () => {
    const store = memStore();
    const t = playingState();
    const u = newGame(catalogU, { ...settings, time: 'night' }, 9);
    const saved: SavedCities = { current: 'u', cities: { t, u } };
    saveCities(store, saved);
    expect(load(store)).toEqual(saved);
  });
  it('keeps the cities when the child is on theme select (current null)', () => {
    const store = memStore();
    const saved: SavedCities = { current: null, cities: { t: playingState(), u: playingState(catalogU) } };
    saveCities(store, saved);
    expect(load(store)).toEqual(saved);
  });
  it('stores one versioned record, { v: 3, current, cities }, with one write', () => {
    const store = memStore();
    const t = playingState();
    saveCities(store, { current: 't', cities: { t, u: playingState(catalogU) } });
    expect(store.writes).toBe(1);
    expect([...store.map.keys()]).toEqual([SAVE_KEY]);
    const data = JSON.parse(store.map.get(SAVE_KEY)!);
    expect(SAVE_VERSION).toBe(3);
    expect(Object.keys(data).sort()).toEqual(['cities', 'current', 'v']);
    expect(data.v).toBe(3);
    expect(data.current).toBe('t');
    expect(Object.keys(data.cities).sort()).toEqual(['t', 'u']);
    expect(store.map.get(SAVE_KEY)).toBe(encodeSave({ current: 't', cities: { t, u: playingState(catalogU) } }));
  });
});

describe('migration from a one-city save (v1, v2)', () => {
  it('a v2 save becomes its theme\'s city, and the theme being played', () => {
    const store = memStore();
    const s = playingState();
    s.floors[7] = 'tile';
    store.setItem(SAVE_KEY, JSON.stringify({ v: 2, state: s }));
    expect(load(store)).toEqual(one(s));
  });
  it('a v2 save of a finished round stays finished', () => {
    const store = memStore();
    const s: GameState = { ...playingState(), status: 'finished' };
    store.setItem(SAVE_KEY, JSON.stringify({ v: 2, state: s }));
    expect(load(store).cities.t?.status).toBe('finished');
  });
  it('a v1 save (no floors) loads with all floors bare', () => {
    const store = memStore();
    const s: any = JSON.parse(JSON.stringify(playingState()));
    delete s.floors;
    store.setItem(SAVE_KEY, JSON.stringify({ v: 1, state: s }));
    const saved = load(store);
    expect(saved.current).toBe('t');
    expect(saved.cities.t!.floors).toEqual(emptyFloors());
    expect(saved.cities.t!.placements).toHaveLength(3);
  });
  it('a broken one-city save loads nothing', () => {
    for (const raw of ['{"v":1}', '{"v":2,"state":null}', JSON.stringify({ v: 2, state: { ...playingState(), themeId: 'zzz' } })]) {
      const store = memStore();
      store.setItem(SAVE_KEY, raw);
      expect(load(store)).toEqual(NONE);
    }
  });
  it('loading never writes (the old save stays until the next save)', () => {
    const store = memStore();
    store.setItem(SAVE_KEY, JSON.stringify({ v: 2, state: playingState() }));
    const before = store.writes;
    load(store);
    expect(store.writes).toBe(before);
  });
});

describe('each city is checked on its own', () => {
  const good = () => playingState();
  const bad = () => ({ ...JSON.parse(JSON.stringify(playingState(catalogU))), bag: ['zz'] });
  const withCities = (cities: Record<string, unknown>, current: unknown = 't') => {
    const store = memStore();
    store.setItem(SAVE_KEY, JSON.stringify({ v: 3, current, cities }));
    return load(store);
  };
  it('a corrupt city is dropped; the others load', () => {
    expect(withCities({ t: good(), u: bad() })).toEqual({ current: 't', cities: { t: good() } });
  });
  it('the theme being played had the corrupt city: theme select', () => {
    expect(withCities({ t: good(), u: bad() }, 'u')).toEqual({ current: null, cities: { t: good() } });
  });
  it('a city of an unknown theme is dropped', () => {
    const z = { ...JSON.parse(JSON.stringify(good())), themeId: 'zzz' };
    expect(withCities({ t: good(), zzz: z })).toEqual({ current: 't', cities: { t: good() } });
    expect(withCities({ t: good(), zzz: z }, 'zzz')).toEqual({ current: null, cities: { t: good() } });
  });
  it('a city filed under another theme\'s id is dropped', () => {
    expect(withCities({ u: good() }, 'u')).toEqual(NONE);
  });
  it('a current that is not one of the cities is theme select', () => {
    for (const current of [null, 'u', 5, {}]) {
      expect(withCities({ t: good() }, current)).toEqual({ current: null, cities: { t: good() } });
    }
    const store = memStore();
    store.setItem(SAVE_KEY, JSON.stringify({ v: 3, cities: { t: good() } })); // no current at all
    expect(load(store)).toEqual({ current: null, cities: { t: good() } });
  });
  it('an own __proto__ key is just an unknown theme', () => {
    const store = memStore();
    store.setItem(SAVE_KEY, `{"v":3,"current":"t","cities":{"__proto__":${JSON.stringify(good())},"t":${JSON.stringify(good())}}}`);
    const saved = load(store);
    expect(Object.keys(saved.cities)).toEqual(['t']);
    expect(Object.getPrototypeOf(saved.cities)).toBe(Object.prototype);
  });
  it('a floor check that throws drops only that city', () => {
    const store = memStore();
    const t = good();
    const u = playingState(catalogU);
    u.floors[0] = 'cursed';
    saveCities(store, { current: 't', cities: { t, u } });
    const isTile = (id: string) => { if (id === 'cursed') throw new Error('bad tile'); return true; };
    expect(load(store, isTile)).toEqual({ current: 't', cities: { t } });
  });
});

describe('loadCities finds nothing', () => {
  it('when missing', () => expect(load(memStore())).toEqual(NONE));
  it('when getItem throws', () => expect(loadCities(throwingGet, getCatalog, anyTile)).toEqual(NONE));
  it('when unparsable', () => {
    const store = memStore();
    store.setItem(SAVE_KEY, '{nope');
    expect(load(store)).toEqual(NONE);
  });
  it('when not an object, or the cities are not an object', () => {
    for (const raw of ['null', '5', '[]', '{"v":3}', '{"v":3,"current":"t","cities":null}', '{"v":3,"current":"t","cities":[]}']) {
      const store = memStore();
      store.setItem(SAVE_KEY, raw);
      expect(load(store), raw).toEqual(NONE);
    }
  });
  it('on an unknown version', () => {
    for (const v of [0, 4, '3', undefined]) {
      const store = memStore();
      store.setItem(SAVE_KEY, JSON.stringify({ v, current: 't', cities: { t: playingState() }, state: playingState() }));
      expect(load(store), String(v)).toEqual(NONE);
    }
  });
});

describe('a city is dropped', () => {
  it('on unknown theme', () => expect(loadWith((s) => { s.themeId = 'zzz'; })).toBeNull());
  it('when catalog themeId differs from saved', () => {
    const store = memStore();
    saveCities(store, one(playingState()));
    expect(loadCities(store, () => ({ ...catalog, themeId: 'other' }), anyTile)).toEqual(NONE);
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
  it('saveCities returns false when setItem throws', () => {
    expect(saveCities(throwingSet, one(playingState()))).toBe(false);
  });
});

describe('clearCities and quality', () => {
  it('clearCities removes every city and nothing else', () => {
    const store = memStore();
    saveCities(store, { current: 't', cities: { t: playingState(), u: playingState(catalogU) } });
    saveQuality(store, 'smooth');
    clearCities(store);
    expect(store.map.has(SAVE_KEY)).toBe(false);
    expect(store.map.get(QUALITY_KEY)).toBe('smooth');
    expect(load(store)).toEqual(NONE);
  });
  it('clearCities swallows errors', () => {
    expect(() => clearCities(throwingGet)).not.toThrow();
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

describe('a city saved on the old 10 x 10 map', () => {
  it('(items in its corner) still loads, unchanged', () => {
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
    saveCities(store, one(state));
    expect(load(store)).toEqual(one(state));
  });
});

describe('status re-check on load', () => {
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
    saveCities(store, one(state));
    expect(load(store).cities.t).toEqual({ ...state, status: 'finished' });
  });
});

describe('floors in saves', () => {
  const isTile = (id: string) => id === 'tile';
  const withFloors = (mutate: (s: any) => void): GameState | null => {
    const store = memStore();
    const s: any = JSON.parse(JSON.stringify(playingState()));
    mutate(s);
    store.setItem(SAVE_KEY, JSON.stringify({ v: 3, current: 't', cities: { t: s } }));
    return load(store, isTile).cities.t ?? null;
  };
  it('round-trips floors', () => {
    const store = memStore();
    const s = playingState();
    s.floors[7] = 'tile';
    saveCities(store, one(s));
    expect(load(store, isTile).cities.t).toEqual(s);
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
