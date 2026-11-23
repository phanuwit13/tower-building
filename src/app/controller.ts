import { buildOccupancy, canPlace, clampPosition, nearestFreeSpot, rotatedFootprint } from '../game/grid';
import { paintRect, type FloorRect } from '../game/floors';
import { placementAtTile } from './hover';
import { newGame, placeCurrent, restartGame, withSettings } from '../game/game';
import { loadQuality, openCities, saveQuality, type KeyValueStore, type SavedCities } from '../game/save';
import { GRID_SIZE, type Catalog, type GameState, type QualityTier, type Rotation, type SceneSettings } from '../game/types';
import type { ThemeDef, ThemeId } from '../themes/types';

export interface GhostState { x: number; z: number; rotation: Rotation; valid: boolean }
export interface AppState {
  screen: 'theme-select' | 'playing' | 'finished';
  game: GameState | null; ghost: GhostState | null;
  /** Rotation the next tap/hover uses while there is no locked ghost; follows the ghost when it rotates. */
  rotation: Rotation;
  quality: QualityTier; saveFailed: boolean; // saveFailed is sticky once true
  floor: FloorUiState;
  /** What the theme select shows: every theme that has a city, keyed by theme id. */
  cities: Readonly<Record<string, CitySummary>>;
}
/** A theme's city at a glance: items placed, floor cells painted, round over. */
export interface CitySummary { placed: number; floors: number; finished: boolean }
export interface FloorUiState {
  open: boolean; pick: string | 'eraser'; tool: 'paint' | 'camera'; preview: FloorRect | null;
}
export interface ControllerDeps {
  store: KeyValueStore; getTheme(id: string): ThemeDef | undefined; getCatalog(id: string): Catalog | undefined;
  seed(): number; detectQuality(): QualityTier;
  isFloorTile(id: string): boolean;
  /** The tile the floor drawer starts on (the first of its first group), so kids can paint at once; else the eraser. */
  firstFloorTile?: string;
}
export interface Controller {
  getState(): AppState; subscribe(fn: (s: AppState) => void): () => void;
  /** Resumes the theme's own city, or starts one when it has none. */
  chooseTheme(id: ThemeId): void;
  /** 🏠: back to theme select at once, the city kept as it is (no confirm: nothing is lost). */
  goToThemeSelect(): void;
  tapTile(tx: number, tz: number): void; dragGhostTo(tx: number, tz: number): void;
  moveGhost(dx: number, dz: number): void; rotateGhost(): void; place(): boolean;
  setSettings(patch: Partial<SceneSettings>): void; setQuality(q: QualityTier, source: 'user' | 'auto'): void;
  openFloors(): void; closeFloors(): void; pickFloor(id: string | 'eraser'): void;
  setFloorTool(t: FloorUiState['tool']): void;
  previewFloors(r: FloorRect | null): void; paintFloors(r: FloorRect): void;
  /** restart: this theme's city only. clearAll: every theme's city. Callers confirm first. */
  restart(): void; clearAll(): void;
}

const screenOf = (g: GameState | null): AppState['screen'] =>
  g === null ? 'theme-select' : g.status === 'finished' ? 'finished' : 'playing';

const summarize = (cities: SavedCities['cities']): AppState['cities'] =>
  Object.fromEntries(Object.entries(cities).map(([id, g]) => [id, {
    placed: g.placements.length, floors: g.floors.filter((f) => f !== null).length, finished: g.status === 'finished',
  }]));

