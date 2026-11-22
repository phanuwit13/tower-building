import { draw } from './bag';
import { buildOccupancy, canPlace, fitsAnywhere } from './grid';
import type { Catalog, GameState, Rotation, SceneSettings } from './types';

export function newGame(catalog: Catalog, settings: SceneSettings, seed: number): GameState {
  const first = draw([], catalog.order, seed >>> 0);
  const second = draw(first.bag, catalog.order, first.rng);
  return {
    themeId: catalog.themeId,
    settings: { ...settings },
    placements: [],
    bag: second.bag,
    rng: second.rng,
    current: first.id,
    next: second.id,
    status: 'playing',
    nextUid: 1,
  };
}

export function placeCurrent(
  state: GameState, catalog: Catalog, x: number, z: number, r: Rotation,
): GameState | null {
  if (state.status === 'finished') return null;
  const occ = buildOccupancy(state.placements, catalog);
  if (!canPlace(occ, catalog.items[state.current].footprint, r, x, z)) return null;
  const placements = [
    ...state.placements,
    { uid: state.nextUid, itemId: state.current, x, z, rotation: r },
  ];
  const drawn = draw(state.bag, catalog.order, state.rng);
  const current = state.next;
  const fits = fitsAnywhere(buildOccupancy(placements, catalog), catalog.items[current].footprint);
  return {
    ...state,
    placements,
    bag: drawn.bag,
    rng: drawn.rng,
    current,
    next: drawn.id,
    status: fits ? 'playing' : 'finished',
    nextUid: state.nextUid + 1,
  };
}

export function restartGame(state: GameState, catalog: Catalog, seed: number): GameState {
  return newGame(catalog, state.settings, seed);
}

export function withSettings(state: GameState, patch: Partial<SceneSettings>): GameState {
  return { ...state, settings: { ...state.settings, ...patch } };
}
