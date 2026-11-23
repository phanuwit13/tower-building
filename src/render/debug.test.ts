import { describe, expect, it } from 'vitest';
import { isFloorTile } from '../floors';
import { memoryStore } from '../app/browserStore';
import { getCatalog } from '../themes/registry';
import { loadGame, loadQuality, QUALITY_KEY, SAVE_KEY } from '../game/save';
import { demoStore, overlayText, parseDemoParam } from './debug';

describe('parseDemoParam', () => {
  it('is off unless ?demo=full', () => {
    expect(parseDemoParam('')).toBeNull();
    expect(parseDemoParam('?demo=1')).toBeNull();
    expect(parseDemoParam('?fps=1')).toBeNull();
  });

  it('defaults to seed 1 and takes &seed=<uint>', () => {
    expect(parseDemoParam('?demo=full')).toEqual({ seed: 1, theme: 'school' });
    expect(parseDemoParam('?demo=full&fps=1&seed=42')).toEqual({ seed: 42, theme: 'school' });
    expect(parseDemoParam('?demo=full&seed=-3')).toEqual({ seed: 1, theme: 'school' });
    expect(parseDemoParam('?demo=full&seed=abc')).toEqual({ seed: 1, theme: 'school' });
  });

  it('takes &theme=<id>, school when missing or empty', () => {
    expect(parseDemoParam('?demo=full&theme=amusement')).toEqual({ seed: 1, theme: 'amusement' });
    expect(parseDemoParam('?demo=full&theme=')).toEqual({ seed: 1, theme: 'school' });
  });
});

describe('demoStore', () => {
  it('plays any registered theme on its ground', () => {
    const store = demoStore(memoryStore({}), getCatalog('amusement')!, 3, 'concrete');
    const game = loadGame(store, getCatalog, isFloorTile);
    expect(game?.themeId).toBe('amusement');
    expect(game?.settings.ground).toBe('concrete');
    expect(game?.placements.length).toBeGreaterThan(50);
  });

  it('holds a full demo round and the real quality preference, and never writes to the real store', () => {
    const real = memoryStore({ [QUALITY_KEY]: 'smooth', [SAVE_KEY]: 'the player\'s own city' });
    const store = demoStore(real, getCatalog('school')!, 7);
    const game = loadGame(store, getCatalog, isFloorTile);
    expect(game?.placements.length).toBeGreaterThan(100);
    expect(loadQuality(store)).toBe('smooth');
    store.setItem(SAVE_KEY, 'changed');
    store.removeItem(QUALITY_KEY);
    expect(real.getItem(SAVE_KEY)).toBe('the player\'s own city');
    expect(real.getItem(QUALITY_KEY)).toBe('smooth');
  });

  it('leaves the quality unset when the real store has none or throws', () => {
    const broken = { getItem: () => { throw new Error('blocked'); }, setItem: () => {}, removeItem: () => {} };
    expect(loadQuality(demoStore(memoryStore({}), getCatalog('school')!, 1))).toBeNull();
    expect(loadQuality(demoStore(broken, getCatalog('school')!, 1))).toBeNull();
  });
});

describe('overlayText', () => {
  it('shows fps, tier and draw calls, plus the last city rebuild when known', () => {
    expect(overlayText({ fps: 58, tier: 'pretty', calls: 41 })).toBe('58 fps · สวย · 41 calls');
    expect(overlayText({ fps: 31, tier: 'smooth', calls: 12, cityMs: 3.46 })).toBe('31 fps · ลื่น · 12 calls · city 3.5 ms');
  });
});
