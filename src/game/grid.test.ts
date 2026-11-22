import { describe, expect, it } from 'vitest';
import {
  buildOccupancy, canPlace, clampPosition, fillStats, fitsAnywhere, nearestFreeSpot, rotatedFootprint,
} from './grid';
import { GRID_SIZE, type Catalog, type Placement, type Rotation } from './types';

const N = GRID_SIZE;
const empty = () => new Uint8Array(N * N);
const full = () => new Uint8Array(N * N).fill(1);
function occWithTile(x: number, z: number): Uint8Array {
  const o = empty();
  o[z * N + x] = 1;
  return o;
}
function withHole(x0: number, z0: number, w: number, d: number): Uint8Array {
  const o = full();
  for (let z = z0; z < z0 + d; z++) for (let x = x0; x < x0 + w; x++) o[z * N + x] = 0;
  return o;
}
const hole = withHole(0, 0, 1, 2); // 1 wide x 2 deep
const hole3x2 = withHole(0, 0, 3, 2); // 3 wide x 2 deep
const cat: Catalog = {
  themeId: 't',
  order: ['big', 'one'],
  items: { big: { id: 'big', footprint: { w: 2, d: 3 } }, one: { id: 'one', footprint: { w: 1, d: 1 } } },
};
let uid = 0;
const p = (itemId: string, x: number, z: number, rotation: Rotation = 0): Placement => ({ uid: uid++, itemId, x, z, rotation });

describe('rotatedFootprint', () => {
  it('swaps w/d on odd rotations only', () => {
    expect(rotatedFootprint({ w: 2, d: 3 }, 1)).toEqual({ w: 3, d: 2 });
    expect(rotatedFootprint({ w: 2, d: 3 }, 2)).toEqual({ w: 2, d: 3 });
    expect(rotatedFootprint({ w: 2, d: 3 }, 3)).toEqual({ w: 3, d: 2 });
    expect(rotatedFootprint({ w: 2, d: 3 }, 0)).toEqual({ w: 2, d: 3 });
  });
});

describe('buildOccupancy', () => {
  it('marks rotated footprints at z*10+x', () => {
    const o = buildOccupancy([p('big', 0, 0, 1)], cat); // 3 wide x 2 deep
    expect(o.length).toBe(100);
    expect([...o].reduce((a, b) => a + b, 0)).toBe(6);
    expect(o[1 * N + 2]).toBe(1);
    expect(o[2 * N + 0]).toBe(0);
  });
  it('throws naming an unknown item id', () => {
    expect(() => buildOccupancy([p('ghost', 0, 0)], cat)).toThrow(/ghost/);
  });
});

describe('canPlace', () => {
  it('respects map bounds and occupancy', () => {
    expect(canPlace(empty(), { w: 2, d: 3 }, 0, 9, 0)).toBe(false);
    expect(canPlace(empty(), { w: 2, d: 3 }, 0, 8, 7)).toBe(true);
    expect(canPlace(empty(), { w: 1, d: 1 }, 0, -1, 0)).toBe(false);
    expect(canPlace(occWithTile(3, 3), { w: 1, d: 1 }, 0, 3, 3)).toBe(false);
    expect(canPlace(occWithTile(3, 3), { w: 2, d: 2 }, 0, 2, 2)).toBe(false);
  });
});

describe('fitsAnywhere', () => {
  it('tries both orientations', () => {
    expect(fitsAnywhere(hole, { w: 1, d: 1 })).toBe(true);
    expect(fitsAnywhere(hole, { w: 1, d: 2 })).toBe(true);
    expect(fitsAnywhere(hole, { w: 2, d: 2 })).toBe(false);
    expect(fitsAnywhere(hole3x2, { w: 2, d: 3 })).toBe(true);
    expect(fitsAnywhere(full(), { w: 1, d: 1 })).toBe(false);
  });
});

describe('clampPosition', () => {
  it('pulls the footprint back inside the map', () => {
    expect(clampPosition({ w: 2, d: 3 }, 1, 9, 9)).toEqual({ x: 7, z: 8 });
    expect(clampPosition({ w: 2, d: 3 }, 0, -3, -1)).toEqual({ x: 0, z: 0 });
    expect(clampPosition({ w: 2, d: 3 }, 0, 4, 4)).toEqual({ x: 4, z: 4 });
  });
});

describe('nearestFreeSpot', () => {
  it('picks the spot centred nearest the target', () => {
    expect(nearestFreeSpot(empty(), { w: 2, d: 2 }, 0, 5, 5)).toEqual({ x: 4, z: 4 });
  });
  it('skips occupied tiles', () => {
    expect(nearestFreeSpot(occWithTile(5, 5), { w: 1, d: 1 }, 0, 5.5, 5.5)).toEqual({ x: 5, z: 4 });
  });
  it('returns null when nothing fits', () => {
    expect(nearestFreeSpot(full(), { w: 1, d: 1 }, 0, 5, 5)).toBeNull();
  });
});

describe('fillStats', () => {
  it('counts items, tiles and percent', () => {
    expect(fillStats([p('big', 0, 0), p('one', 5, 5)], cat)).toEqual({ items: 2, tilesUsed: 7, percent: 7 });
    expect(fillStats([], cat)).toEqual({ items: 0, tilesUsed: 0, percent: 0 });
  });
});
