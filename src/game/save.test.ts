import { emptyFloors } from './floors';
import { describe, expect, it } from 'vitest';
import { newGame, placeCurrent } from './game';
import {
  clearCities, encodeSave, LEGACY_SAVE_KEY, loadCities, loadQuality, openCities, QUALITY_KEY, SAVE_KEY, SAVE_VERSION,
  saveCities, saveQuality, type KeyValueStore, type SavedCities,
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
const one = (s: GameState): SavedCities => ({ current: s.themeId, cities: { [s.themeId]: s }, unreadable: {} });
const load = (store: KeyValueStore, isTile: (id: string) => boolean = anyTile) => loadCities(store, getCatalog, isTile);
const NONE: SavedCities = { current: null, cities: {}, unreadable: {} };

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
    const saved: SavedCities = { current: 'u', cities: { t, u }, unreadable: {} };
    saveCities(store, saved);
    expect(load(store)).toEqual(saved);
  });
  it('keeps the cities when the child is on theme select (current null)', () => {
    const store = memStore();
    const saved: SavedCities = { current: null, cities: { t: playingState(), u: playingState(catalogU) }, unreadable: {} };
    saveCities(store, saved);
    expect(load(store)).toEqual(saved);
  });
  it('stores one versioned record, { v: 3, current, cities }, with one write', () => {
    const store = memStore();
    const t = playingState();
    saveCities(store, { current: 't', cities: { t, u: playingState(catalogU) }, unreadable: {} });
    expect(store.writes).toBe(1);
    expect([...store.map.keys()]).toEqual([SAVE_KEY]);
    const data = JSON.parse(store.map.get(SAVE_KEY)!);
    expect(SAVE_VERSION).toBe(3);
    expect(Object.keys(data).sort()).toEqual(['cities', 'current', 'v']);
    expect(data.v).toBe(3);
    expect(data.current).toBe('t');
    expect(Object.keys(data.cities).sort()).toEqual(['t', 'u']);
    expect(store.map.get(SAVE_KEY)).toBe(encodeSave({ current: 't', cities: { t, u: playingState(catalogU) }, unreadable: {} }));
  });
});

