import { describe, expect, it } from 'vitest';
import { newGame } from '../game/game';
import { loadCities, QUALITY_KEY, SAVE_KEY, saveCities, type KeyValueStore } from '../game/save';
import { GRID_SIZE, type GameState } from '../game/types';
import { getCatalog, getTheme } from '../themes/registry';
import { createController, type Controller } from './controller';

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
/** A store holding one School city, being played. */
function seeded(patch: Partial<GameState> = {}): ReturnType<typeof memStore> {
  const store = memStore();
  saveCities(store, { current: 'school', cities: { school: { ...newGame(catalog, settings, 3), ...patch } } });
  return store;
}
/** The city saved for a theme (the stored record, read back as the next page load would). */
const savedCity = (store: KeyValueStore, id: string, isTile: (id: string) => boolean = () => true) =>
  loadCities(store, getCatalog, isTile).cities[id];

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
    const saved = savedCity(store, 'school')!;
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
    expect(savedCity(store, 'school')!.settings.time).toBe('night');
    expect(savedCity(store, 'school')!.status).toBe('finished');
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
    expect(savedCity(store, 'school', (id) => id === 't1')!.floors).toEqual(g.floors);
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

describe('every theme keeps its own city', () => {
  const zooCatalog = getCatalog('zoo')!;
  /** Place the current item on the nearest free spot. */
  const placeOne = (c: Controller) => { c.moveGhost(0, 0); expect(c.place()).toBe(true); };
  const rect = { x0: 1, z0: 1, x1: 2, z1: 1 };

  it('🏠 goes to theme select at once and keeps the city; the theme select knows what was built', () => {
    const store = memStore();
    const c = make(store);
    c.chooseTheme('school');
    placeOne(c);
    placeOne(c);
    const before = c.getState().game!;
    c.goToThemeSelect();
    const s = c.getState();
    expect(s.screen).toBe('theme-select');
    expect(s.game).toBeNull();
    expect(s.ghost).toBeNull();
    expect(s.cities).toEqual({ school: { placed: 2, finished: false } });
    const saved = loadCities(store, getCatalog, () => true);
    expect(saved.current).toBeNull();
    expect(saved.cities.school).toEqual(before);
  });

  it('school → zoo → school: the school city is exactly as it was left (items, bag, floors, settings)', () => {
    const store = memStore();
    const c = make(store);
    c.chooseTheme('school');
    placeOne(c);
    c.setSettings({ time: 'night', weather: 'rain' });
    c.pickFloor('t1');
    c.paintFloors(rect);
    c.rotateGhost(); // a preference, not part of the city
    const school = c.getState().game!;
    c.goToThemeSelect();

    c.chooseTheme('zoo');
    expect(c.getState().game!.themeId).toBe('zoo');
    expect(c.getState().game!.placements).toHaveLength(0);
    expect(c.getState().game!.settings).toEqual({ weather: 'sunny', time: 'day', ground: getTheme('zoo')!.defaultGround });
    placeOne(c);
    const zoo = c.getState().game!;
    c.goToThemeSelect();
    expect(c.getState().cities).toEqual({ school: { placed: 1, finished: false }, zoo: { placed: 1, finished: false } });

    c.chooseTheme('school');
    expect(c.getState().screen).toBe('playing');
    expect(c.getState().game).toEqual(school);
    expect(c.getState().ghost).toBeNull();
    expect(c.getState().rotation).toBe(0);
    c.goToThemeSelect();
    c.chooseTheme('zoo');
    expect(c.getState().game).toEqual(zoo);
    expect(zoo.themeId).toBe(zooCatalog.themeId);
  });

  it('a reload resumes the theme last played, or theme select if the child was there', () => {
    const store = memStore();
    const c = make(store);
    c.chooseTheme('school');
    placeOne(c);
    c.goToThemeSelect();
    c.chooseTheme('zoo');
    const zoo = c.getState().game!;

    const again = make(store).getState();
    expect(again.screen).toBe('playing');
    expect(again.game).toEqual(zoo);
    expect(again.cities).toEqual({ school: { placed: 1, finished: false }, zoo: { placed: 0, finished: false } });

    c.goToThemeSelect();
    const onSelect = make(store).getState();
    expect(onSelect.screen).toBe('theme-select');
    expect(onSelect.game).toBeNull();
    expect(onSelect.cities).toEqual(again.cities);
  });

  it('choosing a theme whose round is finished resumes it finished', () => {
    const store = memStore();
    saveCities(store, { current: null, cities: { school: { ...newGame(catalog, settings, 3), status: 'finished' } } });
    const c = make(store);
    expect(c.getState().cities).toEqual({ school: { placed: 0, finished: true } });
    c.chooseTheme('school');
    expect(c.getState().screen).toBe('finished');
  });

  it('an old one-city save (v2) is that theme\'s city, and the game opens on it', () => {
    const store = memStore();
    const old = { ...newGame(catalog, settings, 3), floors: newGame(catalog, settings, 3).floors.map((_, i) => (i === 5 ? 't1' : null)) };
    store.setItem(SAVE_KEY, JSON.stringify({ v: 2, state: old }));
    const c = make(store);
    expect(c.getState().screen).toBe('playing');
    expect(c.getState().game).toEqual(old);
    c.goToThemeSelect();
    expect(JSON.parse(store.map.get(SAVE_KEY)!)).toMatchObject({ v: 3, current: null, cities: { school: old } });
  });

  it('every save is one write holding every city', () => {
    const store = memStore();
    const c = make(store);
    c.chooseTheme('school');
    placeOne(c);
    c.goToThemeSelect();
    c.chooseTheme('zoo');
    const writes = store.writes;
    placeOne(c);
    expect(store.writes).toBe(writes + 1);
    const data = JSON.parse(store.map.get(SAVE_KEY)!);
    expect(data.current).toBe('zoo');
    expect(Object.keys(data.cities).sort()).toEqual(['school', 'zoo']);
    c.pickFloor('t1');
    c.paintFloors(rect);
    expect(store.writes).toBe(writes + 2);
    c.goToThemeSelect();
    expect(store.writes).toBe(writes + 3);
  });

  it('เริ่มใหม่ starts only this theme\'s city again', () => {
    const store = memStore();
    const c = make(store);
    c.chooseTheme('school');
    placeOne(c);
    const school = c.getState().game!;
    c.goToThemeSelect();
    c.chooseTheme('zoo');
    placeOne(c);
    placeOne(c);
    c.restart();
    expect(c.getState().game!.themeId).toBe('zoo');
    expect(c.getState().game!.placements).toHaveLength(0);
    expect(c.getState().cities).toEqual({ school: { placed: 1, finished: false }, zoo: { placed: 0, finished: false } });
    expect(savedCity(store, 'school')).toEqual(school);
    expect(savedCity(store, 'zoo')!.placements).toHaveLength(0);
  });

  it('เคลียร์ deletes every city and lands on theme select; a theme then starts new', () => {
    const store = memStore();
    const c = make(store);
    c.chooseTheme('school');
    placeOne(c);
    c.goToThemeSelect();
    c.chooseTheme('zoo');
    placeOne(c);
    c.clearAll();
    expect(c.getState().screen).toBe('theme-select');
    expect(c.getState().game).toBeNull();
    expect(c.getState().cities).toEqual({});
    expect(store.map.has(SAVE_KEY)).toBe(false);
    c.chooseTheme('school');
    expect(c.getState().game!.placements).toHaveLength(0);
    expect(make(store).getState().cities).toEqual({ school: { placed: 0, finished: false } });
  });

  it('the floor drawer closes when the theme changes (the pick is kept)', () => {
    const c = make(memStore());
    c.chooseTheme('school');
    c.openFloors();
    c.pickFloor('t1');
    c.setFloorTool('camera');
    c.previewFloors(rect);
    c.goToThemeSelect();
    expect(c.getState().floor).toEqual({ open: false, pick: 't1', tool: 'paint', preview: null });
    c.openFloors(); // nothing should leave it open across a theme change
    c.chooseTheme('zoo');
    expect(c.getState().floor).toEqual({ open: false, pick: 't1', tool: 'paint', preview: null });
  });

  it('🏠 on theme select does nothing', () => {
    const store = memStore();
    const c = make(store);
    const before = c.getState();
    c.goToThemeSelect();
    expect(c.getState()).toBe(before);
    expect(store.writes).toBe(0);
  });

  it('storage blocked: switching still keeps each city for the session, and saveFailed shows', () => {
    const c = make(throwingStore);
    c.chooseTheme('school');
    placeOne(c);
    const school = c.getState().game!;
    c.goToThemeSelect();
    c.chooseTheme('zoo');
    c.goToThemeSelect();
    c.chooseTheme('school');
    expect(c.getState().game).toEqual(school);
    expect(c.getState().saveFailed).toBe(true);
  });

  it('a save that fails once is written again on the next change (nothing waits for a reload)', () => {
    const store = memStore();
    const c = make(store);
    c.chooseTheme('school');
    const setItem = store.setItem;
    store.setItem = () => { throw new DOMException('full', 'QuotaExceededError'); };
    placeOne(c);
    expect(c.getState().saveFailed).toBe(true);
    store.setItem = setItem;
    c.goToThemeSelect();
    expect(savedCity(store, 'school')!.placements).toHaveLength(1);
    expect(c.getState().saveFailed).toBe(true); // the notice has been shown; it stays latched
  });
});
