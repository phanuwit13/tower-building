import { describe, expect, it } from 'vitest';
import { emptyFloors, normaliseRect, paintRect, rectCells } from './floors';
import { GRID_SIZE } from './types';

describe('floor rects', () => {
  it('normalises corner order and clamps to the map', () => {
    expect(normaliseRect({ x0: 3, z0: 5, x1: 1, z1: 2 })).toEqual({ x0: 1, z0: 2, x1: 3, z1: 5 });
    expect(normaliseRect({ x0: -4, z0: 0, x1: 99, z1: 0 })).toEqual({ x0: 0, z0: 0, x1: GRID_SIZE - 1, z1: 0 });
  });
  it('lists cells z-major', () => {
    expect(rectCells({ x0: 1, z0: 0, x1: 2, z1: 1 })).toEqual([1, 2, GRID_SIZE + 1, GRID_SIZE + 2]);
    expect(rectCells({ x0: 4, z0: 4, x1: 4, z1: 4 })).toEqual([4 * GRID_SIZE + 4]);
  });
  it('paints and erases without mutating the input', () => {
    const base = emptyFloors();
    const painted = paintRect(base, { x0: 2, z0: 1, x1: 0, z1: 1 }, 'tile');
    expect(base.every((c) => c === null)).toBe(true);
    expect(painted.filter((c) => c === 'tile')).toHaveLength(3);
    expect(painted[GRID_SIZE]).toBe('tile');
    const erased = paintRect(painted, { x0: 1, z0: 1, x1: 1, z1: 1 }, null);
    expect(erased.filter((c) => c === 'tile')).toHaveLength(2);
    expect(erased).toHaveLength(GRID_SIZE * GRID_SIZE);
  });
});
