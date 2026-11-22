import { describe, expect, it } from 'vitest';
import { newGame } from '../game/game';
import { loadGame, QUALITY_KEY, SAVE_KEY, saveGame, type KeyValueStore } from '../game/save';
import { GRID_SIZE, type GameState } from '../game/types';
import { getCatalog, getTheme } from '../themes/registry';
import { createController, type Controller } from './controller';

function memStore(): KeyValueStore & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}
const throwingStore: KeyValueStore = {
  getItem: () => { throw new Error('blocked'); },
  setItem: () => { throw new Error('blocked'); },
  removeItem: () => { throw new Error('blocked'); },
};
const catalog = getCatalog('school')!;
const settings = { weather: 'sunny', time: 'day', ground: 'grass' } as const;

function make(store: KeyValueStore): Controller {
  return createController({ store, getTheme, getCatalog, seed: () => 7, detectQuality: () => 'pretty' });
}
function seeded(patch: Partial<GameState> = {}): ReturnType<typeof memStore> {
  const store = memStore();
  saveGame(store, { ...newGame(catalog, settings, 3), ...patch });
  return store;
}

describe('controller start', () => {
  it('empty store -> theme-select', () => {
    const s = make(memStore()).getState();
    expect(s.screen).toBe('theme-select');
    expect(s.game).toBeNull();
    expect(s.quality).toBe('pretty');
  });
  it('saved playing / finished games', () => {
    const g = newGame(catalog, settings, 3);
    expect(make(seeded()).getState().screen).toBe('playing');
    expect(make(seeded()).getState().game!.current).toBe(g.current);
    expect(make(seeded({ status: 'finished' })).getState().screen).toBe('finished');
  });
  it('stored quality wins over detection', () => {
    const store = memStore();
    store.setItem(QUALITY_KEY, 'smooth');
    expect(make(store).getState().quality).toBe('smooth');
  });
});

describe('controller flow', () => {
  it('chooseTheme starts a game with default ground and saves', () => {
    const store = memStore();
    const c = make(store);
    c.chooseTheme('school');
    expect(c.getState().screen).toBe('playing');
    expect(c.getState().game!.settings).toEqual({ weather: 'sunny', time: 'day', ground: 'grass' });
    expect(store.map.has(SAVE_KEY)).toBe(true);
  });
  it('double tap on place places exactly once', () => {
    const c = make(memStore());
    c.chooseTheme('school');
    c.tapTile(0, 0);
    expect(c.place()).toBe(true);
    expect(c.place()).toBe(false);
    expect(c.getState().game!.placements.length).toBe(1);
    expect(c.getState().ghost).toBeNull();
  });
  it('place on occupied spot is false', () => {
    const c = make(memStore());
    c.chooseTheme('school');
    c.tapTile(0, 0);
    c.place();
    c.tapTile(0, 0);
    expect(c.getState().ghost!.valid).toBe(false);
    expect(c.place()).toBe(false);
  });
  it('edge rotate keeps ghost inside the map', () => {
    const c = make(seeded({ current: 'classroom' }));
    c.tapTile(GRID_SIZE - 1, GRID_SIZE - 1);
    expect(c.getState().ghost).toMatchObject({ x: GRID_SIZE - 2, z: GRID_SIZE - 3, rotation: 0 });
    c.rotateGhost();
    expect(c.getState().ghost).toMatchObject({ x: GRID_SIZE - 3, z: GRID_SIZE - 2, rotation: 1 });
  });
  it('rotateGhost without ghost is a no-op', () => {
    const c = make(seeded());
    c.rotateGhost();
    expect(c.getState().ghost).toBeNull();
  });
  it('moveGhost with no ghost appears near the centre; then shifts and clamps', () => {
    const c = make(seeded());
    c.moveGhost(1, 0);
    const g = c.getState().ghost!;
    expect(g.valid).toBe(true);
    expect(Math.abs(g.x - (GRID_SIZE / 2 - 0.5))).toBeLessThan(3);
    expect(Math.abs(g.z - (GRID_SIZE / 2 - 0.5))).toBeLessThan(3);
    for (let i = 0; i < 20; i++) c.moveGhost(1, 0);
    expect(c.getState().ghost!.x).toBeLessThanOrEqual(GRID_SIZE - 1);
    c.moveGhost(-1, 0);
    expect(c.getState().ghost!.x).toBeGreaterThanOrEqual(0);
  });
  it('dragGhostTo keeps rotation', () => {
    const c = make(seeded({ current: 'classroom' }));
    c.tapTile(5, 5);
    c.rotateGhost();
    c.dragGhostTo(2, 2);
    expect(c.getState().ghost!.rotation).toBe(1);
  });
  it('ghost actions are no-ops outside playing', () => {
    const c = make(seeded({ status: 'finished' }));
    c.tapTile(1, 1);
    c.moveGhost(1, 0);
    expect(c.getState().ghost).toBeNull();
    expect(c.place()).toBe(false);
  });
  it('subscribe notifies after changes and can unsubscribe', () => {
    const c = make(seeded());
    let n = 0;
    const off = c.subscribe(() => n++);
    expect(n).toBe(0);
    c.tapTile(1, 1);
    expect(n).toBe(1);
    off();
    c.tapTile(2, 2);
    expect(n).toBe(1);
  });
  it('emitted state is never mutated', () => {
    const c = make(seeded());
    c.tapTile(1, 1);
    const before = c.getState();
    const snap = JSON.stringify(before);
    c.tapTile(2, 2);
    c.place();
    expect(JSON.stringify(before)).toBe(snap);
  });
});

