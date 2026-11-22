import { describe, expect, it } from 'vitest';
import { GRID_SIZE } from '../game/types';
import { clampPanTarget } from './panClamp';

describe('clampPanTarget', () => {
  it('leaves a target on the map alone', () => {
    expect(clampPanTarget(3, 7)).toEqual({ x: 3, z: 7 });
    expect(clampPanTarget(0, GRID_SIZE)).toEqual({ x: 0, z: GRID_SIZE });
  });
  it('pulls a target off the map back to the nearest edge, per axis', () => {
    expect(clampPanTarget(-5, 4)).toEqual({ x: 0, z: 4 });
    expect(clampPanTarget(GRID_SIZE + 9, -1)).toEqual({ x: GRID_SIZE, z: 0 });
  });
});
