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
  return createController({ store, getTheme, getCatalog, seed: () => 7, detectQuality: () => 'pretty', isFloorTile: (id) => id.startsWith('t') });
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
  it('rotateGhost without ghost sets the preferred rotation (no ghost appears)', () => {
    const c = make(seeded());
    expect(c.getState().rotation).toBe(0);
    c.rotateGhost();
    expect(c.getState().ghost).toBeNull();
    expect(c.getState().rotation).toBe(1);
    c.rotateGhost(); c.rotateGhost(); c.rotateGhost();
    expect(c.getState().rotation).toBe(0);
  });
  it('tapTile with no ghost uses the preferred rotation', () => {
    const c = make(seeded({ current: 'classroom' }));
    c.rotateGhost();
    c.tapTile(5, 5);
    expect(c.getState().ghost).toMatchObject({ x: 4, z: 5, rotation: 1 });
  });
  it('rotating a locked ghost keeps the preferred rotation in step; place resets it', () => {
    const c = make(seeded({ current: 'classroom' }));
    c.tapTile(5, 5);
    c.rotateGhost();
    expect(c.getState().rotation).toBe(1);
    c.place();
    expect(c.getState().rotation).toBe(0);
  });
  it('rotateGhost outside playing is a no-op', () => {
    const c = make(memStore());
    c.rotateGhost();
    expect(c.getState().rotation).toBe(0);
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
    const saved = loadGame(store, getCatalog, () => true)!;
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
    expect(loadGame(store, getCatalog, () => true)!.settings.time).toBe('night');
    expect(loadGame(store, getCatalog, () => true)!.status).toBe('finished');
  });
});

describe('controller floors', () => {
  const rect = { x0: 2, z0: 2, x1: 0, z1: 1 };
  function playing(patch: Partial<GameState> = {}) {
    const store = seeded(patch);
    return { store, c: make(store) };
  }
  it('has default floor ui state and open/close/pick/tool', () => {
    const { c } = playing();
    expect(c.getState().floor).toEqual({ open: false, pick: 'eraser', tool: 'paint', preview: null });
    c.openFloors();
    expect(c.getState().floor.open).toBe(true);
    c.setFloorTool('camera');
    expect(c.getState().floor.tool).toBe('camera');
    c.pickFloor('t1');
    expect(c.getState().floor).toMatchObject({ pick: 't1', tool: 'paint' });
    c.closeFloors();
    expect(c.getState().floor.open).toBe(false);
  });
  it('previewFloors changes only AppState and never saves', () => {
    const { c, store } = playing();
    const before = store.map.get(SAVE_KEY);
    c.previewFloors(rect);
    expect(c.getState().floor.preview).toEqual(rect);
    c.previewFloors(null);
    expect(store.map.get(SAVE_KEY)).toBe(before);
  });
  it('paints a rectangle, saves once, leaves placements/bag/status alone', () => {
    const { c, store } = playing();
    const g0 = c.getState().game!;
    const setItem = store.setItem;
    let saves = 0;
    store.setItem = (k, v) => { saves++; setItem(k, v); };
    c.pickFloor('t1');
    c.previewFloors(rect);
    c.paintFloors(rect);
    expect(saves).toBe(1);
    const g = c.getState().game!;
    expect(g.floors.filter((f) => f === 't1')).toHaveLength(6);
    expect(g.placements).toBe(g0.placements);
    expect(g.bag).toBe(g0.bag);
    expect(g.status).toBe(g0.status);
    expect(c.getState().floor.preview).toBeNull();
    expect(loadGame(store, getCatalog, (id) => id === 't1')!.floors).toEqual(g.floors);
  });
  it('eraser clears cells', () => {
    const { c } = playing();
    c.pickFloor('t1');
    c.paintFloors(rect);
    c.pickFloor('eraser');
    c.paintFloors({ x0: 0, z0: 1, x1: 0, z1: 1 });
    expect(c.getState().game!.floors.filter((f) => f === 't1')).toHaveLength(5);
  });
  it('works when the round is finished', () => {
    const { c } = playing({ status: 'finished' });
    expect(c.getState().screen).toBe('finished');
    c.pickFloor('t1');
    c.paintFloors(rect);
    expect(c.getState().game!.floors.filter((f) => f === 't1')).toHaveLength(6);
    expect(c.getState().screen).toBe('finished');
  });
  it('the drawer starts on the first floor tile when the app gives one (kids can paint at once)', () => {
    const c = createController({
      store: seeded(), getTheme, getCatalog, seed: () => 7, detectQuality: () => 'pretty',
      isFloorTile: (id) => id.startsWith('t'), firstFloorTile: 't1',
    });
    expect(c.getState().floor.pick).toBe('t1');
    c.openFloors();
    expect(c.getState().floor).toMatchObject({ open: true, pick: 't1', tool: 'paint' });
  });
  it('closeFloors shuts the drawer and resets the tool and the preview, keeping the pick', () => {
    const { c } = playing();
    c.openFloors();
    c.pickFloor('t1');
    c.setFloorTool('camera');
    c.previewFloors(rect);
    c.closeFloors();
    expect(c.getState().floor).toEqual({ open: false, pick: 't1', tool: 'paint', preview: null });
  });
  it('paintFloors with no game is a no-op: nothing saved, no state change', () => {
    const store = memStore();
    let saves = 0;
    const setItem = store.setItem.bind(store);
    store.setItem = (k, v) => { saves++; setItem(k, v); };
    const c = createController({ store, getTheme, getCatalog, seed: () => 7, detectQuality: () => 'pretty', isFloorTile: (id) => id.startsWith('t') });
    const before = c.getState();
    c.paintFloors(rect);
    expect(saves).toBe(0);
    expect(c.getState()).toBe(before);
  });
  it('restart and clear close the drawer (a new city starts with the items)', () => {
    const { c } = playing();
    c.openFloors();
    c.setFloorTool('camera');
    c.restart();
    expect(c.getState().floor).toMatchObject({ open: false, tool: 'paint', preview: null });
    c.openFloors();
    c.previewFloors(rect);
    c.clearAll();
    expect(c.getState().screen).toBe('theme-select');
    expect(c.getState().floor).toMatchObject({ open: false, tool: 'paint', preview: null });
  });
  it('restart clears floors', () => {
    const { c } = playing();
    c.pickFloor('t1');
    c.paintFloors(rect);
    c.restart();
    expect(c.getState().game!.floors.every((f) => f === null)).toBe(true);
  });
});
