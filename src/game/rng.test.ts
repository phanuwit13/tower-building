import { expect, test } from 'vitest';
import { nextRandom, randomSeed } from './rng';

function run(fn: typeof nextRandom, seed: number, n: number): number[] {
  const out: number[] = [];
  let s = seed;
  for (let i = 0; i < n; i++) {
    const r = fn(s);
    out.push(r.value);
    s = r.state;
  }
  return out;
}

test('nextRandom is deterministic and in [0,1)', () => {
  const a = run(nextRandom, 12345, 1000);
  const b = run(nextRandom, 12345, 1000);
  expect(a).toEqual(b);
  expect(a.every((v) => v >= 0 && v < 1)).toBe(true);
});

test('different seeds give different sequences', () => {
  expect(run(nextRandom, 1, 10)).not.toEqual(run(nextRandom, 2, 10));
});

test('randomSeed returns a uint32', () => {
  const s = randomSeed();
  expect(Number.isInteger(s) && s >= 0 && s <= 0xffffffff).toBe(true);
});