export function createController(deps: ControllerDeps): Controller {
  const { store } = deps;
  /**
   * Every theme's city and the theme being played: the one place cities live (the city being played
   * is also `state.game`). Re-read before each save and theme change, so another tab's cities are
   * never reverted; kept in memory too, so switching themes works when saving does not.
   */
  const saves = openCities(store, deps.getCatalog, deps.isFloorTile);
  const loaded = saves.get();
  const initialGame = loaded.current === null ? null : loaded.cities[loaded.current] ?? null;
  let state: AppState = {
    screen: screenOf(initialGame),
    game: initialGame,
    ghost: null,
    rotation: 0,
    quality: loadQuality(store) ?? deps.detectQuality(),
    saveFailed: false,
    floor: { open: false, pick: deps.firstFloorTile ?? 'eraser', tool: 'paint', preview: null },
    cities: summarize(loaded.cities),
  };
  const listeners = new Set<(s: AppState) => void>();

  function emit(next: AppState): void {
    state = next;
    for (const fn of [...listeners]) fn(state);
  }

  /** Save `current` (and `city` as its theme's city) in one write. The AppState fields that follow; saveFailed latches once a save fails. */
  function persist(current: string | null, city?: GameState): Pick<AppState, 'cities' | 'saveFailed'> {
    const ok = saves.save(current, city);
    return { cities: summarize(saves.get().cities), saveFailed: state.saveFailed || !ok };
  }

  /** `game` is its theme's city now, and the one being played. */
  const keepCity = (game: GameState): Pick<AppState, 'game' | 'cities' | 'saveFailed'> =>
    ({ game, ...persist(game.themeId, game) });

  /** Persist the game, then emit. */
  function commitGame(
    game: GameState, ghost: GhostState | null, screen = screenOf(game), rotation: Rotation = ghost ? ghost.rotation : 0,
  ): void {
    emit({ ...state, ...keepCity(game), ghost, screen, rotation });
  }

  /** The drawer shut, back on the paint tool, nothing previewed; the pick is kept for next time. */
  const closedFloor = (): FloorUiState => ({ ...state.floor, open: false, tool: 'paint', preview: null });

  const sameGhost = (a: GhostState | null, b: GhostState): boolean =>
    a !== null && a.x === b.x && a.z === b.z && a.rotation === b.rotation && a.valid === b.valid;

  /** Move/replace the ghost; nothing is emitted (rendered, re-laid out) when it did not change. */
  function setGhost(next: GhostState): void {
    if (sameGhost(state.ghost, next)) return;
    emit({ ...state, ghost: next, rotation: next.rotation });
  }

  function playing(): { game: GameState; catalog: Catalog } | null {
    if (state.screen !== 'playing' || !state.game) return null;
    const catalog = deps.getCatalog(state.game.themeId);
    return catalog ? { game: state.game, catalog } : null;
  }

  function ghostAt(
    game: GameState, catalog: Catalog, r: Rotation, x: number, z: number,
  ): GhostState {
    const fp = catalog.items[game.current].footprint;
    const p = clampPosition(fp, r, x, z);
    const occ = buildOccupancy(game.placements, catalog);
    return { x: p.x, z: p.z, rotation: r, valid: canPlace(occ, fp, r, p.x, p.z) };
  }

  function tapLike(tx: number, tz: number): void {
    const p = playing();
    if (!p) return;
    setGhost(placementAtTile(p.game, p.catalog, state.ghost?.rotation ?? state.rotation, tx, tz));
  }

  return {
    getState: () => state,
    subscribe(fn) {
      listeners.add(fn);
      return () => void listeners.delete(fn);
    },
    chooseTheme(id) {
      const theme = deps.getTheme(id);
      const catalog = deps.getCatalog(id);
      if (!theme || !catalog) return;
      // the freshest copy: another tab may have played this city since
      const game = saves.refresh().cities[id] ?? newGame(catalog, { weather: 'sunny', time: 'day', ground: theme.defaultGround }, deps.seed());
      state = { ...state, floor: closedFloor() }; // every city opens with the items (commitGame emits this state)
      commitGame(game, null);
    },
    goToThemeSelect() {
      if (state.screen === 'theme-select') return;
      // The city is already saved: this records that the child is on theme select (and retries a save that
      // failed); the badges come from the freshest record.
      emit({
        ...state, ...persist(null),
        game: null, ghost: null, rotation: 0, screen: 'theme-select', floor: closedFloor(),
      });
    },
    tapTile: tapLike,
    dragGhostTo: tapLike,
    moveGhost(dx, dz) {
      const p = playing();
      if (!p) return;
      const fp = p.catalog.items[p.game.current].footprint;
      const g = state.ghost;
      if (g) {
        setGhost(ghostAt(p.game, p.catalog, g.rotation, g.x + dx, g.z + dz));
        return;
      }
      const occ = buildOccupancy(p.game.placements, p.catalog);
      for (const r of [0, 1] as const) {
        const spot = nearestFreeSpot(occ, fp, r, GRID_SIZE / 2, GRID_SIZE / 2);
        if (spot) {
          emit({ ...state, ghost: ghostAt(p.game, p.catalog, r, spot.x, spot.z), rotation: r });
          return;
        }
      }
      const { w, d } = fp;
      emit({ ...state, ghost: ghostAt(p.game, p.catalog, 0, Math.round(GRID_SIZE / 2 - w / 2), Math.round(GRID_SIZE / 2 - d / 2)) });
    },
    rotateGhost() {
      const p = playing();
      const g = state.ghost;
      if (!p) return;
      if (!g) {
        emit({ ...state, rotation: ((state.rotation + 1) % 4) as Rotation });
        return;
      }
      const fp = p.catalog.items[p.game.current].footprint;
      const old = rotatedFootprint(fp, g.rotation);
      const cx = g.x + Math.floor((old.w - 1) / 2);
      const cz = g.z + Math.floor((old.d - 1) / 2);
      const r = ((g.rotation + 1) % 4) as Rotation;
      const nw = rotatedFootprint(fp, r);
      setGhost(ghostAt(p.game, p.catalog, r, cx - Math.floor((nw.w - 1) / 2), cz - Math.floor((nw.d - 1) / 2)));
    },
    place() {
      const p = playing();
      const g = state.ghost;
      if (!p || !g || !g.valid) return false;
      const next = placeCurrent(p.game, p.catalog, g.x, g.z, g.rotation);
      if (!next) return false;
      commitGame(next, null);
      return true;
    },
    setSettings(patch) {
      if (!state.game) return;
      commitGame(withSettings(state.game, patch), state.ghost, state.screen, state.rotation);
    },
    setQuality(q) {
      const ok = saveQuality(store, q);
      emit({ ...state, quality: q, saveFailed: state.saveFailed || !ok });
    },
    openFloors() {
      emit({ ...state, floor: { ...state.floor, open: true } });
    },
    closeFloors() {
      emit({ ...state, floor: closedFloor() });
    },
    pickFloor(id) {
      emit({ ...state, floor: { ...state.floor, pick: id, tool: 'paint' } });
    },
    setFloorTool(t) {
      emit({ ...state, floor: { ...state.floor, tool: t, preview: null } });
    },
    previewFloors(r) {
      emit({ ...state, floor: { ...state.floor, preview: r } });
    },
    paintFloors(r) {
      const game = state.game;
      if (!game) return;
      const { pick } = state.floor;
      const floors = paintRect(game.floors, r, pick === 'eraser' ? null : pick);
      emit({ ...state, ...keepCity({ ...game, floors }), floor: { ...state.floor, preview: null } });
    },
    restart() {
      const game = state.game;
      if (!game) return;
      const catalog = deps.getCatalog(game.themeId);
      if (!catalog) return;
      // A new city starts with the items: the drawer closes (commitGame emits this state). Other themes' cities stay.
      state = { ...state, floor: closedFloor() };
      commitGame(restartGame(game, catalog, deps.seed()), null, 'playing');
    },
    clearAll() {
      saves.clear();
      emit({ ...state, game: null, ghost: null, rotation: 0, screen: 'theme-select', floor: closedFloor(), cities: {} });
    },
  };
}
