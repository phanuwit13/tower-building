import { GRID_SIZE, GROUND_IDS, QUALITY_TIERS, STATUSES, TIME_IDS, WEATHER_IDS } from './types';
import type { Catalog, GameState, Placement, QualityTier, Rotation, SceneSettings } from './types';
import { emptyFloors } from './floors';
import { fitsAnywhere, rotatedFootprint } from './grid';

/**
 * The v3 record: every theme's city. It has a key of its own so that an older build (a rollback) never
 * reads it as broken and overwrites it; a future format should take a new key for the same reason.
 */
export const SAVE_KEY = 'city-builder/cities';
/**
 * Where v1 and v2 kept the one city. Read only when there is no v3 record (it becomes that theme's
 * city) and never written, so an older build still finds its own save there; เคลียร์ removes it.
 */
export const LEGACY_SAVE_KEY = 'city-builder/save';
export const QUALITY_KEY = 'city-builder/quality';
/** 3: every theme keeps its own city. 1 and 2 held one city (2 added floors). */
export const SAVE_VERSION = 3;

export interface KeyValueStore {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

/**
 * What is saved: every theme's own city, keyed by its theme id (a city's `themeId` is its key), and
 * the theme being played (`current`, null while the child is on theme select).
 */
export interface SavedCities {
  current: string | null;
  cities: Readonly<Record<string, GameState>>;
  /**
   * Entries of the record this build cannot read (corrupt, a theme it does not know, a changed
   * catalog), kept exactly as they were and written back with every save: nothing unreadable is
   * ever lost. A new city of the same theme takes its entry's place.
   */
  unreadable: Readonly<Record<string, unknown>>;
}

export const NO_CITIES: SavedCities = { current: null, cities: {}, unreadable: {} };

const ROTATIONS: readonly number[] = [0, 1, 2, 3] satisfies readonly Rotation[];

/** The stored text: one versioned record holding every city (the unreadable entries too). */
export function encodeSave(saved: SavedCities): string {
  return JSON.stringify({ v: SAVE_VERSION, current: saved.current, cities: { ...saved.unreadable, ...saved.cities } });
}

/** Every city in one write: a save is all or nothing, so the cities never get out of step. */
export function saveCities(store: KeyValueStore, saved: SavedCities): boolean {
  try {
    store.setItem(SAVE_KEY, encodeSave(saved));
    return true;
  } catch {
    return false;
  }
}

/** Deletes every theme's city, the legacy one-city save too (it would come back as a migration). The quality preference stays. */
export function clearCities(store: KeyValueStore): void {
  for (const key of [SAVE_KEY, LEGACY_SAVE_KEY]) {
    try {
      store.removeItem(key);
    } catch {
      // ignore: storage unavailable
    }
  }
}

/** One tab's view of the saved cities (see openCities). */
export interface CityStore {
  /** The cities as this tab last read or saved them. */
  get(): SavedCities;
  /** The cities, re-read first when another tab has saved since this tab last read or wrote them. */
  refresh(): SavedCities;
  /** Saves `current`, and `city` as its theme's city, over the freshest record: one write. False when it failed. */
  save(current: string | null, city?: GameState): boolean;
  /** Deletes every city (clearCities). */
  clear(): void;
}

/**
 * The saved cities as one tab sees them. Another tab may save in between, so every save starts from
 * what is stored now and changes only this tab's city and `current`: a tab never reverts another
 * tab's cities (nor brings back cities another tab cleared). When storage cannot be read or written,
 * the cities this tab knows live on in memory.
 */
export function openCities(
  store: KeyValueStore,
  getCatalog: (themeId: string) => Catalog | undefined,
  isFloorTile: (id: string) => boolean,
): CityStore {
  /** The stored record's text; undefined when storage cannot be read. */
  const readText = (): string | null | undefined => {
    try {
      return store.getItem(SAVE_KEY);
    } catch {
      return undefined;
    }
  };
  /** The text this tab last read or wrote: when the store still holds it, no other tab has saved since. */
  let seen = readText();
  let saved = seen === undefined ? NO_CITIES : citiesFrom(seen, store, getCatalog, isFloorTile);
  const refresh = (): SavedCities => {
    const text = readText();
    if (text !== undefined && text !== seen) {
      seen = text;
      saved = citiesFrom(text, store, getCatalog, isFloorTile);
    }
    return saved;
  };
  return {
    get: () => saved,
    refresh,
    save(current, city) {
      const base = refresh();
      saved = { current, cities: city ? { ...base.cities, [city.themeId]: city } : base.cities, unreadable: base.unreadable };
      const text = encodeSave(saved);
      try {
        store.setItem(SAVE_KEY, text);
        seen = text;
        return true;
      } catch {
        return false; // the store keeps the text last seen: the next save starts from memory and writes this too
      }
    },
    clear() {
      clearCities(store);
      saved = NO_CITIES;
      seen = readText();
    },
  };
}

export function saveQuality(store: KeyValueStore, q: QualityTier): boolean {
  try {
    store.setItem(QUALITY_KEY, q);
    return true;
  } catch {
    return false;
  }
}

export function loadQuality(store: KeyValueStore): QualityTier | null {
  try {
    const raw = store.getItem(QUALITY_KEY);
    return isOneOf(QUALITY_TIERS, raw) ? raw : null;
  } catch {
    return null;
  }
}

/**
 * The saved cities; nothing (theme select) when there is no save or it cannot be read. Each city is
 * checked on its own: one this build cannot read is set aside in `unreadable` (and written back by
 * the next save), the others load. With no v3 record, a legacy one-city save (v1, v2) becomes that
 * theme's city, the theme being played.
 */
export function loadCities(
  store: KeyValueStore,
  getCatalog: (themeId: string) => Catalog | undefined,
  isFloorTile: (id: string) => boolean,
): SavedCities {
  try {
    return citiesFrom(store.getItem(SAVE_KEY), store, getCatalog, isFloorTile);
  } catch {
    return NO_CITIES;
  }
}

/** The cities in the v3 record's text, or (no record) in the legacy one-city save. */
function citiesFrom(
  text: string | null,
  store: KeyValueStore,
  getCatalog: (themeId: string) => Catalog | undefined,
  isFloorTile: (id: string) => boolean,
): SavedCities {
  try {
    if (text === null) return legacyCity(store.getItem(LEGACY_SAVE_KEY), getCatalog, isFloorTile);
    const data: unknown = JSON.parse(text);
    if (!isRecord(data) || data.v !== SAVE_VERSION || !isRecord(data.cities)) return NO_CITIES;
    const cities: [string, GameState][] = [];
    const unreadable: [string, unknown][] = [];
    for (const [id, s] of Object.entries(data.cities)) {
      const city = checkedCity(s, getCatalog, isFloorTile);
      // a city filed under another theme's id is as broken as any other (an unknown id has no catalog)
      if (city && city.themeId === id) cities.push([id, city]);
      else unreadable.push([id, s]);
    }
    const ids = new Set(cities.map(([id]) => id));
    const current = typeof data.current === 'string' && ids.has(data.current) ? data.current : null;
    // fromEntries: an own "__proto__" key stays plain data
    return { current, cities: Object.fromEntries(cities), unreadable: Object.fromEntries(unreadable) };
  } catch {
    return NO_CITIES;
  }
}

function legacyCity(
  text: string | null,
  getCatalog: (themeId: string) => Catalog | undefined,
  isFloorTile: (id: string) => boolean,
): SavedCities {
  if (text === null) return NO_CITIES;
  const data: unknown = JSON.parse(text);
  if (!isRecord(data) || (data.v !== 1 && data.v !== 2)) return NO_CITIES;
  const city = checkedCity(data.state, getCatalog, isFloorTile);
  return city ? { current: city.themeId, cities: { [city.themeId]: city }, unreadable: {} } : NO_CITIES;
}

/** One city, or null when it is broken in any way: whatever goes wrong stays with this city. */
function checkedCity(
  s: unknown,
  getCatalog: (themeId: string) => Catalog | undefined,
  isFloorTile: (id: string) => boolean,
): GameState | null {
  try {
    return validateState(s, getCatalog, isFloorTile);
  } catch {
    return null;
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isOneOf<T extends string>(list: readonly T[], v: unknown): v is T {
  return typeof v === 'string' && (list as readonly string[]).includes(v);
}

function isInt(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v);
}

function hasItem(catalog: Catalog, id: unknown): id is string {
  return typeof id === 'string' && Object.prototype.hasOwnProperty.call(catalog.items, id);
}

function validateState(
  s: unknown,
  getCatalog: (themeId: string) => Catalog | undefined,
  isFloorTile: (id: string) => boolean,
): GameState | null {
  if (!isRecord(s) || typeof s.themeId !== 'string') return null;
  const catalog = getCatalog(s.themeId);
  if (!catalog || catalog.themeId !== s.themeId) return null;

  const st = s.settings;
  if (!isRecord(st)) return null;
  if (!isOneOf(WEATHER_IDS, st.weather) || !isOneOf(TIME_IDS, st.time) || !isOneOf(GROUND_IDS, st.ground)) {
    return null;
  }
  const settings: SceneSettings = { weather: st.weather, time: st.time, ground: st.ground };

  if (!isOneOf(STATUSES, s.status)) return null;
  if (!hasItem(catalog, s.current) || !hasItem(catalog, s.next)) return null;
  if (!Array.isArray(s.bag) || !s.bag.every((id) => hasItem(catalog, id))) return null;
  if (!isInt(s.rng) || s.rng < 0 || s.rng > 0xffffffff) return null;
  if (!isInt(s.nextUid) || !Array.isArray(s.placements)) return null;

  const occ = new Uint8Array(GRID_SIZE * GRID_SIZE);
  const uids = new Set<number>();
  const placements: Placement[] = [];
  let maxUid = 0;
  for (const p of s.placements as unknown[]) {
    if (!isRecord(p) || !isInt(p.uid) || !isInt(p.x) || !isInt(p.z)) return null;
    if (!hasItem(catalog, p.itemId) || typeof p.rotation !== 'number' || !ROTATIONS.includes(p.rotation)) return null;
    if (p.x < 0 || p.z < 0 || uids.has(p.uid)) return null;
    const rotation = p.rotation as unknown as Rotation;
    const { w, d } = rotatedFootprint(catalog.items[p.itemId].footprint, rotation);
    if (p.x + w > GRID_SIZE || p.z + d > GRID_SIZE) return null;
    for (let z = p.z; z < p.z + d; z++) {
      for (let x = p.x; x < p.x + w; x++) {
        if (occ[z * GRID_SIZE + x]) return null;
        occ[z * GRID_SIZE + x] = 1;
      }
    }
    uids.add(p.uid);
    maxUid = Math.max(maxUid, p.uid);
    placements.push({ uid: p.uid, itemId: p.itemId, x: p.x, z: p.z, rotation });
  }
  if (s.nextUid <= maxUid) return null;

  return {
    themeId: s.themeId,
    settings,
    placements,
    bag: [...(s.bag as string[])],
    rng: s.rng,
    current: s.current,
    next: s.next,
    status: s.status === 'finished' || !fitsAnywhere(occ, catalog.items[s.current].footprint) ? 'finished' : 'playing',
    nextUid: s.nextUid,
    floors: validateFloors(s.floors, isFloorTile),
  };
}

/** Missing (v1) or malformed floors never reject the city; unknown tile ids drop just that cell. */
function validateFloors(f: unknown, isFloorTile: (id: string) => boolean): (string | null)[] {
  if (!Array.isArray(f) || f.length !== GRID_SIZE * GRID_SIZE) return emptyFloors();
  return f.map((id: unknown) => (typeof id === 'string' && isFloorTile(id) ? id : null));
}
