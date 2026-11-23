import { GRID_SIZE, GROUND_IDS, QUALITY_TIERS, STATUSES, TIME_IDS, WEATHER_IDS } from './types';
import type { Catalog, GameState, Placement, QualityTier, Rotation, SceneSettings } from './types';
import { emptyFloors } from './floors';
import { fitsAnywhere, rotatedFootprint } from './grid';

export const SAVE_KEY = 'city-builder/save';
export const QUALITY_KEY = 'city-builder/quality';
export const SAVE_VERSION = 2;

export interface KeyValueStore {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

const ROTATIONS: readonly number[] = [0, 1, 2, 3] satisfies readonly Rotation[];

export function saveGame(store: KeyValueStore, state: GameState): boolean {
  try {
    store.setItem(SAVE_KEY, JSON.stringify({ v: SAVE_VERSION, state }));
    return true;
  } catch {
    return false;
  }
}

export function clearGame(store: KeyValueStore): void {
  try {
    store.removeItem(SAVE_KEY);
  } catch {
    // ignore: storage unavailable
  }
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

export function loadGame(
  store: KeyValueStore,
  getCatalog: (themeId: string) => Catalog | undefined,
  isFloorTile: (id: string) => boolean = () => true,
): GameState | null {
  try {
    const raw = store.getItem(SAVE_KEY);
    if (raw === null) return null;
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data) || (data.v !== 1 && data.v !== SAVE_VERSION)) return null;
    return validateState(data.state, getCatalog, isFloorTile);
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
