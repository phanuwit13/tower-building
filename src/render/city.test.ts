import { expect, test } from 'vitest';
import { placementTransform } from './city';
import { isTap, rayToTile } from './input';

test('placement centres the model on its rotated footprint', () => {
  const t0 = placementTransform({ w: 2, d: 3 }, 1, 4, 0);
  expect([t0.x, t0.z, t0.rotY]).toEqual([2, 5.5, -0]);
  const t1 = placementTransform({ w: 2, d: 3 }, 1, 4, 1);
  expect(t1.x).toBe(2.5);
  expect(t1.z).toBe(5);
  expect(t1.rotY).toBeCloseTo(-Math.PI / 2);
  expect(placementTransform({ w: 1, d: 1 }, 0, 0, 2).rotY).toBeCloseTo(-Math.PI);
});

test('tap needs <= 6 px and <= 400 ms', () => {
  expect(isTap(3, 4, 100)).toBe(true);
  expect(isTap(5, 5, 100)).toBe(false);
  expect(isTap(0, 0, 401)).toBe(false);
  expect(isTap(0, 0, 400)).toBe(true);
});

test('ray to tile hits y=0, rejects off-map and upward rays', () => {
  expect(rayToTile({ x: 3.5, y: 5, z: 7.2 }, { x: 0, y: -1, z: 0 })).toEqual({ tx: 3, tz: 7 });
  expect(rayToTile({ x: 12, y: 5, z: 2 }, { x: 0, y: -1, z: 0 })).toBeNull();
  expect(rayToTile({ x: 12, y: 5, z: -2 }, { x: 0, y: -1, z: 0 }, true)).toEqual({ tx: 9, tz: 0 });
  expect(rayToTile({ x: 1, y: 5, z: 1 }, { x: 0, y: 1, z: 0 })).toBeNull();
  expect(rayToTile({ x: 0, y: 4, z: 0 }, { x: 1, y: -1, z: 1 })).toEqual({ tx: 4, tz: 4 });
});
