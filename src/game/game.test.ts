import { describe, expect, it } from 'vitest';
import { newGame, placeCurrent, restartGame, withSettings } from './game';
import type { Catalog, GameState, SceneSettings } from './types';

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

describe('newGame', () => {
  it('starts empty with distinct current/next', () => {
    const s = newGame(catalog, settings, 1);
    expect(s.placements).toEqual([]);
    expect(s.status).toBe('playing');
    expect(s.nextUid).toBe(1);
    expect(s.themeId).toBe('t');
    expect(catalog.order).toContain(s.current);
    expect(catalog.order).toContain(s.next);
    expect(s.current).not.toBe(s.next);
  });
});

describe('placeCurrent', () => {
  it('places with uid 1 and advances next to current', () => {
    const s = newGame(catalog, settings, 1);
    const n = placeCurrent(s, catalog, 0, 0, 0)!;
    expect(n.placements).toEqual([{ uid: 1, itemId: s.current, x: 0, z: 0, rotation: 0 }]);
    expect(n.current).toBe(s.next);
    expect(n.nextUid).toBe(2);
    expect(s.placements).toEqual([]);
  });
  it('returns null on occupied tile', () => {
    const s = newGame(catalog, settings, 1);
    const n = placeCurrent(s, catalog, 0, 0, 0)!;
    expect(placeCurrent(n, catalog, 0, 0, 0)).toBeNull();
  });
  it('finishes when the new current fits nowhere', () => {
    // Fill rows 0-6 fully, plus leave a scattering of holes in rows 7-9 with no 2x3/3x2 gap.
    const placements = [];
    let uid = 1;
    for (let z = 0; z < 10; z++) for (let x = 0; x < 10; x++) {
      if (z >= 8 && x < 2) continue; // 2x2 hole only
      placements.push({ uid: uid++, itemId: 'a', x, z, rotation: 0 as const });
    }
    const state: GameState = {
      themeId: 't', settings, placements, bag: ['b'], rng: 5,
      current: 'a', next: 'd', status: 'playing', nextUid: uid,
    };
    const n = placeCurrent(state, catalog, 0, 8, 0)!;
    expect(n).not.toBeNull();
    expect(n.current).toBe('d');
    expect(n.status).toBe('finished');
  });
  it('returns null when finished', () => {
    const s = { ...newGame(catalog, settings, 1), status: 'finished' as const };
    expect(placeCurrent(s, catalog, 0, 0, 0)).toBeNull();
  });
  it('same seed gives same current sequence over 10 placements', () => {
    const run = (): string[] => {
      let s = newGame(catalog, settings, 42);
      const seq: string[] = [];
      for (let i = 0; i < 10; i++) {
        seq.push(s.current);
        s = placeCurrent(s, catalog, i % 5 * 2, Math.floor(i / 5) * 3, 0)!;
        expect(s).not.toBeNull();
      }
      return seq;
    };
    expect(run()).toEqual(run());
  });
});

describe('restartGame / withSettings', () => {
  it('restart keeps theme and settings, empties placements', () => {
    const s0 = withSettings(newGame(catalog, settings, 1), { time: 'night' });
    const s = placeCurrent(s0, catalog, 0, 0, 0)!;
    const r = restartGame(s, catalog, 9);
    expect(r.themeId).toBe('t');
    expect(r.settings).toEqual({ weather: 'sunny', time: 'night', ground: 'grass' });
    expect(r.placements).toEqual([]);
  });
  it('withSettings changes only settings, even when finished', () => {
    const s = { ...newGame(catalog, settings, 1), status: 'finished' as const };
    const n = withSettings(s, { weather: 'rain' });
    expect(n.settings).toEqual({ weather: 'rain', time: 'day', ground: 'grass' });
    expect(n.status).toBe('finished');
    expect({ ...n, settings: s.settings }).toEqual(s);
    expect(s.settings.weather).toBe('sunny');
  });
});
