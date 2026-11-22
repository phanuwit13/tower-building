import { describe, expect, it } from 'vitest';
import { newGame, placeCurrent } from '../game/game';
import { GRID_SIZE, type GameState } from '../game/types';
import { getCatalog } from '../themes/registry';
import { placementAtTile } from './hover';

const catalog = getCatalog('school')!;
const settings = { weather: 'sunny', time: 'day', ground: 'grass' } as const;
const game = (patch: Partial<GameState> = {}): GameState => ({ ...newGame(catalog, settings, 3), ...patch });

describe('placementAtTile', () => {
  it('centres the footprint on the hovered tile (classroom 2x3)', () => {
    expect(placementAtTile(game({ current: 'classroom' }), catalog, 0, 5, 5)).toEqual({ x: 5, z: 4, rotation: 0, valid: true });
  });
  it('rotates about the hovered tile', () => {
    expect(placementAtTile(game({ current: 'classroom' }), catalog, 1, 5, 5)).toEqual({ x: 4, z: 5, rotation: 1, valid: true });
  });
  it('clamps at the map edge and stays valid', () => {
    const p = placementAtTile(game({ current: 'classroom' }), catalog, 0, GRID_SIZE - 1, GRID_SIZE - 1);
    expect(p).toEqual({ x: GRID_SIZE - 2, z: GRID_SIZE - 3, rotation: 0, valid: true });
    expect(placementAtTile(game({ current: 'classroom' }), catalog, 0, 0, 0)).toMatchObject({ x: 0, z: 0 });
  });
  it('is invalid over occupied tiles', () => {
    const g = game({ current: 'classroom' });
    const placed = placeCurrent(g, catalog, 5, 4, 0)!;
    expect(placed).not.toBeNull();
    const again = { ...placed, current: 'classroom' };
    expect(placementAtTile(again, catalog, 0, 5, 5).valid).toBe(false);
    expect(placementAtTile(again, catalog, 0, 12, 12).valid).toBe(true);
  });
});