describe('controller round end and no-op emits', () => {
  it('a place() that ends the round finishes the game, clears the ghost and saves', () => {
    const store = memStore();
    const c = make(store);
    c.chooseTheme('school');
    let ended = false;
    for (let i = 0; i < GRID_SIZE * GRID_SIZE && !ended; i++) {
      c.moveGhost(0, 0); // appears on the nearest free spot
      expect(c.getState().ghost!.valid).toBe(true);
      c.place();
      ended = c.getState().screen === 'finished';
    }
    expect(ended).toBe(true);
    const s = c.getState();
    expect(s.ghost).toBeNull();
    expect(s.game!.status).toBe('finished');
    const saved = loadGame(store, getCatalog)!;
    expect(saved.status).toBe('finished');
    expect(saved.placements.length).toBe(s.game!.placements.length);
  });
  it('dragging over the same tile does not re-emit; a change does', () => {
    const c = make(seeded());
    let n = 0;
    c.subscribe(() => n++);
    c.dragGhostTo(3, 3);
    expect(n).toBe(1);
    c.dragGhostTo(3, 3);
    c.tapTile(3, 3);
    expect(n).toBe(1);
    c.dragGhostTo(4, 3);
    expect(n).toBe(2);
  });
  it('moving into a wall (clamped, nothing changes) does not re-emit', () => {
    const c = make(seeded());
    c.tapTile(0, 0);
    let n = 0;
    c.subscribe(() => n++);
    c.moveGhost(-1, 0);
    expect(n).toBe(0);
  });
});

describe('controller storage', () => {
  it('throwing store: plays normally, saveFailed sticky', () => {
    const c = make(throwingStore);
    expect(c.getState().screen).toBe('theme-select');
    c.chooseTheme('school');
    expect(c.getState().saveFailed).toBe(true);
    c.tapTile(0, 0);
    expect(c.place()).toBe(true);
    expect(c.getState().saveFailed).toBe(true);
    c.setQuality('smooth', 'user');
    expect(c.getState().quality).toBe('smooth');
  });
  it('clearAll keeps quality; restart keeps theme and settings', () => {
    const store = memStore();
    const c = make(store);
    c.chooseTheme('school');
    c.setSettings({ time: 'night' });
    c.setQuality('smooth', 'user');
    c.tapTile(0, 0);
    c.place();
    c.restart();
    const s = c.getState();
    expect(s.screen).toBe('playing');
    expect(s.ghost).toBeNull();
    expect(s.game!.placements.length).toBe(0);
    expect(s.game!.themeId).toBe('school');
    expect(s.game!.settings.time).toBe('night');
    c.clearAll();
    expect(c.getState().screen).toBe('theme-select');
    expect(c.getState().game).toBeNull();
    expect(store.map.has(SAVE_KEY)).toBe(false);
    expect(store.map.get(QUALITY_KEY)).toBe('smooth');
  });
  it('setSettings on finished game saves and stays finished', () => {
    const store = seeded({ status: 'finished' });
    const c = make(store);
    c.setSettings({ time: 'night' });
    expect(c.getState().screen).toBe('finished');
    expect(loadGame(store, getCatalog)!.settings.time).toBe('night');
    expect(loadGame(store, getCatalog)!.status).toBe('finished');
  });
});
