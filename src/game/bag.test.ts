import { expect, test } from 'vitest';
import { draw, shuffle } from './bag';

const order = Array.from({ length: 40 }, (_, i) => `i${i}`);

test('shuffle returns a permutation, same seed same result', () => {
  const a = shuffle(order, 99);
  const b = shuffle(order, 99);
  expect([...a.ids].sort()).toEqual([...order].sort());
  expect(a).toEqual(b);
  expect(a.ids).not.toEqual(order);
});

test('draw empties the bag before repeating', () => {
  let bag: string[] = [];
  let rng = 7;
  const seen = new Set<string>();
  for (let i = 0; i < 40; i++) {
    const r = draw(bag, order, rng);
    seen.add(r.id);
    bag = r.bag;
    rng = r.rng;
  }
  expect(seen.size).toBe(40);
  expect(bag).toEqual([]);
  const r = draw(bag, order, rng);
  expect(r.bag).toHaveLength(39);
});

test('draw never mutates its input bag', () => {
  const bag = ['a', 'b', 'c'];
  draw(bag, order, 1);
  expect(bag).toEqual(['a', 'b', 'c']);
  const empty: string[] = [];
  draw(empty, order, 1);
  expect(empty).toEqual([]);
});

test('draw throws on an empty order', () => {
  expect(() => draw([], [], 1)).toThrow();
});