describe('migration from a one-city save (v1, v2) under the legacy key', () => {
  it('the v3 record has a key of its own; the legacy key is the old one', () => {
    expect(SAVE_KEY).toBe('city-builder/cities');
    expect(LEGACY_SAVE_KEY).toBe('city-builder/save');
  });
  it('a v2 save becomes its theme\'s city, and the theme being played', () => {
    const store = memStore();
    const s = playingState();
    s.floors[7] = 'tile';
    store.setItem(LEGACY_SAVE_KEY, JSON.stringify({ v: 2, state: s }));
    expect(load(store)).toEqual(one(s));
  });
  it('a v2 save of a finished round stays finished', () => {
    const store = memStore();
    const s: GameState = { ...playingState(), status: 'finished' };
    store.setItem(LEGACY_SAVE_KEY, JSON.stringify({ v: 2, state: s }));
    expect(load(store).cities.t?.status).toBe('finished');
  });
  it('a v1 save (no floors) loads with all floors bare', () => {
    const store = memStore();
    const s: any = JSON.parse(JSON.stringify(playingState()));
    delete s.floors;
    store.setItem(LEGACY_SAVE_KEY, JSON.stringify({ v: 1, state: s }));
    const saved = load(store);
    expect(saved.current).toBe('t');
    expect(saved.cities.t!.floors).toEqual(emptyFloors());
    expect(saved.cities.t!.placements).toHaveLength(3);
  });
  it('a broken one-city save loads nothing', () => {
    for (const raw of ['{"v":1}', '{"v":2,"state":null}', '{nope', JSON.stringify({ v: 2, state: { ...playingState(), themeId: 'zzz' } })]) {
      const store = memStore();
      store.setItem(LEGACY_SAVE_KEY, raw);
      expect(load(store)).toEqual(NONE);
    }
  });
  it('the v3 record wins: the legacy save is only read when there is no v3 record', () => {
    const store = memStore();
    store.setItem(LEGACY_SAVE_KEY, JSON.stringify({ v: 2, state: playingState() }));
    const u = playingState(catalogU);
    saveCities(store, one(u));
    expect(load(store)).toEqual(one(u));
    saveCities(store, NONE); // every city gone from the v3 record (still there): no migration
    expect(load(store)).toEqual(NONE);
  });
  it('a v1/v2 record under the new key is not read as one (the key is v3 only)', () => {
    const store = memStore();
    store.setItem(SAVE_KEY, JSON.stringify({ v: 2, state: playingState() }));
    expect(load(store)).toEqual(NONE);
  });
  it('loading never writes (the old save stays as it was)', () => {
    const store = memStore();
    store.setItem(LEGACY_SAVE_KEY, JSON.stringify({ v: 2, state: playingState() }));
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
    expect(withCities({ t: good(), u: bad() })).toEqual({ current: 't', cities: { t: good() }, unreadable: { u: bad() } });
  });
  it('the theme being played had the corrupt city: theme select', () => {
    expect(withCities({ t: good(), u: bad() }, 'u')).toEqual({ current: null, cities: { t: good() }, unreadable: { u: bad() } });
  });
  it('a city of an unknown theme is dropped', () => {
    const z = { ...JSON.parse(JSON.stringify(good())), themeId: 'zzz' };
    expect(withCities({ t: good(), zzz: z })).toEqual({ current: 't', cities: { t: good() }, unreadable: { zzz: z } });
    expect(withCities({ t: good(), zzz: z }, 'zzz')).toEqual({ current: null, cities: { t: good() }, unreadable: { zzz: z } });
  });
  it('a city filed under another theme\'s id is dropped', () => {
    expect(withCities({ u: good() }, 'u')).toEqual({ ...NONE, unreadable: { u: good() } });
  });
  it('a current that is not one of the cities is theme select', () => {
    for (const current of [null, 'u', 5, {}]) {
      expect(withCities({ t: good() }, current)).toEqual({ current: null, cities: { t: good() }, unreadable: {} });
    }
    const store = memStore();
    store.setItem(SAVE_KEY, JSON.stringify({ v: 3, cities: { t: good() } })); // no current at all
    expect(load(store)).toEqual({ current: null, cities: { t: good() }, unreadable: {} });
  });
  it('an own __proto__ key is just an unknown theme', () => {
    const store = memStore();
    store.setItem(SAVE_KEY, `{"v":3,"current":"t","cities":{"__proto__":${JSON.stringify(good())},"t":${JSON.stringify(good())}}}`);
    const saved = load(store);
    expect(Object.keys(saved.cities)).toEqual(['t']);
    expect(Object.getPrototypeOf(saved.cities)).toBe(Object.prototype);
    expect(Object.keys(saved.unreadable)).toEqual(['__proto__']); // kept as data, like any unknown theme
    expect(Object.getPrototypeOf(saved.unreadable)).toBe(Object.prototype);
    expect(Object.hasOwn(JSON.parse(encodeSave(saved)).cities, '__proto__')).toBe(true);
  });
  it('a floor check that throws drops only that city', () => {
    const store = memStore();
    const t = good();
    const u = playingState(catalogU);
    u.floors[0] = 'cursed';
    saveCities(store, { current: 't', cities: { t, u }, unreadable: {} });
    const isTile = (id: string) => { if (id === 'cursed') throw new Error('bad tile'); return true; };
    expect(load(store, isTile)).toEqual({ current: 't', cities: { t }, unreadable: { u: JSON.parse(JSON.stringify(u)) } });
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
    const saved = loadCities(store, () => ({ ...catalog, themeId: 'other' }), anyTile);
    expect(saved.cities).toEqual({});
    expect(saved.unreadable.t).toEqual(JSON.parse(JSON.stringify(playingState())));
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
  it('clearCities removes every city, the legacy one-city save too (it would come back), and nothing else', () => {
    const store = memStore();
    store.setItem(LEGACY_SAVE_KEY, JSON.stringify({ v: 2, state: playingState() }));
    saveCities(store, { current: 't', cities: { t: playingState(), u: playingState(catalogU) }, unreadable: {} });
    saveQuality(store, 'smooth');
    clearCities(store);
    expect(store.map.has(SAVE_KEY)).toBe(false);
    expect(store.map.has(LEGACY_SAVE_KEY)).toBe(false);
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

describe('cities this build cannot read are kept', () => {
  const bad = () => ({ ...JSON.parse(JSON.stringify(playingState(catalogU))), bag: ['zz'] });
  const unknown = () => ({ ...JSON.parse(JSON.stringify(playingState())), themeId: 'space', note: 'a newer build' });
  function stored() {
    const store = memStore();
    store.setItem(SAVE_KEY, JSON.stringify({ v: 3, current: 't', cities: { t: playingState(), u: bad(), space: unknown() } }));
    return store;
  }
  const storedCities = (store: ReturnType<typeof memStore>) => JSON.parse(store.map.get(SAVE_KEY)!).cities;

  it('the next save writes them back unchanged', () => {
    const store = stored();
    const saved = load(store);
    const t = placeCurrent(saved.cities.t!, catalog, 10, 10, 0)!;
    saveCities(store, { ...saved, cities: { t } });
    expect(storedCities(store)).toEqual({ t: JSON.parse(JSON.stringify(t)), u: bad(), space: unknown() });
    expect(load(store).unreadable).toEqual({ u: bad(), space: unknown() }); // and again on the next load
  });
  it('a new city of the same theme takes its place (the only way one goes)', () => {
    const store = stored();
    const saved = load(store);
    const u = newGame(catalogU, settings, 1);
    saveCities(store, { ...saved, cities: { ...saved.cities, u } });
    expect(storedCities(store).u).toEqual(JSON.parse(JSON.stringify(u)));
    expect(storedCities(store).space).toEqual(unknown());
  });
});

describe('openCities: one tab\'s view (another tab may save in between)', () => {
  const t = () => playingState();
  const u = () => playingState(catalogU);
  const open = (store: KeyValueStore) => openCities(store, getCatalog, anyTile);

  it('opens on what is stored', () => {
    const store = memStore();
    saveCities(store, { current: 'u', cities: { t: t(), u: u() }, unreadable: {} });
    expect(open(store).get()).toEqual({ current: 'u', cities: { t: t(), u: u() }, unreadable: {} });
  });
  it('a save changes only this tab\'s city and current: another tab\'s cities stay', () => {
    const store = memStore();
    const a = open(store);
    const b = open(store); // opened at the same time: knows of no city
    expect(a.save('u', u())).toBe(true);
    expect(b.save('t', t())).toBe(true);
    expect(load(store)).toEqual({ current: 't', cities: { t: t(), u: u() }, unreadable: {} });
    expect(b.get().cities.u).toEqual(u());
  });
  it('one write per save', () => {
    const store = memStore();
    const a = open(store);
    a.save('t', t());
    a.save(null);
    expect(store.writes).toBe(2);
  });
  it('refresh picks up another tab\'s save', () => {
    const store = memStore();
    const a = open(store);
    const b = open(store);
    a.save('u', u());
    expect(b.get().cities).toEqual({});
    expect(b.refresh().cities).toEqual({ u: u() });
  });
  it('another tab\'s เคลียร์ is not undone', () => {
    const store = memStore();
    const a = open(store);
    a.save('t', t());
    const b = open(store);
    expect(b.get().cities.t).toBeDefined();
    a.clear();
    b.save('u', u());
    expect(load(store)).toEqual({ current: 'u', cities: { u: u() }, unreadable: {} });
  });
  it('another tab\'s unreadable entries are kept too', () => {
    const store = memStore();
    const a = open(store);
    store.setItem(SAVE_KEY, JSON.stringify({ v: 3, current: null, cities: { space: { from: 'a newer build' } } }));
    a.save('t', t());
    expect(JSON.parse(store.map.get(SAVE_KEY)!).cities.space).toEqual({ from: 'a newer build' });
  });
  it('storage that cannot be written: the cities live on in memory, and the next good save writes them all', () => {
    const store = memStore();
    const a = open(store);
    const setItem = store.setItem;
    store.setItem = boom;
    expect(a.save('t', t())).toBe(false);
    expect(a.save(null)).toBe(false);
    expect(a.refresh().cities).toEqual({ t: t() });
    store.setItem = setItem;
    expect(a.save('u', u())).toBe(true);
    expect(load(store)).toEqual({ current: 'u', cities: { t: t(), u: u() }, unreadable: {} });
  });
  it('storage that cannot be read: the cities live on in memory', () => {
    const a = open(throwingGet);
    expect(a.save('t', t())).toBe(false);
    a.save(null, u());
    expect(a.refresh()).toEqual({ current: null, cities: { t: t(), u: u() }, unreadable: {} });
  });
  it('a legacy save is migrated on open; saving writes the new key and leaves the legacy key exactly as it was', () => {
    const store = memStore();
    const legacy = JSON.stringify({ v: 2, state: t() });
    store.setItem(LEGACY_SAVE_KEY, legacy);
    const a = open(store);
    expect(a.get()).toEqual(one(t()));
    a.save('u', u());
    expect(store.map.get(LEGACY_SAVE_KEY)).toBe(legacy);
    expect(load(store)).toEqual({ current: 'u', cities: { t: t(), u: u() }, unreadable: {} });
  });
  it('clear deletes both keys and every city in memory', () => {
    const store = memStore();
    store.setItem(LEGACY_SAVE_KEY, JSON.stringify({ v: 2, state: t() }));
    const a = open(store);
    a.save('u', u());
    a.clear();
    expect(store.map.has(SAVE_KEY)).toBe(false);
    expect(store.map.has(LEGACY_SAVE_KEY)).toBe(false);
    expect(a.get()).toEqual(NONE);
    expect(a.refresh()).toEqual(NONE);
  });
});
