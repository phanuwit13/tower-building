import { buildOccupancy, canPlace, clampPosition, nearestFreeSpot, rotatedFootprint } from '../game/grid';
import { newGame, placeCurrent, restartGame, withSettings } from '../game/game';
import {
  clearGame, loadGame, loadQuality, saveGame, saveQuality, type KeyValueStore,
} from '../game/save';
import { GRID_SIZE, type Catalog, type GameState, type QualityTier, type Rotation, type SceneSettings } from '../game/types';
import type { ThemeDef, ThemeId } from '../themes/types';

export interface GhostState { x: number; z: number; rotation: Rotation; valid: boolean }
export interface AppState {
  screen: 'theme-select' | 'playing' | 'finished';
  game: GameState | null; ghost: GhostState | null;
  quality: QualityTier; saveFailed: boolean; // saveFailed is sticky once true
}
export interface ControllerDeps {
  store: KeyValueStore; getTheme(id: string): ThemeDef | undefined; getCatalog(id: string): Catalog | undefined;
  seed(): number; detectQuality(): QualityTier;
}
export interface Controller {
  getState(): AppState; subscribe(fn: (s: AppState) => void): () => void;
  chooseTheme(id: ThemeId): void;
  tapTile(tx: number, tz: number): void; dragGhostTo(tx: number, tz: number): void;
  moveGhost(dx: number, dz: number): void; rotateGhost(): void; place(): boolean;
  setSettings(patch: Partial<SceneSettings>): void; setQuality(q: QualityTier, source: 'user' | 'auto'): void;
  restart(): void; clearAll(): void; // callers confirm first
}

const screenOf = (g: GameState | null): AppState['screen'] =>
  g === null ? 'theme-select' : g.status === 'finished' ? 'finished' : 'playing';

export function createController(deps: ControllerDeps): Controller {
  const { store } = deps;
  const initialGame = loadGame(store, deps.getCatalog);
  let state: AppState = {
    screen: screenOf(initialGame),
    game: initialGame,
    ghost: null,
    quality: loadQuality(store) ?? deps.detectQuality(),
    saveFailed: false,
  };
  const listeners = new Set<(s: AppState) => void>();

  function emit(next: AppState): void {
    state = next;
    for (const fn of [...listeners]) fn(state);
  }

  /** Persist the game, then emit. saveFailed latches once a save fails. */
  function commitGame(game: GameState, ghost: GhostState | null, screen = screenOf(game)): void {
    const ok = saveGame(store, game);
    emit({ ...state, game, ghost, screen, saveFailed: state.saveFailed || !ok });
  }

  const sameGhost = (a: GhostState | null, b: GhostState): boolean =>
    a !== null && a.x === b.x && a.z === b.z && a.rotation === b.rotation && a.valid === b.valid;

  /** Move/replace the ghost; nothing is emitted (rendered, re-laid out) when it did not change. */
  function setGhost(next: GhostState): void {
    if (sameGhost(state.ghost, next)) return;
    emit({ ...state, ghost: next });
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
    const r = state.ghost?.rotation ?? 0;
    const { w, d } = rotatedFootprint(p.catalog.items[p.game.current].footprint, r);
    setGhost(ghostAt(p.game, p.catalog, r, tx - Math.floor((w - 1) / 2), tz - Math.floor((d - 1) / 2)));
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
      const game = newGame(catalog, { weather: 'sunny', time: 'day', ground: theme.defaultGround }, deps.seed());
      commitGame(game, null);
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
          emit({ ...state, ghost: ghostAt(p.game, p.catalog, r, spot.x, spot.z) });
          return;
        }
      }
      const { w, d } = fp;
      emit({ ...state, ghost: ghostAt(p.game, p.catalog, 0, Math.round(GRID_SIZE / 2 - w / 2), Math.round(GRID_SIZE / 2 - d / 2)) });
    },
    rotateGhost() {
      const p = playing();
      const g = state.ghost;
      if (!p || !g) return;
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
      commitGame(withSettings(state.game, patch), state.ghost, state.screen);
    },
    setQuality(q) {
      const ok = saveQuality(store, q);
      emit({ ...state, quality: q, saveFailed: state.saveFailed || !ok });
    },
    restart() {
      if (!state.game) return;
      const catalog = deps.getCatalog(state.game.themeId);
      if (!catalog) return;
      commitGame(restartGame(state.game, catalog, deps.seed()), null, 'playing');
    },
    clearAll() {
      clearGame(store);
      emit({ ...state, game: null, ghost: null, screen: 'theme-select' });
    },
  };
}
